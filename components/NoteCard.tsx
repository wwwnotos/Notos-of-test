
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Heart, Share2, MessageCircle, Music, Type, Moon, Coffee, Sun, Star, Play, Plane, Cpu, Newspaper, Feather, Mic, Zap, Globe, Camera, Palette, Code, Flame, Smile, Loader2 } from 'lucide-react';
import { Note, NoteType } from '../types';
import AudioPlayer from './AudioPlayer';
import html2canvas from 'html2canvas';
import { getRelativeTime } from '../constants';

interface NoteCardProps {
  note?: Note; // Optional for Skeleton mode
  onLike?: (id: string) => void;
  onComment?: (id: string) => void;
  onUserClick?: (userId: string) => void;
  onTagClick?: (tag: string) => void;
  isLoading?: boolean;
  lang?: 'en' | 'ar';
}

const ICON_MAP: Record<string, React.ElementType> = {
  'Music': Music, 'Type': Type, 'Moon': Moon, 'Coffee': Coffee, 'Sun': Sun, 'Star': Star,
  'Plane': Plane, 'Cpu': Cpu, 'Newspaper': Newspaper, 'Feather': Feather, 'Mic': Mic,
  'Zap': Zap, 'Globe': Globe, 'Camera': Camera, 'Palette': Palette, 'Code': Code,
  'Flame': Flame, 'Smile': Smile
};

const NoteCard: React.FC<NoteCardProps> = ({ note, onLike, onComment, onUserClick, onTagClick, isLoading = false, lang = 'en' }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [lastTap, setLastTap] = useState<number>(0);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);

  // Skeleton Loader
  if (isLoading || !note) {
      return (
          <div className="w-full rounded-[2rem] p-6 mb-5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-zinc-800 animate-pulse" />
                      <div className="space-y-2">
                          <div className="w-24 h-3 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
                          <div className="w-16 h-2 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
                      </div>
                  </div>
                  <div className="w-6 h-6 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
              </div>
              <div className="space-y-3 mb-6">
                  <div className="w-full h-3 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
                  <div className="w-5/6 h-3 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
                  <div className="w-4/6 h-3 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
              </div>
          </div>
      );
  }

  const Icon = note.style.icon ? ICON_MAP[note.style.icon] : null;

  // Effect to trigger heart animation when liked status changes
  useEffect(() => {
    if (note.isLikedByCurrentUser) {
        setIsAnimating(true);
        const timer = setTimeout(() => setIsAnimating(false), 400);
        return () => clearTimeout(timer);
    }
  }, [note.isLikedByCurrentUser]);

  const handleDoubleTap = (e: React.MouseEvent) => {
      const now = Date.now();
      if (now - lastTap < 300) {
          // Double tap detected
          e.preventDefault();
          if (!note.isLikedByCurrentUser && onLike) {
              onLike(note.id);
          }
          setShowDoubleTapHeart(true);
          setTimeout(() => setShowDoubleTapHeart(false), 800);
      }
      setLastTap(now);
  };

  const handleShare = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isSharing || !cardRef.current) return;
      setIsSharing(true);
      try {
          await new Promise(resolve => requestAnimationFrame(resolve));
          const canvas = await html2canvas(cardRef.current, {
              scale: 3,
              useCORS: true,
              backgroundColor: null,
              logging: false,
              ignoreElements: (element) => element.classList.contains('no-capture')
          });
          canvas.toBlob(async (blob) => {
              if (!blob) { setIsSharing(false); return; }
              const file = new File([blob], `notos-${note.id}.png`, { type: 'image/png' });
              if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                  try {
                      await navigator.share({ files: [file], title: `Note by ${note.author.displayName}`, text: 'Shared via Notos' });
                  } catch (err) { console.log('Share cancelled'); }
              } else {
                  const link = document.createElement('a');
                  link.download = `notos-${note.id}.png`;
                  link.href = canvas.toDataURL();
                  link.click();
              }
              setIsSharing(false);
          }, 'image/png');
      } catch (error) {
          console.error('Error generating image:', error);
          setIsSharing(false);
      }
  };

  const hasExplicitText = note.style.color.includes('text-');
  const textColorClass = hasExplicitText ? '' : 'text-gray-900 dark:text-white';
  const subTextColorClass = hasExplicitText ? 'opacity-70' : 'text-gray-500 dark:text-gray-400';

  const displayContent = useMemo(() => {
      return note.content.replace(/#[\p{L}\p{N}_]+/gu, '').trim();
  }, [note.content]);

  const hasContent = displayContent.length > 0;

  return (
    <div 
        ref={cardRef}
        onClick={handleDoubleTap}
        className={`relative w-full rounded-[2rem] p-6 mb-5 transition-all shadow-sm hover:shadow-md border border-transparent select-none ${note.style.color} ${note.style.font} dark:border-white/5 overflow-hidden`}
    >
      {showDoubleTapHeart && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none animate-heart-pop">
              <Heart size={80} className="text-white drop-shadow-2xl" fill="white" />
          </div>
      )}

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={(e) => { e.stopPropagation(); onUserClick && onUserClick(note.userId); }}
        >
          <div className="relative">
              <img 
                src={note.author.avatarUrl} 
                alt={note.author.username} 
                className="w-11 h-11 rounded-full border-2 border-white/20 object-cover shadow-sm group-hover:scale-105 transition-transform"
                crossOrigin="anonymous"
              />
              {note.author.badges?.includes('verified') && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-[2px] border-2 border-white dark:border-black">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
              )}
          </div>
          <div>
            <h3 className={`text-base font-bold leading-none flex items-center gap-1 ${textColorClass}`}>
                {note.author.displayName}
            </h3>
            <span className={`text-xs font-medium mt-1 block ${subTextColorClass}`}>
                @{note.author.username} • {getRelativeTime(note.timestamp, lang as 'en' | 'ar')}
            </span>
          </div>
        </div>
        {Icon && <Icon className={`${subTextColorClass} opacity-30`} size={24} />}
      </div>

      {(hasContent) && (
        <div className="mb-5 relative z-10">
            <p className={`text-[1.1rem] leading-relaxed whitespace-pre-wrap transition-all duration-300 ${textColorClass}`}>
                {displayContent}
            </p>
        </div>
      )}

      {note.type === NoteType.AUDIO && note.audioDuration && (
        <div className="mb-5 pt-1 relative z-10">
          <AudioPlayer 
            duration={note.audioDuration} 
            src={note.audioUrl} 
            colorClass={textColorClass}
          />
        </div>
      )}

      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5 relative z-10">
          {note.tags.map((tag, idx) => (
            <button 
              key={`${tag}-${idx}`}
              onClick={(e) => { e.stopPropagation(); onTagClick && onTagClick(tag); }}
              className={`text-xs font-bold opacity-60 hover:opacity-100 transition-all hover:scale-105 px-2 py-1 rounded-lg bg-black/5 dark:bg-white/5 ${textColorClass}`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <div className={`flex items-center justify-between mt-2 pt-4 border-t border-black/5 dark:border-white/10 no-capture relative z-10`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={(e) => { e.stopPropagation(); onLike && onLike(note.id); }}
            className="flex items-center gap-2 group active:scale-90 transition-transform"
          >
            <div className={`p-2 rounded-full transition-colors duration-300 ${note.isLikedByCurrentUser ? 'bg-red-500/10' : 'bg-transparent group-hover:bg-black/5 dark:group-hover:bg-white/10'}`}>
                <Heart 
                size={22} 
                fill={note.isLikedByCurrentUser ? "currentColor" : "none"} 
                className={`transition-all duration-300 ${note.isLikedByCurrentUser ? 'text-red-500 scale-110 animate-heart-pop' : subTextColorClass}`}
                />
            </div>
            <span 
                key={note.likes} 
                className={`text-sm font-bold tabular-nums ${note.isLikedByCurrentUser ? 'text-red-500 animate-slide-up' : subTextColorClass}`}
            >
              {note.likes > 0 ? note.likes : ''}
            </span>
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); onComment && onComment(note.id); }}
            className="flex items-center gap-2 group active:scale-90 transition-transform"
          >
            <div className="p-2 rounded-full group-hover:bg-black/5 dark:group-hover:bg-white/10 transition-colors bg-transparent">
                <MessageCircle size={22} className={subTextColorClass} />
            </div>
            <span className={`text-sm font-bold tabular-nums ${subTextColorClass}`}>{note.comments.length > 0 ? note.comments.length : ''}</span>
          </button>
        </div>

        <div className="flex items-center">
          <button onClick={handleShare} disabled={isSharing} className={`p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-90 ${subTextColorClass}`}>
              {isSharing ? <Loader2 size={20} className="animate-spin"/> : <Share2 size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
