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
      headers: {
        Authorization: `Bearer ${config.llm.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  private async _chatCompletion<T>(messages: ChatMessage[], responseFormat: LLMResponseFormat = { type: 'json_object' }, temperature = 0.7): Promise<T> {
    try {
        const response = await this.client.post('/chat/completions', {
            model: this.config.llm.model,
            messages,
            temperature,
            response_format: responseFormat,
        });

        const content = response.data.choices[0].message.content;
        return responseFormat.type === 'json_object' ? JSON.parse(content) : content;
    } catch (error: any) {
        console.error('LLM Service Error:', error.response?.data || error.message);
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
    
    // Concurrency Optimization: Run specialized analysis modules in parallel
    // This reduces latency significantly compared to a single monolithic large prompt
    const [coreResult, lexisResult, prosodyResult] = await Promise.all([
        // 1. Core Analysis (Genre, Atmosphere, Rhetorics)
        this._chatCompletion([
            { role: 'system', content: this.promptService.getAnalysisCoreSystemPrompt() },
            { role: 'user', content: `Analyze the Genre and Pragmatics of this text:\n\n"${userText}"` }
        ]),
        // 2. Lexical Analysis (Vocabulary, L1 Logic)
        this._chatCompletion([
            { role: 'system', content: this.promptService.getAnalysisLexisSystemPrompt() },
            { role: 'user', content: `Analyze the Vocabulary and L1 Interference of this text:\n\n"${userText}"` }
        ]),
        // 3. Prosodic Analysis (Audio, Imitation) - Requires Accent
        this._chatCompletion([
             { 
               role: 'system', 
               content: this.promptService.getAnalysisProsodySystemPrompt().replace('{{ACCENT_MODE}}', currentAccent) 
             },
             { role: 'user', content: `Analyze the Prosody and create an Imitation Challenge for this text:\n\n"${userText}"` }
        ])
    ]);

    // Merge results into the single 'analysis' object structure expected by the frontend
    return {
        ...(coreResult as object),
        ...(lexisResult as object),
        ...(prosodyResult as object)
    };
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
