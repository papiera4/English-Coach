import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../..');

dotenv.config({ path: path.join(projectRoot, '.env') });

export const config = {
  llm: {
    apiKey: process.env.LLM_API_KEY,
    baseUrl: process.env.LLM_BASE_URL || 'https://api.openai.com/v1',
    model: process.env.LLM_MODEL || 'gpt-4-turbo',
  },
  server: {
    port: process.env.PORT || 3001,
    env: process.env.NODE_ENV || 'development',
  },
};
