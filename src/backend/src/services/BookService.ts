import fs from 'fs/promises';
import path from 'path';
import { AppConfig } from '../config/AppConfig.js';

export interface Paragraph {
    id: number;
    text: string;
    analysis: any; // Ideally this should be a stronger type based on LLM output
}

export class BookService {
  private dataDir: string;

  constructor(config: AppConfig) {
    this.dataDir = config.paths.dataDir;
  }

  async listBooks(): Promise<string[]> {
    try {
      await fs.access(this.dataDir);
    } catch {
      console.warn(`Data directory not found: ${this.dataDir}`);
      return [];
    }

    const files = await fs.readdir(this.dataDir);
    return files.filter(f => !f.startsWith('.'));
  }

  async getChapters(bookId: string): Promise<string[]> {
    this._validatePath(bookId);
    
    const bookPath = path.join(this.dataDir, bookId);
    try {
        await fs.access(bookPath);
    } catch {
        return [];
    }

    const files = await fs.readdir(bookPath);
    
    return files
      .filter(f => f.startsWith('chapter_'))
      .sort((a, b) => {
         const partsA = a.split('_');
         const partsB = b.split('_');
         const numA = partsA.length > 1 ? parseInt(partsA[1]) : 0;
         const numB = partsB.length > 1 ? parseInt(partsB[1]) : 0;
         return numA - numB;
      });
  }

  async getParagraphs(bookId: string, chapterId: string): Promise<Paragraph[]> {
    this._validatePath(bookId);
    this._validatePath(chapterId);

    const chapterPath = path.join(this.dataDir, bookId, chapterId);
    
    try {
        await fs.access(chapterPath);
    } catch {
        return [];
    }

    const files = await fs.readdir(chapterPath);
    const paragraphs: Paragraph[] = [];

    for (const file of files) {
      if (file.startsWith('p_') && file.endsWith('.json')) {
         const content = await fs.readFile(path.join(chapterPath, file), 'utf8');
         try {
           const json = JSON.parse(content) as Paragraph;
           paragraphs.push(json);
         } catch (e) {
           console.error(`Error parsing ${file}`, e);
         }
      }
    }

    return paragraphs.sort((a, b) => a.id - b.id);
  }

  private _validatePath(segment: string): void {
    if (segment.includes('..') || segment.includes('/') || segment.includes('\\')) {
        throw new Error(`Invalid path segment: ${segment}`);
    }
  }
}
