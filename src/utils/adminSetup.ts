/**
 * Admin Setup Utilities
 * 
 * This file contains utilities for setting up the initial admin system
 * and creating the first admin user.
 */

import { supabase } from '@/integrations/supabase/client';
import { AdminService } from '@/services/adminService';

export interface AdminSetupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin';
}

export class AdminSetup {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  /**
   * Check if any admin users exist
   */
  async hasAdminUsers(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .limit(1);

      if (error) {
        console.error('Error checking admin users:', error);
        return false;
      }

      return (data && data.length > 0);
    } catch (error) {
      console.error('Error checking admin users:', error);
      return false;
    }
  }

  /**
   * Create the first admin user
   */
  async createFirstAdmin(setupData: AdminSetupData): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if admin users already exist
      const hasAdmins = await this.hasAdminUsers();
      if (hasAdmins) {
        return { success: false, error: 'Admin users already exist' };
      }

      // Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: setupData.email,
        password: setupData.password,
        options: {
          data: {
            first_name: setupData.firstName,
            last_name: setupData.lastName,
            user_type: 'admin'
          }
        }
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Failed to create user account' };
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          username: `${setupData.firstName.toLowerCase()}_${setupData.lastName.toLowerCase()}`,
          display_name: `${setupData.firstName} ${setupData.lastName}`,
          full_name: `${setupData.firstName} ${setupData.lastName}`,
          email: setupData.email,
          user_type: 'admin',
          is_verified: true
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Continue anyway, profile can be created later
      }

      // Get or create the admin role
      let roleId: string;
      if (setupData.role === 'super_admin') {
        roleId = await this.getOrCreateSuperAdminRole();
      } else {
        roleId = await this.getOrCreateAdminRole();
      }

      // Create admin user record
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert({
          user_id: authData.user.id,
          role_id: roleId,
          is_active: true,
          two_factor_enabled: false,
          ip_whitelist: []
        });

      if (adminError) {
        return { success: false, error: adminError.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error creating first admin:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Get or create super admin role
   */
  private async getOrCreateSuperAdminRole(): Promise<string> {
    try {
      // Check if super admin role exists
      const { data: existingRole, error: fetchError } = await supabase
        .from('admin_roles')
        .select('id')
        .eq('name', 'super_admin')
        .single();

      if (existingRole) {
        return existingRole.id;
      }

      // Create super admin role
      const { data: newRole, error: createError } = await supabase
        .from('admin_roles')
        .insert({
          name: 'super_admin',
          display_name: 'Super Administrator',
          description: 'Full system access with all permissions',
          permissions: {
            users: ['view', 'create', 'update', 'delete', 'suspend', 'ban'],
            content: ['view', 'create', 'update', 'delete', 'moderate'],
            admin: ['view', 'create', 'update', 'delete', 'manage'],
            analytics: ['view', 'export'],
            settings: ['view', 'update'],
            moderation: ['view', 'manage', 'escalate'],
            system: ['view', 'manage', 'maintenance']
          },
          is_active: true
        })
        .select('id')
        .single();

      if (createError || !newRole) {
        throw new Error('Failed to create super admin role');
      }

      return newRole.id;
    } catch (error) {
      console.error('Error getting/creating super admin role:', error);
      throw error;
    }
  }

  /**
   * Get or create admin role
   */
  private async getOrCreateAdminRole(): Promise<string> {
    try {
      // Check if admin role exists
      const { data: existingRole, error: fetchError } = await supabase
        .from('admin_roles')
        .select('id')
        .eq('name', 'admin')
        .single();

      if (existingRole) {
        return existingRole.id;
      }

      // Create admin role
      const { data: newRole, error: createError } = await supabase
        .from('admin_roles')
        .insert({
          name: 'admin',
          display_name: 'Administrator',
          description: 'General administration with most permissions',
          permissions: {
            users: ['view', 'update', 'suspend'],
            content: ['view', 'moderate', 'delete'],
            analytics: ['view'],
            settings: ['view'],
            moderation: ['view', 'manage']
          },
          is_active: true
        })
        .select('id')
        .single();

      if (createError || !newRole) {
        throw new Error('Failed to create admin role');
      }

      return newRole.id;
    } catch (error) {
      console.error('Error getting/creating admin role:', error);
      throw error;
    }
  }

  /**
   * Initialize default admin roles
   */
  async initializeDefaultRoles(): Promise<{ success: boolean; error?: string }> {
    try {
      const defaultRoles = [
        {
          name: 'super_admin',
          display_name: 'Super Administrator',
          description: 'Full system access with all permissions',
          permissions: {
            users: ['view', 'create', 'update', 'delete', 'suspend', 'ban'],
            content: ['view', 'create', 'update', 'delete', 'moderate'],
            admin: ['view', 'create', 'update', 'delete', 'manage'],
            analytics: ['view', 'export'],
            settings: ['view', 'update'],
            moderation: ['view', 'manage', 'escalate'],
            system: ['view', 'manage', 'maintenance']
          }
        },
        {
          name: 'admin',
          display_name: 'Administrator',
          description: 'General administration with most permissions',
          permissions: {
            users: ['view', 'update', 'suspend'],
            content: ['view', 'moderate', 'delete'],
            analytics: ['view'],
            settings: ['view'],
            moderation: ['view', 'manage']
          }
        },
        {
          name: 'moderator',
          display_name: 'Content Moderator',
          description: 'Content moderation and user management',
          permissions: {
            users: ['view', 'suspend'],
            content: ['view', 'moderate', 'delete'],
            analytics: ['view'],
            moderation: ['view', 'manage']
          }
        },
        {
          name: 'support',
          display_name: 'Support Agent',
          description: 'Customer support and basic user assistance',
          permissions: {
            users: ['view'],
            content: ['view'],
            moderation: ['view']
          }
        }
      ];

      for (const role of defaultRoles) {
        // Check if role exists
        const { data: existingRole } = await supabase
          .from('admin_roles')
          .select('id')
          .eq('name', role.name)
          .single();

        if (!existingRole) {
          // Create role
          const { error } = await supabase
            .from('admin_roles')
            .insert({
              ...role,
              is_active: true
            });

          if (error) {
            console.error(`Error creating role ${role.name}:`, error);
          }
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error initializing default roles:', error);
      return { success: false, error: 'Failed to initialize default roles' };
    }
  }

  /**
   * Initialize system settings
   */
  async initializeSystemSettings(): Promise<{ success: boolean; error?: string }> {
    try {
      const defaultSettings = [
        {
          setting_key: 'platform_name',
          setting_value: '"Glocal"',
          setting_type: 'string',
          description: 'Platform display name',
          is_public: true
        },
        {
          setting_key: 'platform_description',
          setting_value: '"Connect with your local community"',
          setting_type: 'string',
          description: 'Platform description',
          is_public: true
        },
        {
          setting_key: 'maintenance_mode',
          setting_value: 'false',
          setting_type: 'boolean',
          description: 'Enable maintenance mode',
          is_public: false
        },
        {
          setting_key: 'registration_enabled',
          setting_value: 'true',
          setting_type: 'boolean',
          description: 'Allow new user registrations',
          is_public: false
        },
        {
          setting_key: 'email_verification_required',
          setting_value: 'true',
          setting_type: 'boolean',
          description: 'Require email verification for new users',
          is_public: false
        },
        {
          setting_key: 'max_file_size_mb',
          setting_value: '10',
          setting_type: 'number',
          description: 'Maximum file upload size in MB',
          is_public: false
        },
        {
          setting_key: 'allowed_file_types',
          setting_value: '["jpg", "jpeg", "png", "gif", "pdf"]',
          setting_type: 'array',
          description: 'Allowed file types for uploads',
          is_public: false
        },
        {
          setting_key: 'content_moderation_enabled',
          setting_value: 'true',
          setting_type: 'boolean',
          description: 'Enable automatic content moderation',
          is_public: false
        },
        {
          setting_key: 'location_services_enabled',
          setting_value: 'true',
          setting_type: 'boolean',
          description: 'Enable location-based features',
          is_public: false
        },
        {
          setting_key: 'notification_settings',
          setting_value: '{"email": true, "push": true, "sms": false}',
          setting_type: 'json',
          description: 'Default notification settings',
          is_public: false
        }
      ];

      for (const setting of defaultSettings) {
        // Check if setting exists
        const { data: existingSetting } = await supabase
          .from('system_settings')
          .select('id')
          .eq('setting_key', setting.setting_key)
          .single();

        if (!existingSetting) {
          // Create setting
          const { error } = await supabase
            .from('system_settings')
            .insert(setting);

          if (error) {
            console.error(`Error creating setting ${setting.setting_key}:`, error);
          }
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error initializing system settings:', error);
      return { success: false, error: 'Failed to initialize system settings' };
    }
  }

  /**
   * Complete admin setup
   */
  async completeSetup(setupData: AdminSetupData): Promise<{ success: boolean; error?: string }> {
    try {
      // Initialize default roles
      const rolesResult = await this.initializeDefaultRoles();
      if (!rolesResult.success) {
        return rolesResult;
      }

      // Initialize system settings
      const settingsResult = await this.initializeSystemSettings();
      if (!settingsResult.success) {
        return settingsResult;
      }

      // Create first admin user
      const adminResult = await this.createFirstAdmin(setupData);
      if (!adminResult.success) {
        return adminResult;
      }

      return { success: true };
    } catch (error) {
      console.error('Error completing admin setup:', error);
      return { success: false, error: 'Failed to complete admin setup' };
    }
  }
}

export const adminSetup = new AdminSetup();
