-- ============================================================================
-- RLS SECURITY POLICIES - TheGlocal Project
-- ============================================================================
-- This migration adds comprehensive Row Level Security policies
-- Date: 2025-01-28
-- Version: 1.0.2

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================

-- Enable RLS on all existing tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_protests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protest_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_admin_users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================

-- Users can view all public profiles
CREATE POLICY "Users can view public profiles" ON public.profiles
  FOR SELECT USING (
    privacy_level = 'public' OR 
    (privacy_level = 'private' AND auth.uid() = user_id) OR
    (privacy_level = 'anonymous' AND auth.uid() = user_id)
  );

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own profile
CREATE POLICY "Users can delete their own profile" ON public.profiles
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- COMMUNITIES TABLE POLICIES
-- ============================================================================

-- Users can view all communities
CREATE POLICY "Users can view all communities" ON public.communities
  FOR SELECT USING (true);

-- Users can create communities
CREATE POLICY "Users can create communities" ON public.communities
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Users can update communities they created
CREATE POLICY "Users can update their own communities" ON public.communities
  FOR UPDATE USING (auth.uid() = created_by);

-- Users can delete communities they created
CREATE POLICY "Users can delete their own communities" ON public.communities
  FOR DELETE USING (auth.uid() = created_by);

-- ============================================================================
-- POSTS TABLE POLICIES
-- ============================================================================

-- Users can view all posts
CREATE POLICY "Users can view all posts" ON public.posts
  FOR SELECT USING (true);

-- Users can create posts
CREATE POLICY "Users can create posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Users can update their own posts
CREATE POLICY "Users can update their own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete their own posts" ON public.posts
  FOR DELETE USING (auth.uid() = author_id);

-- ============================================================================
-- COMMENTS TABLE POLICIES
-- ============================================================================

-- Users can view all comments
CREATE POLICY "Users can view all comments" ON public.comments
  FOR SELECT USING (true);

-- Users can create comments
CREATE POLICY "Users can create comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = author_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments" ON public.comments
  FOR DELETE USING (auth.uid() = author_id);

-- ============================================================================
-- EVENTS TABLE POLICIES
-- ============================================================================

-- Users can view all events
CREATE POLICY "Users can view all events" ON public.events
  FOR SELECT USING (true);

-- Users can create events
CREATE POLICY "Users can create events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own events
CREATE POLICY "Users can update their own events" ON public.events
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own events
CREATE POLICY "Users can delete their own events" ON public.events
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- EVENT ATTENDEES TABLE POLICIES
-- ============================================================================

-- Users can view all event attendees
CREATE POLICY "Users can view all event attendees" ON public.event_attendees
  FOR SELECT USING (true);

-- Users can create their own event attendance
CREATE POLICY "Users can create their own event attendance" ON public.event_attendees
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own event attendance
CREATE POLICY "Users can update their own event attendance" ON public.event_attendees
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own event attendance
CREATE POLICY "Users can delete their own event attendance" ON public.event_attendees
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- POST LIKES TABLE POLICIES
-- ============================================================================

-- Users can view all post likes
CREATE POLICY "Users can view all post likes" ON public.post_likes
  FOR SELECT USING (true);

-- Users can create their own post likes
CREATE POLICY "Users can create their own post likes" ON public.post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own post likes
CREATE POLICY "Users can delete their own post likes" ON public.post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- POST SHARES TABLE POLICIES
-- ============================================================================

-- Users can view all post shares
CREATE POLICY "Users can view all post shares" ON public.post_shares
  FOR SELECT USING (true);

-- Users can create their own post shares
CREATE POLICY "Users can create their own post shares" ON public.post_shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own post shares
CREATE POLICY "Users can delete their own post shares" ON public.post_shares
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- COMMENT LIKES TABLE POLICIES
-- ============================================================================

-- Users can view all comment likes
CREATE POLICY "Users can view all comment likes" ON public.comment_likes
  FOR SELECT USING (true);

-- Users can create their own comment likes
CREATE POLICY "Users can create their own comment likes" ON public.comment_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comment likes
CREATE POLICY "Users can delete their own comment likes" ON public.comment_likes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- USER INTERESTS TABLE POLICIES
-- ============================================================================

-- Users can view all user interests
CREATE POLICY "Users can view all user interests" ON public.user_interests
  FOR SELECT USING (true);

-- Users can create their own user interests
CREATE POLICY "Users can create their own user interests" ON public.user_interests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own user interests
CREATE POLICY "Users can update their own user interests" ON public.user_interests
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own user interests
CREATE POLICY "Users can delete their own user interests" ON public.user_interests
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- INTERESTS TABLE POLICIES
-- ============================================================================

-- Users can view all interests
CREATE POLICY "Users can view all interests" ON public.interests
  FOR SELECT USING (true);

-- Only admins can create interests
CREATE POLICY "Only admins can create interests" ON public.interests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Only admins can update interests
CREATE POLICY "Only admins can update interests" ON public.interests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Only admins can delete interests
CREATE POLICY "Only admins can delete interests" ON public.interests
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- VIRTUAL PROTESTS TABLE POLICIES
-- ============================================================================

-- Users can view all virtual protests
CREATE POLICY "Users can view all virtual protests" ON public.virtual_protests
  FOR SELECT USING (true);

-- Users can create virtual protests
CREATE POLICY "Users can create virtual protests" ON public.virtual_protests
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);

-- Users can update their own virtual protests
CREATE POLICY "Users can update their own virtual protests" ON public.virtual_protests
  FOR UPDATE USING (auth.uid() = organizer_id);

-- Users can delete their own virtual protests
CREATE POLICY "Users can delete their own virtual protests" ON public.virtual_protests
  FOR DELETE USING (auth.uid() = organizer_id);

-- ============================================================================
-- PROTEST ATTENDEES TABLE POLICIES
-- ============================================================================

-- Users can view all protest attendees
CREATE POLICY "Users can view all protest attendees" ON public.protest_attendees
  FOR SELECT USING (true);

-- Users can create their own protest attendance
CREATE POLICY "Users can create their own protest attendance" ON public.protest_attendees
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own protest attendance
CREATE POLICY "Users can update their own protest attendance" ON public.protest_attendees
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own protest attendance
CREATE POLICY "Users can delete their own protest attendance" ON public.protest_attendees
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- NEWS ARTICLES TABLE POLICIES
-- ============================================================================

-- Users can view all news articles
CREATE POLICY "Users can view all news articles" ON public.news_articles
  FOR SELECT USING (true);

-- Only admins can create news articles
CREATE POLICY "Only admins can create news articles" ON public.news_articles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Only admins can update news articles
CREATE POLICY "Only admins can update news articles" ON public.news_articles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Only admins can delete news articles
CREATE POLICY "Only admins can delete news articles" ON public.news_articles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- ARTICLE LIKES TABLE POLICIES
-- ============================================================================

-- Users can view all article likes
CREATE POLICY "Users can view all article likes" ON public.article_likes
  FOR SELECT USING (true);

-- Users can create their own article likes
CREATE POLICY "Users can create their own article likes" ON public.article_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own article likes
CREATE POLICY "Users can delete their own article likes" ON public.article_likes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- ARTICLE SHARES TABLE POLICIES
-- ============================================================================

-- Users can view all article shares
CREATE POLICY "Users can view all article shares" ON public.article_shares
  FOR SELECT USING (true);

-- Users can create their own article shares
CREATE POLICY "Users can create their own article shares" ON public.article_shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own article shares
CREATE POLICY "Users can delete their own article shares" ON public.article_shares
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- ARTICLE COMMENTS TABLE POLICIES
-- ============================================================================

-- Users can view all article comments
CREATE POLICY "Users can view all article comments" ON public.article_comments
  FOR SELECT USING (true);

-- Users can create article comments
CREATE POLICY "Users can create article comments" ON public.article_comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Users can update their own article comments
CREATE POLICY "Users can update their own article comments" ON public.article_comments
  FOR UPDATE USING (auth.uid() = author_id);

-- Users can delete their own article comments
CREATE POLICY "Users can delete their own article comments" ON public.article_comments
  FOR DELETE USING (auth.uid() = author_id);

-- ============================================================================
-- USER FOLLOWS TABLE POLICIES
-- ============================================================================

-- Users can view all user follows
CREATE POLICY "Users can view all user follows" ON public.user_follows
  FOR SELECT USING (true);

-- Users can create their own user follows
CREATE POLICY "Users can create their own user follows" ON public.user_follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- Users can delete their own user follows
CREATE POLICY "Users can delete their own user follows" ON public.user_follows
  FOR DELETE USING (auth.uid() = follower_id);

-- ============================================================================
-- COMMUNITY FOLLOWS TABLE POLICIES
-- ============================================================================

-- Users can view all community follows
CREATE POLICY "Users can view all community follows" ON public.community_follows
  FOR SELECT USING (true);

-- Users can create their own community follows
CREATE POLICY "Users can create their own community follows" ON public.community_follows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own community follows
CREATE POLICY "Users can delete their own community follows" ON public.community_follows
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================================================

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own notifications
CREATE POLICY "Users can create their own notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own notifications
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- USER SETTINGS TABLE POLICIES
-- ============================================================================

-- Users can view their own settings
CREATE POLICY "Users can view their own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own settings
CREATE POLICY "Users can create their own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own settings
CREATE POLICY "Users can update their own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own settings
CREATE POLICY "Users can delete their own settings" ON public.user_settings
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- REPORTS TABLE POLICIES
-- ============================================================================

-- Users can view their own reports
CREATE POLICY "Users can view their own reports" ON public.reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- Users can create reports
CREATE POLICY "Users can create reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Only admins can update reports
CREATE POLICY "Only admins can update reports" ON public.reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Only admins can delete reports
CREATE POLICY "Only admins can delete reports" ON public.reports
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- MODERATION ACTIONS TABLE POLICIES
-- ============================================================================

-- Only admins can view moderation actions
CREATE POLICY "Only admins can view moderation actions" ON public.moderation_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Only admins can create moderation actions
CREATE POLICY "Only admins can create moderation actions" ON public.moderation_actions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Only admins can update moderation actions
CREATE POLICY "Only admins can update moderation actions" ON public.moderation_actions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Only admins can delete moderation actions
CREATE POLICY "Only admins can delete moderation actions" ON public.moderation_actions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- ADMIN USERS TABLE POLICIES
-- ============================================================================

-- Only super admins can view admin users
CREATE POLICY "Only super admins can view admin users" ON public.admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.super_admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Only super admins can create admin users
CREATE POLICY "Only super admins can create admin users" ON public.admin_users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.super_admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Only super admins can update admin users
CREATE POLICY "Only super admins can update admin users" ON public.admin_users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.super_admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Only super admins can delete admin users
CREATE POLICY "Only super admins can delete admin users" ON public.admin_users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.super_admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- SUPER ADMIN USERS TABLE POLICIES
-- ============================================================================

-- Only super admins can view super admin users
CREATE POLICY "Only super admins can view super admin users" ON public.super_admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.super_admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Only super admins can create super admin users
CREATE POLICY "Only super admins can create super admin users" ON public.super_admin_users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.super_admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Only super admins can update super admin users
CREATE POLICY "Only super admins can update super admin users" ON public.super_admin_users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.super_admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Only super admins can delete super admin users
CREATE POLICY "Only super admins can delete super admin users" ON public.super_admin_users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.super_admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
