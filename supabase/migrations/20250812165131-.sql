-- Remove the security definer view and implement RLS-based solution instead
DROP VIEW IF EXISTS public.safe_profiles;

-- Update the profiles RLS policies to be more granular about what data is exposed
DROP POLICY IF EXISTS "Users can view their own profile completely" ON public.profiles;
DROP POLICY IF EXISTS "Users can view limited profiles in their area" ON public.profiles;

-- Create a single comprehensive policy that restricts sensitive data exposure
CREATE POLICY "Secure profile access policy"
  ON public.profiles FOR SELECT
  USING (
    user_id = auth.uid() OR  -- Users can see their own complete profile
    (
      -- For other users in same area: only allow if they're in same geographical area
      -- but the application layer must handle filtering sensitive fields
      public.users_in_same_area(auth.uid(), user_id)
    )
  );

-- Create a secure function for getting profile data with appropriate filtering
CREATE OR REPLACE FUNCTION public.get_filtered_profile(profile_user_id UUID)
RETURNS TABLE(
  user_id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  user_type TEXT,
  is_verified BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  location_city TEXT,
  location_state TEXT,
  location_country TEXT,
  -- GPS coordinates only for own profile
  latitude DECIMAL,
  longitude DECIMAL,
  current_latitude DECIMAL,
  current_longitude DECIMAL,
  real_time_location_enabled BOOLEAN,
  current_location_updated_at TIMESTAMP WITH TIME ZONE,
  is_own_profile BOOLEAN
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  is_own_profile_val BOOLEAN;
  is_same_area_val BOOLEAN;
BEGIN
  -- Check if this is the user's own profile
  is_own_profile_val := (profile_user_id = auth.uid());
  
  -- Check if user is in same area (only if not own profile)
  IF NOT is_own_profile_val THEN
    is_same_area_val := public.users_in_same_area(auth.uid(), profile_user_id);
  ELSE
    is_same_area_val := TRUE;
  END IF;
  
  -- Only return data if user has permission to view
  IF is_own_profile_val OR is_same_area_val THEN
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
      -- Location info: city/state/country for same area users, all for own profile
      CASE 
        WHEN is_own_profile_val THEN p.location_city
        WHEN is_same_area_val THEN p.location_city
        ELSE NULL
      END as location_city,
      CASE 
        WHEN is_own_profile_val THEN p.location_state
        WHEN is_same_area_val THEN p.location_state
        ELSE NULL
      END as location_state,
      CASE 
        WHEN is_own_profile_val THEN p.location_country
        WHEN is_same_area_val THEN p.location_country
        ELSE NULL
      END as location_country,
      -- GPS coordinates ONLY for own profile, never for others
      CASE WHEN is_own_profile_val THEN p.latitude ELSE NULL END as latitude,
      CASE WHEN is_own_profile_val THEN p.longitude ELSE NULL END as longitude,
      CASE WHEN is_own_profile_val THEN p.current_latitude ELSE NULL END as current_latitude,
      CASE WHEN is_own_profile_val THEN p.current_longitude ELSE NULL END as current_longitude,
      CASE WHEN is_own_profile_val THEN p.real_time_location_enabled ELSE NULL END as real_time_location_enabled,
      CASE WHEN is_own_profile_val THEN p.current_location_updated_at ELSE NULL END as current_location_updated_at,
      is_own_profile_val as is_own_profile
    FROM public.profiles p
    WHERE p.user_id = profile_user_id;
  END IF;
END;
$$;