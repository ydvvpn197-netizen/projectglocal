-- Update subscription plans for Indian pricing (₹20/month normal, ₹100/month artist)
-- This migration ensures the correct pricing is set up in the database

-- Insert or update subscription plans for normal users
INSERT INTO subscription_plans (
  id,
  name,
  description,
  user_type,
  plan_type,
  price_in_cents,
  currency,
  features,
  is_active,
  created_at,
  updated_at
) VALUES (
  'normal_user_monthly',
  'Normal User Pro',
  'Pro features for normal users - comment on news, priority support, enhanced visibility',
  'user',
  'monthly',
  2000, -- ₹20 in paise
  'inr',
  '{
    "news_comments": true,
    "featured_listing": false,
    "priority_support": true,
    "service_marketplace": false,
    "advanced_analytics": false,
    "custom_branding": false,
    "max_events_per_month": 10,
    "max_services": 0
  }'::jsonb,
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  price_in_cents = EXCLUDED.price_in_cents,
  features = EXCLUDED.features,
  updated_at = NOW();

-- Insert or update subscription plans for artists
INSERT INTO subscription_plans (
  id,
  name,
  description,
  user_type,
  plan_type,
  price_in_cents,
  currency,
  features,
  is_active,
  created_at,
  updated_at
) VALUES (
  'artist_monthly',
  'Artist Pro',
  'Pro features for artists - service marketplace, follower engagement, advanced analytics',
  'artist',
  'monthly',
  10000, -- ₹100 in paise
  'inr',
  '{
    "news_comments": true,
    "featured_listing": true,
    "priority_support": true,
    "service_marketplace": true,
    "advanced_analytics": true,
    "custom_branding": true,
    "max_events_per_month": 50,
    "max_services": 20,
    "follower_engagement": true,
    "artist_showcase": true
  }'::jsonb,
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  price_in_cents = EXCLUDED.price_in_cents,
  features = EXCLUDED.features,
  updated_at = NOW();

-- Add yearly plans with discount (2 months free)
INSERT INTO subscription_plans (
  id,
  name,
  description,
  user_type,
  plan_type,
  price_in_cents,
  currency,
  features,
  is_active,
  created_at,
  updated_at
) VALUES (
  'normal_user_yearly',
  'Normal User Pro (Yearly)',
  'Pro features for normal users - yearly subscription with 2 months free',
  'user',
  'yearly',
  20000, -- ₹200 in paise (₹20 × 10 months)
  'inr',
  '{
    "news_comments": true,
    "featured_listing": false,
    "priority_support": true,
    "service_marketplace": false,
    "advanced_analytics": false,
    "custom_branding": false,
    "max_events_per_month": 10,
    "max_services": 0
  }'::jsonb,
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  price_in_cents = EXCLUDED.price_in_cents,
  features = EXCLUDED.features,
  updated_at = NOW();

INSERT INTO subscription_plans (
  id,
  name,
  description,
  user_type,
  plan_type,
  price_in_cents,
  currency,
  features,
  is_active,
  created_at,
  updated_at
) VALUES (
  'artist_yearly',
  'Artist Pro (Yearly)',
  'Pro features for artists - yearly subscription with 2 months free',
  'artist',
  'yearly',
  100000, -- ₹1000 in paise (₹100 × 10 months)
  'inr',
  '{
    "news_comments": true,
    "featured_listing": true,
    "priority_support": true,
    "service_marketplace": true,
    "advanced_analytics": true,
    "custom_branding": true,
    "max_events_per_month": 50,
    "max_services": 20,
    "follower_engagement": true,
    "artist_showcase": true
  }'::jsonb,
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  price_in_cents = EXCLUDED.price_in_cents,
  features = EXCLUDED.features,
  updated_at = NOW();

-- Update existing profiles to ensure proper user_type handling
UPDATE profiles 
SET user_type = 'user' 
WHERE user_type IS NULL OR user_type = '';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscription_plans_user_type ON subscription_plans(user_type);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);

-- Add comments for documentation
COMMENT ON TABLE subscription_plans IS 'Subscription plans with Indian pricing: Normal users ₹20/month, Artists ₹100/month';
COMMENT ON COLUMN subscription_plans.price_in_cents IS 'Price in paise (Indian currency smallest unit)';
COMMENT ON COLUMN subscription_plans.features IS 'JSON object containing plan features and limits';
