-- ============================================================================
-- ANONYMOUS HANDLE SYSTEM MIGRATION
-- ============================================================================
-- This migration implements the privacy-first anonymous handle system
-- Date: 2025-01-28
-- Version: 1.0.0

-- ============================================================================
-- ADD ANONYMOUS HANDLE FIELDS TO PROFILES TABLE
-- ============================================================================

-- Add anonymous handle fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS anonymous_handle TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS anonymous_display_name TEXT,
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS can_reveal_identity BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS privacy_level TEXT DEFAULT 'anonymous' CHECK (privacy_level IN ('anonymous', 'pseudonymous', 'public')),
ADD COLUMN IF NOT EXISTS last_anonymous_activity TIMESTAMP WITH TIME ZONE DEFAULT now();

-- ============================================================================
-- CREATE ANONYMOUS HANDLE GENERATION FUNCTION
-- ============================================================================

-- Function to generate unique anonymous handle
CREATE OR REPLACE FUNCTION public.generate_anonymous_handle()
RETURNS TEXT AS $$
DECLARE
  adjectives TEXT[] := ARRAY[
    'Mysterious', 'Silent', 'Hidden', 'Quiet', 'Secret', 'Unknown', 'Private', 'Stealthy',
    'Whispered', 'Shadow', 'Echo', 'Silhouette', 'Phantom', 'Ghost', 'Spirit', 'Guardian',
    'Wise', 'Ancient', 'Eternal', 'Timeless', 'Sacred', 'Divine', 'Celestial', 'Cosmic'
  ];
  nouns TEXT[] := ARRAY[
    'Observer', 'Watcher', 'Listener', 'Thinker', 'Dreamer', 'Wanderer', 'Explorer',
    'Seeker', 'Guardian', 'Keeper', 'Protector', 'Defender', 'Advocate', 'Voice',
    'Sage', 'Oracle', 'Prophet', 'Mystic', 'Hermit', 'Scholar', 'Philosopher', 'Sage'
  ];
  adjective TEXT;
  noun TEXT;
  number INTEGER;
  handle TEXT;
  attempts INTEGER := 0;
  max_attempts INTEGER := 10;
BEGIN
  LOOP
    -- Select random adjective and noun
    adjective := adjectives[1 + floor(random() * array_length(adjectives, 1))];
    noun := nouns[1 + floor(random() * array_length(nouns, 1))];
    number := 1000 + floor(random() * 8999); -- 4-digit number
    
    -- Create handle
    handle := adjective || noun || number;
    
    -- Check if handle is unique
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE anonymous_handle = handle) THEN
      RETURN handle;
    END IF;
    
    -- Prevent infinite loop
    attempts := attempts + 1;
    IF attempts >= max_attempts THEN
      -- Fallback to timestamp-based handle
      handle := 'Anonymous' || extract(epoch from now())::bigint;
      RETURN handle;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CREATE ANONYMOUS HANDLE TRIGGER
-- ============================================================================

-- Function to automatically create anonymous handle for new users
CREATE OR REPLACE FUNCTION public.create_anonymous_handle()
RETURNS TRIGGER AS $$
DECLARE
  new_handle TEXT;
  display_name TEXT;
BEGIN
  -- Only create handle if not already set
  IF NEW.anonymous_handle IS NULL THEN
    -- Generate unique handle
    new_handle := public.generate_anonymous_handle();
    
    -- Create display name
    display_name := 'Anonymous ' || new_handle;
    
    -- Set anonymous handle fields
    NEW.anonymous_handle := new_handle;
    NEW.anonymous_display_name := display_name;
    NEW.is_anonymous := TRUE;
    NEW.can_reveal_identity := FALSE;
    NEW.privacy_level := 'anonymous';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic anonymous handle creation
DROP TRIGGER IF EXISTS create_anonymous_handle_trigger ON public.profiles;
CREATE TRIGGER create_anonymous_handle_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_anonymous_handle();

-- ============================================================================
-- CREATE ANONYMOUS SESSION TRACKING
-- ============================================================================

-- Table to track anonymous user sessions
CREATE TABLE IF NOT EXISTS public.anonymous_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  anonymous_handle TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  location_city TEXT,
  location_state TEXT,
  location_country TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_active BOOLEAN DEFAULT TRUE,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days')
);

-- ============================================================================
-- CREATE PRIVACY CONTROL FUNCTIONS
-- ============================================================================

-- Function to check if user can reveal identity
CREATE OR REPLACE FUNCTION public.can_reveal_identity(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = user_uuid 
    AND can_reveal_identity = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's display name (anonymous or real)
CREATE OR REPLACE FUNCTION public.get_user_display_name(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  profile_record RECORD;
BEGIN
  SELECT 
    anonymous_display_name,
    display_name,
    is_anonymous,
    can_reveal_identity
  INTO profile_record
  FROM public.profiles 
  WHERE user_id = user_uuid;
  
  IF NOT FOUND THEN
    RETURN 'Unknown User';
  END IF;
  
  -- Return anonymous name if user is anonymous
  IF profile_record.is_anonymous THEN
    RETURN COALESCE(profile_record.anonymous_display_name, 'Anonymous User');
  END IF;
  
  -- Return real name if user has revealed identity
  IF profile_record.can_reveal_identity THEN
    RETURN COALESCE(profile_record.display_name, 'User');
  END IF;
  
  -- Default to anonymous
  RETURN COALESCE(profile_record.anonymous_display_name, 'Anonymous User');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update anonymous activity
CREATE OR REPLACE FUNCTION public.update_anonymous_activity(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles 
  SET last_anonymous_activity = now()
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CREATE PRIVACY AUDIT LOGGING
-- ============================================================================

-- Table to track privacy-related actions
CREATE TABLE IF NOT EXISTS public.privacy_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('handle_created', 'identity_revealed', 'anonymity_toggled', 'display_name_changed', 'privacy_level_changed')),
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Function to log privacy actions
CREATE OR REPLACE FUNCTION public.log_privacy_action(
  user_uuid UUID,
  action_type TEXT,
  old_val JSONB DEFAULT NULL,
  new_val JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.privacy_audit_log (user_id, action, old_value, new_value, ip_address, user_agent)
  VALUES (
    user_uuid,
    action_type,
    old_val,
    new_val,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- UPDATE RLS POLICIES FOR ANONYMOUS HANDLES
-- ============================================================================

-- Update profiles policies to handle anonymous data
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for viewing anonymous handles (public)
CREATE POLICY "Anyone can view anonymous handles" ON public.profiles
  FOR SELECT USING (true);

-- Policy for updating anonymous handle fields
CREATE POLICY "Users can update own anonymous handle" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for anonymous sessions
CREATE POLICY "Users can view own anonymous sessions" ON public.anonymous_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage anonymous sessions" ON public.anonymous_sessions
  FOR ALL USING (true);

-- Policy for privacy audit log
CREATE POLICY "Users can view own privacy audit log" ON public.privacy_audit_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage privacy audit log" ON public.privacy_audit_log
  FOR ALL USING (true);

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Indexes for anonymous handle lookups
CREATE INDEX IF NOT EXISTS idx_profiles_anonymous_handle ON public.profiles(anonymous_handle);
CREATE INDEX IF NOT EXISTS idx_profiles_is_anonymous ON public.profiles(is_anonymous);
CREATE INDEX IF NOT EXISTS idx_profiles_privacy_level ON public.profiles(privacy_level);
CREATE INDEX IF NOT EXISTS idx_profiles_last_anonymous_activity ON public.profiles(last_anonymous_activity);

-- Indexes for anonymous sessions
CREATE INDEX IF NOT EXISTS idx_anonymous_sessions_session_id ON public.anonymous_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_sessions_user_id ON public.anonymous_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_sessions_is_active ON public.anonymous_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_anonymous_sessions_expires_at ON public.anonymous_sessions(expires_at);

-- Indexes for privacy audit
CREATE INDEX IF NOT EXISTS idx_privacy_audit_log_user_id ON public.privacy_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_privacy_audit_log_action ON public.privacy_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_privacy_audit_log_created_at ON public.privacy_audit_log(created_at);

-- ============================================================================
-- CREATE CLEANUP FUNCTIONS
-- ============================================================================

-- Function to clean up expired anonymous sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_anonymous_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.anonymous_sessions 
  WHERE expires_at < now() AND is_active = FALSE;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to anonymize old user data
CREATE OR REPLACE FUNCTION public.anonymize_old_user_data()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Anonymize users who haven't been active for 1 year and haven't revealed identity
  UPDATE public.profiles 
  SET 
    display_name = 'Anonymous User',
    bio = NULL,
    avatar_url = NULL,
    cover_url = NULL,
    location_city = NULL,
    location_state = NULL,
    location_country = NULL,
    latitude = NULL,
    longitude = NULL,
    is_anonymous = TRUE,
    can_reveal_identity = FALSE,
    privacy_level = 'anonymous'
  WHERE 
    last_active_at < (now() - interval '1 year')
    AND can_reveal_identity = FALSE
    AND is_anonymous = TRUE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CREATE PRIVACY SETTINGS DEFAULT VALUES
-- ============================================================================

-- Insert default privacy settings
INSERT INTO public.system_settings (key, value, description) 
VALUES 
  ('default_privacy_level', '"anonymous"', 'Default privacy level for new users'),
  ('anonymous_handle_generation', 'true', 'Automatically generate anonymous handles for new users'),
  ('identity_reveal_permanent', 'true', 'Identity reveal is a permanent action'),
  ('anonymous_session_duration', '30', 'Anonymous session duration in days'),
  ('privacy_audit_retention', '365', 'Privacy audit log retention in days')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant permissions for anonymous handle functions
GRANT EXECUTE ON FUNCTION public.generate_anonymous_handle() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_display_name(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_reveal_identity(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_anonymous_activity(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_privacy_action(UUID, TEXT, JSONB, JSONB) TO authenticated;

-- Grant permissions for cleanup functions (admin only)
GRANT EXECUTE ON FUNCTION public.cleanup_expired_anonymous_sessions() TO service_role;
GRANT EXECUTE ON FUNCTION public.anonymize_old_user_data() TO service_role;
