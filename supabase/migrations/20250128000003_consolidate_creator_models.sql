-- ============================================================================
-- CONSOLIDATE CREATOR MODELS MIGRATION
-- ============================================================================
-- This migration consolidates artists and service_providers into a unified creators table
-- Date: 2025-01-28
-- Version: 1.0.0

-- ============================================================================
-- CREATE UNIFIED CREATORS TABLE
-- ============================================================================

-- Create the unified creators table
CREATE TABLE IF NOT EXISTS public.creators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_type TEXT NOT NULL CHECK (creator_type IN ('artist', 'service_provider', 'business', 'influencer', 'educator', 'consultant')),
  business_name TEXT,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  website_url TEXT,
  social_links JSONB DEFAULT '{}',
  location_city TEXT,
  location_state TEXT,
  location_country TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_verified BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  portfolio_items JSONB DEFAULT '[]',
  services_offered JSONB DEFAULT '[]',
  pricing_info JSONB DEFAULT '{}',
  availability_schedule JSONB DEFAULT '{}',
  contact_info JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  categories TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  experience_years INTEGER DEFAULT 0,
  education JSONB DEFAULT '[]',
  certifications JSONB DEFAULT '[]',
  awards JSONB DEFAULT '[]',
  testimonials JSONB DEFAULT '[]',
  portfolio_images TEXT[] DEFAULT '[]',
  portfolio_videos TEXT[] DEFAULT '[]',
  portfolio_audio TEXT[] DEFAULT '[]',
  portfolio_documents TEXT[] DEFAULT '[]',
  booking_enabled BOOLEAN DEFAULT FALSE,
  booking_requirements JSONB DEFAULT '{}',
  cancellation_policy TEXT,
  refund_policy TEXT,
  terms_of_service TEXT,
  privacy_policy TEXT,
  stripe_account_id TEXT,
  stripe_charges_enabled BOOLEAN DEFAULT FALSE,
  stripe_payouts_enabled BOOLEAN DEFAULT FALSE,
  commission_rate DECIMAL(5,2) DEFAULT 0.0 CHECK (commission_rate >= 0 AND commission_rate <= 100),
  total_earnings DECIMAL(10,2) DEFAULT 0.0,
  total_bookings INTEGER DEFAULT 0,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, creator_type)
);

-- ============================================================================
-- CREATE CREATOR SERVICES TABLE
-- ============================================================================

-- Create services table for creators
CREATE TABLE IF NOT EXISTS public.creator_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  duration_minutes INTEGER,
  service_type TEXT NOT NULL CHECK (service_type IN ('consultation', 'session', 'project', 'product', 'course', 'event', 'other')),
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  max_bookings_per_day INTEGER DEFAULT 10,
  requires_approval BOOLEAN DEFAULT FALSE,
  cancellation_policy TEXT,
  requirements JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- CREATE CREATOR BOOKINGS TABLE
-- ============================================================================

-- Create bookings table for creator services
CREATE TABLE IF NOT EXISTS public.creator_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.creator_services(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded')),
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  notes TEXT,
  customer_requirements TEXT,
  creator_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- CREATE CREATOR REVIEWS TABLE
-- ============================================================================

-- Create reviews table for creators
CREATE TABLE IF NOT EXISTS public.creator_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.creator_bookings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  review_text TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(creator_id, customer_id, booking_id)
);

-- ============================================================================
-- CREATE CREATOR FOLLOWS TABLE
-- ============================================================================

-- Create follows table for creators
CREATE TABLE IF NOT EXISTS public.creator_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(creator_id, follower_id),
  CHECK (creator_id != follower_id)
);

-- ============================================================================
-- CREATE CREATOR PORTFOLIO TABLE
-- ============================================================================

-- Create portfolio table for creators
CREATE TABLE IF NOT EXISTS public.creator_portfolio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'audio', 'document', 'link')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size INTEGER,
  duration_seconds INTEGER,
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- CREATE CREATOR ANALYTICS TABLE
-- ============================================================================

-- Create analytics table for creators
CREATE TABLE IF NOT EXISTS public.creator_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(15,2) NOT NULL,
  metric_date DATE NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(creator_id, metric_name, metric_date)
);

-- ============================================================================
-- CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to get creator display name
CREATE OR REPLACE FUNCTION public.get_creator_display_name(creator_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  creator_record RECORD;
BEGIN
  SELECT 
    display_name,
    business_name,
    creator_type
  INTO creator_record
  FROM public.creators 
  WHERE id = creator_uuid;
  
  IF NOT FOUND THEN
    RETURN 'Unknown Creator';
  END IF;
  
  -- Return business name if available, otherwise display name
  IF creator_record.business_name IS NOT NULL AND creator_record.business_name != '' THEN
    RETURN creator_record.business_name;
  END IF;
  
  RETURN COALESCE(creator_record.display_name, 'Creator');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update creator rating
CREATE OR REPLACE FUNCTION public.update_creator_rating(creator_uuid UUID)
RETURNS VOID AS $$
DECLARE
  avg_rating DECIMAL(3,2);
  review_count INTEGER;
BEGIN
  SELECT 
    AVG(rating)::DECIMAL(3,2),
    COUNT(*)
  INTO avg_rating, review_count
  FROM public.creator_reviews 
  WHERE creator_id = creator_uuid;
  
  UPDATE public.creators 
  SET 
    rating = COALESCE(avg_rating, 0.0),
    review_count = review_count
  WHERE id = creator_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update creator follower count
CREATE OR REPLACE FUNCTION public.update_creator_follower_count(creator_uuid UUID)
RETURNS VOID AS $$
DECLARE
  follower_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO follower_count
  FROM public.creator_follows 
  WHERE creator_id = creator_uuid;
  
  UPDATE public.creators 
  SET follower_count = follower_count
  WHERE id = creator_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CREATE TRIGGERS
-- ============================================================================

-- Trigger to update creator rating when review is added/updated/deleted
CREATE OR REPLACE FUNCTION public.trigger_update_creator_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM public.update_creator_rating(NEW.creator_id);
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    PERFORM public.update_creator_rating(OLD.creator_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_creator_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.creator_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_creator_rating();

-- Trigger to update creator follower count
CREATE OR REPLACE FUNCTION public.trigger_update_creator_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.update_creator_follower_count(NEW.creator_id);
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    PERFORM public.update_creator_follower_count(OLD.creator_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_creator_follower_count_trigger
  AFTER INSERT OR DELETE ON public.creator_follows
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_creator_follower_count();

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all creator tables
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_analytics ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE RLS POLICIES
-- ============================================================================

-- Creators table policies
CREATE POLICY "Anyone can view active creators" ON public.creators
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Users can view own creator profile" ON public.creators
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create creator profile" ON public.creators
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own creator profile" ON public.creators
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own creator profile" ON public.creators
  FOR DELETE USING (auth.uid() = user_id);

-- Creator services policies
CREATE POLICY "Anyone can view active creator services" ON public.creator_services
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Creators can manage own services" ON public.creator_services
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.creators WHERE id = creator_id AND user_id = auth.uid())
  );

-- Creator bookings policies
CREATE POLICY "Users can view own bookings" ON public.creator_bookings
  FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = creator_id);

CREATE POLICY "Users can create bookings" ON public.creator_bookings
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update own bookings" ON public.creator_bookings
  FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = creator_id);

-- Creator reviews policies
CREATE POLICY "Anyone can view creator reviews" ON public.creator_reviews
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can create reviews" ON public.creator_reviews
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update own reviews" ON public.creator_reviews
  FOR UPDATE USING (auth.uid() = customer_id);

CREATE POLICY "Users can delete own reviews" ON public.creator_reviews
  FOR DELETE USING (auth.uid() = customer_id);

-- Creator follows policies
CREATE POLICY "Anyone can view creator follows" ON public.creator_follows
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can create follows" ON public.creator_follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete own follows" ON public.creator_follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Creator portfolio policies
CREATE POLICY "Anyone can view public portfolio" ON public.creator_portfolio
  FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Creators can manage own portfolio" ON public.creator_portfolio
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.creators WHERE id = creator_id AND user_id = auth.uid())
  );

-- Creator analytics policies
CREATE POLICY "Creators can view own analytics" ON public.creator_analytics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.creators WHERE id = creator_id AND user_id = auth.uid())
  );

CREATE POLICY "System can manage analytics" ON public.creator_analytics
  FOR ALL USING (TRUE);

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Creators table indexes
CREATE INDEX IF NOT EXISTS idx_creators_user_id ON public.creators(user_id);
CREATE INDEX IF NOT EXISTS idx_creators_creator_type ON public.creators(creator_type);
CREATE INDEX IF NOT EXISTS idx_creators_is_active ON public.creators(is_active);
CREATE INDEX IF NOT EXISTS idx_creators_is_verified ON public.creators(is_verified);
CREATE INDEX IF NOT EXISTS idx_creators_is_featured ON public.creators(is_featured);
CREATE INDEX IF NOT EXISTS idx_creators_rating ON public.creators(rating DESC);
CREATE INDEX IF NOT EXISTS idx_creators_location ON public.creators(location_city, location_state, location_country);
CREATE INDEX IF NOT EXISTS idx_creators_tags ON public.creators USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_creators_categories ON public.creators USING GIN(categories);

-- Creator services indexes
CREATE INDEX IF NOT EXISTS idx_creator_services_creator_id ON public.creator_services(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_services_is_active ON public.creator_services(is_active);
CREATE INDEX IF NOT EXISTS idx_creator_services_service_type ON public.creator_services(service_type);

-- Creator bookings indexes
CREATE INDEX IF NOT EXISTS idx_creator_bookings_creator_id ON public.creator_bookings(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_bookings_customer_id ON public.creator_bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_creator_bookings_booking_date ON public.creator_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_creator_bookings_status ON public.creator_bookings(status);

-- Creator reviews indexes
CREATE INDEX IF NOT EXISTS idx_creator_reviews_creator_id ON public.creator_reviews(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_reviews_customer_id ON public.creator_reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_creator_reviews_rating ON public.creator_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_creator_reviews_created_at ON public.creator_reviews(created_at DESC);

-- Creator follows indexes
CREATE INDEX IF NOT EXISTS idx_creator_follows_creator_id ON public.creator_follows(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_follows_follower_id ON public.creator_follows(follower_id);

-- Creator portfolio indexes
CREATE INDEX IF NOT EXISTS idx_creator_portfolio_creator_id ON public.creator_portfolio(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_portfolio_media_type ON public.creator_portfolio(media_type);
CREATE INDEX IF NOT EXISTS idx_creator_portfolio_is_public ON public.creator_portfolio(is_public);
CREATE INDEX IF NOT EXISTS idx_creator_portfolio_is_featured ON public.creator_portfolio(is_featured);

-- Creator analytics indexes
CREATE INDEX IF NOT EXISTS idx_creator_analytics_creator_id ON public.creator_analytics(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_analytics_metric_name ON public.creator_analytics(metric_name);
CREATE INDEX IF NOT EXISTS idx_creator_analytics_metric_date ON public.creator_analytics(metric_date);

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant permissions for creator functions
GRANT EXECUTE ON FUNCTION public.get_creator_display_name(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_creator_rating(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_creator_follower_count(UUID) TO authenticated;

-- Grant permissions for triggers
GRANT EXECUTE ON FUNCTION public.trigger_update_creator_rating() TO authenticated;
GRANT EXECUTE ON FUNCTION public.trigger_update_creator_follower_count() TO authenticated;
