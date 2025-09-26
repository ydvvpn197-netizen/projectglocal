-- Migration: Consolidate Creator Models
-- Date: 2025-01-28
-- Description: Consolidates artists and service_providers into unified creators table

-- Create unified creators table
CREATE TABLE IF NOT EXISTS public.creators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    creator_type TEXT NOT NULL CHECK (creator_type IN ('artist', 'service_provider', 'business', 'influencer', 'content_creator')),
    display_name TEXT NOT NULL,
    bio TEXT,
    specialties TEXT[], -- Array of specialties/tags
    portfolio_url TEXT,
    website_url TEXT,
    social_links JSONB DEFAULT '{}', -- Store social media links
    location TEXT,
    availability TEXT, -- Available, busy, not_available
    hourly_rate DECIMAL(10,2),
    pricing_model TEXT CHECK (pricing_model IN ('hourly', 'project', 'package', 'subscription')),
    experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    profile_image_url TEXT,
    cover_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_creators_user_id ON public.creators(user_id);
CREATE INDEX IF NOT EXISTS idx_creators_creator_type ON public.creators(creator_type);
CREATE INDEX IF NOT EXISTS idx_creators_rating ON public.creators(rating DESC);
CREATE INDEX IF NOT EXISTS idx_creators_location ON public.creators(location);
CREATE INDEX IF NOT EXISTS idx_creators_specialties ON public.creators USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_creators_active ON public.creators(is_active);
CREATE INDEX IF NOT EXISTS idx_creators_verified ON public.creators(is_verified);

-- Enable RLS
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;

-- RLS Policies for creators table
CREATE POLICY "creators_select_public" ON public.creators
    FOR SELECT USING (
        is_active = true OR 
        auth.uid() = user_id OR 
        can_moderate_content()
    );

CREATE POLICY "creators_insert_authenticated" ON public.creators
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND 
        is_authenticated_user() AND
        NOT EXISTS (SELECT 1 FROM public.creators WHERE user_id = auth.uid())
    );

CREATE POLICY "creators_update_own" ON public.creators
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "creators_delete_own" ON public.creators
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "creators_moderate_admin" ON public.creators
    FOR ALL USING (can_moderate_content())
    WITH CHECK (can_moderate_content());

-- Create creator services table (for service providers)
CREATE TABLE IF NOT EXISTS public.creator_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    pricing_type TEXT CHECK (pricing_type IN ('fixed', 'hourly', 'per_project', 'subscription')),
    duration_hours INTEGER, -- For time-based services
    category TEXT,
    tags TEXT[],
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for creator_services
CREATE INDEX IF NOT EXISTS idx_creator_services_creator_id ON public.creator_services(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_services_category ON public.creator_services(category);
CREATE INDEX IF NOT EXISTS idx_creator_services_available ON public.creator_services(is_available);

-- Enable RLS on creator_services
ALTER TABLE public.creator_services ENABLE ROW LEVEL SECURITY;

-- RLS Policies for creator_services
CREATE POLICY "creator_services_select_public" ON public.creator_services
    FOR SELECT USING (
        is_available = true OR 
        EXISTS (
            SELECT 1 FROM public.creators 
            WHERE creators.id = creator_services.creator_id 
            AND creators.user_id = auth.uid()
        ) OR 
        can_moderate_content()
    );

CREATE POLICY "creator_services_insert_creator" ON public.creator_services
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.creators 
            WHERE creators.id = creator_id 
            AND creators.user_id = auth.uid()
        )
    );

CREATE POLICY "creator_services_update_creator" ON public.creator_services
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.creators 
            WHERE creators.id = creator_id 
            AND creators.user_id = auth.uid()
        )
    );

CREATE POLICY "creator_services_delete_creator" ON public.creator_services
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.creators 
            WHERE creators.id = creator_id 
            AND creators.user_id = auth.uid()
        )
    );

-- Create creator bookings table
CREATE TABLE IF NOT EXISTS public.creator_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.creator_services(id) ON DELETE SET NULL,
    booking_type TEXT NOT NULL CHECK (booking_type IN ('service', 'consultation', 'collaboration', 'custom')),
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_hours INTEGER,
    total_price DECIMAL(10,2),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
    special_requirements TEXT,
    location TEXT,
    meeting_link TEXT, -- For virtual meetings
    notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for creator_bookings
CREATE INDEX IF NOT EXISTS idx_creator_bookings_creator_id ON public.creator_bookings(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_bookings_client_id ON public.creator_bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_creator_bookings_status ON public.creator_bookings(status);
CREATE INDEX IF NOT EXISTS idx_creator_bookings_start_date ON public.creator_bookings(start_date);

-- Enable RLS on creator_bookings
ALTER TABLE public.creator_bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for creator_bookings
CREATE POLICY "creator_bookings_select_participants" ON public.creator_bookings
    FOR SELECT USING (
        auth.uid() = creator_id OR 
        auth.uid() = client_id OR 
        can_moderate_content()
    );

CREATE POLICY "creator_bookings_insert_client" ON public.creator_bookings
    FOR INSERT WITH CHECK (
        auth.uid() = client_id AND 
        is_authenticated_user()
    );

CREATE POLICY "creator_bookings_update_participants" ON public.creator_bookings
    FOR UPDATE USING (
        auth.uid() = creator_id OR 
        auth.uid() = client_id
    );

CREATE POLICY "creator_bookings_delete_participants" ON public.creator_bookings
    FOR DELETE USING (
        auth.uid() = creator_id OR 
        auth.uid() = client_id
    );

-- Create creator reviews table
CREATE TABLE IF NOT EXISTS public.creator_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.creator_bookings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    review_text TEXT,
    is_verified BOOLEAN DEFAULT FALSE, -- True if reviewer actually used the service
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(creator_id, reviewer_id, booking_id) -- Prevent duplicate reviews for same booking
);

-- Create indexes for creator_reviews
CREATE INDEX IF NOT EXISTS idx_creator_reviews_creator_id ON public.creator_reviews(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_reviews_reviewer_id ON public.creator_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_creator_reviews_rating ON public.creator_reviews(rating);

-- Enable RLS on creator_reviews
ALTER TABLE public.creator_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for creator_reviews
CREATE POLICY "creator_reviews_select_public" ON public.creator_reviews
    FOR SELECT USING (true); -- Allow public read access to reviews

CREATE POLICY "creator_reviews_insert_authenticated" ON public.creator_reviews
    FOR INSERT WITH CHECK (
        auth.uid() = reviewer_id AND 
        is_authenticated_user()
    );

CREATE POLICY "creator_reviews_update_own" ON public.creator_reviews
    FOR UPDATE USING (auth.uid() = reviewer_id)
    WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "creator_reviews_delete_own" ON public.creator_reviews
    FOR DELETE USING (auth.uid() = reviewer_id);

-- Create function to update creator rating
CREATE OR REPLACE FUNCTION update_creator_rating(creator_uuid UUID)
RETURNS VOID AS $$
DECLARE
    avg_rating DECIMAL(3,2);
    total_reviews INTEGER;
BEGIN
    SELECT 
        AVG(rating)::DECIMAL(3,2),
        COUNT(*)
    INTO avg_rating, total_reviews
    FROM public.creator_reviews 
    WHERE creator_id = creator_uuid;
    
    UPDATE public.creators 
    SET 
        rating = COALESCE(avg_rating, 0.0),
        review_count = total_reviews,
        updated_at = NOW()
    WHERE id = creator_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update creator rating when review is added/updated/deleted
CREATE OR REPLACE FUNCTION trigger_update_creator_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM update_creator_rating(NEW.creator_id);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM update_creator_rating(NEW.creator_id);
        IF OLD.creator_id != NEW.creator_id THEN
            PERFORM update_creator_rating(OLD.creator_id);
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM update_creator_rating(OLD.creator_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_creator_reviews_rating ON public.creator_reviews;
CREATE TRIGGER trigger_creator_reviews_rating
    AFTER INSERT OR UPDATE OR DELETE ON public.creator_reviews
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_creator_rating();

-- Create function to migrate existing artists and service_providers to creators
CREATE OR REPLACE FUNCTION migrate_existing_creators()
RETURNS INTEGER AS $$
DECLARE
    migrated_count INTEGER := 0;
    artist_record RECORD;
    service_record RECORD;
BEGIN
    -- Migrate artists (if table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'artists') THEN
        FOR artist_record IN 
            SELECT * FROM public.artists WHERE NOT EXISTS (
                SELECT 1 FROM public.creators WHERE user_id = artist_record.user_id
            )
        LOOP
            INSERT INTO public.creators (
                user_id,
                creator_type,
                display_name,
                bio,
                specialties,
                portfolio_url,
                website_url,
                social_links,
                location,
                hourly_rate,
                pricing_model,
                experience_level,
                profile_image_url,
                is_verified,
                is_active,
                created_at,
                updated_at
            ) VALUES (
                artist_record.user_id,
                'artist',
                artist_record.display_name,
                artist_record.bio,
                artist_record.specialties,
                artist_record.portfolio_url,
                artist_record.website_url,
                artist_record.social_links,
                artist_record.location,
                artist_record.hourly_rate,
                artist_record.pricing_model,
                artist_record.experience_level,
                artist_record.profile_image_url,
                artist_record.is_verified,
                artist_record.is_active,
                artist_record.created_at,
                artist_record.updated_at
            );
            
            migrated_count := migrated_count + 1;
        END LOOP;
    END IF;
    
    -- Migrate service_providers (if table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_providers') THEN
        FOR service_record IN 
            SELECT * FROM public.service_providers WHERE NOT EXISTS (
                SELECT 1 FROM public.creators WHERE user_id = service_record.user_id
            )
        LOOP
            INSERT INTO public.creators (
                user_id,
                creator_type,
                display_name,
                bio,
                specialties,
                portfolio_url,
                website_url,
                social_links,
                location,
                hourly_rate,
                pricing_model,
                experience_level,
                profile_image_url,
                is_verified,
                is_active,
                created_at,
                updated_at
            ) VALUES (
                service_record.user_id,
                'service_provider',
                service_record.display_name,
                service_record.bio,
                service_record.specialties,
                service_record.portfolio_url,
                service_record.website_url,
                service_record.social_links,
                service_record.location,
                service_record.hourly_rate,
                service_record.pricing_model,
                service_record.experience_level,
                service_record.profile_image_url,
                service_record.is_verified,
                service_record.is_active,
                service_record.created_at,
                service_record.updated_at
            );
            
            migrated_count := migrated_count + 1;
        END LOOP;
    END IF;
    
    RETURN migrated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the migration function
SELECT migrate_existing_creators();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.creators TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.creator_services TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.creator_bookings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.creator_reviews TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.creators IS 'Unified table for all types of creators (artists, service providers, businesses, etc.)';
COMMENT ON COLUMN public.creators.creator_type IS 'Type of creator: artist, service_provider, business, influencer, content_creator';
COMMENT ON COLUMN public.creators.specialties IS 'Array of specialties/tags for the creator';
COMMENT ON COLUMN public.creators.social_links IS 'JSON object containing social media links';
COMMENT ON COLUMN public.creators.pricing_model IS 'How the creator charges: hourly, project, package, subscription';
COMMENT ON TABLE public.creator_services IS 'Services offered by creators (primarily for service providers)';
COMMENT ON TABLE public.creator_bookings IS 'Bookings/appointments made with creators';
COMMENT ON TABLE public.creator_reviews IS 'Reviews and ratings for creators';
COMMENT ON FUNCTION update_creator_rating(UUID) IS 'Updates creator rating based on reviews';
COMMENT ON FUNCTION migrate_existing_creators() IS 'Migrates existing artists and service_providers to unified creators table';
