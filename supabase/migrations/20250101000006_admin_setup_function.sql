-- Admin Setup Function
-- This migration creates a function to set up the initial super admin
-- Date: 2025-01-01
-- Description: Function to create initial super admin user

-- Function to create initial super admin
CREATE OR REPLACE FUNCTION public.setup_initial_super_admin(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT
) RETURNS JSONB AS $$
DECLARE
  new_user_id UUID;
  result JSONB;
BEGIN
  -- Check if any super admin already exists
  IF EXISTS (SELECT 1 FROM public.roles WHERE role = 'super_admin') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Super admin already exists'
    );
  END IF;

  -- Check if user with this email already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User with this email already exists'
    );
  END IF;

  -- For now, we'll create the profile and role records
  -- The actual user creation in auth.users will be handled by the application
  -- This function will be called after the user is created in auth
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Ready to create super admin. Please use the application to complete user creation.'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete super admin setup after user creation
CREATE OR REPLACE FUNCTION public.complete_super_admin_setup(
  p_user_id UUID,
  p_full_name TEXT
) RETURNS JSONB AS $$
DECLARE
  admin_role_id UUID;
  result JSONB;
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Check if super admin already exists
  IF EXISTS (SELECT 1 FROM public.roles WHERE role = 'super_admin') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Super admin already exists'
    );
  END IF;

  -- Create profile for the user
  INSERT INTO public.profiles (
    user_id,
    display_name,
    is_verified,
    is_premium
  ) VALUES (
    p_user_id,
    p_full_name,
    true,
    true
  ) ON CONFLICT (user_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    is_verified = EXCLUDED.is_verified,
    is_premium = EXCLUDED.is_premium;

  -- Assign super_admin role
  INSERT INTO public.roles (
    user_id,
    role
  ) VALUES (
    p_user_id,
    'super_admin'
  );

  -- Get or create super_admin role in admin_roles table
  SELECT id INTO admin_role_id FROM public.admin_roles WHERE name = 'super_admin';
  
  IF admin_role_id IS NULL THEN
    INSERT INTO public.admin_roles (
      name,
      display_name,
      description,
      permissions
    ) VALUES (
      'super_admin',
      'Super Administrator',
      'Full system access with all permissions',
      jsonb_build_object(
        'users', jsonb_build_array('view', 'create', 'update', 'delete', 'suspend', 'ban'),
        'content', jsonb_build_array('view', 'moderate', 'delete', 'feature'),
        'analytics', jsonb_build_array('view', 'export'),
        'settings', jsonb_build_array('view', 'update'),
        'admin_users', jsonb_build_array('view', 'create', 'update', 'delete'),
        'roles', jsonb_build_array('view', 'create', 'update', 'delete')
      )
    ) RETURNING id INTO admin_role_id;
  END IF;

  -- Create admin user record
  INSERT INTO public.admin_users (
    user_id,
    role_id,
    is_active
  ) VALUES (
    p_user_id,
    admin_role_id,
    true
  );

  -- Log the setup completion
  INSERT INTO public.audit_logs (
    admin_user_id,
    action,
    resource_type,
    details
  ) VALUES (
    p_user_id,
    'super_admin_setup_completed',
    'system',
    jsonb_build_object(
      'email', (SELECT email FROM auth.users WHERE id = p_user_id),
      'full_name', p_full_name,
      'setup_date', now()
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

-- Function to check if admin setup is required
CREATE OR REPLACE FUNCTION public.is_admin_setup_required()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if any super admin exists
  RETURN NOT EXISTS (
    SELECT 1 FROM public.roles WHERE role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.setup_initial_super_admin(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_super_admin_setup(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_setup_required() TO authenticated;
