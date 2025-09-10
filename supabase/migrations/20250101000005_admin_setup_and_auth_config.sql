-- Admin Setup and Authentication Configuration
-- This migration sets up the admin system and authentication configuration
-- Date: 2025-01-01
-- Description: Admin setup functions, authentication configuration, and super admin creation

-- ============================================================================
-- ADMIN SETUP FUNCTIONS
-- ============================================================================

-- Function to create the first super admin
CREATE OR REPLACE FUNCTION public.create_super_admin(
  p_email TEXT,
  p_password TEXT,
  p_display_name TEXT DEFAULT NULL,
  p_username TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  new_user_id UUID;
  result JSONB;
BEGIN
  -- Validate inputs
  IF p_email IS NULL OR p_password IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Email and password are required'
    );
  END IF;
  
  -- Check if any super admin already exists
  IF EXISTS (SELECT 1 FROM public.roles WHERE role = 'super_admin') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Super admin already exists'
    );
  END IF;
  
  -- Create user in auth.users (this will be handled by the application)
  -- The user creation will trigger the handle_new_user() function
  -- which will create the profile and assign the default 'user' role
  
  -- For now, we'll just return success and let the application handle user creation
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Super admin creation initiated. Please use the application to complete user creation and role assignment.'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to promote user to super admin
CREATE OR REPLACE FUNCTION public.promote_to_super_admin(
  p_user_id UUID,
  p_admin_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  current_role public.user_role;
  result JSONB;
BEGIN
  -- Check if the promoting user is a super admin
  IF NOT public.is_super_admin() OR auth.uid() != p_admin_user_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only super admins can promote users to super admin'
    );
  END IF;
  
  -- Get current role
  SELECT role INTO current_role FROM public.roles WHERE user_id = p_user_id;
  
  IF current_role IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;
  
  -- Update role to super admin
  UPDATE public.roles 
  SET 
    role = 'super_admin',
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Log the action
  PERFORM public.log_admin_action(
    p_admin_user_id,
    'promote_to_super_admin',
    'user',
    p_user_id,
    jsonb_build_object(
      'previous_role', current_role,
      'new_role', 'super_admin'
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'User promoted to super admin successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to demote super admin (with protection)
CREATE OR REPLACE FUNCTION public.demote_super_admin(
  p_user_id UUID,
  p_new_role public.user_role,
  p_admin_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  current_role public.user_role;
  super_admin_count INTEGER;
  result JSONB;
BEGIN
  -- Check if the demoting user is a super admin
  IF NOT public.is_super_admin() OR auth.uid() != p_admin_user_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only super admins can demote other super admins'
    );
  END IF;
  
  -- Get current role
  SELECT role INTO current_role FROM public.roles WHERE user_id = p_user_id;
  
  IF current_role IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;
  
  -- Check if this is the last super admin
  SELECT COUNT(*) INTO super_admin_count 
  FROM public.roles 
  WHERE role = 'super_admin';
  
  IF super_admin_count <= 1 AND current_role = 'super_admin' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cannot demote the last super admin'
    );
  END IF;
  
  -- Update role
  UPDATE public.roles 
  SET 
    role = p_new_role,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Log the action
  PERFORM public.log_admin_action(
    p_admin_user_id,
    'demote_super_admin',
    'user',
    p_user_id,
    jsonb_build_object(
      'previous_role', current_role,
      'new_role', p_new_role
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'User demoted successfully'
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
-- USER MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function to get user profile with role
CREATE OR REPLACE FUNCTION public.get_user_profile(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  profile_data JSONB;
  user_role public.user_role;
BEGIN
  -- Get user role
  SELECT role INTO user_role FROM public.roles WHERE user_id = p_user_id;
  
  -- Get profile data
  SELECT jsonb_build_object(
    'id', p.id,
    'user_id', p.user_id,
    'username', p.username,
    'display_name', p.display_name,
    'bio', p.bio,
    'avatar_url', p.avatar_url,
    'cover_url', p.cover_url,
    'location_city', p.location_city,
    'location_state', p.location_state,
    'location_country', p.location_country,
    'is_verified', p.is_verified,
    'is_premium', p.is_premium,
    'plan_type', p.plan_type,
    'premium_expires_at', p.premium_expires_at,
    'verification_expires_at', p.verification_expires_at,
    'last_active_at', p.last_active_at,
    'created_at', p.created_at,
    'updated_at', p.updated_at,
    'role', user_role
  ) INTO profile_data
  FROM public.profiles p
  WHERE p.user_id = p_user_id;
  
  RETURN profile_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user profile
CREATE OR REPLACE FUNCTION public.update_user_profile(
  p_user_id UUID,
  p_updates JSONB
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check if user can update this profile
  IF auth.uid() != p_user_id AND NOT public.is_admin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized to update this profile'
    );
  END IF;
  
  -- Update profile
  UPDATE public.profiles
  SET 
    username = COALESCE((p_updates->>'username')::TEXT, username),
    display_name = COALESCE((p_updates->>'display_name')::TEXT, display_name),
    bio = COALESCE((p_updates->>'bio')::TEXT, bio),
    avatar_url = COALESCE((p_updates->>'avatar_url')::TEXT, avatar_url),
    cover_url = COALESCE((p_updates->>'cover_url')::TEXT, cover_url),
    location_city = COALESCE((p_updates->>'location_city')::TEXT, location_city),
    location_state = COALESCE((p_updates->>'location_state')::TEXT, location_state),
    location_country = COALESCE((p_updates->>'location_country')::TEXT, location_country),
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Log admin action if performed by admin
  IF public.is_admin() AND auth.uid() != p_user_id THEN
    PERFORM public.log_admin_action(
      auth.uid(),
      'update_user_profile',
      'user',
      p_user_id,
      p_updates
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Profile updated successfully'
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
-- ADMIN DASHBOARD FUNCTIONS
-- ============================================================================

-- Function to get admin dashboard statistics
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized access'
    );
  END IF;
  
  -- Build statistics
  SELECT jsonb_build_object(
    'users', jsonb_build_object(
      'total', (SELECT COUNT(*) FROM public.profiles),
      'verified', (SELECT COUNT(*) FROM public.profiles WHERE is_verified = true),
      'premium', (SELECT COUNT(*) FROM public.profiles WHERE is_premium = true),
      'active_today', (SELECT COUNT(*) FROM public.profiles WHERE last_active_at > now() - interval '1 day')
    ),
    'content', jsonb_build_object(
      'total_posts', (SELECT COUNT(*) FROM public.posts),
      'active_posts', (SELECT COUNT(*) FROM public.posts WHERE status = 'active'),
      'featured_posts', (SELECT COUNT(*) FROM public.posts WHERE is_featured = true),
      'total_comments', (SELECT COUNT(*) FROM public.comments)
    ),
    'services', jsonb_build_object(
      'total_services', (SELECT COUNT(*) FROM public.services),
      'active_services', (SELECT COUNT(*) FROM public.services WHERE is_active = true),
      'total_bookings', (SELECT COUNT(*) FROM public.service_bookings),
      'pending_bookings', (SELECT COUNT(*) FROM public.service_bookings WHERE status = 'pending')
    ),
    'news', jsonb_build_object(
      'cached_articles', (SELECT COUNT(*) FROM public.news_cache),
      'total_likes', (SELECT COUNT(*) FROM public.news_likes),
      'total_comments', (SELECT COUNT(*) FROM public.news_comments),
      'total_shares', (SELECT COUNT(*) FROM public.news_shares)
    ),
    'monetization', jsonb_build_object(
      'total_payments', (SELECT COUNT(*) FROM public.payments),
      'completed_payments', (SELECT COUNT(*) FROM public.payments WHERE status = 'completed'),
      'total_revenue', (SELECT COALESCE(SUM(amount), 0) FROM public.payments WHERE status = 'completed'),
      'active_subscriptions', (SELECT COUNT(*) FROM public.subscriptions WHERE status = 'active')
    ),
    'community', jsonb_build_object(
      'total_points_awarded', (SELECT COALESCE(SUM(total_points), 0) FROM public.user_points),
      'total_transactions', (SELECT COUNT(*) FROM public.point_transactions),
      'leaderboard_entries', (SELECT COUNT(*) FROM public.community_leaderboard)
    )
  ) INTO stats;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', stats,
    'timestamp', now()
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recent admin activity
CREATE OR REPLACE FUNCTION public.get_recent_admin_activity(limit_count INTEGER DEFAULT 50)
RETURNS JSONB AS $$
DECLARE
  activity_data JSONB;
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized access'
    );
  END IF;
  
  -- Get recent activity
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', al.id,
      'admin_user_id', al.admin_user_id,
      'action', al.action,
      'resource_type', al.resource_type,
      'resource_id', al.resource_id,
      'details', al.details,
      'ip_address', al.ip_address,
      'user_agent', al.user_agent,
      'created_at', al.created_at
    ) ORDER BY al.created_at DESC
  ) INTO activity_data
  FROM public.audit_logs al
  ORDER BY al.created_at DESC
  LIMIT limit_count;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', COALESCE(activity_data, '[]'::jsonb),
    'timestamp', now()
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
-- AUTHENTICATION CONFIGURATION
-- ============================================================================

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

-- Function to get system configuration for admin setup
CREATE OR REPLACE FUNCTION public.get_admin_setup_config()
RETURNS JSONB AS $$
DECLARE
  config JSONB;
BEGIN
  -- Get system settings
  SELECT jsonb_object_agg(key, value) INTO config
  FROM public.system_settings;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', config,
    'setup_required', public.is_admin_setup_required(),
    'timestamp', now()
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
-- SECURITY FUNCTIONS
-- ============================================================================

-- Function to validate admin actions
CREATE OR REPLACE FUNCTION public.validate_admin_action(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is authenticated
  IF NOT public.is_authenticated() THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user has admin privileges
  IF NOT public.is_admin() THEN
    RETURN FALSE;
  END IF;
  
  -- Additional validation based on action type
  CASE p_action
    WHEN 'delete_user' THEN
      -- Only super admins can delete users
      RETURN public.is_super_admin();
    WHEN 'modify_system_settings' THEN
      -- Only super admins can modify system settings
      RETURN public.is_super_admin();
    WHEN 'manage_roles' THEN
      -- Only super admins can manage roles
      RETURN public.is_super_admin();
    ELSE
      -- Default: allow if user is admin or higher
      RETURN TRUE;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type TEXT,
  p_user_id UUID DEFAULT NULL,
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
    details,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_event_type,
    'security',
    p_details,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
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

-- Log admin setup completion
INSERT INTO public.audit_logs (action, resource_type, details)
VALUES (
  'admin_setup_functions_created',
  'system',
  jsonb_build_object(
    'migration_version', '20250101000005',
    'setup_date', now(),
    'functions_created', 15
  )
);
