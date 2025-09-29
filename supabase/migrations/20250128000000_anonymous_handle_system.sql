-- Migration: Anonymous Handle System Implementation
-- Date: 2025-01-28
-- Description: Implement privacy-first anonymous handle system for user profiles

-- Add anonymous handle fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS anonymous_handle TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS handle_generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS real_name_visibility BOOLEAN DEFAULT FALSE;

-- Create index for anonymous handles
CREATE INDEX IF NOT EXISTS idx_profiles_anonymous_handle ON public.profiles(anonymous_handle);
CREATE INDEX IF NOT EXISTS idx_profiles_is_anonymous ON public.profiles(is_anonymous);

-- Function to generate anonymous handle
CREATE OR REPLACE FUNCTION generate_anonymous_handle()
RETURNS TEXT AS $$
DECLARE
    adjectives TEXT[] := ARRAY[
        'Silent', 'Mystic', 'Hidden', 'Quiet', 'Gentle', 'Wise', 'Bright', 'Calm',
        'Swift', 'Bold', 'Kind', 'Pure', 'Clear', 'Soft', 'Strong', 'Brave',
        'Warm', 'Cool', 'Deep', 'Light', 'Dark', 'Bright', 'Sweet', 'Sharp'
    ];
    nouns TEXT[] := ARRAY[
        'Observer', 'Thinker', 'Dreamer', 'Walker', 'Reader', 'Writer', 'Listener',
        'Watcher', 'Learner', 'Helper', 'Friend', 'Guide', 'Guardian', 'Explorer',
        'Creator', 'Builder', 'Maker', 'Artist', 'Sage', 'Spirit', 'Heart', 'Soul'
    ];
    generated_handle TEXT;
    handle_exists BOOLEAN;
    attempts INTEGER := 0;
    max_attempts INTEGER := 100;
BEGIN
    LOOP
        -- Generate random handle
        generated_handle := (
            adjectives[floor(random() * array_length(adjectives, 1)) + 1] || 
            nouns[floor(random() * array_length(nouns, 1)) + 1] ||
            floor(random() * 9999)::TEXT
        );
        
        -- Check if handle exists
        SELECT EXISTS(SELECT 1 FROM public.profiles WHERE anonymous_handle = generated_handle) INTO handle_exists;
        
        -- If handle doesn't exist, return it
        IF NOT handle_exists THEN
            RETURN generated_handle;
        END IF;
        
        -- Prevent infinite loop
        attempts := attempts + 1;
        IF attempts >= max_attempts THEN
            -- Fallback to UUID-based handle
            RETURN 'User' || substr(gen_random_uuid()::TEXT, 1, 8);
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically generate handle for new users
CREATE OR REPLACE FUNCTION handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate anonymous handle if not provided
    IF NEW.anonymous_handle IS NULL OR NEW.anonymous_handle = '' THEN
        NEW.anonymous_handle := generate_anonymous_handle();
        NEW.handle_generated_at := NOW();
    END IF;
    
    -- Ensure anonymity by default
    IF NEW.is_anonymous IS NULL THEN
        NEW.is_anonymous := TRUE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profiles
DROP TRIGGER IF EXISTS trigger_handle_new_user_profile ON public.profiles;
CREATE TRIGGER trigger_handle_new_user_profile
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user_profile();

-- Function to update existing profiles with anonymous handles
CREATE OR REPLACE FUNCTION populate_missing_anonymous_handles()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER := 0;
    profile_record RECORD;
BEGIN
    -- Update profiles that don't have anonymous handles
    FOR profile_record IN 
        SELECT id FROM public.profiles 
        WHERE anonymous_handle IS NULL OR anonymous_handle = ''
    LOOP
        UPDATE public.profiles 
        SET 
            anonymous_handle = generate_anonymous_handle(),
            handle_generated_at = NOW(),
            is_anonymous = COALESCE(is_anonymous, TRUE)
        WHERE id = profile_record.id;
        
        updated_count := updated_count + 1;
    END LOOP;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing profiles
SELECT populate_missing_anonymous_handles();

-- RLS Policies for anonymous handle system
-- Users can view anonymous handles of others
CREATE POLICY "Users can view anonymous handles" ON public.profiles
    FOR SELECT USING (anonymous_handle IS NOT NULL);

-- Users can update their own anonymous handle settings
CREATE POLICY "Users can update their own anonymity settings" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Function to get user's display name (respects anonymity settings)
CREATE OR REPLACE FUNCTION get_user_display_name(profile_record public.profiles)
RETURNS TEXT AS $$
BEGIN
    -- If user is anonymous, return anonymous handle
    IF profile_record.is_anonymous THEN
        RETURN COALESCE(profile_record.anonymous_handle, 'Anonymous User');
    END IF;
    
    -- If real name visibility is enabled, return real name or fallback
    IF profile_record.real_name_visibility AND profile_record.real_name IS NOT NULL THEN
        RETURN profile_record.real_name;
    END IF;
    
    -- Default to anonymous handle
    RETURN COALESCE(profile_record.anonymous_handle, 'Anonymous User');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for public profile information (respects anonymity)
CREATE OR REPLACE VIEW public.user_profiles_public AS
SELECT 
    id,
    get_user_display_name(profiles.*) as display_name,
    anonymous_handle,
    is_anonymous,
    avatar_url,
    bio,
    location,
    created_at,
    updated_at
FROM public.profiles;

-- Enable RLS on the view
ALTER VIEW public.user_profiles_public SET (security_barrier = true);

-- Grant access to the view
GRANT SELECT ON public.user_profiles_public TO authenticated;

-- Function to check if user can see real name
CREATE OR REPLACE FUNCTION can_see_real_name(viewer_id UUID, target_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    target_profile RECORD;
BEGIN
    -- Get target profile
    SELECT * INTO target_profile FROM public.profiles WHERE id = target_id;
    
    -- If no profile found, return false
    IF target_profile IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- If viewer is the same as target, always allow
    IF viewer_id = target_id THEN
        RETURN TRUE;
    END IF;
    
    -- If target is not anonymous and has real name visibility enabled, allow
    IF NOT target_profile.is_anonymous AND target_profile.real_name_visibility THEN
        RETURN TRUE;
    END IF;
    
    -- Default to false (anonymous)
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON FUNCTION generate_anonymous_handle() IS 'Generates a unique anonymous handle for privacy-first user experience';
COMMENT ON FUNCTION handle_new_user_profile() IS 'Automatically generates anonymous handle for new user profiles';
COMMENT ON FUNCTION get_user_display_name(public.profiles) IS 'Returns appropriate display name based on anonymity settings';
COMMENT ON FUNCTION can_see_real_name(UUID, UUID) IS 'Checks if a user can see another users real name based on privacy settings';
COMMENT ON VIEW public.user_profiles_public IS 'Public view of user profiles that respects anonymity settings';
