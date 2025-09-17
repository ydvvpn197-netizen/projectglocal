-- Migration: Add Anonymous Username System
-- Description: Implements Reddit-style anonymous usernames with opt-in identity reveal

-- Add new columns to profiles table for anonymous username system
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS reveal_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_reveal TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS privacy_level TEXT DEFAULT 'private' CHECK (privacy_level IN ('public', 'private', 'anonymous'));

-- Create index for anonymous users
CREATE INDEX IF NOT EXISTS idx_profiles_anonymous ON public.profiles(is_anonymous);
CREATE INDEX IF NOT EXISTS idx_profiles_privacy_level ON public.profiles(privacy_level);

-- Update existing profiles to have anonymous usernames if they don't have one
UPDATE public.profiles 
SET 
  username = CASE 
    WHEN username IS NULL OR username = '' THEN 
      'User_' || substr(md5(user_id::text), 1, 8)
    ELSE username 
  END,
  display_name = CASE 
    WHEN display_name IS NULL OR display_name = '' THEN 
      'User_' || substr(md5(user_id::text), 1, 8)
    ELSE display_name 
  END,
  is_anonymous = true
WHERE username IS NULL OR username = '' OR display_name IS NULL OR display_name = '';

-- Create function to generate anonymous usernames
CREATE OR REPLACE FUNCTION generate_anonymous_username()
RETURNS TEXT AS $$
DECLARE
  adjectives TEXT[] := ARRAY[
    'Swift', 'Bright', 'Clever', 'Bold', 'Calm', 'Cool', 'Fast', 'Kind',
    'Smart', 'Wise', 'Brave', 'Gentle', 'Happy', 'Lucky', 'Magic', 'Pure',
    'Quick', 'Sharp', 'Strong', 'Sweet', 'True', 'Wild', 'Young', 'Zest',
    'Epic', 'Noble', 'Radiant', 'Vibrant', 'Dynamic', 'Elegant', 'Fierce',
    'Golden', 'Harmonic', 'Infinite', 'Jovial', 'Keen', 'Luminous'
  ];
  nouns TEXT[] := ARRAY[
    'Tiger', 'Eagle', 'Wolf', 'Bear', 'Fox', 'Hawk', 'Lion', 'Deer',
    'Owl', 'Raven', 'Falcon', 'Shark', 'Dolphin', 'Phoenix', 'Dragon',
    'Unicorn', 'Pegasus', 'Griffin', 'Sphinx', 'Basilisk', 'Phoenix',
    'Explorer', 'Navigator', 'Pioneer', 'Adventurer', 'Dreamer', 'Creator',
    'Builder', 'Artist', 'Writer', 'Sage', 'Mage', 'Warrior', 'Guardian',
    'Wanderer', 'Seeker', 'Thinker', 'Innovator', 'Visionary', 'Legend'
  ];
  colors TEXT[] := ARRAY[
    'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Cyan',
    'Magenta', 'Lime', 'Indigo', 'Teal', 'Coral', 'Gold', 'Silver', 'Copper',
    'Emerald', 'Ruby', 'Sapphire', 'Amber', 'Pearl', 'Crystal', 'Shadow',
    'Light', 'Dark', 'Bright', 'Deep', 'Rich', 'Vivid', 'Pastel'
  ];
  adjective TEXT;
  noun TEXT;
  color TEXT;
  number_part INTEGER;
  username TEXT;
  attempts INTEGER := 0;
  max_attempts INTEGER := 10;
BEGIN
  LOOP
    -- Select random elements
    adjective := adjectives[floor(random() * array_length(adjectives, 1)) + 1];
    noun := nouns[floor(random() * array_length(nouns, 1)) + 1];
    color := colors[floor(random() * array_length(colors, 1)) + 1];
    number_part := floor(random() * 9999) + 1;
    
    -- Generate username with random format
    CASE floor(random() * 6)
      WHEN 0 THEN username := adjective || noun || number_part::TEXT;
      WHEN 1 THEN username := color || noun || number_part::TEXT;
      WHEN 2 THEN username := adjective || color || number_part::TEXT;
      WHEN 3 THEN username := noun || color || number_part::TEXT;
      WHEN 4 THEN username := adjective || noun;
      ELSE username := color || noun;
    END CASE;
    
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

-- Create function to update user's anonymous status
CREATE OR REPLACE FUNCTION update_user_anonymous_status(
  user_uuid UUID,
  new_anonymous_status BOOLEAN
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    is_anonymous = new_anonymous_status,
    reveal_count = CASE 
      WHEN NOT new_anonymous_status AND is_anonymous THEN reveal_count + 1
      ELSE reveal_count
    END,
    last_reveal = CASE 
      WHEN NOT new_anonymous_status AND is_anonymous THEN NOW()
      ELSE last_reveal
    END,
    updated_at = NOW()
  WHERE user_id = user_uuid;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user's display information based on privacy settings
CREATE OR REPLACE FUNCTION get_user_display_info(user_uuid UUID, viewer_uuid UUID DEFAULT NULL)
RETURNS TABLE(
  display_name TEXT,
  username TEXT,
  is_anonymous BOOLEAN,
  show_real_name BOOLEAN
) AS $$
DECLARE
  user_profile RECORD;
  viewer_profile RECORD;
BEGIN
  -- Get the user's profile
  SELECT * INTO user_profile FROM public.profiles WHERE user_id = user_uuid;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Get viewer's profile if provided
  IF viewer_uuid IS NOT NULL THEN
    SELECT * INTO viewer_profile FROM public.profiles WHERE user_id = viewer_uuid;
  END IF;
  
  -- Determine what to show based on privacy settings
  RETURN QUERY SELECT
    CASE 
      WHEN user_profile.is_anonymous THEN user_profile.username
      ELSE user_profile.display_name
    END as display_name,
    user_profile.username,
    user_profile.is_anonymous,
    NOT user_profile.is_anonymous as show_real_name;
END;
$$ LANGUAGE plpgsql;

-- Update RLS policies to handle anonymous users
DROP POLICY IF EXISTS "Users can view profiles from their area" ON public.profiles;
CREATE POLICY "Users can view profiles from their area" ON public.profiles
  FOR SELECT USING (
    user_id = auth.uid() OR
    (is_anonymous = false OR privacy_level = 'public') OR
    public.users_in_same_area(auth.uid(), user_id)
  );

-- Create view for public user information
CREATE OR REPLACE VIEW public.user_public_info AS
SELECT 
  user_id,
  CASE 
    WHEN is_anonymous THEN username
    ELSE display_name
  END as display_name,
  username,
  is_anonymous,
  privacy_level,
  avatar_url,
  location_city,
  location_state,
  location_country,
  created_at,
  updated_at
FROM public.profiles
WHERE privacy_level IN ('public', 'private');

-- Grant permissions on the view
GRANT SELECT ON public.user_public_info TO authenticated;
GRANT SELECT ON public.user_public_info TO anon;

-- Create trigger to automatically generate username for new users
CREATE OR REPLACE FUNCTION set_default_username()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.username IS NULL OR NEW.username = '' THEN
    NEW.username := generate_anonymous_username();
  END IF;
  
  IF NEW.display_name IS NULL OR NEW.display_name = '' THEN
    NEW.display_name := NEW.username;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_default_username
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_default_username();

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.is_anonymous IS 'Whether the user is posting anonymously';
COMMENT ON COLUMN public.profiles.reveal_count IS 'Number of times the user has revealed their identity';
COMMENT ON COLUMN public.profiles.last_reveal IS 'Timestamp of the last identity reveal';
COMMENT ON COLUMN public.profiles.privacy_level IS 'User privacy level: public, private, or anonymous';

COMMENT ON FUNCTION generate_anonymous_username() IS 'Generates a unique anonymous username using random adjectives, nouns, and colors';
COMMENT ON FUNCTION update_user_anonymous_status(UUID, BOOLEAN) IS 'Updates user anonymous status and tracks reveal count';
COMMENT ON FUNCTION get_user_display_info(UUID, UUID) IS 'Returns user display information based on privacy settings and viewer context';
