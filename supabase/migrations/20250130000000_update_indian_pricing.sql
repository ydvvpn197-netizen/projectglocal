-- Migration: Update Subscription Plans for Indian Market
-- Date: 2025-01-30
-- Description: Update subscription plans with Indian Rupee pricing (₹20 for normal users, ₹100 for artists)

-- Create subscription_plans table if it doesn't exist
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

-- Create user_subscriptions table if it doesn't exist
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

-- Clear existing plans and insert new Indian pricing plans
DELETE FROM public.subscription_plans;

-- Insert Normal User Plans (₹20/month)
INSERT INTO public.subscription_plans (name, description, user_type, plan_type, price_in_cents, currency, features) VALUES
(
  'Normal User Pro - Monthly',
  'Pro features for normal users including news commenting, priority support, and enhanced community features',
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
  'Normal User Pro - Yearly',
  'Pro features for normal users with 2 months free (₹200/year)',
  'user',
  'yearly',
  20000, -- ₹200 in paise (₹20 * 10 months)
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

-- Insert Artist Plans (₹100/month)
INSERT INTO public.subscription_plans (name, description, user_type, plan_type, price_in_cents, currency, features) VALUES
(
  'Artist Pro - Monthly',
  'Pro features for artists including service marketplace, enhanced profile, and follower engagement tools',
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
  'Artist Pro - Yearly',
  'Pro features for artists with 2 months free (₹1000/year)',
  'artist',
  'yearly',
  100000, -- ₹1000 in paise (₹100 * 10 months)
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

-- Update currency in existing tables to INR
UPDATE public.services SET currency = 'inr' WHERE currency = 'usd';
UPDATE public.service_bookings SET currency = 'inr' WHERE currency = 'usd';
UPDATE public.payments SET currency = 'inr' WHERE currency = 'usd';

-- Enable RLS on subscription tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscription_plans
CREATE POLICY "Anyone can view active subscription plans" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

-- Create RLS policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" ON public.user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

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
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
