-- ============================================================================
-- FUNCTIONS AND TRIGGERS - TheGlocal Project
-- ============================================================================
-- This migration handles:
-- - All database triggers for automated actions
-- - Business logic functions
-- - Data validation and constraints
-- - Automated notifications and updates
-- - System maintenance and cleanup
-- Date: 2025-01-01
-- Version: 1.0.0

-- ============================================================================
-- CONTENT MANAGEMENT TRIGGERS
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
-- NEWS SYSTEM TRIGGERS
-- ============================================================================

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

-- ============================================================================
-- COMMUNITY FEATURES TRIGGERS
-- ============================================================================

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
-- NOTIFICATION TRIGGERS
-- ============================================================================

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
-- SECURITY TRIGGERS
-- ============================================================================

-- Function to prevent super admin deletion
CREATE OR REPLACE FUNCTION public.prevent_super_admin_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if trying to delete a super admin role
  IF OLD.role = 'super_admin' THEN
    RAISE EXCEPTION 'Cannot delete super admin role';
  END IF;
  
  -- Check if trying to change the last super admin to a different role
  IF OLD.role = 'super_admin' AND NEW.role != 'super_admin' THEN
    IF (SELECT COUNT(*) FROM public.roles WHERE role = 'super_admin') <= 1 THEN
      RAISE EXCEPTION 'Cannot change the last super admin role';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to prevent super admin deletion
CREATE TRIGGER prevent_super_admin_deletion_trigger
  BEFORE UPDATE OR DELETE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_super_admin_deletion();

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
    user_id, type, title, message, data
  ) VALUES (
    p_user_id, p_type, p_title, p_message, p_data
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(
  p_notification_id UUID,
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check if user can mark notification as read
  IF auth.uid() != p_user_id AND NOT public.is_admin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized to mark notification as read'
    );
  END IF;
  
  -- Mark notification as read
  UPDATE public.notifications
  SET is_read = TRUE
  WHERE id = p_notification_id AND user_id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Notification marked as read'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user notifications
CREATE OR REPLACE FUNCTION public.get_user_notifications(
  p_user_id UUID,
  p_unread_only BOOLEAN DEFAULT FALSE,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) RETURNS JSONB AS $$
DECLARE
  notifications JSONB;
BEGIN
  -- Get user notifications
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', n.id,
      'type', n.type,
      'title', n.title,
      'message', n.message,
      'data', n.data,
      'is_read', n.is_read,
      'created_at', n.created_at
    ) ORDER BY n.created_at DESC
  ) INTO notifications
  FROM public.notifications n
  WHERE n.user_id = p_user_id
    AND (NOT p_unread_only OR n.is_read = FALSE)
  ORDER BY n.created_at DESC
  LIMIT p_limit OFFSET p_offset;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', COALESCE(notifications, '[]'::jsonb),
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
-- DATA VALIDATION FUNCTIONS
-- ============================================================================

-- Function to validate email format
CREATE OR REPLACE FUNCTION public.validate_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to validate username format
CREATE OR REPLACE FUNCTION public.validate_username(username TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN username ~* '^[a-zA-Z0-9_]{3,20}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to validate password strength
CREATE OR REPLACE FUNCTION public.validate_password_strength(password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Password must be at least 8 characters, contain uppercase, lowercase, and number
  RETURN length(password) >= 8 
    AND password ~* '[A-Z]' 
    AND password ~* '[a-z]' 
    AND password ~* '[0-9]';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- SYSTEM MAINTENANCE FUNCTIONS
-- ============================================================================

-- Function to run system maintenance
CREATE OR REPLACE FUNCTION public.run_system_maintenance()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  expired_news_count INTEGER;
  old_notifications_count INTEGER;
  old_audit_logs_count INTEGER;
  old_behavior_count INTEGER;
BEGIN
  -- Clean up expired news cache
  DELETE FROM public.news_cache WHERE expires_at < now();
  GET DIAGNOSTICS expired_news_count = ROW_COUNT;
  
  -- Clean up old notifications
  DELETE FROM public.notifications WHERE created_at < now() - interval '30 days';
  GET DIAGNOSTICS old_notifications_count = ROW_COUNT;
  
  -- Clean up old audit logs
  DELETE FROM public.audit_logs WHERE created_at < now() - interval '1 year';
  GET DIAGNOSTICS old_audit_logs_count = ROW_COUNT;
  
  -- Clean up old user behavior data
  DELETE FROM public.user_behavior WHERE timestamp < now() - interval '6 months';
  GET DIAGNOSTICS old_behavior_count = ROW_COUNT;
  
  -- Update leaderboard ranks
  PERFORM public.refresh_all_leaderboard_ranks();
  
  -- Build result
  result := jsonb_build_object(
    'status', 'completed',
    'timestamp', now(),
    'expired_news_cleaned', expired_news_count,
    'old_notifications_cleaned', old_notifications_count,
    'old_audit_logs_cleaned', old_audit_logs_count,
    'old_behavior_data_cleaned', old_behavior_count,
    'leaderboard_updated', true
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ANALYTICS FUNCTIONS
-- ============================================================================

-- Function to get system analytics
CREATE OR REPLACE FUNCTION public.get_system_analytics(
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  analytics_data JSONB;
BEGIN
  -- Get system analytics
  SELECT jsonb_build_object(
    'users', jsonb_build_object(
      'total', (SELECT COUNT(*) FROM public.profiles),
      'new_users', (
        SELECT COUNT(*) 
        FROM public.profiles 
        WHERE (p_start_date IS NULL OR created_at >= p_start_date)
          AND (p_end_date IS NULL OR created_at <= p_end_date)
      ),
      'active_users', (
        SELECT COUNT(*) 
        FROM public.profiles 
        WHERE last_active_at > now() - interval '7 days'
      )
    ),
    'content', jsonb_build_object(
      'total_posts', (SELECT COUNT(*) FROM public.posts),
      'new_posts', (
        SELECT COUNT(*) 
        FROM public.posts 
        WHERE (p_start_date IS NULL OR created_at >= p_start_date)
          AND (p_end_date IS NULL OR created_at <= p_end_date)
      ),
      'total_comments', (SELECT COUNT(*) FROM public.comments),
      'total_likes', (SELECT COUNT(*) FROM public.likes)
    ),
    'engagement', jsonb_build_object(
      'total_follows', (SELECT COUNT(*) FROM public.follows),
      'total_points_awarded', (
        SELECT COALESCE(SUM(total_points), 0) 
        FROM public.user_points
      ),
      'total_notifications', (SELECT COUNT(*) FROM public.notifications)
    ),
    'revenue', jsonb_build_object(
      'total_payments', (SELECT COUNT(*) FROM public.payments),
      'total_revenue', (
        SELECT COALESCE(SUM(amount), 0) 
        FROM public.payments 
        WHERE status = 'completed'
      ),
      'revenue_period', (
        SELECT COALESCE(SUM(amount), 0) 
        FROM public.payments 
        WHERE status = 'completed'
          AND (p_start_date IS NULL OR created_at >= p_start_date)
          AND (p_end_date IS NULL OR created_at <= p_end_date)
      )
    )
  ) INTO analytics_data;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', analytics_data,
    'start_date', p_start_date,
    'end_date', p_end_date
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
-- SEARCH FUNCTIONS
-- ============================================================================

-- Function to search users
CREATE OR REPLACE FUNCTION public.search_users(
  p_query TEXT,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) RETURNS JSONB AS $$
DECLARE
  search_results JSONB;
BEGIN
  -- Search users
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', p.id,
      'user_id', p.user_id,
      'username', p.username,
      'display_name', p.display_name,
      'bio', p.bio,
      'avatar_url', p.avatar_url,
      'location_city', p.location_city,
      'location_country', p.location_country,
      'is_verified', p.is_verified,
      'is_premium', p.is_premium,
      'created_at', p.created_at
    ) ORDER BY p.created_at DESC
  ) INTO search_results
  FROM public.profiles p
  WHERE (
    p.username ILIKE '%' || p_query || '%'
    OR p.display_name ILIKE '%' || p_query || '%'
    OR p.bio ILIKE '%' || p_query || '%'
  )
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

-- ============================================================================
-- INITIALIZATION FUNCTIONS
-- ============================================================================

-- Function to initialize system settings
CREATE OR REPLACE FUNCTION public.initialize_system_settings()
RETURNS VOID AS $$
BEGIN
  -- Insert default system settings if they don't exist
  INSERT INTO public.system_settings (key, value, description) VALUES
  -- App Configuration
  ('app_name', '"TheGlocal"', 'Application name'),
  ('app_version', '"1.0.0"', 'Current application version'),
  ('app_description', '"A local community platform connecting people through events, services, and news"', 'Application description'),
  
  -- Feature Flags
  ('enable_user_registration', 'true', 'Allow new user registration'),
  ('enable_news_system', 'true', 'Enable news aggregation system'),
  ('enable_monetization', 'true', 'Enable premium features and payments'),
  ('enable_community_features', 'true', 'Enable points and leaderboard system'),
  ('enable_service_marketplace', 'true', 'Enable service booking system'),
  
  -- Content Moderation
  ('auto_moderate_posts', 'false', 'Automatically moderate new posts'),
  ('require_verification_for_services', 'true', 'Require verification for service providers'),
  ('max_posts_per_day', '10', 'Maximum posts a user can create per day'),
  ('max_services_per_user', '5', 'Maximum services a user can offer'),
  
  -- Monetization Settings
  ('verification_price', '999', 'Price for user verification in cents'),
  ('premium_monthly_price', '2999', 'Monthly premium subscription price in cents'),
  ('featured_event_price', '1999', 'Price to feature an event for 7 days in cents'),
  ('service_commission_rate', '0.05', 'Platform commission rate for services (5%)'),
  
  -- News System Settings
  ('news_cache_duration', '900', 'News cache duration in seconds (15 minutes)'),
  ('news_trending_decay_rate', '0.08', 'Time decay rate for trending algorithm'),
  ('news_locality_boost_city', '0.2', 'Locality boost for same city (20%)'),
  ('news_locality_boost_country', '0.1', 'Locality boost for same country (10%)'),
  
  -- Community Settings
  ('points_for_post', '10', 'Points awarded for creating a post'),
  ('points_for_comment', '5', 'Points awarded for commenting'),
  ('points_for_like', '1', 'Points awarded for liking content'),
  ('points_for_follow', '3', 'Points awarded for following a user'),
  ('leaderboard_update_interval', '3600', 'Leaderboard update interval in seconds'),
  
  -- Security Settings
  ('max_login_attempts', '5', 'Maximum login attempts before lockout'),
  ('session_timeout', '3600', 'Session timeout in seconds'),
  ('enable_audit_logging', 'true', 'Enable audit logging for admin actions'),
  ('require_email_verification', 'true', 'Require email verification for new users'),
  
  -- Notification Settings
  ('enable_email_notifications', 'true', 'Enable email notifications'),
  ('enable_push_notifications', 'true', 'Enable push notifications'),
  ('notification_retention_days', '30', 'Days to retain notifications'),
  
  -- Performance Settings
  ('enable_caching', 'true', 'Enable application caching'),
  ('cache_ttl', '300', 'Default cache TTL in seconds'),
  ('max_file_upload_size', '10485760', 'Maximum file upload size in bytes (10MB)'),
  ('enable_compression', 'true', 'Enable response compression')
  ON CONFLICT (key) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to initialize interests
CREATE OR REPLACE FUNCTION public.initialize_interests()
RETURNS VOID AS $$
BEGIN
  -- Insert default interests if they don't exist
  INSERT INTO public.interests (name, description, icon, category) VALUES
  -- Technology
  ('Technology', 'Latest tech news and innovations', '💻', 'technology'),
  ('Programming', 'Software development and coding', '👨‍💻', 'technology'),
  ('AI & Machine Learning', 'Artificial intelligence and ML', '🤖', 'technology'),
  ('Mobile Apps', 'Mobile application development', '📱', 'technology'),
  ('Web Development', 'Frontend and backend development', '🌐', 'technology'),
  
  -- Business & Finance
  ('Business', 'Business news and entrepreneurship', '💼', 'business'),
  ('Finance', 'Financial markets and investments', '💰', 'business'),
  ('Startups', 'Startup ecosystem and funding', '🚀', 'business'),
  ('Marketing', 'Digital marketing and advertising', '📈', 'business'),
  ('E-commerce', 'Online business and retail', '🛒', 'business'),
  
  -- Arts & Culture
  ('Art', 'Visual arts and creativity', '🎨', 'arts'),
  ('Music', 'Music production and performance', '🎵', 'arts'),
  ('Photography', 'Photography and visual storytelling', '📸', 'arts'),
  ('Design', 'Graphic and UI/UX design', '🎨', 'arts'),
  ('Writing', 'Creative writing and content creation', '✍️', 'arts'),
  
  -- Entertainment
  ('Movies', 'Film and cinema', '🎬', 'entertainment'),
  ('Gaming', 'Video games and esports', '🎮', 'entertainment'),
  ('Sports', 'Sports news and events', '⚽', 'entertainment'),
  ('Comedy', 'Stand-up comedy and humor', '😂', 'entertainment'),
  ('Streaming', 'Online streaming and content', '📺', 'entertainment'),
  
  -- Lifestyle
  ('Fashion', 'Fashion and style trends', '👗', 'lifestyle'),
  ('Food', 'Culinary arts and dining', '🍕', 'lifestyle'),
  ('Travel', 'Travel and tourism', '✈️', 'lifestyle'),
  ('Fitness', 'Health and fitness', '💪', 'lifestyle'),
  ('Beauty', 'Beauty and skincare', '💄', 'lifestyle'),
  
  -- Education
  ('Education', 'Learning and academic topics', '📚', 'education'),
  ('Science', 'Scientific research and discoveries', '🔬', 'education'),
  ('History', 'Historical events and culture', '📜', 'education'),
  ('Language', 'Language learning and linguistics', '🗣️', 'education'),
  ('Online Learning', 'E-learning and courses', '💻', 'education'),
  
  -- Community
  ('Local Events', 'Community events and gatherings', '🎪', 'community'),
  ('Volunteering', 'Community service and charity', '🤝', 'community'),
  ('Networking', 'Professional networking', '🤝', 'community'),
  ('Meetups', 'Local meetups and groups', '👥', 'community'),
  ('Social Causes', 'Social activism and causes', '🌍', 'community'),
  
  -- Health & Wellness
  ('Mental Health', 'Mental wellness and therapy', '🧠', 'health'),
  ('Physical Health', 'Physical fitness and medical', '🏥', 'health'),
  ('Nutrition', 'Healthy eating and diet', '🥗', 'health'),
  ('Meditation', 'Mindfulness and meditation', '🧘', 'health'),
  ('Alternative Medicine', 'Holistic health approaches', '🌿', 'health'),
  
  -- Environment
  ('Sustainability', 'Environmental sustainability', '🌱', 'environment'),
  ('Climate Change', 'Climate action and awareness', '🌍', 'environment'),
  ('Renewable Energy', 'Clean energy solutions', '⚡', 'environment'),
  ('Conservation', 'Wildlife and nature conservation', '🦋', 'environment'),
  ('Green Living', 'Eco-friendly lifestyle', '♻️', 'environment')
  ON CONFLICT (name) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMPLETION AND VERIFICATION
-- ============================================================================

-- Function to verify admin setup completion
CREATE OR REPLACE FUNCTION public.verify_admin_setup()
RETURNS JSONB AS $$
DECLARE
  setup_status JSONB;
  super_admin_count INTEGER;
  system_settings_count INTEGER;
  interests_count INTEGER;
BEGIN
  -- Get counts
  SELECT COUNT(*) INTO super_admin_count FROM public.roles WHERE role = 'super_admin';
  SELECT COUNT(*) INTO system_settings_count FROM public.system_settings;
  SELECT COUNT(*) INTO interests_count FROM public.interests;
  
  -- Build setup status
  setup_status := jsonb_build_object(
    'setup_complete', super_admin_count > 0,
    'super_admin_exists', super_admin_count > 0,
    'super_admin_count', super_admin_count,
    'system_settings_configured', system_settings_count > 0,
    'interests_configured', interests_count > 0,
    'database_ready', true,
    'timestamp', now()
  );
  
  RETURN setup_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Initialize system settings and interests
SELECT public.initialize_system_settings();
SELECT public.initialize_interests();

-- Log the completion of database setup
INSERT INTO public.audit_logs (action, resource_type, details)
VALUES (
  'database_setup_completed',
  'system',
  jsonb_build_object(
    'migration_version', '20250101000008',
    'setup_date', now(),
    'interests_created', (SELECT COUNT(*) FROM public.interests),
    'settings_created', (SELECT COUNT(*) FROM public.system_settings)
  )
);

-- Verify setup
SELECT public.verify_database_setup();

-- Display system health
SELECT public.get_system_health();
