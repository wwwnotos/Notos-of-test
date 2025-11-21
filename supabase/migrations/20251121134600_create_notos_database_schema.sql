/*
  # Notos Database Schema

  1. New Tables
    - `profiles`
      - User profile information linked to auth.users
      - Includes username, display name, bio, avatar/cover URLs
      - Tracks follower/following counts
      - Privacy settings and notification preferences
    
    - `notes`
      - User posts/notes with content and metadata
      - Supports TEXT and AUDIO types
      - Styling options (color, font, icon)
      - Tags for categorization
      - Tracks likes and comments count
    
    - `follows`
      - Follow relationships between users
      - Prevents self-follows
      - Unique constraint on follower/following pairs
    
    - `likes`
      - User likes on notes
      - Unique constraint per user/note pair
    
    - `comments`
      - User comments on notes
      - Tracks likes count
    
    - `comment_likes`
      - User likes on comments
      - Unique constraint per user/comment pair
    
    - `notifications`
      - User notifications for likes, comments, follows
      - Read/unread status
  
  2. Security
    - Enable RLS on all tables
    - Profiles: Public read, users can update/insert their own
    - Notes: Public read, users can CRUD their own
    - Follows: Public read, users can follow/unfollow
    - Likes: Public read, users can like/unlike
    - Comments: Public read, users can CRUD their own
    - Comment likes: Public read, users can like/unlike
    - Notifications: Users see only their own
  
  3. Triggers & Functions
    - Auto-update `updated_at` timestamps
    - Auto-increment/decrement counts (likes, comments, followers)
    - Maintain data integrity
  
  4. Performance
    - Indexes on foreign keys and frequently queried columns
    - Optimized for timeline queries and user lookups
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  display_name text,
  email text,
  avatar_url text,
  cover_url text,
  bio text DEFAULT '',
  followers_count integer DEFAULT 0,
  following_count integer DEFAULT 0,
  is_private boolean DEFAULT false,
  badges text[] DEFAULT '{}',
  notification_likes boolean DEFAULT true,
  notification_follows boolean DEFAULT true,
  notification_new_posts boolean DEFAULT true,
  has_seen_tutorial boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  note_type text DEFAULT 'TEXT',
  audio_url text,
  style_color text DEFAULT 'WHITE',
  style_icon text,
  style_font text DEFAULT 'SANS',
  tags text[] DEFAULT '{}',
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create follows table
CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  note_id uuid REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, note_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  text text NOT NULL,
  likes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create comment_likes table
CREATE TABLE IF NOT EXISTS comment_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, comment_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  from_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  note_id uuid REFERENCES notes(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CHECK (type IN ('LIKE', 'COMMENT', 'FOLLOW'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_likes_note ON likes(note_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_note ON comments(note_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_to_user ON notifications(to_user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public profiles viewable" ON profiles;
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON profiles;
DROP POLICY IF EXISTS "Notes viewable" ON notes;
DROP POLICY IF EXISTS "Users create own notes" ON notes;
DROP POLICY IF EXISTS "Users update own notes" ON notes;
DROP POLICY IF EXISTS "Users delete own notes" ON notes;
DROP POLICY IF EXISTS "Follows viewable" ON follows;
DROP POLICY IF EXISTS "Users can follow" ON follows;
DROP POLICY IF EXISTS "Users can unfollow" ON follows;
DROP POLICY IF EXISTS "Likes viewable" ON likes;
DROP POLICY IF EXISTS "Users can like" ON likes;
DROP POLICY IF EXISTS "Users can unlike" ON likes;
DROP POLICY IF EXISTS "Comments viewable" ON comments;
DROP POLICY IF EXISTS "Users create comments" ON comments;
DROP POLICY IF EXISTS "Users update own comments" ON comments;
DROP POLICY IF EXISTS "Users delete own comments" ON comments;
DROP POLICY IF EXISTS "Comment likes viewable" ON comment_likes;
DROP POLICY IF EXISTS "Users can like comments" ON comment_likes;
DROP POLICY IF EXISTS "Users can unlike comments" ON comment_likes;
DROP POLICY IF EXISTS "Users view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users create notifications" ON notifications;
DROP POLICY IF EXISTS "Users update own notifications" ON notifications;

-- Profiles policies
CREATE POLICY "Public profiles viewable" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Notes policies
CREATE POLICY "Notes viewable" ON notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users create own notes" ON notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own notes" ON notes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own notes" ON notes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Follows viewable" ON follows FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can follow" ON follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);

-- Likes policies
CREATE POLICY "Likes viewable" ON likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can like" ON likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments viewable" ON comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users create comments" ON comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own comments" ON comments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own comments" ON comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Comment likes policies
CREATE POLICY "Comment likes viewable" ON comment_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can like comments" ON comment_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike comments" ON comment_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users view own notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = to_user_id);
CREATE POLICY "Users create notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = to_user_id) WITH CHECK (auth.uid() = to_user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
DROP TRIGGER IF EXISTS note_like_added ON likes;
DROP TRIGGER IF EXISTS note_like_removed ON likes;
DROP TRIGGER IF EXISTS comment_added ON comments;
DROP TRIGGER IF EXISTS comment_removed ON comments;
DROP TRIGGER IF EXISTS comment_like_added ON comment_likes;
DROP TRIGGER IF EXISTS comment_like_removed ON comment_likes;
DROP TRIGGER IF EXISTS follow_added ON follows;
DROP TRIGGER IF EXISTS follow_removed ON follows;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment likes_count on notes
CREATE OR REPLACE FUNCTION increment_note_likes() RETURNS TRIGGER AS $$
BEGIN
  UPDATE notes SET likes_count = likes_count + 1 WHERE id = NEW.note_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement likes_count on notes
CREATE OR REPLACE FUNCTION decrement_note_likes() RETURNS TRIGGER AS $$
BEGIN
  UPDATE notes SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.note_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Triggers for note likes
CREATE TRIGGER note_like_added AFTER INSERT ON likes FOR EACH ROW EXECUTE FUNCTION increment_note_likes();
CREATE TRIGGER note_like_removed AFTER DELETE ON likes FOR EACH ROW EXECUTE FUNCTION decrement_note_likes();

-- Function to increment comments_count on notes
CREATE OR REPLACE FUNCTION increment_note_comments() RETURNS TRIGGER AS $$
BEGIN
  UPDATE notes SET comments_count = comments_count + 1 WHERE id = NEW.note_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement comments_count on notes
CREATE OR REPLACE FUNCTION decrement_note_comments() RETURNS TRIGGER AS $$
BEGIN
  UPDATE notes SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.note_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Triggers for comments count
CREATE TRIGGER comment_added AFTER INSERT ON comments FOR EACH ROW EXECUTE FUNCTION increment_note_comments();
CREATE TRIGGER comment_removed AFTER DELETE ON comments FOR EACH ROW EXECUTE FUNCTION decrement_note_comments();

-- Function to increment comment likes_count
CREATE OR REPLACE FUNCTION increment_comment_likes() RETURNS TRIGGER AS $$
BEGIN
  UPDATE comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement comment likes_count
CREATE OR REPLACE FUNCTION decrement_comment_likes() RETURNS TRIGGER AS $$
BEGIN
  UPDATE comments SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.comment_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Triggers for comment likes
CREATE TRIGGER comment_like_added AFTER INSERT ON comment_likes FOR EACH ROW EXECUTE FUNCTION increment_comment_likes();
CREATE TRIGGER comment_like_removed AFTER DELETE ON comment_likes FOR EACH ROW EXECUTE FUNCTION decrement_comment_likes();

-- Function to increment followers_count
CREATE OR REPLACE FUNCTION increment_followers() RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
  UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement followers_count
CREATE OR REPLACE FUNCTION decrement_followers() RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles SET followers_count = GREATEST(0, followers_count - 1) WHERE id = OLD.following_id;
  UPDATE profiles SET following_count = GREATEST(0, following_count - 1) WHERE id = OLD.follower_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Triggers for follow counts
CREATE TRIGGER follow_added AFTER INSERT ON follows FOR EACH ROW EXECUTE FUNCTION increment_followers();
CREATE TRIGGER follow_removed AFTER DELETE ON follows FOR EACH ROW EXECUTE FUNCTION decrement_followers();
