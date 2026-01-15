import React, { useState, useEffect } from 'react';
import { Book, FileText, ChevronRight, Library, BookOpen } from 'lucide-react';

export default function BookBrowser({ onSelectContent, onReadChapter }) {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [paragraphs, setParagraphs] = useState([]);
  const [chapterAnalysis, setChapterAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load books on mount
  useEffect(() => {
    fetch('/api/books')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
            setBooks(data.books);
            // Auto-select 1984 if available for convenience
            if (data.books.includes('1984')) {
                handleBookSelect('1984');
            }
        }
      })
      .catch(console.error);
  }, []);

  // Load chapters when book selected
  const handleBookSelect = async (bookId) => {
    // If clicking same book, toggle it off? No, just keep it.
    if (selectedBook === bookId) return;

    setSelectedBook(bookId);
    setSelectedChapter(null);
    setParagraphs([]);
    setLoading(true);
    try {
      const res = await fetch(`/api/books/${bookId}/chapters`);
      const data = await res.json();
      if (data.success) setChapters(data.chapters);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  // Load paragraphs when chapter selected
  const handleChapterSelect = async (chapterId) => {
    if (selectedChapter === chapterId) return; // Avoid reload
    
    setSelectedChapter(chapterId);
    setLoading(true);
    try {
      const res = await fetch(`/api/books/${selectedBook}/chapters/${chapterId}/paragraphs`);
      const data = await res.json();
      if (data.success) {
        setParagraphs(data.paragraphs);
        setChapterAnalysis(data.chapterAnalysis);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleParagraphClick = (p) => {
    onSelectContent(p);
  };

  return (
    <div className="flex flex-col h-full bg-white bg-opacity-60 backdrop-blur-md rounded-xl border border-white border-opacity-40 shadow-sm overflow-hidden">
      {/* Header Section */}
      <div className="p-4 border-b border-british-navy border-opacity-10 bg-white bg-opacity-50">
        <h2 className="text-lg font-serif font-bold text-british-navy flex items-center gap-2">
          <Library className="w-5 h-5 text-british-gold" /> 
          Literary Archive
        </h2>
        
        {/* Book Tabs */}
        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
          {books.length === 0 && <span className="text-xs text-gray-500 italic">No books found</span>}
          {books.map(book => (
            <button
              key={book}
              onClick={() => handleBookSelect(book)}
              className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full whitespace-nowrap transition-all border ${
                selectedBook === book 
                ? 'bg-british-navy text-white border-british-navy shadow-md' 
                : 'bg-white text-british-navy border-british-navy border-opacity-20 hover:border-opacity-50'
              }`}
            >
              {book}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area - Split View */}
      <div className="flex-1 flex min-h-0 divide-x divide-british-navy divide-opacity-10">
        
        {/* Left Column: Chapters */}
        <div className="w-1/3 min-w-[120px] bg-british-cream bg-opacity-30 overflow-y-auto custom-scrollbar">
            {!selectedBook ? (
                <div className="p-6 text-center opacity-40">
                    <BookOpen className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-xs">Select a book</p>
                </div>
            ) : (
                <div className="py-2">
                    <h3 className="px-3 py-2 text-[10px] font-bold text-british-navy uppercase opacity-50 sticky top-0 bg-british-cream/90 backdrop-blur-sm z-10">
                        Index
                    </h3>
                    <ul>
                    {chapters.map(chap => {
                        const label = chap.replace('chapter_', '');
                        return (
                            <li key={chap}>
                                <button
                                key={chap}
                                onClick={() => handleChapterSelect(chap)}
                                className={`w-full text-left px-4 py-3 text-sm font-serif border-l-4 transition-all ${
                                    selectedChapter === chap
                                    ? 'bg-white border-british-gold text-british-navy font-semibold shadow-sm'
                                    : 'border-transparent text-british-navy text-opacity-70 hover:bg-white/50 hover:text-british-navy'
                                }`}
                                >
                                <span className="block truncate">Chapter {label}</span>
                                </button>
                            </li>
                        );
                    })}
                    </ul>
                </div>
            )}
        </div>

        {/* Right Column: Passages */}
        <div className="flex-1 bg-white/40 overflow-y-auto custom-scrollbar p-0">
            {!selectedChapter ? (
                <div className="h-full flex flex-col items-center justify-center text-british-navy text-opacity-40 p-6 text-center">
                    <FileText className="w-8 h-8 mb-2" />
                    <p className="text-xs">Select a chapter to view passages</p>
                </div>
            ) : (
                <div>
                     <div className="px-4 py-3 sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-british-navy/5 flex justify-between items-center">
                        <h3 className="text-[10px] font-bold text-british-navy uppercase opacity-50">
                            Passages
                        </h3>
                        <button 
                            onClick={() => onReadChapter && onReadChapter(paragraphs, chapterAnalysis)}
                            className="text-[10px] bg-british-gold text-white px-2 py-1 rounded hover:bg-opacity-90 transition-all font-semibold uppercase tracking-wider"
                        >
                            Read Full Chapter
                        </button>
                    </div>
                    <div className="divide-y divide-british-navy divide-opacity-5">
                    {loading && paragraphs.length === 0 ? (
                        <div className="p-8 text-center text-british-navy text-opacity-50 text-sm italic">
                            Retreiving analysis...
                        </div>
                    ) : (
                        paragraphs.map(p => (
                        <div 
                            key={p.id}
                            onClick={() => handleParagraphClick(p)}
                            className="group p-4 cursor-pointer hover:bg-white transition-colors hover:shadow-sm"
                        >
                            <div className="flex justify-between items-baseline mb-2">
                                <span className="text-xs font-bold text-british-gold bg-british-gold/10 px-1.5 py-0.5 rounded">
                                    § {p.id}
                                </span>
                            </div>
                            <p className="text-sm text-british-navy leading-relaxed font-serif text-opacity-80 group-hover:text-opacity-100 line-clamp-3">
                            {p.text}
                            </p>
                            <div className="mt-2 text-[10px] text-british-navy/40 font-medium uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                View Analysis →
                            </div>
                        </div>
                        ))
                    )}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

