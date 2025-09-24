-- Initial Data and Setup for TheGlocal Project
-- This migration creates initial data, sample content, and system setup
-- Date: 2025-01-01
-- Description: Initial data for interests, system settings, and sample content

-- ============================================================================
-- INITIAL INTERESTS DATA
-- ============================================================================

-- Insert default interests
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
('Green Living', 'Eco-friendly lifestyle', '♻️', 'environment');

-- ============================================================================
-- SYSTEM SETTINGS
-- ============================================================================

-- Insert default system settings
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
('enable_compression', 'true', 'Enable response compression');

-- ============================================================================
-- SAMPLE CONTENT (OPTIONAL - FOR TESTING)
-- ============================================================================

-- Note: Sample content will be created when users are present
-- This section can be uncommented for testing purposes

/*
-- Sample posts (will be created after users exist)
INSERT INTO public.posts (user_id, type, title, content, status, location_city, location_state, location_country, tags) VALUES
-- These will be populated after user creation
*/

-- ============================================================================
-- CREATE SUPER ADMIN USER (IF NOT EXISTS)
-- ============================================================================

-- Function to create super admin if no super admin exists
CREATE OR REPLACE FUNCTION public.ensure_super_admin_exists()
RETURNS VOID AS $$
DECLARE
  super_admin_count INTEGER;
BEGIN
  -- Check if any super admin exists
  SELECT COUNT(*) INTO super_admin_count
  FROM public.roles
  WHERE role = 'super_admin';
  
  -- If no super admin exists, create one
  IF super_admin_count = 0 THEN
    -- This will be handled by the application when the first admin is created
    -- through the admin setup process
    RAISE NOTICE 'No super admin found. Please use the admin setup process to create the first super admin.';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SETUP COMPLETION FUNCTIONS
-- ============================================================================

-- Function to verify database setup
CREATE OR REPLACE FUNCTION public.verify_database_setup()
RETURNS TABLE(
  table_name TEXT,
  row_count BIGINT,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'profiles'::TEXT,
    (SELECT COUNT(*) FROM public.profiles),
    CASE WHEN (SELECT COUNT(*) FROM public.profiles) >= 0 THEN 'OK' ELSE 'ERROR' END::TEXT
  UNION ALL
  SELECT 
    'roles'::TEXT,
    (SELECT COUNT(*) FROM public.roles),
    CASE WHEN (SELECT COUNT(*) FROM public.roles) >= 0 THEN 'OK' ELSE 'ERROR' END::TEXT
  UNION ALL
  SELECT 
    'interests'::TEXT,
    (SELECT COUNT(*) FROM public.interests),
    CASE WHEN (SELECT COUNT(*) FROM public.interests) > 0 THEN 'OK' ELSE 'ERROR' END::TEXT
  UNION ALL
  SELECT 
    'system_settings'::TEXT,
    (SELECT COUNT(*) FROM public.system_settings),
    CASE WHEN (SELECT COUNT(*) FROM public.system_settings) > 0 THEN 'OK' ELSE 'ERROR' END::TEXT
  UNION ALL
  SELECT 
    'posts'::TEXT,
    (SELECT COUNT(*) FROM public.posts),
    CASE WHEN (SELECT COUNT(*) FROM public.posts) >= 0 THEN 'OK' ELSE 'ERROR' END::TEXT
  UNION ALL
  SELECT 
    'news_cache'::TEXT,
    (SELECT COUNT(*) FROM public.news_cache),
    CASE WHEN (SELECT COUNT(*) FROM public.news_cache) >= 0 THEN 'OK' ELSE 'ERROR' END::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get system health status
CREATE OR REPLACE FUNCTION public.get_system_health()
RETURNS JSONB AS $$
DECLARE
  health_status JSONB;
  table_counts JSONB;
  settings_count INTEGER;
  interests_count INTEGER;
BEGIN
  -- Get table counts
  SELECT jsonb_object_agg(table_name, row_count) INTO table_counts
  FROM public.verify_database_setup();
  
  -- Get counts
  SELECT COUNT(*) INTO settings_count FROM public.system_settings;
  SELECT COUNT(*) INTO interests_count FROM public.interests;
  
  -- Build health status
  health_status := jsonb_build_object(
    'status', 'healthy',
    'timestamp', now(),
    'database_tables', table_counts,
    'system_settings_count', settings_count,
    'interests_count', interests_count,
    'version', '1.0.0'
  );
  
  RETURN health_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- MAINTENANCE FUNCTIONS
-- ============================================================================

-- Function to clean up expired data (run periodically)
CREATE OR REPLACE FUNCTION public.run_maintenance()
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
-- INITIALIZATION COMPLETE
-- ============================================================================

-- Log the completion of database setup
INSERT INTO public.audit_logs (action, resource_type, details)
VALUES (
  'database_setup_completed',
  'system',
  jsonb_build_object(
    'migration_version', '20250101000004',
    'setup_date', now(),
    'interests_created', (SELECT COUNT(*) FROM public.interests),
    'settings_created', (SELECT COUNT(*) FROM public.system_settings)
  )
);

-- Verify setup
SELECT public.verify_database_setup();

-- Display system health
SELECT public.get_system_health();
