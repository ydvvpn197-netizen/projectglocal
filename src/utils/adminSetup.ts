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
      // Check if admin already exists
      const { data: existingAdmin } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingAdmin) {
        console.log('Admin user already exists');
        return false;
      }

      // Create admin role if it doesn't exist
      const { data: adminRole } = await supabase
        .from('admin_roles')
        .select('id')
        .eq('name', 'admin')
        .single();

      let roleId = adminRole?.id;

      if (!roleId) {
        const { data: newRole, error: roleError } = await supabase
          .from('admin_roles')
          .insert({
            name: 'admin',
            description: 'Administrator role with full access',
            permissions: {
              user_management: true,
              user_moderation: true,
              content_moderation: true,
              system_settings: true,
              analytics: true,
              admin_management: true
            }
          })
          .select('id')
          .single();

        if (roleError) {
          console.error('Error creating admin role:', roleError);
          return false;
        }

        roleId = newRole.id;
      }

      // Create admin user
      const { data: newAdmin, error: adminError } = await supabase
        .from('admin_users')
        .insert({
          email: email,
          password_hash: password, // In production, this should be hashed
          role_id: roleId,
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (adminError) {
        console.error('Error creating admin user:', adminError);
        return false;
      }

      console.log('Admin user created successfully:', newAdmin.id);
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
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('is_active', true)
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
      const { data, error } = await supabase
        .from('admin_users')
        .select(`
          *,
          role:admin_roles(*)
        `)
        .eq('email', email)
        .eq('is_active', true)
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