import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { AppConfig } from '../src/config/AppConfig.js';
import { TTSService } from '../src/services/TTSService.js';
import { LLMService } from '../src/services/LLMService.js';
import { PromptService } from '../src/services/PromptService.js';

// 获取当前文件路径
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// CLI 参数获取
const args = process.argv.slice(2);
const BOOK_ID = args[0] || '1984';

// 路径配置
const PROJECT_ROOT = path.resolve(__dirname, '../../../');
const DB_PATH = path.join(PROJECT_ROOT, 'data/english_coach.db');

// Book Specific Paths
const BOOK_DIR = path.join(PROJECT_ROOT, 'data/books', BOOK_ID);
const JSONL_PATH = path.join(BOOK_DIR, 'segments.jsonl');
const AUDIO_BASE_DIR = path.join(BOOK_DIR, 'audio');

// 配置项目
const LIMIT = 2; // For testing Chapter 1 small subset
const SKIP_EXISTING_AUDIO = true;

async function main() {
    console.log(`📘 Processing book: ${BOOK_ID}`);

    if (!fs.existsSync(JSONL_PATH)) {
        console.error(`Error: JSONL file not found at ${JSONL_PATH}`);
        process.exit(1);
    }

    // 1. 初始化服务
    const config = new AppConfig();
    
    // Clean specific audio for this test (since we want to "only keep text" and regenerate)
    // Actually the user asks to "delete all data", implying clearing the DB.
    // We will clear the DB for this book ID first.
    const db = new Database(DB_PATH);
    
    console.log(`🧹 Cleaning up data for book: ${BOOK_ID}...`);
    try {
        db.prepare('DELETE FROM paragraphs WHERE book_id = ?').run(BOOK_ID);
        db.prepare('DELETE FROM chapters WHERE book_id = ?').run(BOOK_ID);
        // Also cleanup files
        if (fs.existsSync(AUDIO_BASE_DIR)) {
            // Delete files in audio dir
            fs.readdirSync(AUDIO_BASE_DIR).forEach(f => fs.unlinkSync(path.join(AUDIO_BASE_DIR, f)));
        }
    } catch (e) {
        console.error("Cleanup error (ignorable if first run):", e);
    }
    
    const enableAudio = !!(config.azure.speechKey && config.azure.speechRegion);
    if (!enableAudio) {
        console.warn("⚠️  Azure Speech Key/Region not found in .env. Audio generation will be SKIPPED.");
    } else {
        console.log("✅ Azure Speech configured. Audio generation enabled.");
    }

    const ttsService = new TTSService(config);
    const promptService = new PromptService(config);
    const llmService = new LLMService(config, promptService);

    // 2. 准备目录
    if (!fs.existsSync(path.dirname(DB_PATH))) {
        fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    }
    if (enableAudio && !fs.existsSync(AUDIO_BASE_DIR)) {
        fs.mkdirSync(AUDIO_BASE_DIR, { recursive: true });
    }

    // 3. 初始化数据库
    // const db = new Database(DB_PATH); // Initialized earlier used for cleanup
    db.exec(`
        CREATE TABLE IF NOT EXISTS paragraphs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            book_id TEXT DEFAULT '1984', -- Add book_id column
            part TEXT,
            chapter TEXT,
            text TEXT,
            audio_path TEXT,
            is_processed BOOLEAN DEFAULT 0,
            analysis_json TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS chapters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            book_id TEXT,
            chapter_index INTEGER, -- Logic index
            title TEXT, -- "Chapter 1"
            analysis_json TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
    
    // Quick migration for book_id if it doesn't exist (handle safely)
    try {
        const tableInfo = db.prepare("PRAGMA table_info(paragraphs)").all();
        if (!tableInfo.find(c => c.name === 'book_id')) {
            console.log("Migrating: Adding book_id column...");
            db.exec(`ALTER TABLE paragraphs ADD COLUMN book_id TEXT DEFAULT '1984'`);
        }
    } catch(e) { /* ignore */ }

    // Quick migration for audio paths (Restructure)
    // Update old paths: processed/audio/1984/ -> books/1984/audio/
    const updateCount = db.prepare(`
        UPDATE paragraphs 
        SET audio_path = REPLACE(audio_path, 'processed/audio/', 'books/') 
        WHERE audio_path LIKE 'processed/audio/%'
    `).run();
    if (updateCount.changes > 0) {
        console.log(`Migrated ${updateCount.changes} audio paths to new structure.`);
    }

    // 预编译语句
    const insertStmt = db.prepare(`
        INSERT INTO paragraphs (book_id, part, chapter, text, audio_path) 
        VALUES (@book_id, @part, @chapter, @text, @audio_path)
    `);

    const checkStmt = db.prepare(`
        SELECT id, audio_path FROM paragraphs WHERE text = @text AND chapter = @chapter AND book_id = @book_id
    `);
    
    const updateAudioStmt = db.prepare(`
        UPDATE paragraphs SET audio_path = @audio_path WHERE id = @id
    `);

    // 4. 读取 JSONL 并处理
    console.log(`Reading from: ${JSONL_PATH}`);
    const fileStream = fs.createReadStream(JSONL_PATH);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let count = 0;
    const distinctChapters = new Set<string>();
    
    for await (const line of rl) {
        if (count >= LIMIT) break;
        if (!line.trim()) continue;

        const data = JSON.parse(line);
        const { part, chapter, text } = data;
        if (chapter) distinctChapters.add(chapter);
        
        // Use loose check for Chapter 1
        if (!chapter || !chapter.toLowerCase().includes('chapter 1')) {
            continue;
        }

        // 4.1 检查是否已存在
        const existing = checkStmt.get({ text, chapter, book_id: BOOK_ID });
        
        let rowId;
        let audioPath = existing ? existing.audio_path : null;

        if (existing) {
            rowId = existing.id;
            // console.log(`[SKIP] Exists ID: ${rowId}`);
        } else {
            // 插入数据
            const info = insertStmt.run({
                book_id: BOOK_ID,
                part,
                chapter,
                text,
                audio_path: null
            });
            rowId = info.lastInsertRowid;
            console.log(`[INSERT] New ID: ${rowId} | ${chapter}`);
        }

        // 4.1.5 Run Linguistic Analysis (LLM)
        let processedAnalysis: any = {};
        try {
            console.log(`   [LLM] Analyzing text...`);
            // Run the same analysis pipeline as the 'Analyze' button
            processedAnalysis = await llmService.analyzeLinguistic(text, 'modern-rp'); 
        } catch (err: any) {
             console.error(`   ❌ [LLM] Analysis failed for ID ${rowId}:`, err.message);
             // Proceed with empty analysis to at least save audio
        }

        // 4.2 音频处理 (Sentence Level Split)
        if (enableAudio) {
            // Split text into sentences
            const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((s: string) => s.trim()).filter((s: string) => s.length > 0) || [text];
            const sentenceData = [];

            console.log(`   Processing ${sentences.length} sentences for Paragraph ${rowId}`);

            for (let i = 0; i < sentences.length; i++) {
                const sText = sentences[i];
                const sFileName = `p_${rowId}_s_${i}.mp3`;
                const sFilePath = path.join(AUDIO_BASE_DIR, sFileName);
                
                let generate = true;
                if (SKIP_EXISTING_AUDIO && fs.existsSync(sFilePath)) {
                    generate = false;
                }

                if (generate) {
                    try {
                        const audioBuffer = await ttsService.generateSpeech(sText);
                        fs.writeFileSync(sFilePath, audioBuffer);
                        process.stdout.write('.');
                    } catch (err: any) {
                        console.error(`   ❌ Failed to generate audio for p_${rowId}_s_${i}:`, err.message);
                    }
                }

                sentenceData.push({
                    sentence: sText,
                    audioUrl: `/content/books/${BOOK_ID}/audio/${sFileName}`
                });
            }
            if (sentences.length > 0) console.log(''); // Newline

            // Update Analysis JSON with sentence-level audio paths
            // MERGE with existing processedAnalysis from LLM
            if (!processedAnalysis.audioPerformance) {
                processedAnalysis.audioPerformance = {};
            }
            // Overwrite sentences with actual audio paths
            // LLM returns 'sentences' too usually in audioPerformance, but it doesn't have URLs.
            // We need to preserve LLM metadata (stress, intonation) if it exists, and attach audioUrl.
            
            // If LLM returned sentences structure, try to match it?
            // Usually LLM returns an array of sentences.
            // The split 'sentences' variable above is based on regex, LLM might split differently.
            // For robust syncing, we will use our regex split as master for Audio, 
            // and attach it to the analysis object.
            
            // If LLM has its own sentence breakdown, we might have a mismatch.
            // For now, we will prefer our regex audio map.
            processedAnalysis.audioPerformance = {
                ...processedAnalysis.audioPerformance,
                sentences: sentenceData
            };
            
            const updateAnalysis = db.prepare(`UPDATE paragraphs SET analysis_json = @json WHERE id = @id`);
            updateAnalysis.run({ json: JSON.stringify(processedAnalysis), id: rowId });
        } else {
             // Save LLM results even if Audio is disabled
             const updateAnalysis = db.prepare(`UPDATE paragraphs SET analysis_json = @json WHERE id = @id`);
             updateAnalysis.run({ json: JSON.stringify(processedAnalysis), id: rowId });
        }

        count++;
        if (count % 50 === 0) console.log(`Processed ${count} items...`);
    }
    
    // --- Post-Processing: Chapter Analysis ---
    console.log(`\n📚 Starting Chapter Analysis for ${distinctChapters.size} chapters...`);
    
    for (const chapterTitle of distinctChapters) {
        console.log(`   Analysing ${chapterTitle}...`);
        try {
            // Get all paragraphs for this chapter
            const paras = db.prepare(`
                SELECT text, analysis_json 
                FROM paragraphs 
                WHERE book_id = ? AND chapter = ? 
                ORDER BY id ASC
            `).all(BOOK_ID, chapterTitle);

            if (paras.length === 0) continue;

            const chapterText = paras.map((p: any) => p.text).join('\n\n');
            const paraAnalyses = paras
                .map((p: any) => p.analysis_json ? JSON.parse(p.analysis_json) : null)
                .filter(a => a !== null);

            // Run LLM Chapter Analysis
            // Note: We need a large context window model or simple summary. 
            // LLMService.analyzeChapter handles truncation/sampling internally.
            const chapterAnalysis = await llmService.analyzeChapter(chapterText, paraAnalyses);

            // Insert into chapters table
            db.prepare(`
                INSERT INTO chapters (book_id, title, analysis_json)
                VALUES (@book_id, @title, @json)
            `).run({
                book_id: BOOK_ID,
                title: chapterTitle,
                json: JSON.stringify(chapterAnalysis)
            });

            console.log(`   ✅ Analysis saved for ${chapterTitle}`);

        } catch (chapterErr) {
            console.error(`   ❌ Failed to analyze chapter ${chapterTitle}:`, chapterErr);
        }
    }

    console.log("Done.");
}

main().catch(console.error);
