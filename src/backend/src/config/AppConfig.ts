import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../../../');

dotenv.config({ path: path.join(projectRoot, '.env') });

export class AppConfig {
  public readonly llm: {
    apiKey: string;
    baseUrl: string;
    model: string;
  };

  public readonly azure: {
    speechKey: string;
    speechRegion: string;
  };

  public readonly server: {
    port: number;
    env: string;
  };

  public readonly paths: {
    dataDir: string;
    promptsDir: string;
  };

  constructor() {
    this.llm = {
      apiKey: process.env.LLM_API_KEY || '',
      baseUrl: process.env.LLM_BASE_URL || 'https://api.openai.com/v1',
      model: process.env.LLM_MODEL || 'gpt-4-turbo',
    };
    this.azure = {
      speechKey: process.env.AZURE_SPEECH_KEY || '',
      speechRegion: process.env.AZURE_SPEECH_REGION || '',
    };
    this.server = {
      port: parseInt(process.env.PORT || '3001', 10),
      env: process.env.NODE_ENV || 'development',
    };
    this.paths = {
        dataDir: path.resolve(projectRoot, 'data'),
        promptsDir: path.resolve(__dirname, '../prompts'),
    };
  }

  get isDevelopment(): boolean {
    return this.server.env === 'development';
  }
}
