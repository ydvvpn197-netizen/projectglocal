-- ============================================================================
-- COMMUNITY FEATURES - TheGlocal Project
-- ============================================================================
-- This migration handles:
-- - User points and rewards system
-- - Community leaderboard
-- - User behavior tracking
-- - Community engagement analytics
-- - Referral system
-- - Marketing campaigns
-- Date: 2025-01-01
-- Version: 1.0.0

-- ============================================================================
-- POINTS SYSTEM FUNCTIONS
-- ============================================================================

-- Function to add points to a user
CREATE OR REPLACE FUNCTION public.add_user_points(
  p_user_id UUID,
  p_points INTEGER,
  p_transaction_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  -- Insert or update user_points
  INSERT INTO public.user_points (user_id, total_points)
  VALUES (p_user_id, p_points)
  ON CONFLICT (user_id)
  DO UPDATE SET 
    total_points = public.user_points.total_points + p_points,
    updated_at = now();
  
  -- Record transaction
  INSERT INTO public.point_transactions (user_id, points, transaction_type, description, metadata)
  VALUES (p_user_id, p_points, p_transaction_type, p_description, p_metadata);
  
  -- Update leaderboard
  INSERT INTO public.community_leaderboard (user_id, total_points)
  SELECT 
    up.user_id,
    up.total_points
  FROM public.user_points up
  WHERE up.user_id = p_user_id
  ON CONFLICT (user_id)
  DO UPDATE SET 
    total_points = EXCLUDED.total_points,
    last_updated = now();
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user points
CREATE OR REPLACE FUNCTION public.get_user_points(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  points_data JSONB;
BEGIN
  -- Get user points
  SELECT jsonb_build_object(
    'user_id', up.user_id,
    'total_points', up.total_points,
    'rank', up.rank,
    'created_at', up.created_at,
    'updated_at', up.updated_at
  ) INTO points_data
  FROM public.user_points up
  WHERE up.user_id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', COALESCE(points_data, '{}'::jsonb)
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user point transactions
CREATE OR REPLACE FUNCTION public.get_user_point_transactions(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) RETURNS JSONB AS $$
DECLARE
  transactions JSONB;
BEGIN
  -- Get user point transactions
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', pt.id,
      'points', pt.points,
      'transaction_type', pt.transaction_type,
      'description', pt.description,
      'metadata', pt.metadata,
      'created_at', pt.created_at
    ) ORDER BY pt.created_at DESC
  ) INTO transactions
  FROM public.point_transactions pt
  WHERE pt.user_id = p_user_id
  ORDER BY pt.created_at DESC
  LIMIT p_limit OFFSET p_offset;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', COALESCE(transactions, '[]'::jsonb),
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
-- LEADERBOARD FUNCTIONS
-- ============================================================================

-- Function to update leaderboard ranks
CREATE OR REPLACE FUNCTION public.update_leaderboard_rank() RETURNS VOID AS $$
BEGIN
  UPDATE public.community_leaderboard
  SET rank = subquery.rank
  FROM (
    SELECT 
      user_id,
      ROW_NUMBER() OVER (ORDER BY total_points DESC, last_updated ASC) as rank
    FROM public.community_leaderboard
  ) subquery
  WHERE public.community_leaderboard.user_id = subquery.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to refresh all leaderboard ranks
CREATE OR REPLACE FUNCTION public.refresh_all_leaderboard_ranks() RETURNS VOID AS $$
BEGIN
  PERFORM public.update_leaderboard_rank();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get leaderboard
CREATE OR REPLACE FUNCTION public.get_leaderboard(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
) RETURNS JSONB AS $$
DECLARE
  leaderboard_data JSONB;
BEGIN
  -- Get leaderboard
  SELECT jsonb_agg(
    jsonb_build_object(
      'rank', cl.rank,
      'user_id', cl.user_id,
      'display_name', cl.display_name,
      'avatar_url', cl.avatar_url,
      'total_points', cl.total_points,
      'last_updated', cl.last_updated
    ) ORDER BY cl.rank ASC
  ) INTO leaderboard_data
  FROM public.community_leaderboard cl
  ORDER BY cl.rank ASC
  LIMIT p_limit OFFSET p_offset;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', COALESCE(leaderboard_data, '[]'::jsonb),
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

-- Function to get user rank
CREATE OR REPLACE FUNCTION public.get_user_rank(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  rank_data JSONB;
BEGIN
  -- Get user rank
  SELECT jsonb_build_object(
    'user_id', cl.user_id,
    'rank', cl.rank,
    'total_points', cl.total_points,
    'display_name', cl.display_name,
    'avatar_url', cl.avatar_url,
    'last_updated', cl.last_updated
  ) INTO rank_data
  FROM public.community_leaderboard cl
  WHERE cl.user_id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', COALESCE(rank_data, '{}'::jsonb)
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
-- BEHAVIOR TRACKING FUNCTIONS
-- ============================================================================

-- Function to track user behavior
CREATE OR REPLACE FUNCTION public.track_user_behavior(
  p_user_id UUID,
  p_action TEXT,
  p_content_type TEXT,
  p_content_id UUID,
  p_metadata JSONB DEFAULT '{}',
  p_session_id TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Track user behavior
  INSERT INTO public.user_behavior (user_id, action, content_type, content_id, metadata, session_id)
  VALUES (p_user_id, p_action, p_content_type, p_content_id, p_metadata, p_session_id);
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Behavior tracked successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user behavior analytics
CREATE OR REPLACE FUNCTION public.get_user_behavior_analytics(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
) RETURNS JSONB AS $$
DECLARE
  analytics_data JSONB;
BEGIN
  -- Get user behavior analytics
  SELECT jsonb_build_object(
    'total_actions', COUNT(*),
    'actions_by_type', jsonb_object_agg(action, action_count),
    'content_types', jsonb_object_agg(content_type, content_type_count),
    'most_active_day', most_active_day,
    'session_count', session_count
  ) INTO analytics_data
  FROM (
    SELECT 
      action,
      COUNT(*) as action_count
    FROM public.user_behavior
    WHERE user_id = p_user_id
      AND timestamp > now() - interval '1 day' * p_days
    GROUP BY action
  ) action_stats
  CROSS JOIN (
    SELECT 
      content_type,
      COUNT(*) as content_type_count
    FROM public.user_behavior
    WHERE user_id = p_user_id
      AND timestamp > now() - interval '1 day' * p_days
    GROUP BY content_type
  ) content_stats
  CROSS JOIN (
    SELECT 
      DATE(timestamp) as most_active_day,
      COUNT(*) as session_count
    FROM public.user_behavior
    WHERE user_id = p_user_id
      AND timestamp > now() - interval '1 day' * p_days
    GROUP BY DATE(timestamp)
    ORDER BY COUNT(*) DESC
    LIMIT 1
  ) session_stats;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', COALESCE(analytics_data, '{}'::jsonb)
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
-- REFERRAL SYSTEM FUNCTIONS
-- ============================================================================

-- Function to create referral code
CREATE OR REPLACE FUNCTION public.create_referral_code(
  p_user_id UUID,
  p_referral_code VARCHAR(50)
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Create referral code
  INSERT INTO public.referral_program (referrer_id, referral_code)
  VALUES (p_user_id, p_referral_code);
  
  -- Update user profile with referral code
  UPDATE public.profiles
  SET referral_code = p_referral_code
  WHERE user_id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Referral code created successfully',
    'referral_code', p_referral_code
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to use referral code
CREATE OR REPLACE FUNCTION public.use_referral_code(
  p_referred_user_id UUID,
  p_referral_code VARCHAR(50)
) RETURNS JSONB AS $$
DECLARE
  referrer_id UUID;
  result JSONB;
BEGIN
  -- Get referrer ID
  SELECT referrer_id INTO referrer_id
  FROM public.referral_program
  WHERE referral_code = p_referral_code
    AND status = 'pending';
  
  IF referrer_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid or expired referral code'
    );
  END IF;
  
  -- Update referral program
  UPDATE public.referral_program
  SET 
    referred_id = p_referred_user_id,
    status = 'completed',
    conversion_date = now()
  WHERE referral_code = p_referral_code;
  
  -- Update referrer's profile
  UPDATE public.profiles
  SET 
    referral_count = referral_count + 1,
    total_referral_rewards = total_referral_rewards + 100 -- Award 100 points
  WHERE user_id = referrer_id;
  
  -- Update referred user's profile
  UPDATE public.profiles
  SET referred_by = referrer_id
  WHERE user_id = p_referred_user_id;
  
  -- Award points to both users
  PERFORM public.add_user_points(referrer_id, 100, 'referral_bonus', 'Referral bonus');
  PERFORM public.add_user_points(p_referred_user_id, 50, 'referral_signup', 'Referral signup bonus');
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Referral code used successfully',
    'referrer_id', referrer_id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get referral stats
CREATE OR REPLACE FUNCTION public.get_referral_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  -- Get referral stats
  SELECT jsonb_build_object(
    'referral_code', p.referral_code,
    'referral_count', p.referral_count,
    'total_referral_rewards', p.total_referral_rewards,
    'referred_by', p.referred_by,
    'successful_referrals', (
      SELECT COUNT(*)
      FROM public.referral_program
      WHERE referrer_id = p_user_id
        AND status = 'completed'
    ),
    'pending_referrals', (
      SELECT COUNT(*)
      FROM public.referral_program
      WHERE referrer_id = p_user_id
        AND status = 'pending'
    )
  ) INTO stats
  FROM public.profiles p
  WHERE p.user_id = p_user_id;
  
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

-- ============================================================================
-- MARKETING CAMPAIGNS FUNCTIONS
-- ============================================================================

-- Function to create marketing campaign
CREATE OR REPLACE FUNCTION public.create_marketing_campaign(
  p_name VARCHAR(255),
  p_description TEXT,
  p_campaign_type VARCHAR(50),
  p_start_date TIMESTAMP WITH TIME ZONE,
  p_end_date TIMESTAMP WITH TIME ZONE,
  p_target_audience JSONB,
  p_campaign_config JSONB,
  p_budget DECIMAL(10,2),
  p_created_by UUID
) RETURNS JSONB AS $$
DECLARE
  new_campaign_id UUID;
  result JSONB;
BEGIN
  -- Create marketing campaign
  INSERT INTO public.marketing_campaigns (
    name, description, campaign_type, start_date, end_date,
    target_audience, campaign_config, budget, created_by
  ) VALUES (
    p_name, p_description, p_campaign_type, p_start_date, p_end_date,
    p_target_audience, p_campaign_config, p_budget, p_created_by
  ) RETURNING id INTO new_campaign_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Marketing campaign created successfully',
    'campaign_id', new_campaign_id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update campaign metrics
CREATE OR REPLACE FUNCTION public.update_campaign_metrics(
  p_campaign_id UUID,
  p_impressions INTEGER DEFAULT 0,
  p_clicks INTEGER DEFAULT 0,
  p_conversions INTEGER DEFAULT 0,
  p_spent DECIMAL(10,2) DEFAULT 0
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Update campaign metrics
  UPDATE public.marketing_campaigns
  SET 
    impressions = impressions + p_impressions,
    clicks = clicks + p_clicks,
    conversions = conversions + p_conversions,
    spent = spent + p_spent,
    conversion_rate = CASE 
      WHEN clicks > 0 THEN conversions::DECIMAL / clicks
      ELSE 0 
    END,
    roi = CASE 
      WHEN spent > 0 THEN (conversions * 100)::DECIMAL / spent
      ELSE 0 
    END,
    updated_at = now()
  WHERE id = p_campaign_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Campaign metrics updated successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get campaign analytics
CREATE OR REPLACE FUNCTION public.get_campaign_analytics(p_campaign_id UUID)
RETURNS JSONB AS $$
DECLARE
  analytics_data JSONB;
BEGIN
  -- Get campaign analytics
  SELECT jsonb_build_object(
    'id', mc.id,
    'name', mc.name,
    'description', mc.description,
    'campaign_type', mc.campaign_type,
    'status', mc.status,
    'start_date', mc.start_date,
    'end_date', mc.end_date,
    'budget', mc.budget,
    'spent', mc.spent,
    'impressions', mc.impressions,
    'clicks', mc.clicks,
    'conversions', mc.conversions,
    'conversion_rate', mc.conversion_rate,
    'roi', mc.roi,
    'created_at', mc.created_at,
    'updated_at', mc.updated_at
  ) INTO analytics_data
  FROM public.marketing_campaigns mc
  WHERE mc.id = p_campaign_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', COALESCE(analytics_data, '{}'::jsonb)
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
-- COMMUNITY ENGAGEMENT FUNCTIONS
-- ============================================================================

-- Function to get community engagement stats
CREATE OR REPLACE FUNCTION public.get_community_engagement_stats()
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  -- Get community engagement stats
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM public.profiles),
    'active_users_today', (
      SELECT COUNT(*) 
      FROM public.profiles 
      WHERE last_active_at > now() - interval '1 day'
    ),
    'total_posts', (SELECT COUNT(*) FROM public.posts),
    'total_comments', (SELECT COUNT(*) FROM public.comments),
    'total_likes', (SELECT COUNT(*) FROM public.likes),
    'total_follows', (SELECT COUNT(*) FROM public.follows),
    'total_points_awarded', (
      SELECT COALESCE(SUM(total_points), 0) 
      FROM public.user_points
    ),
    'top_contributors', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'user_id', cl.user_id,
          'display_name', cl.display_name,
          'total_points', cl.total_points,
          'rank', cl.rank
        ) ORDER BY cl.rank ASC
      )
      FROM public.community_leaderboard cl
      LIMIT 10
    )
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

-- Function to get user engagement score
CREATE OR REPLACE FUNCTION public.get_user_engagement_score(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  engagement_data JSONB;
BEGIN
  -- Get user engagement score
  SELECT jsonb_build_object(
    'user_id', p_user_id,
    'posts_count', (SELECT COUNT(*) FROM public.posts WHERE user_id = p_user_id),
    'comments_count', (SELECT COUNT(*) FROM public.comments WHERE user_id = p_user_id),
    'likes_given', (SELECT COUNT(*) FROM public.likes WHERE user_id = p_user_id),
    'likes_received', (
      SELECT COALESCE(SUM(likes_count), 0) 
      FROM public.posts 
      WHERE user_id = p_user_id
    ),
    'followers_count', (SELECT COUNT(*) FROM public.follows WHERE following_id = p_user_id),
    'following_count', (SELECT COUNT(*) FROM public.follows WHERE follower_id = p_user_id),
    'total_points', (SELECT COALESCE(total_points, 0) FROM public.user_points WHERE user_id = p_user_id),
    'engagement_score', (
      (SELECT COUNT(*) FROM public.posts WHERE user_id = p_user_id) * 10 +
      (SELECT COUNT(*) FROM public.comments WHERE user_id = p_user_id) * 5 +
      (SELECT COUNT(*) FROM public.likes WHERE user_id = p_user_id) * 1 +
      (SELECT COUNT(*) FROM public.follows WHERE following_id = p_user_id) * 3
    )
  ) INTO engagement_data;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', engagement_data
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
