-- ============================================================================
-- NEWS SYSTEM - TheGlocal Project
-- ============================================================================
-- This migration handles:
-- - News aggregation and caching
-- - News interactions (likes, comments, shares)
-- - News polls and voting
-- - Trending algorithm and personalization
-- - News analytics and engagement tracking
-- Date: 2025-01-01
-- Version: 1.0.0

-- ============================================================================
-- NEWS CACHE FUNCTIONS
-- ============================================================================

-- Function to cache news article
CREATE OR REPLACE FUNCTION public.cache_news_article(
  p_article_id TEXT,
  p_title TEXT,
  p_content TEXT,
  p_summary TEXT,
  p_source TEXT,
  p_url TEXT,
  p_image_url TEXT DEFAULT NULL,
  p_published_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Insert or update news cache
  INSERT INTO public.news_cache (
    article_id, title, content, summary, source, url, image_url,
    published_at, city, country, category, tags, metadata
  ) VALUES (
    p_article_id, p_title, p_content, p_summary, p_source, p_url, p_image_url,
    p_published_at, p_city, p_country, p_category, p_tags, p_metadata
  )
  ON CONFLICT (article_id)
  DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    summary = EXCLUDED.summary,
    source = EXCLUDED.source,
    url = EXCLUDED.url,
    image_url = EXCLUDED.image_url,
    published_at = EXCLUDED.published_at,
    city = EXCLUDED.city,
    country = EXCLUDED.country,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    metadata = EXCLUDED.metadata,
    cached_at = now(),
    expires_at = now() + interval '15 minutes';
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'News article cached successfully',
    'article_id', p_article_id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get news article
CREATE OR REPLACE FUNCTION public.get_news_article(p_article_id TEXT)
RETURNS JSONB AS $$
DECLARE
  article_data JSONB;
BEGIN
  -- Get news article
  SELECT jsonb_build_object(
    'id', nc.id,
    'article_id', nc.article_id,
    'title', nc.title,
    'content', nc.content,
    'summary', nc.summary,
    'source', nc.source,
    'url', nc.url,
    'image_url', nc.image_url,
    'published_at', nc.published_at,
    'cached_at', nc.cached_at,
    'expires_at', nc.expires_at,
    'city', nc.city,
    'country', nc.country,
    'category', nc.category,
    'tags', nc.tags,
    'metadata', nc.metadata,
    'likes_count', COALESCE((nc.metadata->>'likes_count')::integer, 0),
    'comments_count', COALESCE((nc.metadata->>'comments_count')::integer, 0),
    'shares_count', COALESCE((nc.metadata->>'shares_count')::integer, 0)
  ) INTO article_data
  FROM public.news_cache nc
  WHERE nc.article_id = p_article_id
    AND nc.expires_at > now();
  
  RETURN jsonb_build_object(
    'success', true,
    'data', COALESCE(article_data, '{}'::jsonb)
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- NEWS INTERACTION FUNCTIONS
-- ============================================================================

-- Function to like/unlike news article
CREATE OR REPLACE FUNCTION public.toggle_news_like(
  p_user_id UUID,
  p_article_id TEXT
) RETURNS JSONB AS $$
DECLARE
  like_exists BOOLEAN;
  result JSONB;
BEGIN
  -- Check if like exists
  SELECT EXISTS(
    SELECT 1 FROM public.news_likes 
    WHERE user_id = p_user_id AND article_id = p_article_id
  ) INTO like_exists;
  
  IF like_exists THEN
    -- Remove like
    DELETE FROM public.news_likes 
    WHERE user_id = p_user_id AND article_id = p_article_id;
    
    RETURN jsonb_build_object(
      'success', true,
      'action', 'unliked',
      'message', 'News article unliked successfully'
    );
  ELSE
    -- Add like
    INSERT INTO public.news_likes (user_id, article_id)
    VALUES (p_user_id, p_article_id);
    
    RETURN jsonb_build_object(
      'success', true,
      'action', 'liked',
      'message', 'News article liked successfully'
    );
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create news comment
CREATE OR REPLACE FUNCTION public.create_news_comment(
  p_user_id UUID,
  p_article_id TEXT,
  p_content TEXT,
  p_parent_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  new_comment_id UUID;
  result JSONB;
BEGIN
  -- Create news comment
  INSERT INTO public.news_comments (user_id, article_id, content, parent_id)
  VALUES (p_user_id, p_article_id, p_content, p_parent_id)
  RETURNING id INTO new_comment_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'News comment created successfully',
    'comment_id', new_comment_id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to share news article
CREATE OR REPLACE FUNCTION public.share_news_article(
  p_user_id UUID,
  p_article_id TEXT,
  p_platform TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  new_share_id UUID;
  result JSONB;
BEGIN
  -- Create news share
  INSERT INTO public.news_shares (user_id, article_id, platform)
  VALUES (p_user_id, p_article_id, p_platform)
  RETURNING id INTO new_share_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'News article shared successfully',
    'share_id', new_share_id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- NEWS POLLS FUNCTIONS
-- ============================================================================

-- Function to create news poll
CREATE OR REPLACE FUNCTION public.create_news_poll(
  p_article_id TEXT,
  p_question TEXT,
  p_options JSONB,
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  new_poll_id UUID;
  result JSONB;
BEGIN
  -- Create news poll
  INSERT INTO public.news_polls (article_id, question, options, expires_at)
  VALUES (p_article_id, p_question, p_options, p_expires_at)
  RETURNING id INTO new_poll_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'News poll created successfully',
    'poll_id', new_poll_id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to vote on news poll
CREATE OR REPLACE FUNCTION public.vote_news_poll(
  p_user_id UUID,
  p_poll_id UUID,
  p_option_index INTEGER
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Insert or update poll vote
  INSERT INTO public.news_poll_votes (poll_id, user_id, option_index)
  VALUES (p_poll_id, p_user_id, p_option_index)
  ON CONFLICT (poll_id, user_id)
  DO UPDATE SET option_index = EXCLUDED.option_index;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Poll vote recorded successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get poll results
CREATE OR REPLACE FUNCTION public.get_poll_results(p_poll_id UUID)
RETURNS JSONB AS $$
DECLARE
  poll_data JSONB;
  vote_results JSONB;
BEGIN
  -- Get poll data
  SELECT jsonb_build_object(
    'id', np.id,
    'article_id', np.article_id,
    'question', np.question,
    'options', np.options,
    'expires_at', np.expires_at,
    'created_at', np.created_at
  ) INTO poll_data
  FROM public.news_polls np
  WHERE np.id = p_poll_id;
  
  -- Get vote results
  SELECT jsonb_agg(
    jsonb_build_object(
      'option_index', option_index,
      'vote_count', vote_count
    ) ORDER BY option_index
  ) INTO vote_results
  FROM (
    SELECT 
      option_index,
      COUNT(*) as vote_count
    FROM public.news_poll_votes
    WHERE poll_id = p_poll_id
    GROUP BY option_index
  ) vote_counts;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', jsonb_build_object(
      'poll', poll_data,
      'results', COALESCE(vote_results, '[]'::jsonb)
    )
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRENDING ALGORITHM FUNCTIONS
-- ============================================================================

-- Function to calculate trending score for news
CREATE OR REPLACE FUNCTION public.calculate_trending_score(
  p_article_id TEXT, 
  p_user_city TEXT DEFAULT NULL, 
  p_user_country TEXT DEFAULT NULL
) RETURNS DECIMAL AS $$
DECLARE
  article_data RECORD;
  likes_count INTEGER;
  comments_count INTEGER;
  shares_count INTEGER;
  votes_count INTEGER;
  time_decay DECIMAL;
  locality_boost DECIMAL := 1.0;
  trending_score DECIMAL;
BEGIN
  -- Get article data
  SELECT 
    metadata,
    published_at,
    city,
    country,
    cached_at
  INTO article_data
  FROM public.news_cache
  WHERE news_cache.article_id = p_article_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Extract counts from metadata
  likes_count := COALESCE((article_data.metadata->>'likes_count')::integer, 0);
  comments_count := COALESCE((article_data.metadata->>'comments_count')::integer, 0);
  shares_count := COALESCE((article_data.metadata->>'shares_count')::integer, 0);
  votes_count := COALESCE((article_data.metadata->>'votes_count')::integer, 0);
  
  -- Calculate time decay (λ ≈ 0.08)
  time_decay := EXP(-0.08 * EXTRACT(EPOCH FROM (now() - article_data.cached_at)) / 3600);
  
  -- Calculate locality boost
  IF p_user_city IS NOT NULL AND article_data.city = p_user_city THEN
    locality_boost := 1.2; -- +20% for same city
  ELSIF p_user_country IS NOT NULL AND article_data.country = p_user_country THEN
    locality_boost := 1.1; -- +10% for same country
  END IF;
  
  -- Calculate trending score
  trending_score := (likes_count + (2 * comments_count) + (1.5 * shares_count) + votes_count) * time_decay * locality_boost;
  
  RETURN trending_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get trending news
CREATE OR REPLACE FUNCTION public.get_trending_news(
  p_user_city TEXT DEFAULT NULL,
  p_user_country TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) RETURNS JSONB AS $$
DECLARE
  trending_news JSONB;
BEGIN
  -- Get trending news
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', nc.id,
      'article_id', nc.article_id,
      'title', nc.title,
      'content', nc.content,
      'summary', nc.summary,
      'source', nc.source,
      'url', nc.url,
      'image_url', nc.image_url,
      'published_at', nc.published_at,
      'city', nc.city,
      'country', nc.country,
      'category', nc.category,
      'tags', nc.tags,
      'trending_score', public.calculate_trending_score(nc.article_id, p_user_city, p_user_country),
      'likes_count', COALESCE((nc.metadata->>'likes_count')::integer, 0),
      'comments_count', COALESCE((nc.metadata->>'comments_count')::integer, 0),
      'shares_count', COALESCE((nc.metadata->>'shares_count')::integer, 0)
    ) ORDER BY trending_score DESC
  ) INTO trending_news
  FROM public.news_cache nc
  WHERE nc.expires_at > now()
    AND (p_category IS NULL OR nc.category = p_category)
    AND (p_user_city IS NULL OR nc.city = p_user_city)
    AND (p_user_country IS NULL OR nc.country = p_user_country)
  ORDER BY public.calculate_trending_score(nc.article_id, p_user_city, p_user_country) DESC
  LIMIT p_limit OFFSET p_offset;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', COALESCE(trending_news, '[]'::jsonb),
    'limit', p_limit,
    'offset', p_offset
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- NEWS PERSONALIZATION FUNCTIONS
-- ============================================================================

-- Function to track news event
CREATE OR REPLACE FUNCTION public.track_news_event(
  p_user_id UUID,
  p_article_id TEXT,
  p_action TEXT,
  p_metadata JSONB DEFAULT '{}'
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Track news event
  INSERT INTO public.news_events (user_id, article_id, action, metadata)
  VALUES (p_user_id, p_article_id, p_action, p_metadata);
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'News event tracked successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get personalized news feed
CREATE OR REPLACE FUNCTION public.get_personalized_news_feed(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) RETURNS JSONB AS $$
DECLARE
  user_profile RECORD;
  personalized_news JSONB;
BEGIN
  -- Get user profile for personalization
  SELECT 
    location_city,
    location_country,
    interests
  INTO user_profile
  FROM public.profiles p
  LEFT JOIN (
    SELECT 
      ui.user_id,
      jsonb_agg(i.category) as interests
    FROM public.user_interests ui
    JOIN public.interests i ON ui.interest_id = i.id
    GROUP BY ui.user_id
  ) user_interests ON p.user_id = user_interests.user_id
  WHERE p.user_id = p_user_id;
  
  -- Get personalized news
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', nc.id,
      'article_id', nc.article_id,
      'title', nc.title,
      'content', nc.content,
      'summary', nc.summary,
      'source', nc.source,
      'url', nc.url,
      'image_url', nc.image_url,
      'published_at', nc.published_at,
      'city', nc.city,
      'country', nc.country,
      'category', nc.category,
      'tags', nc.tags,
      'trending_score', public.calculate_trending_score(nc.article_id, user_profile.location_city, user_profile.location_country),
      'likes_count', COALESCE((nc.metadata->>'likes_count')::integer, 0),
      'comments_count', COALESCE((nc.metadata->>'comments_count')::integer, 0),
      'shares_count', COALESCE((nc.metadata->>'shares_count')::integer, 0)
    ) ORDER BY trending_score DESC
  ) INTO personalized_news
  FROM public.news_cache nc
  WHERE nc.expires_at > now()
    AND (
      user_profile.interests IS NULL 
      OR nc.category = ANY(user_profile.interests)
      OR nc.tags && user_profile.interests
    )
  ORDER BY public.calculate_trending_score(nc.article_id, user_profile.location_city, user_profile.location_country) DESC
  LIMIT p_limit OFFSET p_offset;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', COALESCE(personalized_news, '[]'::jsonb),
    'limit', p_limit,
    'offset', p_offset
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- NEWS ANALYTICS FUNCTIONS
-- ============================================================================

-- Function to get news engagement stats
CREATE OR REPLACE FUNCTION public.get_news_engagement_stats(p_article_id TEXT)
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  -- Get engagement stats
  SELECT jsonb_build_object(
    'likes_count', COALESCE((nc.metadata->>'likes_count')::integer, 0),
    'comments_count', COALESCE((nc.metadata->>'comments_count')::integer, 0),
    'shares_count', COALESCE((nc.metadata->>'shares_count')::integer, 0),
    'trending_score', public.calculate_trending_score(nc.article_id, NULL, NULL),
    'published_at', nc.published_at,
    'cached_at', nc.cached_at
  ) INTO stats
  FROM public.news_cache nc
  WHERE nc.article_id = p_article_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', COALESCE(stats, '{}'::jsonb)
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get news category stats
CREATE OR REPLACE FUNCTION public.get_news_category_stats()
RETURNS JSONB AS $$
DECLARE
  category_stats JSONB;
BEGIN
  -- Get category stats
  SELECT jsonb_agg(
    jsonb_build_object(
      'category', category,
      'article_count', article_count,
      'total_engagement', total_engagement
    ) ORDER BY total_engagement DESC
  ) INTO category_stats
  FROM (
    SELECT 
      nc.category,
      COUNT(*) as article_count,
      SUM(
        COALESCE((nc.metadata->>'likes_count')::integer, 0) +
        COALESCE((nc.metadata->>'comments_count')::integer, 0) +
        COALESCE((nc.metadata->>'shares_count')::integer, 0)
      ) as total_engagement
    FROM public.news_cache nc
    WHERE nc.expires_at > now()
    GROUP BY nc.category
  ) stats;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', COALESCE(category_stats, '[]'::jsonb)
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- NEWS SEARCH FUNCTIONS
-- ============================================================================

-- Function to search news
CREATE OR REPLACE FUNCTION public.search_news(
  p_query TEXT,
  p_category TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) RETURNS JSONB AS $$
DECLARE
  search_results JSONB;
BEGIN
  -- Search news
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', nc.id,
      'article_id', nc.article_id,
      'title', nc.title,
      'content', nc.content,
      'summary', nc.summary,
      'source', nc.source,
      'url', nc.url,
      'image_url', nc.image_url,
      'published_at', nc.published_at,
      'city', nc.city,
      'country', nc.country,
      'category', nc.category,
      'tags', nc.tags,
      'trending_score', public.calculate_trending_score(nc.article_id, p_city, p_country),
      'likes_count', COALESCE((nc.metadata->>'likes_count')::integer, 0),
      'comments_count', COALESCE((nc.metadata->>'comments_count')::integer, 0),
      'shares_count', COALESCE((nc.metadata->>'shares_count')::integer, 0)
    ) ORDER BY trending_score DESC
  ) INTO search_results
  FROM public.news_cache nc
  WHERE nc.expires_at > now()
    AND (
      nc.title ILIKE '%' || p_query || '%'
      OR nc.content ILIKE '%' || p_query || '%'
      OR p_query = ANY(nc.tags)
    )
    AND (p_category IS NULL OR nc.category = p_category)
    AND (p_city IS NULL OR nc.city = p_city)
    AND (p_country IS NULL OR nc.country = p_country)
  ORDER BY public.calculate_trending_score(nc.article_id, p_city, p_country) DESC
  LIMIT p_limit OFFSET p_offset;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', COALESCE(search_results, '[]'::jsonb),
    'query', p_query,
    'limit', p_limit,
    'offset', p_offset
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
