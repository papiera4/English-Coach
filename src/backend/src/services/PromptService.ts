import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { AppConfig } from '../config/AppConfig.js';

interface PromptFile {
    system: string;
    [key: string]: any;
}

export class PromptService {
  private cache: Map<string, PromptFile>;

  constructor(private config: AppConfig) {
    this.cache = new Map();
  }

  private loadPrompt(filename: string): PromptFile {
    if (this.cache.has(filename)) {
        return this.cache.get(filename)!;
    }

    try {
      const filePath = path.join(this.config.paths.promptsDir, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const parsed = yaml.load(fileContents) as PromptFile;
      this.cache.set(filename, parsed);
      return parsed;
    } catch (e) {
      console.error(`Failed to load prompt file: ${filename}`, e);
      throw e;
    }
  }

  private resolvePrompt(promptName: string, replacements: Record<string, string> = {}): string {
    const filename = promptName.endsWith('.yaml') ? promptName : `${promptName}.yaml`;
    const promptData = this.loadPrompt(filename);
    let systemPrompt = promptData.system;
    
    for (const [key, value] of Object.entries(replacements)) {
        // Replace {{KEY}} with value
        systemPrompt = systemPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    
    return systemPrompt;
  }

  getPrompt(promptName: string, replacements: Record<string, string> = {}): string {
      return this.resolvePrompt(promptName, replacements);
  }

  getAnalysisCoreSystemPrompt(): string {
    return this.loadPrompt('analysis_core.yaml').system;
  }

  getSpeakingEvaluationSystemPrompt(): string {
      return this.loadPrompt('speaking_evaluation.yaml').system;
  }

  getAnalysisLexisSystemPrompt(): string {
    return this.loadPrompt('analysis_lexis.yaml').system;
  }

  getAnalysisProsodySystemPrompt(): string {
    return this.loadPrompt('analysis_prosody.yaml').system;
  }

  getFeedbackSystemPrompt(): string {
    return this.loadPrompt('feedback.yaml').system;
  }

  getChapterAnalysisSystemPrompt(): string {
    return this.loadPrompt('chapter_analysis.yaml').system;
  }

  getInterChapterAnalysisSystemPrompt(): string {
    return this.loadPrompt('inter_chapter_analysis.yaml').system;
  }

}
