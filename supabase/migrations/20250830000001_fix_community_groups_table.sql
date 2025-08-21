-- Migration: Fix Community Groups Table
-- Date: 2025-08-30
-- Description: Ensure community_groups table exists and has proper structure

-- Create community_groups table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.community_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT true,
  allow_anonymous_posts BOOLEAN DEFAULT false,
  require_approval BOOLEAN DEFAULT false,
  member_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  latitude NUMERIC,
  longitude NUMERIC,
  location_city TEXT,
  location_state TEXT,
  location_country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, location_city)
);

-- Create group_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.community_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Create community_posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.community_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'discussion' CHECK (post_type IN ('discussion', 'question', 'announcement', 'event', 'poll')),
  is_anonymous BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  latitude NUMERIC,
  longitude NUMERIC,
  location_city TEXT,
  location_state TEXT,
  location_country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_community_groups_category ON public.community_groups(category);
CREATE INDEX IF NOT EXISTS idx_community_groups_location ON public.community_groups(location_city, location_state);
CREATE INDEX IF NOT EXISTS idx_community_groups_created_at ON public.community_groups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_group_id ON public.community_posts(group_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_score ON public.community_posts(score DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_groups
DROP POLICY IF EXISTS "Users can view public groups" ON public.community_groups;
CREATE POLICY "Users can view public groups" ON public.community_groups
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.community_groups;
CREATE POLICY "Authenticated users can create groups" ON public.community_groups
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- RLS Policies for group_members
DROP POLICY IF EXISTS "Users can join public groups" ON public.group_members;
CREATE POLICY "Users can join public groups" ON public.group_members
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.community_groups 
      WHERE id = group_id AND is_public = true
    )
  );

-- RLS Policies for community_posts
DROP POLICY IF EXISTS "Users can view posts in public groups" ON public.community_posts;
CREATE POLICY "Users can view posts in public groups" ON public.community_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.community_groups 
      WHERE id = group_id AND is_public = true
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_community_groups_updated_at ON public.community_groups;
CREATE TRIGGER update_community_groups_updated_at
  BEFORE UPDATE ON public.community_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_community_posts_updated_at ON public.community_posts;
CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO public.community_groups (name, description, category, created_by, location_city, location_state, location_country)
VALUES 
  ('Local Artists Network', 'Connect with local artists and share your work', 'Arts & Culture', 
   (SELECT id FROM auth.users LIMIT 1), 'New York', 'NY', 'USA'),
  ('Tech Enthusiasts', 'Discuss the latest in technology and innovation', 'Technology', 
   (SELECT id FROM auth.users LIMIT 1), 'San Francisco', 'CA', 'USA'),
  ('Food Lovers', 'Share recipes and discover local restaurants', 'Food & Dining', 
   (SELECT id FROM auth.users LIMIT 1), 'Chicago', 'IL', 'USA')
ON CONFLICT (name, location_city) DO NOTHING;
