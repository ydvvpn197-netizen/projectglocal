-- Configure OAuth providers for Google and Facebook authentication
-- This will enable the OAuth providers in Supabase

-- Note: The actual OAuth configuration needs to be done in the Supabase Dashboard
-- under Authentication -> Providers, but this migration documents the requirement

-- Insert into auth.providers if the table exists and is accessible
-- These are standard OAuth providers that Supabase supports

-- Create a function to help with OAuth redirects
CREATE OR REPLACE FUNCTION public.get_site_url()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    current_setting('app.settings.site_url', true),
    'http://localhost:3000'
  );
$$;

-- Add some helper functions for OAuth user creation
CREATE OR REPLACE FUNCTION public.handle_oauth_user_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

-- Update the existing trigger to handle OAuth users better
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_oauth_user_creation();