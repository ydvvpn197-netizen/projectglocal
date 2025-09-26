-- ============================================================================
-- AUTHENTICATION AND USER MANAGEMENT - TheGlocal Project
-- ============================================================================
-- This migration handles:
-- - User authentication setup
-- - Profile management
-- - Role-based access control (RBAC)
-- - User preferences and interests
-- Date: 2025-01-01
-- Version: 1.0.0

-- ============================================================================
-- USER MANAGEMENT FUNCTIONS
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
-- PROFILE MANAGEMENT FUNCTIONS
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
    'role', user_role,
    'referral_code', p.referral_code,
    'referral_count', p.referral_count,
    'total_referral_rewards', p.total_referral_rewards
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
-- USER PREFERENCE FUNCTIONS
-- ============================================================================

-- Function to update user preferences
CREATE OR REPLACE FUNCTION public.update_user_preferences(
  p_user_id UUID,
  p_preferences JSONB
) RETURNS JSONB AS $$
DECLARE
  preference_record RECORD;
  result JSONB;
BEGIN
  -- Check if user can update preferences
  IF auth.uid() != p_user_id AND NOT public.is_admin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized to update preferences'
    );
  END IF;
  
  -- Update or insert preferences
  FOR preference_record IN 
    SELECT * FROM jsonb_each(p_preferences)
  LOOP
    INSERT INTO public.user_preferences (user_id, category, weight, source)
    VALUES (
      p_user_id,
      preference_record.key,
      COALESCE((preference_record.value->>'weight')::DECIMAL, 0.5),
      COALESCE((preference_record.value->>'source')::TEXT, 'explicit')
    )
    ON CONFLICT (user_id, category)
    DO UPDATE SET
      weight = COALESCE((preference_record.value->>'weight')::DECIMAL, user_preferences.weight),
      source = COALESCE((preference_record.value->>'source')::TEXT, user_preferences.source),
      last_updated = now();
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Preferences updated successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user preferences
CREATE OR REPLACE FUNCTION public.get_user_preferences(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  preferences JSONB;
BEGIN
  -- Check if user can view preferences
  IF auth.uid() != p_user_id AND NOT public.is_admin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized to view preferences'
    );
  END IF;
  
  -- Get preferences
  SELECT jsonb_object_agg(category, jsonb_build_object(
    'weight', weight,
    'source', source,
    'last_updated', last_updated
  )) INTO preferences
  FROM public.user_preferences
  WHERE user_id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', COALESCE(preferences, '{}'::jsonb)
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
-- USER INTERESTS FUNCTIONS
-- ============================================================================

-- Function to add user interest
CREATE OR REPLACE FUNCTION public.add_user_interest(
  p_user_id UUID,
  p_interest_id UUID
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check if user can add interest
  IF auth.uid() != p_user_id AND NOT public.is_admin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized to add interest'
    );
  END IF;
  
  -- Add interest
  INSERT INTO public.user_interests (user_id, interest_id)
  VALUES (p_user_id, p_interest_id)
  ON CONFLICT (user_id, interest_id) DO NOTHING;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Interest added successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove user interest
CREATE OR REPLACE FUNCTION public.remove_user_interest(
  p_user_id UUID,
  p_interest_id UUID
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check if user can remove interest
  IF auth.uid() != p_user_id AND NOT public.is_admin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized to remove interest'
    );
  END IF;
  
  -- Remove interest
  DELETE FROM public.user_interests
  WHERE user_id = p_user_id AND interest_id = p_interest_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Interest removed successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user interests
CREATE OR REPLACE FUNCTION public.get_user_interests(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  interests JSONB;
BEGIN
  -- Get user interests
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', i.id,
      'name', i.name,
      'description', i.description,
      'icon', i.icon,
      'category', i.category
    )
  ) INTO interests
  FROM public.user_interests ui
  JOIN public.interests i ON ui.interest_id = i.id
  WHERE ui.user_id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', COALESCE(interests, '[]'::jsonb)
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
-- USER ACTIVITY FUNCTIONS
-- ============================================================================

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

-- Function to get user activity summary
CREATE OR REPLACE FUNCTION public.get_user_activity_summary(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  activity_data JSONB;
BEGIN
  -- Check if user can view activity
  IF auth.uid() != p_user_id AND NOT public.is_admin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized to view activity'
    );
  END IF;
  
  -- Get activity summary
  SELECT jsonb_build_object(
    'posts_count', (SELECT COUNT(*) FROM public.posts WHERE user_id = p_user_id),
    'comments_count', (SELECT COUNT(*) FROM public.comments WHERE user_id = p_user_id),
    'likes_given', (SELECT COUNT(*) FROM public.likes WHERE user_id = p_user_id),
    'followers_count', (SELECT COUNT(*) FROM public.follows WHERE following_id = p_user_id),
    'following_count', (SELECT COUNT(*) FROM public.follows WHERE follower_id = p_user_id),
    'total_points', (SELECT COALESCE(total_points, 0) FROM public.user_points WHERE user_id = p_user_id),
    'last_active', (SELECT last_active_at FROM public.profiles WHERE user_id = p_user_id)
  ) INTO activity_data;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', activity_data
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
