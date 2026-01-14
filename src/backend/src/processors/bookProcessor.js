import fs from 'fs/promises';
import path from 'path';

export class BookProcessor {
  /**
   * @param {string} bookPath 
   * @param {string} outputDir 
   * @param {Object} options 
   * @param {import('../services/LLMService').LLMService} llmService
   */
  constructor(bookPath, outputDir, options = {}, llmService) {
    this.bookPath = bookPath;
    this.outputDir = outputDir;
    // Default to splitting by "Chapter X" but allow override
    this.chapterRegex = options.chapterRegex || /Chapter \d+/;
    this.skipPreamble = options.skipPreamble !== undefined ? options.skipPreamble : true;
    this.llmService = llmService;
    this.data = null;
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

  async processParagraphs(chapterIndex, concurrency = 2) {
    const chapter = this.data[chapterIndex];
    const chapterDir = path.join(this.outputDir, `chapter_${chapter.id}`);
    await fs.mkdir(chapterDir, { recursive: true });

    const results = new Array(chapter.paragraphs.length).fill(null);
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
          await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
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

  async processChapter(chapterIndex, paragraphAnalyses) {
    const chapter = this.data[chapterIndex];
    console.log(`Analyzing Chapter ${chapter.id} themes...`);
    
    const analysis = await this.llmService.analyzeChapter(chapter.content, paragraphAnalyses);
    const filename = path.join(this.outputDir, `chapter_${chapter.id}`, 'analysis.json');
    await fs.writeFile(filename, JSON.stringify(analysis, null, 2));
    return analysis;
  }

  async processInterChapter(prevChapterIdx, currChapterIdx, prevAnalysis, currAnalysis) {
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

  async run(limitChapters = null) {
    await this.loadBook();
    
    let prevAnalysis = null;
    const chaptersToProcess = limitChapters || this.data.length;
    
    // Store inter-chapter promises to await them at the end
    const backgroundTasks = [];

    for (let i = 0; i < chaptersToProcess; i++) {
      const paragraphResults = await this.processParagraphs(i);
      const chapterAnalysis = await this.processChapter(i, paragraphResults);
      
      if (i > 0 && prevAnalysis) {
        // Run inter-chapter analysis concurrently with next steps
        // Capture specific values for the async closure
        const prev = prevAnalysis;
        const curr = chapterAnalysis;
        const idxPrev = i - 1;
        const idxCurr = i;

        const task = this.processInterChapter(idxPrev, idxCurr, prev, curr)
            .catch(err => console.error(`Background Inter-Chapter Error (${idxPrev+1}->${idxCurr+1}):`, err));
        backgroundTasks.push(task);
      }
      
      prevAnalysis = chapterAnalysis;
    }
    
    await Promise.all(backgroundTasks);
    console.log('Book processing complete.');
  }
}
