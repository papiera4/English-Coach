import React, { useState, useRef } from 'react';
import { Play, Pause, Loader2, Volume2 } from 'lucide-react';

export default function SimpleTTSButton({ text, accentMode, mood }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const audioRef = useRef(null);

  const handlePlay = async (e) => {
    e.stopPropagation();

    // If already playing, stop
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      return;
    }

    // If audio exists, play it
    if (audioUrl) {
      if (audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    // Otherwise fetch
    setIsLoading(true);
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text, 
          accentMode, 
          mood: mood || '' 
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        const audio = new Audio(url);
        audioRef.current = audio;
        
        audio.onended = () => setIsPlaying(false);
        audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('TTS Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePlay}
      className={`
        inline-flex items-center justify-center
        w-8 h-8 rounded-full flex-shrink-0
        transition-all duration-200
        ${isPlaying 
          ? 'bg-british-gold text-white shadow-md scale-110' 
          : 'bg-british-navy bg-opacity-5 text-british-navy hover:bg-british-gold hover:text-white'
        }
      `}
      title="Play this sentence"
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isPlaying ? (
        <Pause className="w-4 h-4 fill-current" />
      ) : (
        <Play className="w-4 h-4 fill-current ml-0.5" />
      )}
    </button>
  );
}
