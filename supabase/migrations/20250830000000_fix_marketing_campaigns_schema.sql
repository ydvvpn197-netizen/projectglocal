-- Fix marketing_campaigns table schema to match code expectations
-- This migration updates the marketing_campaigns table to include all required fields

-- First, drop the existing table if it exists
DROP TABLE IF EXISTS public.marketing_campaigns CASCADE;

-- Recreate the marketing_campaigns table with the correct schema
CREATE TABLE public.marketing_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Create other required marketing tables if they don't exist
CREATE TABLE IF NOT EXISTS public.referral_program (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id)
);

CREATE TABLE IF NOT EXISTS public.social_shares (
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

CREATE TABLE IF NOT EXISTS public.promotional_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free_shipping')),
  discount_value DECIMAL(10,2) NOT NULL,
  minimum_purchase DECIMAL(10,2) DEFAULT 0,
  maximum_discount DECIMAL(10,2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  user_limit INTEGER DEFAULT 1,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  applicable_services JSONB,
  excluded_services JSONB,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.marketing_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE SET NULL,
  referral_code VARCHAR(50),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_term VARCHAR(100),
  utm_content VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  device_type VARCHAR(50),
  location_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all marketing tables
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_program ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotional_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for marketing_campaigns
DROP POLICY IF EXISTS "Anyone can view active marketing campaigns" ON public.marketing_campaigns;
DROP POLICY IF EXISTS "Campaign creators can manage their campaigns" ON public.marketing_campaigns;

CREATE POLICY "Anyone can view active marketing campaigns" ON public.marketing_campaigns
  FOR SELECT USING (status = 'active');

CREATE POLICY "Campaign creators can manage their campaigns" ON public.marketing_campaigns
  FOR ALL USING (created_by = auth.uid());

-- Create RLS policies for referral_program
DROP POLICY IF EXISTS "Users can view their own referrals" ON public.referral_program;
DROP POLICY IF EXISTS "Users can create referrals" ON public.referral_program;

CREATE POLICY "Users can view their own referrals" ON public.referral_program
  FOR SELECT USING (referrer_id = auth.uid() OR referred_id = auth.uid());

CREATE POLICY "Users can create referrals" ON public.referral_program
  FOR INSERT WITH CHECK (referrer_id = auth.uid());

-- Create RLS policies for social_shares
DROP POLICY IF EXISTS "Users can view social shares" ON public.social_shares;
DROP POLICY IF EXISTS "Users can create social shares" ON public.social_shares;

CREATE POLICY "Users can view social shares" ON public.social_shares
  FOR SELECT USING (true);

CREATE POLICY "Users can create social shares" ON public.social_shares
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create RLS policies for promotional_codes
DROP POLICY IF EXISTS "Anyone can view active promotional codes" ON public.promotional_codes;
DROP POLICY IF EXISTS "Code creators can manage their codes" ON public.promotional_codes;

CREATE POLICY "Anyone can view active promotional codes" ON public.promotional_codes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Code creators can manage their codes" ON public.promotional_codes
  FOR ALL USING (created_by = auth.uid());

-- Create RLS policies for marketing_analytics
DROP POLICY IF EXISTS "Users can view their own analytics" ON public.marketing_analytics;
DROP POLICY IF EXISTS "Users can create analytics events" ON public.marketing_analytics;

CREATE POLICY "Users can view their own analytics" ON public.marketing_analytics
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create analytics events" ON public.marketing_analytics
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON public.marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_type ON public.marketing_campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_dates ON public.marketing_campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_created_by ON public.marketing_campaigns(created_by);

CREATE INDEX IF NOT EXISTS idx_referral_program_referrer_id ON public.referral_program(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_program_referred_id ON public.referral_program(referred_id);
CREATE INDEX IF NOT EXISTS idx_referral_program_status ON public.referral_program(status);

CREATE INDEX IF NOT EXISTS idx_social_shares_user_id ON public.social_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_content_type ON public.social_shares(content_type);
CREATE INDEX IF NOT EXISTS idx_social_shares_platform ON public.social_shares(platform);

CREATE INDEX IF NOT EXISTS idx_promotional_codes_code ON public.promotional_codes(code);
CREATE INDEX IF NOT EXISTS idx_promotional_codes_is_active ON public.promotional_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_promotional_codes_valid_until ON public.promotional_codes(valid_until);

CREATE INDEX IF NOT EXISTS idx_marketing_analytics_user_id ON public.marketing_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_analytics_event_type ON public.marketing_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_marketing_analytics_campaign_id ON public.marketing_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_marketing_analytics_created_at ON public.marketing_analytics(created_at);

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_marketing_campaigns_updated_at ON public.marketing_campaigns;
CREATE TRIGGER update_marketing_campaigns_updated_at
  BEFORE UPDATE ON public.marketing_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_referral_program_updated_at ON public.referral_program;
CREATE TRIGGER update_referral_program_updated_at
  BEFORE UPDATE ON public.referral_program
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_promotional_codes_updated_at ON public.promotional_codes;
CREATE TRIGGER update_promotional_codes_updated_at
  BEFORE UPDATE ON public.promotional_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.marketing_campaigns TO authenticated;
GRANT ALL ON public.referral_program TO authenticated;
GRANT ALL ON public.social_shares TO authenticated;
GRANT ALL ON public.promotional_codes TO authenticated;
GRANT ALL ON public.marketing_analytics TO authenticated;

-- Insert some sample marketing campaigns for testing
INSERT INTO public.marketing_campaigns (
  name, 
  description, 
  campaign_type, 
  status, 
  start_date, 
  end_date, 
  campaign_config,
  created_by
) VALUES 
(
  'Welcome Campaign',
  'Welcome new users to our platform with special offers',
  'promotional',
  'active',
  NOW() - INTERVAL '30 days',
  NOW() + INTERVAL '30 days',
  '{"positions": ["top", "sidebar"], "cta_text": "Get Started", "urgent": false}',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Artist Promotion',
  'Promote local artists and their services',
  'promotional',
  'active',
  NOW() - INTERVAL '7 days',
  NOW() + INTERVAL '60 days',
  '{"positions": ["top"], "cta_text": "Find Artists", "urgent": true}',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Event Special',
  'Special discounts for event bookings',
  'promotional',
  'active',
  NOW(),
  NOW() + INTERVAL '14 days',
  '{"positions": ["sidebar"], "cta_text": "Book Now", "urgent": true}',
  (SELECT id FROM auth.users LIMIT 1)
)
ON CONFLICT DO NOTHING;
