-- RBAC (Role-Based Access Control) System
-- This migration creates the roles table and policies as requested

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM (
  'super_admin', 'admin', 'moderator', 'user'
);

-- Create roles table
CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create audit_logs table for admin actions
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_roles_user_id ON public.roles(user_id);
CREATE INDEX idx_roles_role ON public.roles(role);
CREATE INDEX idx_audit_logs_admin_user_id ON public.audit_logs(admin_user_id);
CREATE INDEX idx_audit_logs_target_type ON public.audit_logs(target_type);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Enable Row Level Security
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for roles table
CREATE POLICY "Users can view their own role"
  ON public.roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all roles"
  ON public.roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.roles 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Admins can view all roles but not modify"
  ON public.roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Only super admins can update roles"
  ON public.roles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.roles 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Only super admins can delete roles"
  ON public.roles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.roles 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- RLS Policies for audit_logs table
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- Create function to auto-assign default user role on signup
CREATE OR REPLACE FUNCTION assign_default_user_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create trigger to auto-assign role on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION assign_default_user_role();

-- Create function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID DEFAULT auth.uid())
RETURNS user_role AS $$
BEGIN
  RETURN (
    SELECT role FROM public.roles 
    WHERE user_id = user_uuid
  );
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT EXISTS (
      SELECT 1 FROM public.roles 
      WHERE user_id = user_uuid AND role IN ('admin', 'super_admin')
    )
  );
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT EXISTS (
      SELECT 1 FROM public.roles 
      WHERE user_id = user_uuid AND role = 'super_admin'
    )
  );
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create function to check if user is moderator
CREATE OR REPLACE FUNCTION is_moderator(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT EXISTS (
      SELECT 1 FROM public.roles 
      WHERE user_id = user_uuid AND role IN ('moderator', 'admin', 'super_admin')
    )
  );
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  action_type TEXT,
  target_type TEXT,
  target_uuid UUID DEFAULT NULL,
  action_details JSONB DEFAULT NULL,
  client_ip INET DEFAULT NULL,
  client_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    admin_user_id,
    action,
    target_type,
    target_id,
    details,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    action_type,
    target_type,
    target_uuid,
    action_details,
    client_ip,
    client_user_agent
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Update events table RLS policies to use roles
-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view public events" ON public.events;
DROP POLICY IF EXISTS "Users can create events" ON public.events;
DROP POLICY IF EXISTS "Users can update their own events" ON public.events;
DROP POLICY IF EXISTS "Users can delete their own events" ON public.events;
DROP POLICY IF EXISTS "Admins can manage all events" ON public.events;

-- Create new policies using role-based access
CREATE POLICY "Anyone can view public events"
  ON public.events FOR SELECT
  USING (is_public = TRUE);

CREATE POLICY "Authenticated users can create events"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own events"
  ON public.events FOR UPDATE
  USING (
    auth.uid() = organizer_id OR 
    is_admin() OR 
    is_super_admin()
  );

CREATE POLICY "Users can delete their own events"
  ON public.events FOR DELETE
  USING (
    auth.uid() = organizer_id OR 
    is_admin() OR 
    is_super_admin()
  );

CREATE POLICY "Only admins can mark events as featured"
  ON public.events FOR UPDATE
  USING (
    is_admin() OR is_super_admin()
  )
  WITH CHECK (
    -- Only allow updating is_featured if user is admin
    (is_admin() OR is_super_admin()) OR
    (OLD.is_featured = NEW.is_featured)
  );

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for roles updated_at
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.roles IS 'User roles for RBAC system';
COMMENT ON TABLE public.audit_logs IS 'Audit trail for admin actions';

COMMENT ON COLUMN public.roles.role IS 'User role: super_admin, admin, moderator, or user';
COMMENT ON COLUMN public.audit_logs.action IS 'Action performed by admin';
COMMENT ON COLUMN public.audit_logs.target_type IS 'Type of target (event, user, etc.)';
COMMENT ON COLUMN public.audit_logs.target_id IS 'ID of the target object';
COMMENT ON COLUMN public.audit_logs.details IS 'Additional details about the action';

-- Create view for admin dashboard
CREATE VIEW public.admin_dashboard AS
SELECT 
  r.user_id,
  r.role,
  r.created_at as role_created_at,
  au.email,
  au.created_at as user_created_at,
  au.last_sign_in_at,
  p.display_name,
  p.avatar_url
FROM public.roles r
JOIN auth.users au ON r.user_id = au.id
LEFT JOIN public.profiles p ON r.user_id = p.id
WHERE r.role IN ('admin', 'super_admin', 'moderator')
ORDER BY r.created_at DESC;

-- Grant access to the view
GRANT SELECT ON public.admin_dashboard TO authenticated;

-- Create function to promote user to admin (super admin only)
CREATE OR REPLACE FUNCTION promote_user_to_admin(target_user_id UUID, new_role user_role)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if current user is super admin
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Only super admins can promote users';
  END IF;
  
  -- Update or insert role
  INSERT INTO public.roles (user_id, role)
  VALUES (target_user_id, new_role)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    role = new_role,
    updated_at = NOW();
  
  -- Log the action
  PERFORM log_admin_action(
    'promote_user',
    'user',
    target_user_id,
    jsonb_build_object('new_role', new_role),
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );
  
  RETURN TRUE;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create function to demote user (super admin only)
CREATE OR REPLACE FUNCTION demote_user(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if current user is super admin
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Only super admins can demote users';
  END IF;
  
  -- Update role to user
  UPDATE public.roles 
  SET role = 'user', updated_at = NOW()
  WHERE user_id = target_user_id;
  
  -- Log the action
  PERFORM log_admin_action(
    'demote_user',
    'user',
    target_user_id,
    jsonb_build_object('new_role', 'user'),
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );
  
  RETURN TRUE;
END;
$$ language 'plpgsql' SECURITY DEFINER;
