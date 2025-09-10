#!/usr/bin/env node

/**
 * Fix Admin Setup Issues Script
 * This script applies the database migration to fix admin setup issues
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('🔄 Applying admin setup fixes migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250101000006_fix_admin_setup_issues.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Apply the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Error applying migration:', error);
      return false;
    }
    
    console.log('✅ Migration applied successfully');
    return true;
  } catch (error) {
    console.error('❌ Error reading or applying migration:', error);
    return false;
  }
}

async function testAdminSetup() {
  try {
    console.log('🧪 Testing admin setup functions...');
    
    // Test if admin setup is required
    const { data: setupStatus, error: setupError } = await supabase.rpc('get_admin_setup_status');
    
    if (setupError) {
      console.error('❌ Error checking admin setup status:', setupError);
      return false;
    }
    
    console.log('📊 Admin setup status:', setupStatus);
    
    // Test if the complete_super_admin_setup function exists
    const { data: functionExists, error: functionError } = await supabase
      .from('pg_proc')
      .select('proname')
      .eq('proname', 'complete_super_admin_setup')
      .eq('pronamespace', (await supabase.from('pg_namespace').select('oid').eq('nspname', 'public')).data[0]?.oid);
    
    if (functionError) {
      console.error('❌ Error checking function existence:', functionError);
      return false;
    }
    
    if (functionExists && functionExists.length > 0) {
      console.log('✅ complete_super_admin_setup function exists');
    } else {
      console.log('❌ complete_super_admin_setup function not found');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error testing admin setup:', error);
    return false;
  }
}

async function checkDatabaseHealth() {
  try {
    console.log('🏥 Checking database health...');
    
    // Check if all required tables exist
    const requiredTables = [
      'profiles', 'roles', 'interests', 'user_interests', 'user_preferences',
      'posts', 'services', 'service_bookings', 'follows', 'likes', 'comments',
      'news_cache', 'news_likes', 'news_comments', 'news_shares', 'news_polls',
      'user_points', 'point_transactions', 'community_leaderboard', 'user_behavior',
      'payments', 'subscriptions', 'audit_logs', 'system_settings', 'notifications'
    ];
    
    for (const table of requiredTables) {
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', table);
      
      if (error) {
        console.error(`❌ Error checking table ${table}:`, error);
        return false;
      }
      
      if (!data || data.length === 0) {
        console.error(`❌ Table ${table} not found`);
        return false;
      }
    }
    
    console.log('✅ All required tables exist');
    
    // Check RLS policies
    const { data: policies, error: policyError } = await supabase
      .from('pg_policies')
      .select('tablename, policyname')
      .eq('schemaname', 'public')
      .in('tablename', ['profiles', 'roles']);
    
    if (policyError) {
      console.error('❌ Error checking RLS policies:', policyError);
      return false;
    }
    
    console.log('✅ RLS policies are configured');
    console.log('📋 Policies found:', policies?.length || 0);
    
    return true;
  } catch (error) {
    console.error('❌ Error checking database health:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting admin setup fix process...\n');
  
  // Step 1: Check database health
  const healthOk = await checkDatabaseHealth();
  if (!healthOk) {
    console.error('❌ Database health check failed');
    process.exit(1);
  }
  
  // Step 2: Apply migration
  const migrationOk = await applyMigration();
  if (!migrationOk) {
    console.error('❌ Migration failed');
    process.exit(1);
  }
  
  // Step 3: Test admin setup
  const testOk = await testAdminSetup();
  if (!testOk) {
    console.error('❌ Admin setup test failed');
    process.exit(1);
  }
  
  console.log('\n🎉 Admin setup fixes completed successfully!');
  console.log('\n📝 Next steps:');
  console.log('   1. Try the admin setup process in your application');
  console.log('   2. Check the browser console for any remaining errors');
  console.log('   3. Verify that the admin setup completes successfully');
}

// Run the script
main().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
