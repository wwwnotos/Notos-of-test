
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Loader2 } from 'lucide-react';

interface AudioPlayerProps {
  duration: number; // Expected duration in seconds
  src?: string; // The audio source URL
  colorClass?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ duration, src, colorClass = 'text-gray-800' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Fixed number of bars for visual consistency
  const BAR_COUNT = 24;
  // Generate static heights
  const [baseHeights] = useState(() => 
    Array.from({ length: BAR_COUNT }, () => Math.floor(Math.random() * 12) + 4)
  );

  useEffect(() => {
    if (src) {
      const audio = new Audio(src);
      audioRef.current = audio;

      const updateTime = () => setCurrentTime(audio.currentTime);
      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
      const handleCanPlay = () => setIsLoading(false);
      const handleWaiting = () => setIsLoading(true);

      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('waiting', handleWaiting);

      return () => {
        audio.pause();
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('waiting', handleWaiting);
        audioRef.current = null;
      };
    }
  }, [src]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => console.error("Playback failed", err));
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // If we don't have a duration from prop (e.g. new recording), use actual audio duration if available
  const displayDuration = duration || (audioRef.current?.duration && isFinite(audioRef.current.duration) ? audioRef.current.duration : 0);
  const progressPercent = displayDuration > 0 ? (currentTime / displayDuration) : 0;

  return (
    <div className={`flex items-center gap-3 p-2.5 pr-4 rounded-full bg-white/10 backdrop-blur-md border border-white/10 max-w-fit transition-all duration-300 ${colorClass} hover:bg-white/20`}>
      <button 
        onClick={togglePlay}
        className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-white rounded-full shadow-sm active:scale-90 transition-transform duration-200 group"
      >
        {isLoading ? (
           <Loader2 size={14} className="text-black animate-spin" />
        ) : isPlaying ? (
          <Pause size={14} className="text-black fill-black" />
        ) : (
          <Play size={14} className="text-black ml-0.5 fill-black group-hover:scale-110 transition-transform" />
        )}
      </button>

      <div className="flex items-center gap-[2px] h-8">
        {baseHeights.map((height, i) => {
          const barPercent = i / BAR_COUNT;
          const active = barPercent < progressPercent;
          
          // Dynamic height calculation
          const currentHeight = isPlaying 
            ? Math.max(4, height + Math.sin((Date.now() / 150) + i) * 8) 
            : height;

          return (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-150 ease-in-out ${active ? 'bg-current opacity-100' : 'bg-current opacity-30'}`}
              style={{ 
                height: `${currentHeight}px`,
              }}
            />
          );
        })}
      </div>

      <span className="text-xs font-mono font-bold opacity-70 min-w-[32px] text-right tabular-nums tracking-tight">
        {formatTime(isPlaying ? currentTime : displayDuration)}
      </span>
    </div>
  );
};

export default AudioPlayer;
