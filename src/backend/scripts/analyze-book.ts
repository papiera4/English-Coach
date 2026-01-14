import path from 'path';
import { fileURLToPath } from 'url';
import { BookProcessor } from '../src/processors/bookProcessor.js';
import { container } from '../src/Container.js';
import { LLMService } from '../src/services/LLMService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to show usage
const showUsage = () => {
    console.log('Usage: node analyze-book.js <input_file> <output_dir> [options]');
    console.log('Options:');
    console.log('  --limit <number>       Limit the number of chapters to process');
    console.log('  --regex <pattern>      Regex pattern to split chapters (default: "Chapter \\d+")');
    console.log('  --no-preamble          Do not skip the first section (preamble)');
    process.exit(1);
};

// Simple arg parser
const args = process.argv.slice(2);
if (args.length < 2) showUsage();

const [inputFile, outputDir] = args;
let limit: number | null = null;
let chapterRegex = /Chapter \d+/;
let skipPreamble = true;

for (let i = 2; i < args.length; i++) {
    if (args[i] === '--limit') limit = parseInt(args[++i]);
    if (args[i] === '--regex') chapterRegex = new RegExp(args[++i]);
    if (args[i] === '--no-preamble') skipPreamble = false;
}

// Resolve paths relative to where command is run or absolute
const resolvedInput = path.resolve(inputFile);

// Extract book name from input file path to create a subdirectory
const bookName = path.parse(resolvedInput).name;
const resolvedOutput = path.resolve(outputDir, bookName);

async function main() {
  await container.init(); // Initialize DI
  const llmService = container.get('llmService') as LLMService;

  console.log('Starting Book Analysis...');
  console.log('Input:', resolvedInput);
  console.log('Book Name:', bookName);
  console.log('Output Directory:', resolvedOutput);
  console.log('Split Regex:', chapterRegex);

  const processor = new BookProcessor(resolvedInput, resolvedOutput, {
      chapterRegex,
      skipPreamble
  }, llmService);
  
  await processor.run(limit); 
}

main().catch(console.error);
