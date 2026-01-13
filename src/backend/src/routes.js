import express from 'express';
import { linguisticAnalysisAgent, imitationFeedbackAgent, detectAccentContext } from './llm.js';

const router = express.Router();

/**
 * POST /api/analyze
 * Main endpoint: Analyze user's text for comprehensive linguistic coaching
 */
router.post('/analyze', async (req, res) => {
  try {
    const { text, accentMode = 'modern-rp' } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text field is required' });
    }

    // Stage 1: Detect accent context (agentic pattern)
    const accentDetection = await detectAccentContext(text);
    const finalAccent = accentDetection.detectedContext === 'american' ? 'general-american' : accentMode;

    // Stage 2: Comprehensive linguistic analysis
    const analysis = await linguisticAnalysisAgent(text, finalAccent);

    res.json({
      success: true,
      accentDetected: accentDetection,
      analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analysis Error:', error);
    res.status(500).json({ error: error.message || 'Analysis failed' });
  }
});

/**
 * POST /api/feedback
 * Evaluate user's imitation attempt
 */
router.post('/feedback', async (req, res) => {
  try {
    const { originalText, userImitation, genre, accentMode = 'modern-rp' } = req.body;

    if (!originalText || !userImitation || !genre) {
      return res.status(400).json({ error: 'Missing required fields: originalText, userImitation, genre' });
    }

    const feedback = await imitationFeedbackAgent(originalText, userImitation, genre, accentMode);

    res.json({
      success: true,
      feedback,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Feedback Error:', error);
    res.status(500).json({ error: error.message || 'Feedback generation failed' });
  }
});

/**
 * POST /api/detect-accent
 * Detect accent/regional cues in text
 */
router.post('/detect-accent', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text field is required' });
    }

    const detection = await detectAccentContext(text);

    res.json({
      success: true,
      detection,
    });
  } catch (error) {
    console.error('Accent Detection Error:', error);
    res.status(500).json({ error: error.message || 'Accent detection failed' });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;
