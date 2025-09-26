-- Migration: Anonymous Handle System Implementation
-- Date: 2025-01-28
-- Description: Implements privacy-first anonymous handle system

-- Add anonymous handle column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS anonymous_handle TEXT UNIQUE;

-- Create index for anonymous handle lookups
CREATE INDEX IF NOT EXISTS idx_profiles_anonymous_handle ON public.profiles(anonymous_handle);

-- Create function to generate anonymous handle
CREATE OR REPLACE FUNCTION generate_anonymous_handle()
RETURNS TEXT AS $$
DECLARE
    handle TEXT;
    counter INTEGER := 1;
    max_attempts INTEGER := 100;
BEGIN
    -- Generate a random handle with format: "Anonymous_[adjective]_[animal]"
    -- This ensures uniqueness while maintaining privacy
    
    LOOP
        -- Generate random components
        WITH adjectives AS (
            SELECT unnest(ARRAY[
                'Quiet', 'Bright', 'Swift', 'Calm', 'Bold', 'Wise', 'Kind', 'Strong',
                'Gentle', 'Brave', 'Smart', 'Quick', 'Fair', 'True', 'Good', 'Fine',
                'Cool', 'Warm', 'Soft', 'Sharp', 'Deep', 'High', 'Low', 'Fast',
                'Slow', 'Big', 'Small', 'New', 'Old', 'Red', 'Blue', 'Green'
            ]) AS adj
        ),
        animals AS (
            SELECT unnest(ARRAY[
                'Fox', 'Wolf', 'Bear', 'Eagle', 'Hawk', 'Owl', 'Deer', 'Rabbit',
                'Swan', 'Dove', 'Lion', 'Tiger', 'Panda', 'Koala', 'Dolphin', 'Whale',
                'Shark', 'Falcon', 'Raven', 'Crow', 'Sparrow', 'Robin', 'Wren', 'Jay',
                'Cardinal', 'Finch', 'Canary', 'Parrot', 'Toucan', 'Hummingbird', 'Penguin', 'Seal'
            ]) AS animal
        )
        SELECT CONCAT(
            'Anonymous_',
            (SELECT adj FROM adjectives ORDER BY RANDOM() LIMIT 1),
            '_',
            (SELECT animal FROM animals ORDER BY RANDOM() LIMIT 1),
            CASE WHEN counter > 1 THEN '_' || counter::TEXT ELSE '' END
        ) INTO handle;
        
        -- Check if handle already exists
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE anonymous_handle = handle) THEN
            RETURN handle;
        END IF;
        
        counter := counter + 1;
        
        -- Prevent infinite loop
        IF counter > max_attempts THEN
            -- Fallback to timestamp-based handle
            RETURN 'Anonymous_' || EXTRACT(EPOCH FROM NOW())::BIGINT;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to ensure anonymous handle on profile creation
CREATE OR REPLACE FUNCTION ensure_anonymous_handle()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set anonymous handle if not already set
    IF NEW.anonymous_handle IS NULL THEN
        NEW.anonymous_handle := generate_anonymous_handle();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate anonymous handle
DROP TRIGGER IF EXISTS trigger_ensure_anonymous_handle ON public.profiles;
CREATE TRIGGER trigger_ensure_anonymous_handle
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION ensure_anonymous_handle();

-- Create function to update existing profiles with anonymous handles
CREATE OR REPLACE FUNCTION update_existing_profiles_with_handles()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER := 0;
    profile_record RECORD;
BEGIN
    -- Update all profiles that don't have anonymous handles
    FOR profile_record IN 
        SELECT id FROM public.profiles WHERE anonymous_handle IS NULL
    LOOP
        UPDATE public.profiles 
        SET anonymous_handle = generate_anonymous_handle()
        WHERE id = profile_record.id;
        
        updated_count := updated_count + 1;
    END LOOP;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Run the function to update existing profiles
SELECT update_existing_profiles_with_handles();

-- Create function to get user display name (anonymous by default)
CREATE OR REPLACE FUNCTION get_user_display_name(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    display_name TEXT;
    profile_record RECORD;
BEGIN
    -- Get profile information
    SELECT 
        anonymous_handle,
        display_name as real_display_name,
        is_public,
        show_real_name
    INTO profile_record
    FROM public.profiles 
    WHERE id = user_id;
    
    -- If profile not found, return default
    IF NOT FOUND THEN
        RETURN 'Anonymous_User';
    END IF;
    
    -- Return real name only if user has explicitly chosen to show it
    IF profile_record.show_real_name = true AND profile_record.real_display_name IS NOT NULL THEN
        RETURN profile_record.real_display_name;
    END IF;
    
    -- Return anonymous handle as default
    RETURN COALESCE(profile_record.anonymous_handle, 'Anonymous_User');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user avatar (default anonymous avatar)
CREATE OR REPLACE FUNCTION get_user_avatar(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    avatar_url TEXT;
    profile_record RECORD;
BEGIN
    -- Get profile information
    SELECT 
        avatar_url as real_avatar,
        is_public,
        show_real_avatar
    INTO profile_record
    FROM public.profiles 
    WHERE id = user_id;
    
    -- If profile not found, return default
    IF NOT FOUND THEN
        RETURN '/images/anonymous-avatar.png';
    END IF;
    
    -- Return real avatar only if user has explicitly chosen to show it
    IF profile_record.show_real_avatar = true AND profile_record.real_avatar IS NOT NULL THEN
        RETURN profile_record.real_avatar;
    END IF;
    
    -- Return default anonymous avatar
    RETURN '/images/anonymous-avatar.png';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add privacy control columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS show_real_name BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS show_real_avatar BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS show_real_email BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS show_real_location BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS privacy_level TEXT DEFAULT 'anonymous' CHECK (privacy_level IN ('anonymous', 'pseudonymous', 'public'));

-- Create function to update privacy settings
CREATE OR REPLACE FUNCTION update_privacy_settings(
    p_user_id UUID,
    p_show_real_name BOOLEAN DEFAULT FALSE,
    p_show_real_avatar BOOLEAN DEFAULT FALSE,
    p_show_real_email BOOLEAN DEFAULT FALSE,
    p_show_real_location BOOLEAN DEFAULT FALSE,
    p_privacy_level TEXT DEFAULT 'anonymous'
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Validate privacy level
    IF p_privacy_level NOT IN ('anonymous', 'pseudonymous', 'public') THEN
        RAISE EXCEPTION 'Invalid privacy level: %', p_privacy_level;
    END IF;
    
    -- Update privacy settings
    UPDATE public.profiles 
    SET 
        show_real_name = p_show_real_name,
        show_real_avatar = p_show_real_avatar,
        show_real_email = p_show_real_email,
        show_real_location = p_show_real_location,
        privacy_level = p_privacy_level,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Log privacy setting change
    PERFORM log_security_event(
        'privacy_change',
        'profile',
        'update_privacy_settings',
        TRUE,
        jsonb_build_object(
            'user_id', p_user_id,
            'privacy_level', p_privacy_level,
            'show_real_name', p_show_real_name,
            'show_real_avatar', p_show_real_avatar
        )
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's privacy settings
CREATE OR REPLACE FUNCTION get_user_privacy_settings(user_id UUID)
RETURNS JSONB AS $$
DECLARE
    settings JSONB;
BEGIN
    SELECT jsonb_build_object(
        'show_real_name', show_real_name,
        'show_real_avatar', show_real_avatar,
        'show_real_email', show_real_email,
        'show_real_location', show_real_location,
        'privacy_level', privacy_level,
        'anonymous_handle', anonymous_handle
    ) INTO settings
    FROM public.profiles 
    WHERE id = user_id;
    
    RETURN COALESCE(settings, '{}'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies to respect privacy settings
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
CREATE POLICY "profiles_select_privacy_aware" ON public.profiles
    FOR SELECT USING (
        -- Always allow users to see their own profile
        auth.uid() = id OR 
        -- Allow moderators to see all profiles
        can_moderate_content() OR
        -- For public profiles, show based on privacy settings
        (is_public = true AND (
            privacy_level = 'public' OR
            (privacy_level = 'pseudonymous' AND anonymous_handle IS NOT NULL) OR
            privacy_level = 'anonymous'
        ))
    );

-- Create anonymous user session table for tracking anonymous interactions
CREATE TABLE IF NOT EXISTS public.anonymous_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_token TEXT UNIQUE NOT NULL,
    ip_address inet,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- Enable RLS on anonymous_sessions
ALTER TABLE public.anonymous_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for anonymous_sessions
CREATE POLICY "anonymous_sessions_select_own" ON public.anonymous_sessions
    FOR SELECT USING (session_token = current_setting('request.headers', true)::json->>'x-session-token');

CREATE POLICY "anonymous_sessions_insert_system" ON public.anonymous_sessions
    FOR INSERT WITH CHECK (true); -- Allow system to create anonymous sessions

CREATE POLICY "anonymous_sessions_update_own" ON public.anonymous_sessions
    FOR UPDATE USING (session_token = current_setting('request.headers', true)::json->>'x-session-token');

-- Create function to create anonymous session
CREATE OR REPLACE FUNCTION create_anonymous_session()
RETURNS TEXT AS $$
DECLARE
    session_token TEXT;
    session_id UUID;
BEGIN
    -- Generate secure session token
    session_token := encode(gen_random_bytes(32), 'base64url');
    
    -- Create session record
    INSERT INTO public.anonymous_sessions (
        session_token,
        ip_address,
        user_agent,
        expires_at
    ) VALUES (
        session_token,
        inet_client_addr(),
        current_setting('request.headers', true)::json->>'user-agent',
        NOW() + INTERVAL '30 days'
    ) RETURNING id INTO session_id;
    
    -- Log anonymous session creation
    PERFORM log_security_event(
        'anonymous_session_created',
        'anonymous_sessions',
        'create_anonymous_session',
        TRUE,
        jsonb_build_object(
            'session_id', session_id,
            'ip_address', inet_client_addr()
        )
    );
    
    RETURN session_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.anonymous_sessions TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.anonymous_handle IS 'Unique anonymous handle for privacy-first display';
COMMENT ON COLUMN public.profiles.show_real_name IS 'Whether to show real name instead of anonymous handle';
COMMENT ON COLUMN public.profiles.show_real_avatar IS 'Whether to show real avatar instead of default';
COMMENT ON COLUMN public.profiles.privacy_level IS 'Privacy level: anonymous, pseudonymous, or public';
COMMENT ON FUNCTION generate_anonymous_handle() IS 'Generates unique anonymous handles for privacy';
COMMENT ON FUNCTION get_user_display_name(UUID) IS 'Returns appropriate display name based on privacy settings';
COMMENT ON FUNCTION get_user_avatar(UUID) IS 'Returns appropriate avatar based on privacy settings';
COMMENT ON FUNCTION update_privacy_settings(UUID, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, TEXT) IS 'Updates user privacy settings';
COMMENT ON TABLE public.anonymous_sessions IS 'Tracks anonymous user sessions for privacy-first interactions';
