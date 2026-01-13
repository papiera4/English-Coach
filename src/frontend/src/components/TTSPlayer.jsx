import React, { useState, useEffect } from 'react';
import { Volume2, Loader2, Play, Pause } from 'lucide-react';

export default function TTSPlayer({ text, accentMode, mood, onSentencesLoaded }) {
  const [sentences, setSentences] = useState([]);
  const [audioUrls, setAudioUrls] = useState({});
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [audioElements] = useState({});

  // Split text into sentences on mount
  useEffect(() => {
    const sentenceRegex = /[^.!?]*[.!?]+/g;
    const matches = text.match(sentenceRegex) || [];
    const cleaned = matches.map(s => s.trim()).filter(s => s.length > 0);
    setSentences(cleaned);
    // Reset state when text changes
    setAudioUrls({});
  }, [text]);

  const generateSentenceAudio = async (index) => {
    if (audioUrls[index]) {
      playSentence(index);
      return;
    }

    setLoading(true);
    const sentence = sentences[index];
    
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: sentence, 
          accentMode,
          mood: mood || '' 
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrls(prev => ({ ...prev, [index]: url }));
        // Play immediately after generating
        playSentence(index, url);
      }
    } catch (error) {
      console.error(`Failed to generate audio for sentence ${index}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const playSentence = (index, url = null) => {
    // Stop any currently playing audio
    Object.values(audioElements).forEach(audio => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    const audioUrl = url || audioUrls[index];
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audioElements[index] = audio;
    setCurrentSentenceIndex(index);

    audio.onended = () => {
      setCurrentSentenceIndex(null);
      // Auto-play next sentence LOGIC REMOVED as per request for individual playback
    };

    audio.play();
  };

  const pauseAll = () => {
    Object.values(audioElements).forEach(audio => {
      if (audio) audio.pause();
    });
    setCurrentSentenceIndex(null);
  };

  return (
    <div className="bg-white rounded-lg p-4 border-l-4 border-british-gold">
      <div className="flex items-center justify-between mb-3 border-b pb-2">
        <div className="flex items-center gap-2 text-xs">
          <Volume2 className="w-4 h-4 text-british-gold" />
          <span className="text-gray-600 font-semibold font-serif">Original Text</span>
        </div>
      </div>
      
      <div className="text-lg font-serif text-british-navy leading-relaxed text-justify">
        {sentences.map((sentence, index) => {
          const isPlaying = currentSentenceIndex === index;
          const hasAudio = !!audioUrls[index];
          const isLoadingThis = loading && currentSentenceIndex === index && !hasAudio;

          return (
            <span key={index} className="relative inline mr-1">
              <span
                className={`
                  rounded px-1 -mx-1 transition-colors duration-200
                  ${isPlaying ? 'bg-british-gold bg-opacity-20 text-british-gold font-medium' : ''}
                `}
              >
                {sentence}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  generateSentenceAudio(index);
                }}
                className={`
                  inline-flex items-center justify-center
                  ml-1 w-5 h-5 rounded-full 
                  ${hasAudio ? 'text-british-gold hover:bg-british-gold hover:text-white' : 'text-gray-300 hover:text-british-gold'}
                  align-middle transition-all cursor-pointer
                `}
                title="Play Audio"
                disabled={loading}
              >
                {isPlaying ? (
                  <Volume2 className="w-3 h-3 animate-pulse" />
                ) : loading && !hasAudio && currentSentenceIndex === index ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Play className="w-3 h-3 fill-current" />
                )}
              </button>
            </span>
          );
        })}
      </div>
    </div>
  );
}
