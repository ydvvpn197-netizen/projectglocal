#!/usr/bin/env node

/**
 * Simple Super Admin Setup Script
 * This script sets up a user as super admin using the existing environment
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const TARGET_EMAIL = 'ydvvpn197@gmail.com';
const NEW_PASSWORD = 'Vip2342#';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL');
  console.error('   VITE_SUPABASE_ANON_KEY');
  console.error('\nPlease set these in your .env file');
  process.exit(1);
}

// Create Supabase client with anon key
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function setupSuperAdmin() {
  try {
    console.log('🚀 Simple Super Admin Setup\n');
    console.log(`Target Email: ${TARGET_EMAIL}`);
    console.log(`New Password: ${NEW_PASSWORD}\n`);

    // Step 1: Create or sign up the user
    console.log('1. Creating/signing up user...');
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: TARGET_EMAIL,
      password: NEW_PASSWORD,
    });

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log('   ✅ User already exists, signing in...');
        
        // Try to sign in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: TARGET_EMAIL,
          password: NEW_PASSWORD,
        });

        if (signInError) {
          throw new Error(`Failed to sign in: ${signInError.message}`);
        }

        console.log('   ✅ User signed in successfully');
      } else {
        throw new Error(`Failed to create user: ${signUpError.message}`);
      }
    } else {
      console.log('   ✅ User created successfully');
    }

    // Step 2: Run the RBAC migration SQL
    console.log('2. Setting up RBAC system...');
    console.log('   Please run the following SQL in your Supabase SQL Editor:');
    console.log('   File: supabase/migrations/20250131000003_create_rbac_system.sql');
    console.log('   Or use the manual SQL script: scripts/setup-super-admin.sql');

    // Step 3: Provide instructions for manual role assignment
    console.log('\n3. Manual Role Assignment Required:');
    console.log('   After running the migration, execute this SQL in Supabase:');
    console.log(`
INSERT INTO public.roles (user_id, role)
SELECT id, 'super_admin'::user_role
FROM auth.users
WHERE email = '${TARGET_EMAIL}'
ON CONFLICT (user_id) 
DO UPDATE SET 
    role = 'super_admin'::user_role,
    updated_at = NOW();
    `);

    console.log('\n🎉 Setup Instructions Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${TARGET_EMAIL}`);
    console.log(`🔑 Password: ${NEW_PASSWORD}`);
    console.log(`👑 Role: super_admin (after manual setup)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\nNext Steps:');
    console.log('1. Run the RBAC migration in Supabase SQL Editor');
    console.log('2. Execute the role assignment SQL above');
    console.log('3. Verify the setup using the verification query in the README');

  } catch (error) {
    console.error('❌ Error setting up super admin:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupSuperAdmin();
