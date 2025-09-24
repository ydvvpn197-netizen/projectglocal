-- Ensure subscription plans are properly set up for the Public Square
-- This migration creates the subscription_plans table if it doesn't exist and populates it with the correct pricing

-- Create subscription_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('user', 'artist')),
  plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  price_in_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'inr',
  stripe_price_id TEXT,
  features JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'past_due', 'canceled', 'unpaid', 'trialing')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clear existing plans to ensure clean state
DELETE FROM public.subscription_plans;

-- Insert subscription plans for normal users
INSERT INTO public.subscription_plans (id, name, description, user_type, plan_type, price_in_cents, currency, features) VALUES
('normal_user_monthly', 'Community Pro', 'Pro features for community members - comment on news, priority support, enhanced visibility', 'user', 'monthly', 2000, 'inr', '{
  "news_comments": true,
  "featured_listing": false,
  "priority_support": true,
  "service_marketplace": false,
  "advanced_analytics": false,
  "custom_branding": false,
  "max_events_per_month": 10,
  "max_services": 0,
  "community_polls": true,
  "virtual_protests": true,
  "privacy_controls": true,
  "event_creation": true
}'::jsonb),

('normal_user_yearly', 'Community Pro (Yearly)', 'Pro features for community members - yearly subscription with 2 months free', 'user', 'yearly', 20000, 'inr', '{
  "news_comments": true,
  "featured_listing": false,
  "priority_support": true,
  "service_marketplace": false,
  "advanced_analytics": false,
  "custom_branding": false,
  "max_events_per_month": 10,
  "max_services": 0,
  "community_polls": true,
  "virtual_protests": true,
  "privacy_controls": true,
  "event_creation": true
}'::jsonb),

-- Insert subscription plans for artists
('artist_monthly', 'Artist Pro', 'Pro features for artists - service marketplace, follower engagement, advanced analytics', 'artist', 'monthly', 10000, 'inr', '{
  "news_comments": true,
  "featured_listing": true,
  "priority_support": true,
  "service_marketplace": true,
  "advanced_analytics": true,
  "custom_branding": true,
  "max_events_per_month": 50,
  "max_services": 20,
  "follower_engagement": true,
  "artist_showcase": true,
  "community_polls": true,
  "virtual_protests": true,
  "privacy_controls": true,
  "event_creation": true
}'::jsonb),

('artist_yearly', 'Artist Pro (Yearly)', 'Pro features for artists - yearly subscription with 2 months free', 'artist', 'yearly', 100000, 'inr', '{
  "news_comments": true,
  "featured_listing": true,
  "priority_support": true,
  "service_marketplace": true,
  "advanced_analytics": true,
  "custom_branding": true,
  "max_events_per_month": 50,
  "max_services": 20,
  "follower_engagement": true,
  "artist_showcase": true,
  "community_polls": true,
  "virtual_protests": true,
  "privacy_controls": true,
  "event_creation": true
}'::jsonb);

-- Enable RLS on tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscription_plans
DROP POLICY IF EXISTS "Anyone can view active subscription plans" ON public.subscription_plans;
CREATE POLICY "Anyone can view active subscription plans" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

-- Create RLS policies for user_subscriptions
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can insert their own subscriptions" ON public.user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can update their own subscriptions" ON public.user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscription_plans_user_type ON public.subscription_plans(user_type);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_plan_type ON public.subscription_plans(plan_type);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_is_active ON public.subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON public.user_subscriptions(plan_id);

-- Create updated_at trigger for subscription_plans
DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON public.subscription_plans;
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create updated_at trigger for user_subscriptions
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to get user subscription status
CREATE OR REPLACE FUNCTION public.get_user_subscription_status(user_uuid UUID)
RETURNS TABLE (
  is_pro BOOLEAN,
  plan_id TEXT,
  plan_name TEXT,
  plan_features JSONB,
  subscription_status TEXT,
  expires_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN us.status = 'active' AND (us.current_period_end IS NULL OR us.current_period_end > NOW()) 
      THEN true 
      ELSE false 
    END as is_pro,
    sp.id as plan_id,
    sp.name as plan_name,
    sp.features as plan_features,
    us.status as subscription_status,
    us.current_period_end as expires_at
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = user_uuid
  AND us.status = 'active'
  ORDER BY us.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user can comment on news
CREATE OR REPLACE FUNCTION public.can_user_comment_news(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  has_permission BOOLEAN := false;
BEGIN
  SELECT COALESCE(
    (SELECT (sp.features->>'news_comments')::boolean 
     FROM public.user_subscriptions us
     JOIN public.subscription_plans sp ON us.plan_id = sp.id
     WHERE us.user_id = user_uuid
     AND us.status = 'active'
     AND (us.current_period_end IS NULL OR us.current_period_end > NOW())
     LIMIT 1), 
    false
  ) INTO has_permission;
  
  RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON TABLE public.subscription_plans IS 'Subscription plans for the Public Square: Community members ₹20/month, Artists ₹100/month';
COMMENT ON TABLE public.user_subscriptions IS 'User subscription records linking users to their active plans';
COMMENT ON COLUMN public.subscription_plans.price_in_cents IS 'Price in paise (Indian currency smallest unit)';
COMMENT ON COLUMN public.subscription_plans.features IS 'JSON object containing plan features and limits';
