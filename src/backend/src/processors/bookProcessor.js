import fs from 'fs/promises';
import path from 'path';
import { linguisticAnalysisAgent, chapterAnalysisAgent, interChapterAnalysisAgent } from '../llm.js';

export class BookProcessor {
  constructor(bookPath, outputDir, options = {}) {
    this.bookPath = bookPath;
    this.outputDir = outputDir;
    // Default to splitting by "Chapter X" but allow override
    this.chapterRegex = options.chapterRegex || /Chapter \d+/;
    this.skipPreamble = options.skipPreamble !== undefined ? options.skipPreamble : true;
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

  async processParagraphs(chapterIndex) {
    const chapter = this.data[chapterIndex];
    const chapterDir = path.join(this.outputDir, `chapter_${chapter.id}`);
    await fs.mkdir(chapterDir, { recursive: true });

    const results = [];
    console.log(`Processing Chapter ${chapter.id} (${chapter.paragraphs.length} paragraphs)...`);

    for (let i = 0; i < chapter.paragraphs.length; i++) {
      const paragraph = chapter.paragraphs[i];
      // Skip very short lines/dialogue to save tokens/time if needed, or process all.
      if (paragraph.length < 20) continue; 

      const filename = path.join(chapterDir, `p_${i + 1}.json`);
      
      try {
        // Check if exists to support resuming
        try {
          await fs.access(filename);
          console.log(`  Skipping Paragraph ${i + 1} (already exists)`);
          const existing = JSON.parse(await fs.readFile(filename, 'utf8'));
          results.push(existing);
          continue;
        } catch {}

        console.log(`  Analyzing Paragraph ${i + 1}...`);
        const analysis = await linguisticAnalysisAgent(paragraph);
        
        const result = {
          id: i + 1,
          text: paragraph,
          analysis
        };

        await fs.writeFile(filename, JSON.stringify(result, null, 2));
        results.push(result);
        
        // Rate limit protection
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`  Error in P${i + 1}:`, error.message);
      }
    }
    return results;
  }

  async processChapter(chapterIndex, paragraphAnalyses) {
    const chapter = this.data[chapterIndex];
    console.log(`Analyzing Chapter ${chapter.id} themes...`);
    
    const analysis = await chapterAnalysisAgent(chapter.content, paragraphAnalyses);
    const filename = path.join(this.outputDir, `chapter_${chapter.id}`, 'analysis.json');
    await fs.writeFile(filename, JSON.stringify(analysis, null, 2));
    return analysis;
  }

  async processInterChapter(prevChapterIdx, currChapterIdx, prevAnalysis, currAnalysis) {
    if (!prevAnalysis) return null;
    
    console.log(`Analyzing connection: Chapter ${prevChapterIdx + 1} -> ${currChapterIdx + 1}`);
    const analysis = await interChapterAnalysisAgent(
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

    for (let i = 0; i < chaptersToProcess; i++) {
      const paragraphResults = await this.processParagraphs(i);
      const chapterAnalysis = await this.processChapter(i, paragraphResults);
      
      if (i > 0 && prevAnalysis) {
        await this.processInterChapter(i - 1, i, prevAnalysis, chapterAnalysis);
      }
      
      prevAnalysis = chapterAnalysis;
    }
    console.log('Book processing complete.');
  }
}
