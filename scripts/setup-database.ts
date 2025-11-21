import { supabase } from '../services/supabase';

const setupDatabase = async () => {
  console.log('Setting up database schema...');

  const schema = `
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
  `;

  const { data, error } = await supabase.rpc('exec_sql', { sql: schema });

  if (error) {
    console.error('Error setting up database:', error);
  } else {
    console.log('Database setup complete!', data);
  }
};

setupDatabase();
