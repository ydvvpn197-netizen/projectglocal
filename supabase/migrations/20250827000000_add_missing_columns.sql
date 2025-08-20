-- Migration: Add Missing Columns to Existing Tables
-- Date: 2025-08-27
-- Description: Add missing columns that are referenced in functions but not in table definitions

-- Add view_count column to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Add missing columns to profiles table for location personalization
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS location_lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS location_lng DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS location_name TEXT,
ADD COLUMN IF NOT EXISTS location_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS location_auto_detect BOOLEAN DEFAULT true;

-- Add missing columns to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS organizer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update events table to use organizer_id if created_by is not set
UPDATE public.events 
SET organizer_id = user_id 
WHERE organizer_id IS NULL AND created_by IS NULL;

-- Add missing columns to groups table
ALTER TABLE public.groups 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add missing columns to discussions table
ALTER TABLE public.discussions 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add missing tables that are referenced in functions but may not exist

-- Create discussion_views table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.discussion_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  discussion_id UUID REFERENCES public.discussions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(discussion_id, user_id)
);

-- Create group_message_views table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.group_message_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.group_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- Create group_message_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.group_message_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.group_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- Create discussion_replies table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.discussion_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  discussion_id UUID REFERENCES public.discussions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create groups table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create group_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Create group_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.group_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.group_messages(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_edited BOOLEAN DEFAULT false
);

-- Create discussions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.discussions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create referral_codes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create promo_codes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create promo_code_usage table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.promo_code_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code_id UUID REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(code_id, user_id)
);

-- Create viral_content table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.viral_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  viral_score DECIMAL(5,2) DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  viral_coefficient DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_type, content_id)
);

-- Enable RLS on new tables
ALTER TABLE public.discussion_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_message_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_message_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_code_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viral_content ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for new tables
-- Discussion views
CREATE POLICY "Users can view discussion views" ON public.discussion_views
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own discussion views" ON public.discussion_views
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Group message views
CREATE POLICY "Users can view group message views" ON public.group_message_views
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own group message views" ON public.group_message_views
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Group message likes
CREATE POLICY "Users can view group message likes" ON public.group_message_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own group message likes" ON public.group_message_likes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own group message likes" ON public.group_message_likes
  FOR DELETE USING (user_id = auth.uid());

-- Discussion replies
CREATE POLICY "Users can view discussion replies" ON public.discussion_replies
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own discussion replies" ON public.discussion_replies
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own discussion replies" ON public.discussion_replies
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own discussion replies" ON public.discussion_replies
  FOR DELETE USING (user_id = auth.uid());

-- Groups
CREATE POLICY "Users can view public groups" ON public.groups
  FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create groups" ON public.groups
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own groups" ON public.groups
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own groups" ON public.groups
  FOR DELETE USING (created_by = auth.uid());

-- Group members
CREATE POLICY "Users can view group members" ON public.group_members
  FOR SELECT USING (true);

CREATE POLICY "Users can join groups" ON public.group_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave groups" ON public.group_members
  FOR DELETE USING (user_id = auth.uid());

-- Group messages
CREATE POLICY "Users can view group messages" ON public.group_messages
  FOR SELECT USING (true);

CREATE POLICY "Users can send group messages" ON public.group_messages
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own group messages" ON public.group_messages
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own group messages" ON public.group_messages
  FOR DELETE USING (user_id = auth.uid());

-- Discussions
CREATE POLICY "Users can view public discussions" ON public.discussions
  FOR SELECT USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can create discussions" ON public.discussions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own discussions" ON public.discussions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own discussions" ON public.discussions
  FOR DELETE USING (user_id = auth.uid());

-- Referral codes
CREATE POLICY "Users can view their own referral codes" ON public.referral_codes
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own referral codes" ON public.referral_codes
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Promo codes (admin only)
CREATE POLICY "Anyone can view active promo codes" ON public.promo_codes
  FOR SELECT USING (is_active = true);

-- Promo code usage
CREATE POLICY "Users can view their own promo code usage" ON public.promo_code_usage
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own promo code usage" ON public.promo_code_usage
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Viral content
CREATE POLICY "Anyone can view viral content" ON public.viral_content
  FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_view_count ON public.posts(view_count);
CREATE INDEX IF NOT EXISTS idx_posts_location ON public.posts(latitude, longitude) WHERE latitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(location_lat, location_lng) WHERE location_enabled = true;
CREATE INDEX IF NOT EXISTS idx_discussion_views_discussion ON public.discussion_views(discussion_id);
CREATE INDEX IF NOT EXISTS idx_discussion_views_user ON public.discussion_views(user_id);
CREATE INDEX IF NOT EXISTS idx_group_message_views_message ON public.group_message_views(message_id);
CREATE INDEX IF NOT EXISTS idx_group_message_views_user ON public.group_message_views(user_id);
CREATE INDEX IF NOT EXISTS idx_group_message_likes_message ON public.group_message_likes(message_id);
CREATE INDEX IF NOT EXISTS idx_group_message_likes_user ON public.group_message_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_discussion ON public.discussion_replies(discussion_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_group ON public.group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_user ON public.group_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_discussions_category ON public.discussions(category);
CREATE INDEX IF NOT EXISTS idx_discussions_public ON public.discussions(is_public);
CREATE INDEX IF NOT EXISTS idx_referral_codes_user ON public.referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_active ON public.referral_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON public.promo_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_promo_code_usage_user ON public.promo_code_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_viral_content_score ON public.viral_content(viral_score DESC);
