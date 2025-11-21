import { supabase } from './supabase';
import { User, Note, Notification, NoteType, Comment } from '../types';

class RealDatabaseService {

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile) return null;

    return {
      id: profile.id,
      username: profile.username,
      displayName: profile.display_name || profile.username,
      email: profile.email,
      avatarUrl: profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
      coverUrl: profile.cover_url || 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80',
      followers: profile.followers_count,
      following: profile.following_count,
      followingIds: [],
      bio: profile.bio,
      badges: profile.badges,
      isPrivate: profile.is_private,
      notificationSettings: {
        likes: profile.notification_likes,
        follows: profile.notification_follows,
        newPosts: profile.notification_new_posts
      },
      hasSeenTutorial: profile.has_seen_tutorial
    };
  }

  async signup(email: string, password: string, username: string): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Failed to create user');

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        username,
        display_name: username,
        email,
        bio: 'Just joined Notos.',
        has_seen_tutorial: false
      });

    if (profileError) throw profileError;

    return {
      id: data.user.id,
      username,
      displayName: username,
      email,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80',
      followers: 0,
      following: 0,
      followingIds: [],
      bio: 'Just joined Notos.',
      badges: [],
      isPrivate: false,
      notificationSettings: { likes: true, follows: true, newPosts: true },
      hasSeenTutorial: false
    };
  }

  async login(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Failed to login');

    const user = await this.getCurrentUser();
    if (!user) throw new Error('Profile not found');

    return user;
  }

  async logout() {
    await supabase.auth.signOut();
  }

  async getNotes(limit: number = 50): Promise<Note[]> {
    const currentUser = await this.getCurrentUser();

    const { data: notesData, error } = await supabase
      .from('notes')
      .select(`
        *,
        profiles!notes_user_id_fkey (
          id, username, display_name, avatar_url, badges
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching notes:', error);
      return [];
    }

    if (!notesData) return [];

    const { data: likesData } = await supabase
      .from('likes')
      .select('note_id, user_id')
      .in('note_id', notesData.map(n => n.id));

    const { data: commentsData } = await supabase
      .from('comments')
      .select(`
        *,
        profiles!comments_user_id_fkey (
          id, username, display_name, avatar_url
        )
      `)
      .in('note_id', notesData.map(n => n.id))
      .order('created_at', { ascending: true });

    const likesMap = new Map<string, Set<string>>();
    likesData?.forEach(like => {
      if (!likesMap.has(like.note_id)) {
        likesMap.set(like.note_id, new Set());
      }
      likesMap.get(like.note_id)?.add(like.user_id);
    });

    const commentsMap = new Map<string, Comment[]>();
    commentsData?.forEach(comment => {
      if (!commentsMap.has(comment.note_id)) {
        commentsMap.set(comment.note_id, []);
      }
      commentsMap.get(comment.note_id)?.push({
        id: comment.id,
        userId: comment.user_id,
        text: comment.text,
        timestamp: new Date(comment.created_at).getTime(),
        likes: comment.likes_count,
        isLikedByCurrentUser: false,
        likedBy: [],
        author: {
          id: comment.profiles.id,
          username: comment.profiles.username,
          displayName: comment.profiles.display_name || comment.profiles.username,
          avatarUrl: comment.profiles.avatar_url
        }
      });
    });

    return notesData.map(note => {
      const noteId = note.id;
      const likedBy = Array.from(likesMap.get(noteId) || []);
      const isLikedByCurrentUser = currentUser ? likedBy.includes(currentUser.id) : false;

      return {
        id: note.id,
        userId: note.user_id,
        author: {
          id: note.profiles.id,
          username: note.profiles.username,
          displayName: note.profiles.display_name || note.profiles.username,
          email: '',
          avatarUrl: note.profiles.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
          coverUrl: '',
          followers: 0,
          following: 0,
          followingIds: [],
          bio: '',
          badges: note.profiles.badges || [],
          isPrivate: false,
          notificationSettings: { likes: true, follows: true, newPosts: true }
        },
        content: note.content,
        type: note.note_type as NoteType,
        audioUrl: note.audio_url,
        timestamp: new Date(note.created_at).getTime(),
        likes: note.likes_count,
        isLikedByCurrentUser,
        likedBy,
        comments: commentsMap.get(noteId) || [],
        style: {
          color: note.style_color,
          icon: note.style_icon,
          font: note.style_font
        },
        tags: note.tags || []
      };
    });
  }

  async createNote(note: Omit<Note, 'id' | 'timestamp' | 'likes' | 'comments' | 'likedBy' | 'isLikedByCurrentUser'>): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: note.userId,
        content: note.content,
        note_type: note.type,
        audio_url: note.audioUrl,
        style_color: note.style.color,
        style_icon: note.style.icon,
        style_font: note.style.font,
        tags: note.tags
      })
      .select()
      .single();

    if (error) throw error;

    return {
      ...note,
      id: data.id,
      timestamp: new Date(data.created_at).getTime(),
      likes: 0,
      isLikedByCurrentUser: false,
      likedBy: [],
      comments: []
    };
  }

  async toggleLike(noteId: string, userId: string): Promise<void> {
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('note_id', noteId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingLike) {
      await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id);
    } else {
      const { data: note } = await supabase
        .from('notes')
        .select('user_id')
        .eq('id', noteId)
        .single();

      await supabase
        .from('likes')
        .insert({ note_id: noteId, user_id: userId });

      if (note && note.user_id !== userId) {
        await supabase
          .from('notifications')
          .insert({
            to_user_id: note.user_id,
            from_user_id: userId,
            type: 'LIKE',
            note_id: noteId
          });
      }
    }
  }

  async addComment(noteId: string, comment: Omit<Comment, 'id' | 'timestamp' | 'likes' | 'isLikedByCurrentUser' | 'likedBy'>): Promise<void> {
    const { error } = await supabase
      .from('comments')
      .insert({
        note_id: noteId,
        user_id: comment.userId,
        text: comment.text
      });

    if (error) throw error;

    const { data: note } = await supabase
      .from('notes')
      .select('user_id')
      .eq('id', noteId)
      .single();

    if (note && note.user_id !== comment.userId) {
      await supabase
        .from('notifications')
        .insert({
          to_user_id: note.user_id,
          from_user_id: comment.userId,
          type: 'COMMENT',
          note_id: noteId
        });
    }
  }

  async toggleCommentLike(noteId: string, commentId: string, userId: string): Promise<void> {
    const { data: existingLike } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingLike) {
      await supabase
        .from('comment_likes')
        .delete()
        .eq('id', existingLike.id);
    } else {
      await supabase
        .from('comment_likes')
        .insert({ comment_id: commentId, user_id: userId });
    }
  }

  async toggleFollow(currentUserId: string, targetUserId: string): Promise<{currentUser: User, targetUser: User}> {
    const { data: existingFollow } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentUserId)
      .eq('following_id', targetUserId)
      .maybeSingle();

    if (existingFollow) {
      await supabase
        .from('follows')
        .delete()
        .eq('id', existingFollow.id);
    } else {
      await supabase
        .from('follows')
        .insert({
          follower_id: currentUserId,
          following_id: targetUserId
        });

      await supabase
        .from('notifications')
        .insert({
          to_user_id: targetUserId,
          from_user_id: currentUserId,
          type: 'FOLLOW'
        });
    }

    const currentUser = await this.getCurrentUser();
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetUserId)
      .single();

    const targetUser: User = {
      id: targetProfile.id,
      username: targetProfile.username,
      displayName: targetProfile.display_name || targetProfile.username,
      email: targetProfile.email,
      avatarUrl: targetProfile.avatar_url,
      coverUrl: targetProfile.cover_url,
      followers: targetProfile.followers_count,
      following: targetProfile.following_count,
      followingIds: [],
      bio: targetProfile.bio,
      badges: targetProfile.badges,
      isPrivate: targetProfile.is_private,
      notificationSettings: {
        likes: targetProfile.notification_likes,
        follows: targetProfile.notification_follows,
        newPosts: targetProfile.notification_new_posts
      }
    };

    return { currentUser: currentUser!, targetUser };
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        profiles!notifications_from_user_id_fkey (
          id, username, display_name, avatar_url, badges
        )
      `)
      .eq('to_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data) return [];

    return data.map(notif => ({
      id: notif.id,
      type: notif.type as 'LIKE' | 'COMMENT' | 'FOLLOW',
      fromUser: {
        id: notif.profiles.id,
        username: notif.profiles.username,
        displayName: notif.profiles.display_name || notif.profiles.username,
        email: '',
        avatarUrl: notif.profiles.avatar_url,
        coverUrl: '',
        followers: 0,
        following: 0,
        followingIds: [],
        bio: '',
        badges: notif.profiles.badges || [],
        isPrivate: false,
        notificationSettings: { likes: true, follows: true, newPosts: true }
      },
      toUserId: notif.to_user_id,
      noteId: notif.note_id,
      commentId: notif.comment_id,
      timestamp: new Date(notif.created_at).getTime(),
      read: notif.read
    }));
  }

  async search(query: string): Promise<{ users: User[], notes: Note[] }> {
    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(20);

    const { data: notesData } = await supabase
      .from('notes')
      .select(`
        *,
        profiles!notes_user_id_fkey (
          id, username, display_name, avatar_url, badges
        )
      `)
      .or(`content.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    const users: User[] = (usersData || []).map(profile => ({
      id: profile.id,
      username: profile.username,
      displayName: profile.display_name || profile.username,
      email: profile.email,
      avatarUrl: profile.avatar_url,
      coverUrl: profile.cover_url,
      followers: profile.followers_count,
      following: profile.following_count,
      followingIds: [],
      bio: profile.bio,
      badges: profile.badges,
      isPrivate: profile.is_private,
      notificationSettings: {
        likes: profile.notification_likes,
        follows: profile.notification_follows,
        newPosts: profile.notification_new_posts
      }
    }));

    const notes: Note[] = (notesData || []).map(note => ({
      id: note.id,
      userId: note.user_id,
      author: {
        id: note.profiles.id,
        username: note.profiles.username,
        displayName: note.profiles.display_name || note.profiles.username,
        email: '',
        avatarUrl: note.profiles.avatar_url,
        coverUrl: '',
        followers: 0,
        following: 0,
        followingIds: [],
        bio: '',
        badges: note.profiles.badges || [],
        isPrivate: false,
        notificationSettings: { likes: true, follows: true, newPosts: true }
      },
      content: note.content,
      type: note.note_type as NoteType,
      audioUrl: note.audio_url,
      timestamp: new Date(note.created_at).getTime(),
      likes: note.likes_count,
      isLikedByCurrentUser: false,
      likedBy: [],
      comments: [],
      style: {
        color: note.style_color,
        icon: note.style_icon,
        font: note.style_font
      },
      tags: note.tags || []
    }));

    return { users, notes };
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: updates.displayName,
        avatar_url: updates.avatarUrl,
        cover_url: updates.coverUrl,
        bio: updates.bio,
        is_private: updates.isPrivate,
        notification_likes: updates.notificationSettings?.likes,
        notification_follows: updates.notificationSettings?.follows,
        notification_new_posts: updates.notificationSettings?.newPosts,
        has_seen_tutorial: updates.hasSeenTutorial
      })
      .eq('id', userId);

    if (error) throw error;

    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not found');
    return user;
  }

  async markTutorialSeen(userId: string): Promise<void> {
    await supabase
      .from('profiles')
      .update({ has_seen_tutorial: true })
      .eq('id', userId);
  }

  async uploadFile(file: Blob | File): Promise<string> {
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(fileName, file);

    if (error) {
      return URL.createObjectURL(file);
    }

    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }

  async getAllUsers(): Promise<User[]> {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .limit(100);

    if (!data) return [];

    return data.map(profile => ({
      id: profile.id,
      username: profile.username,
      displayName: profile.display_name || profile.username,
      email: profile.email,
      avatarUrl: profile.avatar_url,
      coverUrl: profile.cover_url,
      followers: profile.followers_count,
      following: profile.following_count,
      followingIds: [],
      bio: profile.bio,
      badges: profile.badges,
      isPrivate: profile.is_private,
      notificationSettings: {
        likes: profile.notification_likes,
        follows: profile.notification_follows,
        newPosts: profile.notification_new_posts
      }
    }));
  }

  async getTrendingTags(limit: number = 8): Promise<string[]> {
    const { data } = await supabase
      .from('notes')
      .select('tags')
      .not('tags', 'is', null)
      .order('created_at', { ascending: false })
      .limit(100);

    if (!data) return [];

    const tagCounts: Record<string, number> = {};
    data.forEach(note => {
      if (note.tags) {
        note.tags.forEach((tag: string) => {
          if (tag) tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(entry => entry[0]);
  }
}

export const realDb = new RealDatabaseService();
