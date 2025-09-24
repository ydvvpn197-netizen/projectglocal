-- Comprehensive Database Fixes Migration
-- Date: 2025-01-30
-- Description: Fix all database issues, missing tables, and schema inconsistencies

-- 1. Create missing news system tables
CREATE TABLE IF NOT EXISTS news_cache (
    article_id TEXT PRIMARY KEY, -- SHA-256 hash of article URL
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    url TEXT NOT NULL,
    image_url TEXT,
    source_name TEXT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    category TEXT,
    location_name TEXT,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    ai_summary TEXT, -- 2-3 sentence AI-generated summary
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '15 minutes'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS news_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    article_id TEXT REFERENCES news_cache(article_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, article_id)
);

CREATE TABLE IF NOT EXISTS news_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    article_id TEXT REFERENCES news_cache(article_id) ON DELETE CASCADE,
    share_platform TEXT, -- 'web', 'twitter', 'facebook', 'linkedin', 'copy_link'
    share_data JSONB, -- Additional data like share text, platform-specific data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS news_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    article_id TEXT REFERENCES news_cache(article_id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'view', 'like', 'share', 'comment', 'poll_vote', 'bookmark'
    event_data JSONB, -- Additional event-specific data
    location_city TEXT,
    location_country TEXT,
    source_name TEXT,
    category TEXT,
    keywords TEXT[], -- Extracted keywords from article
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS news_poll_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    poll_id UUID REFERENCES public.community_polls(id) ON DELETE CASCADE,
    article_id TEXT REFERENCES news_cache(article_id) ON DELETE CASCADE,
    option_id TEXT NOT NULL, -- ID of the selected poll option
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, poll_id)
);

CREATE TABLE IF NOT EXISTS news_trending_scores (
    article_id TEXT REFERENCES news_cache(article_id) ON DELETE CASCADE,
    base_score DECIMAL(10, 4) DEFAULT 0,
    time_decay_score DECIMAL(10, 4) DEFAULT 0,
    locality_boost DECIMAL(10, 4) DEFAULT 0,
    final_score DECIMAL(10, 4) DEFAULT 0,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (article_id)
);

CREATE TABLE IF NOT EXISTS user_news_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    preferred_cities TEXT[],
    preferred_sources TEXT[],
    preferred_categories TEXT[],
    excluded_categories TEXT[],
    search_radius INTEGER DEFAULT 50, -- in kilometers
    home_location_lat DECIMAL(10, 8),
    home_location_lng DECIMAL(11, 8),
    home_location_name TEXT,
    notification_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 2. Create missing notification tables
CREATE TABLE IF NOT EXISTS general_notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('announcement', 'event', 'community', 'system')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    target_audience TEXT CHECK (target_audience IN ('all', 'new_users', 'existing_users')),
    action_url TEXT,
    action_text TEXT
);

CREATE TABLE IF NOT EXISTS personal_notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'booking_request', 'booking_accepted', 'booking_declined', 
        'message_request', 'new_follower', 'event_reminder', 
        'event_update', 'event_created', 'event_updated', 'event_cancelled',
        'poll_result', 'review_reply', 'group_invite', 'discussion_request',
        'discussion_approved', 'discussion_rejected', 'payment_received',
        'payment_failed', 'system_announcement'
    )),
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    data JSONB,
    action_url TEXT,
    action_text TEXT
);

-- 3. Create missing artist and booking tables
CREATE TABLE IF NOT EXISTS artists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stage_name TEXT NOT NULL,
    bio TEXT,
    genres TEXT[],
    skills TEXT[],
    hourly_rate DECIMAL(10,2),
    availability_schedule JSONB DEFAULT '{}',
    portfolio_images TEXT[],
    social_links JSONB DEFAULT '{}',
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS artist_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    event_location TEXT NOT NULL,
    event_description TEXT NOT NULL,
    budget_min DECIMAL(10,2) NOT NULL,
    budget_max DECIMAL(10,2),
    contact_info TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Create missing chat tables
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES public.artist_bookings(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    artist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Create missing monetization tables
CREATE TYPE public.plan_type AS ENUM ('free', 'verified', 'premium');

CREATE TABLE IF NOT EXISTS services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL, -- Price in cents
    currency TEXT DEFAULT 'usd',
    category TEXT,
    availability_schedule JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    max_bookings_per_day INTEGER DEFAULT 10,
    requires_approval BOOLEAN DEFAULT FALSE,
    cancellation_policy TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    booking_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_hours INTEGER DEFAULT 1,
    total_amount INTEGER NOT NULL, -- Amount in cents
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    payment_intent_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Add missing columns to existing tables
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS plan_type plan_type DEFAULT 'free',
ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verification_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS referral_code VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_referral_rewards DECIMAL(10,2) DEFAULT 0;

ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS featured_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS featured_price INTEGER, -- Price in cents for featuring
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- 7. Create missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_news_cache_expires_at ON news_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_news_cache_category ON news_cache(category);
CREATE INDEX IF NOT EXISTS idx_news_cache_location ON news_cache(location_lat, location_lng);
CREATE INDEX IF NOT EXISTS idx_news_likes_user_id ON news_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_news_likes_article_id ON news_likes(article_id);
CREATE INDEX IF NOT EXISTS idx_news_events_user_id ON news_events(user_id);
CREATE INDEX IF NOT EXISTS idx_news_events_article_id ON news_events(article_id);
CREATE INDEX IF NOT EXISTS idx_news_events_event_type ON news_events(event_type);
CREATE INDEX IF NOT EXISTS idx_news_events_created_at ON news_events(created_at);
CREATE INDEX IF NOT EXISTS idx_personal_notifications_user_id ON personal_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_notifications_read ON personal_notifications(read);
CREATE INDEX IF NOT EXISTS idx_artist_bookings_user_id ON artist_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_bookings_artist_id ON artist_bookings(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_bookings_status ON artist_bookings(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- 8. Enable RLS on all tables
ALTER TABLE news_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_trending_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_news_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE general_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies for news tables
CREATE POLICY "Users can read all news cache" ON news_cache FOR SELECT USING (true);
CREATE POLICY "Users can read their own news likes" ON news_likes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own news likes" ON news_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own news likes" ON news_likes FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can read their own news shares" ON news_shares FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own news shares" ON news_shares FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read their own news events" ON news_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own news events" ON news_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read their own news poll votes" ON news_poll_votes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own news poll votes" ON news_poll_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read their own news preferences" ON user_news_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own news preferences" ON user_news_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own news preferences" ON user_news_preferences FOR UPDATE USING (auth.uid() = user_id);

-- 10. Create RLS policies for notification tables
CREATE POLICY "Users can read all general notifications" ON general_notifications FOR SELECT USING (true);
CREATE POLICY "Users can read their own personal notifications" ON personal_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own personal notifications" ON personal_notifications FOR UPDATE USING (auth.uid() = user_id);

-- 11. Create RLS policies for artist and booking tables
CREATE POLICY "Users can read all artists" ON artists FOR SELECT USING (true);
CREATE POLICY "Users can insert their own artist profile" ON artists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own artist profile" ON artists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can read their own bookings" ON artist_bookings FOR SELECT USING (auth.uid() = user_id OR auth.uid() = (SELECT user_id FROM artists WHERE id = artist_id));
CREATE POLICY "Users can insert their own bookings" ON artist_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bookings" ON artist_bookings FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = (SELECT user_id FROM artists WHERE id = artist_id));

-- 12. Create RLS policies for chat tables
CREATE POLICY "Users can read their own conversations" ON chat_conversations FOR SELECT USING (auth.uid() = client_id OR auth.uid() = artist_id);
CREATE POLICY "Users can insert conversations" ON chat_conversations FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Users can read messages in their conversations" ON chat_messages FOR SELECT USING (
    auth.uid() IN (
        SELECT client_id FROM chat_conversations WHERE id = conversation_id
        UNION
        SELECT artist_id FROM chat_conversations WHERE id = conversation_id
    )
);
CREATE POLICY "Users can insert messages in their conversations" ON chat_messages FOR INSERT WITH CHECK (
    auth.uid() IN (
        SELECT client_id FROM chat_conversations WHERE id = conversation_id
        UNION
        SELECT artist_id FROM chat_conversations WHERE id = conversation_id
    )
);

-- 13. Create RLS policies for service tables
CREATE POLICY "Users can read all services" ON services FOR SELECT USING (true);
CREATE POLICY "Users can insert their own services" ON services FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own services" ON services FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can read their own service bookings" ON service_bookings FOR SELECT USING (auth.uid() = user_id OR auth.uid() = (SELECT user_id FROM services WHERE id = service_id));
CREATE POLICY "Users can insert their own service bookings" ON service_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own service bookings" ON service_bookings FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = (SELECT user_id FROM services WHERE id = service_id));

-- 14. Create functions for trending calculations
CREATE OR REPLACE FUNCTION calculate_trending_score(article_id_param TEXT)
RETURNS DECIMAL(10, 4) AS $$
DECLARE
    base_score DECIMAL(10, 4) := 0;
    time_decay_score DECIMAL(10, 4) := 0;
    locality_boost DECIMAL(10, 4) := 0;
    final_score DECIMAL(10, 4) := 0;
    hours_old DECIMAL := 0;
    lambda DECIMAL := 0.08;
BEGIN
    -- Calculate base score from engagement
    SELECT COALESCE(
        (SELECT COUNT(*) FROM news_likes WHERE article_id = article_id_param) +
        (SELECT COUNT(*) * 2 FROM news_events WHERE article_id = article_id_param AND event_type = 'comment') +
        (SELECT COUNT(*) * 1.5 FROM news_shares WHERE article_id = article_id_param) +
        (SELECT COUNT(*) FROM news_poll_votes WHERE article_id = article_id_param)
    , 0) INTO base_score;
    
    -- Calculate time decay
    SELECT EXTRACT(EPOCH FROM (NOW() - cached_at)) / 3600 INTO hours_old
    FROM news_cache WHERE article_id = article_id_param;
    
    time_decay_score := base_score * EXP(-lambda * hours_old);
    
    -- Calculate locality boost (simplified - would need user location)
    locality_boost := time_decay_score * 0.2; -- 20% boost for local content
    
    final_score := time_decay_score + locality_boost;
    
    -- Update or insert trending score
    INSERT INTO news_trending_scores (article_id, base_score, time_decay_score, locality_boost, final_score, calculated_at)
    VALUES (article_id_param, base_score, time_decay_score, locality_boost, final_score, NOW())
    ON CONFLICT (article_id) 
    DO UPDATE SET 
        base_score = EXCLUDED.base_score,
        time_decay_score = EXCLUDED.time_decay_score,
        locality_boost = EXCLUDED.locality_boost,
        final_score = EXCLUDED.final_score,
        calculated_at = NOW();
    
    RETURN final_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Create trigger for automatic trending score updates
CREATE OR REPLACE FUNCTION update_article_trending_score()
RETURNS TRIGGER AS $$
BEGIN
    -- Update trending score when engagement changes
    PERFORM calculate_trending_score(COALESCE(NEW.article_id, OLD.article_id));
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for trending score updates
DROP TRIGGER IF EXISTS trigger_update_trending_on_likes ON news_likes;
CREATE TRIGGER trigger_update_trending_on_likes
    AFTER INSERT OR UPDATE OR DELETE ON news_likes
    FOR EACH ROW EXECUTE FUNCTION update_article_trending_score();

DROP TRIGGER IF EXISTS trigger_update_trending_on_shares ON news_shares;
CREATE TRIGGER trigger_update_trending_on_shares
    AFTER INSERT OR UPDATE OR DELETE ON news_shares
    FOR EACH ROW EXECUTE FUNCTION update_article_trending_score();

DROP TRIGGER IF EXISTS trigger_update_trending_on_events ON news_events;
CREATE TRIGGER trigger_update_trending_on_events
    AFTER INSERT OR UPDATE OR DELETE ON news_events
    FOR EACH ROW EXECUTE FUNCTION update_article_trending_score();

-- 16. Create function for personalized news feed
CREATE OR REPLACE FUNCTION get_personalized_news_feed(user_id_param UUID, limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
    article_id TEXT,
    title TEXT,
    description TEXT,
    url TEXT,
    image_url TEXT,
    source_name TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    category TEXT,
    ai_summary TEXT,
    final_score DECIMAL(10, 4)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        nc.article_id,
        nc.title,
        nc.description,
        nc.url,
        nc.image_url,
        nc.source_name,
        nc.published_at,
        nc.category,
        nc.ai_summary,
        COALESCE(nts.final_score, 0) as final_score
    FROM news_cache nc
    LEFT JOIN news_trending_scores nts ON nc.article_id = nts.article_id
    LEFT JOIN user_news_preferences unp ON unp.user_id = user_id_param
    WHERE nc.expires_at > NOW()
    AND (
        unp.user_id IS NULL OR
        (unp.preferred_categories IS NULL OR nc.category = ANY(unp.preferred_categories)) OR
        (unp.excluded_categories IS NULL OR nc.category != ALL(unp.excluded_categories))
    )
    ORDER BY COALESCE(nts.final_score, 0) DESC, nc.published_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 17. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 18. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_cache_published_at ON news_cache(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_cache_source_name ON news_cache(source_name);
CREATE INDEX IF NOT EXISTS idx_news_trending_scores_final_score ON news_trending_scores(final_score DESC);
CREATE INDEX IF NOT EXISTS idx_news_trending_scores_calculated_at ON news_trending_scores(calculated_at DESC);

-- 19. Create cleanup function for expired cache
CREATE OR REPLACE FUNCTION cleanup_expired_news_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM news_cache WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 20. Create scheduled cleanup (if pg_cron is available)
-- SELECT cron.schedule('cleanup-news-cache', '0 */6 * * *', 'SELECT cleanup_expired_news_cache();');

COMMENT ON TABLE news_cache IS 'Cached news articles with 15-minute expiration';
COMMENT ON TABLE news_likes IS 'User likes on news articles';
COMMENT ON TABLE news_shares IS 'User shares of news articles';
COMMENT ON TABLE news_events IS 'User interaction events for personalization';
COMMENT ON TABLE news_poll_votes IS 'Votes on news-related polls';
COMMENT ON TABLE news_trending_scores IS 'Cached trending scores for articles';
COMMENT ON TABLE user_news_preferences IS 'User preferences for news personalization';
COMMENT ON FUNCTION calculate_trending_score(TEXT) IS 'Calculates trending score for an article';
COMMENT ON FUNCTION get_personalized_news_feed(UUID, INTEGER) IS 'Returns personalized news feed for a user';
COMMENT ON FUNCTION cleanup_expired_news_cache() IS 'Removes expired news cache entries';
