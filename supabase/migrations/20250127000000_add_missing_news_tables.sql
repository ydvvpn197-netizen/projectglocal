-- Migration: Add Missing News Tables for Complete Local News Hub
-- Date: 2025-01-27
-- Description: Add missing tables for news caching, interactions, and personalization

-- Create news_cache table for 15-minute caching with SHA-256 article_id
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

-- Create news_likes table (separate from interactions)
CREATE TABLE IF NOT EXISTS news_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    article_id TEXT REFERENCES news_cache(article_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, article_id)
);

-- Create news_shares table (dedicated shares table)
CREATE TABLE IF NOT EXISTS news_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    article_id TEXT REFERENCES news_cache(article_id) ON DELETE CASCADE,
    share_platform TEXT, -- 'web', 'twitter', 'facebook', 'linkedin', 'copy_link'
    share_data JSONB, -- Additional data like share text, platform-specific data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create news_events table (track user interactions for personalization)
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

-- Create news_poll_votes table (dedicated poll votes table)
CREATE TABLE IF NOT EXISTS news_poll_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    poll_id UUID REFERENCES public.community_polls(id) ON DELETE CASCADE,
    article_id TEXT REFERENCES news_cache(article_id) ON DELETE CASCADE,
    option_id TEXT NOT NULL, -- ID of the selected poll option
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, poll_id)
);

-- Create news_trending_scores table for caching trending calculations
CREATE TABLE IF NOT EXISTS news_trending_scores (
    article_id TEXT REFERENCES news_cache(article_id) ON DELETE CASCADE,
    base_score DECIMAL(10, 4) DEFAULT 0,
    time_decay_score DECIMAL(10, 4) DEFAULT 0,
    locality_boost DECIMAL(10, 4) DEFAULT 0,
    final_score DECIMAL(10, 4) DEFAULT 0,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (article_id)
);

-- Create user_news_preferences table for personalization
CREATE TABLE IF NOT EXISTS user_news_preferences (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    preferred_cities TEXT[] DEFAULT '{}',
    preferred_countries TEXT[] DEFAULT '{}',
    preferred_sources TEXT[] DEFAULT '{}',
    preferred_categories TEXT[] DEFAULT '{}',
    excluded_sources TEXT[] DEFAULT '{}',
    excluded_categories TEXT[] DEFAULT '{}',
    preferred_keywords TEXT[] DEFAULT '{}',
    interaction_weight DECIMAL(3, 2) DEFAULT 0.5, -- Weight for user interactions
    locality_weight DECIMAL(3, 2) DEFAULT 0.3, -- Weight for location relevance
    recency_weight DECIMAL(3, 2) DEFAULT 0.2, -- Weight for article recency
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_news_cache_expires_at ON news_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_news_cache_published_at ON news_cache(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_cache_location ON news_cache(location_lat, location_lng) WHERE location_lat IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_news_cache_source ON news_cache(source_name);
CREATE INDEX IF NOT EXISTS idx_news_cache_category ON news_cache(category);

CREATE INDEX IF NOT EXISTS idx_news_likes_user_id ON news_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_news_likes_article_id ON news_likes(article_id);
CREATE INDEX IF NOT EXISTS idx_news_likes_created_at ON news_likes(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_news_shares_user_id ON news_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_news_shares_article_id ON news_shares(article_id);
CREATE INDEX IF NOT EXISTS idx_news_shares_platform ON news_shares(share_platform);
CREATE INDEX IF NOT EXISTS idx_news_shares_created_at ON news_shares(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_news_events_user_id ON news_events(user_id);
CREATE INDEX IF NOT EXISTS idx_news_events_article_id ON news_events(article_id);
CREATE INDEX IF NOT EXISTS idx_news_events_type ON news_events(event_type);
CREATE INDEX IF NOT EXISTS idx_news_events_created_at ON news_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_events_keywords ON news_events USING GIN(keywords);

CREATE INDEX IF NOT EXISTS idx_news_poll_votes_user_id ON news_poll_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_news_poll_votes_poll_id ON news_poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_news_poll_votes_article_id ON news_poll_votes(article_id);

CREATE INDEX IF NOT EXISTS idx_news_trending_scores_final ON news_trending_scores(final_score DESC);
CREATE INDEX IF NOT EXISTS idx_news_trending_scores_calculated ON news_trending_scores(calculated_at DESC);

-- Enable RLS on all tables
ALTER TABLE news_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_trending_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_news_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for news_cache (readable by all, no direct writes from users)
CREATE POLICY "news_cache_readable_by_all" ON news_cache
    FOR SELECT USING (true);

-- RLS Policies for news_likes (users can manage their own likes)
CREATE POLICY "news_likes_select_own" ON news_likes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "news_likes_insert_own" ON news_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "news_likes_delete_own" ON news_likes
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for news_shares (users can manage their own shares)
CREATE POLICY "news_shares_select_own" ON news_shares
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "news_shares_insert_own" ON news_shares
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for news_events (users can manage their own events)
CREATE POLICY "news_events_select_own" ON news_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "news_events_insert_own" ON news_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for news_poll_votes (users can manage their own votes)
CREATE POLICY "news_poll_votes_select_own" ON news_poll_votes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "news_poll_votes_insert_own" ON news_poll_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "news_poll_votes_update_own" ON news_poll_votes
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for news_trending_scores (readable by all)
CREATE POLICY "news_trending_scores_readable_by_all" ON news_trending_scores
    FOR SELECT USING (true);

-- RLS Policies for user_news_preferences (users can manage their own preferences)
CREATE POLICY "user_news_preferences_select_own" ON user_news_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_news_preferences_insert_own" ON user_news_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_news_preferences_update_own" ON user_news_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- Create function to generate SHA-256 hash for article_id
CREATE OR REPLACE FUNCTION generate_article_id(url TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(digest(url, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_news_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM news_cache WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to update trending scores
CREATE OR REPLACE FUNCTION update_trending_scores()
RETURNS VOID AS $$
DECLARE
    lambda DECIMAL := 0.08; -- Time decay constant
    city_boost DECIMAL := 0.2; -- 20% boost for same city
    country_boost DECIMAL := 0.1; -- 10% boost for same country
BEGIN
    -- Update trending scores with time decay and locality boost
    INSERT INTO news_trending_scores (article_id, base_score, time_decay_score, locality_boost, final_score, calculated_at)
    SELECT 
        nc.article_id,
        COALESCE(
            (SELECT COUNT(*) FROM news_likes nl WHERE nl.article_id = nc.article_id) * 1.0 +
            (SELECT COUNT(*) FROM news_shares ns WHERE ns.article_id = nc.article_id) * 1.5 +
            (SELECT COUNT(*) FROM news_events ne WHERE ne.article_id = nc.article_id AND ne.event_type = 'comment') * 2.0 +
            (SELECT COUNT(*) FROM news_poll_votes npv WHERE npv.article_id = nc.article_id) * 1.0,
            0
        ) as base_score,
        COALESCE(
            (SELECT COUNT(*) FROM news_likes nl WHERE nl.article_id = nc.article_id) * 1.0 +
            (SELECT COUNT(*) FROM news_shares ns WHERE ns.article_id = nc.article_id) * 1.5 +
            (SELECT COUNT(*) FROM news_events ne WHERE ne.article_id = nc.article_id AND ne.event_type = 'comment') * 2.0 +
            (SELECT COUNT(*) FROM news_poll_votes npv WHERE npv.article_id = nc.article_id) * 1.0,
            0
        ) * EXP(-lambda * EXTRACT(EPOCH FROM (NOW() - nc.published_at)) / 3600) as time_decay_score,
        CASE 
            WHEN nc.location_name IS NOT NULL THEN city_boost
            WHEN nc.location_lat IS NOT NULL THEN country_boost
            ELSE 0
        END as locality_boost,
        COALESCE(
            (SELECT COUNT(*) FROM news_likes nl WHERE nl.article_id = nc.article_id) * 1.0 +
            (SELECT COUNT(*) FROM news_shares ns WHERE ns.article_id = nc.article_id) * 1.5 +
            (SELECT COUNT(*) FROM news_events ne WHERE ne.article_id = nc.article_id AND ne.event_type = 'comment') * 2.0 +
            (SELECT COUNT(*) FROM news_poll_votes npv WHERE npv.article_id = nc.article_id) * 1.0,
            0
        ) * EXP(-lambda * EXTRACT(EPOCH FROM (NOW() - nc.published_at)) / 3600) * 
        (1 + CASE 
            WHEN nc.location_name IS NOT NULL THEN city_boost
            WHEN nc.location_lat IS NOT NULL THEN country_boost
            ELSE 0
        END) as final_score,
        NOW()
    FROM news_cache nc
    WHERE nc.published_at > NOW() - INTERVAL '7 days' -- Only calculate for recent articles
    ON CONFLICT (article_id) DO UPDATE SET
        base_score = EXCLUDED.base_score,
        time_decay_score = EXCLUDED.time_decay_score,
        locality_boost = EXCLUDED.locality_boost,
        final_score = EXCLUDED.final_score,
        calculated_at = EXCLUDED.calculated_at;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update trending scores when interactions change
CREATE OR REPLACE FUNCTION trigger_update_trending_scores()
RETURNS TRIGGER AS $$
BEGIN
    -- Update trending scores for the affected article
    PERFORM update_trending_scores();
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic trending score updates
CREATE TRIGGER trigger_news_likes_trending_update
    AFTER INSERT OR DELETE ON news_likes
    FOR EACH ROW EXECUTE FUNCTION trigger_update_trending_scores();

CREATE TRIGGER trigger_news_shares_trending_update
    AFTER INSERT ON news_shares
    FOR EACH ROW EXECUTE FUNCTION trigger_update_trending_scores();

CREATE TRIGGER trigger_news_events_trending_update
    AFTER INSERT ON news_events
    FOR EACH ROW EXECUTE FUNCTION trigger_update_trending_scores();

CREATE TRIGGER trigger_news_poll_votes_trending_update
    AFTER INSERT OR DELETE ON news_poll_votes
    FOR EACH ROW EXECUTE FUNCTION trigger_update_trending_scores();
