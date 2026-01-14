import express, { Router, Request, Response } from 'express';
import { container } from '../Container.js';
import { BookController } from '../controllers/BookController.js';
import { AnalysisController } from '../controllers/AnalysisController.js';

export const createApiRouter = (): Router => {
    const router = express.Router();
    
    // Resolve controllers
    const bookController: BookController = container.get('bookController');
    const analysisController: AnalysisController = container.get('analysisController');

    // -- Bind methods to keep 'this' context --

    // Book Routes
    router.get('/books', (req, res) => bookController.listBooks(req, res));
    router.get('/books/:bookId/chapters', (req, res) => bookController.listChapters(req, res));
    router.get('/books/:bookId/chapters/:chapterId/paragraphs', (req, res) => bookController.listParagraphs(req, res));

    // Analysis Routes
    router.post('/analyze', (req, res) => analysisController.analyze(req, res));
    router.post('/feedback', (req, res) => analysisController.feedback(req, res));
    router.post('/detect-accent', (req, res) => analysisController.detectAccent(req, res));
    router.post('/tts', (req, res) => analysisController.tts(req, res));
    router.post('/inter-chapter', (req, res) => analysisController.analyzeInterChapter(req, res));

    // Health
    router.get('/health', (req: Request, res: Response) => {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            env: container.get('config').server.env
        });
    });

    return router;
};
