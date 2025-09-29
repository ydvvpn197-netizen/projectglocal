-- Migration: RLS Baseline Security Implementation
-- Date: 2025-01-28
-- Description: Complete RLS policies for all tables and fix security gaps

-- Enable RLS on all existing tables that might not have it
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;

-- Create helper function to check if user is moderator/admin
CREATE OR REPLACE FUNCTION is_moderator_or_admin(check_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
    target_user_id UUID;
BEGIN
    -- Use provided user ID or current auth user
    target_user_id := COALESCE(check_user_id, auth.uid());
    
    -- Get user role
    SELECT role INTO user_role FROM public.profiles WHERE id = target_user_id;
    
    -- Return true if user is moderator or admin
    RETURN user_role IN ('moderator', 'admin', 'super_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user can moderate content
CREATE OR REPLACE FUNCTION can_moderate_content()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN is_moderator_or_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- PROFILES TABLE POLICIES
-- Users can view public profile information
CREATE POLICY "profiles_select_public" ON public.profiles
    FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Moderators can update any profile
CREATE POLICY "profiles_update_moderators" ON public.profiles
    FOR UPDATE USING (can_moderate_content())
    WITH CHECK (can_moderate_content());

-- POSTS TABLE POLICIES
DROP POLICY IF EXISTS "Users can view public posts" ON public.posts;
DROP POLICY IF EXISTS "Users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;

CREATE POLICY "posts_select_public" ON public.posts
    FOR SELECT USING (
        is_public = true OR 
        auth.uid() = author_id OR 
        EXISTS (
            SELECT 1 FROM public.community_members 
            WHERE community_id = posts.community_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "posts_insert_authenticated" ON public.posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "posts_update_own" ON public.posts
    FOR UPDATE USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "posts_delete_own" ON public.posts
    FOR DELETE USING (auth.uid() = author_id);

-- Moderators can moderate any post
CREATE POLICY "posts_moderate_moderators" ON public.posts
    FOR ALL USING (can_moderate_content())
    WITH CHECK (can_moderate_content());

-- COMMUNITIES TABLE POLICIES
DROP POLICY IF EXISTS "Users can view public communities" ON public.communities;
DROP POLICY IF EXISTS "Users can create communities" ON public.communities;
DROP POLICY IF EXISTS "Users can update their own communities" ON public.communities;

CREATE POLICY "communities_select_public" ON public.communities
    FOR SELECT USING (is_public = true OR auth.uid() = creator_id);

CREATE POLICY "communities_insert_authenticated" ON public.communities
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "communities_update_own" ON public.communities
    FOR UPDATE USING (auth.uid() = creator_id)
    WITH CHECK (auth.uid() = creator_id);

-- COMMUNITY_MEMBERS TABLE POLICIES
DROP POLICY IF EXISTS "Users can view community members" ON public.community_members;
DROP POLICY IF EXISTS "Users can join communities" ON public.community_members;
DROP POLICY IF EXISTS "Users can leave communities" ON public.community_members;

CREATE POLICY "community_members_select_public" ON public.community_members
    FOR SELECT USING (true);

CREATE POLICY "community_members_insert_own" ON public.community_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "community_members_delete_own" ON public.community_members
    FOR DELETE USING (auth.uid() = user_id);

-- COMMENTS TABLE POLICIES
DROP POLICY IF EXISTS "Users can view comments" ON public.comments;
DROP POLICY IF EXISTS "Users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;

CREATE POLICY "comments_select_public" ON public.comments
    FOR SELECT USING (true);

CREATE POLICY "comments_insert_authenticated" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "comments_update_own" ON public.comments
    FOR UPDATE USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "comments_delete_own" ON public.comments
    FOR DELETE USING (auth.uid() = author_id);

-- EVENTS TABLE POLICIES
DROP POLICY IF EXISTS "Users can view public events" ON public.events;
DROP POLICY IF EXISTS "Users can create events" ON public.events;
DROP POLICY IF EXISTS "Users can update their own events" ON public.events;

CREATE POLICY "events_select_public" ON public.events
    FOR SELECT USING (is_public = true OR auth.uid() = organizer_id);

CREATE POLICY "events_insert_authenticated" ON public.events
    FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "events_update_own" ON public.events
    FOR UPDATE USING (auth.uid() = organizer_id)
    WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "events_delete_own" ON public.events
    FOR DELETE USING (auth.uid() = organizer_id);

-- POLLS TABLE POLICIES
DROP POLICY IF EXISTS "Users can view public polls" ON public.polls;
DROP POLICY IF EXISTS "Users can create polls" ON public.polls;
DROP POLICY IF EXISTS "Users can update their own polls" ON public.polls;

CREATE POLICY "polls_select_public" ON public.polls
    FOR SELECT USING (is_public = true OR auth.uid() = creator_id);

CREATE POLICY "polls_insert_authenticated" ON public.polls
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "polls_update_own" ON public.polls
    FOR UPDATE USING (auth.uid() = creator_id)
    WITH CHECK (auth.uid() = creator_id);

-- POLL_VOTES TABLE POLICIES
DROP POLICY IF EXISTS "Users can view poll votes" ON public.poll_votes;
DROP POLICY IF EXISTS "Users can vote in polls" ON public.poll_votes;
DROP POLICY IF EXISTS "Users can update their own votes" ON public.poll_votes;

CREATE POLICY "poll_votes_select_public" ON public.poll_votes
    FOR SELECT USING (true);

CREATE POLICY "poll_votes_insert_authenticated" ON public.poll_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "poll_votes_update_own" ON public.poll_votes
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "poll_votes_delete_own" ON public.poll_votes
    FOR DELETE USING (auth.uid() = user_id);

-- FOLLOWS TABLE POLICIES
DROP POLICY IF EXISTS "Users can view follows" ON public.follows;
DROP POLICY IF EXISTS "Users can follow others" ON public.follows;
DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;

CREATE POLICY "follows_select_public" ON public.follows
    FOR SELECT USING (true);

CREATE POLICY "follows_insert_authenticated" ON public.follows
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "follows_delete_own" ON public.follows
    FOR DELETE USING (auth.uid() = follower_id);

-- CHATS TABLE POLICIES
DROP POLICY IF EXISTS "Users can view their chats" ON public.chats;
DROP POLICY IF EXISTS "Users can create chats" ON public.chats;
DROP POLICY IF EXISTS "Users can update their chats" ON public.chats;

CREATE POLICY "chats_select_participants" ON public.chats
    FOR SELECT USING (
        auth.uid() = ANY(participants) OR 
        auth.uid() = creator_id
    );

CREATE POLICY "chats_insert_authenticated" ON public.chats
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "chats_update_creator" ON public.chats
    FOR UPDATE USING (auth.uid() = creator_id)
    WITH CHECK (auth.uid() = creator_id);

-- MESSAGES TABLE POLICIES
DROP POLICY IF EXISTS "Users can view messages in their chats" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

CREATE POLICY "messages_select_participants" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chats 
            WHERE chats.id = messages.chat_id 
            AND (auth.uid() = ANY(chats.participants) OR auth.uid() = chats.creator_id)
        )
    );

CREATE POLICY "messages_insert_authenticated" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "messages_update_own" ON public.messages
    FOR UPDATE USING (auth.uid() = sender_id)
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "messages_delete_own" ON public.messages
    FOR DELETE USING (auth.uid() = sender_id);

-- REPORTS TABLE POLICIES
DROP POLICY IF EXISTS "Users can create reports" ON public.reports;
DROP POLICY IF EXISTS "Moderators can view reports" ON public.reports;
DROP POLICY IF EXISTS "Moderators can update reports" ON public.reports;

CREATE POLICY "reports_insert_authenticated" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "reports_select_moderators" ON public.reports
    FOR SELECT USING (can_moderate_content());

CREATE POLICY "reports_update_moderators" ON public.reports
    FOR UPDATE USING (can_moderate_content())
    WITH CHECK (can_moderate_content());

-- MODERATION_ACTIONS TABLE POLICIES
DROP POLICY IF EXISTS "Moderators can view moderation actions" ON public.moderation_actions;
DROP POLICY IF EXISTS "Moderators can create moderation actions" ON public.moderation_actions;
DROP POLICY IF EXISTS "Moderators can update moderation actions" ON public.moderation_actions;

CREATE POLICY "moderation_actions_select_moderators" ON public.moderation_actions
    FOR SELECT USING (can_moderate_content());

CREATE POLICY "moderation_actions_insert_moderators" ON public.moderation_actions
    FOR INSERT WITH CHECK (can_moderate_content());

CREATE POLICY "moderation_actions_update_moderators" ON public.moderation_actions
    FOR UPDATE USING (can_moderate_content())
    WITH CHECK (can_moderate_content());

-- Create audit log function for sensitive operations
CREATE OR REPLACE FUNCTION log_moderation_action(
    action_type TEXT,
    target_type TEXT,
    target_id UUID,
    details JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID AS $$
DECLARE
    action_id UUID;
BEGIN
    INSERT INTO public.moderation_actions (
        moderator_id,
        action_type,
        target_type,
        target_id,
        details,
        created_at
    ) VALUES (
        auth.uid(),
        action_type,
        target_type,
        target_id,
        details,
        NOW()
    ) RETURNING id INTO action_id;
    
    RETURN action_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION is_moderator_or_admin(UUID) IS 'Checks if a user has moderator or admin privileges';
COMMENT ON FUNCTION can_moderate_content() IS 'Checks if the current user can moderate content';
COMMENT ON FUNCTION log_moderation_action(TEXT, TEXT, UUID, JSONB) IS 'Logs moderation actions for audit trail';
