import { Request, Response } from 'express';
import { BookService } from '../services/BookService.js';

export class BookController {
  constructor(private bookService: BookService) {}

  async listBooks(req: Request, res: Response) {
    try {
      const books = await this.bookService.listBooks();
      res.json({ success: true, books });
    } catch (error) {
      console.error('Error listing books:', error);
      res.status(500).json({ error: 'Failed to list books' });
    }
  }

  async listChapters(req: Request, res: Response) {
    try {
      const bookId = req.params.bookId as string;
      const chapters = await this.bookService.getChapters(bookId);
      res.json({ success: true, chapters });
    } catch (error) {
      console.error('Error listing chapters:', error);
      res.status(500).json({ error: 'Failed to list chapters' });
    }
  }

  async listParagraphs(req: Request, res: Response) {
    try {
        const bookId = req.params.bookId as string;
        const chapterId = req.params.chapterId as string;
        
        const [paragraphs, chapterAnalysis] = await Promise.all([
            this.bookService.getParagraphs(bookId, chapterId),
            this.bookService.getChapterAnalysis(bookId, chapterId)
        ]);
        
        res.json({ success: true, paragraphs, chapterAnalysis });
    } catch (error) {
        console.error('Error listing paragraphs:', error);
        res.status(500).json({ error: 'Failed to list paragraphs' });
    }
  }
}
