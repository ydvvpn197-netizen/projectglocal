-- Migration: Comprehensive RLS Baseline Security Implementation
-- Date: 2025-01-28
-- Description: Complete RLS policies for all tables with privacy-first defaults

-- Enable RLS on all existing tables
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.news_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.news_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.security_audit ENABLE ROW LEVEL SECURITY;

-- Create helper functions for role checking
CREATE OR REPLACE FUNCTION is_moderator_or_admin(check_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
    target_user_id UUID;
BEGIN
    target_user_id := COALESCE(check_user_id, auth.uid());
    
    -- Check if user exists and has a role
    IF target_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    SELECT role INTO user_role FROM public.profiles WHERE id = target_user_id;
    
    RETURN COALESCE(user_role IN ('moderator', 'admin', 'super_admin'), FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION can_moderate_content()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN is_moderator_or_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_authenticated_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_moderators" ON public.profiles;

-- PROFILES TABLE POLICIES (Privacy-first)
CREATE POLICY "profiles_select_public" ON public.profiles
    FOR SELECT USING (
        -- Allow public access to basic profile info only
        is_public = true OR 
        auth.uid() = id OR 
        is_moderator_or_admin()
    );

CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON public.profiles
    FOR DELETE USING (auth.uid() = id);

-- Moderators can manage any profile
CREATE POLICY "profiles_moderate_admin" ON public.profiles
    FOR ALL USING (can_moderate_content())
    WITH CHECK (can_moderate_content());

-- POSTS TABLE POLICIES
DROP POLICY IF EXISTS "posts_select_public" ON public.posts;
DROP POLICY IF EXISTS "posts_insert_authenticated" ON public.posts;
DROP POLICY IF EXISTS "posts_update_own" ON public.posts;
DROP POLICY IF EXISTS "posts_delete_own" ON public.posts;
DROP POLICY IF EXISTS "posts_moderate_moderators" ON public.posts;

CREATE POLICY "posts_select_public" ON public.posts
    FOR SELECT USING (
        is_public = true OR 
        auth.uid() = author_id OR 
        EXISTS (
            SELECT 1 FROM public.community_members 
            WHERE community_id = posts.community_id 
            AND user_id = auth.uid()
        ) OR
        can_moderate_content()
    );

CREATE POLICY "posts_insert_authenticated" ON public.posts
    FOR INSERT WITH CHECK (auth.uid() = author_id AND is_authenticated_user());

CREATE POLICY "posts_update_own" ON public.posts
    FOR UPDATE USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "posts_delete_own" ON public.posts
    FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "posts_moderate_admin" ON public.posts
    FOR ALL USING (can_moderate_content())
    WITH CHECK (can_moderate_content());

-- COMMUNITIES TABLE POLICIES
DROP POLICY IF EXISTS "communities_select_public" ON public.communities;
DROP POLICY IF EXISTS "communities_insert_authenticated" ON public.communities;
DROP POLICY IF EXISTS "communities_update_own" ON public.communities;
DROP POLICY IF EXISTS "communities_delete_own" ON public.communities;

CREATE POLICY "communities_select_public" ON public.communities
    FOR SELECT USING (
        is_public = true OR 
        auth.uid() = creator_id OR
        EXISTS (
            SELECT 1 FROM public.community_members 
            WHERE community_id = communities.id 
            AND user_id = auth.uid()
        ) OR
        can_moderate_content()
    );

CREATE POLICY "communities_insert_authenticated" ON public.communities
    FOR INSERT WITH CHECK (auth.uid() = creator_id AND is_authenticated_user());

CREATE POLICY "communities_update_own" ON public.communities
    FOR UPDATE USING (auth.uid() = creator_id)
    WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "communities_delete_own" ON public.communities
    FOR DELETE USING (auth.uid() = creator_id);

CREATE POLICY "communities_moderate_admin" ON public.communities
    FOR ALL USING (can_moderate_content())
    WITH CHECK (can_moderate_content());

-- COMMUNITY_MEMBERS TABLE POLICIES
DROP POLICY IF EXISTS "community_members_select_public" ON public.community_members;
DROP POLICY IF EXISTS "community_members_insert_own" ON public.community_members;
DROP POLICY IF EXISTS "community_members_delete_own" ON public.community_members;

CREATE POLICY "community_members_select_public" ON public.community_members
    FOR SELECT USING (
        true -- Allow public access to membership lists
    );

CREATE POLICY "community_members_insert_own" ON public.community_members
    FOR INSERT WITH CHECK (auth.uid() = user_id AND is_authenticated_user());

CREATE POLICY "community_members_delete_own" ON public.community_members
    FOR DELETE USING (auth.uid() = user_id);

-- COMMENTS TABLE POLICIES
DROP POLICY IF EXISTS "comments_select_public" ON public.comments;
DROP POLICY IF EXISTS "comments_insert_authenticated" ON public.comments;
DROP POLICY IF EXISTS "comments_update_own" ON public.comments;
DROP POLICY IF EXISTS "comments_delete_own" ON public.comments;

CREATE POLICY "comments_select_public" ON public.comments
    FOR SELECT USING (
        true -- Allow public access to comments
    );

CREATE POLICY "comments_insert_authenticated" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() = author_id AND is_authenticated_user());

CREATE POLICY "comments_update_own" ON public.comments
    FOR UPDATE USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "comments_delete_own" ON public.comments
    FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "comments_moderate_admin" ON public.comments
    FOR ALL USING (can_moderate_content())
    WITH CHECK (can_moderate_content());

-- EVENTS TABLE POLICIES
DROP POLICY IF EXISTS "events_select_public" ON public.events;
DROP POLICY IF EXISTS "events_insert_authenticated" ON public.events;
DROP POLICY IF EXISTS "events_update_own" ON public.events;
DROP POLICY IF EXISTS "events_delete_own" ON public.events;

CREATE POLICY "events_select_public" ON public.events
    FOR SELECT USING (
        is_public = true OR 
        auth.uid() = organizer_id OR
        can_moderate_content()
    );

CREATE POLICY "events_insert_authenticated" ON public.events
    FOR INSERT WITH CHECK (auth.uid() = organizer_id AND is_authenticated_user());

CREATE POLICY "events_update_own" ON public.events
    FOR UPDATE USING (auth.uid() = organizer_id)
    WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "events_delete_own" ON public.events
    FOR DELETE USING (auth.uid() = organizer_id);

CREATE POLICY "events_moderate_admin" ON public.events
    FOR ALL USING (can_moderate_content())
    WITH CHECK (can_moderate_content());

-- POLLS TABLE POLICIES
DROP POLICY IF EXISTS "polls_select_public" ON public.polls;
DROP POLICY IF EXISTS "polls_insert_authenticated" ON public.polls;
DROP POLICY IF EXISTS "polls_update_own" ON public.polls;
DROP POLICY IF EXISTS "polls_delete_own" ON public.polls;

CREATE POLICY "polls_select_public" ON public.polls
    FOR SELECT USING (
        is_public = true OR 
        auth.uid() = creator_id OR
        can_moderate_content()
    );

CREATE POLICY "polls_insert_authenticated" ON public.polls
    FOR INSERT WITH CHECK (auth.uid() = creator_id AND is_authenticated_user());

CREATE POLICY "polls_update_own" ON public.polls
    FOR UPDATE USING (auth.uid() = creator_id)
    WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "polls_delete_own" ON public.polls
    FOR DELETE USING (auth.uid() = creator_id);

CREATE POLICY "polls_moderate_admin" ON public.polls
    FOR ALL USING (can_moderate_content())
    WITH CHECK (can_moderate_content());

-- POLL_VOTES TABLE POLICIES
DROP POLICY IF EXISTS "poll_votes_select_public" ON public.poll_votes;
DROP POLICY IF EXISTS "poll_votes_insert_authenticated" ON public.poll_votes;
DROP POLICY IF EXISTS "poll_votes_update_own" ON public.poll_votes;
DROP POLICY IF EXISTS "poll_votes_delete_own" ON public.poll_votes;

CREATE POLICY "poll_votes_select_public" ON public.poll_votes
    FOR SELECT USING (
        true -- Allow public access to vote counts
    );

CREATE POLICY "poll_votes_insert_authenticated" ON public.poll_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id AND is_authenticated_user());

CREATE POLICY "poll_votes_update_own" ON public.poll_votes
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "poll_votes_delete_own" ON public.poll_votes
    FOR DELETE USING (auth.uid() = user_id);

-- FOLLOWS TABLE POLICIES
DROP POLICY IF EXISTS "follows_select_public" ON public.follows;
DROP POLICY IF EXISTS "follows_insert_authenticated" ON public.follows;
DROP POLICY IF EXISTS "follows_delete_own" ON public.follows;

CREATE POLICY "follows_select_public" ON public.follows
    FOR SELECT USING (
        true -- Allow public access to follow relationships
    );

CREATE POLICY "follows_insert_authenticated" ON public.follows
    FOR INSERT WITH CHECK (auth.uid() = follower_id AND is_authenticated_user());

CREATE POLICY "follows_delete_own" ON public.follows
    FOR DELETE USING (auth.uid() = follower_id);

-- CHATS TABLE POLICIES
DROP POLICY IF EXISTS "chats_select_participants" ON public.chats;
DROP POLICY IF EXISTS "chats_insert_authenticated" ON public.chats;
DROP POLICY IF EXISTS "chats_update_creator" ON public.chats;

CREATE POLICY "chats_select_participants" ON public.chats
    FOR SELECT USING (
        auth.uid() = ANY(participants) OR 
        auth.uid() = creator_id OR
        can_moderate_content()
    );

CREATE POLICY "chats_insert_authenticated" ON public.chats
    FOR INSERT WITH CHECK (auth.uid() = creator_id AND is_authenticated_user());

CREATE POLICY "chats_update_creator" ON public.chats
    FOR UPDATE USING (auth.uid() = creator_id)
    WITH CHECK (auth.uid() = creator_id);

-- MESSAGES TABLE POLICIES
DROP POLICY IF EXISTS "messages_select_participants" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_authenticated" ON public.messages;
DROP POLICY IF EXISTS "messages_update_own" ON public.messages;
DROP POLICY IF EXISTS "messages_delete_own" ON public.messages;

CREATE POLICY "messages_select_participants" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chats 
            WHERE chats.id = messages.chat_id 
            AND (auth.uid() = ANY(chats.participants) OR auth.uid() = chats.creator_id)
        ) OR
        can_moderate_content()
    );

CREATE POLICY "messages_insert_authenticated" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id AND is_authenticated_user());

CREATE POLICY "messages_update_own" ON public.messages
    FOR UPDATE USING (auth.uid() = sender_id)
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "messages_delete_own" ON public.messages
    FOR DELETE USING (auth.uid() = sender_id);

-- REPORTS TABLE POLICIES
DROP POLICY IF EXISTS "reports_insert_authenticated" ON public.reports;
DROP POLICY IF EXISTS "reports_select_moderators" ON public.reports;
DROP POLICY IF EXISTS "reports_update_moderators" ON public.reports;

CREATE POLICY "reports_insert_authenticated" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id AND is_authenticated_user());

CREATE POLICY "reports_select_moderators" ON public.reports
    FOR SELECT USING (can_moderate_content());

CREATE POLICY "reports_update_moderators" ON public.reports
    FOR UPDATE USING (can_moderate_content())
    WITH CHECK (can_moderate_content());

-- MODERATION_ACTIONS TABLE POLICIES
DROP POLICY IF EXISTS "moderation_actions_select_moderators" ON public.moderation_actions;
DROP POLICY IF EXISTS "moderation_actions_insert_moderators" ON public.moderation_actions;
DROP POLICY IF EXISTS "moderation_actions_update_moderators" ON public.moderation_actions;

CREATE POLICY "moderation_actions_select_moderators" ON public.moderation_actions
    FOR SELECT USING (can_moderate_content());

CREATE POLICY "moderation_actions_insert_moderators" ON public.moderation_actions
    FOR INSERT WITH CHECK (can_moderate_content());

CREATE POLICY "moderation_actions_update_moderators" ON public.moderation_actions
    FOR UPDATE USING (can_moderate_content())
    WITH CHECK (can_moderate_content());

-- SUBSCRIPTIONS TABLE POLICIES
CREATE POLICY "subscriptions_select_own" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id OR can_moderate_content());

CREATE POLICY "subscriptions_insert_authenticated" ON public.subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id AND is_authenticated_user());

CREATE POLICY "subscriptions_update_own" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subscriptions_moderate_admin" ON public.subscriptions
    FOR ALL USING (can_moderate_content())
    WITH CHECK (can_moderate_content());

-- NEWS_SUMMARIES TABLE POLICIES (Read-only for users, write for service role)
CREATE POLICY "news_summaries_select_public" ON public.news_summaries
    FOR SELECT USING (true); -- Allow public read access

-- NEWS_DISCUSSIONS TABLE POLICIES
CREATE POLICY "news_discussions_select_public" ON public.news_discussions
    FOR SELECT USING (true);

CREATE POLICY "news_discussions_insert_authenticated" ON public.news_discussions
    FOR INSERT WITH CHECK (auth.uid() = author_id AND is_authenticated_user());

CREATE POLICY "news_discussions_update_own" ON public.news_discussions
    FOR UPDATE USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "news_discussions_delete_own" ON public.news_discussions
    FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "news_discussions_moderate_admin" ON public.news_discussions
    FOR ALL USING (can_moderate_content())
    WITH CHECK (can_moderate_content());

-- SECURITY_AUDIT TABLE POLICIES (Admin only)
CREATE POLICY "security_audit_select_super_admin" ON public.security_audit
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'super_admin'
        )
    );

CREATE POLICY "security_audit_insert_system" ON public.security_audit
    FOR INSERT WITH CHECK (true); -- Allow system inserts

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

-- Create function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
    event_type TEXT,
    resource TEXT,
    action TEXT,
    success BOOLEAN,
    details JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO public.security_audit (
        user_id,
        event_type,
        resource,
        action,
        success,
        details,
        ip_address,
        user_agent,
        created_at
    ) VALUES (
        auth.uid(),
        event_type,
        resource,
        action,
        success,
        details,
        inet_client_addr(),
        current_setting('request.headers', true)::json->>'user-agent',
        NOW()
    ) RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION is_moderator_or_admin(UUID) IS 'Checks if a user has moderator or admin privileges';
COMMENT ON FUNCTION can_moderate_content() IS 'Checks if the current user can moderate content';
COMMENT ON FUNCTION is_authenticated_user() IS 'Checks if the current user is authenticated';
COMMENT ON FUNCTION log_moderation_action(TEXT, TEXT, UUID, JSONB) IS 'Logs moderation actions for audit trail';
COMMENT ON FUNCTION log_security_event(TEXT, TEXT, TEXT, BOOLEAN, JSONB) IS 'Logs security events for audit trail';
