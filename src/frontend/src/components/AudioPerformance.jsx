import React from 'react';
import { AlertCircle, CheckCircle, TrendingUp, Volume2 } from 'lucide-react';
import SimpleTTSButton from './SimpleTTSButton';
import VoiceRecorder from './VoiceRecorder';

export default function AudioPerformance({ audio, accentMode, mood }) {
  // Guard clause for missing data
  if (!audio) return null;

  // Support both old format (single sentence) and new format (multiple sentences)
  const sentences = audio.sentences || (audio.words ? [{
    sentence: audio.sentence,
    words: audio.words,
    intonationVisual: audio.intonationVisual,
    stressPattern: audio.stressPattern
  }] : []);

  // Helper function to render stress pattern
  const renderStressPattern = (words) => {
    if (!words || words.length === 0) return null;
    
    // Calculate width needed: at least 70px per word
    const minWidth = Math.max(700, words.length * 70);
    
    return (
      <div className="w-full overflow-x-auto">
        <div style={{ minWidth: `${minWidth}px` }} className="flex justify-start gap-3 px-4 py-4">
          {words.map((wordData, idx) => (
            <div key={idx} className="flex flex-col items-center" style={{ minWidth: '60px' }}>
              <div className="text-sm text-british-navy text-opacity-60 mb-2 h-5">
                {wordData.stress === 'primary' ? '●' : wordData.stress === 'secondary' ? '◐' : '○'}
              </div>
              <div className={`text-sm text-center break-words ${wordData.stress === 'primary' ? 'font-bold text-british-gold' : wordData.stress === 'secondary' ? 'font-semibold text-british-navy' : 'text-british-navy text-opacity-60'}`}>
                {wordData.word}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Helper function to render pitch contour
  const renderPitchContour = (words) => {
    if (!words || words.length === 0) return null;
    
    // Calculate width needed: at least 80px per word
    const minWidth = Math.max(800, words.length * 80);
    
    return (
      <div className="w-full overflow-x-auto">
        <div style={{ minWidth: `${minWidth}px` }} className="flex items-end justify-start gap-2 h-48 px-4 py-4">
          {words.map((wordData, idx) => {
            const heightMap = {
              'high': 'h-32',
              'mid': 'h-20',
              'low': 'h-8',
              'rising': 'h-24',
              'falling': 'h-24'
            };
            
            const colorMap = {
              'primary': 'bg-british-gold',
              'secondary': 'bg-british-navy bg-opacity-70',
              'unstressed': 'bg-british-navy bg-opacity-30'
            };
            
            return (
              <div key={idx} className="flex flex-col items-center" style={{ minWidth: '70px' }}>
                <div className={`w-10 ${heightMap[wordData.pitch] || 'h-20'} ${colorMap[wordData.stress]} rounded-t transition-all relative group`}>
                  {wordData.pitch === 'rising' && (
                    <span className="absolute -top-3 right-0 text-british-gold text-lg leading-none">↗</span>
                  )}
                  {wordData.pitch === 'falling' && (
                    <span className="absolute -top-3 right-0 text-british-navy text-lg leading-none">↘</span>
                  )}
                </div>
                <div className="text-xs text-center mt-2 w-full break-words text-british-navy">
                  {wordData.word}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Multiple Sentences Analysis */}
      {sentences.length > 0 && sentences.map((sentenceData, sentenceIdx) => (
        <div key={sentenceIdx} className="border-l-4 border-british-gold pl-4 space-y-4">
          {/* Sentence Display */}
          <div className="bg-white rounded-lg p-4 border border-british-navy border-opacity-10">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-british-gold bg-british-gold bg-opacity-10 px-2 py-1 rounded">
                {sentenceIdx + 1}
              </span>
              <p className="text-lg text-british-navy italic font-serif flex-1">
                "{sentenceData.sentence}"
              </p>
              <SimpleTTSButton 
                text={sentenceData.sentence} 
                accentMode={accentMode}
                mood={mood}
              />
            </div>
          </div>

          {/* Stress Pattern Visualization */}
          {sentenceData.words && (
            <div className="bg-british-gold bg-opacity-10 rounded-lg p-4">
              <h4 className="font-semibold text-british-navy mb-3 flex items-center gap-2 text-sm">
                <Volume2 className="w-4 h-4" />
                Stress Pattern (● Primary ◐ Secondary ○ Unstressed)
              </h4>
              <div className="bg-white rounded-lg overflow-hidden">
                {renderStressPattern(sentenceData.words)}
              </div>
              {sentenceData.stressPattern && (
                <div className="mt-3 text-sm text-british-navy text-opacity-70 font-mono text-center px-4">
                  {sentenceData.stressPattern}
                </div>
              )}
            </div>
          )}

          {/* Pitch Contour Visualization */}
          {sentenceData.words && (
            <div className="bg-british-navy bg-opacity-5 rounded-lg p-4">
              <h4 className="font-semibold text-british-navy mb-3 flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4" />
                Intonation Contour (Pitch Movement)
              </h4>
              <div className="bg-white rounded-lg overflow-x-auto border border-british-navy border-opacity-10">
                {renderPitchContour(sentenceData.words)}
              </div>
              {sentenceData.intonationVisual && (
                <div className="mt-3 bg-british-navy bg-opacity-5 rounded p-3 overflow-x-auto">
                  <p className="text-sm text-british-navy font-mono whitespace-nowrap">{sentenceData.intonationVisual}</p>
                </div>
              )}
            </div>
          )}
          
          {/* IPA Transcription per sentence */}
          {sentenceData.ipaTranscription && (
            <div className="bg-british-navy bg-opacity-5 rounded-lg p-4">
              <h4 className="font-semibold text-british-navy mb-2 flex items-center gap-2 text-sm">
                <span className="font-serif italic text-lg">/ /</span>
                IPA Transcription
              </h4>
              <div className="bg-white rounded p-3 font-mono text-sm text-british-navy">
                {sentenceData.ipaTranscription}
              </div>
            </div>
          )}

          {/* Voice Recorder Integration */}
          <VoiceRecorder referenceText={sentenceData.sentence} />
        </div>
      ))}

      {/* Accent Mode Info */}
      {sentences.length > 0 && (
        <div className="bg-british-navy bg-opacity-5 rounded-lg p-3">
          <p className="text-xs text-british-navy text-opacity-60">
            {accentMode === 'modern-rp' 
              ? '🇬🇧 Modern RP: Note the steep "High Fall" (↘) and distinct stress steps'
              : '🇺🇸 GenAm: Notice the smoother "Glide" and flatter staircase pattern'}
          </p>
        </div>
      )}
    </div>
  );
}
