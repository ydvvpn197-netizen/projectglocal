-- Database Functions and Triggers for TheGlocal Project
-- This migration creates all necessary functions, triggers, and business logic
-- Date: 2025-01-01
-- Description: Functions for RBAC, content management, news system, monetization, and community features

-- ============================================================================
-- RBAC AND USER MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function to automatically assign user role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  INSERT INTO public.profiles (user_id, username, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'display_name');
  
  INSERT INTO public.user_points (user_id, total_points)
  VALUES (NEW.id, 0);
  
  INSERT INTO public.community_leaderboard (user_id, total_points)
  VALUES (NEW.id, 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to handle new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS public.user_role AS $$
BEGIN
  RETURN (
    SELECT role FROM public.roles WHERE user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION public.has_permission(user_uuid UUID, required_role public.user_role)
RETURNS BOOLEAN AS $$
DECLARE
  user_role public.user_role;
  role_hierarchy INTEGER;
  required_hierarchy INTEGER;
BEGIN
  user_role := public.get_user_role(user_uuid);
  
  -- Define role hierarchy (higher number = more permissions)
  role_hierarchy := CASE user_role
    WHEN 'user' THEN 0
    WHEN 'moderator' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'super_admin' THEN 3
  END;
  
  required_hierarchy := CASE required_role
    WHEN 'user' THEN 0
    WHEN 'moderator' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'super_admin' THEN 3
  END;
  
  RETURN role_hierarchy >= required_hierarchy;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CONTENT MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function to update post counts
CREATE OR REPLACE FUNCTION public.update_post_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update likes count
    IF TG_TABLE_NAME = 'likes' THEN
      UPDATE public.posts 
      SET likes_count = likes_count + 1 
      WHERE id = NEW.post_id;
    END IF;
    
    -- Update comments count
    IF TG_TABLE_NAME = 'comments' THEN
      UPDATE public.posts 
      SET comments_count = comments_count + 1 
      WHERE id = NEW.post_id;
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update likes count
    IF TG_TABLE_NAME = 'likes' THEN
      UPDATE public.posts 
      SET likes_count = GREATEST(likes_count - 1, 0) 
      WHERE id = OLD.post_id;
    END IF;
    
    -- Update comments count
    IF TG_TABLE_NAME = 'comments' THEN
      UPDATE public.posts 
      SET comments_count = GREATEST(comments_count - 1, 0) 
      WHERE id = OLD.post_id;
    END IF;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for post counts
CREATE TRIGGER update_post_likes_count
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.update_post_counts();

CREATE TRIGGER update_post_comments_count
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_post_counts();

-- Function to update comment likes count
CREATE OR REPLACE FUNCTION public.update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.comments 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.comments 
    SET likes_count = GREATEST(likes_count - 1, 0) 
    WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for comment likes count
CREATE TRIGGER update_comment_likes_count_trigger
  AFTER INSERT OR DELETE ON public.comment_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_comment_likes_count();

-- ============================================================================
-- NEWS SYSTEM FUNCTIONS
-- ============================================================================

-- Function to generate SHA-256 hash for article ID
CREATE OR REPLACE FUNCTION public.generate_article_id(url TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(digest(url, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update news interaction counts
CREATE OR REPLACE FUNCTION public.update_news_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update news likes count
    IF TG_TABLE_NAME = 'news_likes' THEN
      UPDATE public.news_cache 
      SET metadata = COALESCE(metadata, '{}'::jsonb) || 
          jsonb_build_object('likes_count', 
            COALESCE((metadata->>'likes_count')::integer, 0) + 1)
      WHERE article_id = NEW.article_id;
    END IF;
    
    -- Update news comments count
    IF TG_TABLE_NAME = 'news_comments' THEN
      UPDATE public.news_cache 
      SET metadata = COALESCE(metadata, '{}'::jsonb) || 
          jsonb_build_object('comments_count', 
            COALESCE((metadata->>'comments_count')::integer, 0) + 1)
      WHERE article_id = NEW.article_id;
    END IF;
    
    -- Update news shares count
    IF TG_TABLE_NAME = 'news_shares' THEN
      UPDATE public.news_cache 
      SET metadata = COALESCE(metadata, '{}'::jsonb) || 
          jsonb_build_object('shares_count', 
            COALESCE((metadata->>'shares_count')::integer, 0) + 1)
      WHERE article_id = NEW.article_id;
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update news likes count
    IF TG_TABLE_NAME = 'news_likes' THEN
      UPDATE public.news_cache 
      SET metadata = COALESCE(metadata, '{}'::jsonb) || 
          jsonb_build_object('likes_count', 
            GREATEST(COALESCE((metadata->>'likes_count')::integer, 0) - 1, 0))
      WHERE article_id = OLD.article_id;
    END IF;
    
    -- Update news comments count
    IF TG_TABLE_NAME = 'news_comments' THEN
      UPDATE public.news_cache 
      SET metadata = COALESCE(metadata, '{}'::jsonb) || 
          jsonb_build_object('comments_count', 
            GREATEST(COALESCE((metadata->>'comments_count')::integer, 0) - 1, 0))
      WHERE article_id = OLD.article_id;
    END IF;
    
    -- Update news shares count
    IF TG_TABLE_NAME = 'news_shares' THEN
      UPDATE public.news_cache 
      SET metadata = COALESCE(metadata, '{}'::jsonb) || 
          jsonb_build_object('shares_count', 
            GREATEST(COALESCE((metadata->>'shares_count')::integer, 0) - 1, 0))
      WHERE article_id = OLD.article_id;
    END IF;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for news interaction counts
CREATE TRIGGER update_news_likes_count
  AFTER INSERT OR DELETE ON public.news_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_news_counts();

CREATE TRIGGER update_news_comments_count
  AFTER INSERT OR DELETE ON public.news_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_news_counts();

CREATE TRIGGER update_news_shares_count
  AFTER INSERT OR DELETE ON public.news_shares
  FOR EACH ROW EXECUTE FUNCTION public.update_news_counts();

-- Function to calculate trending score for news
CREATE OR REPLACE FUNCTION public.calculate_trending_score(article_id TEXT, user_city TEXT DEFAULT NULL, user_country TEXT DEFAULT NULL)
RETURNS DECIMAL AS $$
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
  WHERE news_cache.article_id = calculate_trending_score.article_id;
  
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
  IF user_city IS NOT NULL AND article_data.city = user_city THEN
    locality_boost := 1.2; -- +20% for same city
  ELSIF user_country IS NOT NULL AND article_data.country = user_country THEN
    locality_boost := 1.1; -- +10% for same country
  END IF;
  
  -- Calculate trending score
  trending_score := (likes_count + (2 * comments_count) + (1.5 * shares_count) + votes_count) * time_decay * locality_boost;
  
  RETURN trending_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMUNITY FEATURES FUNCTIONS
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

-- Function to award points for user actions
CREATE OR REPLACE FUNCTION public.award_points_for_action()
RETURNS TRIGGER AS $$
DECLARE
  points_to_award INTEGER := 0;
  action_type TEXT;
BEGIN
  -- Determine action type and points
  IF TG_TABLE_NAME = 'posts' AND TG_OP = 'INSERT' THEN
    action_type := 'create_post';
    points_to_award := 10;
  ELSIF TG_TABLE_NAME = 'comments' AND TG_OP = 'INSERT' THEN
    action_type := 'create_comment';
    points_to_award := 5;
  ELSIF TG_TABLE_NAME = 'likes' AND TG_OP = 'INSERT' THEN
    action_type := 'like_content';
    points_to_award := 1;
  ELSIF TG_TABLE_NAME = 'follows' AND TG_OP = 'INSERT' THEN
    action_type := 'follow_user';
    points_to_award := 3;
  END IF;
  
  -- Award points if applicable
  IF points_to_award > 0 THEN
    PERFORM public.add_user_points(
      NEW.user_id,
      points_to_award,
      action_type,
      'Points awarded for ' || action_type
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for awarding points
CREATE TRIGGER award_points_for_post
  AFTER INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.award_points_for_action();

CREATE TRIGGER award_points_for_comment
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.award_points_for_action();

CREATE TRIGGER award_points_for_like
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.award_points_for_action();

CREATE TRIGGER award_points_for_follow
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.award_points_for_action();

-- ============================================================================
-- MONETIZATION FUNCTIONS
-- ============================================================================

-- Function to handle successful payment
CREATE OR REPLACE FUNCTION public.handle_successful_payment(
  p_user_id UUID,
  p_payment_type TEXT,
  p_amount INTEGER,
  p_stripe_payment_intent_id TEXT,
  p_related_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  -- Insert payment record
  INSERT INTO public.payments (
    user_id,
    stripe_payment_intent_id,
    amount,
    status,
    payment_type,
    related_id
  ) VALUES (
    p_user_id,
    p_stripe_payment_intent_id,
    p_amount,
    'completed',
    p_payment_type,
    p_related_id
  );
  
  -- Handle different payment types
  IF p_payment_type = 'verification' THEN
    UPDATE public.profiles 
    SET 
      is_verified = TRUE,
      verification_expires_at = now() + interval '1 year',
      plan_type = 'verified'
    WHERE user_id = p_user_id;
    
  ELSIF p_payment_type = 'premium' THEN
    UPDATE public.profiles 
    SET 
      is_premium = TRUE,
      premium_expires_at = now() + interval '1 year',
      plan_type = 'premium'
    WHERE user_id = p_user_id;
    
  ELSIF p_payment_type = 'featured_event' AND p_related_id IS NOT NULL THEN
    UPDATE public.posts 
    SET 
      is_featured = TRUE,
      featured_until = now() + interval '7 days',
      stripe_payment_intent_id = p_stripe_payment_intent_id
    WHERE id = p_related_id AND user_id = p_user_id;
    
  ELSIF p_payment_type = 'service' AND p_related_id IS NOT NULL THEN
    UPDATE public.service_bookings 
    SET 
      status = 'confirmed',
      stripe_payment_intent_id = p_stripe_payment_intent_id
    WHERE id = p_related_id AND customer_id = p_user_id;
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- AUDIT AND LOGGING FUNCTIONS
-- ============================================================================

-- Function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_admin_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    admin_user_id,
    action,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent
  ) VALUES (
    p_admin_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_details,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- NOTIFICATION FUNCTIONS
-- ============================================================================

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type notification_type,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    data
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_data
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notifications for interactions
CREATE OR REPLACE FUNCTION public.create_interaction_notifications()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id UUID;
  comment_owner_id UUID;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- Handle likes
  IF TG_TABLE_NAME = 'likes' AND TG_OP = 'INSERT' THEN
    SELECT user_id INTO post_owner_id FROM public.posts WHERE id = NEW.post_id;
    
    IF post_owner_id != NEW.user_id THEN
      notification_title := 'New Like';
      notification_message := 'Someone liked your post';
      
      PERFORM public.create_notification(
        post_owner_id,
        'like',
        notification_title,
        notification_message,
        jsonb_build_object('post_id', NEW.post_id, 'liker_id', NEW.user_id)
      );
    END IF;
    
  -- Handle comments
  ELSIF TG_TABLE_NAME = 'comments' AND TG_OP = 'INSERT' THEN
    SELECT user_id INTO post_owner_id FROM public.posts WHERE id = NEW.post_id;
    
    IF post_owner_id != NEW.user_id THEN
      notification_title := 'New Comment';
      notification_message := 'Someone commented on your post';
      
      PERFORM public.create_notification(
        post_owner_id,
        'comment',
        notification_title,
        notification_message,
        jsonb_build_object('post_id', NEW.post_id, 'comment_id', NEW.id, 'commenter_id', NEW.user_id)
      );
    END IF;
    
  -- Handle follows
  ELSIF TG_TABLE_NAME = 'follows' AND TG_OP = 'INSERT' THEN
    notification_title := 'New Follower';
    notification_message := 'Someone started following you';
    
    PERFORM public.create_notification(
      NEW.following_id,
      'follow',
      notification_title,
      notification_message,
      jsonb_build_object('follower_id', NEW.follower_id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for interaction notifications
CREATE TRIGGER create_like_notification
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.create_interaction_notifications();

CREATE TRIGGER create_comment_notification
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.create_interaction_notifications();

CREATE TRIGGER create_follow_notification
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.create_interaction_notifications();

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to clean up expired data
CREATE OR REPLACE FUNCTION public.cleanup_expired_data() RETURNS VOID AS $$
BEGIN
  -- Clean up expired news cache
  DELETE FROM public.news_cache WHERE expires_at < now();
  
  -- Clean up old notifications (older than 30 days)
  DELETE FROM public.notifications WHERE created_at < now() - interval '30 days';
  
  -- Clean up old audit logs (older than 1 year)
  DELETE FROM public.audit_logs WHERE created_at < now() - interval '1 year';
  
  -- Clean up old user behavior data (older than 6 months)
  DELETE FROM public.user_behavior WHERE timestamp < now() - interval '6 months';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user last active timestamp
CREATE OR REPLACE FUNCTION public.update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles 
  SET last_active_at = now() 
  WHERE user_id = auth.uid();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update last active on any user action
CREATE TRIGGER update_last_active_on_action
  AFTER INSERT OR UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_user_last_active();
