-- Create search_history table
CREATE TABLE IF NOT EXISTS search_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    filters JSONB,
    results_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_follows table
CREATE TABLE IF NOT EXISTS user_follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    weight DECIMAL(3,2) DEFAULT 0.5 CHECK (weight >= 0 AND weight <= 1),
    source TEXT DEFAULT 'behavioral' CHECK (source IN ('explicit', 'implicit', 'behavioral')),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category)
);

-- Create user_behavior table
CREATE TABLE IF NOT EXISTS user_behavior (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('view', 'like', 'comment', 'share', 'bookmark', 'follow', 'search')),
    content_type TEXT NOT NULL,
    content_id UUID NOT NULL,
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id TEXT
);

-- Create content_recommendations table
CREATE TABLE IF NOT EXISTS content_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('artist', 'event', 'post', 'group', 'business')),
    score DECIMAL(5,4) DEFAULT 0 CHECK (score >= 0 AND score <= 1),
    reason TEXT,
    algorithm TEXT DEFAULT 'hybrid' CHECK (algorithm IN ('collaborative', 'content-based', 'hybrid', 'location-based')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, content_id)
);

-- Create search_index table for full-text search
CREATE TABLE IF NOT EXISTS search_index (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID NOT NULL,
    content_type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    tags TEXT[],
    category TEXT,
    location JSONB,
    metadata JSONB DEFAULT '{}',
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(content, '')), 'B') ||
        setweight(to_tsvector('english', array_to_string(coalesce(tags, ARRAY[]::text[]), ' ')), 'C')
    ) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trending_content table
CREATE TABLE IF NOT EXISTS trending_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('artist', 'event', 'post', 'group', 'business')),
    trending_score DECIMAL(10,4) DEFAULT 0,
    engagement_metrics JSONB DEFAULT '{}',
    trending_period TEXT DEFAULT 'day' CHECK (trending_period IN ('hour', 'day', 'week', 'month')),
    category TEXT,
    location JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(content_id, content_type, trending_period)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at);
CREATE INDEX IF NOT EXISTS idx_search_history_query ON search_history USING gin(to_tsvector('english', query));

CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_status ON user_follows(status);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_category ON user_preferences(category);

CREATE INDEX IF NOT EXISTS idx_user_behavior_user_id ON user_behavior(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_action ON user_behavior(action);
CREATE INDEX IF NOT EXISTS idx_user_behavior_timestamp ON user_behavior(timestamp);

CREATE INDEX IF NOT EXISTS idx_content_recommendations_user_id ON content_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_content_recommendations_score ON content_recommendations(score DESC);
CREATE INDEX IF NOT EXISTS idx_content_recommendations_expires_at ON content_recommendations(expires_at);

CREATE INDEX IF NOT EXISTS idx_search_index_content_type ON search_index(content_type);
CREATE INDEX IF NOT EXISTS idx_search_index_category ON search_index(category);
CREATE INDEX IF NOT EXISTS idx_search_index_search_vector ON search_index USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_search_index_created_at ON search_index(created_at);

CREATE INDEX IF NOT EXISTS idx_trending_content_type ON trending_content(content_type);
CREATE INDEX IF NOT EXISTS idx_trending_content_score ON trending_content(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_trending_content_period ON trending_content(trending_period);
CREATE INDEX IF NOT EXISTS idx_trending_content_category ON trending_content(category);

-- Create RLS policies
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_behavior ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_content ENABLE ROW LEVEL SECURITY;

-- Search history policies
CREATE POLICY "Users can view their own search history" ON search_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own search history" ON search_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User follows policies
CREATE POLICY "Users can view follow relationships" ON user_follows
    FOR SELECT USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can create follow relationships" ON user_follows
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can update their own follow relationships" ON user_follows
    FOR UPDATE USING (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follow relationships" ON user_follows
    FOR DELETE USING (auth.uid() = follower_id);

-- User preferences policies
CREATE POLICY "Users can view their own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- User behavior policies
CREATE POLICY "Users can view their own behavior" ON user_behavior
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own behavior" ON user_behavior
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Content recommendations policies
CREATE POLICY "Users can view their own recommendations" ON content_recommendations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own recommendations" ON content_recommendations
    FOR ALL USING (auth.uid() = user_id);

-- Search index policies (public read, authenticated write)
CREATE POLICY "Anyone can view search index" ON search_index
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage search index" ON search_index
    FOR ALL USING (auth.role() = 'authenticated');

-- Trending content policies (public read, authenticated write)
CREATE POLICY "Anyone can view trending content" ON trending_content
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage trending content" ON trending_content
    FOR ALL USING (auth.role() = 'authenticated');

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_follows_updated_at BEFORE UPDATE ON user_follows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_search_index_updated_at BEFORE UPDATE ON search_index
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trending_content_updated_at BEFORE UPDATE ON trending_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate trending score
CREATE OR REPLACE FUNCTION calculate_trending_score(
    engagement_likes INTEGER,
    engagement_comments INTEGER,
    engagement_shares INTEGER,
    engagement_views INTEGER,
    hours_since_creation NUMERIC
) RETURNS DECIMAL AS $$
BEGIN
    -- Calculate engagement score
    DECLARE
        engagement_score DECIMAL;
        time_decay DECIMAL;
        velocity DECIMAL;
        final_score DECIMAL;
    BEGIN
        -- Engagement score (likes + comments*2 + shares*3 + views*0.1)
        engagement_score := engagement_likes + (engagement_comments * 2) + (engagement_shares * 3) + (engagement_views * 0.1);
        
        -- Time decay (newer content gets higher scores)
        time_decay := GREATEST(0.1, 1 - (hours_since_creation / 168)); -- 168 hours = 1 week
        
        -- Velocity (engagement per hour)
        velocity := CASE 
            WHEN hours_since_creation > 0 THEN engagement_score / hours_since_creation
            ELSE engagement_score
        END;
        
        -- Final score: 40% engagement + 40% velocity + 20% time decay
        final_score := (engagement_score * 0.4 + velocity * 0.4 + time_decay * 0.2) * 100;
        
        RETURN final_score;
    END;
END;
$$ LANGUAGE plpgsql;
