-- ============================================================================
-- MISSING TABLES AND PRIVACY FIXES MIGRATION
-- ============================================================================
-- This migration adds missing tables and fixes privacy-related schema issues
-- Date: 2025-01-28
-- Version: 1.0.0

-- ============================================================================
-- ADD MISSING PRIVACY_SETTINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.privacy_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_visibility TEXT DEFAULT 'private' CHECK (profile_visibility IN ('public', 'private', 'friends_only')),
  show_email BOOLEAN DEFAULT FALSE,
  show_phone BOOLEAN DEFAULT FALSE,
  show_location BOOLEAN DEFAULT FALSE,
  show_real_name BOOLEAN DEFAULT FALSE,
  real_name_visibility BOOLEAN DEFAULT FALSE,
  anonymous_mode BOOLEAN DEFAULT TRUE,
  anonymous_posts BOOLEAN DEFAULT TRUE,
  anonymous_comments BOOLEAN DEFAULT TRUE,
  anonymous_votes BOOLEAN DEFAULT TRUE,
  location_sharing BOOLEAN DEFAULT FALSE,
  precise_location BOOLEAN DEFAULT FALSE,
  data_export_enabled BOOLEAN DEFAULT TRUE,
  marketing_emails BOOLEAN DEFAULT FALSE,
  analytics_tracking BOOLEAN DEFAULT TRUE,
  third_party_sharing BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- ADD RLS POLICIES FOR PRIVACY_SETTINGS
-- ============================================================================

-- Enable RLS on privacy_settings table
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own privacy settings
CREATE POLICY "Users can view own privacy settings" ON public.privacy_settings
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to update their own privacy settings
CREATE POLICY "Users can update own privacy settings" ON public.privacy_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for users to insert their own privacy settings
CREATE POLICY "Users can insert own privacy settings" ON public.privacy_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- ADD MISSING ARTISTS TABLE (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.artists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  specialty TEXT[] DEFAULT '{}',
  experience_years INTEGER DEFAULT 0,
  portfolio_urls TEXT[] DEFAULT '{}',
  bio TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  hourly_rate_min INTEGER,
  hourly_rate_max INTEGER,
  location_city TEXT,
  location_state TEXT,
  location_country TEXT,
  verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  verification_documents TEXT[],
  rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  total_bookings INTEGER DEFAULT 0,
  total_earnings INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- ADD MISSING COMMUNITIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.communities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location_city TEXT,
  location_state TEXT,
  location_country TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  category TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  member_count INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- ADD MISSING COMMUNITY_MEMBERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.community_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(community_id, user_id)
);

-- ============================================================================
-- ADD MISSING POLLS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  options JSONB NOT NULL,
  is_anonymous BOOLEAN DEFAULT TRUE,
  is_public BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  total_votes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- ADD MISSING POLL_VOTES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL,
  is_anonymous BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

-- ============================================================================
-- ADD MISSING CHATS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  type TEXT DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'community')),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_anonymous BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- ADD MISSING MESSAGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT TRUE,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- ADD MISSING REPORTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reported_content_id UUID,
  reported_content_type TEXT CHECK (reported_content_type IN ('post', 'comment', 'user', 'community', 'poll')),
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- ADD MISSING MODERATION_ACTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.moderation_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  moderator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_content_id UUID,
  target_content_type TEXT CHECK (target_content_type IN ('post', 'comment', 'user', 'community', 'poll')),
  action_type TEXT NOT NULL CHECK (action_type IN ('warning', 'mute', 'ban', 'delete', 'hide', 'approve')),
  reason TEXT NOT NULL,
  duration INTEGER, -- in hours, NULL for permanent
  expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- ADD MISSING NEWS_SUMMARIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.news_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id TEXT NOT NULL UNIQUE, -- SHA-256 hash of URL
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  source TEXT NOT NULL,
  url TEXT NOT NULL,
  image_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '15 minutes'),
  city TEXT,
  country TEXT,
  category TEXT,
  tags TEXT[],
  ai_generated BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'
);

-- ============================================================================
-- ADD MISSING NEWS_DISCUSSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.news_discussions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id TEXT NOT NULL REFERENCES public.news_summaries(article_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.news_discussions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT TRUE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- UPDATE PROFILES TABLE WITH MISSING FIELDS
-- ============================================================================

-- Add missing fields to profiles table if they don't exist
DO $$ 
BEGIN
  -- Add user_type field
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'user_type') THEN
    ALTER TABLE public.profiles ADD COLUMN user_type TEXT DEFAULT 'user' CHECK (user_type IN ('user', 'artist', 'business', 'government'));
  END IF;
  
  -- Add first_name and last_name fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'first_name') THEN
    ALTER TABLE public.profiles ADD COLUMN first_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_name') THEN
    ALTER TABLE public.profiles ADD COLUMN last_name TEXT;
  END IF;
  
  -- Add real_name_visibility field
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'real_name_visibility') THEN
    ALTER TABLE public.profiles ADD COLUMN real_name_visibility BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Privacy settings indexes
CREATE INDEX IF NOT EXISTS idx_privacy_settings_user_id ON public.privacy_settings(user_id);

-- Artists indexes
CREATE INDEX IF NOT EXISTS idx_artists_user_id ON public.artists(user_id);
CREATE INDEX IF NOT EXISTS idx_artists_specialty ON public.artists USING GIN(specialty);
CREATE INDEX IF NOT EXISTS idx_artists_location ON public.artists(location_city, location_state, location_country);
CREATE INDEX IF NOT EXISTS idx_artists_available ON public.artists(is_available);

-- Communities indexes
CREATE INDEX IF NOT EXISTS idx_communities_location ON public.communities(location_city, location_state, location_country);
CREATE INDEX IF NOT EXISTS idx_communities_category ON public.communities(category);
CREATE INDEX IF NOT EXISTS idx_communities_public ON public.communities(is_public);

-- Community members indexes
CREATE INDEX IF NOT EXISTS idx_community_members_community_id ON public.community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user_id ON public.community_members(user_id);

-- Polls indexes
CREATE INDEX IF NOT EXISTS idx_polls_community_id ON public.polls(community_id);
CREATE INDEX IF NOT EXISTS idx_polls_user_id ON public.polls(user_id);
CREATE INDEX IF NOT EXISTS idx_polls_expires_at ON public.polls(expires_at);

-- Poll votes indexes
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON public.poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user_id ON public.poll_votes(user_id);

-- Chats indexes
CREATE INDEX IF NOT EXISTS idx_chats_community_id ON public.chats(community_id);
CREATE INDEX IF NOT EXISTS idx_chats_type ON public.chats(type);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- Reports indexes
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user_id ON public.reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

-- Moderation actions indexes
CREATE INDEX IF NOT EXISTS idx_moderation_actions_moderator_id ON public.moderation_actions(moderator_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_target_user_id ON public.moderation_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_expires_at ON public.moderation_actions(expires_at);

-- News summaries indexes
CREATE INDEX IF NOT EXISTS idx_news_summaries_article_id ON public.news_summaries(article_id);
CREATE INDEX IF NOT EXISTS idx_news_summaries_expires_at ON public.news_summaries(expires_at);
CREATE INDEX IF NOT EXISTS idx_news_summaries_city ON public.news_summaries(city);
CREATE INDEX IF NOT EXISTS idx_news_summaries_published_at ON public.news_summaries(published_at DESC);

-- News discussions indexes
CREATE INDEX IF NOT EXISTS idx_news_discussions_article_id ON public.news_discussions(article_id);
CREATE INDEX IF NOT EXISTS idx_news_discussions_user_id ON public.news_discussions(user_id);
CREATE INDEX IF NOT EXISTS idx_news_discussions_parent_id ON public.news_discussions(parent_id);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY ON NEW TABLES
-- ============================================================================

ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_discussions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE RLS POLICIES FOR NEW TABLES
-- ============================================================================

-- Privacy settings policies
CREATE POLICY "Users can view own privacy settings" ON public.privacy_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own privacy settings" ON public.privacy_settings
  FOR ALL USING (auth.uid() = user_id);

-- Artists policies
CREATE POLICY "Anyone can view active artists" ON public.artists
  FOR SELECT USING (is_available = true);

CREATE POLICY "Users can view own artist profile" ON public.artists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own artist profile" ON public.artists
  FOR ALL USING (auth.uid() = user_id);

-- Communities policies
CREATE POLICY "Anyone can view public communities" ON public.communities
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view communities they're members of" ON public.communities
  FOR SELECT USING (
    is_public = true OR 
    EXISTS (SELECT 1 FROM public.community_members WHERE community_id = id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create communities" ON public.communities
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update communities they created" ON public.communities
  FOR UPDATE USING (auth.uid() = created_by);

-- Community members policies
CREATE POLICY "Users can view community members" ON public.community_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.communities WHERE id = community_id AND is_public = true) OR
    EXISTS (SELECT 1 FROM public.community_members cm2 WHERE cm2.community_id = community_id AND cm2.user_id = auth.uid())
  );

CREATE POLICY "Users can join communities" ON public.community_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities" ON public.community_members
  FOR DELETE USING (auth.uid() = user_id);

-- Polls policies
CREATE POLICY "Anyone can view public polls" ON public.polls
  FOR SELECT USING (is_public = true);

CREATE POLICY "Community members can view community polls" ON public.polls
  FOR SELECT USING (
    is_public = true OR 
    (community_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.community_members 
      WHERE community_id = polls.community_id AND user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can create polls" ON public.polls
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own polls" ON public.polls
  FOR UPDATE USING (auth.uid() = user_id);

-- Poll votes policies
CREATE POLICY "Users can view poll votes" ON public.poll_votes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.polls WHERE id = poll_id AND is_public = true)
  );

CREATE POLICY "Users can vote in polls" ON public.poll_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes" ON public.poll_votes
  FOR UPDATE USING (auth.uid() = user_id);

-- Chats policies
CREATE POLICY "Users can view chats they're in" ON public.chats
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.messages WHERE chat_id = id AND user_id = auth.uid()) OR
    created_by = auth.uid()
  );

CREATE POLICY "Users can create chats" ON public.chats
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Messages policies
CREATE POLICY "Users can view messages in their chats" ON public.messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.chats WHERE id = chat_id AND (
      created_by = auth.uid() OR
      EXISTS (SELECT 1 FROM public.messages m2 WHERE m2.chat_id = chat_id AND m2.user_id = auth.uid())
    ))
  );

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages" ON public.messages
  FOR UPDATE USING (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Users can view own reports" ON public.reports
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Moderators can view all reports" ON public.reports
  FOR SELECT USING (public.is_moderator());

-- Moderation actions policies
CREATE POLICY "Moderators can view moderation actions" ON public.moderation_actions
  FOR SELECT USING (public.is_moderator());

CREATE POLICY "Moderators can manage moderation actions" ON public.moderation_actions
  FOR ALL USING (public.is_moderator());

-- News summaries policies
CREATE POLICY "Anyone can view news summaries" ON public.news_summaries
  FOR SELECT USING (true);

CREATE POLICY "System can manage news summaries" ON public.news_summaries
  FOR ALL USING (true);

-- News discussions policies
CREATE POLICY "Anyone can view news discussions" ON public.news_discussions
  FOR SELECT USING (true);

CREATE POLICY "Users can create news discussions" ON public.news_discussions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own news discussions" ON public.news_discussions
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- CREATE TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers to tables with updated_at columns
CREATE TRIGGER update_privacy_settings_updated_at BEFORE UPDATE ON public.privacy_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON public.artists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON public.communities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_polls_updated_at BEFORE UPDATE ON public.polls
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON public.chats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_moderation_actions_updated_at BEFORE UPDATE ON public.moderation_actions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_news_discussions_updated_at BEFORE UPDATE ON public.news_discussions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- INSERT DEFAULT PRIVACY SETTINGS FOR EXISTING USERS
-- ============================================================================

INSERT INTO public.privacy_settings (user_id, anonymous_mode, anonymous_posts, anonymous_comments, anonymous_votes)
SELECT 
  user_id,
  TRUE,
  TRUE,
  TRUE,
  TRUE
FROM public.profiles
WHERE user_id NOT IN (SELECT user_id FROM public.privacy_settings)
ON CONFLICT (user_id) DO NOTHING;
