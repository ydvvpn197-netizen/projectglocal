-- Setup Super Admin Script
-- This script sets up the user 'ydvvpn197@gmail.com' as super admin
-- Run this in your Supabase SQL editor

-- Step 1: Create user_role enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('super_admin', 'admin', 'moderator', 'user');
    END IF;
END $$;

-- Step 2: Create roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Step 3: Create audit_logs table if it doesn't exist
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

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_roles_user_id ON public.roles(user_id);
CREATE INDEX IF NOT EXISTS idx_roles_role ON public.roles(role);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_user_id ON public.audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Step 5: Enable RLS on tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies for roles table
DROP POLICY IF EXISTS "Users can view their own role" ON public.roles;
CREATE POLICY "Users can view their own role" ON public.roles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all roles" ON public.roles;
CREATE POLICY "Admins can view all roles" ON public.roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.roles r
            WHERE r.user_id = auth.uid() 
            AND r.role IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.roles;
CREATE POLICY "Super admins can manage all roles" ON public.roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.roles r
            WHERE r.user_id = auth.uid() 
            AND r.role = 'super_admin'
        )
    );

-- Step 7: Create RLS policies for audit_logs table
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.roles r
            WHERE r.user_id = auth.uid() 
            AND r.role IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "System can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- Step 8: Create trigger function for auto-assigning user role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.roles (user_id, role)
    VALUES (NEW.id, 'user');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 10: Create trigger function for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 11: Create trigger for roles table
DROP TRIGGER IF EXISTS update_roles_updated_at ON public.roles;
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON public.roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Step 12: Create helper functions
CREATE OR REPLACE FUNCTION public.is_super_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.roles
        WHERE user_id = user_uuid AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin_or_super_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.roles
        WHERE user_id = user_uuid AND role IN ('admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 13: Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_super_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_super_admin(UUID) TO authenticated;

-- Step 14: Create function to update user role (super admin only)
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

-- Step 15: Grant execute permission
GRANT EXECUTE ON FUNCTION public.update_user_role(UUID, user_role, UUID) TO authenticated;

-- Step 16: Set up the specified user as super admin
-- First, get the user ID
DO $$
DECLARE
    target_user_id UUID;
    admin_role_id UUID;
BEGIN
    -- Get user ID
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = 'ydvvpn197@gmail.com';
    
    IF target_user_id IS NULL THEN
        RAISE NOTICE 'User with email ydvvpn197@gmail.com not found. Please create the user first.';
        RETURN;
    END IF;
    
    -- Insert/update role as super_admin
    INSERT INTO public.roles (user_id, role)
    VALUES (target_user_id, 'super_admin'::user_role)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        role = 'super_admin'::user_role,
        updated_at = NOW();
    
    RAISE NOTICE 'Super admin role assigned to user: %', target_user_id;
    
    -- Also ensure they have admin access in the admin_users table
    -- Get super admin role ID from admin_roles
    SELECT id INTO admin_role_id
    FROM admin_roles
    WHERE name = 'super_admin';
    
    IF admin_role_id IS NOT NULL THEN
        INSERT INTO admin_users (user_id, role_id, is_active)
        VALUES (target_user_id, admin_role_id, true)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            role_id = admin_role_id,
            is_active = true,
            updated_at = NOW();
        
        RAISE NOTICE 'Admin dashboard access configured for user: %', target_user_id;
    ELSE
        RAISE NOTICE 'Admin role not found. Please ensure admin_roles table is set up.';
    END IF;
    
    RAISE NOTICE 'Super admin setup completed for: ydvvpn197@gmail.com';
    RAISE NOTICE 'Password: Vip2342#';
END $$;

-- Step 17: Verify the setup
SELECT 
    u.email,
    r.role,
    au.is_active as admin_active,
    ar.name as admin_role_name
FROM auth.users u
LEFT JOIN public.roles r ON u.id = r.user_id
LEFT JOIN admin_users au ON u.id = au.user_id
LEFT JOIN admin_roles ar ON au.role_id = ar.id
WHERE u.email = 'ydvvpn197@gmail.com';
