-- Add real-time location columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN real_time_location_enabled boolean DEFAULT false,
ADD COLUMN current_latitude numeric,
ADD COLUMN current_longitude numeric,
ADD COLUMN current_location_updated_at timestamp with time zone;

-- Create index for better location queries
CREATE INDEX idx_profiles_current_location ON public.profiles (current_latitude, current_longitude) WHERE real_time_location_enabled = true;

-- Update the users_in_same_area function to use real-time location when available
CREATE OR REPLACE FUNCTION public.users_in_same_area(user1_id uuid, user2_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  user1_lat DECIMAL;
  user1_lon DECIMAL;
  user2_lat DECIMAL;
  user2_lon DECIMAL;
BEGIN
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
  
  RETURN public.calculate_distance(user1_lat, user1_lon, user2_lat, user2_lon) <= 50;
END;
$function$;