-- Migration: Add News Feed Tables and Functions
-- Date: 2025-08-24
-- Description: Implement local news feed infrastructure

-- Create news_sources table
CREATE TABLE IF NOT EXISTS news_sources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    api_endpoint TEXT NOT NULL,
    api_key TEXT,
    source_type TEXT NOT NULL DEFAULT 'external', -- 'external', 'local', 'rss'
    location_bias TEXT, -- City/region for location-based filtering
    categories TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    rate_limit_per_hour INTEGER DEFAULT 100,
    last_fetch_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create news_categories table
CREATE TABLE IF NOT EXISTS news_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    relevance_score INTEGER DEFAULT 50, -- 1-100, higher = more relevant
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create news_articles table
CREATE TABLE IF NOT EXISTS news_articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_id UUID REFERENCES news_sources(id) ON DELETE CASCADE,
    external_id TEXT, -- ID from external API
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    url TEXT,
    image_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    author TEXT,
    category TEXT,
    tags TEXT[] DEFAULT '{}',
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    location_name TEXT,
    relevance_score DECIMAL(3, 2) DEFAULT 0.5, -- 0.0-1.0
    engagement_score DECIMAL(3, 2) DEFAULT 0.0, -- Based on user interactions
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_news_preferences table
CREATE TABLE IF NOT EXISTS user_news_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    preferred_categories TEXT[] DEFAULT '{}',
    excluded_categories TEXT[] DEFAULT '{}',
    preferred_sources TEXT[] DEFAULT '{}',
    excluded_sources TEXT[] DEFAULT '{}',
    location_radius_km INTEGER DEFAULT 50,
    max_articles_per_day INTEGER DEFAULT 20,
    notification_enabled BOOLEAN DEFAULT true,
    digest_frequency TEXT DEFAULT 'daily', -- 'hourly', 'daily', 'weekly'
    last_digest_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create news_article_interactions table
CREATE TABLE IF NOT EXISTS news_article_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    article_id UUID REFERENCES news_articles(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL, -- 'view', 'like', 'share', 'bookmark', 'comment'
    interaction_data JSONB, -- Additional data like comment text, share platform, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, article_id, interaction_type)
);

-- Create news_article_bookmarks table
CREATE TABLE IF NOT EXISTS news_article_bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    article_id UUID REFERENCES news_articles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, article_id)
);

-- Create news_article_comments table
CREATE TABLE IF NOT EXISTS news_article_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    article_id UUID REFERENCES news_articles(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES news_article_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_articles_location ON news_articles(location_lat, location_lng) WHERE location_lat IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_news_articles_relevance ON news_articles(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_source_id ON news_articles(source_id);
CREATE INDEX IF NOT EXISTS idx_news_articles_external_id ON news_articles(external_id);
CREATE INDEX IF NOT EXISTS idx_news_articles_tags ON news_articles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_news_sources_active ON news_sources(is_active);
CREATE INDEX IF NOT EXISTS idx_news_categories_active ON news_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_news_article_interactions_user ON news_article_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_news_article_interactions_article ON news_article_interactions(article_id);
CREATE INDEX IF NOT EXISTS idx_news_article_bookmarks_user ON news_article_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_news_article_comments_article ON news_article_comments(article_id);
CREATE INDEX IF NOT EXISTS idx_news_article_comments_user ON news_article_comments(user_id);

-- Enable RLS on all tables
ALTER TABLE news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_news_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_article_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_article_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_article_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for news_sources
CREATE POLICY "Anyone can view active news sources" ON news_sources
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin users can manage news sources" ON news_sources
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for news_categories
CREATE POLICY "Anyone can view active news categories" ON news_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin users can manage news categories" ON news_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for news_articles
CREATE POLICY "Anyone can view news articles" ON news_articles
    FOR SELECT USING (true);

CREATE POLICY "Admin users can manage news articles" ON news_articles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for user_news_preferences
CREATE POLICY "Users can view their own news preferences" ON user_news_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own news preferences" ON user_news_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own news preferences" ON user_news_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own news preferences" ON user_news_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for news_article_interactions
CREATE POLICY "Users can view their own interactions" ON news_article_interactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interactions" ON news_article_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interactions" ON news_article_interactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interactions" ON news_article_interactions
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for news_article_bookmarks
CREATE POLICY "Users can view their own bookmarks" ON news_article_bookmarks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks" ON news_article_bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" ON news_article_bookmarks
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for news_article_comments
CREATE POLICY "Anyone can view comments" ON news_article_comments
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own comments" ON news_article_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON news_article_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON news_article_comments
    FOR DELETE USING (auth.uid() = user_id);

-- Create or replace the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_news_sources_updated_at
    BEFORE UPDATE ON news_sources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_categories_updated_at
    BEFORE UPDATE ON news_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_articles_updated_at
    BEFORE UPDATE ON news_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_news_preferences_updated_at
    BEFORE UPDATE ON user_news_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_article_comments_updated_at
    BEFORE UPDATE ON news_article_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to get nearby news articles
CREATE OR REPLACE FUNCTION get_nearby_news_articles(
    user_lat DECIMAL,
    user_lng DECIMAL,
    radius_km INTEGER DEFAULT 50,
    category_filter TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 20
) RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    url TEXT,
    image_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    author TEXT,
    category TEXT,
    location_name TEXT,
    distance_km DECIMAL,
    relevance_score DECIMAL,
    engagement_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        na.id,
        na.title,
        na.description,
        na.url,
        na.image_url,
        na.published_at,
        na.author,
        na.category,
        na.location_name,
        calculate_distance(user_lat, user_lng, na.location_lat, na.location_lng) as distance_km,
        na.relevance_score,
        na.engagement_score
    FROM news_articles na
    WHERE na.location_lat IS NOT NULL 
        AND na.location_lng IS NOT NULL
        AND calculate_distance(user_lat, user_lng, na.location_lat, na.location_lng) <= radius_km
        AND (category_filter IS NULL OR na.category = category_filter)
        AND na.published_at >= NOW() - INTERVAL '7 days'
    ORDER BY na.relevance_score DESC, na.published_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get personalized news feed
CREATE OR REPLACE FUNCTION get_personalized_news_feed(
    user_uuid UUID,
    limit_count INTEGER DEFAULT 20
) RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    url TEXT,
    image_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    author TEXT,
    category TEXT,
    location_name TEXT,
    distance_km DECIMAL,
    relevance_score DECIMAL,
    engagement_score DECIMAL,
    is_bookmarked BOOLEAN
) AS $$
DECLARE
    user_prefs RECORD;
    user_location RECORD;
BEGIN
    -- Get user preferences
    SELECT * INTO user_prefs FROM user_news_preferences WHERE user_id = user_uuid;
    
    -- Get user location
    SELECT location_lat, location_lng INTO user_location FROM profiles WHERE id = user_uuid;
    
    RETURN QUERY
    SELECT 
        na.id,
        na.title,
        na.description,
        na.url,
        na.image_url,
        na.published_at,
        na.author,
        na.category,
        na.location_name,
        CASE 
            WHEN user_location.location_lat IS NOT NULL AND user_location.location_lng IS NOT NULL 
            THEN calculate_distance(user_location.location_lat, user_location.location_lng, na.location_lat, na.location_lng)
            ELSE NULL
        END as distance_km,
        na.relevance_score,
        na.engagement_score,
        EXISTS(SELECT 1 FROM news_article_bookmarks WHERE user_id = user_uuid AND article_id = na.id) as is_bookmarked
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
        na.relevance_score DESC,
        na.published_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to update article engagement score
CREATE OR REPLACE FUNCTION update_article_engagement_score(article_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE news_articles 
    SET engagement_score = (
        SELECT COALESCE(
            (COUNT(*) * 0.1 + 
             COUNT(CASE WHEN interaction_type = 'like' THEN 1 END) * 0.3 +
             COUNT(CASE WHEN interaction_type = 'share' THEN 1 END) * 0.5 +
             COUNT(CASE WHEN interaction_type = 'bookmark' THEN 1 END) * 0.2) / 10.0, 
            0.0
        )
        FROM news_article_interactions 
        WHERE article_id = article_uuid
    )
    WHERE id = article_uuid;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update engagement score when interactions change
CREATE OR REPLACE FUNCTION trigger_update_engagement_score()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
        PERFORM update_article_engagement_score(COALESCE(NEW.article_id, OLD.article_id));
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_engagement_score_on_interaction
    AFTER INSERT OR UPDATE OR DELETE ON news_article_interactions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_engagement_score();

-- Insert default news categories
INSERT INTO news_categories (name, display_name, description, icon, color, relevance_score) VALUES
('general', 'General', 'General news and updates', 'newspaper', '#3B82F6', 50),
('local', 'Local News', 'Local community news and events', 'map-pin', '#10B981', 80),
('business', 'Business', 'Business and economic news', 'briefcase', '#F59E0B', 60),
('technology', 'Technology', 'Technology and innovation news', 'cpu', '#8B5CF6', 70),
('entertainment', 'Entertainment', 'Entertainment and culture news', 'music', '#EC4899', 40),
('sports', 'Sports', 'Sports news and updates', 'trophy', '#EF4444', 45),
('health', 'Health', 'Health and wellness news', 'heart', '#06B6D4', 75),
('education', 'Education', 'Education and learning news', 'graduation-cap', '#84CC16', 65),
('politics', 'Politics', 'Political news and updates', 'flag', '#F97316', 55),
('environment', 'Environment', 'Environmental news and updates', 'leaf', '#059669', 70)
ON CONFLICT (name) DO NOTHING;

-- Insert default news sources (these will need API keys to be configured)
INSERT INTO news_sources (name, api_endpoint, source_type, location_bias, categories, is_active) VALUES
('NewsAPI.org', 'https://newsapi.org/v2', 'external', NULL, ARRAY['general', 'business', 'technology', 'entertainment', 'sports', 'health', 'politics'], true),
('Google News', 'https://news.google.com', 'external', NULL, ARRAY['general', 'business', 'technology', 'entertainment', 'sports', 'health', 'politics'], true),
('Local Community', 'internal', 'local', NULL, ARRAY['local', 'general'], true)
ON CONFLICT DO NOTHING;

-- Update the delete_user_account function to include news tables
CREATE OR REPLACE FUNCTION delete_user_account(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    -- Delete from news-related tables
    DELETE FROM news_article_comments WHERE user_id = user_uuid;
    DELETE FROM news_article_bookmarks WHERE user_id = user_uuid;
    DELETE FROM news_article_interactions WHERE user_id = user_uuid;
    DELETE FROM user_news_preferences WHERE user_id = user_uuid;
    
    -- Continue with existing deletions...
    DELETE FROM user_preferences WHERE user_id = user_uuid;
    DELETE FROM content_location WHERE content_id IN (
        SELECT id FROM posts WHERE user_id = user_uuid
        UNION ALL
        SELECT id FROM events WHERE organizer_id = user_uuid
        UNION ALL
        SELECT id FROM reviews WHERE user_id = user_uuid
        UNION ALL
        SELECT id FROM polls WHERE user_id = user_uuid
        UNION ALL
        SELECT id FROM artists WHERE user_id = user_uuid
    );
    DELETE FROM message_requests WHERE sender_id = user_uuid OR receiver_id = user_uuid;
    DELETE FROM chat_messages WHERE sender_id = user_uuid;
    DELETE FROM chat_conversations WHERE initiator_id = user_uuid OR participant_id = user_uuid;
    DELETE FROM notifications WHERE user_id = user_uuid OR sender_id = user_uuid;
    DELETE FROM artist_bookings WHERE user_id = user_uuid OR artist_id = user_uuid;
    DELETE FROM artists WHERE user_id = user_uuid;
    DELETE FROM posts WHERE user_id = user_uuid;
    DELETE FROM events WHERE organizer_id = user_uuid;
    DELETE FROM reviews WHERE user_id = user_uuid;
    DELETE FROM polls WHERE user_id = user_uuid;
    DELETE FROM profiles WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
