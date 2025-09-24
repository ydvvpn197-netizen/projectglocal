-- Marketing Features Database Migration
-- Phase 1: Data Layer & Marketing Infrastructure

-- Create marketing_campaigns table
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

-- Create referral_program table
CREATE TABLE IF NOT EXISTS referral_program (
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

-- Create social_shares table
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

-- Create promotional_codes table
CREATE TABLE IF NOT EXISTS promotional_codes (
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

-- Create growth_metrics table
CREATE TABLE IF NOT EXISTS growth_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_date DATE NOT NULL,
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('user_acquisition', 'user_retention', 'user_engagement', 'revenue', 'referral', 'viral_coefficient')),
    metric_value DECIMAL(15,4) NOT NULL,
    metric_unit VARCHAR(20),
    segment VARCHAR(100),
    source VARCHAR(100),
    campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE SET NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(metric_date, metric_type, segment, source)
);

-- Create viral_content table
CREATE TABLE IF NOT EXISTS viral_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('post', 'event', 'news', 'profile', 'group')),
    content_id UUID NOT NULL,
    viral_score DECIMAL(5,4) DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    engagement_count INTEGER DEFAULT 0,
    viral_coefficient DECIMAL(5,4) DEFAULT 0,
    reach_multiplier DECIMAL(5,4) DEFAULT 1,
    trending_rank INTEGER,
    trending_duration INTEGER DEFAULT 0,
    viral_velocity DECIMAL(5,4) DEFAULT 0,
    peak_time TIMESTAMP WITH TIME ZONE,
    decay_rate DECIMAL(5,4) DEFAULT 0,
    viral_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create promo_code_usage table
CREATE TABLE IF NOT EXISTS promo_code_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promo_code_id UUID NOT NULL REFERENCES promotional_codes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id UUID,
    discount_amount DECIMAL(10,2) NOT NULL,
    original_amount DECIMAL(10,2) NOT NULL,
    final_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(promo_code_id, user_id, order_id)
);

-- Create marketing_analytics table
CREATE TABLE IF NOT EXISTS marketing_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
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

-- Add marketing-related columns to existing tables

-- Add referral_code to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code VARCHAR(50) UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_referral_rewards DECIMAL(10,2) DEFAULT 0;

-- Add marketing columns to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS viral_score DECIMAL(5,4) DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_promoted BOOLEAN DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS promotion_campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE SET NULL;

-- Add marketing columns to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS promotional_code VARCHAR(50);
ALTER TABLE events ADD COLUMN IF NOT EXISTS discount_percentage INTEGER DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS feature_campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_type ON marketing_campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_dates ON marketing_campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_created_by ON marketing_campaigns(created_by);

CREATE INDEX IF NOT EXISTS idx_referral_program_referrer ON referral_program(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_program_referred ON referral_program(referred_id);
CREATE INDEX IF NOT EXISTS idx_referral_program_code ON referral_program(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_program_status ON referral_program(status);

CREATE INDEX IF NOT EXISTS idx_social_shares_user ON social_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_content ON social_shares(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_platform ON social_shares(platform);
CREATE INDEX IF NOT EXISTS idx_social_shares_created ON social_shares(created_at);

CREATE INDEX IF NOT EXISTS idx_promotional_codes_code ON promotional_codes(code);
CREATE INDEX IF NOT EXISTS idx_promotional_codes_active ON promotional_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_promotional_codes_validity ON promotional_codes(valid_from, valid_until);

CREATE INDEX IF NOT EXISTS idx_growth_metrics_date ON growth_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_growth_metrics_type ON growth_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_growth_metrics_campaign ON growth_metrics(campaign_id);

CREATE INDEX IF NOT EXISTS idx_viral_content_score ON viral_content(viral_score DESC);
CREATE INDEX IF NOT EXISTS idx_viral_content_type ON viral_content(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_viral_content_trending ON viral_content(trending_rank);

CREATE INDEX IF NOT EXISTS idx_promo_code_usage_user ON promo_code_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_promo_code_usage_code ON promo_code_usage(promo_code_id);

CREATE INDEX IF NOT EXISTS idx_marketing_analytics_user ON marketing_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_analytics_event ON marketing_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_marketing_analytics_campaign ON marketing_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_marketing_analytics_created ON marketing_analytics(created_at);

-- Create RLS policies
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_program ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotional_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE viral_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_analytics ENABLE ROW LEVEL SECURITY;

-- Marketing campaigns policies
CREATE POLICY "Users can view active campaigns" ON marketing_campaigns
    FOR SELECT USING (status = 'active');

CREATE POLICY "Campaign creators can manage their campaigns" ON marketing_campaigns
    FOR ALL USING (auth.uid() = created_by);

-- Referral program policies
CREATE POLICY "Users can view their own referrals" ON referral_program
    FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can create referrals" ON referral_program
    FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- Social shares policies
CREATE POLICY "Users can view public shares" ON social_shares
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own shares" ON social_shares
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Promotional codes policies
CREATE POLICY "Users can view active promo codes" ON promotional_codes
    FOR SELECT USING (is_active = true AND (valid_until IS NULL OR valid_until > NOW()));

CREATE POLICY "Code creators can manage their codes" ON promotional_codes
    FOR ALL USING (auth.uid() = created_by);

-- Growth metrics policies (admin only)
CREATE POLICY "Admins can view growth metrics" ON growth_metrics
    FOR SELECT USING (auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin'));

-- Viral content policies
CREATE POLICY "Users can view viral content" ON viral_content
    FOR SELECT USING (true);

-- Promo code usage policies
CREATE POLICY "Users can view their own usage" ON promo_code_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create usage records" ON promo_code_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Marketing analytics policies
CREATE POLICY "Users can view their own analytics" ON marketing_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create analytics" ON marketing_analytics
    FOR INSERT WITH CHECK (true);

-- Create functions for marketing features

-- Function to generate referral code
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

-- Function to calculate viral coefficient
CREATE OR REPLACE FUNCTION calculate_viral_coefficient(content_id UUID, content_type VARCHAR(50))
RETURNS DECIMAL(5,4) AS $$
DECLARE
    total_shares INTEGER;
    total_views INTEGER;
    viral_coeff DECIMAL(5,4);
BEGIN
    SELECT 
        COALESCE(SUM(share_count), 0),
        COALESCE(SUM(view_count), 0)
    INTO total_shares, total_views
    FROM social_shares 
    WHERE content_id = $1 AND content_type = $2;
    
    IF total_views = 0 THEN
        viral_coeff := 0;
    ELSE
        viral_coeff := (total_shares::DECIMAL / total_views::DECIMAL) * 100;
    END IF;
    
    RETURN LEAST(viral_coeff, 999.9999);
END;
$$ LANGUAGE plpgsql;

-- Function to update viral content scores
CREATE OR REPLACE FUNCTION update_viral_content_score()
RETURNS TRIGGER AS $$
BEGIN
    -- Update viral content table
    INSERT INTO viral_content (content_type, content_id, viral_score, share_count, view_count, viral_coefficient)
    VALUES (
        NEW.content_type,
        NEW.content_id,
        COALESCE(NEW.viral_score, 0),
        COALESCE(NEW.share_count, 0),
        COALESCE(NEW.view_count, 0),
        calculate_viral_coefficient(NEW.content_id, NEW.content_type)
    )
    ON CONFLICT (content_type, content_id) 
    DO UPDATE SET
        viral_score = EXCLUDED.viral_score,
        share_count = EXCLUDED.share_count,
        view_count = EXCLUDED.view_count,
        viral_coefficient = EXCLUDED.viral_coefficient,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for viral content updates
CREATE TRIGGER trigger_update_viral_content
    AFTER INSERT OR UPDATE ON social_shares
    FOR EACH ROW
    EXECUTE FUNCTION update_viral_content_score();

-- Function to validate promotional code
CREATE OR REPLACE FUNCTION validate_promo_code(code_input VARCHAR(50), user_id UUID, amount DECIMAL(10,2))
RETURNS JSONB AS $$
DECLARE
    promo_record promotional_codes%ROWTYPE;
    usage_count INTEGER;
    result JSONB;
BEGIN
    -- Get promo code details
    SELECT * INTO promo_record 
    FROM promotional_codes 
    WHERE code = code_input 
    AND is_active = true 
    AND (valid_until IS NULL OR valid_until > NOW());
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Invalid or expired promotional code');
    END IF;
    
    -- Check usage limit
    IF promo_record.usage_limit IS NOT NULL AND promo_record.used_count >= promo_record.usage_limit THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Promotional code usage limit reached');
    END IF;
    
    -- Check user limit
    SELECT COUNT(*) INTO usage_count
    FROM promo_code_usage
    WHERE promo_code_id = promo_record.id AND user_id = $2;
    
    IF usage_count >= promo_record.user_limit THEN
        RETURN jsonb_build_object('valid', false, 'error', 'You have already used this promotional code');
    END IF;
    
    -- Check minimum purchase
    IF amount < promo_record.minimum_purchase THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Minimum purchase amount not met');
    END IF;
    
    -- Calculate discount
    DECLARE
        discount_amount DECIMAL(10,2);
    BEGIN
        IF promo_record.discount_type = 'percentage' THEN
            discount_amount := amount * (promo_record.discount_value / 100);
            IF promo_record.maximum_discount IS NOT NULL THEN
                discount_amount := LEAST(discount_amount, promo_record.maximum_discount);
            END IF;
        ELSE
            discount_amount := promo_record.discount_value;
        END IF;
        
        result := jsonb_build_object(
            'valid', true,
            'discount_amount', discount_amount,
            'final_amount', amount - discount_amount,
            'promo_code', promo_record
        );
    END;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;
