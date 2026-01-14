import axios, { AxiosInstance } from 'axios';
import { AppConfig } from '../config/AppConfig.js';
import { PromptService } from './PromptService.js';

interface LLMResponseFormat {
    type: 'json_object' | 'text';
}

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface AccentDetectionResult {
    detectedContext: 'american' | 'british' | 'neutral';
    confidence: number;
    cues: string[];
}

export class LLMService {
  private client: AxiosInstance;

  constructor(
    private config: AppConfig,
    private promptService: PromptService
  ) {
    this.client = axios.create({
      baseURL: config.llm.baseUrl,
      timeout: 120000, // 2 minutes timeout to prevent infinite hangs
      headers: {
        Authorization: `Bearer ${config.llm.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  private _cleanJson(content: string): string {
    // Remove markdown code blocks if present
    content = content.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```$/, '');
    return content.trim();
  }

  private async _chatCompletion<T>(messages: ChatMessage[], responseFormat: LLMResponseFormat = { type: 'json_object' }, temperature = 0.7, retries = 3): Promise<T> {
    const startTime = Date.now();
    try {
        const response = await this.client.post('/chat/completions', {
            model: this.config.llm.model,
            messages,
            temperature,
            response_format: responseFormat, 
        });

        const duration = Date.now() - startTime;
        if (duration > 5000) {
           console.log(`LLM Request took ${duration}ms`);
        }

        const content = response.data.choices[0].message.content;
        
        if (responseFormat.type === 'json_object') {
            try {
                return JSON.parse(this._cleanJson(content));
            } catch (parseError) {
                console.error('JSON Parse Error. Content received:', content);
                throw new Error('Failed to parse LLM response as JSON');
            }
        }
        
        return content;
    } catch (error: any) {
        // Retry logic for rate limits (429), server errors (5xx), timeouts, or connection resets
        const isRetryable = error.response?.status === 429 || 
                            error.response?.status >= 500 || 
                            error.code === 'ECONNABORTED' || 
                            error.code === 'ECONNRESET';

        if (retries > 0 && isRetryable) {
            const delay = 3000 * (4 - retries); // Exponential backoff: 3s, 6s, 9s
            console.warn(`LLM Error (${error.response?.status || error.code}). Retrying in ${delay}ms... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return this._chatCompletion(messages, responseFormat, temperature, retries - 1);
        }

        console.error('LLM Service Error:', {
            status: error.response?.status,
            code: error.code,
            data: error.response?.data,
            message: error.message
        });
        throw error;
    }
  }

  /**
   * Performs inter-chapter analysis
   */
  async analyzeInterChapter(prevSummary: any, currSummary: any, prevId: string | number, currId: string | number): Promise<any> {
    const systemPrompt = this.promptService.getInterChapterAnalysisSystemPrompt()
      .replace('{{PREV}}', String(prevId))
      .replace('{{CURR}}', String(currId));

    const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `Previous Chapter (${prevId}) Summary:\n${JSON.stringify(prevSummary)}\n\nCurrent Chapter (${currId}) Summary:\n${JSON.stringify(currSummary)}` 
        }
    ];

    return this._chatCompletion(messages);
  }

  /**
   * Performs chapter-level analysis
   */
  async analyzeChapter(chapterText: string, paragraphAnalyses: any[]): Promise<any> {
    // Summarize linguistic data to avoid token overflow
    const linguisticSummary = paragraphAnalyses.map(p => ({
      mood: p.analysis.atmosphere.mood,
      themes: p.analysis.genre.type
    })).slice(0, 20); // Sample first 20 for context

    const systemPrompt = this.promptService.getChapterAnalysisSystemPrompt();
    const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `Chapter Text (truncated): "${chapterText.substring(0, 8000)}..."\n\nLinguistic Samples: ${JSON.stringify(linguisticSummary)}` 
        }
    ];

    return this._chatCompletion(messages, { type: 'json_object' }, 0.6);
  }

  /**
   * Comprehensive linguistic coaching
   */
  async analyzeLinguistic(userText: string, accentMode = 'modern-rp'): Promise<any> {
    const currentAccent = accentMode === 'modern-rp' ? 'Modern RP (British)' : 'General American (GenAm)';
    const startTime = Date.now();
    
    // Concurrency Optimization: Run specialized analysis modules in parallel
    // This reduces latency significantly compared to a single monolithic large prompt
    console.log(`[${new Date().toISOString()}] Starting Concurrent Analysis for text (${userText.length} chars)...`);
    
    // Stagger requests slightly to avoid burst rate limits
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    try {
        const [coreResult, lexisResult, prosodyResult] = await Promise.all([
            // 1. Core Analysis (Genre, Atmosphere, Rhetorics)
            delay(0).then(() => {
                const stepStart = Date.now();
                return this._chatCompletion([
                    { role: 'system', content: this.promptService.getAnalysisCoreSystemPrompt() },
                    { role: 'user', content: `Analyze the Genre and Pragmatics of this text:\n\n"${userText}"` }
                ]).then(res => { 
                    console.log(`✅ Core Analysis Complete in ${Date.now() - stepStart}ms`); 
                    return res; 
                });
            }),
            
            // 2. Lexical Analysis (Vocabulary, L1 Logic)
            delay(200).then(() => {
                const stepStart = Date.now();
                return this._chatCompletion([
                    { role: 'system', content: this.promptService.getAnalysisLexisSystemPrompt() },
                    { role: 'user', content: `Analyze the Vocabulary and L1 Interference of this text:\n\n"${userText}"` }
                ]).then(res => { 
                    console.log(`✅ Lexis Analysis Complete in ${Date.now() - stepStart}ms`); 
                    return res; 
                });
            }),
            
            // 3. Prosodic Analysis (Audio, Imitation) - Requires Accent
            delay(400).then(() => {
                const stepStart = Date.now();
                return this._chatCompletion([
                    { 
                    role: 'system', 
                    content: this.promptService.getAnalysisProsodySystemPrompt().replace('{{ACCENT_MODE}}', currentAccent) 
                    },
                    { role: 'user', content: `Analyze the Prosody and create an Imitation Challenge for this text:\n\n"${userText}"` }
                ]).then(res => { 
                    console.log(`✅ Prosody Analysis Complete in ${Date.now() - stepStart}ms`); 
                    return res; 
                });
            })
        ]);

        console.log(`🎉 Total Analysis Duration: ${Date.now() - startTime}ms`);

        // Merge results into the single 'analysis' object structure expected by the frontend
        return {
            ...(coreResult as object),
            ...(lexisResult as object),
            ...(prosodyResult as object)
        };
    } catch (e) {
        console.error(`❌ Concurrent Analysis Failed after ${Date.now() - startTime}ms`, e);
        throw e;
    }
  }

  /**
   * Imitation feedback
   */
  async provideImitationFeedback(originalText: string, userImitation: string, genre: string, accentMode = 'modern-rp'): Promise<any> {
    const systemPrompt = this.promptService.getFeedbackSystemPrompt()
        .replace('{{GENRE}}', genre)
        .replace('{{ACCENT_MODE}}', accentMode);
    
    const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { 
            role: 'user', 
            content: `Original: "${originalText}"\n\nUser's Imitation: "${userImitation}"\n\nProvide detailed feedback.`
        }
    ];

    return this._chatCompletion(messages, { type: 'json_object' }, 0.5);
  }

  async detectAccentContext(text: string): Promise<AccentDetectionResult> {
     const systemPrompt = `Analyze the text for accent/regional cues. Return JSON:
{
  "detectedContext": "american|british|neutral",
  "confidence": 0.0-1.0,
  "cues": ["..."]
}`;
     
     const messages: ChatMessage[] = [
            {
                role: 'system',
                content: systemPrompt
            },
            { role: 'user', content: `Text: "${text}"` }
        ];

     try {
        return await this._chatCompletion<AccentDetectionResult>(messages, { type: 'json_object' }, 0.3);
     } catch (error) {
        console.error('Accent Detection Error:', error);
        return { detectedContext: 'neutral', confidence: 0, cues: [] };
     }
  }
}
