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

  getAnalysisCoreSystemPrompt(): string {
    return this.loadPrompt('analysis_core.yaml').system;
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
