-- Advanced Search and Real-time Features Migration
-- This migration adds support for advanced search, real-time collaboration, and analytics

-- Create search analytics table
CREATE TABLE IF NOT EXISTS search_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    search_query TEXT NOT NULL,
    search_filters JSONB,
    results_count INTEGER DEFAULT 0,
    search_time_ms INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create search suggestions table
CREATE TABLE IF NOT EXISTS search_suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    suggestion TEXT NOT NULL,
    popularity_score INTEGER DEFAULT 1,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collaboration sessions table
CREATE TABLE IF NOT EXISTS collaboration_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    document_id TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    participants JSONB DEFAULT '[]'::jsonb,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collaboration activities table
CREATE TABLE IF NOT EXISTS collaboration_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT REFERENCES collaboration_sessions(session_id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'cursor', 'typing', 'document_change', 'join', 'leave'
    activity_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create real-time presence table
CREATE TABLE IF NOT EXISTS realtime_presence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    channel TEXT NOT NULL,
    presence_data JSONB,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create search indexes for better performance
CREATE INDEX IF NOT EXISTS idx_search_analytics_user_id ON search_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_search_analytics_created_at ON search_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_search_analytics_query ON search_analytics USING gin(to_tsvector('english', search_query));

CREATE INDEX IF NOT EXISTS idx_search_suggestions_popularity ON search_suggestions(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_search_suggestions_category ON search_suggestions(category);

CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_active ON collaboration_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_created_by ON collaboration_sessions(created_by);

CREATE INDEX IF NOT EXISTS idx_collaboration_activities_session ON collaboration_activities(session_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_activities_user ON collaboration_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_activities_type ON collaboration_activities(activity_type);

CREATE INDEX IF NOT EXISTS idx_realtime_presence_user ON realtime_presence(user_id);
CREATE INDEX IF NOT EXISTS idx_realtime_presence_channel ON realtime_presence(channel);
CREATE INDEX IF NOT EXISTS idx_realtime_presence_last_seen ON realtime_presence(last_seen);

-- Create full-text search indexes on existing tables
CREATE INDEX IF NOT EXISTS idx_community_posts_search ON community_posts USING gin(to_tsvector('english', title || ' ' || content));
CREATE INDEX IF NOT EXISTS idx_local_businesses_search ON local_businesses USING gin(to_tsvector('english', name || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_community_events_search ON community_events USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_artist_services_search ON artist_services USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_news_articles_search ON news_articles USING gin(to_tsvector('english', title || ' ' || content));

-- Create functions for search analytics
CREATE OR REPLACE FUNCTION track_search_analytics(
    p_user_id UUID,
    p_search_query TEXT,
    p_search_filters JSONB DEFAULT NULL,
    p_results_count INTEGER DEFAULT 0,
    p_search_time_ms INTEGER DEFAULT 0
) RETURNS UUID AS $$
DECLARE
    analytics_id UUID;
BEGIN
    INSERT INTO search_analytics (
        user_id,
        search_query,
        search_filters,
        results_count,
        search_time_ms
    ) VALUES (
        p_user_id,
        p_search_query,
        p_search_filters,
        p_results_count,
        p_search_time_ms
    ) RETURNING id INTO analytics_id;
    
    -- Update search suggestions popularity
    INSERT INTO search_suggestions (suggestion, popularity_score)
    VALUES (p_search_query, 1)
    ON CONFLICT (suggestion) DO UPDATE SET
        popularity_score = search_suggestions.popularity_score + 1,
        updated_at = NOW();
    
    RETURN analytics_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get search suggestions
CREATE OR REPLACE FUNCTION get_search_suggestions(
    p_query TEXT,
    p_limit INTEGER DEFAULT 10
) RETURNS TABLE (
    suggestion TEXT,
    popularity_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.suggestion,
        s.popularity_score
    FROM search_suggestions s
    WHERE s.suggestion ILIKE '%' || p_query || '%'
    ORDER BY s.popularity_score DESC, s.suggestion
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Create function to track collaboration activity
CREATE OR REPLACE FUNCTION track_collaboration_activity(
    p_session_id TEXT,
    p_user_id UUID,
    p_activity_type TEXT,
    p_activity_data JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO collaboration_activities (
        session_id,
        user_id,
        activity_type,
        activity_data
    ) VALUES (
        p_session_id,
        p_user_id,
        p_activity_type,
        p_activity_data
    ) RETURNING id INTO activity_id;
    
    -- Update session last activity
    UPDATE collaboration_sessions 
    SET updated_at = NOW()
    WHERE session_id = p_session_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to update presence
CREATE OR REPLACE FUNCTION update_realtime_presence(
    p_user_id UUID,
    p_channel TEXT,
    p_presence_data JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    presence_id UUID;
BEGIN
    INSERT INTO realtime_presence (
        user_id,
        channel,
        presence_data
    ) VALUES (
        p_user_id,
        p_channel,
        p_presence_data
    )
    ON CONFLICT (user_id, channel) DO UPDATE SET
        presence_data = EXCLUDED.presence_data,
        last_seen = NOW();
    
    RETURN presence_id;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE realtime_presence ENABLE ROW LEVEL SECURITY;

-- Search analytics policies
CREATE POLICY "Users can view their own search analytics" ON search_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own search analytics" ON search_analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Search suggestions policies (public read, authenticated insert)
CREATE POLICY "Anyone can view search suggestions" ON search_suggestions
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert search suggestions" ON search_suggestions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Collaboration sessions policies
CREATE POLICY "Users can view sessions they created or participate in" ON collaboration_sessions
    FOR SELECT USING (
        auth.uid() = created_by OR 
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(participants))
    );

CREATE POLICY "Users can create collaboration sessions" ON collaboration_sessions
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update sessions they created" ON collaboration_sessions
    FOR UPDATE USING (auth.uid() = created_by);

-- Collaboration activities policies
CREATE POLICY "Users can view activities in sessions they participate in" ON collaboration_activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM collaboration_sessions cs
            WHERE cs.session_id = collaboration_activities.session_id
            AND (auth.uid() = cs.created_by OR 
                 auth.uid()::text = ANY(SELECT jsonb_array_elements_text(cs.participants)))
        )
    );

CREATE POLICY "Users can insert activities in sessions they participate in" ON collaboration_activities
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM collaboration_sessions cs
            WHERE cs.session_id = collaboration_activities.session_id
            AND (auth.uid() = cs.created_by OR 
                 auth.uid()::text = ANY(SELECT jsonb_array_elements_text(cs.participants)))
        )
    );

-- Real-time presence policies
CREATE POLICY "Users can view presence in channels they're in" ON realtime_presence
    FOR SELECT USING (true); -- Simplified for now

CREATE POLICY "Users can update their own presence" ON realtime_presence
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presence" ON realtime_presence
    FOR UPDATE USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_search_analytics_updated_at
    BEFORE UPDATE ON search_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_search_suggestions_updated_at
    BEFORE UPDATE ON search_suggestions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collaboration_sessions_updated_at
    BEFORE UPDATE ON collaboration_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some initial search suggestions
INSERT INTO search_suggestions (suggestion, category, popularity_score) VALUES
    ('community events', 'events', 10),
    ('local businesses', 'business', 8),
    ('art services', 'services', 6),
    ('news articles', 'news', 5),
    ('virtual protests', 'community', 4),
    ('life wishes', 'community', 3),
    ('government polls', 'politics', 2),
    ('artist bookings', 'services', 1)
ON CONFLICT (suggestion) DO NOTHING;

-- Create a view for search analytics summary
CREATE OR REPLACE VIEW search_analytics_summary AS
SELECT 
    DATE(created_at) as search_date,
    COUNT(*) as total_searches,
    AVG(search_time_ms) as avg_search_time,
    AVG(results_count) as avg_results,
    COUNT(DISTINCT user_id) as unique_users
FROM search_analytics
GROUP BY DATE(created_at)
ORDER BY search_date DESC;

-- Create a view for popular searches
CREATE OR REPLACE VIEW popular_searches AS
SELECT 
    search_query,
    COUNT(*) as search_count,
    AVG(results_count) as avg_results,
    AVG(search_time_ms) as avg_search_time
FROM search_analytics
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY search_query
ORDER BY search_count DESC
LIMIT 20;

-- Grant necessary permissions
GRANT SELECT ON search_analytics_summary TO authenticated;
GRANT SELECT ON popular_searches TO authenticated;
GRANT EXECUTE ON FUNCTION track_search_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION get_search_suggestions TO authenticated;
GRANT EXECUTE ON FUNCTION track_collaboration_activity TO authenticated;
GRANT EXECUTE ON FUNCTION update_realtime_presence TO authenticated;
