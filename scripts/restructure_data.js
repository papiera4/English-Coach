const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../data');
const BOOK = '1984';
const BOOK_DIR = path.join(ROOT, 'books', BOOK);

// Helper to move
function move(src, dest) {
    if (fs.existsSync(src)) {
        const destDir = path.dirname(dest);
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
        fs.renameSync(src, dest);
        console.log(`Moved ${src} -> ${dest}`);
    } else {
        console.log(`Source not found: ${src}`);
    }
}

// 1. Ensure Book Dir
if (!fs.existsSync(BOOK_DIR)) fs.mkdirSync(BOOK_DIR, { recursive: true });

// 2. Move Source
move(
    path.join(ROOT, 'origin', `${BOOK}.txt`),
    path.join(BOOK_DIR, 'source.txt')
);

// 3. Move JSONL
move(
    path.join(ROOT, 'processed', `${BOOK}.jsonl`),
    path.join(BOOK_DIR, 'segments.jsonl')
);

// 4. Move Audio Folder content
const audioSrcDir = path.join(ROOT, 'processed', 'audio', BOOK);
const audioDestDir = path.join(BOOK_DIR, 'audio');
if (fs.existsSync(audioSrcDir)) {
    if (!fs.existsSync(audioDestDir)) fs.mkdirSync(audioDestDir, { recursive: true });
    
    const files = fs.readdirSync(audioSrcDir);
    files.forEach(f => {
        fs.renameSync(path.join(audioSrcDir, f), path.join(audioDestDir, f));
    });
    console.log(`Moved ${files.length} audio files`);
    
    // Try remove empty dir
    try { fs.rmdirSync(audioSrcDir); } catch(e){}
}

// 5. Move DB
move(
    path.join(ROOT, 'processed', 'english_coach.db'),
    path.join(ROOT, 'english_coach.db')
);
