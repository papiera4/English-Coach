import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { container } from './Container.js';
import { createApiRouter } from './routes/api.js';

export const createApp = async (): Promise<Express> => {
    // Initialize container
    await container.init();
    const config = container.get('config');

    const app = express();

    // Middleware
    app.use(cors());
    app.use(express.json({ limit: '10mb' }));

    // Routes
    app.use('/api', createApiRouter());

    // Error handling middleware
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        console.error('Unhandled Error:', err);
        res.status(500).json({
            error: 'Internal Server Error',
            message: config.isDevelopment ? err.message : undefined,
        });
    });

    // 404 handler
    app.use((req: Request, res: Response) => {
        res.status(404).json({ error: 'Not Found' });
    });

    return app;
};
