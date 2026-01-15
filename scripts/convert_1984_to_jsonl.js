const fs = require('fs');
const path = require('path');

// 配置路径
const INPUT_FILE = path.join(__dirname, '../data/origin/1984.txt');
const OUTPUT_FILE = path.join(__dirname, '../data/processed/1984.jsonl');

// 检查输入文件是否存在
if (!fs.existsSync(INPUT_FILE)) {
    console.error(`Error: Input file not found at ${INPUT_FILE}`);
    process.exit(1);
}

// 确保输出目录存在
const outputDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`Reading from: ${INPUT_FILE}`);
const content = fs.readFileSync(INPUT_FILE, 'utf-8');

// 按行分割
const lines = content.split(/\r?\n/);

let currentPart = '';
let currentChapter = '';
let outputCount = 0;
let buffer = []; // 用于累积一个段落的文本

const stream = fs.createWriteStream(OUTPUT_FILE, { flags: 'w' });

// 简单的状态机逻辑
// 1. PART 识别 (例如: PART ONE)
// 2. Chapter 识别 (例如: Chapter 1)
// 3. 段落识别 (非空行)

// 正则表达式
const partRegex = /^PART\s+(ONE|TWO|THREE|[IVX]+)/i;
const chapterRegex = /^Chapter\s+\d+/i;

function flushBuffer() {
    if (buffer.length > 0) {
        const text = buffer.join(' ').trim();
        if (text) {
            const entry = {
                part: currentPart,
                chapter: currentChapter,
                text: text,
                source_path: '1984.txt'
            };
            stream.write(JSON.stringify(entry) + '\n');
            outputCount++;
        }
        buffer = [];
    }
}

for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 跳过空行，但在跳过前，如果 buffer 有内容，说明一个段落结束了
    if (!line) {
        flushBuffer();
        continue;
    }

    // 检查是否是 PART
    if (partRegex.test(line)) {
        flushBuffer(); // 上一段落结束
        currentPart = line;
        // 重置章节，或者是保留？通常 PART 变了 Chapter 也会变，或者 Chapter 归属于 Part
        // 这里只是更新状态
        console.log(`Found Part: ${currentPart}`);
        continue;
    }

    // 检查是否是 Chapter
    if (chapterRegex.test(line)) {
        flushBuffer(); // 上一段落结束
        currentChapter = line;
        console.log(`Found Chapter: ${currentChapter}`);
        continue;
    }

    // 普通文本行，加入 buffer
    buffer.push(line);
}

// 处理文件末尾可能的剩余 buffer
flushBuffer();

stream.end();

stream.on('finish', () => {
    console.log(`Conversion complete.`);
    console.log(`Output written to: ${OUTPUT_FILE}`);
    console.log(`Total paragraphs processed: ${outputCount}`);
});
