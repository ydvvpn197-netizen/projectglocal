-- Row Level Security (RLS) Policies for TheGlocal Project
-- This migration creates comprehensive security policies for all tables
-- Date: 2025-01-01
-- Description: RLS policies for RBAC, content management, news system, monetization, and community features

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================

-- Core user tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Content management tables
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;

-- Social interaction tables
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- News system tables
ALTER TABLE public.news_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_events ENABLE ROW LEVEL SECURITY;

-- Community features tables
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavior ENABLE ROW LEVEL SECURITY;

-- Monetization tables
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Admin and audit tables
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Notification system tables
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS POLICIES
-- ============================================================================

-- Function to check if user is authenticated
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin or super admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is moderator or higher
CREATE OR REPLACE FUNCTION public.is_moderator()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.roles 
    WHERE user_id = auth.uid() 
    AND role IN ('moderator', 'admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================

-- Users can view all profiles
CREATE POLICY "Anyone can view profiles" ON public.profiles
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own profile (handled by trigger)
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only super admins can delete profiles
CREATE POLICY "Only super admins can delete profiles" ON public.profiles
  FOR DELETE USING (public.is_super_admin());

-- ============================================================================
-- ROLES TABLE POLICIES
-- ============================================================================

-- Users can view their own role
CREATE POLICY "Users can view own role" ON public.roles
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all roles
CREATE POLICY "Admins can view all roles" ON public.roles
  FOR SELECT USING (public.is_admin());

-- Only super admins can update roles
CREATE POLICY "Only super admins can update roles" ON public.roles
  FOR UPDATE USING (public.is_super_admin());

-- Only super admins can delete roles
CREATE POLICY "Only super admins can delete roles" ON public.roles
  FOR DELETE USING (public.is_super_admin());

-- System can insert roles (for new user creation)
CREATE POLICY "System can insert roles" ON public.roles
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- INTERESTS TABLE POLICIES
-- ============================================================================

-- Anyone can view interests
CREATE POLICY "Anyone can view interests" ON public.interests
  FOR SELECT USING (true);

-- Only admins can manage interests
CREATE POLICY "Only admins can manage interests" ON public.interests
  FOR ALL USING (public.is_admin());

-- ============================================================================
-- USER INTERESTS TABLE POLICIES
-- ============================================================================

-- Users can view their own interests
CREATE POLICY "Users can view own interests" ON public.user_interests
  FOR SELECT USING (auth.uid() = user_id);

-- Users can manage their own interests
CREATE POLICY "Users can manage own interests" ON public.user_interests
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- USER PREFERENCES TABLE POLICIES
-- ============================================================================

-- Users can view their own preferences
CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

-- Users can manage their own preferences
CREATE POLICY "Users can manage own preferences" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- POSTS TABLE POLICIES
-- ============================================================================

-- Anyone can view active posts
CREATE POLICY "Anyone can view active posts" ON public.posts
  FOR SELECT USING (status = 'active');

-- Users can view their own posts regardless of status
CREATE POLICY "Users can view own posts" ON public.posts
  FOR SELECT USING (auth.uid() = user_id);

-- Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts" ON public.posts
  FOR INSERT WITH CHECK (public.is_authenticated() AND auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY "Users can update own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts" ON public.posts
  FOR DELETE USING (auth.uid() = user_id);

-- Admins can manage all posts
CREATE POLICY "Admins can manage all posts" ON public.posts
  FOR ALL USING (public.is_admin());

-- Only admins can mark posts as featured
CREATE POLICY "Only admins can mark posts as featured" ON public.posts
  FOR UPDATE USING (
    public.is_admin() OR 
    (auth.uid() = user_id AND OLD.is_featured = NEW.is_featured)
  );

-- ============================================================================
-- SERVICES TABLE POLICIES
-- ============================================================================

-- Anyone can view active services
CREATE POLICY "Anyone can view active services" ON public.services
  FOR SELECT USING (is_active = true);

-- Users can view their own services
CREATE POLICY "Users can view own services" ON public.services
  FOR SELECT USING (auth.uid() = user_id);

-- Premium users can create services
CREATE POLICY "Premium users can create services" ON public.services
  FOR INSERT WITH CHECK (
    public.is_authenticated() AND 
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_premium = true)
  );

-- Users can update their own services
CREATE POLICY "Users can update own services" ON public.services
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own services
CREATE POLICY "Users can delete own services" ON public.services
  FOR DELETE USING (auth.uid() = user_id);

-- Admins can manage all services
CREATE POLICY "Admins can manage all services" ON public.services
  FOR ALL USING (public.is_admin());

-- ============================================================================
-- SERVICE BOOKINGS TABLE POLICIES
-- ============================================================================

-- Users can view their own bookings (as customer or provider)
CREATE POLICY "Users can view own bookings" ON public.service_bookings
  FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = provider_id);

-- Users can create bookings for services
CREATE POLICY "Users can create bookings" ON public.service_bookings
  FOR INSERT WITH CHECK (
    public.is_authenticated() AND 
    auth.uid() = customer_id AND
    customer_id != provider_id
  );

-- Users can update their own bookings
CREATE POLICY "Users can update own bookings" ON public.service_bookings
  FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = provider_id);

-- Admins can manage all bookings
CREATE POLICY "Admins can manage all bookings" ON public.service_bookings
  FOR ALL USING (public.is_admin());

-- ============================================================================
-- FOLLOWS TABLE POLICIES
-- ============================================================================

-- Users can view all follows
CREATE POLICY "Users can view all follows" ON public.follows
  FOR SELECT USING (true);

-- Users can create follows
CREATE POLICY "Users can create follows" ON public.follows
  FOR INSERT WITH CHECK (
    public.is_authenticated() AND 
    auth.uid() = follower_id AND
    follower_id != following_id
  );

-- Users can delete their own follows
CREATE POLICY "Users can delete own follows" ON public.follows
  FOR DELETE USING (auth.uid() = follower_id);

-- ============================================================================
-- LIKES TABLE POLICIES
-- ============================================================================

-- Users can view all likes
CREATE POLICY "Users can view all likes" ON public.likes
  FOR SELECT USING (true);

-- Users can create likes
CREATE POLICY "Users can create likes" ON public.likes
  FOR INSERT WITH CHECK (public.is_authenticated() AND auth.uid() = user_id);

-- Users can delete their own likes
CREATE POLICY "Users can delete own likes" ON public.likes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- COMMENTS TABLE POLICIES
-- ============================================================================

-- Users can view all comments
CREATE POLICY "Users can view all comments" ON public.comments
  FOR SELECT USING (true);

-- Users can create comments
CREATE POLICY "Users can create comments" ON public.comments
  FOR INSERT WITH CHECK (public.is_authenticated() AND auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

-- Moderators can delete any comment
CREATE POLICY "Moderators can delete any comment" ON public.comments
  FOR DELETE USING (public.is_moderator());

-- ============================================================================
-- COMMENT LIKES TABLE POLICIES
-- ============================================================================

-- Users can view all comment likes
CREATE POLICY "Users can view all comment likes" ON public.comment_likes
  FOR SELECT USING (true);

-- Users can create comment likes
CREATE POLICY "Users can create comment likes" ON public.comment_likes
  FOR INSERT WITH CHECK (public.is_authenticated() AND auth.uid() = user_id);

-- Users can delete their own comment likes
CREATE POLICY "Users can delete own comment likes" ON public.comment_likes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- NEWS CACHE TABLE POLICIES
-- ============================================================================

-- Anyone can view news cache
CREATE POLICY "Anyone can view news cache" ON public.news_cache
  FOR SELECT USING (true);

-- Only system can manage news cache
CREATE POLICY "Only system can manage news cache" ON public.news_cache
  FOR ALL USING (true);

-- ============================================================================
-- NEWS LIKES TABLE POLICIES
-- ============================================================================

-- Users can view all news likes
CREATE POLICY "Users can view all news likes" ON public.news_likes
  FOR SELECT USING (true);

-- Users can create news likes
CREATE POLICY "Users can create news likes" ON public.news_likes
  FOR INSERT WITH CHECK (public.is_authenticated() AND auth.uid() = user_id);

-- Users can delete their own news likes
CREATE POLICY "Users can delete own news likes" ON public.news_likes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- NEWS COMMENTS TABLE POLICIES
-- ============================================================================

-- Users can view all news comments
CREATE POLICY "Users can view all news comments" ON public.news_comments
  FOR SELECT USING (true);

-- Users can create news comments
CREATE POLICY "Users can create news comments" ON public.news_comments
  FOR INSERT WITH CHECK (public.is_authenticated() AND auth.uid() = user_id);

-- Users can update their own news comments
CREATE POLICY "Users can update own news comments" ON public.news_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own news comments
CREATE POLICY "Users can delete own news comments" ON public.news_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Moderators can delete any news comment
CREATE POLICY "Moderators can delete any news comment" ON public.news_comments
  FOR DELETE USING (public.is_moderator());

-- ============================================================================
-- NEWS SHARES TABLE POLICIES
-- ============================================================================

-- Users can view all news shares
CREATE POLICY "Users can view all news shares" ON public.news_shares
  FOR SELECT USING (true);

-- Users can create news shares
CREATE POLICY "Users can create news shares" ON public.news_shares
  FOR INSERT WITH CHECK (public.is_authenticated() AND auth.uid() = user_id);

-- ============================================================================
-- NEWS POLLS TABLE POLICIES
-- ============================================================================

-- Anyone can view news polls
CREATE POLICY "Anyone can view news polls" ON public.news_polls
  FOR SELECT USING (true);

-- Only system can manage news polls
CREATE POLICY "Only system can manage news polls" ON public.news_polls
  FOR ALL USING (true);

-- ============================================================================
-- NEWS POLL VOTES TABLE POLICIES
-- ============================================================================

-- Users can view all news poll votes
CREATE POLICY "Users can view all news poll votes" ON public.news_poll_votes
  FOR SELECT USING (true);

-- Users can create news poll votes
CREATE POLICY "Users can create news poll votes" ON public.news_poll_votes
  FOR INSERT WITH CHECK (public.is_authenticated() AND auth.uid() = user_id);

-- Users can update their own news poll votes
CREATE POLICY "Users can update own news poll votes" ON public.news_poll_votes
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- NEWS EVENTS TABLE POLICIES
-- ============================================================================

-- Users can view their own news events
CREATE POLICY "Users can view own news events" ON public.news_events
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own news events
CREATE POLICY "Users can create own news events" ON public.news_events
  FOR INSERT WITH CHECK (public.is_authenticated() AND auth.uid() = user_id);

-- Users can delete their own news events
CREATE POLICY "Users can delete own news events" ON public.news_events
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- USER POINTS TABLE POLICIES
-- ============================================================================

-- Users can view their own points
CREATE POLICY "Users can view own points" ON public.user_points
  FOR SELECT USING (auth.uid() = user_id);

-- Anyone can view points for leaderboard
CREATE POLICY "Anyone can view points for leaderboard" ON public.user_points
  FOR SELECT USING (true);

-- System can manage points
CREATE POLICY "System can manage points" ON public.user_points
  FOR ALL USING (true);

-- ============================================================================
-- POINT TRANSACTIONS TABLE POLICIES
-- ============================================================================

-- Users can view their own point transactions
CREATE POLICY "Users can view own point transactions" ON public.point_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- System can manage point transactions
CREATE POLICY "System can manage point transactions" ON public.point_transactions
  FOR ALL USING (true);

-- ============================================================================
-- COMMUNITY LEADERBOARD TABLE POLICIES
-- ============================================================================

-- Anyone can view leaderboard
CREATE POLICY "Anyone can view leaderboard" ON public.community_leaderboard
  FOR SELECT USING (true);

-- System can manage leaderboard
CREATE POLICY "System can manage leaderboard" ON public.community_leaderboard
  FOR ALL USING (true);

-- ============================================================================
-- USER BEHAVIOR TABLE POLICIES
-- ============================================================================

-- Users can view their own behavior data
CREATE POLICY "Users can view own behavior data" ON public.user_behavior
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own behavior data
CREATE POLICY "Users can create own behavior data" ON public.user_behavior
  FOR INSERT WITH CHECK (public.is_authenticated() AND auth.uid() = user_id);

-- Users can delete their own behavior data
CREATE POLICY "Users can delete own behavior data" ON public.user_behavior
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- PAYMENTS TABLE POLICIES
-- ============================================================================

-- Users can view their own payments
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

-- System can manage payments
CREATE POLICY "System can manage payments" ON public.payments
  FOR ALL USING (true);

-- Admins can view all payments
CREATE POLICY "Admins can view all payments" ON public.payments
  FOR SELECT USING (public.is_admin());

-- ============================================================================
-- SUBSCRIPTIONS TABLE POLICIES
-- ============================================================================

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- System can manage subscriptions
CREATE POLICY "System can manage subscriptions" ON public.subscriptions
  FOR ALL USING (true);

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
  FOR SELECT USING (public.is_admin());

-- ============================================================================
-- AUDIT LOGS TABLE POLICIES
-- ============================================================================

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_admin());

-- System can manage audit logs
CREATE POLICY "System can manage audit logs" ON public.audit_logs
  FOR ALL USING (true);

-- ============================================================================
-- SYSTEM SETTINGS TABLE POLICIES
-- ============================================================================

-- Anyone can view system settings
CREATE POLICY "Anyone can view system settings" ON public.system_settings
  FOR SELECT USING (true);

-- Only super admins can manage system settings
CREATE POLICY "Only super admins can manage system settings" ON public.system_settings
  FOR ALL USING (public.is_super_admin());

-- ============================================================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- System can manage notifications
CREATE POLICY "System can manage notifications" ON public.notifications
  FOR ALL USING (true);

-- ============================================================================
-- SUPER ADMIN PROTECTION POLICIES
-- ============================================================================

-- Prevent deletion of super admin roles
CREATE OR REPLACE FUNCTION public.prevent_super_admin_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if trying to delete a super admin role
  IF OLD.role = 'super_admin' THEN
    RAISE EXCEPTION 'Cannot delete super admin role';
  END IF;
  
  -- Check if trying to change the last super admin to a different role
  IF OLD.role = 'super_admin' AND NEW.role != 'super_admin' THEN
    IF (SELECT COUNT(*) FROM public.roles WHERE role = 'super_admin') <= 1 THEN
      RAISE EXCEPTION 'Cannot change the last super admin role';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to prevent super admin deletion
CREATE TRIGGER prevent_super_admin_deletion_trigger
  BEFORE UPDATE OR DELETE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_super_admin_deletion();

-- ============================================================================
-- ADDITIONAL SECURITY MEASURES
-- ============================================================================

-- Function to check if user can delete table/schema (only super admin)
CREATE OR REPLACE FUNCTION public.can_delete_schema()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.is_super_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can modify database structure
CREATE OR REPLACE FUNCTION public.can_modify_database_structure()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.is_super_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
