-- ============================================================================
-- ADMIN AND SECURITY SYSTEM - TheGlocal Project
-- ============================================================================
-- This migration handles:
-- - Admin dashboard and management functions
-- - Security audit and logging
-- - System settings management
-- - User role management
-- - Security policies and access control
-- Date: 2025-01-01
-- Version: 1.0.0

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
      'active_today', (SELECT COUNT(*) FROM public.profiles WHERE last_active_at > now() - interval '1 day'),
      'new_this_week', (SELECT COUNT(*) FROM public.profiles WHERE created_at > now() - interval '1 week')
    ),
    'content', jsonb_build_object(
      'total_posts', (SELECT COUNT(*) FROM public.posts),
      'active_posts', (SELECT COUNT(*) FROM public.posts WHERE status = 'active'),
      'featured_posts', (SELECT COUNT(*) FROM public.posts WHERE is_featured = true),
      'total_comments', (SELECT COUNT(*) FROM public.comments),
      'total_likes', (SELECT COUNT(*) FROM public.likes)
    ),
    'services', jsonb_build_object(
      'total_services', (SELECT COUNT(*) FROM public.services),
      'active_services', (SELECT COUNT(*) FROM public.services WHERE is_active = true),
      'total_bookings', (SELECT COUNT(*) FROM public.service_bookings),
      'pending_bookings', (SELECT COUNT(*) FROM public.service_bookings WHERE status = 'pending'),
      'completed_bookings', (SELECT COUNT(*) FROM public.service_bookings WHERE status = 'completed')
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
      'active_subscriptions', (SELECT COUNT(*) FROM public.subscriptions WHERE status = 'active'),
      'revenue_this_month', (
        SELECT COALESCE(SUM(amount), 0) 
        FROM public.payments 
        WHERE status = 'completed' 
          AND created_at >= date_trunc('month', now())
      )
    ),
    'community', jsonb_build_object(
      'total_points_awarded', (SELECT COALESCE(SUM(total_points), 0) FROM public.user_points),
      'total_transactions', (SELECT COUNT(*) FROM public.point_transactions),
      'leaderboard_entries', (SELECT COUNT(*) FROM public.community_leaderboard),
      'total_follows', (SELECT COUNT(*) FROM public.follows)
    ),
    'security', jsonb_build_object(
      'total_audit_logs', (SELECT COUNT(*) FROM public.audit_logs),
      'security_events_today', (
        SELECT COUNT(*) 
        FROM public.security_audit 
        WHERE created_at > now() - interval '1 day'
      ),
      'failed_access_attempts', (
        SELECT COUNT(*) 
        FROM public.security_audit 
        WHERE success = false 
          AND created_at > now() - interval '1 day'
      )
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
-- SECURITY AUDIT FUNCTIONS
-- ============================================================================

-- Function to log security event
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type TEXT,
  p_user_id UUID DEFAULT NULL,
  p_resource TEXT,
  p_action TEXT,
  p_success BOOLEAN DEFAULT FALSE,
  p_details JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.security_audit (
    user_id, event_type, resource, action, success, details, ip_address, user_agent
  ) VALUES (
    p_user_id, p_event_type, p_resource, p_action, p_success, p_details, p_ip_address, p_user_agent
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get security audit logs
CREATE OR REPLACE FUNCTION public.get_security_audit_logs(
  p_user_id UUID DEFAULT NULL,
  p_event_type TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT NULL,
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0
) RETURNS JSONB AS $$
DECLARE
  audit_logs JSONB;
BEGIN
  -- Check if user is super admin
  IF NOT public.is_super_admin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized access'
    );
  END IF;
  
  -- Get security audit logs
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', sa.id,
      'user_id', sa.user_id,
      'event_type', sa.event_type,
      'resource', sa.resource,
      'action', sa.action,
      'success', sa.success,
      'details', sa.details,
      'ip_address', sa.ip_address,
      'user_agent', sa.user_agent,
      'created_at', sa.created_at
    ) ORDER BY sa.created_at DESC
  ) INTO audit_logs
  FROM public.security_audit sa
  WHERE (p_user_id IS NULL OR sa.user_id = p_user_id)
    AND (p_event_type IS NULL OR sa.event_type = p_event_type)
    AND (p_success IS NULL OR sa.success = p_success)
    AND (p_start_date IS NULL OR sa.created_at >= p_start_date)
    AND (p_end_date IS NULL OR sa.created_at <= p_end_date)
  ORDER BY sa.created_at DESC
  LIMIT p_limit OFFSET p_offset;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', COALESCE(audit_logs, '[]'::jsonb),
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
-- SYSTEM SETTINGS FUNCTIONS
-- ============================================================================

-- Function to get system settings
CREATE OR REPLACE FUNCTION public.get_system_settings()
RETURNS JSONB AS $$
DECLARE
  settings_data JSONB;
BEGIN
  -- Get system settings
  SELECT jsonb_object_agg(key, jsonb_build_object(
    'value', value,
    'description', description,
    'updated_by', updated_by,
    'updated_at', updated_at
  )) INTO settings_data
  FROM public.system_settings;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', COALESCE(settings_data, '{}'::jsonb)
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update system setting
CREATE OR REPLACE FUNCTION public.update_system_setting(
  p_key TEXT,
  p_value JSONB,
  p_description TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check if user is super admin
  IF NOT public.is_super_admin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized to update system settings'
    );
  END IF;
  
  -- Update or insert system setting
  INSERT INTO public.system_settings (key, value, description, updated_by)
  VALUES (p_key, p_value, p_description, auth.uid())
  ON CONFLICT (key)
  DO UPDATE SET
    value = EXCLUDED.value,
    description = COALESCE(EXCLUDED.description, system_settings.description),
    updated_by = EXCLUDED.updated_by,
    updated_at = now();
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'System setting updated successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admin setup configuration
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
-- USER ROLE MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function to get all users with roles
CREATE OR REPLACE FUNCTION public.get_all_users_with_roles(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
) RETURNS JSONB AS $$
DECLARE
  users_data JSONB;
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized access'
    );
  END IF;
  
  -- Get users with roles
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', p.id,
      'user_id', p.user_id,
      'username', p.username,
      'display_name', p.display_name,
      'email', au.email,
      'is_verified', p.is_verified,
      'is_premium', p.is_premium,
      'plan_type', p.plan_type,
      'role', r.role,
      'last_active_at', p.last_active_at,
      'created_at', p.created_at,
      'updated_at', p.updated_at
    ) ORDER BY p.created_at DESC
  ) INTO users_data
  FROM public.profiles p
  JOIN auth.users au ON p.user_id = au.id
  LEFT JOIN public.roles r ON p.user_id = r.user_id
  ORDER BY p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', COALESCE(users_data, '[]'::jsonb),
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

-- Function to update user role
CREATE OR REPLACE FUNCTION public.update_user_role(
  p_user_id UUID,
  p_new_role user_role
) RETURNS JSONB AS $$
DECLARE
  current_role user_role;
  result JSONB;
BEGIN
  -- Check if user is super admin
  IF NOT public.is_super_admin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only super admins can update user roles'
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
  
  -- Check if trying to change the last super admin
  IF current_role = 'super_admin' AND p_new_role != 'super_admin' THEN
    IF (SELECT COUNT(*) FROM public.roles WHERE role = 'super_admin') <= 1 THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Cannot change the last super admin role'
      );
    END IF;
  END IF;
  
  -- Update role
  UPDATE public.roles 
  SET 
    role = p_new_role,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Log the action
  PERFORM public.log_admin_action(
    auth.uid(),
    'update_user_role',
    'user',
    p_user_id,
    jsonb_build_object(
      'previous_role', current_role,
      'new_role', p_new_role
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'User role updated successfully'
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
-- AUDIT LOGGING FUNCTIONS
-- ============================================================================

-- Function to log admin action
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
    admin_user_id, action, resource_type, resource_id, details, ip_address, user_agent
  ) VALUES (
    p_admin_user_id, p_action, p_resource_type, p_resource_id, p_details, p_ip_address, p_user_agent
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get audit logs
CREATE OR REPLACE FUNCTION public.get_audit_logs(
  p_admin_user_id UUID DEFAULT NULL,
  p_action TEXT DEFAULT NULL,
  p_resource_type TEXT DEFAULT NULL,
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0
) RETURNS JSONB AS $$
DECLARE
  audit_logs JSONB;
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized access'
    );
  END IF;
  
  -- Get audit logs
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
  ) INTO audit_logs
  FROM public.audit_logs al
  WHERE (p_admin_user_id IS NULL OR al.admin_user_id = p_admin_user_id)
    AND (p_action IS NULL OR al.action = p_action)
    AND (p_resource_type IS NULL OR al.resource_type = p_resource_type)
    AND (p_start_date IS NULL OR al.created_at >= p_start_date)
    AND (p_end_date IS NULL OR al.created_at <= p_end_date)
  ORDER BY al.created_at DESC
  LIMIT p_limit OFFSET p_offset;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', COALESCE(audit_logs, '[]'::jsonb),
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
-- SECURITY HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user is authenticated
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin or super admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is moderator or higher
CREATE OR REPLACE FUNCTION public.is_moderator()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.roles 
    WHERE user_id = auth.uid() 
    AND role IN ('moderator', 'admin', 'super_admin')
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

-- ============================================================================
-- MAINTENANCE FUNCTIONS
-- ============================================================================

-- Function to run maintenance tasks
CREATE OR REPLACE FUNCTION public.run_maintenance()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  expired_news_count INTEGER;
  old_notifications_count INTEGER;
  old_audit_logs_count INTEGER;
  old_behavior_count INTEGER;
BEGIN
  -- Check if user is super admin
  IF NOT public.is_super_admin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized to run maintenance'
    );
  END IF;
  
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
