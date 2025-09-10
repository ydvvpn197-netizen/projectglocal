-- Migration: Create RBAC System
-- Date: 2025-01-31
-- Description: Create role-based access control system with roles table and user_role enum

-- Create user_role enum
CREATE TYPE public.user_role AS ENUM ('super_admin', 'admin', 'moderator', 'user');

-- Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create audit_logs table for admin actions
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_roles_user_id ON public.roles(user_id);
CREATE INDEX IF NOT EXISTS idx_roles_role ON public.roles(role);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_user_id ON public.audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- Enable RLS on tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for roles table
CREATE POLICY "Users can view their own role" ON public.roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.roles r
            WHERE r.user_id = auth.uid() 
            AND r.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Super admins can manage all roles" ON public.roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.roles r
            WHERE r.user_id = auth.uid() 
            AND r.role = 'super_admin'
        )
    );

-- RLS Policies for audit_logs table
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.roles r
            WHERE r.user_id = auth.uid() 
            AND r.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "System can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- Create trigger to auto-assign user role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.roles (user_id, role)
    VALUES (NEW.id, 'user');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON public.roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.roles
        WHERE user_id = user_uuid AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is admin or super admin
CREATE OR REPLACE FUNCTION public.is_admin_or_super_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.roles
        WHERE user_id = user_uuid AND role IN ('admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_super_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_super_admin(UUID) TO authenticated;

-- Create function to update user role (super admin only)
CREATE OR REPLACE FUNCTION public.update_user_role(
    target_user_id UUID,
    new_role user_role,
    admin_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if admin is super admin
    IF NOT public.is_super_admin(admin_user_id) THEN
        RAISE EXCEPTION 'Only super admins can update user roles';
    END IF;

    -- Update the role
    UPDATE public.roles
    SET role = new_role, updated_at = NOW()
    WHERE user_id = target_user_id;

    -- Log the action
    INSERT INTO public.audit_logs (admin_user_id, action, resource_type, resource_id, details)
    VALUES (admin_user_id, 'update_user_role', 'user', target_user_id, 
            jsonb_build_object('new_role', new_role, 'target_user_id', target_user_id));

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.update_user_role(UUID, user_role, UUID) TO authenticated;

-- Insert the specified user as super admin
-- First, ensure the user exists in auth.users (this will be handled by the application)
-- Then insert/update their role to super_admin
INSERT INTO public.roles (user_id, role)
SELECT id, 'super_admin'::user_role
FROM auth.users
WHERE email = 'ydvvpn197@gmail.com'
ON CONFLICT (user_id) 
DO UPDATE SET 
    role = 'super_admin'::user_role,
    updated_at = NOW();

-- Also ensure they have admin access in the admin_users table
INSERT INTO admin_users (user_id, role_id, is_active)
SELECT 
    u.id,
    ar.id,
    true
FROM auth.users u
CROSS JOIN admin_roles ar
WHERE u.email = 'ydvvpn197@gmail.com'
  AND ar.name = 'super_admin'
ON CONFLICT (user_id) 
DO UPDATE SET 
    role_id = EXCLUDED.role_id,
    is_active = true,
    updated_at = NOW();
