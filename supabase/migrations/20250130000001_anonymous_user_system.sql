-- Migration: Anonymous User System and Enhanced Privacy Controls
-- Date: 2025-01-30
-- Description: Implement anonymous user system with comprehensive privacy controls

-- Add anonymous user fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS anonymous_username TEXT,
ADD COLUMN IF NOT EXISTS privacy_level TEXT DEFAULT 'public' CHECK (privacy_level IN ('public', 'friends', 'private', 'anonymous')),
ADD COLUMN IF NOT EXISTS show_real_name BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_email BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS show_phone BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS show_location BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS allow_direct_messages BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS allow_friend_requests BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_online_status BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS data_sharing_consent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS analytics_consent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS anonymous_session_id TEXT,
ADD COLUMN IF NOT EXISTS last_anonymous_activity TIMESTAMP WITH TIME ZONE;

-- Create anonymous_sessions table for tracking anonymous users
CREATE TABLE IF NOT EXISTS public.anonymous_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  user_agent TEXT,
  ip_address INET,
  location_city TEXT,
  location_state TEXT,
  location_country TEXT,
  timezone TEXT,
  language TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  is_active BOOLEAN DEFAULT TRUE
);

-- Create anonymous_posts table for anonymous content
CREATE TABLE IF NOT EXISTS public.anonymous_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES public.anonymous_sessions(session_id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  anonymous_username TEXT NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'discussion' CHECK (post_type IN ('discussion', 'question', 'announcement', 'event', 'poll', 'news_comment')),
  is_moderated BOOLEAN DEFAULT FALSE,
  moderation_reason TEXT,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  latitude NUMERIC,
  longitude NUMERIC,
  location_city TEXT,
  location_state TEXT,
  location_country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create anonymous_votes table for anonymous voting
CREATE TABLE IF NOT EXISTS public.anonymous_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES public.anonymous_sessions(session_id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  anonymous_post_id UUID REFERENCES public.anonymous_posts(id) ON DELETE CASCADE,
  vote_type INTEGER NOT NULL CHECK (vote_type IN (-1, 0, 1)), -- -1: downvote, 0: no vote, 1: upvote
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, post_id),
  UNIQUE(session_id, anonymous_post_id)
);

-- Create anonymous_comments table for anonymous comments
CREATE TABLE IF NOT EXISTS public.anonymous_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES public.anonymous_sessions(session_id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  anonymous_post_id UUID REFERENCES public.anonymous_posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.anonymous_comments(id) ON DELETE CASCADE,
  anonymous_username TEXT NOT NULL,
  content TEXT NOT NULL,
  is_moderated BOOLEAN DEFAULT FALSE,
  moderation_reason TEXT,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  depth INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create government_authorities table for tagging system
CREATE TABLE IF NOT EXISTS public.government_authorities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('municipal', 'state', 'central', 'local_body', 'department')),
  level TEXT NOT NULL CHECK (level IN ('local', 'district', 'state', 'national')),
  jurisdiction TEXT NOT NULL, -- City, district, state, or national
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  social_media JSONB DEFAULT '{}',
  response_time_hours INTEGER DEFAULT 72, -- Expected response time
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create government_tags table for tagging posts with authorities
CREATE TABLE IF NOT EXISTS public.government_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  anonymous_post_id UUID REFERENCES public.anonymous_posts(id) ON DELETE CASCADE,
  authority_id UUID NOT NULL REFERENCES public.government_authorities(id) ON DELETE CASCADE,
  tag_type TEXT DEFAULT 'issue' CHECK (tag_type IN ('issue', 'complaint', 'suggestion', 'request', 'feedback')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'in_progress', 'resolved', 'closed')),
  response_text TEXT,
  response_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create privacy_settings table for granular privacy controls
CREATE TABLE IF NOT EXISTS public.privacy_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT REFERENCES public.anonymous_sessions(session_id) ON DELETE CASCADE,
  setting_name TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, setting_name),
  UNIQUE(session_id, setting_name)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_anonymous ON public.profiles(is_anonymous);
CREATE INDEX IF NOT EXISTS idx_profiles_privacy_level ON public.profiles(privacy_level);
CREATE INDEX IF NOT EXISTS idx_profiles_anonymous_session_id ON public.profiles(anonymous_session_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_sessions_session_id ON public.anonymous_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_sessions_is_active ON public.anonymous_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_anonymous_sessions_expires_at ON public.anonymous_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_anonymous_posts_session_id ON public.anonymous_posts(session_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_posts_post_type ON public.anonymous_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_anonymous_posts_is_moderated ON public.anonymous_posts(is_moderated);
CREATE INDEX IF NOT EXISTS idx_anonymous_votes_session_id ON public.anonymous_votes(session_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_comments_session_id ON public.anonymous_comments(session_id);
CREATE INDEX IF NOT EXISTS idx_government_authorities_type ON public.government_authorities(type);
CREATE INDEX IF NOT EXISTS idx_government_authorities_level ON public.government_authorities(level);
CREATE INDEX IF NOT EXISTS idx_government_authorities_jurisdiction ON public.government_authorities(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_government_tags_authority_id ON public.government_tags(authority_id);
CREATE INDEX IF NOT EXISTS idx_government_tags_status ON public.government_tags(status);
CREATE INDEX IF NOT EXISTS idx_privacy_settings_user_id ON public.privacy_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_privacy_settings_session_id ON public.privacy_settings(session_id);

-- Enable RLS on new tables
ALTER TABLE public.anonymous_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_authorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for anonymous_sessions
CREATE POLICY "Anyone can create anonymous sessions" ON public.anonymous_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Sessions can view their own data" ON public.anonymous_sessions
  FOR SELECT USING (session_id = current_setting('request.jwt.claims', true)::json->>'session_id' OR is_active = true);

-- Create RLS policies for anonymous_posts
CREATE POLICY "Anyone can view non-moderated anonymous posts" ON public.anonymous_posts
  FOR SELECT USING (is_moderated = false);

CREATE POLICY "Sessions can create their own anonymous posts" ON public.anonymous_posts
  FOR INSERT WITH CHECK (session_id = current_setting('request.jwt.claims', true)::json->>'session_id');

CREATE POLICY "Sessions can update their own anonymous posts" ON public.anonymous_posts
  FOR UPDATE USING (session_id = current_setting('request.jwt.claims', true)::json->>'session_id');

-- Create RLS policies for anonymous_votes
CREATE POLICY "Sessions can manage their own votes" ON public.anonymous_votes
  FOR ALL USING (session_id = current_setting('request.jwt.claims', true)::json->>'session_id');

-- Create RLS policies for anonymous_comments
CREATE POLICY "Anyone can view non-moderated anonymous comments" ON public.anonymous_comments
  FOR SELECT USING (is_moderated = false);

CREATE POLICY "Sessions can create their own anonymous comments" ON public.anonymous_comments
  FOR INSERT WITH CHECK (session_id = current_setting('request.jwt.claims', true)::json->>'session_id');

CREATE POLICY "Sessions can update their own anonymous comments" ON public.anonymous_comments
  FOR UPDATE USING (session_id = current_setting('request.jwt.claims', true)::json->>'session_id');

-- Create RLS policies for government_authorities
CREATE POLICY "Anyone can view active government authorities" ON public.government_authorities
  FOR SELECT USING (is_active = true);

-- Create RLS policies for government_tags
CREATE POLICY "Anyone can view government tags" ON public.government_tags
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create government tags" ON public.government_tags
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create RLS policies for privacy_settings
CREATE POLICY "Users can manage their own privacy settings" ON public.privacy_settings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Sessions can manage their own privacy settings" ON public.privacy_settings
  FOR ALL USING (session_id = current_setting('request.jwt.claims', true)::json->>'session_id');

-- Create triggers for updated_at
CREATE TRIGGER update_anonymous_sessions_updated_at BEFORE UPDATE ON public.anonymous_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anonymous_posts_updated_at BEFORE UPDATE ON public.anonymous_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anonymous_votes_updated_at BEFORE UPDATE ON public.anonymous_votes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anonymous_comments_updated_at BEFORE UPDATE ON public.anonymous_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_government_authorities_updated_at BEFORE UPDATE ON public.government_authorities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_government_tags_updated_at BEFORE UPDATE ON public.government_tags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_privacy_settings_updated_at BEFORE UPDATE ON public.privacy_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample government authorities for major Indian cities
INSERT INTO public.government_authorities (name, type, level, jurisdiction, contact_email, website) VALUES
-- Delhi
('Municipal Corporation of Delhi', 'municipal', 'local', 'Delhi', 'info@mcd.gov.in', 'https://mcd.gov.in'),
('Delhi Development Authority', 'department', 'local', 'Delhi', 'info@dda.org.in', 'https://dda.org.in'),
('Delhi Police', 'department', 'local', 'Delhi', 'info@delhipolice.nic.in', 'https://delhipolice.nic.in'),

-- Mumbai
('Brihanmumbai Municipal Corporation', 'municipal', 'local', 'Mumbai', 'info@bmc.gov.in', 'https://portal.mcgm.gov.in'),
('Mumbai Police', 'department', 'local', 'Mumbai', 'info@mumbaipolice.gov.in', 'https://mumbaipolice.gov.in'),

-- Bangalore
('Bruhat Bengaluru Mahanagara Palike', 'municipal', 'local', 'Bangalore', 'info@bbmp.gov.in', 'https://bbmp.gov.in'),
('Bangalore City Police', 'department', 'local', 'Bangalore', 'info@bcp.gov.in', 'https://bcp.gov.in'),

-- Chennai
('Greater Chennai Corporation', 'municipal', 'local', 'Chennai', 'info@chennaicorporation.gov.in', 'https://chennaicorporation.gov.in'),
('Chennai City Police', 'department', 'local', 'Chennai', 'info@chennaipolice.gov.in', 'https://chennaipolice.gov.in'),

-- Kolkata
('Kolkata Municipal Corporation', 'municipal', 'local', 'Kolkata', 'info@kmcgov.in', 'https://kmcgov.in'),
('Kolkata Police', 'department', 'local', 'Kolkata', 'info@kolkatapolice.gov.in', 'https://kolkatapolice.gov.in'),

-- Hyderabad
('Greater Hyderabad Municipal Corporation', 'municipal', 'local', 'Hyderabad', 'info@ghmc.gov.in', 'https://ghmc.gov.in'),
('Hyderabad City Police', 'department', 'local', 'Hyderabad', 'info@hyderabadpolice.gov.in', 'https://hyderabadpolice.gov.in'),

-- Pune
('Pune Municipal Corporation', 'municipal', 'local', 'Pune', 'info@punecorporation.org', 'https://punecorporation.org'),
('Pune City Police', 'department', 'local', 'Pune', 'info@punepolice.gov.in', 'https://punepolice.gov.in'),

-- Ahmedabad
('Ahmedabad Municipal Corporation', 'municipal', 'local', 'Ahmedabad', 'info@ahmedabadcity.gov.in', 'https://ahmedabadcity.gov.in'),
('Ahmedabad City Police', 'department', 'local', 'Ahmedabad', 'info@ahmedabadpolice.gov.in', 'https://ahmedabadpolice.gov.in'),

-- State Level
('Delhi Government', 'state', 'state', 'Delhi', 'info@delhi.gov.in', 'https://delhi.gov.in'),
('Maharashtra Government', 'state', 'state', 'Maharashtra', 'info@maharashtra.gov.in', 'https://maharashtra.gov.in'),
('Karnataka Government', 'state', 'state', 'Karnataka', 'info@karnataka.gov.in', 'https://karnataka.gov.in'),
('Tamil Nadu Government', 'state', 'state', 'Tamil Nadu', 'info@tn.gov.in', 'https://tn.gov.in'),
('West Bengal Government', 'state', 'state', 'West Bengal', 'info@wb.gov.in', 'https://wb.gov.in'),
('Telangana Government', 'state', 'state', 'Telangana', 'info@telangana.gov.in', 'https://telangana.gov.in'),
('Gujarat Government', 'state', 'state', 'Gujarat', 'info@gujarat.gov.in', 'https://gujarat.gov.in'),

-- Central Level
('Ministry of Housing and Urban Affairs', 'central', 'national', 'India', 'info@mohua.gov.in', 'https://mohua.gov.in'),
('Ministry of Home Affairs', 'central', 'national', 'India', 'info@mha.gov.in', 'https://mha.gov.in'),
('Ministry of Road Transport and Highways', 'central', 'national', 'India', 'info@morth.gov.in', 'https://morth.gov.in');

-- Create function to generate anonymous username
CREATE OR REPLACE FUNCTION generate_anonymous_username()
RETURNS TEXT AS $$
DECLARE
  adjectives TEXT[] := ARRAY['Silent', 'Mysterious', 'Curious', 'Wise', 'Bold', 'Gentle', 'Bright', 'Swift', 'Calm', 'Brave', 'Kind', 'Smart', 'Quick', 'Strong', 'Peaceful'];
  nouns TEXT[] := ARRAY['Observer', 'Thinker', 'Explorer', 'Dreamer', 'Builder', 'Helper', 'Creator', 'Solver', 'Guide', 'Friend', 'Learner', 'Teacher', 'Artist', 'Writer', 'Reader'];
  adjective TEXT;
  noun TEXT;
  number_part TEXT;
BEGIN
  adjective := adjectives[floor(random() * array_length(adjectives, 1)) + 1];
  noun := nouns[floor(random() * array_length(nouns, 1)) + 1];
  number_part := LPAD(floor(random() * 9999)::text, 4, '0');
  
  RETURN adjective || noun || number_part;
END;
$$ LANGUAGE plpgsql;

-- Create function to create anonymous session
CREATE OR REPLACE FUNCTION create_anonymous_session(
  p_user_agent TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_location_city TEXT DEFAULT NULL,
  p_location_state TEXT DEFAULT NULL,
  p_location_country TEXT DEFAULT NULL,
  p_timezone TEXT DEFAULT NULL,
  p_language TEXT DEFAULT NULL,
  p_device_type TEXT DEFAULT NULL,
  p_browser TEXT DEFAULT NULL,
  p_os TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  session_id TEXT;
BEGIN
  -- Generate unique session ID
  session_id := gen_random_uuid()::text;
  
  -- Create anonymous session
  INSERT INTO public.anonymous_sessions (
    session_id, user_agent, ip_address, location_city, location_state, 
    location_country, timezone, language, device_type, browser, os
  ) VALUES (
    session_id, p_user_agent, p_ip_address, p_location_city, p_location_state,
    p_location_country, p_timezone, p_language, p_device_type, p_browser, p_os
  );
  
  RETURN session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get or create anonymous session
CREATE OR REPLACE FUNCTION get_or_create_anonymous_session(
  p_session_id TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_location_city TEXT DEFAULT NULL,
  p_location_state TEXT DEFAULT NULL,
  p_location_country TEXT DEFAULT NULL,
  p_timezone TEXT DEFAULT NULL,
  p_language TEXT DEFAULT NULL,
  p_device_type TEXT DEFAULT NULL,
  p_browser TEXT DEFAULT NULL,
  p_os TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  existing_session_id TEXT;
  new_session_id TEXT;
BEGIN
  -- If session_id provided, check if it exists and is active
  IF p_session_id IS NOT NULL THEN
    SELECT session_id INTO existing_session_id
    FROM public.anonymous_sessions
    WHERE session_id = p_session_id AND is_active = true AND expires_at > NOW();
    
    IF existing_session_id IS NOT NULL THEN
      -- Update last activity
      UPDATE public.anonymous_sessions
      SET last_activity = NOW()
      WHERE session_id = existing_session_id;
      
      RETURN existing_session_id;
    END IF;
  END IF;
  
  -- Create new session
  new_session_id := create_anonymous_session(
    p_user_agent, p_ip_address, p_location_city, p_location_state,
    p_location_country, p_timezone, p_language, p_device_type, p_browser, p_os
  );
  
  RETURN new_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
