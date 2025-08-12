-- Create the missing users_in_same_area function
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
$function$;

-- Also create the calculate_distance function if it doesn't exist
CREATE OR REPLACE FUNCTION public.calculate_distance(lat1 numeric, lon1 numeric, lat2 numeric, lon2 numeric)
 RETURNS numeric
 LANGUAGE plpgsql
 IMMUTABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  RETURN (
    6371 * acos(
      cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(lon2) - radians(lon1)) +
      sin(radians(lat1)) * sin(radians(lat2))
    )
  );
END;
$function$;