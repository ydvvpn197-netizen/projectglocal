-- Migration: Enhance Anonymous Handle System
-- Description: Improves automatic handle generation and adds comprehensive validation

-- Update the existing trigger function to be more robust
CREATE OR REPLACE FUNCTION set_default_username()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate username if it's null or empty
  IF NEW.username IS NULL OR NEW.username = '' OR NEW.username = 'User' THEN
    NEW.username := generate_anonymous_username();
  END IF;
  
  -- Set display_name to username if it's null or empty
  IF NEW.display_name IS NULL OR NEW.display_name = '' THEN
    NEW.display_name := NEW.username;
  END IF;
  
  -- Ensure is_anonymous is set to true by default for new users
  IF NEW.is_anonymous IS NULL THEN
    NEW.is_anonymous := true;
  END IF;
  
  -- Set privacy_level to anonymous by default for new users
  IF NEW.privacy_level IS NULL THEN
    NEW.privacy_level := 'anonymous';
  END IF;
  
  -- Set created_at and updated_at if not provided
  IF NEW.created_at IS NULL THEN
    NEW.created_at := NOW();
  END IF;
  
  IF NEW.updated_at IS NULL THEN
    NEW.updated_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger to ensure it's properly attached
DROP TRIGGER IF EXISTS trigger_set_default_username ON public.profiles;
CREATE TRIGGER trigger_set_default_username
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_default_username();

-- Enhance the generate_anonymous_username function with better uniqueness checking
CREATE OR REPLACE FUNCTION generate_anonymous_username()
RETURNS TEXT AS $$
DECLARE
  adjectives TEXT[] := ARRAY[
    'Swift', 'Bright', 'Clever', 'Bold', 'Calm', 'Cool', 'Fast', 'Kind',
    'Smart', 'Wise', 'Brave', 'Gentle', 'Happy', 'Lucky', 'Magic', 'Pure',
    'Quick', 'Sharp', 'Strong', 'Sweet', 'True', 'Wild', 'Young', 'Zest',
    'Epic', 'Noble', 'Radiant', 'Vibrant', 'Dynamic', 'Elegant', 'Fierce',
    'Golden', 'Harmonic', 'Infinite', 'Jovial', 'Keen', 'Luminous', 'Mystic',
    'Serene', 'Vivid', 'Cosmic', 'Prismatic', 'Ethereal', 'Celestial', 'Quantum',
    'Nebula', 'Stellar', 'Aurora', 'Crystal', 'Diamond', 'Platinum', 'Titanium'
  ];
  nouns TEXT[] := ARRAY[
    'Tiger', 'Eagle', 'Wolf', 'Bear', 'Fox', 'Hawk', 'Lion', 'Deer',
    'Owl', 'Raven', 'Falcon', 'Shark', 'Dolphin', 'Phoenix', 'Dragon',
    'Unicorn', 'Pegasus', 'Griffin', 'Sphinx', 'Basilisk', 'Phoenix',
    'Explorer', 'Navigator', 'Pioneer', 'Adventurer', 'Dreamer', 'Creator',
    'Builder', 'Artist', 'Writer', 'Sage', 'Mage', 'Warrior', 'Guardian',
    'Wanderer', 'Seeker', 'Thinker', 'Innovator', 'Visionary', 'Legend',
    'Philosopher', 'Inventor', 'Scholar', 'Mentor', 'Guide', 'Champion',
    'Architect', 'Designer', 'Craftsman', 'Virtuoso', 'Maestro', 'Genius'
  ];
  colors TEXT[] := ARRAY[
    'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Cyan',
    'Magenta', 'Lime', 'Indigo', 'Teal', 'Coral', 'Gold', 'Silver', 'Copper',
    'Emerald', 'Ruby', 'Sapphire', 'Amber', 'Pearl', 'Crystal', 'Shadow',
    'Light', 'Dark', 'Bright', 'Deep', 'Rich', 'Vivid', 'Pastel', 'Azure',
    'Crimson', 'Violet', 'Turquoise', 'Scarlet', 'Ivory', 'Ebony', 'Bronze',
    'Platinum', 'Chrome', 'Steel', 'Copper', 'Brass', 'Rose', 'Lavender'
  ];
  adjective TEXT;
  noun TEXT;
  color TEXT;
  number_part INTEGER;
  username TEXT;
  attempts INTEGER := 0;
  max_attempts INTEGER := 20; -- Increased attempts for better uniqueness
  format_type INTEGER;
BEGIN
  LOOP
    -- Select random elements
    adjective := adjectives[floor(random() * array_length(adjectives, 1)) + 1];
    noun := nouns[floor(random() * array_length(nouns, 1)) + 1];
    color := colors[floor(random() * array_length(colors, 1)) + 1];
    number_part := floor(random() * 9999) + 1;
    
    -- Choose random format
    format_type := floor(random() * 8);
    
    -- Generate username with random format
    CASE format_type
      WHEN 0 THEN username := adjective || noun || number_part::TEXT;
      WHEN 1 THEN username := color || noun || number_part::TEXT;
      WHEN 2 THEN username := adjective || color || number_part::TEXT;
      WHEN 3 THEN username := noun || color || number_part::TEXT;
      WHEN 4 THEN username := adjective || noun;
      WHEN 5 THEN username := color || noun;
      WHEN 6 THEN username := adjective || color;
      ELSE username := noun || color;
    END CASE;
    
    -- Ensure username is not too long (max 30 characters)
    IF length(username) > 30 THEN
      username := left(username, 30);
    END IF;
    
    -- Check if username is unique
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE username = username) THEN
      RETURN username;
    END IF;
    
    attempts := attempts + 1;
    IF attempts >= max_attempts THEN
      -- Fallback to UUID-based username if we can't find a unique one
      RETURN 'User_' || substr(md5(gen_random_uuid()::text), 1, 8);
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to validate username format
CREATE OR REPLACE FUNCTION validate_username_format(username TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if username is null or empty
  IF username IS NULL OR trim(username) = '' THEN
    RETURN FALSE;
  END IF;
  
  -- Check length (3-30 characters)
  IF length(username) < 3 OR length(username) > 30 THEN
    RETURN FALSE;
  END IF;
  
  -- Check for valid characters (alphanumeric, underscore, hyphen)
  IF NOT username ~ '^[a-zA-Z0-9_-]+$' THEN
    RETURN FALSE;
  END IF;
  
  -- Check for reserved words
  IF lower(username) IN (
    'admin', 'administrator', 'moderator', 'mod', 'support', 'help',
    'api', 'www', 'mail', 'email', 'root', 'user', 'guest', 'anonymous',
    'null', 'undefined', 'true', 'false', 'system', 'service', 'test',
    'demo', 'example', 'sample', 'public', 'private', 'internal'
  ) THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create function to check username uniqueness
CREATE OR REPLACE FUNCTION is_username_unique(username TEXT, exclude_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  IF exclude_user_id IS NOT NULL THEN
    RETURN NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE username = username AND user_id != exclude_user_id
    );
  ELSE
    RETURN NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE username = username
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to regenerate anonymous username for existing user
CREATE OR REPLACE FUNCTION regenerate_anonymous_username(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  new_username TEXT;
  attempts INTEGER := 0;
  max_attempts INTEGER := 10;
BEGIN
  LOOP
    new_username := generate_anonymous_username();
    
    -- Check if the new username is unique (excluding current user)
    IF is_username_unique(new_username, user_uuid) THEN
      -- Update the user's username
      UPDATE public.profiles 
      SET 
        username = new_username,
        display_name = CASE 
          WHEN is_anonymous THEN new_username
          ELSE display_name
        END,
        updated_at = NOW()
      WHERE user_id = user_uuid;
      
      RETURN new_username;
    END IF;
    
    attempts := attempts + 1;
    IF attempts >= max_attempts THEN
      -- Fallback to UUID-based username
      new_username := 'User_' || substr(md5(gen_random_uuid()::text), 1, 8);
      
      UPDATE public.profiles 
      SET 
        username = new_username,
        display_name = CASE 
          WHEN is_anonymous THEN new_username
          ELSE display_name
        END,
        updated_at = NOW()
      WHERE user_id = user_uuid;
      
      RETURN new_username;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to get handle suggestions
CREATE OR REPLACE FUNCTION get_handle_suggestions(count INTEGER DEFAULT 5)
RETURNS TABLE(suggestion TEXT) AS $$
DECLARE
  i INTEGER;
  suggestion_text TEXT;
  attempts INTEGER;
BEGIN
  FOR i IN 1..count LOOP
    attempts := 0;
    LOOP
      suggestion_text := generate_anonymous_username();
      
      -- Check if suggestion is unique
      IF is_username_unique(suggestion_text) THEN
        suggestion := suggestion_text;
        RETURN NEXT;
        EXIT; -- Exit the inner loop
      END IF;
      
      attempts := attempts + 1;
      IF attempts >= 10 THEN
        -- Fallback suggestion
        suggestion := 'User_' || substr(md5(gen_random_uuid()::text), 1, 8);
        RETURN NEXT;
        EXIT;
      END IF;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Update existing profiles that might not have proper anonymous handles
UPDATE public.profiles 
SET 
  username = CASE 
    WHEN username IS NULL OR username = '' OR username = 'User' THEN 
      generate_anonymous_username()
    ELSE username 
  END,
  display_name = CASE 
    WHEN display_name IS NULL OR display_name = '' OR display_name = 'User' THEN 
      COALESCE(username, generate_anonymous_username())
    ELSE display_name 
  END,
  is_anonymous = COALESCE(is_anonymous, true),
  privacy_level = CASE 
    WHEN privacy_level IS NULL THEN 'anonymous'
    ELSE privacy_level
  END,
  updated_at = NOW()
WHERE username IS NULL OR username = '' OR username = 'User' 
   OR display_name IS NULL OR display_name = '' OR display_name = 'User'
   OR is_anonymous IS NULL
   OR privacy_level IS NULL;

-- Add constraints to ensure data integrity
ALTER TABLE public.profiles 
ADD CONSTRAINT check_username_length CHECK (length(username) >= 3 AND length(username) <= 30),
ADD CONSTRAINT check_username_format CHECK (username ~ '^[a-zA-Z0-9_-]+$'),
ADD CONSTRAINT check_privacy_level CHECK (privacy_level IN ('public', 'private', 'anonymous'));

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username_lookup ON public.profiles(username);

-- Add comments for documentation
COMMENT ON FUNCTION generate_anonymous_username() IS 'Generates a unique anonymous username using random adjectives, nouns, and colors with improved uniqueness checking';
COMMENT ON FUNCTION validate_username_format(TEXT) IS 'Validates username format according to platform rules';
COMMENT ON FUNCTION is_username_unique(TEXT, UUID) IS 'Checks if a username is unique, optionally excluding a specific user';
COMMENT ON FUNCTION regenerate_anonymous_username(UUID) IS 'Regenerates an anonymous username for an existing user';
COMMENT ON FUNCTION get_handle_suggestions(INTEGER) IS 'Returns a list of suggested unique usernames';
