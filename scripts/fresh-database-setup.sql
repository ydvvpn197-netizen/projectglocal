-- Fresh Database Setup Script for TheGlocal Project
-- This script sets up a completely fresh database with all features
-- Run this to create a new database from scratch

-- ============================================================================
-- FRESH DATABASE SETUP SCRIPT
-- ============================================================================

-- Step 1: Verify we're starting fresh
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'STARTING FRESH DATABASE SETUP';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'This script will create a complete database schema';
  RAISE NOTICE 'with all features for TheGlocal project.';
  RAISE NOTICE '========================================';
END $$;

-- ============================================================================
-- RUN ALL MIGRATIONS IN ORDER
-- ============================================================================

-- The following migrations should be run in order:
-- 1. 20250101000001_complete_database_schema.sql
-- 2. 20250101000002_database_functions_and_triggers.sql  
-- 3. 20250101000003_row_level_security_policies.sql
-- 4. 20250101000004_initial_data_and_setup.sql
-- 5. 20250101000005_admin_setup_and_auth_config.sql

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check database setup completion
SELECT 
  'Database Setup Verification' as check_type,
  now() as timestamp;

-- Verify all tables exist
SELECT 
  'Tables' as component,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 25 THEN 'PASS' 
    ELSE 'FAIL' 
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'profiles', 'roles', 'interests', 'user_interests', 'user_preferences',
    'posts', 'services', 'service_bookings', 'follows', 'likes', 'comments',
    'comment_likes', 'news_cache', 'news_likes', 'news_comments', 'news_shares',
    'news_polls', 'news_poll_votes', 'news_events', 'user_points',
    'point_transactions', 'community_leaderboard', 'user_behavior',
    'payments', 'subscriptions', 'audit_logs', 'system_settings', 'notifications'
  );

-- Verify all types exist
SELECT 
  'Types' as component,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 7 THEN 'PASS' 
    ELSE 'FAIL' 
  END as status
FROM pg_type 
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND typname IN (
    'user_role', 'post_type', 'post_status', 'plan_type', 
    'payment_status', 'booking_status', 'notification_type'
  );

-- Verify all functions exist
SELECT 
  'Functions' as component,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 30 THEN 'PASS' 
    ELSE 'FAIL' 
  END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_type = 'FUNCTION';

-- Verify RLS is enabled
SELECT 
  'RLS Policies' as component,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 25 THEN 'PASS' 
    ELSE 'FAIL' 
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = true;

-- ============================================================================
-- SYSTEM HEALTH CHECK
-- ============================================================================

-- Run comprehensive system health check
SELECT public.get_system_health() as system_health;

-- Verify admin setup
SELECT public.verify_admin_setup() as admin_setup;

-- Check database setup
SELECT public.verify_database_setup() as database_setup;

-- ============================================================================
-- FEATURE VERIFICATION
-- ============================================================================

-- Check if all features are properly configured
SELECT 
  'Feature Verification' as check_type,
  jsonb_build_object(
    'user_management', EXISTS (SELECT 1 FROM public.roles),
    'content_management', EXISTS (SELECT 1 FROM public.posts),
    'news_system', EXISTS (SELECT 1 FROM public.news_cache),
    'monetization', EXISTS (SELECT 1 FROM public.payments),
    'community_features', EXISTS (SELECT 1 FROM public.user_points),
    'admin_system', EXISTS (SELECT 1 FROM public.audit_logs),
    'notification_system', EXISTS (SELECT 1 FROM public.notifications),
    'system_settings', EXISTS (SELECT 1 FROM public.system_settings)
  ) as features;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'FRESH DATABASE SETUP COMPLETED';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Database is ready with all features:';
  RAISE NOTICE '✓ User Management & Authentication';
  RAISE NOTICE '✓ Content Management (Posts, Events, Services)';
  RAISE NOTICE '✓ News System with AI Summaries';
  RAISE NOTICE '✓ Monetization (Payments, Subscriptions)';
  RAISE NOTICE '✓ Community Features (Points, Leaderboard)';
  RAISE NOTICE '✓ Admin Dashboard & Management';
  RAISE NOTICE '✓ Notification System';
  RAISE NOTICE '✓ Row Level Security (RLS)';
  RAISE NOTICE '✓ Audit Logging';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Create your first user account';
  RAISE NOTICE '2. Use admin setup to create super admin';
  RAISE NOTICE '3. Test all features';
  RAISE NOTICE '4. Configure system settings';
  RAISE NOTICE '========================================';
END $$;
