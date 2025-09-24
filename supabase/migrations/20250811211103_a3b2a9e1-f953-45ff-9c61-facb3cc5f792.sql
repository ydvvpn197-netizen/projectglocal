-- Fix security definer view issue with artist_bookings_safe
-- Remove the view since it's causing security issues and we have the secure function instead

DROP VIEW IF EXISTS public.artist_bookings_safe;

-- Fix the search path for the new OAuth function to be secure
CREATE OR REPLACE FUNCTION public.handle_oauth_user_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Create profile for OAuth users
  INSERT INTO public.profiles (
    user_id, 
    username, 
    display_name,
    avatar_url
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'user_name', NEW.raw_user_meta_data ->> 'preferred_username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = now();
    
  RETURN NEW;
END;
$$;

-- Also fix the site URL function search path
CREATE OR REPLACE FUNCTION public.get_site_url()
RETURNS text
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    current_setting('app.settings.site_url', true),
    'http://localhost:3000'
  );
$$;