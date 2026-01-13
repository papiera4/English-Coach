import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { linguisticAnalysisAgent, imitationFeedbackAgent, detectAccentContext } from './llm.js';

const router = express.Router();

// Debug paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// __dirname is src/backend/src. 
// We want data/processed in root. 
// src/backend/src -> src/backend -> src -> root -> data/processed
const DATA_DIR = path.resolve(__dirname, '../../../data/processed');

console.log('--- ROUTE SETUP ---');
console.log('__dirname:', __dirname);
console.log('DATA_DIR:', DATA_DIR);

// 1. Get available books
router.get('/books', async (req, res) => {
  try {
    // Ensure dir exists
    try {
        await fs.access(DATA_DIR);
    } catch {
        console.error(`DATA_DIR not found: ${DATA_DIR}`);
        return res.json({ success: true, books: [] });
    }

    const files = await fs.readdir(DATA_DIR);
    // Filter out hidden files like .DS_Store
    const books = files.filter(f => !f.startsWith('.'));
    
    console.log('Found books:', books);
    res.json({ success: true, books });
  } catch (error) {
    console.error('Error reading books:', error);
    res.status(500).json({ error: 'Failed to list books' });
  }
});

// 2. Get chapters for a book
router.get('/books/:bookId/chapters', async (req, res) => {
  try {
    const { bookId } = req.params;
    console.log(`Requesting chapters for book: ${bookId}`);
    
    // Validate path to prevent directory traversal
    if (bookId.includes('..') || bookId.includes('/')) {
        return res.status(400).json({ error: 'Invalid book ID' });
    }

    const bookPath = path.join(DATA_DIR, bookId);
    console.log(`Looking in: ${bookPath}`);

    // Check if book dir exists
    try {
        await fs.access(bookPath);
    } catch {
        console.error(`Book path not found: ${bookPath}`);
        return res.json({ success: true, chapters: [] });
    }

    const files = await fs.readdir(bookPath);
    console.log(`Found files in book dir: ${files.length}`);
    
    // Filter folders start with "chapter_" and sort by number
    const chapters = files
      .filter(f => f.startsWith('chapter_'))
      .sort((a, b) => {
         const partsA = a.split('_');
         const partsB = b.split('_');
         const numA = partsA.length > 1 ? parseInt(partsA[1]) : 0;
         const numB = partsB.length > 1 ? parseInt(partsB[1]) : 0;
         return numA - numB;
      });
    
    console.log(`Returning ${chapters.length} chapters`);
    res.json({ success: true, chapters });
  } catch (error) {
    console.error('Error reading chapters:', error);
    res.status(500).json({ error: 'Failed to list chapters' });
  }
});

// 3. Get paragraphs for a chapter
router.get('/books/:bookId/chapters/:chapterId/paragraphs', async (req, res) => {
  try {
    const { bookId, chapterId } = req.params;
    const chapterPath = path.join(DATA_DIR, bookId, chapterId);
    const files = await fs.readdir(chapterPath);
    
    // Load all p_X.json files
    const paragraphs = [];
    for (const file of files) {
      if (file.startsWith('p_') && file.endsWith('.json')) {
         const content = await fs.readFile(path.join(chapterPath, file), 'utf8');
         paragraphs.push(JSON.parse(content));
      }
    }
    
    // Sort by ID
    paragraphs.sort((a, b) => a.id - b.id);

    res.json({ success: true, paragraphs });
  } catch (error) {
    console.error('Error reading paragraphs:', error);
    res.status(500).json({ error: 'Failed to load chapter content' });
  }
});

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
