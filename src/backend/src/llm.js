import axios from 'axios';
import { config } from './config.js';
import { 
  getAnalysisPrompt, 
  getFeedbackPrompt, 
  getChapterAnalysisPrompt, 
  getInterChapterAnalysisPrompt 
} from './utils/promptLoader.js';

const llmClient = axios.create({
  baseURL: config.llm.baseUrl,
  headers: {
    Authorization: `Bearer ${config.llm.apiKey}`,
    'Content-Type': 'application/json',
  },
});

/**
 * Agentic Pattern: Inter-Chapter Analysis
 */
export const interChapterAnalysisAgent = async (prevSummary, currSummary, prevId, currId) => {
  const systemPrompt = getInterChapterAnalysisPrompt()
    .replace('{{PREV}}', prevId)
    .replace('{{CURR}}', currId);

  try {
    const response = await llmClient.post('/chat/completions', {
      model: config.llm.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `Previous Chapter (${prevId}) Summary:\n${JSON.stringify(prevSummary)}\n\nCurrent Chapter (${currId}) Summary:\n${JSON.stringify(currSummary)}` 
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.data.choices[0].message.content);
  } catch (error) {
    console.error(`LLM Inter-Chapter Error (${prevId}-${currId}):`, error.message);
    throw error;
  }
};

/**
 * Agentic Pattern: Chapter-Level Analysis
 */
export const chapterAnalysisAgent = async (chapterText, paragraphAnalyses) => {
  try {
    // Summarize linguistic data to avoid token overflow
    const linguisticSummary = paragraphAnalyses.map(p => ({
      mood: p.analysis.atmosphere.mood,
      themes: p.analysis.genre.type
    })).slice(0, 20); // Sample first 20 for context

    const systemPrompt = getChapterAnalysisPrompt();

    const response = await llmClient.post('/chat/completions', {
      model: config.llm.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `Chapter Text (truncated): "${chapterText.substring(0, 8000)}..."\n\nLinguistic Samples: ${JSON.stringify(linguisticSummary)}` 
        }
      ],
      temperature: 0.6,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.data.choices[0].message.content);
  } catch (error) {
    console.error('LLM Chapter Analysis Error:', error.message);
    throw error;
  }
};

/**
 * Agentic Pattern: Multi-stage analysis with structured outputs
 * Each stage builds upon the previous one
 */
export const linguisticAnalysisAgent = async (userText, accentMode = 'modern-rp') => {
  const currentAccent = accentMode === 'modern-rp' ? 'Modern RP (British)' : 'General American (GenAm)';
  const systemPrompt = getAnalysisPrompt().replace('{{ACCENT_MODE}}', currentAccent);

  try {
    const response = await llmClient.post('/chat/completions', {
      model: config.llm.model,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Analyze this text and provide comprehensive linguistic coaching:\n\n"${userText}"`,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const analysisText = response.data.choices[0].message.content;
    return JSON.parse(analysisText);
  } catch (error) {
    console.error('LLM API Error:', error.message);
    throw new Error(`Failed to analyze text: ${error.message}`);
  }
};

/**
 * Agentic Pattern: Iterative imitation feedback
 * Takes user's imitation and provides structured critique
 */
export const imitationFeedbackAgent = async (originalText, userImitation, genre, accentMode = 'modern-rp') => {
  const systemPrompt = getFeedbackPrompt()
    .replace('{{GENRE}}', genre)
    .replace('{{ACCENT_MODE}}', accentMode);

  try {
    const response = await llmClient.post('/chat/completions', {
      model: config.llm.model,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Original: "${originalText}"\n\nUser's Imitation: "${userImitation}"\n\nProvide detailed feedback.`,
        },
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });

    const feedbackText = response.data.choices[0].message.content;
    return JSON.parse(feedbackText);
  } catch (error) {
    console.error('LLM Feedback Error:', error.message);
    throw new Error(`Failed to generate feedback: ${error.message}`);
  }
};

/**
 * Agentic Pattern: Accent detection
 * Intelligently detects if text is American or British context
 */
export const detectAccentContext = async (text) => {
  const systemPrompt = `Analyze the text for accent/regional cues. Return JSON:
{
  "detectedContext": "american|british|neutral",
  "confidence": 0.0-1.0,
  "cues": ["..."]
}`;

  try {
    const response = await llmClient.post('/chat/completions', {
      model: config.llm.model,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Text: "${text}"`,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const detectionText = response.data.choices[0].message.content;
    return JSON.parse(detectionText);
  } catch (error) {
    console.error('Accent Detection Error:', error.message);
    return { detectedContext: 'neutral', confidence: 0, cues: [] };
  }
};
