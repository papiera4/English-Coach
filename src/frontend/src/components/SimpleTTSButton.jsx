import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Loader2, Volume2 } from 'lucide-react';

export default function SimpleTTSButton({ text, accentMode, mood, gender, audioUrl: propAudioUrl, autoPlay }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState(null);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const audioRef = useRef(null);

  const activeAudioUrl = propAudioUrl || generatedAudioUrl;

  const handlePlay = async (e) => {
    if (e) e.stopPropagation();

    // If already playing, stop
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      return;
    }
    
    await playAudio();
  };

  const playAudio = async () => {
      // If audio exists, play it
    if (activeAudioUrl) {
      if (!audioRef.current || (audioRef.current.src !== activeAudioUrl && !audioRef.current.src.endsWith(activeAudioUrl))) {
        const audio = new Audio(activeAudioUrl);
        audio.onended = () => setIsPlaying(false);
        audioRef.current = audio;
      }
      
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        setIsPlaying(false);
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
          mood: mood || '',
          gender: gender || 'female'
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setGeneratedAudioUrl(url);
        
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
  }

  useEffect(() => {
      if (autoPlay && !hasAutoPlayed && text) {
          setHasAutoPlayed(true);
          playAudio();
      }
  }, [autoPlay, text, hasAutoPlayed]);

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
