import path from 'path';
import Database from 'better-sqlite3';
import { AppConfig } from '../config/AppConfig.js';

export interface Paragraph {
    id: number;
    text: string;
    analysis: any;
    audioUrl?: string;
}

export class BookService {
  private db: Database.Database;

  constructor(config: AppConfig) {
    const dbPath = path.join(config.paths.dataDir, 'english_coach.db');
    // Open in Read-Only mode to prevent accidental writes from the API
    try {
        this.db = new Database(dbPath, { readonly: true, fileMustExist: false });
    } catch (e) {
        // If file doesn't exist, better-sqlite3 throws. 
        // In dev, it might not exist yet. Handle gracefully?
        console.error("Failed to open database:", dbPath, e);
        // We create a dummy db or let it crash? 
        // Better to allow app to start even if DB is broken, but calls will fail.
        this.db = new Database(':memory:'); 
    }
  }

  async listBooks(): Promise<string[]> {
    try {
        const rows = this.db.prepare('SELECT DISTINCT book_id FROM paragraphs').all() as { book_id: string }[];
        return rows.map(r => r.book_id || '1984');
    } catch (error) {
        console.error("Error querying books:", error);
        return [];
    }
  }

  async getChapters(bookId: string): Promise<string[]> {
    try {
        // Handle case where book_id might be missing in older rows
        const rows = this.db.prepare('SELECT DISTINCT chapter FROM paragraphs WHERE book_id = ?').all(bookId) as { chapter: string }[];
        
        return rows.map(r => r.chapter).sort((a, b) => {
            const extractNum = (s: string) => {
                const match = s ? s.match(/\d+/) : null;
                return match ? parseInt(match[0]) : 0;
            };
            return extractNum(a) - extractNum(b);
        });
    } catch (error) {
        console.error("Error querying chapters:", error);
        return [];
    }
  }

  async getParagraphs(bookId: string, chapterId: string): Promise<Paragraph[]> {
    try {
        const rows = this.db.prepare(`
            SELECT id, text, audio_path, analysis_json 
            FROM paragraphs 
            WHERE book_id = ? AND chapter = ?
            ORDER BY id ASC
        `).all(bookId, chapterId) as any[];

        return rows.map(row => ({
            id: row.id,
            text: row.text,
            analysis: row.analysis_json ? JSON.parse(row.analysis_json) : null,
            audioUrl: row.audio_path ? `/content/${row.audio_path}` : undefined
        }));
    } catch (error) {
        console.error("Error querying paragraphs:", error);
        return [];
    }
  }

  async getChapterAnalysis(bookId: string, chapterId: string): Promise<any> {
      try {
          const row = this.db.prepare(`
              SELECT analysis_json FROM chapters WHERE book_id = ? AND title = ?
          `).get(bookId, chapterId) as { analysis_json: string } | undefined;
          
          return row ? JSON.parse(row.analysis_json) : null;
      } catch (error) {
          console.error("Error querying chapter analysis:", error);
          return null;
      }
  }
}
