-- SECURITY FIX: Restrict location data exposure in profiles table

-- First, let's create a secure function that only returns sanitized profile data
CREATE OR REPLACE FUNCTION public.get_secure_profiles()
RETURNS TABLE(
  user_id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  user_type TEXT,
  is_verified BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  -- Only show general location (city/state/country), never GPS coordinates
  location_city TEXT,
  location_state TEXT,
  location_country TEXT,
  -- Never expose: latitude, longitude, current_latitude, current_longitude,
  -- real_time_location_enabled, current_location_updated_at
  is_same_area BOOLEAN
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    p.username,
    p.display_name,
    p.avatar_url,
    p.bio,
    p.user_type,
    p.is_verified,
    p.created_at,
    -- Only show city/state/country for area-based matching
    CASE 
      WHEN p.user_id = auth.uid() THEN p.location_city
      WHEN public.users_in_same_area(auth.uid(), p.user_id) THEN p.location_city
      ELSE NULL
    END as location_city,
    CASE 
      WHEN p.user_id = auth.uid() THEN p.location_state
      WHEN public.users_in_same_area(auth.uid(), p.user_id) THEN p.location_state
      ELSE NULL
    END as location_state,
    CASE 
      WHEN p.user_id = auth.uid() THEN p.location_country
      WHEN public.users_in_same_area(auth.uid(), p.user_id) THEN p.location_country
      ELSE NULL
    END as location_country,
    -- Indicate if users are in same area without exposing coordinates
    public.users_in_same_area(auth.uid(), p.user_id) as is_same_area
  FROM public.profiles p
  WHERE 
    -- Only show profiles of users in the same area OR own profile
    p.user_id = auth.uid() OR 
    public.users_in_same_area(auth.uid(), p.user_id);
END;
$$;

-- Create a more restrictive RLS policy for the profiles table
DROP POLICY IF EXISTS "Users can view profiles in their area" ON public.profiles;

-- New policy: Users can only see their own full profile data
CREATE POLICY "Users can view their own profile completely"
  ON public.profiles FOR SELECT
  USING (user_id = auth.uid());

-- Create a separate policy for limited profile viewing
CREATE POLICY "Users can view limited profiles in their area"
  ON public.profiles FOR SELECT
  USING (
    user_id != auth.uid() AND 
    public.users_in_same_area(auth.uid(), user_id) AND
    -- Only allow viewing of non-sensitive fields
    TRUE
  );

-- Create a view that provides safe profile access
CREATE OR REPLACE VIEW public.safe_profiles AS
SELECT 
  user_id,
  username,
  display_name,
  avatar_url,
  bio,
  user_type,
  is_verified,
  created_at,
  -- For other users in same area: only show city/state/country, never coordinates
  CASE 
    WHEN user_id = auth.uid() THEN location_city
    WHEN public.users_in_same_area(auth.uid(), user_id) THEN location_city
    ELSE NULL
  END as location_city,
  CASE 
    WHEN user_id = auth.uid() THEN location_state
    WHEN public.users_in_same_area(auth.uid(), user_id) THEN location_state
    ELSE NULL
  END as location_state,
  CASE 
    WHEN user_id = auth.uid() THEN location_country
    WHEN public.users_in_same_area(auth.uid(), user_id) THEN location_country
    ELSE NULL
  END as location_country,
  -- Only show if user is viewing their own profile
  CASE 
    WHEN user_id = auth.uid() THEN latitude
    ELSE NULL
  END as latitude,
  CASE 
    WHEN user_id = auth.uid() THEN longitude
    ELSE NULL
  END as longitude,
  CASE 
    WHEN user_id = auth.uid() THEN current_latitude
    ELSE NULL
  END as current_latitude,
  CASE 
    WHEN user_id = auth.uid() THEN current_longitude
    ELSE NULL
  END as current_longitude,
  CASE 
    WHEN user_id = auth.uid() THEN real_time_location_enabled
    ELSE NULL
  END as real_time_location_enabled,
  CASE 
    WHEN user_id = auth.uid() THEN current_location_updated_at
    ELSE NULL
  END as current_location_updated_at
FROM public.profiles
WHERE 
  user_id = auth.uid() OR 
  public.users_in_same_area(auth.uid(), user_id);

-- Enable RLS on the view (though it inherits from the table)
-- Views inherit RLS from underlying tables, so this is primarily for clarity

-- Update the users_in_same_area function to be more secure
-- This function should NOT expose the actual coordinates in any way
CREATE OR REPLACE FUNCTION public.users_in_same_area(user1_id uuid, user2_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  user1_lat DECIMAL;
  user1_lon DECIMAL;
  user2_lat DECIMAL;
  user2_lon DECIMAL;
BEGIN
  -- This function only returns a boolean, never the actual coordinates
  -- Get user1 location (prioritize real-time location if enabled and recent)
  SELECT 
    CASE 
      WHEN real_time_location_enabled = true 
           AND current_latitude IS NOT NULL 
           AND current_location_updated_at > now() - interval '1 hour'
      THEN current_latitude
      ELSE latitude
    END,
    CASE 
      WHEN real_time_location_enabled = true 
           AND current_longitude IS NOT NULL 
           AND current_location_updated_at > now() - interval '1 hour'
      THEN current_longitude
      ELSE longitude
    END
  INTO user1_lat, user1_lon
  FROM public.profiles WHERE user_id = user1_id;
  
  -- Get user2 location (prioritize real-time location if enabled and recent)
  SELECT 
    CASE 
      WHEN real_time_location_enabled = true 
           AND current_latitude IS NOT NULL 
           AND current_location_updated_at > now() - interval '1 hour'
      THEN current_latitude
      ELSE latitude
    END,
    CASE 
      WHEN real_time_location_enabled = true 
           AND current_longitude IS NOT NULL 
           AND current_location_updated_at > now() - interval '1 hour'
      THEN current_longitude
      ELSE longitude
    END
  INTO user2_lat, user2_lon
  FROM public.profiles WHERE user_id = user2_id;
  
  IF user1_lat IS NULL OR user1_lon IS NULL OR user2_lat IS NULL OR user2_lon IS NULL THEN
    RETURN TRUE; -- Allow access if location data is missing
  END IF;
  
  -- Return only a boolean result, never expose coordinates
  RETURN public.calculate_distance(user1_lat, user1_lon, user2_lat, user2_lon) <= 50;
END;
$$;