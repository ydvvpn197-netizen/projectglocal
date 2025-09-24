#!/usr/bin/env node

/**
 * Complete Super Admin Setup Script
 * This script sets up a user as super admin with all necessary configurations
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TARGET_EMAIL = 'ydvvpn197@gmail.com';
const NEW_PASSWORD = 'Vip2342#';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease set these in your .env file or environment variables');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupSuperAdmin() {
  try {
    console.log('🚀 Complete Super Admin Setup\n');
    console.log(`Target Email: ${TARGET_EMAIL}`);
    console.log(`New Password: ${NEW_PASSWORD}\n`);

    // Step 1: Setup or verify user
    console.log('1. Setting up user account...');
    const userId = await setupUser();
    console.log(`✅ User setup complete: ${userId}\n`);

    // Step 2: Setup RBAC system
    console.log('2. Setting up RBAC system...');
    await setupRBACSystem();
    console.log('✅ RBAC system setup complete\n');

    // Step 3: Assign super admin role
    console.log('3. Assigning super admin role...');
    await assignSuperAdminRole(userId);
    console.log('✅ Super admin role assigned\n');

    // Step 4: Setup admin dashboard access
    console.log('4. Setting up admin dashboard access...');
    await setupAdminDashboardAccess(userId);
    console.log('✅ Admin dashboard access configured\n');

    // Step 5: Verify setup
    console.log('5. Verifying setup...');
    await verifySetup(userId);

    console.log('\n🎉 Super Admin Setup Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${TARGET_EMAIL}`);
    console.log(`🔑 Password: ${NEW_PASSWORD}`);
    console.log(`👑 Role: super_admin`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\nThe user now has:');
    console.log('• Full system access through RBAC system');
    console.log('• Admin dashboard access');
    console.log('• All super admin permissions');
    console.log('• Ability to manage other users and roles');
    console.log('• Access to all admin functions and analytics');

  } catch (error) {
    console.error('❌ Error setting up super admin:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

async function setupUser() {
  // Check if user exists
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  
  if (userError) {
    throw new Error(`Failed to fetch users: ${userError.message}`);
  }

  const targetUser = users.users.find(user => user.email === TARGET_EMAIL);
  
  if (!targetUser) {
    console.log('   Creating new user...');
    
    // Create new user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: TARGET_EMAIL,
      password: NEW_PASSWORD,
      email_confirm: true
    });

    if (createError) {
      throw new Error(`Failed to create user: ${createError.message}`);
    }

    console.log('   ✅ User created successfully');
    return newUser.user.id;
  } else {
    console.log('   User found, updating password...');
    
    // Update password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      targetUser.id,
      { password: NEW_PASSWORD }
    );

    if (updateError) {
      throw new Error(`Failed to update password: ${updateError.message}`);
    }

    console.log('   ✅ Password updated successfully');
    return targetUser.id;
  }
}

async function setupRBACSystem() {
  // Check if roles table exists
  const { data: tables, error: tableError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_name', 'roles');

  if (tableError) {
    throw new Error(`Failed to check tables: ${tableError.message}`);
  }

  if (tables.length === 0) {
    console.log('   Creating RBAC tables...');
    
    // Create user_role enum
    await supabase.rpc('exec_sql', {
      sql: `CREATE TYPE IF NOT EXISTS public.user_role AS ENUM ('super_admin', 'admin', 'moderator', 'user');`
    });

    // Create roles table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.roles (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            role user_role NOT NULL DEFAULT 'user',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id)
        );
      `
    });

    // Create audit_logs table
    await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    // Enable RLS
    await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;'
    });

    await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;'
    });

    // Create indexes
    await supabase.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_roles_user_id ON public.roles(user_id);'
    });

    await supabase.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_roles_role ON public.roles(role);'
    });

    // Create basic policies
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY IF NOT EXISTS "Users can view their own role" ON public.roles
            FOR SELECT USING (auth.uid() = user_id);
      `
    });

    await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY IF NOT EXISTS "Super admins can manage all roles" ON public.roles
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.roles r
                    WHERE r.user_id = auth.uid() 
                    AND r.role = 'super_admin'
                )
            );
      `
    });

    // Create helper functions
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION public.is_super_admin(user_uuid UUID DEFAULT auth.uid())
        RETURNS BOOLEAN AS $$
        BEGIN
            RETURN EXISTS (
                SELECT 1 FROM public.roles
                WHERE user_id = user_uuid AND role = 'super_admin'
            );
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });

    await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION public.is_admin_or_super_admin(user_uuid UUID DEFAULT auth.uid())
        RETURNS BOOLEAN AS $$
        BEGIN
            RETURN EXISTS (
                SELECT 1 FROM public.roles
                WHERE user_id = user_uuid AND role IN ('admin', 'super_admin')
            );
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });

    // Grant permissions
    await supabase.rpc('exec_sql', {
      sql: 'GRANT EXECUTE ON FUNCTION public.is_super_admin(UUID) TO authenticated;'
    });

    await supabase.rpc('exec_sql', {
      sql: 'GRANT EXECUTE ON FUNCTION public.is_admin_or_super_admin(UUID) TO authenticated;'
    });

    console.log('   ✅ RBAC tables and functions created');
  } else {
    console.log('   ✅ RBAC system already exists');
  }
}

async function assignSuperAdminRole(userId) {
  // Insert/update role as super_admin
  const { error: roleError } = await supabase
    .from('roles')
    .upsert({
      user_id: userId,
      role: 'super_admin'
    });

  if (roleError) {
    throw new Error(`Failed to assign super admin role: ${roleError.message}`);
  }

  console.log('   ✅ Super admin role assigned');
}

async function setupAdminDashboardAccess(userId) {
  // Check if admin_roles table exists
  const { data: adminTables, error: adminTableError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_name', 'admin_roles');

  if (adminTableError) {
    throw new Error(`Failed to check admin tables: ${adminTableError.message}`);
  }

  if (adminTables.length === 0) {
    console.log('   Admin dashboard tables not found, skipping admin dashboard setup');
    return;
  }

  // Get or create super admin role
  let { data: adminRole, error: adminRoleError } = await supabase
    .from('admin_roles')
    .select('id')
    .eq('name', 'super_admin')
    .single();

  if (adminRoleError || !adminRole) {
    console.log('   Creating super admin role...');
    
    const { data: newAdminRole, error: createRoleError } = await supabase
      .from('admin_roles')
      .insert({
        name: 'super_admin',
        display_name: 'Super Administrator',
        description: 'Full system access with all permissions',
        permissions: {
          users: ['view', 'create', 'update', 'delete', 'suspend', 'ban'],
          content: ['view', 'moderate', 'delete', 'feature'],
          analytics: ['view', 'export'],
          settings: ['view', 'update'],
          admin_users: ['view', 'create', 'update', 'delete'],
          roles: ['view', 'create', 'update', 'delete']
        },
        is_active: true
      })
      .select('id')
      .single();

    if (createRoleError) {
      throw new Error(`Failed to create admin role: ${createRoleError.message}`);
    }
    
    adminRole = newAdminRole;
  }

  // Insert/update admin_users entry
  const { error: adminUserError } = await supabase
    .from('admin_users')
    .upsert({
      user_id: userId,
      role_id: adminRole.id,
      is_active: true
    });

  if (adminUserError) {
    throw new Error(`Failed to setup admin user: ${adminUserError.message}`);
  }

  console.log('   ✅ Admin dashboard access configured');
}

async function verifySetup(userId) {
  // Verify RBAC role
  const { data: roleData, error: roleError } = await supabase
    .from('roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (roleError) {
    throw new Error(`Failed to verify role: ${roleError.message}`);
  }

  if (roleData.role !== 'super_admin') {
    throw new Error(`Role verification failed. Expected 'super_admin', got '${roleData.role}'`);
  }

  console.log('   ✅ RBAC role verified: super_admin');

  // Verify admin dashboard access
  const { data: adminData, error: adminError } = await supabase
    .from('admin_users')
    .select('is_active, role:admin_roles(name)')
    .eq('user_id', userId)
    .single();

  if (!adminError && adminData) {
    console.log(`   ✅ Admin dashboard access verified: ${adminData.role.name}`);
  } else {
    console.log('   ⚠️  Admin dashboard access not configured (this is optional)');
  }

  // Test super admin function
  const { data: isSuperAdmin, error: functionError } = await supabase
    .rpc('is_super_admin', { user_uuid: userId });

  if (functionError) {
    console.log('   ⚠️  Super admin function test failed (this is optional)');
  } else if (isSuperAdmin) {
    console.log('   ✅ Super admin function verified');
  } else {
    console.log('   ⚠️  Super admin function returned false');
  }
}

// Run the setup
setupSuperAdmin();
