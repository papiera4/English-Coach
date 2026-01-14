import { Request, Response } from 'express';
import { SpeechService } from '../services/SpeechService.js';
import fs from 'fs';

export class AudioController {
    constructor(private speechService: SpeechService) {}

    async assessPronunciation(req: Request, res: Response): Promise<void> {
        if (!req.file) {
            res.status(400).json({ error: 'No audio file provided' });
            return;
        }

        const referenceText = req.body.referenceText;
        if (!referenceText) {
            // Delete file if invalid request
            fs.unlinkSync(req.file.path);
            res.status(400).json({ error: 'No reference text provided' });
            return;
        }

        try {
            const result = await this.speechService.assessPronunciation(req.file.path, referenceText);
            
            // Clean up uploaded file
            fs.unlinkSync(req.file.path);
            
            res.json({ success: true, analysis: result });
        } catch (error: any) {
            // Clean up uploaded file in case of error
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            console.error('Assessment Error:', error);
            res.status(500).json({ error: error.message || 'Failed to assess pronunciation' });
        }
    }
}
