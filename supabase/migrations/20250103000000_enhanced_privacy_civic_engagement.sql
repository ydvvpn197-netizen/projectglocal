-- Enhanced Privacy & Anonymity System Migration
-- Priority 1: Enhanced Privacy & Anonymity
-- Priority 2: Government Polls & Civic Engagement

-- ==============================================
-- ANONYMOUS PROFILES AND PRIVACY ENHANCEMENTS
-- ==============================================

-- Create anonymous profiles table
CREATE TABLE IF NOT EXISTS public.anonymous_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_id TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  reveal_identity BOOLEAN DEFAULT false,
  privacy_level TEXT NOT NULL CHECK (privacy_level IN ('anonymous', 'pseudonymous', 'public')),
  location_sharing TEXT NOT NULL CHECK (location_sharing IN ('none', 'city', 'precise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, anonymous_id)
);

-- Create anonymous users table for tracking anonymous mode
CREATE TABLE IF NOT EXISTS public.anonymous_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_profile_id UUID REFERENCES public.anonymous_profiles(id) ON DELETE CASCADE,
  is_anonymous_mode BOOLEAN DEFAULT false,
  last_anonymous_activity TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create anonymous preferences table
CREATE TABLE IF NOT EXISTS public.anonymous_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  auto_anonymous_mode BOOLEAN DEFAULT false,
  default_privacy_level TEXT DEFAULT 'anonymous' CHECK (default_privacy_level IN ('anonymous', 'pseudonymous', 'public')),
  default_location_sharing TEXT DEFAULT 'none' CHECK (default_location_sharing IN ('none', 'city', 'precise')),
  allow_identity_reveal BOOLEAN DEFAULT false,
  anonymous_notifications BOOLEAN DEFAULT true,
  anonymous_analytics BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create anonymous activity tracking table
CREATE TABLE IF NOT EXISTS public.anonymous_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_id TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('post', 'comment', 'vote', 'poll', 'protest')),
  target_id TEXT NOT NULL,
  privacy_level TEXT NOT NULL CHECK (privacy_level IN ('anonymous', 'pseudonymous', 'public')),
  location_sharing TEXT NOT NULL CHECK (location_sharing IN ('none', 'city', 'precise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- GOVERNMENT AUTHORITIES AND CIVIC ENGAGEMENT
-- ==============================================

-- Create government authorities table
CREATE TABLE IF NOT EXISTS public.government_authorities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('federal', 'state', 'local', 'municipal', 'county', 'school_district')),
  jurisdiction TEXT NOT NULL,
  jurisdiction_code TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  api_endpoint TEXT,
  api_key_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, jurisdiction)
);

-- Create government API configurations table
CREATE TABLE IF NOT EXISTS public.government_api_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  authority_id UUID REFERENCES public.government_authorities(id) ON DELETE CASCADE,
  api_name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  endpoints JSONB NOT NULL,
  authentication JSONB NOT NULL,
  rate_limits JSONB NOT NULL,
  data_format TEXT DEFAULT 'json' CHECK (data_format IN ('json', 'xml', 'csv')),
  last_sync TIMESTAMP WITH TIME ZONE,
  sync_frequency TEXT DEFAULT 'daily' CHECK (sync_frequency IN ('realtime', 'hourly', 'daily', 'weekly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(authority_id, api_name)
);

-- ==============================================
-- ENHANCED POLLS WITH GOVERNMENT INTEGRATION
-- ==============================================

-- Add government authority columns to existing polls table
ALTER TABLE public.polls 
ADD COLUMN IF NOT EXISTS government_authority_id UUID REFERENCES public.government_authorities(id),
ADD COLUMN IF NOT EXISTS poll_type TEXT DEFAULT 'community' CHECK (poll_type IN ('official', 'community', 'protest', 'survey')),
ADD COLUMN IF NOT EXISTS requires_verification BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS official_status TEXT DEFAULT 'active' CHECK (official_status IN ('draft', 'pending', 'approved', 'rejected', 'active', 'closed')),
ADD COLUMN IF NOT EXISTS verification_level TEXT DEFAULT 'none' CHECK (verification_level IN ('none', 'email', 'phone', 'address', 'id_required')),
ADD COLUMN IF NOT EXISTS target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'registered_voters', 'residents', 'stakeholders')),
ADD COLUMN IF NOT EXISTS geographic_scope JSONB,
ADD COLUMN IF NOT EXISTS civic_impact_level TEXT DEFAULT 'informational' CHECK (civic_impact_level IN ('informational', 'advisory', 'binding', 'referendum')),
ADD COLUMN IF NOT EXISTS legal_framework TEXT,
ADD COLUMN IF NOT EXISTS compliance_requirements TEXT[],
ADD COLUMN IF NOT EXISTS results_visibility TEXT DEFAULT 'public' CHECK (results_visibility IN ('public', 'authorized_only', 'aggregate_only')),
ADD COLUMN IF NOT EXISTS data_retention_policy TEXT,
ADD COLUMN IF NOT EXISTS created_by_authority BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS authority_contact_id TEXT;

-- ==============================================
-- VIRTUAL PROTEST SYSTEM
-- ==============================================

-- Create virtual protests table
CREATE TABLE IF NOT EXISTS public.virtual_protests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  organizer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organizer_anonymous_id TEXT,
  cause TEXT NOT NULL,
  target_authority_id UUID REFERENCES public.government_authorities(id),
  protest_type TEXT NOT NULL CHECK (protest_type IN ('petition', 'boycott', 'awareness', 'digital_assembly', 'symbolic_action')),
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'paused', 'completed', 'cancelled')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  participation_goal INTEGER DEFAULT 100,
  current_participants INTEGER DEFAULT 0,
  location_type TEXT NOT NULL DEFAULT 'virtual' CHECK (location_type IN ('virtual', 'hybrid', 'local')),
  location_details JSONB,
  requirements JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create virtual protest actions table
CREATE TABLE IF NOT EXISTS public.virtual_protest_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  protest_id UUID REFERENCES public.virtual_protests(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('sign_petition', 'share_content', 'contact_official', 'attend_event', 'donate', 'boycott')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT NOT NULL,
  external_url TEXT,
  completion_criteria TEXT NOT NULL,
  points_rewarded INTEGER DEFAULT 10,
  is_required BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create virtual protest supporters table
CREATE TABLE IF NOT EXISTS public.virtual_protest_supporters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  protest_id UUID REFERENCES public.virtual_protests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_id TEXT,
  participation_level TEXT NOT NULL DEFAULT 'supporter' CHECK (participation_level IN ('supporter', 'participant', 'organizer')),
  actions_completed TEXT[] DEFAULT '{}',
  total_points INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(protest_id, user_id)
);

-- ==============================================
-- COMMUNITY ISSUES AND REPORTING
-- ==============================================

-- Create community issues table
CREATE TABLE IF NOT EXISTS public.community_issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reporter_anonymous_id TEXT,
  category TEXT NOT NULL CHECK (category IN ('infrastructure', 'safety', 'environment', 'transportation', 'housing', 'education', 'health', 'other')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'acknowledged', 'in_progress', 'resolved', 'closed')),
  location JSONB NOT NULL,
  target_authority_id UUID REFERENCES public.government_authorities(id) NOT NULL,
  evidence JSONB,
  official_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create community issue supporters table
CREATE TABLE IF NOT EXISTS public.community_issue_supporters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id UUID REFERENCES public.community_issues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_id TEXT,
  support_type TEXT NOT NULL CHECK (support_type IN ('endorsement', 'witness', 'expert', 'affected_resident')),
  support_statement TEXT,
  contact_willing BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(issue_id, user_id)
);

-- ==============================================
-- CIVIC ENGAGEMENT ANALYTICS AND SCORING
-- ==============================================

-- Create civic engagement metrics table
CREATE TABLE IF NOT EXISTS public.civic_engagement_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_id TEXT,
  period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly')),
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  metrics JSONB NOT NULL,
  trends JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, period, period_start)
);

-- Create civic engagement scores table
CREATE TABLE IF NOT EXISTS public.civic_engagement_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_id TEXT,
  overall_score INTEGER NOT NULL DEFAULT 0,
  category_scores JSONB NOT NULL,
  level TEXT NOT NULL DEFAULT 'novice' CHECK (level IN ('novice', 'active', 'engaged', 'leader', 'champion')),
  badges JSONB DEFAULT '[]',
  achievements JSONB DEFAULT '[]',
  last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ==============================================
-- CIVIC CAMPAIGNS
-- ==============================================

-- Create civic campaigns table
CREATE TABLE IF NOT EXISTS public.civic_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  organizer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organizer_anonymous_id TEXT,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('awareness', 'advocacy', 'mobilization', 'education')),
  target_authority_id UUID REFERENCES public.government_authorities(id),
  goals JSONB NOT NULL,
  timeline JSONB NOT NULL,
  resources JSONB,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'paused', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create civic campaign activities table
CREATE TABLE IF NOT EXISTS public.civic_campaign_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.civic_campaigns(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('meeting', 'petition', 'rally', 'education', 'outreach', 'media')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  virtual_link TEXT,
  requirements TEXT[] DEFAULT '{}',
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create civic campaign participants table
CREATE TABLE IF NOT EXISTS public.civic_campaign_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.civic_campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_id TEXT,
  role TEXT NOT NULL DEFAULT 'participant' CHECK (role IN ('organizer', 'volunteer', 'supporter', 'participant')),
  activities_participated TEXT[] DEFAULT '{}',
  commitment_level TEXT NOT NULL DEFAULT 'medium' CHECK (commitment_level IN ('low', 'medium', 'high')),
  skills_offered TEXT[] DEFAULT '{}',
  availability TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, user_id)
);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- Anonymous profiles indexes
CREATE INDEX IF NOT EXISTS idx_anonymous_profiles_user_id ON public.anonymous_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_profiles_anonymous_id ON public.anonymous_profiles(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_users_user_id ON public.anonymous_users(user_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_activities_user_id ON public.anonymous_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_activities_anonymous_id ON public.anonymous_activities(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_activities_type ON public.anonymous_activities(activity_type);

-- Government authorities indexes
CREATE INDEX IF NOT EXISTS idx_government_authorities_type ON public.government_authorities(type);
CREATE INDEX IF NOT EXISTS idx_government_authorities_jurisdiction ON public.government_authorities(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_government_authorities_active ON public.government_authorities(is_active);

-- Enhanced polls indexes
CREATE INDEX IF NOT EXISTS idx_polls_government_authority ON public.polls(government_authority_id);
CREATE INDEX IF NOT EXISTS idx_polls_poll_type ON public.polls(poll_type);
CREATE INDEX IF NOT EXISTS idx_polls_official_status ON public.polls(official_status);
CREATE INDEX IF NOT EXISTS idx_polls_civic_impact ON public.polls(civic_impact_level);

-- Virtual protests indexes
CREATE INDEX IF NOT EXISTS idx_virtual_protests_organizer ON public.virtual_protests(organizer_id);
CREATE INDEX IF NOT EXISTS idx_virtual_protests_target_authority ON public.virtual_protests(target_authority_id);
CREATE INDEX IF NOT EXISTS idx_virtual_protests_status ON public.virtual_protests(status);
CREATE INDEX IF NOT EXISTS idx_virtual_protests_protest_type ON public.virtual_protests(protest_type);
CREATE INDEX IF NOT EXISTS idx_virtual_protest_supporters_protest ON public.virtual_protest_supporters(protest_id);
CREATE INDEX IF NOT EXISTS idx_virtual_protest_supporters_user ON public.virtual_protest_supporters(user_id);

-- Community issues indexes
CREATE INDEX IF NOT EXISTS idx_community_issues_reporter ON public.community_issues(reporter_id);
CREATE INDEX IF NOT EXISTS idx_community_issues_target_authority ON public.community_issues(target_authority_id);
CREATE INDEX IF NOT EXISTS idx_community_issues_category ON public.community_issues(category);
CREATE INDEX IF NOT EXISTS idx_community_issues_status ON public.community_issues(status);
CREATE INDEX IF NOT EXISTS idx_community_issues_priority ON public.community_issues(priority);
CREATE INDEX IF NOT EXISTS idx_community_issue_supporters_issue ON public.community_issue_supporters(issue_id);

-- Civic engagement indexes
CREATE INDEX IF NOT EXISTS idx_civic_engagement_metrics_user ON public.civic_engagement_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_civic_engagement_scores_user ON public.civic_engagement_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_civic_campaigns_organizer ON public.civic_campaigns(organizer_id);
CREATE INDEX IF NOT EXISTS idx_civic_campaigns_target_authority ON public.civic_campaigns(target_authority_id);
CREATE INDEX IF NOT EXISTS idx_civic_campaign_participants_campaign ON public.civic_campaign_participants(campaign_id);

-- ==============================================
-- ROW LEVEL SECURITY POLICIES
-- ==============================================

-- Enable RLS on all new tables
ALTER TABLE public.anonymous_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_authorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_api_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_protests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_protest_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_protest_supporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_issue_supporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_engagement_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_engagement_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_campaign_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_campaign_participants ENABLE ROW LEVEL SECURITY;

-- Anonymous profiles policies
CREATE POLICY "Users can view their own anonymous profiles" ON public.anonymous_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own anonymous profiles" ON public.anonymous_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own anonymous profiles" ON public.anonymous_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own anonymous profiles" ON public.anonymous_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Anonymous users policies
CREATE POLICY "Users can view their own anonymous user data" ON public.anonymous_users
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own anonymous user data" ON public.anonymous_users
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own anonymous user data" ON public.anonymous_users
  FOR UPDATE USING (auth.uid() = user_id);

-- Anonymous preferences policies
CREATE POLICY "Users can view their own anonymous preferences" ON public.anonymous_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own anonymous preferences" ON public.anonymous_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own anonymous preferences" ON public.anonymous_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Anonymous activities policies
CREATE POLICY "Users can view their own anonymous activities" ON public.anonymous_activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own anonymous activities" ON public.anonymous_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Government authorities policies (public read, admin write)
CREATE POLICY "Everyone can view active government authorities" ON public.government_authorities
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can view all government authorities" ON public.government_authorities
  FOR SELECT USING (auth.role() = 'authenticated');

-- Virtual protests policies
CREATE POLICY "Everyone can view active virtual protests" ON public.virtual_protests
  FOR SELECT USING (status IN ('active', 'planning'));

CREATE POLICY "Users can create virtual protests" ON public.virtual_protests
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Users can update their own virtual protests" ON public.virtual_protests
  FOR UPDATE USING (auth.uid() = organizer_id);

CREATE POLICY "Users can delete their own virtual protests" ON public.virtual_protests
  FOR DELETE USING (auth.uid() = organizer_id);

-- Virtual protest supporters policies
CREATE POLICY "Users can view virtual protest supporters" ON public.virtual_protest_supporters
  FOR SELECT USING (true);

CREATE POLICY "Users can join virtual protests" ON public.virtual_protest_supporters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own virtual protest participation" ON public.virtual_protest_supporters
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can leave virtual protests" ON public.virtual_protest_supporters
  FOR DELETE USING (auth.uid() = user_id);

-- Community issues policies
CREATE POLICY "Everyone can view community issues" ON public.community_issues
  FOR SELECT USING (true);

CREATE POLICY "Users can create community issues" ON public.community_issues
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can update their own community issues" ON public.community_issues
  FOR UPDATE USING (auth.uid() = reporter_id);

CREATE POLICY "Users can delete their own community issues" ON public.community_issues
  FOR DELETE USING (auth.uid() = reporter_id);

-- Community issue supporters policies
CREATE POLICY "Everyone can view community issue supporters" ON public.community_issue_supporters
  FOR SELECT USING (true);

CREATE POLICY "Users can support community issues" ON public.community_issue_supporters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own community issue support" ON public.community_issue_supporters
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can withdraw community issue support" ON public.community_issue_supporters
  FOR DELETE USING (auth.uid() = user_id);

-- Civic engagement policies
CREATE POLICY "Users can view their own civic engagement metrics" ON public.civic_engagement_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own civic engagement scores" ON public.civic_engagement_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can update civic engagement data" ON public.civic_engagement_metrics
  FOR ALL USING (true);

CREATE POLICY "System can update civic engagement scores" ON public.civic_engagement_scores
  FOR ALL USING (true);

-- Civic campaigns policies
CREATE POLICY "Everyone can view active civic campaigns" ON public.civic_campaigns
  FOR SELECT USING (status IN ('active', 'planning'));

CREATE POLICY "Users can create civic campaigns" ON public.civic_campaigns
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Users can update their own civic campaigns" ON public.civic_campaigns
  FOR UPDATE USING (auth.uid() = organizer_id);

CREATE POLICY "Users can delete their own civic campaigns" ON public.civic_campaigns
  FOR DELETE USING (auth.uid() = organizer_id);

-- Civic campaign participants policies
CREATE POLICY "Users can view civic campaign participants" ON public.civic_campaign_participants
  FOR SELECT USING (true);

CREATE POLICY "Users can join civic campaigns" ON public.civic_campaign_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own civic campaign participation" ON public.civic_campaign_participants
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can leave civic campaigns" ON public.civic_campaign_participants
  FOR DELETE USING (auth.uid() = user_id);

-- ==============================================
-- FUNCTIONS AND TRIGGERS
-- ==============================================

-- Function to generate anonymous usernames
CREATE OR REPLACE FUNCTION generate_anonymous_username()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := 'User_';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update virtual protest participant count
CREATE OR REPLACE FUNCTION update_virtual_protest_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.virtual_protests 
    SET current_participants = current_participants + 1,
        updated_at = NOW()
    WHERE id = NEW.protest_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.virtual_protests 
    SET current_participants = GREATEST(current_participants - 1, 0),
        updated_at = NOW()
    WHERE id = OLD.protest_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update civic campaign participant count
CREATE OR REPLACE FUNCTION update_civic_campaign_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.civic_campaign_activities 
    SET current_participants = current_participants + 1
    WHERE id = NEW.campaign_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.civic_campaign_activities 
    SET current_participants = GREATEST(current_participants - 1, 0)
    WHERE id = OLD.campaign_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate civic engagement score
CREATE OR REPLACE FUNCTION calculate_civic_engagement_score(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  polls_created INTEGER;
  polls_participated INTEGER;
  protests_organized INTEGER;
  protests_supported INTEGER;
  issues_reported INTEGER;
  issues_supported INTEGER;
BEGIN
  -- Count polls created
  SELECT COUNT(*) INTO polls_created
  FROM public.polls 
  WHERE user_id = p_user_id;
  
  -- Count polls participated
  SELECT COUNT(*) INTO polls_participated
  FROM public.poll_votes 
  WHERE user_id = p_user_id;
  
  -- Count protests organized
  SELECT COUNT(*) INTO protests_organized
  FROM public.virtual_protests 
  WHERE organizer_id = p_user_id;
  
  -- Count protests supported
  SELECT COUNT(*) INTO protests_supported
  FROM public.virtual_protest_supporters 
  WHERE user_id = p_user_id;
  
  -- Count issues reported
  SELECT COUNT(*) INTO issues_reported
  FROM public.community_issues 
  WHERE reporter_id = p_user_id;
  
  -- Count issues supported
  SELECT COUNT(*) INTO issues_supported
  FROM public.community_issue_supporters 
  WHERE user_id = p_user_id;
  
  -- Calculate score (weighted)
  score := (polls_created * 5) + 
           (polls_participated * 2) + 
           (protests_organized * 20) + 
           (protests_supported * 10) + 
           (issues_reported * 15) + 
           (issues_supported * 5);
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_update_virtual_protest_participant_count
  AFTER INSERT OR DELETE ON public.virtual_protest_supporters
  FOR EACH ROW EXECUTE FUNCTION update_virtual_protest_participant_count();

CREATE TRIGGER trigger_update_civic_campaign_participant_count
  AFTER INSERT OR DELETE ON public.civic_campaign_participants
  FOR EACH ROW EXECUTE FUNCTION update_civic_campaign_participant_count();

-- ==============================================
-- SAMPLE DATA FOR TESTING
-- ==============================================

-- Insert sample government authorities
INSERT INTO public.government_authorities (name, type, jurisdiction, jurisdiction_code, contact_email, website, is_active) VALUES
('City of San Francisco', 'municipal', 'San Francisco, CA', 'SF-CA', 'mayor@sfgov.org', 'https://sf.gov', true),
('California State Legislature', 'state', 'California', 'CA', 'info@legislature.ca.gov', 'https://legislature.ca.gov', true),
('U.S. House of Representatives', 'federal', 'United States', 'US', 'info@house.gov', 'https://house.gov', true),
('San Francisco Unified School District', 'school_district', 'San Francisco, CA', 'SFUSD-CA', 'info@sfusd.edu', 'https://sfusd.edu', true),
('San Francisco County', 'county', 'San Francisco County, CA', 'SF-County-CA', 'info@sfgov.org', 'https://sfgov.org', true);

-- Update delete_user_account function to include new tables
CREATE OR REPLACE FUNCTION delete_user_account(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete in order to respect foreign key constraints
  
  -- 1. Delete civic campaign participants
  DELETE FROM civic_campaign_participants WHERE user_id = user_id;
  
  -- 2. Delete civic campaign activities (if user created campaigns)
  DELETE FROM civic_campaign_activities 
  WHERE campaign_id IN (
    SELECT id FROM civic_campaigns WHERE organizer_id = user_id
  );
  
  -- 3. Delete civic campaigns (if user created any)
  DELETE FROM civic_campaigns WHERE organizer_id = user_id;
  
  -- 4. Delete civic engagement scores
  DELETE FROM civic_engagement_scores WHERE user_id = user_id;
  
  -- 5. Delete civic engagement metrics
  DELETE FROM civic_engagement_metrics WHERE user_id = user_id;
  
  -- 6. Delete community issue supporters
  DELETE FROM community_issue_supporters WHERE user_id = user_id;
  
  -- 7. Delete community issues (if user reported any)
  DELETE FROM community_issues WHERE reporter_id = user_id;
  
  -- 8. Delete virtual protest supporters
  DELETE FROM virtual_protest_supporters WHERE user_id = user_id;
  
  -- 9. Delete virtual protest actions (if user created protests)
  DELETE FROM virtual_protest_actions 
  WHERE protest_id IN (
    SELECT id FROM virtual_protests WHERE organizer_id = user_id
  );
  
  -- 10. Delete virtual protests (if user created any)
  DELETE FROM virtual_protests WHERE organizer_id = user_id;
  
  -- 11. Delete anonymous activities
  DELETE FROM anonymous_activities WHERE user_id = user_id;
  
  -- 12. Delete anonymous preferences
  DELETE FROM anonymous_preferences WHERE user_id = user_id;
  
  -- 13. Delete anonymous users
  DELETE FROM anonymous_users WHERE user_id = user_id;
  
  -- 14. Delete anonymous profiles
  DELETE FROM anonymous_profiles WHERE user_id = user_id;
  
  -- Continue with existing deletion logic...
  -- (Previous deletion steps remain the same)
  
  -- 15. Delete chat messages
  DELETE FROM chat_messages 
  WHERE conversation_id IN (
    SELECT id FROM chat_conversations 
    WHERE client_id = user_id OR artist_id = user_id
  );
  
  -- 16. Delete chat conversations
  DELETE FROM chat_conversations 
  WHERE client_id = user_id OR artist_id = user_id;
  
  -- 17. Delete notifications
  DELETE FROM notifications 
  WHERE user_id = user_id;
  
  -- 18. Delete artist bookings
  DELETE FROM artist_bookings 
  WHERE user_id = user_id OR artist_id IN (
    SELECT id FROM artists WHERE user_id = user_id
  );
  
  -- 19. Delete artist discussions
  DELETE FROM artist_discussions 
  WHERE artist_id IN (
    SELECT id FROM artists WHERE user_id = user_id
  );
  
  -- 20. Delete artists record
  DELETE FROM artists 
  WHERE user_id = user_id;
  
  -- 21. Delete comments
  DELETE FROM comments 
  WHERE user_id = user_id;
  
  -- 22. Delete likes
  DELETE FROM likes 
  WHERE user_id = user_id;
  
  -- 23. Delete follows
  DELETE FROM follows 
  WHERE follower_id = user_id OR following_id = user_id;
  
  -- 24. Delete posts
  DELETE FROM posts 
  WHERE user_id = user_id;
  
  -- 25. Delete events (if user created any)
  DELETE FROM events 
  WHERE created_by = user_id;
  
  -- 26. Delete groups (if user created any)
  DELETE FROM groups 
  WHERE created_by = user_id;
  
  -- 27. Delete discussions (if user created any)
  DELETE FROM discussions 
  WHERE created_by = user_id;
  
  -- 28. Delete poll votes
  DELETE FROM poll_votes 
  WHERE user_id = user_id;
  
  -- 29. Delete polls
  DELETE FROM polls 
  WHERE user_id = user_id;
  
  -- 30. Delete review votes
  DELETE FROM review_votes 
  WHERE user_id = user_id;
  
  -- 31. Delete review replies
  DELETE FROM review_replies 
  WHERE user_id = user_id;
  
  -- 32. Delete reviews
  DELETE FROM reviews 
  WHERE user_id = user_id;
  
  -- 33. Finally delete the profile
  DELETE FROM profiles 
  WHERE user_id = user_id;
  
END;
$$;
