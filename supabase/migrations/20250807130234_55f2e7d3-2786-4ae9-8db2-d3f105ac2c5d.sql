-- Fix the critical security vulnerability in users_in_same_area function
-- Currently it returns TRUE when location data is missing, allowing global access
-- This fixes it to return FALSE for better security

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
  SELECT latitude, longitude INTO user1_lat, user1_lon
  FROM public.profiles WHERE user_id = user1_id;
  
  SELECT latitude, longitude INTO user2_lat, user2_lon
  FROM public.profiles WHERE user_id = user2_id;
  
  -- SECURITY FIX: Return FALSE if location data is missing for either user
  -- This prevents users without location from seeing global content
  IF user1_lat IS NULL OR user1_lon IS NULL OR user2_lat IS NULL OR user2_lon IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN public.calculate_distance(user1_lat, user1_lon, user2_lat, user2_lon) <= 50;
END;
$function$;

-- Add validation for contact_info to prevent sensitive data exposure
-- Create a function to validate contact information
CREATE OR REPLACE FUNCTION public.validate_contact_info()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Prevent posting of sensitive information patterns
  IF NEW.contact_info IS NOT NULL THEN
    -- Check for social security numbers, credit card patterns, etc.
    IF NEW.contact_info ~* '\b\d{3}-?\d{2}-?\d{4}\b' OR  -- SSN pattern
       NEW.contact_info ~* '\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b' OR  -- Credit card pattern
       NEW.contact_info ~* 'password|secret|private key|api[_ ]?key' THEN  -- Sensitive keywords
      RAISE EXCEPTION 'Contact information contains potentially sensitive data. Please use only public contact methods.';
    END IF;
    
    -- Limit length to prevent abuse
    IF LENGTH(NEW.contact_info) > 200 THEN
      RAISE EXCEPTION 'Contact information is too long. Maximum 200 characters allowed.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Apply the validation trigger to posts table
CREATE TRIGGER validate_contact_info_trigger
  BEFORE INSERT OR UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_contact_info();