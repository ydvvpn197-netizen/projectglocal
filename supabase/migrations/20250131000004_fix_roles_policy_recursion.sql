-- ============================================================
-- Clean, non-recursive roles table RLS migration
-- ============================================================

-- Drop only the helper functions; keep wrappers (avoids dependency errors)
DROP FUNCTION IF EXISTS public.get_user_role(uuid);
DROP FUNCTION IF EXISTS public.is_user_admin(uuid);
DROP FUNCTION IF EXISTS public.is_user_super_admin(uuid);

-- Drop conflicting policies on public.roles
DROP POLICY IF EXISTS "Users can view own role" ON public.roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.roles;
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.roles;
DROP POLICY IF EXISTS "Only super admins can update roles" ON public.roles;
DROP POLICY IF EXISTS "Only super admins can delete roles" ON public.roles;
DROP POLICY IF EXISTS "System can insert roles" ON public.roles;
DROP POLICY IF EXISTS "Admin setup can check super admin existence" ON public.roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.roles;
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.roles;

-- Make sure RLS is enabled
ALTER TABLE IF EXISTS public.roles ENABLE ROW LEVEL SECURITY;

-- ============================
-- Create helper functions
-- ============================

CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid DEFAULT NULL)
RETURNS text AS $$
DECLARE
  uid uuid := COALESCE(user_uuid, auth.uid()::uuid);
  user_role text;
BEGIN
  SELECT r.role
  INTO user_role
  FROM public.roles r
  WHERE r.user_id = uid
  LIMIT 1;

  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_user_admin(user_uuid uuid DEFAULT NULL)
RETURNS boolean AS $$
BEGIN
  RETURN public.get_user_role(user_uuid) IN ('admin', 'super_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_user_super_admin(user_uuid uuid DEFAULT NULL)
RETURNS boolean AS $$
BEGIN
  RETURN public.get_user_role(user_uuid) = 'super_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================
-- Replace wrappers safely
-- ============================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN public.is_user_admin(NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
BEGIN
  RETURN public.is_user_super_admin(NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================
-- Grant execute permissions
-- ============================
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_super_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

-- ============================
-- Create clean, non-recursive policies
-- ============================

-- Users can view their own role
CREATE POLICY users_view_own_role ON public.roles
  FOR SELECT
  USING (auth.uid()::uuid = user_id);

-- Admins can view all roles
CREATE POLICY admins_view_all_roles ON public.roles
  FOR SELECT
  USING (public.is_user_admin());

-- Super admins can manage all roles
CREATE POLICY super_admins_manage_roles ON public.roles
  FOR ALL
  USING (public.is_user_super_admin())
  WITH CHECK (public.is_user_super_admin());

-- Allow system to insert roles for new users
CREATE POLICY system_insert_roles ON public.roles
  FOR INSERT
  WITH CHECK (true);

-- Allow initial setup to query roles when no super_admin exists, or allow own-row checks or admins
CREATE POLICY initial_setup_check ON public.roles
  FOR SELECT
  USING (
    NOT EXISTS (SELECT 1 FROM public.roles WHERE role = 'super_admin')
    OR auth.uid()::uuid = user_id
    OR public.is_user_admin()
  );
