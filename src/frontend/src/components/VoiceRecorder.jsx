import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Mic, Square, Loader2, Award, Play, CheckCircle, AlertCircle } from 'lucide-react';

export default function VoiceRecorder({ referenceText }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [hoveredWord, setHoveredWord] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const mediaRecorderRef = useRef(null);
  const containerRef = useRef(null);
  const chunksRef = useRef([]);

  const handleWordEnter = (e, word) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const tooltipWidth = 256; 
      
      // Calculate centered position relative to viewport
      let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
      
      // Viewport boundaries
      if (left < 10) left = 10;
      if (left + tooltipWidth > window.innerWidth - 10) {
          left = window.innerWidth - tooltipWidth - 10;
      }
      
      setHoverPosition({
          x: left,
          y: rect.top - 10 // 10px above the word
      });
      setHoveredWord(word);
  };

  const handleWordLeave = () => {
      setHoveredWord(null);
  };

  const startRecording = async () => {
    setError(null);
    setResult(null);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Try to use a mimeType that produces decent quality, though backend handles conversion.
      // Chrome defaults to webm/opus.
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' }); 
        await sendAudio(blob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access validation failed", err);
      setError("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudio = async (blob) => {
    setIsProcessing(true);
    
    // Create FormData
    const formData = new FormData();
    // Using .wav extension hint, though browser blob is likely webm. 
    // Backend ffmpeg will just read the input regardless of extension often, or we rely on ffmpeg auto-detection.
    // It's safer to name it .webm if it is webm.
    formData.append('audio', blob, 'recording.webm');
    formData.append('referenceText', referenceText);

    try {
      const response = await fetch('/api/assess-pronunciation', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Assessment failed');
      }

      setResult(data.analysis);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const scoreColor = (score) => {
      if (score >= 90) return 'text-green-600';
      if (score >= 70) return 'text-yellow-600';
      return 'text-red-600';
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-serif text-british-navy font-bold flex items-center gap-2">
           <Mic size={18} /> Pronunciation Check
        </h4>
        
        {isProcessing ? (
           <span className="flex items-center text-xs text-british-gold animate-pulse">
             <Loader2 size={14} className="animate-spin mr-1"/> Analyzing...
           </span>
        ) : (
          !isRecording ? (
            <button 
                onClick={startRecording}
                className="flex items-center gap-2 px-3 py-1.5 bg-british-navy text-white text-xs rounded hover:bg-opacity-90 transition"
            >
                <div className="w-2 h-2 rounded-full bg-red-500"></div> Record
            </button>
          ) : (
            <button 
                onClick={stopRecording}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white text-xs rounded hover:bg-opacity-90 transition animate-pulse"
            >
                <Square size={12} fill="currentColor" /> Stop
            </button>
          )
        )}
      </div>
      
      {error && (
        <div className="text-red-600 text-xs mb-3 flex items-center gap-1">
            <AlertCircle size={14} /> {error}
        </div>
      )}

      {result && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-white p-3 rounded shadow-sm gap-2 flex flex-col">
                <div className="grid grid-cols-5 gap-2 text-center border-b pb-2 border-gray-100">
                    <div>
                        <div className="text-[10px] uppercase text-gray-500">Accuracy</div>
                        <div className={`font-bold ${scoreColor(result.accuracyScore)}`}>{result.accuracyScore.toFixed(0)}</div>
                    </div>
                    <div>
                        <div className="text-[10px] uppercase text-gray-500">Fluency</div>
                        <div className={`font-bold ${scoreColor(result.fluencyScore)}`}>{result.fluencyScore.toFixed(0)}</div>
                    </div>
                    <div>
                        <div className="text-[10px] uppercase text-gray-500">Prosody</div>
                        <div className={`font-bold ${scoreColor(result.prosodyScore)}`}>{result.prosodyScore.toFixed(0)}</div>
                    </div>
                    <div>
                        <div className="text-[10px] uppercase text-gray-500">Complete</div>
                        <div className={`font-bold ${scoreColor(result.completenessScore || 0)}`}>{(result.completenessScore || 0).toFixed(0)}</div>
                    </div>
                    <div>
                        <div className="text-[10px] uppercase text-gray-500">Total</div>
                        <div className={`font-bold ${scoreColor(result.pronunciationScore)}`}>{result.pronunciationScore.toFixed(0)}</div>
                    </div>
                </div>

                {(result.vocabularyScore !== undefined) && (
                <div className="grid grid-cols-3 gap-2 text-center pt-1 border-b pb-2 border-gray-100">
                    <div>
                        <div className="text-[10px] uppercase text-gray-400">Vocab</div>
                        <div className={`font-bold text-sm ${scoreColor(result.vocabularyScore)}`}>{result.vocabularyScore.toFixed(0)}</div>
                    </div>
                    <div>
                        <div className="text-[10px] uppercase text-gray-400">Grammar</div>
                        <div className={`font-bold text-sm ${scoreColor(result.grammarScore)}`}>{result.grammarScore.toFixed(0)}</div>
                    </div>
                    <div>
                        <div className="text-[10px] uppercase text-gray-400">Topic</div>
                        <div className={`font-bold text-sm ${scoreColor(result.topicScore)}`}>{result.topicScore.toFixed(0)}</div>
                    </div>
                </div>
                )}
            </div>

            {/* Phoneme/Word Breakdown */}
            <div ref={containerRef} className="flex flex-wrap gap-x-2 gap-y-3 text-sm bg-white p-3 rounded border border-gray-100 leading-relaxed items-end relative">
              {result.words.map((word, idx) => {
                 let colorClass = 'text-gray-800';
                 let decoration = '';
                 let bgClass = '';
                 
                 // ErrorType: 'None', 'Omission', 'Insertion', 'Mispronunciation'
                 const errorType = word.PronunciationAssessment?.ErrorType || word.ErrorType; // Fallback if flattened
                 const score = word.PronunciationAssessment?.AccuracyScore ?? word.AccuracyScore;

                 if (errorType === 'Omission') {
                     colorClass = 'text-gray-300';
                     decoration = 'line-through';
                 } else {
                     // Color based on score for everything else
                     if (score >= 90) {
                         colorClass = 'text-emerald-600';
                     } else if (score >= 80) {
                         colorClass = 'text-green-600';
                     } else if (score >= 60) {
                         colorClass = 'text-yellow-600';
                     } else {
                         colorClass = 'text-red-500';
                     }

                     // Add distinguishing styles for errors
                     if (errorType === 'Insertion') {
                         colorClass += ' italic';
                         bgClass = 'bg-purple-50'; // Optional slight bg to hint insertion
                     } else if (errorType === 'Mispronunciation') {
                         decoration = 'underline decoration-wavy decoration-red-200';
                     }
                 }

                 return (
                    <span 
                        key={idx} 
                        className={`cursor-help px-1 rounded ${colorClass} ${bgClass}`}
                        onMouseEnter={(e) => handleWordEnter(e, word)}
                        onMouseLeave={handleWordLeave}
                    >
                       <span className={decoration}>{word.Display || (word.Word + (word.Punctuation || ''))}</span>
                    </span>
                 );
              })}

              {/* Floating Tooltip using Portal */}
              {hoveredWord && createPortal(
                 <div 
                    className="fixed z-[9999] w-64 p-3 bg-gray-900 text-white text-xs rounded shadow-lg transition-opacity duration-200 pointer-events-none"
                    style={{ 
                        left: hoverPosition.x, 
                        top: hoverPosition.y,
                        transform: 'translateY(-100%)'
                    }}
                 >
                      <div className="flex justify-between items-center mb-2 border-b border-gray-700 pb-1">
                        <span className="font-bold">{hoveredWord.Word}</span>
                        <span className={(hoveredWord.PronunciationAssessment?.ErrorType || hoveredWord.ErrorType) === 'Mispronunciation' ? 'text-red-300' : 'text-green-300'}>
                            {(hoveredWord.PronunciationAssessment?.ErrorType || hoveredWord.ErrorType) !== "None" ? (hoveredWord.PronunciationAssessment?.ErrorType || hoveredWord.ErrorType) : `Score: ${hoveredWord.PronunciationAssessment?.AccuracyScore ?? hoveredWord.AccuracyScore}`}
                        </span>
                      </div>
                      
                      {/* Syllables */}
                      {hoveredWord.Syllables && (
                        <div className="mb-2">
                            <span className="text-gray-400 text-[10px] uppercase">Syllables</span>
                            <div className="flex gap-1 mt-0.5">
                                {hoveredWord.Syllables.map((syl, sIdx) => (
                                    <span key={sIdx} className={`px-1 rounded ${syl.PronunciationAssessment.AccuracyScore < 60 ? 'bg-red-900 text-red-200' : 'bg-gray-700'}`}>
                                        {syl.Syllable} <span className="text-[9px] opacity-70">({syl.PronunciationAssessment.AccuracyScore})</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                      )}

                      {/* Phonemes */}
                      {hoveredWord.Phonemes && (
                         <div>
                            <span className="text-gray-400 text-[10px] uppercase">Phonemes</span>
                            <div className="flex gap-1 flex-wrap mt-0.5 font-mono">
                               {hoveredWord.Phonemes.map((p, pIdx) => (
                                   <div key={pIdx} className="flex flex-col items-center">
                                       <span className={p.PronunciationAssessment.AccuracyScore < 60 ? 'text-red-400' : 'text-green-400'}>
                                           {p.Phoneme}
                                       </span>
                                       <span className="text-[8px] text-gray-500">
                                           {p.PronunciationAssessment.AccuracyScore}
                                       </span>
                                   </div>
                               ))}
                            </div>
                         </div>
                      )}
                 </div>,
                 document.body
              )}
            </div>
        </div>
      )}
    </div>
  );
}
