-- Fix Admin Setup Issues - Direct SQL Script
-- Run this script in your Supabase SQL editor to fix admin setup issues

-- ============================================================================
-- ADD MISSING ADMIN SETUP FUNCTION
-- ============================================================================

-- Function to complete super admin setup after user creation
CREATE OR REPLACE FUNCTION public.complete_super_admin_setup(
  p_user_id UUID,
  p_full_name TEXT
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check if any super admin already exists
  IF EXISTS (SELECT 1 FROM public.roles WHERE role = 'super_admin') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Super admin already exists'
    );
  END IF;
  
  -- Update the user's profile with full name
  UPDATE public.profiles
  SET 
    display_name = p_full_name,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Update the user's role to super_admin
  UPDATE public.roles
  SET 
    role = 'super_admin',
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Log the admin setup completion
  PERFORM public.log_admin_action(
    p_user_id,
    'complete_super_admin_setup',
    'user',
    p_user_id,
    jsonb_build_object(
      'full_name', p_full_name,
      'setup_type', 'initial_super_admin'
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Super admin setup completed successfully',
    'user_id', p_user_id
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
-- FIX RLS POLICIES FOR ADMIN SETUP
-- ============================================================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own role" ON public.roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.roles;
DROP POLICY IF EXISTS "Only super admins can update roles" ON public.roles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create new policies that allow admin setup
CREATE POLICY "Users can view own role" ON public.roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.roles
  FOR SELECT USING (public.is_admin());

-- Allow admin setup process to check for existing super admins
CREATE POLICY "Admin setup can check super admin existence" ON public.roles
  FOR SELECT USING (
    -- Allow if no super admin exists (for initial setup)
    NOT EXISTS (SELECT 1 FROM public.roles WHERE role = 'super_admin')
    OR 
    -- Allow if user is authenticated and checking their own role
    auth.uid() = user_id
    OR
    -- Allow if user is admin
    public.is_admin()
  );

-- Only super admins can update roles, but allow initial setup
CREATE POLICY "Only super admins can update roles" ON public.roles
  FOR UPDATE USING (
    public.is_super_admin()
    OR
    -- Allow if no super admin exists (for initial setup)
    NOT EXISTS (SELECT 1 FROM public.roles WHERE role = 'super_admin')
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow admin setup to update profiles during initial setup
CREATE POLICY "Admin setup can update profiles" ON public.profiles
  FOR UPDATE USING (
    -- Allow if no super admin exists (for initial setup)
    NOT EXISTS (SELECT 1 FROM public.roles WHERE role = 'super_admin')
    OR
    -- Allow if user is updating their own profile
    auth.uid() = user_id
    OR
    -- Allow if user is admin
    public.is_admin()
  );

-- ============================================================================
-- ADD HELPER FUNCTION FOR ADMIN SETUP CHECK
-- ============================================================================

-- Function to check if admin setup is required (public access)
CREATE OR REPLACE FUNCTION public.is_admin_setup_required()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if any super admin exists
  RETURN NOT EXISTS (
    SELECT 1 FROM public.roles WHERE role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admin setup status (public access)
CREATE OR REPLACE FUNCTION public.get_admin_setup_status()
RETURNS JSONB AS $$
DECLARE
  super_admin_count INTEGER;
  setup_required BOOLEAN;
BEGIN
  -- Get super admin count
  SELECT COUNT(*) INTO super_admin_count FROM public.roles WHERE role = 'super_admin';
  
  -- Determine if setup is required
  setup_required := super_admin_count = 0;
  
  RETURN jsonb_build_object(
    'setup_required', setup_required,
    'super_admin_count', super_admin_count,
    'has_super_admin', super_admin_count > 0,
    'timestamp', now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANT NECESSARY PERMISSIONS
-- ============================================================================

-- Grant execute permissions on admin setup functions
GRANT EXECUTE ON FUNCTION public.complete_super_admin_setup(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_setup_required() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_setup_status() TO anon, authenticated;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Test the admin setup status
SELECT public.get_admin_setup_status() as admin_setup_status;

-- Check if the function exists
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'complete_super_admin_setup';

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'roles')
ORDER BY tablename, policyname;

-- ============================================================================
-- LOG THE MIGRATION
-- ============================================================================

INSERT INTO public.audit_logs (action, resource_type, details)
VALUES (
  'admin_setup_fixes_applied',
  'system',
  jsonb_build_object(
    'migration_version', '20250101000006',
    'fixes_applied', jsonb_build_object(
      'added_complete_super_admin_setup_function', true,
      'fixed_rls_policies_for_admin_setup', true,
      'added_admin_setup_helper_functions', true,
      'granted_necessary_permissions', true
    ),
    'setup_date', now()
  )
);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'ADMIN SETUP FIXES APPLIED SUCCESSFULLY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Fixed issues:';
  RAISE NOTICE '1. Added missing complete_super_admin_setup function';
  RAISE NOTICE '2. Fixed RLS policies for admin setup process';
  RAISE NOTICE '3. Added helper functions for admin setup status';
  RAISE NOTICE '4. Granted necessary permissions';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Try the admin setup process in your application';
  RAISE NOTICE '2. Check browser console for any remaining errors';
  RAISE NOTICE '3. Verify admin setup completes successfully';
  RAISE NOTICE '========================================';
END $$;
