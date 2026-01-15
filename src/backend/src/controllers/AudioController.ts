import { Request, Response } from 'express';
import { SpeechService } from '../services/SpeechService.js';
import { LLMService } from '../services/LLMService.js';
import fs from 'fs';

export class AudioController {
    constructor(
        private speechService: SpeechService,
        private llmService: LLMService
    ) {}

    async evaluateSpeaking(req: Request, res: Response): Promise<void> {
        if (!req.file) {
            res.status(400).json({ error: 'No audio file provided' });
            return;
        }

        const question = req.body.question;
        const context = req.body.context; // Optional context like "Personal Reflection"

        try {
            // Read file buffer
            console.log(`[AudioController] Received file: ${req.file.originalname}, Size: ${req.file.size} bytes, Mime: ${req.file.mimetype}, Path: ${req.file.path}`);
            
            const audioBuffer = fs.readFileSync(req.file.path);
            console.log(`[AudioController] Read buffer of size: ${audioBuffer.length}`);
            
            // 1. Transcribe
            const transcription = await this.llmService.transcribeAudio(audioBuffer);
            console.log(`[AudioController] Transcription result: "${transcription}"`);

            if (!transcription || transcription.trim().length === 0) {
                 throw new Error("Transcription received empty response from API");
            }

            // 2. Evaluate
            const evaluation = await this.llmService.evaluateSpeaking(transcription, question);

            // Clean up uploaded file
            fs.unlinkSync(req.file.path);

            res.json({ 
                success: true, 
                transcription,
                evaluation
            });
        } catch (error: any) {
             if (req.file) fs.unlinkSync(req.file.path);
             console.error("Speaking evaluation error:", error);
             res.status(500).json({ error: 'Evaluation failed', details: error.message });
        }
    }

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
