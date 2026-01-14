import { AppConfig } from './config/AppConfig.js';
import { PromptService } from './services/PromptService.js';
import { BookService } from './services/BookService.js';
import { LLMService } from './services/LLMService.js';
import { TTSService } from './services/TTSService.js';
import { BookController } from './controllers/BookController.js';
import { AnalysisController } from './controllers/AnalysisController.js';

type ServiceMap = {
    'config': AppConfig;
    'promptService': PromptService;
    'bookService': BookService;
    'llmService': LLMService;
    'ttsService': TTSService;
    'bookController': BookController;
    'analysisController': AnalysisController;
};

class Container {
  private services: Map<keyof ServiceMap, any>;

  constructor() {
    this.services = new Map();
  }

  register<K extends keyof ServiceMap>(name: K, instance: ServiceMap[K]): void {
    this.services.set(name, instance);
  }

  get<K extends keyof ServiceMap>(name: K): ServiceMap[K] {
    if (!this.services.has(name)) {
      throw new Error(`Service ${name} not found`);
    }
    return this.services.get(name);
  }

  async init() {
    // 1. Config
    const config = new AppConfig();
    this.register('config', config);

    // 2. Services
    const promptService = new PromptService(config);
    this.register('promptService', promptService);

    const bookService = new BookService(config);
    this.register('bookService', bookService);

    const llmService = new LLMService(config, promptService);
    this.register('llmService', llmService);

    const ttsService = new TTSService(config);
    this.register('ttsService', ttsService);

    // 3. Controllers
    const bookController = new BookController(bookService);
    this.register('bookController', bookController);

    const analysisController = new AnalysisController(llmService, ttsService);
    this.register('analysisController', analysisController);

    console.log('✅ Dependency Injection Container Initialized');
  }
}

export const container = new Container();
