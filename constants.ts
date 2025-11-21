
import { Note, NoteColor, NoteType, User, FontStyle, Notification } from './types';

export const COUNTRY_CODES = [
  { code: '+1', flag: '🇺🇸' },
  { code: '+966', flag: '🇸🇦' },
  { code: '+971', flag: '🇦🇪' },
  { code: '+20', flag: '🇪🇬' },
  { code: '+44', flag: '🇬🇧' },
  { code: '+91', flag: '🇮🇳' },
];

// Helper for default/fallback tags if no notes exist
export const DEFAULT_TRENDING_TAGS = [
  '#Poetry', '#خواطر', '#Nature', '#تصويري', 
  '#Coffee', '#السعودية', '#Art', '#اقتباسات',
  '#Travel', '#كتب', '#Music', '#مساء_الخير',
  '#Love', '#حب', '#Photography', '#شعر',
  '#Life', '#حياة', '#Code', '#برمجة',
  '#Summer', '#صيف', '#Relax', '#هدوء',
  '#Vibes', '#أفكار', '#Design', '#تصميم'
];

export const TRANSLATIONS = {
  en: {
    tagline: 'Share your echo',
    welcome: 'Welcome',
    enterPhone: 'Enter your number to continue to Notos.',
    phonePlaceholder: '000 0000',
    sending: 'Sending...',
    continue: 'Continue',
    enterCode: 'Enter the code sent to',
    demoCode: 'Demo Code:',
    verifying: 'Verifying...',
    verifyEnter: 'Verify & Enter',
    changeNumber: 'Change Number',
    newNote: 'New Note',
    post: 'Post',
    placeholder: "What's on your mind?",
    voiceNote: 'Voice Note',
    polishing: 'Tagging...',
    polish: 'Auto Tags',
    autoTags: 'Auto Tags',
    home: 'Home',
    discover: 'Discover',
    activity: 'Activity',
    profile: 'Profile',
    searchPlaceholder: 'Search poets, tags...',
    trending: 'Trending #Tags',
    featured: 'Top Creators',
    follow: 'Follow',
    unfollow: 'Unfollow',
    following: 'Following',
    followers: 'Followers',
    liked: 'liked your note.',
    likedComment: 'liked your comment.',
    startedFollowing: 'started following you.',
    notes: 'Notes',
    likes: 'Likes',
    noNotes: 'No notes yet.',
    settings: 'Settings',
    editProfile: 'Edit Profile',
    coverUrl: 'Cover Image URL',
    save: 'Save',
    cancel: 'Cancel',
    name: 'Name',
    username: 'Username',
    bio: 'Bio',
    comments: 'Comments',
    addComment: 'Add a comment...',
    logout: 'Logout',
    accounts: 'Accounts',
    tags: 'Tags',
    postsWith: 'Posts with',
    plain: 'Plain', sun: 'Sun', sky: 'Sky', rose: 'Rose', mystic: 'Mystic', midnight: 'Midnight',
    // Categories
    forYou: 'For You',
    trendingCat: 'Trending',
    voice: 'Voice',
    // New Settings Translations
    personalInfo: 'Personal Information',
    security: 'Security',
    notifications: 'Notifications',
    appearance: 'Appearance',
    help: 'Help & Support',
    email: 'Email',
    privateAccount: 'Private Account',
    privateDescription: 'When enabled, your posts are only visible to people who follow you.',
    pushNotifications: 'Push Notifications',
    notifyLikes: 'Likes',
    notifyFollows: 'New Followers',
    notifyPosts: 'Posts from Following',
    // Auth Validation
    emailReq: 'Email must be a valid address ending in .com',
    passReq: 'Password must contain letters, numbers, and symbols',
    userReq: 'Username must be unique',
    replyingTo: 'Replying to',
    reply: 'Reply',
    // Tutorial
    tutorial: {
      next: 'Next',
      skip: 'Skip',
      finish: 'Get Started',
      step1Title: 'Welcome to Notos',
      step1Desc: 'A minimalist space to share your thoughts, poetry, and voice with the world without distractions.',
      step2Title: 'Express Yourself',
      step2Desc: 'Use the (+) button to create. Share text or voice notes. Notos automatically analyzes your mood to suggest colors and icons.',
      step3Title: 'AI Powered',
      step3Desc: 'Tap "Auto Tags" while writing. Our AI will polish your text and suggest the perfect hashtags instantly.',
      step4Title: 'Connect',
      step4Desc: 'Double tap to like, comment to discuss. Follow creators who inspire you and discover new ideas.'
    }
  },
  ar: {
    tagline: 'Share your echo',
    welcome: 'مرحباً بك',
    enterPhone: 'أدخل رقم هاتفك للمتابعة في نوتوس',
    phonePlaceholder: '000 0000',
    sending: 'جاري الإرسال...',
    continue: 'متابعة',
    enterCode: 'أدخل الرمز المرسل إلى',
    demoCode: 'رمز تجريبي:',
    verifying: 'جاري التحقق...',
    verifyEnter: 'تحقق ودخول',
    changeNumber: 'تغيير الرقم',
    newNote: 'ملاحظة جديدة',
    post: 'نشر',
    placeholder: 'بماذا تفكر؟',
    voiceNote: 'ملاحظة صوتية',
    polishing: 'جاري التوليد...',
    polish: 'هشتاق تلقائي',
    autoTags: 'وسوم تلقائية',
    home: 'الرئيسية',
    discover: 'اكتشف',
    activity: 'النشاط',
    profile: 'الملف الشخصي',
    searchPlaceholder: 'ابحث عن شعراء، وسوم...',
    trending: 'وسوم شائعة',
    featured: 'مبدعون مميزون',
    follow: 'متابعة',
    unfollow: 'إلغاء المتابعة',
    following: 'متابَعون',
    followers: 'متابِعون',
    liked: 'أعجب بملاحظتك',
    likedComment: 'أعجب بتعليقك',
    startedFollowing: 'بدأ بمتابعتك',
    notes: 'ملاحظات',
    likes: 'إعجابات',
    noNotes: 'لا توجد ملاحظات بعد.',
    settings: 'الإعدادات',
    editProfile: 'تعديل الملف',
    coverUrl: 'رابط صورة الغلاف',
    save: 'حفظ',
    cancel: 'إلغاء',
    name: 'الاسم',
    username: 'اسم المستخدم',
    bio: 'النبذة',
    comments: 'تعليقات',
    addComment: 'أضف تعليقاً...',
    logout: 'تسجيل خروج',
    accounts: 'حسابات',
    tags: 'وسوم',
    postsWith: 'المنشورات في',
    plain: 'عادي', sun: 'شمس', sky: 'سماء', rose: 'ورد', mystic: 'غموض', midnight: 'ليل',
    // Categories
    forYou: 'لك',
    trendingCat: 'الأكثر تداولاً',
    voice: 'صوتي',
    // New Settings Translations
    personalInfo: 'المعلومات الشخصية',
    security: 'الأمان',
    notifications: 'الإشعارات',
    appearance: 'المظهر',
    help: 'المساعدة والدعم',
    email: 'البريد الإلكتروني',
    privateAccount: 'حساب خاص',
    privateDescription: 'عند التفعيل، ستظهر منشوراتك فقط للأشخاص الذين يتابعونك.',
    pushNotifications: 'الإشعارات المنبثقة',
    notifyLikes: 'الإعجابات',
    notifyFollows: 'متابعين جدد',
    notifyPosts: 'منشورات من تتابعهم',
    // Auth Validation
    emailReq: 'يجب أن يكون البريد الإلكتروني حقيقياً وينتهي بـ .com',
    passReq: 'كلمة المرور يجب أن تحتوي على أحرف وأرقام ورموز',
    userReq: 'يجب أن يكون اسم المستخدم فريداً',
    replyingTo: 'الرد على',
    reply: 'رد',
    // Tutorial
    tutorial: {
      next: 'التالي',
      skip: 'تخطي',
      finish: 'ابدأ الآن',
      step1Title: 'مرحباً بك في نوتوس',
      step1Desc: 'مساحة بسيطة لمشاركة أفكارك، شعرك، وصوتك مع العالم بعيداً عن الضوضاء.',
      step2Title: 'عبر عن نفسك',
      step2Desc: 'استخدم زر (+) للبدء. شارك نصوصاً أو ملاحظات صوتية. نوتوس يحلل مزاجك تلقائياً ليقترح الألوان والأيقونات المناسبة.',
      step3Title: 'ذكاء اصطناعي',
      step3Desc: 'اضغط على "وسوم تلقائية" أثناء الكتابة. الذكاء الاصطناعي سيقوم بتحسين نصك واقتراح الهاشتاقات المثالية فوراً.',
      step4Title: 'تواصل',
      step4Desc: 'اضغط مرتين للإعجاب، وعلق للمناقشة. تابع المبدعين الذين يلهمونك واكتشف أفكاراً جديدة.'
    }
  }
};

export const getRelativeTime = (timestamp: number, lang: 'en' | 'ar') => {
  const now = Date.now();
  const diffInSeconds = Math.floor((now - timestamp) / 1000);

  if (lang === 'ar') {
    if (diffInSeconds < 10) return 'الآن';
    if (diffInSeconds < 60) return `منذ ${diffInSeconds.toLocaleString('ar-EG')} ثانية`;
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes === 1) return 'منذ دقيقة';
    if (diffInMinutes === 2) return 'منذ دقيقتين';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes.toLocaleString('ar-EG')} دقيقة`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return 'منذ ساعة';
    if (diffInHours === 2) return 'منذ ساعتين';
    if (diffInHours < 24) return `منذ ${diffInHours.toLocaleString('ar-EG')} ساعة`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'منذ أمس';
    if (diffInDays === 2) return 'منذ يومين';
    if (diffInDays < 7) return `منذ ${diffInDays.toLocaleString('ar-EG')} أيام`;
    
    return new Date(timestamp).toLocaleDateString('ar-EG');
  } else {
    if (diffInSeconds < 10) return 'Just now';
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
  }
};