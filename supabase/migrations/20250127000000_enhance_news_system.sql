-- Migration: Enhance News System with Real-time Features
-- Date: 2025-01-27
-- Description: Add comprehensive news system with real-time updates, AI summarization, and engagement tracking

-- Create news_article_summaries table
CREATE TABLE IF NOT EXISTS news_article_summaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID REFERENCES news_articles(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    key_points TEXT[] DEFAULT '{}',
    sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')) DEFAULT 'neutral',
    confidence DECIMAL(3,2) DEFAULT 0.0 CHECK (confidence >= 0.0 AND confidence <= 1.0),
    reading_time INTEGER DEFAULT 0, -- in minutes
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(article_id)
);

-- Create news_comment_votes table
CREATE TABLE IF NOT EXISTS news_comment_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID REFERENCES news_article_comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vote_type INTEGER NOT NULL CHECK (vote_type IN (-1, 0, 1)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- Create news_user_preferences table
CREATE TABLE IF NOT EXISTS news_user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    preferred_categories TEXT[] DEFAULT '{}',
    excluded_categories TEXT[] DEFAULT '{}',
    preferred_sources TEXT[] DEFAULT '{}',
    location_radius_km INTEGER DEFAULT 50 CHECK (location_radius_km >= 1 AND location_radius_km <= 500),
    home_location JSONB DEFAULT '{"city": "Delhi", "state": "Delhi", "country": "India"}',
    notification_settings JSONB DEFAULT '{
        "email_notifications": true,
        "push_notifications": true,
        "breaking_news": true,
        "daily_digest": false,
        "weekly_summary": true
    }',
    display_preferences JSONB DEFAULT '{
        "show_summaries": true,
        "show_sentiment": true,
        "show_reading_time": true,
        "articles_per_page": 20,
        "auto_refresh_interval": 5
    }',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_news_article_summaries_article_id ON news_article_summaries(article_id);
CREATE INDEX IF NOT EXISTS idx_news_article_summaries_sentiment ON news_article_summaries(sentiment);
CREATE INDEX IF NOT EXISTS idx_news_comment_votes_comment_id ON news_comment_votes(comment_id);
CREATE INDEX IF NOT EXISTS idx_news_comment_votes_user_id ON news_comment_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_news_user_preferences_user_id ON news_user_preferences(user_id);

-- Add columns to existing news_articles table if they don't exist
DO $$ 
BEGIN
    -- Add summary column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'news_articles' AND column_name = 'summary') THEN
        ALTER TABLE news_articles ADD COLUMN summary TEXT;
    END IF;
    
    -- Add key_points column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'news_articles' AND column_name = 'key_points') THEN
        ALTER TABLE news_articles ADD COLUMN key_points TEXT[] DEFAULT '{}';
    END IF;
    
    -- Add sentiment column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'news_articles' AND column_name = 'sentiment') THEN
        ALTER TABLE news_articles ADD COLUMN sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')) DEFAULT 'neutral';
    END IF;
    
    -- Add reading_time column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'news_articles' AND column_name = 'reading_time') THEN
        ALTER TABLE news_articles ADD COLUMN reading_time INTEGER DEFAULT 0;
    END IF;
    
    -- Add tags column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'news_articles' AND column_name = 'tags') THEN
        ALTER TABLE news_articles ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Create function to update article engagement score
CREATE OR REPLACE FUNCTION update_article_engagement_score(article_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE news_articles 
    SET engagement_score = (
        SELECT COALESCE(
            (COUNT(*) * 0.1 + 
             COUNT(CASE WHEN interaction_type = 'like' THEN 1 END) * 0.3 +
             COUNT(CASE WHEN interaction_type = 'share' THEN 1 END) * 0.5 +
             COUNT(CASE WHEN interaction_type = 'bookmark' THEN 1 END) * 0.2 +
             COUNT(CASE WHEN interaction_type = 'comment' THEN 1 END) * 0.4 +
             COUNT(CASE WHEN interaction_type = 'read_more' THEN 1 END) * 0.2) / 10.0, 
            0.0
        )
        FROM news_article_interactions 
        WHERE article_id = article_uuid
    )
    WHERE id = article_uuid;
END;
$$ LANGUAGE plpgsql;

-- Create function to get personalized news feed
CREATE OR REPLACE FUNCTION get_personalized_news_feed(
    user_uuid UUID,
    limit_count INTEGER DEFAULT 20
) RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    summary TEXT,
    url TEXT,
    image_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    author TEXT,
    category TEXT,
    location_name TEXT,
    distance_km DECIMAL,
    relevance_score DECIMAL,
    engagement_score DECIMAL,
    sentiment TEXT,
    reading_time INTEGER,
    tags TEXT[],
    is_bookmarked BOOLEAN
) AS $$
DECLARE
    user_prefs RECORD;
    user_location RECORD;
BEGIN
    -- Get user preferences
    SELECT * INTO user_prefs FROM news_user_preferences WHERE user_id = user_uuid;
    
    -- Get user location (simplified - would come from user profile)
    user_location := ROW(28.6139, 77.2090); -- Delhi coordinates as default
    
    RETURN QUERY
    SELECT 
        na.id,
        na.title,
        na.description,
        na.summary,
        na.url,
        na.image_url,
        na.published_at,
        na.author,
        na.category,
        na.location_name,
        CASE 
            WHEN na.location_lat IS NOT NULL AND na.location_lng IS NOT NULL
            THEN calculate_distance(user_location.location_lat, user_location.location_lng, na.location_lat, na.location_lng)
            ELSE NULL
        END as distance_km,
        na.relevance_score,
        na.engagement_score,
        na.sentiment,
        na.reading_time,
        na.tags,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM news_article_interactions 
                WHERE article_id = na.id AND user_id = user_uuid AND interaction_type = 'bookmark'
            ) THEN true
            ELSE false
        END as is_bookmarked
    FROM news_articles na
    WHERE na.published_at >= NOW() - INTERVAL '7 days'
        AND (user_prefs IS NULL OR 
             (na.category = ANY(user_prefs.preferred_categories) OR 
              array_length(user_prefs.preferred_categories, 1) IS NULL))
        AND (user_prefs IS NULL OR 
             (na.category != ALL(user_prefs.excluded_categories) OR 
              array_length(user_prefs.excluded_categories, 1) IS NULL))
        AND (user_prefs IS NULL OR 
             (na.source_id::text = ANY(user_prefs.preferred_sources) OR 
              array_length(user_prefs.preferred_sources, 1) IS NULL))
    ORDER BY 
        CASE WHEN user_location.location_lat IS NOT NULL AND user_location.location_lng IS NOT NULL 
             AND na.location_lat IS NOT NULL AND na.location_lng IS NOT NULL
             AND calculate_distance(user_location.location_lat, user_location.location_lng, na.location_lat, na.location_lng) <= COALESCE(user_prefs.location_radius_km, 50)
        THEN 1 ELSE 2 END,
        na.engagement_score DESC,
        na.published_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to get trending news
CREATE OR REPLACE FUNCTION get_trending_news(
    time_range_hours INTEGER DEFAULT 24,
    limit_count INTEGER DEFAULT 20
) RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    summary TEXT,
    url TEXT,
    image_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    author TEXT,
    category TEXT,
    location_name TEXT,
    engagement_score DECIMAL,
    sentiment TEXT,
    reading_time INTEGER,
    tags TEXT[],
    trend_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        na.id,
        na.title,
        na.description,
        na.summary,
        na.url,
        na.image_url,
        na.published_at,
        na.author,
        na.category,
        na.location_name,
        na.engagement_score,
        na.sentiment,
        na.reading_time,
        na.tags,
        -- Calculate trend score based on recent engagement
        COALESCE(
            (SELECT COUNT(*) * 0.1 + 
                    COUNT(CASE WHEN interaction_type = 'like' THEN 1 END) * 0.3 +
                    COUNT(CASE WHEN interaction_type = 'share' THEN 1 END) * 0.5 +
                    COUNT(CASE WHEN interaction_type = 'bookmark' THEN 1 END) * 0.2 +
                    COUNT(CASE WHEN interaction_type = 'comment' THEN 1 END) * 0.4 +
                    COUNT(CASE WHEN interaction_type = 'read_more' THEN 1 END) * 0.2
             FROM news_article_interactions 
             WHERE article_id = na.id 
             AND created_at >= NOW() - INTERVAL '1 hour' * time_range_hours
            ) / 10.0,
            na.engagement_score
        ) as trend_score
    FROM news_articles na
    WHERE na.published_at >= NOW() - INTERVAL '7 days'
    ORDER BY trend_score DESC, na.published_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to get news by sentiment
CREATE OR REPLACE FUNCTION get_news_by_sentiment(
    sentiment_filter TEXT,
    limit_count INTEGER DEFAULT 20
) RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    summary TEXT,
    url TEXT,
    image_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    author TEXT,
    category TEXT,
    location_name TEXT,
    engagement_score DECIMAL,
    sentiment TEXT,
    reading_time INTEGER,
    tags TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        na.id,
        na.title,
        na.description,
        na.summary,
        na.url,
        na.image_url,
        na.published_at,
        na.author,
        na.category,
        na.location_name,
        na.engagement_score,
        na.sentiment,
        na.reading_time,
        na.tags
    FROM news_articles na
    WHERE na.sentiment = sentiment_filter
        AND na.published_at >= NOW() - INTERVAL '7 days'
    ORDER BY na.engagement_score DESC, na.published_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_news_article_summaries_updated_at 
    BEFORE UPDATE ON news_article_summaries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_comment_votes_updated_at 
    BEFORE UPDATE ON news_comment_votes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_user_preferences_updated_at 
    BEFORE UPDATE ON news_user_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to update engagement score when interactions change
CREATE OR REPLACE FUNCTION trigger_update_engagement_score()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM update_article_engagement_score(NEW.article_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM update_article_engagement_score(OLD.article_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_news_interactions_engagement_score
    AFTER INSERT OR UPDATE OR DELETE ON news_article_interactions
    FOR EACH ROW EXECUTE FUNCTION trigger_update_engagement_score();

-- Enable Row Level Security (RLS)
ALTER TABLE news_article_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_comment_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all news summaries" ON news_article_summaries
    FOR SELECT USING (true);

CREATE POLICY "Users can view all comment votes" ON news_comment_votes
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own comment votes" ON news_comment_votes
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own preferences" ON news_user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own preferences" ON news_user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Insert sample news sources
INSERT INTO news_sources (name, api_endpoint, source_type, location_bias, categories, is_active, rate_limit_per_hour)
VALUES 
    ('Local Community News', 'https://example-local-news.com/rss', 'rss', 'Delhi', ARRAY['community', 'local', 'events'], true, 100),
    ('City Development News', 'https://api.example-city-news.com/news', 'api', 'Delhi', ARRAY['infrastructure', 'development', 'government'], true, 200),
    ('Business Weekly', 'https://example-business-news.com/rss', 'rss', 'Delhi', ARRAY['business', 'economy', 'startups'], true, 150),
    ('Tech Hub News', 'https://api.example-tech-news.com/news', 'api', 'Delhi', ARRAY['technology', 'innovation', 'startups'], true, 300),
    ('Arts & Culture', 'https://example-arts-news.com/rss', 'rss', 'Delhi', ARRAY['arts', 'culture', 'events'], true, 100)
ON CONFLICT (name) DO NOTHING;

-- Insert sample news categories
INSERT INTO news_categories (name, display_name, description, icon, color, relevance_score, is_active)
VALUES 
    ('community', 'Community', 'Local community events and news', 'users', '#3B82F6', 90, true),
    ('infrastructure', 'Infrastructure', 'Transportation, utilities, and development', 'building', '#10B981', 85, true),
    ('arts', 'Arts & Culture', 'Cultural events, exhibitions, and performances', 'palette', '#8B5CF6', 75, true),
    ('environment', 'Environment', 'Environmental issues and sustainability', 'leaf', '#059669', 80, true),
    ('technology', 'Technology', 'Tech news and digital developments', 'cpu', '#6366F1', 85, true),
    ('business', 'Business', 'Local business and economic news', 'briefcase', '#F59E0B', 80, true),
    ('health', 'Health', 'Healthcare and wellness news', 'heart', '#EF4444', 90, true),
    ('education', 'Education', 'Schools, universities, and educational news', 'book-open', '#06B6D4', 75, true)
ON CONFLICT (name) DO NOTHING;
