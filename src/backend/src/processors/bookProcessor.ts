import fs from 'fs/promises';
import path from 'path';
import { LLMService } from '../services/LLMService.js';

// Simple concurrency limiter
const createLimiter = (concurrency: number) => {
    const queue: Array<[() => Promise<any>, (val: any) => void, (err: any) => void]> = [];
    let active = 0;

    const next = () => {
        if (active >= concurrency || queue.length === 0) return;
        
        active++;
        const [fn, resolve, reject] = queue.shift()!;
        
        fn().then(resolve)
            .catch(reject)
            .finally(() => {
                active--;
                next();
            });
    };

    return <T>(fn: () => Promise<T>): Promise<T> => new Promise((resolve, reject) => {
        queue.push([fn, resolve, reject]);
        next();
    });
};

interface BookProcessorOptions {
    chapterRegex?: RegExp;
    skipPreamble?: boolean;
}

interface ChapterData {
    id: number;
    content: string;
    paragraphs: string[];
}

export class BookProcessor {
  private chapterRegex: RegExp;
  private skipPreamble: boolean;
  private data: ChapterData[] = [];

  constructor(
    private bookPath: string, 
    private outputDir: string, 
    options: BookProcessorOptions = {},
    private llmService: LLMService
  ) {
    // Default to splitting by "Chapter X" but allow override
    this.chapterRegex = options.chapterRegex || /Chapter \d+/;
    this.skipPreamble = options.skipPreamble !== undefined ? options.skipPreamble : true;
  }

  async loadBook() {
    const text = await fs.readFile(this.bookPath, 'utf8');
    
    // Split book content
    // Note: This simple split assumes the regex matches the delimiter exactly.
    const parts = text.split(this.chapterRegex);
    
    // Depending on the book format, the first part might be preamble/front matter
    const chapters = this.skipPreamble ? parts.slice(1) : parts;

    this.data = chapters.map((content, index) => ({
      id: index + 1,
      content: content.trim(),
      paragraphs: content.split(/\n\s*\n/).filter(p => p.trim().length > 0)
    })).filter(c => c.content.length > 0); // Filter out empty chapters

    await fs.mkdir(this.outputDir, { recursive: true });
    console.log(`Loaded ${this.data.length} chapters.`);
  }

  async processParagraphs(chapterIndex: number, concurrency = 5): Promise<any[]> {
    const chapter = this.data[chapterIndex];
    const chapterDir = path.join(this.outputDir, `chapter_${chapter.id}`);
    await fs.mkdir(chapterDir, { recursive: true });

    const results: any[] = new Array(chapter.paragraphs.length).fill(null);
    console.log(`Processing Chapter ${chapter.id} (${chapter.paragraphs.length} paragraphs)...`);

    // Prepare tasks
    const tasks = chapter.paragraphs.map((p, i) => ({ paragraph: p, index: i }));

    // Worker function
    const worker = async () => {
      while (tasks.length > 0) {
        const task = tasks.shift();
        if (!task) break;
        const { paragraph, index } = task;

        if (paragraph.length < 20) continue;

        const filename = path.join(chapterDir, `p_${index + 1}.json`);

        try {
          // Check if exists to support resuming
          try {
            await fs.access(filename);
            console.log(`  Skipping Paragraph ${index + 1} (already exists)`);
            const existing = JSON.parse(await fs.readFile(filename, 'utf8'));
            results[index] = existing;
            continue;
          } catch {}

          console.log(`  Analyzing Paragraph ${index + 1}...`);
          const analysis = await this.llmService.analyzeLinguistic(paragraph);

          const result = {
            id: index + 1,
            text: paragraph,
            analysis
          };

          await fs.writeFile(filename, JSON.stringify(result, null, 2));
          results[index] = result;

          // Rate limit protection
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error: any) {
          console.error(`  Error in P${index + 1}:`, error.message);
        }
      }
    };

    // Run workers
    const activeWorkers = [];
    const numWorkers = Math.min(concurrency, tasks.length);
    for (let i = 0; i < numWorkers; i++) {
        activeWorkers.push(worker());
    }
    await Promise.all(activeWorkers);

    return results.filter(r => r !== null);
  }

  async processChapter(chapterIndex: number, paragraphAnalyses: any[]) {
    const chapter = this.data[chapterIndex];
    console.log(`Analyzing Chapter ${chapter.id} themes...`);
    
    const analysis = await this.llmService.analyzeChapter(chapter.content, paragraphAnalyses);
    const filename = path.join(this.outputDir, `chapter_${chapter.id}`, 'analysis.json');
    await fs.writeFile(filename, JSON.stringify(analysis, null, 2));
    return analysis;
  }

  async processInterChapter(prevChapterIdx: number, currChapterIdx: number, prevAnalysis: any, currAnalysis: any) {
    if (!prevAnalysis) return null;
    
    console.log(`Analyzing connection: Chapter ${prevChapterIdx + 1} -> ${currChapterIdx + 1}`);
    const analysis = await this.llmService.analyzeInterChapter(
      prevAnalysis, 
      currAnalysis, 
      prevChapterIdx + 1, 
      currChapterIdx + 1
    );
    
    const filename = path.join(this.outputDir, `inter_chapter_${prevChapterIdx + 1}_${currChapterIdx + 1}.json`);
    await fs.writeFile(filename, JSON.stringify(analysis, null, 2));
  }

  async run(limitChapters: number | null = null) {
    await this.loadBook();
    const chaptersToProcess = limitChapters || this.data.length;
    
    console.log(`Starting concurrent analysis for ${chaptersToProcess} chapters...`);
    
    // 1. Setup concurrency limiters
    // Limit total concurrent chapters being processed to avoid overwhelming resources
    const chapterLimiter = createLimiter(3); 

    // 2. Create tasks for all chapters
    const processChapterTask = async (index: number) => {
        const paragraphResults = await this.processParagraphs(index);
        const chapterAnalysis = await this.processChapter(index, paragraphResults);
        return chapterAnalysis;
    };

    // 3. Map chapters to promises managed by limiter
    const chapterPromises = Array.from({ length: chaptersToProcess }, (_, i) => 
        chapterLimiter(() => processChapterTask(i))
    );

    // 4. Setup Inter-Chapter Analysis dependencies
    // Inter-chapter [i-1, i] can start as soon as both [i-1] and [i] are done.
    const interChapterPromises: Promise<void>[] = [];
    
    for (let i = 1; i < chaptersToProcess; i++) {
        const prevPromise = chapterPromises[i - 1];
        const currPromise = chapterPromises[i];

        const interTask = Promise.all([prevPromise, currPromise])
            .then(async ([prevAnalysis, currAnalysis]) => {
                await this.processInterChapter(i - 1, i, prevAnalysis, currAnalysis);
            })
            .catch(err => {
                console.error(`Background Inter-Chapter Error (${i}->${i+1}):`, err);
            });
            
        interChapterPromises.push(interTask);
    }

    // 5. Wait for EVERYTHING to finish
    await Promise.all([...chapterPromises, ...interChapterPromises]);
    
    console.log('Analysis Complete!');
  }
}
