#!/usr/bin/env node

/**
 * Setup Super Admin Script
 * This script sets up a user as super admin in both the application and Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TARGET_EMAIL = 'ydvvpn197@gmail.com';
const NEW_PASSWORD = 'Vip2342#';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.error('Please set it in your .env file or environment variables');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function setupSuperAdmin() {
  try {
    console.log('🚀 Setting up Super Admin...\n');

    // Step 1: Check if user exists
    console.log('1. Checking if user exists...');
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      throw new Error(`Failed to fetch users: ${userError.message}`);
    }

    const targetUser = users.users.find(user => user.email === TARGET_EMAIL);
    
    if (!targetUser) {
      console.log(`❌ User with email ${TARGET_EMAIL} not found`);
      console.log('Creating new user...');
      
      // Create new user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: TARGET_EMAIL,
        password: NEW_PASSWORD,
        email_confirm: true
      });

      if (createError) {
        throw new Error(`Failed to create user: ${createError.message}`);
      }

      console.log(`✅ User created successfully: ${newUser.user.id}`);
    } else {
      console.log(`✅ User found: ${targetUser.id}`);
      
      // Update password
      console.log('2. Updating user password...');
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        targetUser.id,
        { password: NEW_PASSWORD }
      );

      if (updateError) {
        throw new Error(`Failed to update password: ${updateError.message}`);
      }

      console.log('✅ Password updated successfully');
    }

    // Step 3: Run the RBAC migration
    console.log('3. Setting up RBAC system...');
    
    // Read and execute the migration
    const fs = require('fs');
    const path = require('path');
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250131000003_create_rbac_system.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error('RBAC migration file not found');
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    const { error: migrationError } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (migrationError) {
      console.log('⚠️  Migration execution failed, trying alternative approach...');
      
      // Alternative: Execute key parts of the migration manually
      await executeMigrationManually();
    } else {
      console.log('✅ RBAC migration executed successfully');
    }

    // Step 4: Verify super admin setup
    console.log('4. Verifying super admin setup...');
    
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('*')
      .eq('user_id', targetUser?.id || users.users.find(u => u.email === TARGET_EMAIL).id)
      .single();

    if (roleError) {
      console.log('⚠️  Role verification failed, creating role manually...');
      
      const userId = targetUser?.id || users.users.find(u => u.email === TARGET_EMAIL).id;
      
      const { error: insertError } = await supabase
        .from('roles')
        .insert({
          user_id: userId,
          role: 'super_admin'
        });

      if (insertError) {
        throw new Error(`Failed to create role: ${insertError.message}`);
      }
      
      console.log('✅ Super admin role created manually');
    } else {
      console.log(`✅ Super admin role verified: ${roleData.role}`);
    }

    // Step 5: Setup admin_users table entry
    console.log('5. Setting up admin dashboard access...');
    
    const userId = targetUser?.id || users.users.find(u => u.email === TARGET_EMAIL).id;
    
    // Get super admin role ID
    const { data: adminRole, error: adminRoleError } = await supabase
      .from('admin_roles')
      .select('id')
      .eq('name', 'super_admin')
      .single();

    if (adminRoleError) {
      console.log('⚠️  Admin role not found, creating it...');
      
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
      
      adminRole.id = newAdminRole.id;
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

    console.log('✅ Admin dashboard access configured');

    console.log('\n🎉 Super Admin setup completed successfully!');
    console.log(`📧 Email: ${TARGET_EMAIL}`);
    console.log(`🔑 Password: ${NEW_PASSWORD}`);
    console.log(`👑 Role: super_admin`);
    console.log('\nThe user now has:');
    console.log('• Full system access through RBAC system');
    console.log('• Admin dashboard access');
    console.log('• All super admin permissions');
    console.log('• Ability to manage other users and roles');

  } catch (error) {
    console.error('❌ Error setting up super admin:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

async function executeMigrationManually() {
  console.log('Executing migration manually...');
  
  try {
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

    // Enable RLS
    await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;'
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

    console.log('✅ Manual migration completed');
  } catch (error) {
    console.log('⚠️  Manual migration failed:', error.message);
    throw error;
  }
}

// Run the setup
setupSuperAdmin();
