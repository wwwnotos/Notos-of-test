
import { User, Note, Notification, NoteType, Comment, NoteColor, FontStyle } from '../types';

// --- Mock Data Generators ---
const NAMES_FIRST_AR = ['محمد', 'أحمد', 'سارة', 'نورة', 'خالد', 'فهد', 'ريم', 'ليلى', 'عمر', 'يوسف', 'فاطمة', 'زينب', 'عبدالله', 'سلطان', 'مها', 'هند', 'علي', 'سعود', 'تركي', 'جود', 'فيصل', 'مشاري', 'غادة', 'حنان', 'ياسر', 'لمى', 'سمر', 'ماجد', 'نايف', 'أسامة', 'رنا', 'شهد', 'عبير', 'وليد', 'طلال', 'بدر', 'منال', 'نوال', 'أمل', 'هدى'];
const NAMES_LAST_AR = ['العتيبي', 'الشمري', 'القحطاني', 'الحربي', 'الزهراني', 'الغامدي', 'الدوسري', 'المطيري', 'العمري', 'الشهري', 'السبيعي', 'المالكي', 'اليامي', 'العنزي', 'السالم', 'الرشيدي', 'العازمي', 'الخالدي', 'المولد', 'الهوساوي', 'النجار', 'الحمدان', 'الجابر', 'الفهيد', 'التركي'];
const NAMES_FIRST_EN = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'James', 'Emma', 'Robert', 'Olivia', 'William', 'Sophia', 'Alex', 'Isabella', 'Daniel', 'Mia', 'Chris', 'Anna', 'Mark', 'Eva', 'Ryan', 'Chloe', 'Adam', 'Zoe', 'Kevin', 'Lily', 'Brian', 'Grace', 'Jason', 'Nora'];
const NAMES_LAST_EN = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris'];

const BIOS = [
    'محبي القهوة والهدوء ☕️', 'Artist & Designer 🎨', 'Software Engineer 💻', 'كاتب وشاعر', 
    'Photography Enthusiast 📸', 'Just living life ✨', 'مسافر دائم 🌍', 'Music lover 🎵',
    'Dream big.', 'صانع محتوى', 'Tech Geek 🚀', 'Coffee addict', 'Nature lover 🌿',
    'أبحث عن الجمال في التفاصيل', 'محب للتقنية والابتكار', 'قارئ نهم 📚', 'Life is a journey',
    'Simplicity is key 🔑', 'مطور واجهات', 'Digital Nomad', 'Filmmaker 🎬', 'Explorer'
];

const AVATARS = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
    'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80',
    'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=200&q=80',
    'https://images.unsplash.com/photo-1528763380143-65b3ac89a3ff?w=200&q=80',
    'https://images.unsplash.com/photo-1624298357597-fd92dfbec01d?w=200&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&q=80',
    'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=200&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=200&q=80',
    'https://images.unsplash.com/photo-1542206391-5f9989b90746?w=200&q=80',
];

const CONTENT_TEMPLATES = [
    { text: "The sunset today was absolutely breathtaking. #Nature #Sunset", tags: ['#Nature', '#Sunset'], style: { color: NoteColor.GRADIENT_SUNSET, icon: 'Sun', font: FontStyle.SANS } },
    { text: "لا شيء يضاهي كوب قهوة في الصباح الباكر وصوت فيروز. #صباح_الخير #قهوة", tags: ['#صباح_الخير', '#قهوة'], style: { color: NoteColor.CANVAS_WARM, icon: 'Coffee', font: FontStyle.SERIF } },
    { text: "Just finished reading a great book. Highly recommend 'The Alchemist'. #Reading #Books", tags: ['#Reading', '#Books'], style: { color: NoteColor.ROSE, icon: 'Star', font: FontStyle.SERIF } },
    { text: "Coding all night long. The bug is finally fixed! 🐛✅ #DevLife #Coding", tags: ['#DevLife', '#Coding'], style: { color: NoteColor.DARK, icon: 'Code', font: FontStyle.MONO } },
    { text: "هدوء الليل هو أفضل وقت للكتابة. #خواطر #ليل", tags: ['#خواطر', '#ليل'], style: { color: NoteColor.VELVET_MIDNIGHT, icon: 'Moon', font: FontStyle.HAND } },
    { text: "Traveling to Dubai next week! Can't wait. ✈️ #Travel #Dubai", tags: ['#Travel', '#Dubai'], style: { color: NoteColor.BLUE, icon: 'Plane', font: FontStyle.SANS } },
    { text: "Creativity is intelligence having fun. #Art #Design", tags: ['#Art', '#Design'], style: { color: NoteColor.PAINT_TEAL, icon: 'Palette', font: FontStyle.SANS } },
    { text: "كل ما تحتاجه هو الإيمان بنفسك. #تحفيز #تطوير_الذات", tags: ['#تحفيز', '#تطوير_الذات'], style: { color: NoteColor.EMERALD, icon: 'Zap', font: FontStyle.SANS } },
    { text: "New recipe experiment success! 🍝 #Food #Cooking", tags: ['#Food', '#Cooking'], style: { color: NoteColor.YELLOW, icon: 'Smile', font: FontStyle.SANS } },
    { text: "Listening to some old classics. 🎵 #Music #Vibes", tags: ['#Music', '#Vibes'], style: { color: NoteColor.VIOLET, icon: 'Music', font: FontStyle.SANS } },
    { text: "النجاح رحلة وليس وجهة. استمتع بالطريق. #نجاح", tags: ['#نجاح'], style: { color: NoteColor.WHITE, icon: 'Star', font: FontStyle.SERIF } },
    { text: "Silence is an answer too. #Peace", tags: ['#Peace'], style: { color: NoteColor.GLASS_OBSIDIAN, icon: 'Feather', font: FontStyle.SERIF } },
    { text: "Why is React so addictive? 😂 #Frontend", tags: ['#Frontend'], style: { color: NoteColor.DARK, icon: 'Code', font: FontStyle.MONO } },
    { text: "الجمال يكمن في البساطة. #تصميم", tags: ['#تصميم'], style: { color: NoteColor.WHITE, icon: 'Star', font: FontStyle.SANS } },
    { text: "Rainy days and coding. 🌧️ #Cozy", tags: ['#Cozy'], style: { color: NoteColor.BLUE, icon: 'Code', font: FontStyle.MONO } },
    { text: "كن أنت التغيير الذي تريد أن تراه في العالم. #اقتباسات", tags: ['#اقتباسات'], style: { color: NoteColor.EMERALD, icon: 'Feather', font: FontStyle.SERIF } },
    { text: "Exploring the city streets. 🏙️ #Urban #Photography", tags: ['#Urban', '#Photography'], style: { color: NoteColor.DARK, icon: 'Camera', font: FontStyle.SANS } },
    { text: "Always learning, always growing. #Growth", tags: ['#Growth'], style: { color: NoteColor.YELLOW, icon: 'Zap', font: FontStyle.SANS } },
    { text: "مساء الخير يا جميلين. أتمنى لكم يوماً سعيداً. 🌸 #مساء_الخير", tags: ['#مساء_الخير'], style: { color: NoteColor.ROSE, icon: 'Smile', font: FontStyle.HAND } },
    { text: "Technology is moving so fast! #AI #Tech", tags: ['#AI', '#Tech'], style: { color: NoteColor.GRADIENT_MYSTIC, icon: 'Cpu', font: FontStyle.SANS } },
    { text: "Minimalism is not about having less. It's about making room for more of what matters. #Minimalism", tags: ['#Minimalism'], style: { color: NoteColor.WHITE, icon: 'Star', font: FontStyle.SANS } },
    { text: "فنجان قهوة وكتاب، هذا هو السلام. ☕📖 #قراءة", tags: ['#قراءة'], style: { color: NoteColor.CANVAS_WARM, icon: 'Coffee', font: FontStyle.SERIF } },
    { text: "Workout done! 💪 #Fitness", tags: ['#Fitness'], style: { color: NoteColor.PAINT_CORAL, icon: 'Zap', font: FontStyle.SANS } },
    { text: "أحياناً نحتاج للابتعاد قليلاً لنرى الصورة بوضوح. #حكمة", tags: ['#حكمة'], style: { color: NoteColor.GLASS_FROST, icon: 'Feather', font: FontStyle.SERIF } },
    { text: "Dreaming of the ocean. 🌊 #Beach", tags: ['#Beach'], style: { color: NoteColor.GRADIENT_OCEAN, icon: 'Plane', font: FontStyle.SANS } },
    { text: "Start where you are. Use what you have. Do what you can. #Motivation", tags: ['#Motivation'], style: { color: NoteColor.VELVET_ROYAL, icon: 'Star', font: FontStyle.SANS } },
    { text: "لا تدع الخوف يمنعك من تحقيق أحلامك. #طموح", tags: ['#طموح'], style: { color: NoteColor.VELVET_RED, icon: 'Flame', font: FontStyle.SANS } },
    { text: "Pizza night! 🍕 #Foodie", tags: ['#Foodie'], style: { color: NoteColor.YELLOW, icon: 'Smile', font: FontStyle.SANS } },
    { text: "Late night thoughts... 💭 #Insomnia", tags: ['#Insomnia'], style: { color: NoteColor.VELVET_MIDNIGHT, icon: 'Moon', font: FontStyle.HAND } },
    { text: "الحياة قصيرة، استمتع بكل لحظة. #سعادة", tags: ['#سعادة'], style: { color: NoteColor.PAINT_MUSTARD, icon: 'Sun', font: FontStyle.HAND } },
    { text: "Working on a new project. Secret for now! 🤫 #Hustle", tags: ['#Hustle'], style: { color: NoteColor.DARK, icon: 'Zap', font: FontStyle.MONO } },
    { text: "أحب الشتاء ورائحة المطر. ☔ #شتاء", tags: ['#شتاء'], style: { color: NoteColor.BLUE, icon: 'Star', font: FontStyle.SANS } },
    { text: "Photography is the story I fail to put into words. #Photo", tags: ['#Photo'], style: { color: NoteColor.CANVAS_GREY, icon: 'Camera', font: FontStyle.SERIF } },
    { text: "Good vibes only. ✌️ #Positivity", tags: ['#Positivity'], style: { color: NoteColor.GRADIENT_NATURE, icon: 'Smile', font: FontStyle.SANS } },
    { text: "العائلة هي كل شيء. ❤️ #عائلة", tags: ['#عائلة'], style: { color: NoteColor.ROSE, icon: 'Heart', font: FontStyle.HAND } },
    { text: "Debugging code is like being a detective in a crime movie where you are also the murderer. 🕵️‍♂️ #CodingHumor", tags: ['#CodingHumor'], style: { color: NoteColor.DARK, icon: 'Code', font: FontStyle.MONO } },
];

const COMMENTS_TEMPLATES = [
    "Beautiful! ❤️", "كلام جميل جداً", "Love this vibe ✨", "مبدع كالعادة", "Agree 100%", 
    "فعلاً 👌", "Wonderful words", "So poetic...", "استمر يا بطل", "Wow!", "Touching.",
    "صح لسانك", "Amazing perspective", "منور", "Great post!", "Exactly what I needed to hear.",
    "Looking good!", "Nice one 🔥", "Love it!", "فنان ما شاء الله", "Inspired!", "أبدعت",
    "So true.", "Fantastic!", "تحفة فنية", "Keep it up!", "مذهل", "This made my day", "كلام من ذهب"
];

class DatabaseService {
    private users: User[] = [];
    private notes: Note[] = [];
    private notifications: Notification[] = [];
    private storageKey = 'notos_db_v4_full_sim'; 

    constructor() {
        this.loadData();
    }

    private loadData() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            const data = JSON.parse(stored);
            this.users = data.users || [];
            this.notes = data.notes || [];
            this.notifications = data.notifications || [];
        }

        // Ensure we have 100 users for the simulation
        if (this.users.length < 100) {
            const needed = 100 - this.users.length;
            this.generateGhostUsers(needed);
            if (this.notes.length < 50) {
                this.generateSeedNotes(30);
            }
            this.saveData();
        }
    }

    private saveData() {
        localStorage.setItem(this.storageKey, JSON.stringify({
            users: this.users,
            notes: this.notes,
            notifications: this.notifications
        }));
    }

    private generateGhostUsers(count: number) {
        for (let i = 0; i < count; i++) {
            const isAr = Math.random() > 0.5;
            const firstName = isAr 
                ? NAMES_FIRST_AR[Math.floor(Math.random() * NAMES_FIRST_AR.length)] 
                : NAMES_FIRST_EN[Math.floor(Math.random() * NAMES_FIRST_EN.length)];
            const lastName = isAr
                ? NAMES_LAST_AR[Math.floor(Math.random() * NAMES_LAST_AR.length)]
                : NAMES_LAST_EN[Math.floor(Math.random() * NAMES_LAST_EN.length)];
            
            const displayName = `${firstName} ${lastName}`;
            const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${Math.floor(Math.random() * 9999)}`;
            
            const newUser: User = {
                id: `ghost_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                username: username,
                displayName: displayName,
                email: `${username}@notos.fake`,
                avatarUrl: AVATARS[Math.floor(Math.random() * AVATARS.length)],
                coverUrl: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000)}?w=800&q=80`, // Random image attempt
                followers: Math.floor(Math.random() * 1000) + 50,
                following: Math.floor(Math.random() * 500) + 20,
                followingIds: [],
                bio: BIOS[Math.floor(Math.random() * BIOS.length)],
                badges: Math.random() > 0.85 ? ['verified'] : [],
                isPrivate: false,
                notificationSettings: { likes: true, follows: true, newPosts: true }
            };
            this.users.push(newUser);
        }
    }

    private generateSeedNotes(count: number = 20) {
        for (let i = 0; i < count; i++) {
            const user = this.users[Math.floor(Math.random() * this.users.length)];
            const template = CONTENT_TEMPLATES[Math.floor(Math.random() * CONTENT_TEMPLATES.length)];
            
            const note: Note = {
                id: `note_seed_${Date.now()}_${i}`,
                userId: user.id,
                author: user,
                content: template.text,
                type: NoteType.TEXT,
                timestamp: Date.now() - Math.floor(Math.random() * 86400000 * 3), // Last 3 days
                likes: Math.floor(Math.random() * 200),
                isLikedByCurrentUser: false,
                likedBy: [],
                comments: [],
                style: template.style,
                tags: template.tags
            };
            this.notes.push(note);
        }
        this.notes.sort((a, b) => b.timestamp - a.timestamp);
    }

    private async simulateDelay() {
        await new Promise(resolve => setTimeout(resolve, 50)); 
    }

    // --- SIMULATION ENGINE ---
    async simulateGhostInteraction(currentUserId: string): Promise<{ type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'POST', text: string, user: User } | null> {
        if (!currentUserId || this.users.length === 0) return null;

        const dice = Math.random();
        const otherUsers = this.users.filter(u => u.id !== currentUserId);
        const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
        const currentUserNotes = this.notes.filter(n => n.userId === currentUserId);

        // 1. POST (New Content) - 30% Chance (Increased to keep feed alive)
        if (dice < 0.30) {
            const template = CONTENT_TEMPLATES[Math.floor(Math.random() * CONTENT_TEMPLATES.length)];
            const newNote: Note = {
                id: `note_sim_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                userId: randomUser.id,
                author: randomUser,
                content: template.text,
                type: NoteType.TEXT,
                timestamp: Date.now(),
                likes: 0,
                isLikedByCurrentUser: false,
                likedBy: [],
                comments: [],
                style: template.style,
                tags: template.tags
            };
            await this.createNote(newNote);
            return { type: 'POST', text: 'posted a new note', user: randomUser };
        }

        // 2. FOLLOW (If not following) - 15% Chance
        if (dice >= 0.30 && dice < 0.45 && !randomUser.followingIds.includes(currentUserId)) {
             await this.toggleFollow(randomUser.id, currentUserId);
             return { type: 'FOLLOW', text: 'started following you', user: randomUser };
        }

        // 3. LIKE (User's note) - 35% Chance
        if (dice >= 0.45 && dice < 0.80 && currentUserNotes.length > 0) {
            const randomNote = currentUserNotes[Math.floor(Math.random() * currentUserNotes.length)];
            if (!randomNote.likedBy?.includes(randomUser.id)) {
                await this.toggleLike(randomNote.id, randomUser.id);
                return { type: 'LIKE', text: 'liked your note', user: randomUser };
            }
        }

        // 4. COMMENT (User's note) - 20% Chance
        if (dice >= 0.80 && currentUserNotes.length > 0) {
             const randomNote = currentUserNotes[Math.floor(Math.random() * currentUserNotes.length)];
             const randomCommentText = COMMENTS_TEMPLATES[Math.floor(Math.random() * COMMENTS_TEMPLATES.length)];
             
             const comment: Comment = {
                 id: `comment_${Date.now()}_${Math.random()}`,
                 userId: randomUser.id,
                 text: randomCommentText,
                 timestamp: Date.now(),
                 likes: 0,
                 isLikedByCurrentUser: false
             };
             
             await this.addComment(randomNote.id, comment);
             await this.createNotification({
                 id: Date.now().toString(),
                 type: 'LIKE', // Using LIKE type structure essentially for generic notification
                 fromUser: randomUser,
                 toUserId: currentUserId,
                 noteId: randomNote.id,
                 commentId: comment.id,
                 timestamp: Date.now(),
                 read: false
             });

             return { type: 'COMMENT', text: `commented: "${randomCommentText}"`, user: randomUser };
        }
        
        // Ghost interacting with Ghost (Background activity)
        // We do this regardless of main interaction to keep numbers moving
        const bgUser1 = otherUsers[Math.floor(Math.random() * otherUsers.length)];
        const bgUser2 = otherUsers[Math.floor(Math.random() * otherUsers.length)];
        if (bgUser1.id !== bgUser2.id) {
            const targetNotes = this.notes.filter(n => n.userId === bgUser2.id);
            if (targetNotes.length > 0) {
                const note = targetNotes[Math.floor(Math.random() * targetNotes.length)];
                await this.toggleLike(note.id, bgUser1.id);
            }
        }

        return null;
    }

    // --- Auth & User ---
    async getCurrentUser(): Promise<User | null> {
        const id = localStorage.getItem('notos_current_user_id');
        if (!id) return null;
        return this.users.find(u => u.id === id) || null;
    }

    async login(email: string, username: string): Promise<User> {
        await this.simulateDelay();
        let user = this.users.find(u => u.email === email || u.username === username);
        
        if (!user) {
            user = {
                id: 'user_' + Date.now(),
                username, displayName: username, email,
                avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&fit=crop&q=80',
                coverUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80',
                followers: 0, following: 0, followingIds: [],
                bio: 'Just joined Notos.', badges: [], isPrivate: false,
                notificationSettings: { likes: true, follows: true, newPosts: true },
                hasSeenTutorial: false
            };
            this.users.push(user);
            this.saveData();
        }
        localStorage.setItem('notos_current_user_id', user.id);
        return user;
    }

    async logout() {
        localStorage.removeItem('notos_current_user_id');
    }

    async getAllUsers(): Promise<User[]> {
        return [...this.users];
    }

    async updateUser(userId: string, updates: Partial<User>): Promise<User> {
        const idx = this.users.findIndex(u => u.id === userId);
        if (idx === -1) throw new Error("User not found");
        this.users[idx] = { ...this.users[idx], ...updates };
        // Update notes author info as well to keep in sync
        this.notes = this.notes.map(n => { if (n.userId === userId) return { ...n, author: this.users[idx] }; return n; });
        this.saveData();
        return this.users[idx];
    }

    async markTutorialSeen(userId: string): Promise<void> {
        const idx = this.users.findIndex(u => u.id === userId);
        if (idx > -1) { this.users[idx].hasSeenTutorial = true; this.saveData(); }
    }

    async search(query: string): Promise<{ users: User[], notes: Note[] }> {
        const lowerQ = query.toLowerCase();
        const matchedUsers = this.users.filter(u => u.username.toLowerCase().includes(lowerQ) || u.displayName.toLowerCase().includes(lowerQ));
        const matchedNotes = this.notes.filter(n => n.content.toLowerCase().includes(lowerQ) || n.tags.some(t => t.toLowerCase().includes(lowerQ)));
        return { users: matchedUsers, notes: matchedNotes };
    }

    async getTrendingTags(limit: number = 8): Promise<string[]> {
        const tagCounts: Record<string, number> = {};
        this.notes.forEach(note => {
            if (note.tags) note.tags.forEach(tag => { const t = tag.trim(); if (t) tagCounts[t] = (tagCounts[t] || 0) + 1; });
        });
        return Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, limit).map(entry => entry[0]);
    }

    async toggleFollow(currentUserId: string, targetUserId: string): Promise<{currentUser: User, targetUser: User}> {
        const userIdx = this.users.findIndex(u => u.id === currentUserId);
        const targetIdx = this.users.findIndex(u => u.id === targetUserId);
        if (userIdx === -1 || targetIdx === -1) throw new Error("User not found");

        const isFollowing = this.users[userIdx].followingIds.includes(targetUserId);

        if (isFollowing) {
            this.users[userIdx].followingIds = this.users[userIdx].followingIds.filter(id => id !== targetUserId);
            this.users[userIdx].following -= 1;
            this.users[targetIdx].followers -= 1;
        } else {
            this.users[userIdx].followingIds.push(targetUserId);
            this.users[userIdx].following += 1;
            this.users[targetIdx].followers += 1;
             await this.createNotification({
                id: Date.now().toString(), type: 'FOLLOW', fromUser: this.users[userIdx], toUserId: targetUserId, timestamp: Date.now(), read: false
            });
        }
        this.saveData();
        return { currentUser: this.users[userIdx], targetUser: this.users[targetIdx] };
    }

    async getNotes(): Promise<Note[]> {
        return [...this.notes].sort((a, b) => b.timestamp - a.timestamp);
    }

    async createNote(note: Note): Promise<Note> {
        await this.simulateDelay();
        const safeNote = { ...note };
        this.notes.unshift(safeNote);
        this.saveData();
        return safeNote;
    }

    async toggleLike(noteId: string, userId: string): Promise<void> {
        const idx = this.notes.findIndex(n => n.id === noteId);
        if (idx === -1) return;
        const note = this.notes[idx];
        const likedBy = note.likedBy || [];
        const hasLiked = likedBy.includes(userId);
        if (hasLiked) {
            note.likes -= 1; note.likedBy = likedBy.filter(id => id !== userId);
        } else {
            note.likes += 1; note.likedBy = [...likedBy, userId];
            if (note.userId !== userId) {
                const fromUser = this.users.find(u => u.id === userId);
                if (fromUser) {
                    await this.createNotification({ id: Date.now().toString(), type: 'LIKE', fromUser: fromUser, toUserId: note.userId, noteId: note.id, timestamp: Date.now(), read: false });
                }
            }
        }
        this.notes[idx] = note;
        this.saveData();
    }

    async toggleCommentLike(noteId: string, commentId: string, userId: string): Promise<void> {
        const idx = this.notes.findIndex(n => n.id === noteId);
        if (idx === -1) return;
        const note = this.notes[idx];
        const commentIdx = note.comments.findIndex(c => c.id === commentId);
        if (commentIdx === -1) return;
        const comment = note.comments[commentIdx];
        const likedBy = comment.likedBy || [];
        const hasLiked = likedBy.includes(userId);
        if (hasLiked) {
            comment.likes = Math.max(0, (comment.likes || 0) - 1); comment.likedBy = likedBy.filter(id => id !== userId);
        } else {
            comment.likes = (comment.likes || 0) + 1; comment.likedBy = [...likedBy, userId];
            if (comment.userId !== userId) {
                const fromUser = this.users.find(u => u.id === userId);
                if (fromUser) {
                    await this.createNotification({ id: Date.now().toString(), type: 'LIKE', fromUser: fromUser, toUserId: comment.userId, noteId: note.id, commentId: comment.id, timestamp: Date.now(), read: false });
                }
            }
        }
        note.comments[commentIdx] = comment;
        this.saveData();
    }

    async addComment(noteId: string, comment: Comment): Promise<void> {
        const idx = this.notes.findIndex(n => n.id === noteId);
        if (idx > -1) { this.notes[idx].comments.push(comment); this.saveData(); }
    }

    async getNotifications(userId: string): Promise<Notification[]> {
        return this.notifications.filter(n => n.toUserId === userId).sort((a, b) => b.timestamp - a.timestamp);
    }

    async createNotification(notif: Notification) {
        this.notifications.unshift(notif);
        this.saveData();
    }

    async uploadFile(file: Blob | File): Promise<string> {
        await this.simulateDelay();
        return URL.createObjectURL(file);
    }
}

export const db = new DatabaseService();
