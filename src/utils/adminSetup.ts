import { supabase } from '@/integrations/supabase/client';

/**
 * Utility functions for setting up admin users
 */
export class AdminSetup {
  /**
   * Create initial admin user with email and password
   */
  static async createInitialAdmin(email: string, password: string, fullName: string): Promise<boolean> {
    try {
      console.log('Starting admin creation process...');

      // Check if any super admin already exists
      const { data: existingSuperAdmin } = await supabase
        .from('roles')
        .select('id')
        .eq('role', 'super_admin')
        .limit(1);

      if (existingSuperAdmin && existingSuperAdmin.length > 0) {
        console.log('Super admin already exists');
        return false;
      }

      // Step 1: Create user in Supabase Auth
      console.log('Creating user in Supabase Auth...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName,
            role: 'super_admin'
          }
        }
      });

      if (authError) {
        console.error('Error creating user in auth:', authError);
        return false;
      }

      if (!authData.user) {
        console.error('No user returned from auth signup');
        return false;
      }

      console.log('User created in auth:', authData.user.id);

      // Step 2: Complete the admin setup using the database function
      console.log('Completing admin setup...');
      const { data: setupResult, error: setupError } = await supabase.rpc(
        'complete_super_admin_setup',
        {
          p_user_id: authData.user.id,
          p_full_name: fullName
        }
      );

      if (setupError) {
        console.error('Error completing admin setup:', setupError);
        return false;
      }

      if (!setupResult?.success) {
        console.error('Admin setup failed:', setupResult?.error);
        return false;
      }

      console.log('Admin user created successfully:', authData.user.id);
      return true;
    } catch (error) {
      console.error('Error in createInitialAdmin:', error);
      return false;
    }
  }

  /**
   * Check if any admin users exist
   */
  static async hasAdminUsers(): Promise<boolean> {
    try {
      // Check if any super admin exists in the roles table
      const { data, error } = await supabase
        .from('roles')
        .select('id')
        .eq('role', 'super_admin')
        .limit(1);

      if (error) {
        console.error('Error checking admin users:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Error in hasAdminUsers:', error);
      return false;
    }
  }

  /**
   * Get admin user by email
   */
  static async getAdminByEmail(email: string) {
    try {
      // First get the user from auth.users
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserByEmail(email);
      
      if (authError || !authUser.user) {
        console.error('Error getting user by email:', authError);
        return null;
      }

      // Get the user's role and admin info
      const { data, error } = await supabase
        .from('roles')
        .select(`
          *,
          profile:profiles(*),
          admin_user:admin_users(
            *,
            admin_role:admin_roles(*)
          )
        `)
        .eq('user_id', authUser.user.id)
        .single();

      if (error) {
        console.error('Error getting admin by email:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getAdminByEmail:', error);
      return null;
    }
  }
}