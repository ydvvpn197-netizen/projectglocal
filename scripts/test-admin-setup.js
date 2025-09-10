// Test script for admin setup functionality
import { createClient } from '@supabase/supabase-js';

// Test configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAdminSetup() {
  console.log('🧪 Testing Admin Setup Functionality...\n');

  try {
    // Test 1: Check if admin setup is required
    console.log('1. Checking if admin setup is required...');
    const { data: setupRequired, error: setupError } = await supabase.rpc('is_admin_setup_required');
    
    if (setupError) {
      console.error('❌ Error checking setup requirement:', setupError);
      return;
    }
    
    console.log('✅ Setup required:', setupRequired);
    
    // Test 2: Check if super admin exists
    console.log('\n2. Checking if super admin exists...');
    const { data: existingAdmin, error: adminError } = await supabase
      .from('roles')
      .select('id')
      .eq('role', 'super_admin')
      .limit(1);
    
    if (adminError) {
      console.error('❌ Error checking existing admin:', adminError);
      return;
    }
    
    console.log('✅ Existing super admin:', existingAdmin?.length > 0 ? 'Yes' : 'No');
    
    // Test 3: Check admin roles table
    console.log('\n3. Checking admin roles table...');
    const { data: adminRoles, error: rolesError } = await supabase
      .from('admin_roles')
      .select('*');
    
    if (rolesError) {
      console.error('❌ Error checking admin roles:', rolesError);
      return;
    }
    
    console.log('✅ Admin roles found:', adminRoles?.length || 0);
    if (adminRoles?.length > 0) {
      console.log('   Roles:', adminRoles.map(r => r.name).join(', '));
    }
    
    // Test 4: Check admin users table
    console.log('\n4. Checking admin users table...');
    const { data: adminUsers, error: usersError } = await supabase
      .from('admin_users')
      .select('*');
    
    if (usersError) {
      console.error('❌ Error checking admin users:', usersError);
      return;
    }
    
    console.log('✅ Admin users found:', adminUsers?.length || 0);
    
    // Test 5: Test database function availability
    console.log('\n5. Testing database function availability...');
    const { data: functionTest, error: functionError } = await supabase.rpc(
      'complete_super_admin_setup',
      {
        p_user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
        p_full_name: 'Test User'
      }
    );
    
    if (functionError) {
      console.log('⚠️ Function test error (expected for dummy data):', functionError.message);
    } else {
      console.log('✅ Function is available:', functionTest);
    }
    
    console.log('\n🎉 Admin setup test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testAdminSetup();
