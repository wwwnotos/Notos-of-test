
export enum NoteType {
  TEXT = 'TEXT',
  AUDIO = 'AUDIO'
}

export enum FontStyle {
  SANS = 'font-sans',
  SERIF = 'font-serif',
  MONO = 'font-mono',
  HAND = 'font-hand'
}

export enum NoteColor {
  // Basics
  WHITE = 'bg-white dark:bg-zinc-900',
  DARK = 'bg-slate-800 dark:bg-black text-white',
  
  // Pastels (Originals)
  YELLOW = 'bg-yellow-100 dark:bg-yellow-900/30',
  BLUE = 'bg-blue-100 dark:bg-blue-900/30',
  ROSE = 'bg-rose-100 dark:bg-rose-900/30',
  EMERALD = 'bg-emerald-100 dark:bg-emerald-900/30',
  VIOLET = 'bg-violet-100 dark:bg-violet-900/30',

  // Gradients
  GRADIENT_SUNSET = 'bg-gradient-to-br from-orange-400 to-pink-500 text-white shadow-lg shadow-orange-500/20',
  GRADIENT_OCEAN = 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-500/20',
  GRADIENT_MYSTIC = 'bg-gradient-to-br from-purple-600 to-indigo-900 text-white shadow-lg shadow-indigo-500/20',
  GRADIENT_NATURE = 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg shadow-emerald-500/20',
  
  // Velvet (Rich, deep, shadow-inner)
  VELVET_RED = 'bg-gradient-to-b from-red-900 to-red-950 text-white shadow-inner border-none',
  VELVET_MIDNIGHT = 'bg-gradient-to-b from-slate-900 to-black text-white shadow-inner border-none',
  VELVET_ROYAL = 'bg-gradient-to-b from-indigo-900 to-violet-950 text-white shadow-inner border-none',

  // Glass (Blur, borders)
  GLASS_FROST = 'bg-white/30 backdrop-blur-2xl border border-white/40 text-gray-900 dark:text-white shadow-xl',
  GLASS_OBSIDIAN = 'bg-black/60 backdrop-blur-2xl border border-white/10 text-white shadow-xl',

  // Canvas (Fabric/Paper vibes - mimicking via colors and subtle borders)
  CANVAS_WARM = 'bg-[#fcf5e5] text-gray-800 border border-stone-200/50', // Warm paper
  CANVAS_GREY = 'bg-[#f0f2f5] text-gray-800 border-none',
  
  // Paints (Vibrant, solid solids)
  PAINT_TEAL = 'bg-teal-600 text-white',
  PAINT_CORAL = 'bg-coral-500 bg-[#ff6b6b] text-white',
  PAINT_MUSTARD = 'bg-[#feca57] text-black'
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  timestamp: number;
  likes: number;
  isLikedByCurrentUser: boolean; // Derived state for UI
  likedBy?: string[]; // Persisted state in DB
  parentId?: string;
}

export interface NotificationSettings {
  likes: boolean;
  follows: boolean;
  newPosts: boolean;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  email?: string; 
  phoneNumber?: string;
  lastUsernameChange?: number; // Timestamp
  avatarUrl: string;
  coverUrl: string;
  followers: number;
  following: number;
  followingIds: string[]; // IDs of users this user follows
  bio: string;
  badges: string[];
  isPrivate: boolean;
  notificationSettings: NotificationSettings;
  hasSeenTutorial?: boolean; // New flag for onboarding
}

export interface Note {
  id: string;
  userId: string;
  author: User;
  content: string;
  audioUrl?: string;
  audioDuration?: number; // in seconds
  type: NoteType;
  timestamp: number;
  likes: number;
  isLikedByCurrentUser: boolean; // Derived state for UI
  likedBy?: string[]; // Persisted state in DB
  comments: Comment[];
  style: {
    font: FontStyle;
    color: NoteColor;
    icon?: string;
  };
  tags: string[];
}

export interface Notification {
  id: string;
  type: 'LIKE' | 'FOLLOW' | 'MENTION';
  fromUser: User;
  noteId?: string;
  commentId?: string;
  timestamp: number;
  read: boolean;
  toUserId?: string; // Helper for DB queries
}

export enum Screen {
  SPLASH = 'SPLASH',
  AUTH = 'AUTH',
  FEED = 'FEED',
  DISCOVER = 'DISCOVER',
  CREATE = 'CREATE',
  NOTIFICATIONS = 'NOTIFICATIONS',
  PROFILE = 'PROFILE',
  USER_PROFILE = 'USER_PROFILE', // Viewing another user
  FOLLOW_LIST = 'FOLLOW_LIST',
  TAG_DETAILS = 'TAG_DETAILS',
  SETTINGS = 'SETTINGS'
}
