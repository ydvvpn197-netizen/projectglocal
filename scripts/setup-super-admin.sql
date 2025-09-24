-- Super Admin Setup Script
-- This script helps create the first super admin user
-- Run this after the database migrations are complete

-- ============================================================================
-- SUPER ADMIN CREATION SCRIPT
-- ============================================================================

-- Step 1: Check if super admin already exists
DO $$
DECLARE
  super_admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO super_admin_count
  FROM public.roles
  WHERE role = 'super_admin';
  
  IF super_admin_count > 0 THEN
    RAISE NOTICE 'Super admin already exists. Count: %', super_admin_count;
  ELSE
    RAISE NOTICE 'No super admin found. Please create one through the application.';
  END IF;
END $$;

-- Step 2: Verify system setup
SELECT public.verify_admin_setup();

-- Step 3: Check system health
SELECT public.get_system_health();

-- Step 4: Display available functions for admin setup
SELECT 
  'Available Admin Functions:' as info
UNION ALL
SELECT '1. public.create_super_admin(email, password, display_name, username)' as info
UNION ALL
SELECT '2. public.promote_to_super_admin(user_id, admin_user_id)' as info
UNION ALL
SELECT '3. public.get_admin_dashboard_stats()' as info
UNION ALL
SELECT '4. public.get_recent_admin_activity(limit)' as info
UNION ALL
SELECT '5. public.verify_admin_setup()' as info;

-- ============================================================================
-- MANUAL SUPER ADMIN CREATION (IF NEEDED)
-- ============================================================================

-- Uncomment and modify the following section if you need to manually create a super admin
-- Replace the values with your actual data

/*
-- Example: Create super admin (this will be handled by the application)
-- The actual user creation should be done through Supabase Auth
-- This is just for reference

-- After creating a user through Supabase Auth, you can promote them to super admin:

-- Example: Promote user to super admin (replace with actual user ID)
-- SELECT public.promote_to_super_admin(
--   'your-user-id-here'::UUID,
--   'your-user-id-here'::UUID
-- );
*/

-- ============================================================================
-- SYSTEM VERIFICATION
-- ============================================================================

-- Verify all tables exist and have proper structure
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'profiles', 'roles', 'interests', 'user_interests', 'user_preferences',
    'posts', 'services', 'service_bookings', 'follows', 'likes', 'comments',
    'news_cache', 'news_likes', 'news_comments', 'news_shares', 'news_polls',
    'user_points', 'point_transactions', 'community_leaderboard', 'user_behavior',
    'payments', 'subscriptions', 'audit_logs', 'system_settings', 'notifications'
  )
ORDER BY tablename;

-- Verify RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'profiles', 'roles', 'interests', 'user_interests', 'user_preferences',
    'posts', 'services', 'service_bookings', 'follows', 'likes', 'comments',
    'news_cache', 'news_likes', 'news_comments', 'news_shares', 'news_polls',
    'user_points', 'point_transactions', 'community_leaderboard', 'user_behavior',
    'payments', 'subscriptions', 'audit_logs', 'system_settings', 'notifications'
  )
ORDER BY tablename;

-- Verify functions exist
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'handle_new_user', 'get_user_role', 'has_permission', 'is_authenticated',
    'is_admin', 'is_super_admin', 'is_moderator', 'add_user_points',
    'update_leaderboard_rank', 'create_super_admin', 'promote_to_super_admin',
    'get_admin_dashboard_stats', 'verify_admin_setup', 'get_system_health'
  )
ORDER BY routine_name;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SUPER ADMIN SETUP SCRIPT COMPLETED';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Use the application to create your first user account';
  RAISE NOTICE '2. Use the admin setup page to promote the user to super admin';
  RAISE NOTICE '3. Verify the setup using: SELECT public.verify_admin_setup();';
  RAISE NOTICE '4. Check system health using: SELECT public.get_system_health();';
  RAISE NOTICE '========================================';
END $$;