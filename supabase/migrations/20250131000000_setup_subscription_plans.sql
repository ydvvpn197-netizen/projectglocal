-- Migration: Setup Subscription Plans with Stripe Integration
-- Date: 2025-01-31
-- Description: Ensure subscription plans are properly configured with all necessary data

-- First, ensure the tables exist
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('user', 'artist')),
  plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  price_in_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'inr',
  stripe_price_id TEXT,
  features JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'past_due', 'canceled', 'unpaid', 'trialing')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clear existing plans to avoid duplicates
DELETE FROM public.subscription_plans;

-- Insert Normal User Plans (₹20/month, ₹200/year)
INSERT INTO public.subscription_plans (name, description, user_type, plan_type, price_in_cents, currency, features) VALUES
(
  'Pro Monthly - User',
  'Monthly Pro subscription for normal users',
  'user',
  'monthly',
  2000, -- ₹20 in paise
  'inr',
  '{
    "news_comments": true,
    "priority_support": true,
    "enhanced_profile": true,
    "advanced_search": true,
    "unlimited_posts": true,
    "event_creation": true,
    "poll_creation": true,
    "service_booking": true,
    "anonymous_posting": true,
    "government_tagging": true
  }'::jsonb
),
(
  'Pro Yearly - User',
  'Yearly Pro subscription for normal users',
  'user',
  'yearly',
  20000, -- ₹200 in paise (₹20 * 10 months = 2 months free)
  'inr',
  '{
    "news_comments": true,
    "priority_support": true,
    "enhanced_profile": true,
    "advanced_search": true,
    "unlimited_posts": true,
    "event_creation": true,
    "poll_creation": true,
    "service_booking": true,
    "anonymous_posting": true,
    "government_tagging": true,
    "yearly_discount": true
  }'::jsonb
);

-- Insert Artist Plans (₹100/month, ₹1000/year)
INSERT INTO public.subscription_plans (name, description, user_type, plan_type, price_in_cents, currency, features) VALUES
(
  'Pro Monthly - Artist',
  'Monthly Pro subscription for artists',
  'artist',
  'monthly',
  10000, -- ₹100 in paise
  'inr',
  '{
    "news_comments": true,
    "priority_support": true,
    "enhanced_profile": true,
    "advanced_search": true,
    "unlimited_posts": true,
    "event_creation": true,
    "poll_creation": true,
    "service_booking": true,
    "anonymous_posting": true,
    "government_tagging": true,
    "service_marketplace": true,
    "artist_showcase": true,
    "follower_analytics": true,
    "custom_branding": true,
    "booking_management": true,
    "revenue_tracking": true,
    "portfolio_showcase": true
  }'::jsonb
),
(
  'Pro Yearly - Artist',
  'Yearly Pro subscription for artists',
  'artist',
  'yearly',
  100000, -- ₹1000 in paise (₹100 * 10 months = 2 months free)
  'inr',
  '{
    "news_comments": true,
    "priority_support": true,
    "enhanced_profile": true,
    "advanced_search": true,
    "unlimited_posts": true,
    "event_creation": true,
    "poll_creation": true,
    "service_booking": true,
    "anonymous_posting": true,
    "government_tagging": true,
    "service_marketplace": true,
    "artist_showcase": true,
    "follower_analytics": true,
    "custom_branding": true,
    "booking_management": true,
    "revenue_tracking": true,
    "portfolio_showcase": true,
    "yearly_discount": true
  }'::jsonb
);

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

DROP POLICY IF EXISTS "Users can create their own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can create their own subscriptions" ON public.user_subscriptions
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
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id ON public.user_subscriptions(stripe_subscription_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON public.subscription_plans;
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to check if user is pro
CREATE OR REPLACE FUNCTION is_user_pro(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_subscriptions us
        JOIN public.subscription_plans sp ON us.plan_id = sp.id
        WHERE us.user_id = user_uuid 
        AND us.status = 'active'
        AND (us.current_period_end IS NULL OR us.current_period_end > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user subscription status
CREATE OR REPLACE FUNCTION get_user_subscription_status(user_uuid UUID)
RETURNS TABLE (
    is_pro BOOLEAN,
    plan_name TEXT,
    plan_type TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    can_comment_news BOOLEAN,
    can_feature_listing BOOLEAN,
    has_priority_support BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE WHEN us.id IS NOT NULL THEN true ELSE false END as is_pro,
        COALESCE(sp.name, 'Free') as plan_name,
        COALESCE(sp.plan_type, 'free') as plan_type,
        us.current_period_end as expires_at,
        CASE WHEN us.id IS NOT NULL AND (sp.features->>'news_comments')::boolean = true THEN true ELSE false END as can_comment_news,
        CASE WHEN us.id IS NOT NULL AND (sp.features->>'featured_listing')::boolean = true THEN true ELSE false END as can_feature_listing,
        CASE WHEN us.id IS NOT NULL AND (sp.features->>'priority_support')::boolean = true THEN true ELSE false END as has_priority_support
    FROM auth.users u
    LEFT JOIN public.user_subscriptions us ON u.id = us.user_id AND us.status = 'active' AND (us.current_period_end IS NULL OR us.current_period_end > NOW())
    LEFT JOIN public.subscription_plans sp ON us.plan_id = sp.id
    WHERE u.id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the setup
DO $$
DECLARE
    plan_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO plan_count FROM public.subscription_plans;
    
    IF plan_count = 4 THEN
        RAISE NOTICE 'Subscription plans setup completed successfully. % plans created.', plan_count;
    ELSE
        RAISE EXCEPTION 'Expected 4 subscription plans, but found %', plan_count;
    END IF;
END $$;
