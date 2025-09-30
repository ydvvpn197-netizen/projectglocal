-- ============================================================================
-- FIX SCHEMA ISSUES - TheGlocal Project
-- ============================================================================
-- This migration fixes critical schema issues identified in the analysis
-- Date: 2025-01-28
-- Version: 1.0.1

-- ============================================================================
-- CREATE MISSING TABLES
-- ============================================================================

-- Community Groups Table
CREATE TABLE IF NOT EXISTS public.community_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  location_city TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Community Members Table
CREATE TABLE IF NOT EXISTS public.community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.community_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(community_id, user_id)
);

-- ============================================================================
-- ADD MISSING COLUMNS TO PROFILES TABLE
-- ============================================================================

-- Add anonymous handle system columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS privacy_level TEXT DEFAULT 'public' CHECK (privacy_level IN ('public', 'private', 'anonymous')),
ADD COLUMN IF NOT EXISTS anonymous_handle TEXT,
ADD COLUMN IF NOT EXISTS anonymous_display_name TEXT,
ADD COLUMN IF NOT EXISTS real_name_visibility BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS location_sharing BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS precise_location BOOLEAN DEFAULT false;

-- ============================================================================
-- CREATE PRIVACY SETTINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'anonymous')),
  show_email BOOLEAN DEFAULT false,
  show_phone BOOLEAN DEFAULT false,
  show_location BOOLEAN DEFAULT false,
  anonymous_mode BOOLEAN DEFAULT false,
  anonymous_posts BOOLEAN DEFAULT false,
  anonymous_comments BOOLEAN DEFAULT false,
  anonymous_votes BOOLEAN DEFAULT false,
  location_sharing BOOLEAN DEFAULT false,
  precise_location BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Community Groups indexes
CREATE INDEX IF NOT EXISTS idx_community_groups_created_by ON public.community_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_community_groups_location ON public.community_groups(location_city);
CREATE INDEX IF NOT EXISTS idx_community_groups_created_at ON public.community_groups(created_at DESC);

-- Community Members indexes
CREATE INDEX IF NOT EXISTS idx_community_members_community_id ON public.community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user_id ON public.community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_joined_at ON public.community_members(joined_at DESC);

-- Privacy Settings indexes
CREATE INDEX IF NOT EXISTS idx_privacy_settings_user_id ON public.privacy_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_privacy_settings_anonymous_mode ON public.privacy_settings(anonymous_mode);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE RLS POLICIES
-- ============================================================================

-- Community Groups Policies
CREATE POLICY "Users can view public community groups" ON public.community_groups
  FOR SELECT USING (true);

CREATE POLICY "Users can create community groups" ON public.community_groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own community groups" ON public.community_groups
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own community groups" ON public.community_groups
  FOR DELETE USING (auth.uid() = created_by);

-- Community Members Policies
CREATE POLICY "Users can view community members" ON public.community_members
  FOR SELECT USING (true);

CREATE POLICY "Users can join communities" ON public.community_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities" ON public.community_members
  FOR DELETE USING (auth.uid() = user_id);

-- Privacy Settings Policies
CREATE POLICY "Users can view their own privacy settings" ON public.privacy_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own privacy settings" ON public.privacy_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own privacy settings" ON public.privacy_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- CREATE FUNCTIONS FOR COMMUNITY MANAGEMENT
-- ============================================================================

-- Function to update member count
CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_groups 
    SET member_count = member_count + 1 
    WHERE id = NEW.community_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_groups 
    SET member_count = GREATEST(0, member_count - 1) 
    WHERE id = OLD.community_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for member count
DROP TRIGGER IF EXISTS trigger_update_community_member_count_insert ON public.community_members;
CREATE TRIGGER trigger_update_community_member_count_insert
  AFTER INSERT ON public.community_members
  FOR EACH ROW EXECUTE FUNCTION update_community_member_count();

DROP TRIGGER IF EXISTS trigger_update_community_member_count_delete ON public.community_members;
CREATE TRIGGER trigger_update_community_member_count_delete
  AFTER DELETE ON public.community_members
  FOR EACH ROW EXECUTE FUNCTION update_community_member_count();

-- ============================================================================
-- CREATE VIEWS FOR EASIER QUERYING
-- ============================================================================

-- Community Groups with Member Count
CREATE OR REPLACE VIEW public.community_groups_with_stats AS
SELECT 
  cg.*,
  COALESCE(cg.member_count, 0) as actual_member_count,
  CASE 
    WHEN cm.user_id IS NOT NULL THEN true 
    ELSE false 
  END as user_is_member
FROM public.community_groups cg
LEFT JOIN public.community_members cm ON cg.id = cm.community_id AND cm.user_id = auth.uid();

-- ============================================================================
-- INSERT DEFAULT DATA
-- ============================================================================

-- Insert default interests if they don't exist
INSERT INTO public.interests (name, description, category) VALUES
  ('Music', 'Music and musical events', 'Entertainment'),
  ('Art', 'Art and cultural events', 'Culture'),
  ('Technology', 'Technology and innovation', 'Tech'),
  ('Sports', 'Sports and fitness', 'Fitness'),
  ('Food', 'Food and dining', 'Lifestyle'),
  ('Travel', 'Travel and exploration', 'Lifestyle'),
  ('Education', 'Learning and education', 'Education'),
  ('Business', 'Business and entrepreneurship', 'Business')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- UPDATE EXISTING PROFILES WITH DEFAULT PRIVACY SETTINGS
-- ============================================================================

-- Create privacy settings for existing users who don't have them
INSERT INTO public.privacy_settings (user_id, profile_visibility, show_email, show_phone, show_location)
SELECT 
  p.user_id,
  'public',
  false,
  false,
  false
FROM public.profiles p
LEFT JOIN public.privacy_settings ps ON p.user_id = ps.user_id
WHERE ps.user_id IS NULL;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
