import { Request, Response } from 'express';
import { LLMService } from '../services/LLMService.js';
import { TTSService } from '../services/TTSService.js';

export class AnalysisController {
  constructor(
    private llmService: LLMService,
    private ttsService: TTSService
  ) {}

  async analyze(req: Request, res: Response) {
    try {
      const { text, accentMode = 'modern-rp' } = req.body;

      if (!text || text.trim().length === 0) {
        return res.status(400).json({ error: 'Text field is required' }); // TS might complain about return if return type is not explicit
      }

      // Stage 1: Detect accent context
      const accentDetection = await this.llmService.detectAccentContext(text);
      const finalAccent = accentDetection.detectedContext === 'american' ? 'general-american' : accentMode;

      // Stage 2: Comprehensive linguistic analysis
      const analysis = await this.llmService.analyzeLinguistic(text, finalAccent);

      res.json({
        success: true,
        accentDetected: accentDetection,
        analysis,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Analysis Error:', error);
      res.status(500).json({ error: error.message || 'Analysis failed' });
    }
  }

  async feedback(req: Request, res: Response) {
    try {
      const { originalText, userImitation, genre, accentMode = 'modern-rp' } = req.body;

      if (!originalText || !userImitation || !genre) {
        return res.status(400).json({ error: 'Missing required fields: originalText, userImitation, genre' });
      }

      const feedback = await this.llmService.provideImitationFeedback(originalText, userImitation, genre, accentMode);

      res.json({
        success: true,
        feedback,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Feedback Error:', error);
      res.status(500).json({ error: error.message || 'Feedback generation failed' });
    }
  }

  async detectAccent(req: Request, res: Response) {
    try {
      const { text } = req.body;

      if (!text || text.trim().length === 0) {
        return res.status(400).json({ error: 'Text field is required' });
      }

      const detection = await this.llmService.detectAccentContext(text);

      res.json({
        success: true,
        detection,
      });
    } catch (error: any) {
      console.error('Accent Detection Error:', error);
      res.status(500).json({ error: error.message || 'Accent detection failed' });
    }
  }

  async tts(req: Request, res: Response) {
    try {
      const { text, accentMode, mood } = req.body;

      if (!text) {
        return res.status(400).json({ error: 'Text is required' });
      }

      const audioBuffer = await this.ttsService.generateSpeech(text, accentMode, mood);

      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(audioBuffer.length),
      });
      
      res.send(audioBuffer);
    } catch (error: any) {
      console.error('TTS Error:', error);
      res.status(500).json({ error: error.message || 'TTS generation failed' });
    }
  }

  // Inter-Chapter Analysis (New endpoint based on original LLM logic)
  async analyzeInterChapter(req: Request, res: Response) {
      try {
          const { prevSummary, currSummary, prevId, currId } = req.body;
          if (!prevSummary || !currSummary) {
              return res.status(400).json({ error: 'Missing summaries' });
          }
          const analysis = await this.llmService.analyzeInterChapter(prevSummary, currSummary, prevId, currId);
          res.json({ success: true, analysis });
      } catch (error: any) {
          res.status(500).json({ error: error.message });
      }
  }
}
