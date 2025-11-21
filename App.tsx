
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Screen, Note, User, NoteType, FontStyle, NoteColor, Comment } from './types';
import type { Notification } from './types';
import { TRANSLATIONS, DEFAULT_TRENDING_TAGS, COUNTRY_CODES, getRelativeTime } from './constants';
import { suggestTags, analyzeMood } from './services/geminiService';
import { realDb as db } from './services/database';

import Layout from './components/Layout';
import NoteCard from './components/NoteCard';
import AudioPlayer from './components/AudioPlayer';
import CommentsModal from './components/CommentsModal';
import EditProfileModal from './components/EditProfileModal';
import TutorialOverlay from './components/TutorialOverlay';
import AuthScreen from './components/AuthScreen';
import { 
  ArrowRight, Mic, X, Sparkles, 
  LogOut, Search, User as UserIcon, 
  ArrowLeft, Settings, MapPin, Moon, Sun, Heart,
  Bell, CheckCircle2,
  Plane, Cpu, Newspaper, Feather, Zap, Globe, Palette, Code, Flame, Smile, Music, Star,
  UserPlus, ChevronRight, Check, Loader2, Camera, Info, ChevronDown,
  Lock, BellRing, Shield, StopCircle, Download
} from 'lucide-react';

// --- Sound Effects Helper (Professional Tones) ---
const playSystemSound = (type: 'success' | 'refresh' | 'notification' | 'pop') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'refresh') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, now);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'notification') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now); 
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'pop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    }
  } catch (e) {
    // Ignore audio context errors
  }
};

const AVAILABLE_ICONS = [
  { id: 'Star', icon: Star, label: 'General' },
  { id: 'Feather', icon: Feather, label: 'Poetry' },
  { id: 'Mic', icon: Mic, label: 'Singing' },
  { id: 'Music', icon: Music, label: 'Music' },
  { id: 'Plane', icon: Plane, label: 'Travel' },
  { id: 'Palette', icon: Palette, label: 'Art' },
  { id: 'Code', icon: Code, label: 'Tech' },
  { id: 'Cpu', icon: Cpu, label: 'Hardware' },
  { id: 'Newspaper', icon: Newspaper, label: 'News' },
  { id: 'Flame', icon: Flame, label: 'Trending' },
  { id: 'Zap', icon: Zap, label: 'Idea' },
  { id: 'Globe', icon: Globe, label: 'World' },
];

const NOTE_STYLES = [
    { label: 'Basics', items: [
        { color: NoteColor.WHITE, name: 'Plain' },
        { color: NoteColor.DARK, name: 'Midnight' },
        { color: NoteColor.YELLOW, name: 'Sun' },
        { color: NoteColor.BLUE, name: 'Sky' },
        { color: NoteColor.ROSE, name: 'Rose' },
        { color: NoteColor.EMERALD, name: 'Life' },
        { color: NoteColor.VIOLET, name: 'Mystic' },
    ]},
    { label: 'Gradients', items: [
        { color: NoteColor.GRADIENT_SUNSET, name: 'Sunset' },
        { color: NoteColor.GRADIENT_OCEAN, name: 'Ocean' },
        { color: NoteColor.GRADIENT_MYSTIC, name: 'Aurora' },
        { color: NoteColor.GRADIENT_NATURE, name: 'Forest' },
    ]},
    { label: 'Velvet', items: [
        { color: NoteColor.VELVET_RED, name: 'Royal Red' },
        { color: NoteColor.VELVET_MIDNIGHT, name: 'Deep Space' },
        { color: NoteColor.VELVET_ROYAL, name: 'Majestic' },
    ]},
    { label: 'Glass', items: [
        { color: NoteColor.GLASS_FROST, name: 'Frost' },
        { color: NoteColor.GLASS_OBSIDIAN, name: 'Obsidian' },
    ]},
    { label: 'Canvas', items: [
        { color: NoteColor.CANVAS_WARM, name: 'Parchment' },
        { color: NoteColor.CANVAS_GREY, name: 'Concrete' },
    ]},
    { label: 'Paints', items: [
        { color: NoteColor.PAINT_TEAL, name: 'Teal' },
        { color: NoteColor.PAINT_CORAL, name: 'Coral' },
        { color: NoteColor.PAINT_MUSTARD, name: 'Mustard' },
    ]},
];

// --- Dynamic Island Component ---
interface DynamicToastProps {
    message: string;
    type: 'success' | 'notification';
    visible: boolean;
    icon?: React.ReactNode;
    subMessage?: string;
}

const DynamicIsland: React.FC<DynamicToastProps> = ({ message, type, visible, icon, subMessage }) => {
    return (
        <div 
            className={`fixed left-1/2 transform -translate-x-1/2 z-[100] bg-black/90 backdrop-blur-md text-white overflow-hidden flex items-center justify-between
                        shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] border border-white/10
                        ${visible 
                            ? 'top-4 w-[90%] max-w-[380px] h-[60px] rounded-[30px] pr-2' 
                            : 'top-4 w-[10px] max-w-[10px] h-[10px] opacity-0 rounded-full'
                        }`}
        >
            <div className={`pl-4 flex items-center gap-3 transition-all duration-300 delay-75 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <div className={`${type === 'success' ? 'text-emerald-400' : 'text-blue-400'} w-8 h-8 flex items-center justify-center rounded-full bg-white/10`}>
                    {icon || (type === 'success' ? <CheckCircle2 size={18} /> : <Bell size={18} />)}
                </div>
                <div className="flex flex-col">
                   <span className="text-[13px] font-bold tracking-wide truncate">{message}</span>
                   {subMessage && <span className="text-[11px] text-gray-400 leading-none truncate max-w-[200px]">{subMessage}</span>}
                </div>
            </div>
        </div>
    );
};

// --- Pull To Refresh ---
interface PullRefreshWrapperProps {
  children?: React.ReactNode;
  onRefresh: () => void;
  isDark?: boolean;
}

const PullRefreshWrapper: React.FC<PullRefreshWrapperProps> = ({ children, onRefresh, isDark = false }) => {
  const [refreshing, setRefreshing] = useState(false);
  const pullStartY = useRef(0);
  const [pullDistance, setPullDistance] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
      if (window.scrollY === 0) {
          pullStartY.current = e.touches[0].clientY;
      }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      if (pullStartY.current > 0) {
          const pullY = e.touches[0].clientY - pullStartY.current;
          if (pullY > 0 && window.scrollY === 0) {
              setPullDistance(Math.min(pullY, 120)); 
          }
      }
  };

  const handleTouchEnd = () => {
      if (pullDistance > 70) {
          setRefreshing(true);
          playSystemSound('refresh');
          onRefresh();
          setTimeout(() => {
              setRefreshing(false);
              setPullDistance(0);
          }, 1200);
      } else {
          setPullDistance(0);
      }
      pullStartY.current = 0;
  };

  return (
    <div 
      className="min-h-full transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ transform: `translateY(${pullDistance / 2.5}px)` }}
    >
       <div 
         className="absolute top-0 left-0 w-full flex justify-center items-start pointer-events-none"
         style={{ height: `${pullDistance}px`, opacity: Math.min(pullDistance / 70, 1), marginTop: `-${pullDistance}px` }}
       >
          <div className={`mt-4 p-2 rounded-full shadow-sm ${isDark ? 'bg-zinc-800 text-white' : 'bg-white text-black'}`}>
             {refreshing ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} className="rotate-90" />}
          </div>
       </div>
       {children}
    </div>
  );
};

// --- SplashScreen ---
const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2200);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="h-screen w-full bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 mb-6 bg-white rounded-full flex items-center justify-center animate-fade-in">
              <span className="text-black font-serif text-3xl font-bold italic">N</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight animate-slide-up mb-2 font-sans">Notos</h1>
          <p className="text-[10px] font-mono tracking-[0.3em] uppercase opacity-50 animate-slide-up delay-100">Share your echo</p>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/50 to-black z-0"></div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [screen, setScreen] = useState<Screen>(Screen.SPLASH);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [users, setUsers] = useState<User[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  // New state for dynamic trending tags
  const [trendingTags, setTrendingTags] = useState<string[]>([]);

  const [isLoadingFeed, setIsLoadingFeed] = useState(false);
  
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const t = TRANSLATIONS[lang];

  const [activeInterest, setActiveInterest] = useState<string>(''); 
  const [searchQuery, setSearchQuery] = useState('');
  const [profileActiveTab, setProfileActiveTab] = useState<'NOTES' | 'LIKES'>('NOTES');
  
  const [toast, setToast] = useState<{ message: string, subMessage?: string, type: 'success' | 'notification', visible: boolean, icon?: React.ReactNode }>({
      message: '', type: 'success', visible: false
  });

  // View States
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [activeCommentNoteId, setActiveCommentNoteId] = useState<string | null>(null);
  const [followListType, setFollowListType] = useState<'FOLLOWERS' | 'FOLLOWING' | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // Create Note State
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteAudioBlob, setNewNoteAudioBlob] = useState<Blob | null>(null);
  const [newNoteAudioUrl, setNewNoteAudioUrl] = useState<string | null>(null); 
  const [newNoteDuration, setNewNoteDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [activeStyle, setActiveStyle] = useState({ font: FontStyle.SANS, color: NoteColor.WHITE, icon: 'Star' });
  const [isPolishing, setIsPolishing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [isAnalyzingMood, setIsAnalyzingMood] = useState(false);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const typingIntervalRef = useRef<any>(null);
  const moodTimeoutRef = useRef<any>(null);
  const ghostTimerRef = useRef<any>(null); // Ref for the ghost interaction timer
  
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
      setActiveInterest(t.forYou);
  }, [t.forYou]);

  // --- Ghost Interaction Simulation ---
  useEffect(() => {
      if (!currentUser) {
          if (ghostTimerRef.current) clearInterval(ghostTimerRef.current);
          return;
      }
  }, [currentUser]);

  // Auto-analyze mood on typing pause
  useEffect(() => {
      if (screen !== Screen.CREATE || !newNoteContent) return;
      if (moodTimeoutRef.current) clearTimeout(moodTimeoutRef.current);

      moodTimeoutRef.current = setTimeout(async () => {
          if (newNoteContent.length > 10) {
              setIsAnalyzingMood(true);
              const result = await analyzeMood(newNoteContent);
              setIsAnalyzingMood(false);
              
              if (result) {
                   // Map returned strings to Enums
                   const colorMap: Record<string, NoteColor> = {
                       'white': NoteColor.WHITE, 'yellow': NoteColor.YELLOW, 'blue': NoteColor.BLUE,
                       'rose': NoteColor.ROSE, 'emerald': NoteColor.EMERALD, 'violet': NoteColor.VIOLET, 'dark': NoteColor.DARK
                   };
                   if (colorMap[result.color]) {
                       setActiveStyle(prev => ({ ...prev, color: colorMap[result.color], icon: result.icon }));
                   }
              }
          }
      }, 1500); // Analyze after 1.5s of no typing

      return () => clearTimeout(moodTimeoutRef.current);
  }, [newNoteContent, screen]);

  // Check for tutorial
  useEffect(() => {
    if (currentUser && currentUser.hasSeenTutorial === false && screen !== Screen.AUTH) {
        // Small delay to ensure UI is ready
        const timer = setTimeout(() => setIsTutorialOpen(true), 1000);
        return () => clearTimeout(timer);
    }
  }, [currentUser, screen]);

  const categories = useMemo(() => {
    const tagsToShow = trendingTags.length > 0 ? trendingTags : DEFAULT_TRENDING_TAGS.slice(0, 5);
    return [t.forYou, t.trendingCat, t.voice, ...tagsToShow];
  }, [trendingTags, t]);

  // --- Computed properties for Discovery ---
  const filteredDiscoverUsers = useMemo(() => {
      if (!searchQuery) return users.filter(u => u.id !== currentUser?.id).slice(0, 5);
      const lowerQ = searchQuery.toLowerCase();
      return users.filter(u => 
          u.id !== currentUser?.id && 
          (u.username.toLowerCase().includes(lowerQ) || u.displayName.toLowerCase().includes(lowerQ))
      );
  }, [users, currentUser, searchQuery]);

  const filteredDiscoverNotes = useMemo(() => {
      if (!searchQuery) return [];
      const lowerQ = searchQuery.toLowerCase();
      return notes.filter(n => 
          n.content.toLowerCase().includes(lowerQ) || 
          n.tags.some(t => t.toLowerCase().includes(lowerQ))
      );
  }, [notes, searchQuery]);

  const showToast = (message: string, type: 'success' | 'notification' = 'success', icon?: React.ReactNode, subMessage?: string) => {
      setToast({ message, type, visible: true, icon, subMessage });
      playSystemSound(type === 'success' ? 'success' : 'notification');
      setTimeout(() => {
          setToast(prev => ({ ...prev, visible: false }));
      }, 4000);
  };

  const refreshData = async (specificUser?: User) => {
      // If specific user is passed (silent update), don't set full loading state
      if (!specificUser) setIsLoadingFeed(true);
      try {
        const allUsers = await db.getAllUsers();
        const allNotes = await db.getNotes();
        
        // Fetch real-time trending tags
        const tags = await db.getTrendingTags(10);
        setTrendingTags(tags);

        const currentUserToCheck = specificUser || currentUser;
        
        const processedNotes = allNotes.map((n) => {
            const likedBy = n.likedBy || [];
            const isLiked = currentUserToCheck ? likedBy.includes(currentUserToCheck.id) : false;
            const processedComments = (n.comments || []).map((c) => ({
                ...c,
                isLikedByCurrentUser: currentUserToCheck && c.likedBy ? c.likedBy.includes(currentUserToCheck.id) : false
            }));
            return { ...n, isLikedByCurrentUser: isLiked, comments: processedComments };
        });
        
        setUsers(allUsers);
        setNotes(processedNotes);

        if (currentUserToCheck) {
            const notifs = await db.getNotifications(currentUserToCheck.id);
            setNotifications(notifs);
            
            // Keep current user updated (e.g. follower counts)
            const updatedMe = allUsers.find(u => u.id === currentUserToCheck.id);
            if (updatedMe) setCurrentUser(updatedMe);
        }
      } catch (error) {
          console.error("Refresh failed", error);
      } finally {
          setIsLoadingFeed(false);
      }
  };

  const handleTutorialComplete = async () => {
      if (currentUser) {
          await db.markTutorialSeen(currentUser.id);
          setCurrentUser(prev => prev ? { ...prev, hasSeenTutorial: true } : null);
      }
      setIsTutorialOpen(false);
  };

  useEffect(() => {
    const initApp = async () => {
        if ('Notification' in window) Notification.requestPermission();
        const userLang = navigator.language.split('-')[0];
        setLang(userLang === 'ar' ? 'ar' : 'en');
        
        await new Promise(resolve => setTimeout(resolve, 2200));

        const loggedUser = await db.getCurrentUser();
        if (loggedUser) {
            setCurrentUser(loggedUser);
            setScreen(Screen.FEED);
            await refreshData(loggedUser);
        } else {
            setScreen(Screen.AUTH);
            refreshData();
        }
    };
    initApp();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleNavigate = async (s: Screen) => {
    if (s === Screen.NOTIFICATIONS && currentUser) {
        const updated = notifications.map(n => ({ ...n, read: true }));
        setNotifications(updated);
    }
    setScreen(s);
    setViewingUserId(null); 
    setProfileActiveTab('NOTES');
    setSelectedTag(null);
    refreshData();
  };

  const handleLogin = async (email: string, password: string, username?: string) => {
    let user;
    if (username) {
      user = await db.signup(email, password, username);
    } else {
      user = await db.login(email, password);
    }
    setCurrentUser(user);
    await refreshData(user);
    setScreen(Screen.FEED);
  };

  const handleUpdateProfile = async (data: { displayName: string; username: string; bio: string }) => {
      if (!currentUser) return;
      const updatedUser = await db.updateUser(currentUser.id, data);
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      showToast('Profile saved', 'success');
  };

  // Update User Settings (Privacy, Notifications)
  const handleUpdateSettings = async (updates: Partial<User>) => {
      if (!currentUser) return;
      const updatedUser = await db.updateUser(currentUser.id, updates);
      setCurrentUser(updatedUser);
      showToast('Settings updated', 'success');
  };

  const handleLike = async (noteId: string) => {
    if (!currentUser) return;
    
    // Optimistic update
    setNotes(prev => prev.map(n => {
        if (n.id === noteId) {
            const liked = !n.isLikedByCurrentUser;
            if (liked) playSystemSound('pop');
            return { ...n, likes: liked ? n.likes + 1 : n.likes - 1, isLikedByCurrentUser: liked };
        }
        return n;
    }));
    
    try {
        await db.toggleLike(noteId, currentUser.id);
    } catch (e) {
        await refreshData();
    }
  };

  const handleFollowToggle = async (targetUserId: string) => {
      if (!currentUser) return;
      const { currentUser: updatedCurrent, targetUser: updatedTarget } = await db.toggleFollow(currentUser.id, targetUserId);
      
      if (updatedCurrent.followingIds.includes(targetUserId)) {
          showToast(`${t.startedFollowing.replace('started following you.', '')} ${updatedTarget.displayName}`, 'success');
      }
      
      setCurrentUser(updatedCurrent);
      setUsers(prev => prev.map(u => {
          if (u.id === updatedCurrent.id) return updatedCurrent;
          if (u.id === updatedTarget.id) return updatedTarget;
          return u;
      }));
  };

  const submitComment = async (text: string, parentId?: string) => {
    if (!activeCommentNoteId || !currentUser) return;
    const newComment: Comment = {
        id: Date.now().toString(), userId: currentUser.id, text: text,
        timestamp: Date.now(), likes: 0, isLikedByCurrentUser: false, likedBy: [], parentId: parentId
    };
    
    // Optimistic UI Update
    setNotes(prev => prev.map(n => {
      if (n.id === activeCommentNoteId) return { ...n, comments: [...n.comments, newComment] };
      return n;
    }));
    
    await db.addComment(activeCommentNoteId, newComment);
    showToast(parentId ? 'Reply sent' : 'Comment posted', 'success');
  };

  const handleCreateNote = async () => {
    if (!currentUser) return;
    if (!newNoteContent.trim() && !newNoteAudioBlob) return;

    setIsCreating(true);
    
    try {
        let tags: string[] = newNoteContent.match(/#[\p{L}\p{N}_]+/gu) || [];
        let audioFileUrl = newNoteAudioBlob ? await db.uploadFile(newNoteAudioBlob) : undefined;
        
        const newNote: Note = {
          id: Date.now().toString(), userId: currentUser.id, author: currentUser,
          content: newNoteContent, type: audioFileUrl ? NoteType.AUDIO : NoteType.TEXT,
          audioUrl: audioFileUrl, audioDuration: newNoteDuration || undefined,
          timestamp: Date.now(), likes: 0, isLikedByCurrentUser: false, comments: [],
          style: activeStyle, tags: tags
        };

        await db.createNote(newNote);
        await refreshData();
        setNewNoteContent(''); setNewNoteAudioBlob(null); setNewNoteAudioUrl(null);
        showToast('Note Published', 'success');
        setScreen(Screen.FEED);
    } catch (error) {
        showToast('Failed to publish', 'notification');
    } finally {
        setIsCreating(false);
    }
  };

  const handleAISuggestTags = async () => {
    if (!newNoteContent) return;
    setIsPolishing(true);
    const tags = await suggestTags(newNoteContent);
    if (tags.length > 0) {
        const tagsString = "\n\n" + tags.join(' ');
        let i = 0;
        if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = setInterval(() => {
            const char = tagsString.charAt(i);
            setNewNoteContent(prev => prev + char);
            i++;
            if (i >= tagsString.length) {
                if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
                setIsPolishing(false);
            }
        }, 30);
    } else {
        setIsPolishing(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
         mediaRecorderRef.current.stop();
      }
      clearInterval(timerRef.current);
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Use supported mime type
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
            ? 'audio/webm;codecs=opus' 
            : 'audio/mp4';

        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        
        mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          setNewNoteAudioBlob(audioBlob);
          const url = URL.createObjectURL(audioBlob);
          setNewNoteAudioUrl(url);
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        setIsRecording(true);
        setNewNoteDuration(0);
        timerRef.current = setInterval(() => setNewNoteDuration(p => p + 1), 1000);
      } catch (err) { 
          console.error(err);
          showToast("Microphone access denied.", 'notification'); 
      }
    }
  };

  const getFilteredNotes = () => {
    let filtered = [...notes];
    if (activeInterest === t.forYou) filtered.sort((a, b) => b.timestamp - a.timestamp);
    else if (activeInterest === t.trendingCat) filtered.sort((a, b) => b.likes - a.likes);
    else if (activeInterest === t.voice) filtered = notes.filter(n => n.type === NoteType.AUDIO);
    else filtered = notes.filter(n => n.tags.includes(activeInterest));
    return filtered;
  };

  const commonProps = {
    currentScreen: screen, onNavigate: handleNavigate, unreadCount: unreadCount,
    labels: { home: t.home, discover: t.discover, activity: t.activity, profile: t.profile }
  };

  // Helper to format time for recording timer
  const formatDuration = (secs: number) => {
     const m = Math.floor(secs / 60);
     const s = Math.floor(secs % 60);
     return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const renderCreateScreen = () => {
        const hasExplicitText = activeStyle.color.includes('text-');
        const textColor = hasExplicitText ? '' : 'text-gray-900 dark:text-white';
        
        return (
          <div className="relative h-full flex flex-col bg-white dark:bg-black transition-colors duration-300">
            <div className="absolute top-6 left-0 right-0 px-6 z-20 flex justify-between items-center">
              <button onClick={() => setScreen(Screen.FEED)} className="p-3 bg-white/80 dark:bg-black/50 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors backdrop-blur-sm active:scale-95"><X size={22} className="dark:text-white"/></button>
              <div className="flex gap-3">
                 <button onClick={handleAISuggestTags} disabled={isPolishing || !newNoteContent} className="flex items-center gap-2 px-4 py-2.5 bg-white/80 dark:bg-zinc-800/80 rounded-full font-bold text-xs uppercase tracking-wider text-black dark:text-white shadow-sm backdrop-blur-sm active:scale-95 transition-transform">
                    {isPolishing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} className="text-brand-accent"/>}<span>{t.polish}</span>
                 </button>
                 <button 
                    onClick={handleCreateNote} 
                    className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2" 
                    disabled={!newNoteContent && !newNoteAudioBlob}
                 >
                     {isCreating ? <Loader2 size={16} className="animate-spin" /> : t.post}
                 </button>
              </div>
            </div>
            <div className={`flex-1 flex flex-col ${activeStyle.color} transition-colors duration-700 ease-in-out`}>
              <div className="relative flex-1 flex items-center">
                <textarea placeholder={t.placeholder} className={`w-full h-full px-8 pt-32 pb-40 bg-transparent resize-none outline-none text-3xl leading-normal font-serif placeholder-opacity-30 ${textColor} ${activeStyle.font}`} value={newNoteContent} onChange={e => setNewNoteContent(e.target.value)} autoFocus />
                {isAnalyzingMood && <div className="absolute top-32 right-8 text-xs font-bold uppercase tracking-widest opacity-30 animate-pulse">Analyzing Mood...</div>}
              </div>
              {newNoteAudioUrl && !isRecording && (
                 <div className="absolute bottom-44 left-6 right-6 p-4 bg-white/20 rounded-3xl border border-white/20 backdrop-blur-md shadow-sm animate-slide-up">
                    <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold uppercase tracking-wider opacity-60 flex items-center gap-2"><Mic size={12}/> {t.voiceNote}</span><button onClick={() => { setNewNoteAudioBlob(null); setNewNoteAudioUrl(null); }}><X size={14}/></button></div>
                    <AudioPlayer duration={newNoteDuration} src={newNoteAudioUrl} colorClass={textColor} />
                 </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-6 bg-gradient-to-t from-white/20 dark:from-black/50 to-transparent pb-10">
                <div className="flex justify-center items-center gap-6 relative">
                     {/* Recording Timer Display */}
                     {isRecording && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black text-white dark:bg-white dark:text-black px-4 py-1.5 rounded-full font-mono text-sm font-bold tracking-wider shadow-lg animate-fade-in flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            {formatDuration(newNoteDuration)}
                        </div>
                     )}

                     <button onClick={toggleRecording} className={`p-4 rounded-full transition-all shadow-lg hover:scale-110 active:scale-90 ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-red-500/40' : 'bg-white dark:bg-zinc-800 text-black dark:text-white'}`}>
                        {isRecording ? <StopCircle size={24} fill="currentColor" /> : <Mic size={24} />}
                     </button>
                     
                     <button onClick={() => setIsIconPickerOpen(true)} className="p-4 rounded-full bg-white dark:bg-zinc-800 text-black dark:text-white shadow-lg hover:scale-110 transition-transform active:scale-95">{(() => { const Icon = AVAILABLE_ICONS.find(i => i.id === activeStyle.icon)?.icon || Star; return <Icon size={24} />; })()}</button>
                </div>
                
                {/* Expanded Scrollable Color Picker */}
                <div className="flex flex-col gap-2">
                    <div className="flex gap-4 overflow-x-auto py-3 no-scrollbar px-2">
                        {NOTE_STYLES.map((group, groupIdx) => (
                            <div key={groupIdx} className="flex gap-2 shrink-0 border-r border-white/20 pr-4 mr-2 last:border-none">
                                {group.items.map((style) => (
                                    <button 
                                        key={style.name} 
                                        onClick={() => setActiveStyle({ ...activeStyle, color: style.color })} 
                                        className={`relative w-10 h-10 rounded-full transition-all duration-300 shadow-lg overflow-hidden group ${activeStyle.color === style.color ? 'scale-125 ring-2 ring-white' : 'opacity-80 hover:opacity-100 hover:scale-110'}`}
                                        title={style.name}
                                    >
                                        <div className={`absolute inset-0 ${style.color.split(' ')[0]} ${style.color.includes('from-') ? style.color : ''}`} />
                                        {/* Preview border for white/dark styles to be visible */}
                                        {style.color.includes('bg-white') && <div className="absolute inset-0 border border-gray-300 rounded-full" />}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
              </div>
              
              {isIconPickerOpen && (
                  <div className="absolute inset-x-0 bottom-0 bg-white dark:bg-zinc-900 rounded-t-[2.5rem] z-50 p-8 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] animate-slide-up h-[450px] flex flex-col">
                      <div className="flex justify-between items-center mb-6 shrink-0"><h3 className="font-bold text-xl dark:text-white">Choose Vibe</h3><button onClick={() => setIsIconPickerOpen(false)} className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-full"><X size={20} className="dark:text-white"/></button></div>
                      <div className="grid grid-cols-4 gap-4 overflow-y-auto pb-8 no-scrollbar">{AVAILABLE_ICONS.map((item) => (<button key={item.id} onClick={() => { setActiveStyle({...activeStyle, icon: item.id}); setIsIconPickerOpen(false); }} className={`flex flex-col items-center gap-3 p-4 rounded-2xl transition-all active:scale-95 ${activeStyle.icon === item.id ? 'bg-black text-white dark:bg-white dark:text-black scale-105 shadow-md' : 'bg-gray-50 dark:bg-zinc-800/50 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800'}`}><item.icon size={26} /><span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{item.label}</span></button>))}</div>
                  </div>
              )}
            </div>
          </div>
        );
  }

  const renderFeed = () => (
      <Layout {...commonProps}>
         <div className="bg-gray-50/50 dark:bg-black min-h-full transition-colors duration-300 pt-14">
           <PullRefreshWrapper onRefresh={async () => { await refreshData(); playSystemSound('refresh'); }} isDark={darkMode}>
              <div className="pt-4 pb-28 px-4 max-w-3xl mx-auto">
                 <div className="flex justify-between items-center mb-6">
                   <h1 className="text-2xl font-bold dark:text-white font-serif italic tracking-wide">Notos</h1>
                   <div className="flex gap-3">
                       <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 rounded-full bg-white dark:bg-zinc-900 shadow-sm hover:scale-105 transition-transform border border-gray-100 dark:border-zinc-800 active:scale-95">
                          {darkMode ? <Sun size={18} className="text-white" /> : <Moon size={18} />}
                       </button>
                   </div>
                 </div>

                 <div className="flex gap-3 overflow-x-auto no-scrollbar mb-8 py-2 px-1">
                   {categories.map((interest) => (
                     <button 
                       key={interest} 
                       onClick={() => setActiveInterest(interest)}
                       className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap flex-shrink-0 transition-all duration-300 active:scale-95 ${activeInterest === interest ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg scale-105' : 'bg-white dark:bg-zinc-900 text-gray-500 dark:text-gray-400 shadow-sm border border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
                     >
                       {interest}
                     </button>
                   ))}
                 </div>
                 
                 {isLoadingFeed ? (
                     [1,2,3].map(i => <NoteCard key={i} isLoading={true} />)
                 ) : getFilteredNotes().length === 0 ? (
                     <div className="flex flex-col items-center justify-center py-20 opacity-40 dark:text-white">
                         <Feather size={48} className="mb-4 stroke-1"/>
                         <p>{t.noNotes}</p>
                     </div>
                 ) : (
                     <div className="space-y-5 animate-fade-in">
                        {getFilteredNotes().map(note => (
                            <NoteCard 
                            key={note.id} 
                            note={note} 
                            lang={lang}
                            onLike={handleLike} 
                            onComment={(id) => setActiveCommentNoteId(id)}
                            onUserClick={(id) => { if(id !== currentUser?.id) { setViewingUserId(id); setScreen(Screen.USER_PROFILE); } else setScreen(Screen.PROFILE); }}
                            onTagClick={(tag) => { setSelectedTag(tag); setScreen(Screen.TAG_DETAILS); }}
                            />
                        ))}
                    </div>
                 )}
              </div>
           </PullRefreshWrapper>
         </div>
      </Layout>
  );

  const renderProfile = (targetUser: User, isSelf: boolean) => {
      const isFollowing = currentUser?.followingIds.includes(targetUser.id);
      const displayedNotes = notes.filter(n => n.userId === targetUser.id);
      const displayedLikes = notes.filter(n => n.likedBy?.includes(targetUser.id));

      return (
          <Layout {...commonProps}>
            <div className="bg-white dark:bg-black min-h-full pb-24 transition-colors duration-300">
              <PullRefreshWrapper onRefresh={() => refreshData(targetUser)} isDark={darkMode}>
                <div className="relative h-56 bg-zinc-900 overflow-hidden group">
                    <img src={targetUser.coverUrl || 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=800&q=80'} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" alt="cover"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-6 left-4 z-10">{!isSelf && (<button onClick={() => setScreen(Screen.FEED)} className="p-2 bg-white/20 backdrop-blur text-white rounded-full hover:bg-white/30 transition-colors active:scale-95"><ArrowLeft size={22} /></button>)}</div>
                    
                    <div className="absolute top-6 right-4 z-10">
                    {isSelf && <button 
                        onClick={() => setScreen(Screen.SETTINGS)}
                        className="p-2 bg-black/40 backdrop-blur text-white rounded-full hover:bg-black/60 transition-colors active:scale-95"
                    >
                        <Settings size={20} />
                    </button>}
                    </div>
                </div>

                    <div className="px-6 pb-4">
                        <div className="relative -mt-12 mb-3 flex justify-between items-end">
                            <div className="relative group">
                                <img 
                                    src={targetUser.avatarUrl} 
                                    className="w-24 h-24 rounded-full border-4 border-white dark:border-black object-cover shadow-md bg-gray-100" 
                                    alt="avatar" 
                                />
                                {targetUser.badges.includes('verified') && <div className="absolute bottom-1 right-1 bg-blue-500 text-white p-1 rounded-full border-2 border-white dark:border-black pointer-events-none"><Check size={12} strokeWidth={4}/></div>}
                            </div>
                            
                            {!isSelf && (
                                <button 
                                    onClick={() => handleFollowToggle(targetUser.id)}
                                    className={`px-6 py-2 rounded-full font-bold text-sm transition-all shadow-lg active:scale-95 ${isFollowing ? 'bg-gray-200 dark:bg-zinc-800 text-black dark:text-white' : 'bg-black dark:bg-white text-white dark:text-black'}`}
                                >
                                    {isFollowing ? t.following : t.follow}
                                </button>
                            )}
                             {isSelf && (
                                <button 
                                    onClick={() => setIsEditProfileOpen(true)}
                                    className="hidden lg:block px-6 py-2 rounded-full font-bold text-sm bg-gray-100 dark:bg-zinc-800 text-black dark:text-white border border-gray-200 dark:border-zinc-700 hover:bg-gray-200 active:scale-95 transition-all"
                                >
                                    {t.editProfile}
                                </button>
                            )}
                             {isSelf && (
                                <button 
                                    onClick={() => setIsEditProfileOpen(true)}
                                    className="px-6 py-2 rounded-full font-bold text-sm bg-gray-100 dark:bg-zinc-800 text-black dark:text-white border border-gray-200 dark:border-zinc-700 lg:hidden active:scale-95 transition-all"
                                >
                                    {t.editProfile}
                                </button>
                            )}
                        </div>
                        
                        <h2 className="text-2xl font-bold dark:text-white leading-tight">{targetUser.displayName}</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">@{targetUser.username}</p>
                        
                        <p className="text-gray-800 dark:text-gray-200 text-base leading-relaxed mb-4">{targetUser.bio}</p>

                        <div className="flex gap-6 mb-6 border-b border-gray-100 dark:border-zinc-800 pb-4">
                            <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-70 transition-opacity" onClick={() => { setFollowListType('FOLLOWING'); setScreen(Screen.FOLLOW_LIST); }}>
                                <span className="font-bold text-lg dark:text-white">{targetUser.following}</span>
                                <span className="text-gray-500 dark:text-gray-400 text-sm">{t.following}</span>
                            </div>
                            <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-70 transition-opacity" onClick={() => { setFollowListType('FOLLOWERS'); setScreen(Screen.FOLLOW_LIST); }}>
                                <span className="font-bold text-lg dark:text-white">{targetUser.followers}</span>
                                <span className="text-gray-500 dark:text-gray-400 text-sm">{t.followers}</span>
                            </div>
                        </div>

                        <div className="flex gap-8 border-b border-gray-100 dark:border-zinc-800 relative">
                            <button 
                                onClick={() => setProfileActiveTab('NOTES')}
                                className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors relative ${profileActiveTab === 'NOTES' ? 'text-black dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {t.notes}
                                {profileActiveTab === 'NOTES' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white rounded-t-full animate-slide-up" />}
                            </button>
                            <button 
                                onClick={() => setProfileActiveTab('LIKES')}
                                className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors relative ${profileActiveTab === 'LIKES' ? 'text-black dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {t.likes}
                                {profileActiveTab === 'LIKES' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white rounded-t-full animate-slide-up" />}
                            </button>
                        </div>
                    </div>

                    <div className="px-4 space-y-4 min-h-[200px]">
                        {profileActiveTab === 'NOTES' ? (
                            displayedNotes.length > 0 ? displayedNotes.map(n => (
                                <NoteCard key={n.id} note={n} lang={lang} onLike={handleLike} onComment={(id) => setActiveCommentNoteId(id)} onUserClick={() => {}} />
                            )) : <div className="text-center py-10 opacity-40 text-sm">{t.noNotes}</div>
                        ) : (
                            displayedLikes.length > 0 ? displayedLikes.map(n => (
                                <NoteCard key={n.id} note={n} lang={lang} onLike={handleLike} onComment={(id) => setActiveCommentNoteId(id)} onUserClick={() => {}} />
                            )) : (
                            <div className="text-center py-10 opacity-40 text-sm flex flex-col items-center gap-2"><Heart size={24}/> No liked posts yet</div>
                            )
                        )}
                    </div>
              </PullRefreshWrapper>
            </div>
          </Layout>
      );
  };

  const renderSettings = () => {
      if (!currentUser) return null;
      return (
        <div className="h-full bg-gray-50 dark:bg-black flex flex-col">
            <div className="px-6 py-4 flex items-center gap-3 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-black">
                <button onClick={() => setScreen(Screen.PROFILE)} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full active:scale-95 transition-transform"><ArrowLeft size={22} className="dark:text-white"/></button>
                <h2 className="text-lg font-bold dark:text-white">{t.settings}</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                
                {/* App Settings */}
                <div className="space-y-2">
                    <h3 className="px-2 text-xs font-bold uppercase text-gray-400 tracking-wider">{t.appearance}</h3>
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800">
                            <div className="flex items-center gap-3"><Moon size={20} className="text-gray-500"/><span className="font-medium dark:text-white">Dark Mode</span></div>
                            <button onClick={() => setDarkMode(!darkMode)} className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${darkMode ? 'bg-brand-accent' : 'bg-gray-200'}`}>
                                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${darkMode ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3"><Globe size={20} className="text-gray-500"/><span className="font-medium dark:text-white">Language</span></div>
                            <button onClick={() => { const newL = lang === 'en' ? 'ar' : 'en'; setLang(newL); }} className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-zinc-800 font-bold text-xs uppercase dark:text-white active:scale-95 transition-transform">{lang}</button>
                        </div>
                    </div>
                </div>

                {/* Privacy */}
                <div className="space-y-2">
                     <h3 className="px-2 text-xs font-bold uppercase text-gray-400 tracking-wider">{t.security}</h3>
                     <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm p-4">
                         <div className="flex items-center justify-between mb-2">
                             <div className="flex items-center gap-3"><Lock size={20} className="text-gray-500"/><span className="font-medium dark:text-white">{t.privateAccount}</span></div>
                             <button 
                                onClick={() => handleUpdateSettings({ isPrivate: !currentUser.isPrivate })} 
                                className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${currentUser.isPrivate ? 'bg-brand-accent' : 'bg-gray-200'}`}
                             >
                                 <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${currentUser.isPrivate ? 'translate-x-5' : 'translate-x-0'}`} />
                             </button>
                         </div>
                         <p className="text-xs text-gray-400 leading-relaxed">{t.privateDescription}</p>
                     </div>
                </div>

                {/* Notifications */}
                <div className="space-y-2">
                    <h3 className="px-2 text-xs font-bold uppercase text-gray-400 tracking-wider">{t.notifications}</h3>
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm">
                        {/* Likes */}
                        <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800">
                             <div className="flex items-center gap-3"><Heart size={20} className="text-gray-500"/><span className="font-medium dark:text-white">{t.notifyLikes}</span></div>
                             <button 
                                onClick={() => handleUpdateSettings({ notificationSettings: { ...currentUser.notificationSettings, likes: !currentUser.notificationSettings.likes } })} 
                                className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${currentUser.notificationSettings.likes ? 'bg-brand-accent' : 'bg-gray-200'}`}
                             >
                                 <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${currentUser.notificationSettings.likes ? 'translate-x-5' : 'translate-x-0'}`} />
                             </button>
                        </div>
                        {/* Follows */}
                        <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800">
                             <div className="flex items-center gap-3"><UserIcon size={20} className="text-gray-500"/><span className="font-medium dark:text-white">{t.notifyFollows}</span></div>
                             <button 
                                onClick={() => handleUpdateSettings({ notificationSettings: { ...currentUser.notificationSettings, follows: !currentUser.notificationSettings.follows } })} 
                                className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${currentUser.notificationSettings.follows ? 'bg-brand-accent' : 'bg-gray-200'}`}
                             >
                                 <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${currentUser.notificationSettings.follows ? 'translate-x-5' : 'translate-x-0'}`} />
                             </button>
                        </div>
                        {/* New Posts */}
                        <div className="p-4 flex items-center justify-between">
                             <div className="flex items-center gap-3"><BellRing size={20} className="text-gray-500"/><span className="font-medium dark:text-white">{t.notifyPosts}</span></div>
                             <button 
                                onClick={() => handleUpdateSettings({ notificationSettings: { ...currentUser.notificationSettings, newPosts: !currentUser.notificationSettings.newPosts } })} 
                                className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${currentUser.notificationSettings.newPosts ? 'bg-brand-accent' : 'bg-gray-200'}`}
                             >
                                 <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${currentUser.notificationSettings.newPosts ? 'translate-x-5' : 'translate-x-0'}`} />
                             </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 text-center text-gray-400 text-sm">
                        <p>Notos v2.2.1</p>
                        <p className="text-xs mt-1">Made with ❤️</p>
                </div>

                <button onClick={async () => { await db.logout(); setCurrentUser(null); setScreen(Screen.AUTH); }} className="w-full p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-500 font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform">
                    <LogOut size={20}/> {t.logout}
                </button>
            </div>
        </div>
      );
  };

  const renderNotifications = () => (
      <Layout {...commonProps}>
          <div className="min-h-full bg-white dark:bg-black pt-6 transition-colors duration-300">
              <PullRefreshWrapper onRefresh={async () => { await refreshData(); playSystemSound('refresh'); }} isDark={darkMode}>
                <div className="px-6 mb-6"><h1 className="text-2xl font-bold dark:text-white">{t.activity}</h1></div>
                <div className="flex flex-col pb-24">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-40 dark:text-white"><Bell size={48} className="mb-4"/><p>{t.noNotes}</p></div>
                    ) : (
                        notifications.map(n => (
                            <div 
                                key={n.id} 
                                className={`px-6 py-4 border-b border-gray-50 dark:border-zinc-900 flex gap-4 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors ${!n.read ? 'bg-brand-accent/5' : ''}`}
                            >
                                <div className="mt-1">
                                    {n.type === 'LIKE' && <Heart size={20} className="text-red-500" fill="currentColor"/>}
                                    {n.type === 'FOLLOW' && <UserPlus size={20} className="text-brand-accent" />}
                                </div>
                                <div className="flex-1">
                                    <div 
                                        className="flex items-center gap-2 mb-1 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setViewingUserId(n.fromUser.id);
                                            setScreen(Screen.USER_PROFILE);
                                        }}
                                    >
                                        <img src={n.fromUser.avatarUrl} className="w-8 h-8 rounded-full object-cover border border-gray-100 dark:border-zinc-800" alt=""/>
                                        <span className="font-bold text-sm dark:text-white hover:underline">{n.fromUser.displayName}</span>
                                        <span className="text-gray-500 text-sm">{getRelativeTime(n.timestamp, lang)}</span>
                                    </div>
                                    <div 
                                        className="cursor-pointer"
                                        onClick={() => {
                                            if (n.noteId) {
                                                // Navigate to the note by opening comments modal
                                                setActiveCommentNoteId(n.noteId);
                                            } else {
                                                // Fallback to profile if no note (e.g. follow)
                                                setViewingUserId(n.fromUser.id);
                                                setScreen(Screen.USER_PROFILE);
                                            }
                                        }}
                                    >
                                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                                            {n.type === 'LIKE' && (n.commentId ? t.likedComment : t.liked)}
                                            {n.type === 'FOLLOW' && t.startedFollowing}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
              </PullRefreshWrapper>
          </div>
      </Layout>
  );

  const renderDiscover = () => (
      <Layout {...commonProps}>
          <div className="min-h-full bg-white dark:bg-black pb-24 transition-colors duration-300">
             <PullRefreshWrapper onRefresh={async () => { await refreshData(); playSystemSound('refresh'); }} isDark={darkMode}>
                <div className="p-6 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-20">
                    <div className="relative group">
                        <Search className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" size={20}/>
                        <input 
                            type="text" 
                            placeholder={t.searchPlaceholder} 
                            className="w-full bg-gray-100 dark:bg-zinc-900 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 ring-black dark:ring-white/20 dark:text-white transition-all"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')} 
                                className="absolute right-4 top-3.5 text-gray-400 hover:text-black dark:hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {!searchQuery ? (
                    <>
                        <div className="px-6 mb-8 animate-fade-in">
                            <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2"><Flame size={18} className="text-black dark:text-white"/> {t.trending}</h3>
                            <div className="flex flex-wrap gap-3">
                                {/* Uses trendingTags from state, falls back to default if empty */}
                                {(trendingTags.length > 0 ? trendingTags : DEFAULT_TRENDING_TAGS).map(tag => (
                                    <button key={tag} onClick={() => { setSelectedTag(tag); setScreen(Screen.TAG_DETAILS); }} className="px-4 py-2 bg-gray-50 dark:bg-zinc-900 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-white transition-colors active:scale-95 grayscale">
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="px-6 animate-fade-in delay-100">
                            <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2"><Star size={18} className="text-black dark:text-white"/> {t.featured}</h3>
                            <div className="space-y-4">
                                {filteredDiscoverUsers.map(user => (
                                    <div key={user.id} onClick={() => { setViewingUserId(user.id); setScreen(Screen.USER_PROFILE); }} className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-gray-100 dark:border-zinc-800 cursor-pointer hover:scale-[1.02] active:scale-95 transition-transform grayscale hover:grayscale-0">
                                        <div className="flex items-center gap-3">
                                            <img src={user.avatarUrl} className="w-12 h-12 rounded-full object-cover border border-gray-100 dark:border-zinc-700" alt=""/>
                                            <div>
                                                <h4 className="font-bold dark:text-white">{user.displayName}</h4>
                                                <p className="text-xs text-gray-500">@{user.username}</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-full">View</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="px-6 pb-6 space-y-6 animate-fade-in">
                        {filteredDiscoverUsers.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Users</h3>
                                <div className="space-y-3">
                                    {filteredDiscoverUsers.map(user => (
                                        <div key={user.id} onClick={() => { setViewingUserId(user.id); setScreen(Screen.USER_PROFILE); }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900 cursor-pointer">
                                            <img src={user.avatarUrl} className="w-10 h-10 rounded-full object-cover" alt=""/>
                                            <div>
                                                <h4 className="font-bold dark:text-white text-sm">{user.displayName}</h4>
                                                <p className="text-xs text-gray-500">@{user.username}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Notes</h3>
                            {filteredDiscoverNotes.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredDiscoverNotes.map(note => (
                                        <NoteCard key={note.id} note={note} lang={lang} onLike={handleLike} onComment={(id) => setActiveCommentNoteId(id)} onUserClick={() => {}} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 opacity-50 dark:text-white">No notes found matching "{searchQuery}"</div>
                            )}
                        </div>
                    </div>
                )}
             </PullRefreshWrapper>
          </div>
      </Layout>
  );
  
  const renderSimpleList = (title: string, items: any[]) => (
       <Layout {...commonProps}>
          <div className="min-h-full bg-white dark:bg-black pt-6 px-6 transition-colors duration-300">
             <PullRefreshWrapper onRefresh={async () => { await refreshData(); playSystemSound('refresh'); }} isDark={darkMode}>
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => setScreen(Screen.PROFILE)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 active:scale-95 transition-transform"><ArrowLeft size={22} className="dark:text-white"/></button>
                    <h1 className="text-xl font-bold dark:text-white">{title}</h1>
                </div>
                <div className="space-y-4 pb-24">
                    {items.map((item, i) => (
                        <div key={i} className="p-4 bg-gray-50 dark:bg-zinc-900 rounded-xl dark:text-white">
                            {typeof item === 'string' ? item : (item.displayName || item.content || 'Unknown')}
                        </div>
                    ))}
                    {items.length === 0 && <p className="text-gray-500 text-center py-10">Nothing to see here.</p>}
                </div>
             </PullRefreshWrapper>
          </div>
       </Layout>
  );

  if (screen === Screen.SPLASH) return <SplashScreen onFinish={() => {
      if (currentUser) setScreen(Screen.FEED);
      else setScreen(Screen.AUTH);
  }} />;
  
  if (screen === Screen.AUTH) return <AuthScreen onLogin={handleLogin} t={t} />;

  return (
    <>
      <DynamicIsland message={toast.message} subMessage={toast.subMessage} type={toast.type} visible={toast.visible} icon={toast.icon} />
      
      {screen === Screen.FEED && renderFeed()}
      {screen === Screen.CREATE && renderCreateScreen()}
      {screen === Screen.PROFILE && currentUser && renderProfile(currentUser, true)}
      {screen === Screen.USER_PROFILE && viewingUserId && renderProfile(users.find(u => u.id === viewingUserId)!, false)}
      {screen === Screen.NOTIFICATIONS && renderNotifications()}
      {screen === Screen.DISCOVER && renderDiscover()}
      {screen === Screen.SETTINGS && renderSettings()}
      {screen === Screen.TAG_DETAILS && selectedTag && (
          <Layout {...commonProps}>
              <div className="min-h-full bg-white dark:bg-black pt-6 px-6 pb-24">
                  <PullRefreshWrapper onRefresh={async () => { await refreshData(); playSystemSound('refresh'); }} isDark={darkMode}>
                      <div className="flex items-center gap-3 mb-6">
                          <button onClick={() => setScreen(Screen.DISCOVER)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 active:scale-95 transition-transform"><ArrowLeft size={22} className="dark:text-white"/></button>
                          <h1 className="text-2xl font-bold dark:text-white">{selectedTag}</h1>
                      </div>
                      <div className="space-y-5">
                          {notes.filter(n => n.tags.includes(selectedTag!)).map(note => (
                              <NoteCard key={note.id} note={note} lang={lang} onLike={handleLike} onComment={(id) => setActiveCommentNoteId(id)} onUserClick={(id) => { if(id !== currentUser?.id) { setViewingUserId(id); setScreen(Screen.USER_PROFILE); } else setScreen(Screen.PROFILE); }} />
                          ))}
                          {notes.filter(n => n.tags.includes(selectedTag!)).length === 0 && <p className="text-gray-500 text-center py-10">{t.noNotes}</p>}
                      </div>
                  </PullRefreshWrapper>
              </div>
          </Layout>
      )}
      {screen === Screen.FOLLOW_LIST && renderSimpleList(followListType === 'FOLLOWING' ? t.following : t.followers, [])}

      {activeCommentNoteId && (
        <CommentsModal 
          note={notes.find(n => n.id === activeCommentNoteId)!} 
          currentUser={currentUser!} 
          users={users}
          onClose={() => setActiveCommentNoteId(null)} 
          onSubmitComment={submitComment}
          onLikeComment={async (cid) => { 
              playSystemSound('pop');
              await db.toggleCommentLike(activeCommentNoteId, cid, currentUser!.id); 
              // We need to refresh data to see the like update in the modal because CommentsModal takes the `note` prop from state
              await refreshData(); 
          }}
          t={t}
          lang={lang}
        />
      )}

      {isEditProfileOpen && currentUser && (
          <EditProfileModal 
             user={currentUser}
             onClose={() => setIsEditProfileOpen(false)}
             onSave={handleUpdateProfile}
             t={t}
          />
      )}
      
      {isTutorialOpen && (
        <TutorialOverlay 
            onComplete={handleTutorialComplete}
            t={t}
        />
      )}
    </>
  );
}
