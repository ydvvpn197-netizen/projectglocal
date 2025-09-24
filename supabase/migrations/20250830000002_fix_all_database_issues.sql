-- Comprehensive Database Fixes Migration
-- Date: 2025-08-30
-- Description: Fix all database issues and ensure all required tables and functions exist

-- 1. Fix referral_program table structure
DROP TABLE IF EXISTS referral_program CASCADE;
CREATE TABLE referral_program (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    referral_code VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'cancelled')),
    reward_type VARCHAR(50) CHECK (reward_type IN ('credits', 'discount', 'premium_access', 'cash')),
    reward_amount DECIMAL(10,2),
    reward_currency VARCHAR(3) DEFAULT 'USD',
    conversion_date TIMESTAMP WITH TIME ZONE,
    referral_source VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Fix profiles table to include referral fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code VARCHAR(50) UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_referral_rewards DECIMAL(10,2) DEFAULT 0;

-- 3. Create missing marketing tables
CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(50) NOT NULL CHECK (campaign_type IN ('promotional', 'referral', 'social', 'email', 'push', 'affiliate')),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    target_audience JSONB,
    campaign_config JSONB,
    budget DECIMAL(10,2),
    spent DECIMAL(10,2) DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,4) DEFAULT 0,
    roi DECIMAL(5,4) DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS social_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('post', 'event', 'profile', 'group', 'news')),
    content_id UUID NOT NULL,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('facebook', 'twitter', 'instagram', 'linkedin', 'whatsapp', 'telegram', 'email', 'sms')),
    share_url TEXT,
    share_text TEXT,
    share_metadata JSONB,
    clicks INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,4) DEFAULT 0,
    viral_coefficient DECIMAL(5,4) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create missing community tables
CREATE TABLE IF NOT EXISTS community_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT true,
  allow_anonymous_posts BOOLEAN DEFAULT false,
  require_approval BOOLEAN DEFAULT false,
  member_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  latitude NUMERIC,
  longitude NUMERIC,
  location_city TEXT,
  location_state TEXT,
  location_country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, location_city)
);

CREATE TABLE IF NOT EXISTS group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.community_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.community_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'discussion' CHECK (post_type IN ('discussion', 'question', 'announcement', 'event', 'poll')),
  is_anonymous BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
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

-- 5. Create missing functions
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS VARCHAR(50) AS $$
DECLARE
    code VARCHAR(50);
    counter INTEGER := 0;
BEGIN
    LOOP
        code := 'REF' || UPPER(substring(md5(random()::text) from 1 for 8));
        
        -- Check if code already exists
        IF NOT EXISTS (SELECT 1 FROM referral_program WHERE referral_code = code) THEN
            RETURN code;
        END IF;
        
        counter := counter + 1;
        IF counter > 100 THEN
            RAISE EXCEPTION 'Unable to generate unique referral code after 100 attempts';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_referral_program_referrer ON referral_program(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_program_referred ON referral_program(referred_id);
CREATE INDEX IF NOT EXISTS idx_referral_program_code ON referral_program(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_program_status ON referral_program(status);

CREATE INDEX IF NOT EXISTS idx_social_shares_user ON social_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_content ON social_shares(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_platform ON social_shares(platform);

CREATE INDEX IF NOT EXISTS idx_community_groups_category ON community_groups(category);
CREATE INDEX IF NOT EXISTS idx_community_groups_location ON community_groups(location_city, location_state);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_group_id ON community_posts(group_id);

-- 7. Enable RLS
ALTER TABLE referral_program ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies
DROP POLICY IF EXISTS "Users can view their own referrals" ON referral_program;
CREATE POLICY "Users can view their own referrals" ON referral_program
    FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

DROP POLICY IF EXISTS "Users can create referrals" ON referral_program;
CREATE POLICY "Users can create referrals" ON referral_program
    FOR INSERT WITH CHECK (auth.uid() = referrer_id);

DROP POLICY IF EXISTS "Users can view public shares" ON social_shares;
CREATE POLICY "Users can view public shares" ON social_shares
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own shares" ON social_shares;
CREATE POLICY "Users can create their own shares" ON social_shares
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view public groups" ON community_groups;
CREATE POLICY "Users can view public groups" ON community_groups
    FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Authenticated users can create groups" ON community_groups;
CREATE POLICY "Authenticated users can create groups" ON community_groups
    FOR INSERT WITH CHECK (created_by = auth.uid());

-- 9. Create triggers
DROP TRIGGER IF EXISTS update_referral_program_updated_at ON referral_program;
CREATE TRIGGER update_referral_program_updated_at
  BEFORE UPDATE ON referral_program
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_community_groups_updated_at ON community_groups;
CREATE TRIGGER update_community_groups_updated_at
  BEFORE UPDATE ON community_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_community_posts_updated_at ON community_posts;
CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 10. Insert sample data for testing
INSERT INTO community_groups (name, description, category, created_by, location_city, location_state, location_country)
VALUES 
  ('Local Artists Network', 'Connect with local artists and share your work', 'Arts & Culture', 
   (SELECT id FROM auth.users LIMIT 1), 'New York', 'NY', 'USA'),
  ('Tech Enthusiasts', 'Discuss the latest in technology and innovation', 'Technology', 
   (SELECT id FROM auth.users LIMIT 1), 'San Francisco', 'CA', 'USA'),
  ('Food Lovers', 'Share recipes and discover local restaurants', 'Food & Dining', 
   (SELECT id FROM auth.users LIMIT 1), 'Chicago', 'IL', 'USA')
ON CONFLICT (name, location_city) DO NOTHING;

-- 11. Create sample referral codes for existing users
UPDATE profiles 
SET referral_code = generate_referral_code()
WHERE referral_code IS NULL;

-- 12. Insert sample referral data
INSERT INTO referral_program (referrer_id, referral_code, status, reward_type, reward_amount, referral_source)
SELECT 
  id as referrer_id,
  referral_code,
  'pending' as status,
  'credits' as reward_type,
  100 as reward_amount,
  'web' as referral_source
FROM profiles 
WHERE referral_code IS NOT NULL
ON CONFLICT (referral_code) DO NOTHING;
