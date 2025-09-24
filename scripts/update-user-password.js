#!/usr/bin/env node

/**
 * Update User Password Script
 * This script updates the password for a specific user in Supabase
 */

const { createClient } = require('@supabase/supabase-js');

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

async function updateUserPassword() {
  try {
    console.log('🔐 Updating user password...\n');

    // Step 1: Find the user
    console.log('1. Finding user...');
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
      console.log(`📧 Email: ${TARGET_EMAIL}`);
      console.log(`🔑 Password: ${NEW_PASSWORD}`);
      return;
    }

    console.log(`✅ User found: ${targetUser.id}`);

    // Step 2: Update password
    console.log('2. Updating password...');
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      targetUser.id,
      { password: NEW_PASSWORD }
    );

    if (updateError) {
      throw new Error(`Failed to update password: ${updateError.message}`);
    }

    console.log('✅ Password updated successfully');
    console.log(`📧 Email: ${TARGET_EMAIL}`);
    console.log(`🔑 New Password: ${NEW_PASSWORD}`);

  } catch (error) {
    console.error('❌ Error updating password:', error.message);
    process.exit(1);
  }
}

// Run the update
updateUserPassword();
