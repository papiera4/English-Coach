import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths relative to this file: ../prompts/
const PROMPTS_DIR = path.join(__dirname, '../prompts');

const loadYaml = (filename) => {
  try {
    const filePath = path.join(PROMPTS_DIR, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return yaml.load(fileContents);
  } catch (e) {
    console.error(`Failed to load prompt file: ${filename}`, e);
    throw e;
  }
};

export const getAnalysisPrompt = () => loadYaml('analysis.yaml').system;
export const getFeedbackPrompt = () => loadYaml('feedback.yaml').system;
export const getChapterAnalysisPrompt = () => loadYaml('chapter_analysis.yaml').system;
export const getInterChapterAnalysisPrompt = () => loadYaml('inter_chapter_analysis.yaml').system;
