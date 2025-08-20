-- Migration: Add Missing Database Functions
-- Date: 2025-08-26
-- Description: Add missing functions that are being called by the frontend

-- Function to increment post view count
CREATE OR REPLACE FUNCTION increment_post_view_count(post_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  UPDATE posts 
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = post_uuid;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_post_view_count(UUID) TO authenticated;

-- Function to get posts with restricted contact info (if not already exists)
CREATE OR REPLACE FUNCTION get_posts_with_restricted_contact()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  type post_type,
  title TEXT,
  content TEXT,
  location_city TEXT,
  location_state TEXT,
  location_country TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  event_date TIMESTAMP WITH TIME ZONE,
  event_location TEXT,
  price_range TEXT,
  contact_info TEXT,
  tags TEXT[],
  image_urls TEXT[],
  likes_count INTEGER,
  comments_count INTEGER,
  view_count INTEGER,
  status post_status,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path TO ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.type,
    p.title,
    p.content,
    p.location_city,
    p.location_state,
    p.location_country,
    p.latitude,
    p.longitude,
    p.event_date,
    p.event_location,
    p.price_range,
    -- Only show contact_info to the post owner
    CASE 
      WHEN p.user_id = auth.uid() THEN p.contact_info
      ELSE NULL
    END as contact_info,
    p.tags,
    p.image_urls,
    p.likes_count,
    p.comments_count,
    COALESCE(p.view_count, 0) as view_count,
    p.status,
    p.created_at,
    p.updated_at
  FROM posts p
  WHERE (p.user_id = auth.uid() OR public.users_in_same_area(auth.uid(), p.user_id));
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_posts_with_restricted_contact() TO authenticated;

-- Function to update user location (if not already exists)
CREATE OR REPLACE FUNCTION update_user_location(
  user_uuid UUID,
  lat DECIMAL,
  lng DECIMAL,
  location_name TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  UPDATE profiles 
  SET 
    location_lat = lat,
    location_lng = lng,
    location_name = update_user_location.location_name,
    location_enabled = true,
    updated_at = NOW()
  WHERE user_id = user_uuid;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_user_location(UUID, DECIMAL, DECIMAL, TEXT) TO authenticated;

-- Function to get nearby content (if not already exists)
CREATE OR REPLACE FUNCTION get_nearby_content(
  user_lat DECIMAL,
  user_lng DECIMAL,
  radius_km INTEGER DEFAULT 50,
  content_type TEXT DEFAULT 'all'
)
RETURNS TABLE (
  id UUID,
  content_type TEXT,
  title TEXT,
  content TEXT,
  location_name TEXT,
  distance_km DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    'post'::TEXT as content_type,
    p.title,
    p.content,
    p.location_city as location_name,
    calculate_distance(user_lat, user_lng, p.latitude, p.longitude) as distance_km,
    p.created_at
  FROM posts p
  WHERE p.latitude IS NOT NULL 
    AND p.longitude IS NOT NULL
    AND calculate_distance(user_lat, user_lng, p.latitude, p.longitude) <= radius_km
    AND (content_type = 'all' OR content_type = 'post')
  
  UNION ALL
  
  SELECT 
    e.id,
    'event'::TEXT as content_type,
    e.title,
    e.description as content,
    e.location_name,
    calculate_distance(user_lat, user_lng, e.latitude, e.longitude) as distance_km,
    e.created_at
  FROM events e
  WHERE e.latitude IS NOT NULL 
    AND e.longitude IS NOT NULL
    AND calculate_distance(user_lat, user_lng, e.latitude, e.longitude) <= radius_km
    AND (content_type = 'all' OR content_type = 'event')
  
  ORDER BY distance_km ASC, created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_nearby_content(DECIMAL, DECIMAL, INTEGER, TEXT) TO authenticated;

-- Function to get personalized news feed (if not already exists)
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_personalized_news_feed(UUID, INTEGER) TO authenticated;

-- Function to get nearby news articles (if not already exists)
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_nearby_news_articles(DECIMAL, DECIMAL, INTEGER, TEXT, INTEGER) TO authenticated;

-- Function to get discussions with details (if not already exists)
CREATE OR REPLACE FUNCTION get_discussions_with_details()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  content TEXT,
  category TEXT,
  is_public BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  author_name TEXT,
  author_avatar TEXT,
  reply_count INTEGER,
  view_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.user_id,
    d.title,
    d.content,
    d.category,
    d.is_public,
    d.created_at,
    d.updated_at,
    p.display_name as author_name,
    p.avatar_url as author_avatar,
    COALESCE(reply_counts.count, 0)::INTEGER as reply_count,
    COALESCE(view_counts.count, 0)::INTEGER as view_count
  FROM discussions d
  LEFT JOIN profiles p ON d.user_id = p.user_id
  LEFT JOIN (
    SELECT discussion_id, COUNT(*) as count
    FROM discussion_replies
    GROUP BY discussion_id
  ) reply_counts ON d.id = reply_counts.discussion_id
  LEFT JOIN (
    SELECT discussion_id, COUNT(*) as count
    FROM discussion_views
    GROUP BY discussion_id
  ) view_counts ON d.id = view_counts.discussion_id
  WHERE d.is_public = true OR d.user_id = auth.uid()
  ORDER BY d.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_discussions_with_details() TO authenticated;

-- Function to get group messages with details (if not already exists)
CREATE OR REPLACE FUNCTION get_group_messages_with_details(group_id_param UUID)
RETURNS TABLE (
  id UUID,
  group_id UUID,
  user_id UUID,
  content TEXT,
  parent_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  is_edited BOOLEAN,
  user_display_name TEXT,
  user_avatar_url TEXT,
  likes_count INTEGER,
  is_liked_by_user BOOLEAN,
  replies_count INTEGER,
  views_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gm.id,
    gm.group_id,
    gm.user_id,
    gm.content,
    gm.parent_id,
    gm.created_at,
    gm.updated_at,
    gm.is_edited,
    p.display_name as user_display_name,
    p.avatar_url as user_avatar_url,
    COALESCE(like_counts.likes_count, 0)::INTEGER as likes_count,
    COALESCE(user_likes.is_liked, false) as is_liked_by_user,
    COALESCE(reply_counts.replies_count, 0)::INTEGER as replies_count,
    COALESCE(view_counts.views_count, 0)::INTEGER as views_count
  FROM group_messages gm
  LEFT JOIN profiles p ON gm.user_id = p.user_id
  LEFT JOIN (
    SELECT gml.message_id, COUNT(*) as likes_count
    FROM group_message_likes gml
    GROUP BY gml.message_id
  ) like_counts ON gm.id = like_counts.message_id
  LEFT JOIN (
    SELECT gml.message_id, true as is_liked
    FROM group_message_likes gml
    WHERE gml.user_id = auth.uid()
  ) user_likes ON gm.id = user_likes.message_id
  LEFT JOIN (
    SELECT gm_replies.parent_id, COUNT(*) as replies_count
    FROM group_messages gm_replies
    WHERE gm_replies.parent_id IS NOT NULL
    GROUP BY gm_replies.parent_id
  ) reply_counts ON gm.id = reply_counts.parent_id
  LEFT JOIN (
    SELECT gmv.message_id, COUNT(*) as views_count
    FROM group_message_views gmv
    GROUP BY gmv.message_id
  ) view_counts ON gm.id = view_counts.message_id
  WHERE gm.group_id = group_id_param
  ORDER BY gm.created_at ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_group_messages_with_details(UUID) TO authenticated;

-- Function to get ranked posts (if not already exists)
CREATE OR REPLACE FUNCTION get_ranked_posts(
  user_uuid UUID,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
) RETURNS TABLE (
  id UUID,
  user_id UUID,
  type post_type,
  title TEXT,
  content TEXT,
  location_city TEXT,
  location_state TEXT,
  location_country TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  event_date TIMESTAMP WITH TIME ZONE,
  event_location TEXT,
  price_range TEXT,
  contact_info TEXT,
  tags TEXT[],
  image_urls TEXT[],
  likes_count INTEGER,
  comments_count INTEGER,
  view_count INTEGER,
  status post_status,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  author_name TEXT,
  author_avatar TEXT,
  is_liked_by_user BOOLEAN,
  is_following_author BOOLEAN,
  score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.type,
    p.title,
    p.content,
    p.location_city,
    p.location_state,
    p.location_country,
    p.latitude,
    p.longitude,
    p.event_date,
    p.event_location,
    p.price_range,
    CASE 
      WHEN p.user_id = user_uuid THEN p.contact_info
      ELSE NULL
    END as contact_info,
    p.tags,
    p.image_urls,
    p.likes_count,
    p.comments_count,
    COALESCE(p.view_count, 0) as view_count,
    p.status,
    p.created_at,
    p.updated_at,
    author_profile.display_name as author_name,
    author_profile.avatar_url as author_avatar,
    EXISTS(SELECT 1 FROM likes WHERE user_id = user_uuid AND post_id = p.id) as is_liked_by_user,
    EXISTS(SELECT 1 FROM follows WHERE follower_id = user_uuid AND following_id = p.user_id) as is_following_author,
    -- Calculate score based on likes, comments, views, and recency
    (
      COALESCE(p.likes_count, 0) * 2 + 
      COALESCE(p.comments_count, 0) * 3 + 
      COALESCE(p.view_count, 0) * 0.1 +
      EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600 * -0.1
    ) as score
  FROM posts p
  LEFT JOIN profiles author_profile ON p.user_id = author_profile.user_id
  WHERE (p.user_id = user_uuid OR public.users_in_same_area(user_uuid, p.user_id))
    AND p.status = 'active'
  ORDER BY score DESC, p.created_at DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_ranked_posts(UUID, INTEGER, INTEGER) TO authenticated;

-- Function to generate referral code (if not already exists)
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  referral_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 8-character code
    referral_code := UPPER(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = referral_code) INTO code_exists;
    
    -- If code doesn't exist, break the loop
    IF NOT code_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN referral_code;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION generate_referral_code() TO authenticated;

-- Function to validate promo code (if not already exists)
CREATE OR REPLACE FUNCTION validate_promo_code(
  code_input VARCHAR(50),
  user_uuid UUID,
  amount DECIMAL(10,2)
) RETURNS TABLE (
  is_valid BOOLEAN,
  discount_amount DECIMAL(10,2),
  discount_type TEXT,
  message TEXT
) AS $$
DECLARE
  promo_record RECORD;
BEGIN
  -- Check if promo code exists and is valid
  SELECT * INTO promo_record
  FROM promo_codes
  WHERE code = code_input
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (max_uses IS NULL OR uses_count < max_uses);
  
  IF promo_record IS NULL THEN
    RETURN QUERY SELECT false, 0::DECIMAL, 'invalid'::TEXT, 'Invalid or expired promo code'::TEXT;
    RETURN;
  END IF;
  
  -- Check if user has already used this code
  IF EXISTS(SELECT 1 FROM promo_code_usage WHERE code_id = promo_record.id AND user_id = user_uuid) THEN
    RETURN QUERY SELECT false, 0::DECIMAL, 'used'::TEXT, 'You have already used this promo code'::TEXT;
    RETURN;
  END IF;
  
  -- Calculate discount
  DECLARE
    discount_amount_calc DECIMAL(10,2);
  BEGIN
    IF promo_record.discount_type = 'percentage' THEN
      discount_amount_calc := amount * (promo_record.discount_value / 100);
    ELSE
      discount_amount_calc := promo_record.discount_value;
    END IF;
    
    -- Ensure discount doesn't exceed amount
    IF discount_amount_calc > amount THEN
      discount_amount_calc := amount;
    END IF;
    
    RETURN QUERY SELECT true, discount_amount_calc, promo_record.discount_type, 'Promo code applied successfully'::TEXT;
  END;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION validate_promo_code(VARCHAR, UUID, DECIMAL) TO authenticated;

-- Function to check admin permission (if not already exists)
CREATE OR REPLACE FUNCTION check_admin_permission(required_permission TEXT, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  admin_user_record RECORD;
  admin_role_record RECORD;
BEGIN
  -- Check if user is an admin
  SELECT * INTO admin_user_record
  FROM admin_users
  WHERE user_id = user_uuid AND is_active = true;
  
  IF admin_user_record IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get admin role
  SELECT * INTO admin_role_record
  FROM admin_roles
  WHERE id = admin_user_record.role_id AND is_active = true;
  
  IF admin_role_record IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if role has the required permission
  RETURN required_permission = ANY(admin_role_record.permissions);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_admin_permission(TEXT, UUID) TO authenticated;

-- Function to log admin action (if not already exists)
CREATE OR REPLACE FUNCTION log_admin_action(
  action_type TEXT,
  resource_type TEXT,
  resource_id TEXT,
  action_data JSONB,
  success BOOLEAN,
  error_message TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get current admin user ID
  SELECT id INTO admin_user_id
  FROM admin_users
  WHERE user_id = auth.uid() AND is_active = true;
  
  -- Log the action
  INSERT INTO admin_actions (
    admin_user_id,
    action_type,
    resource_type,
    resource_id,
    action_data,
    ip_address,
    user_agent,
    success,
    error_message
  ) VALUES (
    admin_user_id,
    action_type,
    resource_type,
    resource_id,
    action_data,
    inet_client_addr(),
    current_setting('request.headers')::json->>'user-agent',
    success,
    error_message
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION log_admin_action(TEXT, TEXT, TEXT, JSONB, BOOLEAN, TEXT) TO authenticated;
