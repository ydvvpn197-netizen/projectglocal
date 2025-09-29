-- ============================================================================
-- CONTENT SYSTEM - TheGlocal Project
-- ============================================================================
-- This migration handles:
-- - Content creation and management (posts, events, services)
-- - Social interactions (likes, comments, follows)
-- - Content moderation and status management
-- - Content analytics and engagement tracking
-- Date: 2025-01-01
-- Version: 1.0.0

-- ============================================================================
-- CONTENT MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function to create a new post
CREATE OR REPLACE FUNCTION public.create_post(
  p_user_id UUID,
  p_type post_type,
  p_title TEXT,
  p_content TEXT,
  p_location_city TEXT DEFAULT NULL,
  p_location_state TEXT DEFAULT NULL,
  p_location_country TEXT DEFAULT NULL,
  p_latitude DECIMAL DEFAULT NULL,
  p_longitude DECIMAL DEFAULT NULL,
  p_event_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_event_location TEXT DEFAULT NULL,
  p_price_range TEXT DEFAULT NULL,
  p_contact_info TEXT DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL,
  p_image_urls TEXT[] DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  new_post_id UUID;
  result JSONB;
BEGIN
  -- Check if user can create post
  IF auth.uid() != p_user_id AND NOT public.is_admin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized to create post'
    );
  END IF;
  
  -- Create post
  INSERT INTO public.posts (
    user_id, type, title, content, location_city, location_state, location_country,
    latitude, longitude, event_date, event_location, price_range, contact_info,
    tags, image_urls
  ) VALUES (
    p_user_id, p_type, p_title, p_content, p_location_city, p_location_state, p_location_country,
    p_latitude, p_longitude, p_event_date, p_event_location, p_price_range, p_contact_info,
    p_tags, p_image_urls
  ) RETURNING id INTO new_post_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Post created successfully',
    'post_id', new_post_id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update post
CREATE OR REPLACE FUNCTION public.update_post(
  p_post_id UUID,
  p_user_id UUID,
  p_updates JSONB
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check if user can update post
  IF auth.uid() != p_user_id AND NOT public.is_admin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized to update post'
    );
  END IF;
  
  -- Update post
  UPDATE public.posts
  SET 
    title = COALESCE((p_updates->>'title')::TEXT, title),
    content = COALESCE((p_updates->>'content')::TEXT, content),
    location_city = COALESCE((p_updates->>'location_city')::TEXT, location_city),
    location_state = COALESCE((p_updates->>'location_state')::TEXT, location_state),
    location_country = COALESCE((p_updates->>'location_country')::TEXT, location_country),
    latitude = COALESCE((p_updates->>'latitude')::DECIMAL, latitude),
    longitude = COALESCE((p_updates->>'longitude')::DECIMAL, longitude),
    event_date = COALESCE((p_updates->>'event_date')::TIMESTAMP WITH TIME ZONE, event_date),
    event_location = COALESCE((p_updates->>'event_location')::TEXT, event_location),
    price_range = COALESCE((p_updates->>'price_range')::TEXT, price_range),
    contact_info = COALESCE((p_updates->>'contact_info')::TEXT, contact_info),
    tags = COALESCE((p_updates->>'tags')::TEXT[], tags),
    image_urls = COALESCE((p_updates->>'image_urls')::TEXT[], image_urls),
    updated_at = now()
  WHERE id = p_post_id AND user_id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Post updated successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete post
CREATE OR REPLACE FUNCTION public.delete_post(
  p_post_id UUID,
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check if user can delete post
  IF auth.uid() != p_user_id AND NOT public.is_admin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized to delete post'
    );
  END IF;
  
  -- Delete post (cascade will handle related records)
  DELETE FROM public.posts
  WHERE id = p_post_id AND user_id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Post deleted successfully'
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
-- SOCIAL INTERACTION FUNCTIONS
-- ============================================================================

-- Function to like/unlike a post
CREATE OR REPLACE FUNCTION public.toggle_post_like(
  p_user_id UUID,
  p_post_id UUID
) RETURNS JSONB AS $$
DECLARE
  like_exists BOOLEAN;
  result JSONB;
BEGIN
  -- Check if like exists
  SELECT EXISTS(
    SELECT 1 FROM public.likes 
    WHERE user_id = p_user_id AND post_id = p_post_id
  ) INTO like_exists;
  
  IF like_exists THEN
    -- Remove like
    DELETE FROM public.likes 
    WHERE user_id = p_user_id AND post_id = p_post_id;
    
    RETURN jsonb_build_object(
      'success', true,
      'action', 'unliked',
      'message', 'Post unliked successfully'
    );
  ELSE
    -- Add like
    INSERT INTO public.likes (user_id, post_id)
    VALUES (p_user_id, p_post_id);
    
    RETURN jsonb_build_object(
      'success', true,
      'action', 'liked',
      'message', 'Post liked successfully'
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

-- Function to create comment
CREATE OR REPLACE FUNCTION public.create_comment(
  p_user_id UUID,
  p_post_id UUID,
  p_content TEXT,
  p_parent_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  new_comment_id UUID;
  result JSONB;
BEGIN
  -- Create comment
  INSERT INTO public.comments (user_id, post_id, content, parent_id)
  VALUES (p_user_id, p_post_id, p_content, p_parent_id)
  RETURNING id INTO new_comment_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Comment created successfully',
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

-- Function to update comment
CREATE OR REPLACE FUNCTION public.update_comment(
  p_comment_id UUID,
  p_user_id UUID,
  p_content TEXT
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check if user can update comment
  IF auth.uid() != p_user_id AND NOT public.is_admin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized to update comment'
    );
  END IF;
  
  -- Update comment
  UPDATE public.comments
  SET 
    content = p_content,
    updated_at = now()
  WHERE id = p_comment_id AND user_id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Comment updated successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete comment
CREATE OR REPLACE FUNCTION public.delete_comment(
  p_comment_id UUID,
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check if user can delete comment
  IF auth.uid() != p_user_id AND NOT public.is_moderator() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized to delete comment'
    );
  END IF;
  
  -- Delete comment (cascade will handle child comments)
  DELETE FROM public.comments
  WHERE id = p_comment_id AND user_id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Comment deleted successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to follow/unfollow user
CREATE OR REPLACE FUNCTION public.toggle_follow(
  p_follower_id UUID,
  p_following_id UUID
) RETURNS JSONB AS $$
DECLARE
  follow_exists BOOLEAN;
  result JSONB;
BEGIN
  -- Check if already following
  SELECT EXISTS(
    SELECT 1 FROM public.follows 
    WHERE follower_id = p_follower_id AND following_id = p_following_id
  ) INTO follow_exists;
  
  IF follow_exists THEN
    -- Unfollow
    DELETE FROM public.follows 
    WHERE follower_id = p_follower_id AND following_id = p_following_id;
    
    RETURN jsonb_build_object(
      'success', true,
      'action', 'unfollowed',
      'message', 'User unfollowed successfully'
    );
  ELSE
    -- Follow
    INSERT INTO public.follows (follower_id, following_id)
    VALUES (p_follower_id, p_following_id);
    
    RETURN jsonb_build_object(
      'success', true,
      'action', 'followed',
      'message', 'User followed successfully'
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

-- ============================================================================
-- CONTENT ANALYTICS FUNCTIONS
-- ============================================================================

-- Function to get post engagement stats
CREATE OR REPLACE FUNCTION public.get_post_engagement_stats(p_post_id UUID)
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  -- Get engagement stats
  SELECT jsonb_build_object(
    'likes_count', COALESCE(p.likes_count, 0),
    'comments_count', COALESCE(p.comments_count, 0),
    'shares_count', COALESCE(p.shares_count, 0),
    'views_count', COALESCE(p.views_count, 0),
    'created_at', p.created_at,
    'updated_at', p.updated_at
  ) INTO stats
  FROM public.posts p
  WHERE p.id = p_post_id;
  
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

-- Function to get user content stats
CREATE OR REPLACE FUNCTION public.get_user_content_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  -- Get user content stats
  SELECT jsonb_build_object(
    'total_posts', (SELECT COUNT(*) FROM public.posts WHERE user_id = p_user_id),
    'active_posts', (SELECT COUNT(*) FROM public.posts WHERE user_id = p_user_id AND status = 'active'),
    'total_comments', (SELECT COUNT(*) FROM public.comments WHERE user_id = p_user_id),
    'total_likes_received', (
      SELECT COALESCE(SUM(likes_count), 0) 
      FROM public.posts 
      WHERE user_id = p_user_id
    ),
    'total_comments_received', (
      SELECT COALESCE(SUM(comments_count), 0) 
      FROM public.posts 
      WHERE user_id = p_user_id
    ),
    'followers_count', (SELECT COUNT(*) FROM public.follows WHERE following_id = p_user_id),
    'following_count', (SELECT COUNT(*) FROM public.follows WHERE follower_id = p_user_id)
  ) INTO stats;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', stats
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
-- CONTENT FEED FUNCTIONS
-- ============================================================================

-- Function to get user feed
CREATE OR REPLACE FUNCTION public.get_user_feed(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) RETURNS JSONB AS $$
DECLARE
  feed_posts JSONB;
BEGIN
  -- Get user feed (posts from followed users + own posts)
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', p.id,
      'user_id', p.user_id,
      'type', p.type,
      'title', p.title,
      'content', p.content,
      'status', p.status,
      'location_city', p.location_city,
      'location_state', p.location_state,
      'location_country', p.location_country,
      'event_date', p.event_date,
      'event_location', p.event_location,
      'price_range', p.price_range,
      'contact_info', p.contact_info,
      'tags', p.tags,
      'image_urls', p.image_urls,
      'is_featured', p.is_featured,
      'likes_count', p.likes_count,
      'comments_count', p.comments_count,
      'shares_count', p.shares_count,
      'views_count', p.views_count,
      'created_at', p.created_at,
      'updated_at', p.updated_at,
      'author', jsonb_build_object(
        'id', pr.id,
        'username', pr.username,
        'display_name', pr.display_name,
        'avatar_url', pr.avatar_url,
        'is_verified', pr.is_verified,
        'is_premium', pr.is_premium
      )
    ) ORDER BY p.created_at DESC
  ) INTO feed_posts
  FROM public.posts p
  JOIN public.profiles pr ON p.user_id = pr.user_id
  WHERE p.status = 'active'
    AND (
      p.user_id = p_user_id
      OR p.user_id IN (
        SELECT following_id 
        FROM public.follows 
        WHERE follower_id = p_user_id
      )
    )
  ORDER BY p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', COALESCE(feed_posts, '[]'::jsonb),
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

-- Function to get trending posts
CREATE OR REPLACE FUNCTION public.get_trending_posts(
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_location_city TEXT DEFAULT NULL,
  p_location_country TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  trending_posts JSONB;
BEGIN
  -- Get trending posts based on engagement and recency
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', p.id,
      'user_id', p.user_id,
      'type', p.type,
      'title', p.title,
      'content', p.content,
      'status', p.status,
      'location_city', p.location_city,
      'location_state', p.location_state,
      'location_country', p.location_country,
      'event_date', p.event_date,
      'event_location', p.event_location,
      'price_range', p.price_range,
      'contact_info', p.contact_info,
      'tags', p.tags,
      'image_urls', p.image_urls,
      'is_featured', p.is_featured,
      'likes_count', p.likes_count,
      'comments_count', p.comments_count,
      'shares_count', p.shares_count,
      'views_count', p.views_count,
      'created_at', p.created_at,
      'updated_at', p.updated_at,
      'trending_score', (
        (p.likes_count * 1.0) + 
        (p.comments_count * 2.0) + 
        (p.shares_count * 1.5) + 
        (p.views_count * 0.1)
      ) / EXTRACT(EPOCH FROM (now() - p.created_at)) / 3600
    ) ORDER BY trending_score DESC
  ) INTO trending_posts
  FROM public.posts p
  WHERE p.status = 'active'
    AND p.created_at > now() - interval '7 days'
    AND (
      p_location_city IS NULL OR p.location_city = p_location_city
    )
    AND (
      p_location_country IS NULL OR p.location_country = p_location_country
    )
  ORDER BY trending_score DESC
  LIMIT p_limit OFFSET p_offset;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', COALESCE(trending_posts, '[]'::jsonb),
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
-- CONTENT MODERATION FUNCTIONS
-- ============================================================================

-- Function to moderate post
CREATE OR REPLACE FUNCTION public.moderate_post(
  p_post_id UUID,
  p_admin_user_id UUID,
  p_action TEXT,
  p_reason TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check if user is moderator
  IF NOT public.is_moderator() OR auth.uid() != p_admin_user_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized to moderate content'
    );
  END IF;
  
  -- Apply moderation action
  CASE p_action
    WHEN 'approve' THEN
      UPDATE public.posts SET status = 'active' WHERE id = p_post_id;
    WHEN 'reject' THEN
      UPDATE public.posts SET status = 'inactive' WHERE id = p_post_id;
    WHEN 'archive' THEN
      UPDATE public.posts SET status = 'archived' WHERE id = p_post_id;
    ELSE
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Invalid moderation action'
      );
  END CASE;
  
  -- Log moderation action
  PERFORM public.log_admin_action(
    p_admin_user_id,
    'moderate_post',
    'post',
    p_post_id,
    jsonb_build_object(
      'action', p_action,
      'reason', p_reason
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Post moderated successfully'
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
-- CONTENT SEARCH FUNCTIONS
-- ============================================================================

-- Function to search posts
CREATE OR REPLACE FUNCTION public.search_posts(
  p_query TEXT,
  p_user_id UUID DEFAULT NULL,
  p_type post_type DEFAULT NULL,
  p_location_city TEXT DEFAULT NULL,
  p_location_country TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) RETURNS JSONB AS $$
DECLARE
  search_results JSONB;
BEGIN
  -- Search posts
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', p.id,
      'user_id', p.user_id,
      'type', p.type,
      'title', p.title,
      'content', p.content,
      'status', p.status,
      'location_city', p.location_city,
      'location_state', p.location_state,
      'location_country', p.location_country,
      'tags', p.tags,
      'likes_count', p.likes_count,
      'comments_count', p.comments_count,
      'created_at', p.created_at,
      'author', jsonb_build_object(
        'username', pr.username,
        'display_name', pr.display_name,
        'avatar_url', pr.avatar_url
      )
    ) ORDER BY p.created_at DESC
  ) INTO search_results
  FROM public.posts p
  JOIN public.profiles pr ON p.user_id = pr.user_id
  WHERE p.status = 'active'
    AND (
      p.title ILIKE '%' || p_query || '%'
      OR p.content ILIKE '%' || p_query || '%'
      OR p_query = ANY(p.tags)
    )
    AND (p_user_id IS NULL OR p.user_id = p_user_id)
    AND (p_type IS NULL OR p.type = p_type)
    AND (p_location_city IS NULL OR p.location_city = p_location_city)
    AND (p_location_country IS NULL OR p.location_country = p_location_country)
  ORDER BY p.created_at DESC
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
