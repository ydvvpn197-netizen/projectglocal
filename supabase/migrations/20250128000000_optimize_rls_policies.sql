-- Optimize RLS Policies for Better Performance
-- This migration optimizes existing RLS policies and adds performance improvements

-- 1. Create optimized indexes for common RLS queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_user_id_optimized ON profiles(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_community_id_created_at ON posts(community_id, created_at DESC) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_author_id_created_at ON posts(author_id, created_at DESC) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_communities_is_active ON communities(id) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_start_date ON events(start_date) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_news_cache_published_at ON news_cache(published_at DESC) WHERE is_active = true;

-- 2. Create composite indexes for complex queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_community_featured ON posts(community_id, is_featured, created_at DESC) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_location_date ON events(location, start_date) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_news_likes_user_article ON news_likes(user_id, article_id) WHERE created_at > NOW() - INTERVAL '30 days';

-- 3. Create partial indexes for frequently filtered data
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_featured ON posts(id, created_at DESC) WHERE is_featured = true AND is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_upcoming ON events(id, start_date) WHERE start_date > NOW() AND is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_news_trending ON news_cache(id, trending_score DESC) WHERE trending_score > 0 AND is_active = true;

-- 4. Optimize existing RLS policies with better performance
-- Drop and recreate policies with optimized conditions

-- Optimize profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "profiles_select_public" ON profiles
  FOR SELECT USING (privacy_level = 'public' OR privacy_level = 'community');

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Optimize posts policies
DROP POLICY IF EXISTS "Anyone can view active posts" ON posts;
DROP POLICY IF EXISTS "Users can view their own posts" ON posts;
DROP POLICY IF EXISTS "Users can create posts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;

CREATE POLICY "posts_select_active" ON posts
  FOR SELECT USING (is_active = true);

CREATE POLICY "posts_select_own" ON posts
  FOR SELECT USING (author_id = auth.uid());

CREATE POLICY "posts_insert_own" ON posts
  FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY "posts_update_own" ON posts
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "posts_delete_own" ON posts
  FOR DELETE USING (author_id = auth.uid());

-- Optimize communities policies
DROP POLICY IF EXISTS "Anyone can view active communities" ON communities;
DROP POLICY IF EXISTS "Users can view communities they belong to" ON communities;
DROP POLICY IF EXISTS "Users can create communities" ON communities;
DROP POLICY IF EXISTS "Community creators can update their communities" ON communities;

CREATE POLICY "communities_select_active" ON communities
  FOR SELECT USING (is_active = true);

CREATE POLICY "communities_select_member" ON communities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM community_members 
      WHERE community_members.community_id = communities.id 
      AND community_members.user_id = auth.uid()
      AND community_members.status = 'active'
    )
  );

CREATE POLICY "communities_insert_own" ON communities
  FOR INSERT WITH CHECK (creator_id = auth.uid());

CREATE POLICY "communities_update_creator" ON communities
  FOR UPDATE USING (creator_id = auth.uid());

-- Optimize events policies
DROP POLICY IF EXISTS "Anyone can view active events" ON events;
DROP POLICY IF EXISTS "Users can view events they're attending" ON events;
DROP POLICY IF EXISTS "Users can create events" ON events;
DROP POLICY IF EXISTS "Event creators can update their events" ON events;

CREATE POLICY "events_select_active" ON events
  FOR SELECT USING (is_active = true);

CREATE POLICY "events_select_attending" ON events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM event_attendees 
      WHERE event_attendees.event_id = events.id 
      AND event_attendees.user_id = auth.uid()
      AND event_attendees.status = 'confirmed'
    )
  );

CREATE POLICY "events_insert_own" ON events
  FOR INSERT WITH CHECK (organizer_id = auth.uid());

CREATE POLICY "events_update_organizer" ON events
  FOR UPDATE USING (organizer_id = auth.uid());

-- Optimize news policies with better performance
DROP POLICY IF EXISTS "news_cache_readable_by_all" ON news_cache;
DROP POLICY IF EXISTS "news_likes_select_own" ON news_likes;
DROP POLICY IF EXISTS "news_likes_insert_own" ON news_likes;
DROP POLICY IF EXISTS "news_likes_delete_own" ON news_likes;

CREATE POLICY "news_cache_select_active" ON news_cache
  FOR SELECT USING (is_active = true);

CREATE POLICY "news_likes_select_own" ON news_likes
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "news_likes_insert_own" ON news_likes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "news_likes_delete_own" ON news_likes
  FOR DELETE USING (user_id = auth.uid());

-- 5. Create optimized functions for common operations
CREATE OR REPLACE FUNCTION get_user_communities(user_uuid UUID)
RETURNS TABLE(community_id UUID, role TEXT, joined_at TIMESTAMP WITH TIME ZONE)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT cm.community_id, cm.role, cm.created_at as joined_at
  FROM community_members cm
  WHERE cm.user_id = user_uuid
  AND cm.status = 'active'
  ORDER BY cm.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION get_trending_posts(limit_count INTEGER DEFAULT 20)
RETURNS TABLE(
  id UUID,
  title TEXT,
  content TEXT,
  author_id UUID,
  community_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  engagement_score NUMERIC
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    p.id,
    p.title,
    p.content,
    p.author_id,
    p.community_id,
    p.created_at,
    (
      COALESCE(p.likes_count, 0) * 1.0 +
      COALESCE(p.comments_count, 0) * 2.0 +
      COALESCE(p.shares_count, 0) * 1.5 +
      CASE WHEN p.is_featured THEN 10.0 ELSE 0.0 END
    ) / GREATEST(EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600, 1) as engagement_score
  FROM posts p
  WHERE p.is_active = true
  AND p.created_at > NOW() - INTERVAL '7 days'
  ORDER BY engagement_score DESC, p.created_at DESC
  LIMIT limit_count;
$$;

CREATE OR REPLACE FUNCTION get_user_feed(user_uuid UUID, limit_count INTEGER DEFAULT 20)
RETURNS TABLE(
  id UUID,
  title TEXT,
  content TEXT,
  author_id UUID,
  community_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  feed_score NUMERIC
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    p.id,
    p.title,
    p.content,
    p.author_id,
    p.community_id,
    p.created_at,
    (
      -- Base engagement score
      COALESCE(p.likes_count, 0) * 1.0 +
      COALESCE(p.comments_count, 0) * 2.0 +
      COALESCE(p.shares_count, 0) * 1.5 +
      -- Community membership boost
      CASE WHEN EXISTS (
        SELECT 1 FROM community_members cm 
        WHERE cm.community_id = p.community_id 
        AND cm.user_id = user_uuid 
        AND cm.status = 'active'
      ) THEN 5.0 ELSE 0.0 END +
      -- Recency boost
      CASE WHEN p.created_at > NOW() - INTERVAL '1 hour' THEN 10.0
           WHEN p.created_at > NOW() - INTERVAL '1 day' THEN 5.0
           ELSE 1.0 END
    ) / GREATEST(EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600, 1) as feed_score
  FROM posts p
  WHERE p.is_active = true
  AND p.created_at > NOW() - INTERVAL '30 days'
  ORDER BY feed_score DESC, p.created_at DESC
  LIMIT limit_count;
$$;

-- 6. Create materialized views for expensive queries
CREATE MATERIALIZED VIEW IF NOT EXISTS trending_posts_cache AS
SELECT 
  p.id,
  p.title,
  p.content,
  p.author_id,
  p.community_id,
  p.created_at,
  (
    COALESCE(p.likes_count, 0) * 1.0 +
    COALESCE(p.comments_count, 0) * 2.0 +
    COALESCE(p.shares_count, 0) * 1.5 +
    CASE WHEN p.is_featured THEN 10.0 ELSE 0.0 END
  ) / GREATEST(EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600, 1) as engagement_score
FROM posts p
WHERE p.is_active = true
AND p.created_at > NOW() - INTERVAL '7 days'
ORDER BY engagement_score DESC, p.created_at DESC
LIMIT 50;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_trending_posts_cache_score ON trending_posts_cache(engagement_score DESC);

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_trending_posts_cache()
RETURNS void
LANGUAGE SQL
SECURITY DEFINER
AS $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY trending_posts_cache;
$$;

-- 7. Create optimized triggers for maintaining counts
CREATE OR REPLACE FUNCTION update_post_engagement_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update likes count
    IF TG_TABLE_NAME = 'post_likes' THEN
      UPDATE posts 
      SET likes_count = (
        SELECT COUNT(*) 
        FROM post_likes 
        WHERE post_likes.post_id = NEW.post_id
      )
      WHERE id = NEW.post_id;
    END IF;
    
    -- Update comments count
    IF TG_TABLE_NAME = 'comments' THEN
      UPDATE posts 
      SET comments_count = (
        SELECT COUNT(*) 
        FROM comments 
        WHERE comments.post_id = NEW.post_id
      )
      WHERE id = NEW.post_id;
    END IF;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    -- Update likes count
    IF TG_TABLE_NAME = 'post_likes' THEN
      UPDATE posts 
      SET likes_count = (
        SELECT COUNT(*) 
        FROM post_likes 
        WHERE post_likes.post_id = OLD.post_id
      )
      WHERE id = OLD.post_id;
    END IF;
    
    -- Update comments count
    IF TG_TABLE_NAME = 'comments' THEN
      UPDATE posts 
      SET comments_count = (
        SELECT COUNT(*) 
        FROM comments 
        WHERE comments.post_id = OLD.post_id
      )
      WHERE id = OLD.post_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers for engagement counting
DROP TRIGGER IF EXISTS trigger_update_likes_count ON post_likes;
DROP TRIGGER IF EXISTS trigger_update_comments_count ON comments;

CREATE TRIGGER trigger_update_likes_count
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_engagement_count();

CREATE TRIGGER trigger_update_comments_count
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_post_engagement_count();

-- 8. Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_user_communities(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_trending_posts(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_feed(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_trending_posts_cache() TO authenticated;

-- Grant access to materialized view
GRANT SELECT ON trending_posts_cache TO authenticated;

-- 9. Create scheduled job to refresh materialized views (requires pg_cron extension)
-- Note: This would need to be enabled in Supabase dashboard
-- SELECT cron.schedule('refresh-trending-posts', '*/15 * * * *', 'SELECT refresh_trending_posts_cache();');

-- 10. Add comments for documentation
COMMENT ON FUNCTION get_user_communities(UUID) IS 'Optimized function to get user communities with proper indexing';
COMMENT ON FUNCTION get_trending_posts(INTEGER) IS 'Calculates trending posts with engagement scoring';
COMMENT ON FUNCTION get_user_feed(UUID, INTEGER) IS 'Personalized feed with community and engagement scoring';
COMMENT ON MATERIALIZED VIEW trending_posts_cache IS 'Cached trending posts for better performance';
COMMENT ON FUNCTION refresh_trending_posts_cache() IS 'Refresh function for trending posts materialized view';
