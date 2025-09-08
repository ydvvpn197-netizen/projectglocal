/**
 * Role-Based Access Control (RBAC) Service
 * Provides functions for role management and permission checking
 */

import { supabase } from '../integrations/supabase/client';
import { 
  UserRole, 
  Role, 
  AuditLog, 
  RoleCheckResult, 
  AdminAction,
  getRolePermissions,
  hasPermission,
  isAdminOrHigher,
  isSuperAdmin
} from '../types/rbac';

export class RBACService {
  /**
   * Get user role from database
   */
  static async getUserRole(userId: string): Promise<UserRole | null> {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }

      return data?.role || null;
    } catch (error) {
      console.error('Error in getUserRole:', error);
      return null;
    }
  }

  /**
   * Get user role with full role information
   */
  static async getRole(userId: string): Promise<Role | null> {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching role:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getRole:', error);
      return null;
    }
  }

  /**
   * Check if user has specific role
   */
  static async hasRole(userId: string, requiredRole: UserRole): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('has_role', {
          user_uuid: userId,
          required_role: requiredRole
        });

      if (error) {
        console.error('Error checking role:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Error in hasRole:', error);
      return false;
    }
  }

  /**
   * Check if user is admin or super admin
   */
  static async isAdminOrSuperAdmin(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('is_admin_or_super_admin', {
          user_uuid: userId
        });

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Error in isAdminOrSuperAdmin:', error);
      return false;
    }
  }

  /**
   * Check if user is super admin
   */
  static async isSuperAdmin(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('is_super_admin', {
          user_uuid: userId
        });

      if (error) {
        console.error('Error checking super admin status:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Error in isSuperAdmin:', error);
      return false;
    }
  }

  /**
   * Comprehensive role check with permissions
   */
  static async checkUserRole(userId: string): Promise<RoleCheckResult> {
    try {
      const role = await this.getUserRole(userId);
      
      if (!role) {
        return {
          hasRole: false,
          role: null,
          permissions: getRolePermissions('user')
        };
      }

      return {
        hasRole: true,
        role,
        permissions: getRolePermissions(role)
      };
    } catch (error) {
      console.error('Error in checkUserRole:', error);
      return {
        hasRole: false,
        role: null,
        permissions: getRolePermissions('user')
      };
    }
  }

  /**
   * Check if user has specific permission
   */
  static async hasPermission(userId: string, permission: keyof typeof getRolePermissions): Promise<boolean> {
    try {
      const role = await this.getUserRole(userId);
      if (!role) return false;

      return hasPermission(role, permission);
    } catch (error) {
      console.error('Error in hasPermission:', error);
      return false;
    }
  }

  /**
   * Update user role (super admin only)
   */
  static async updateUserRole(userId: string, newRole: UserRole, adminUserId: string): Promise<boolean> {
    try {
      // Check if admin is super admin
      const isAdmin = await this.isSuperAdmin(adminUserId);
      if (!isAdmin) {
        throw new Error('Only super admins can update user roles');
      }

      const { error } = await supabase
        .from('roles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating user role:', error);
        return false;
      }

      // Log the admin action
      await this.logAdminAction(adminUserId, {
        action: 'update_user_role',
        resourceType: 'user',
        resourceId: userId,
        details: { newRole, userId }
      });

      return true;
    } catch (error) {
      console.error('Error in updateUserRole:', error);
      return false;
    }
  }

  /**
   * Get all users with their roles (admin only)
   */
  static async getAllUsersWithRoles(): Promise<Array<{ user_id: string; role: UserRole; email?: string }>> {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select(`
          user_id,
          role,
          profiles!inner(email)
        `);

      if (error) {
        console.error('Error fetching users with roles:', error);
        return [];
      }

      return data?.map(item => ({
        user_id: item.user_id,
        role: item.role,
        email: item.profiles?.email
      })) || [];
    } catch (error) {
      console.error('Error in getAllUsersWithRoles:', error);
      return [];
    }
  }

  /**
   * Log admin action to audit log
   */
  static async logAdminAction(adminUserId: string, action: AdminAction): Promise<boolean> {
    try {
      const { error } = await supabase
        .rpc('log_admin_action', {
          admin_uuid: adminUserId,
          action_text: action.action,
          resource_type_text: action.resourceType,
          resource_uuid: action.resourceId || null,
          details_json: action.details || {},
          ip_addr: action.ipAddress || null,
          user_agent_text: action.userAgent || null
        });

      if (error) {
        console.error('Error logging admin action:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in logAdminAction:', error);
      return false;
    }
  }

  /**
   * Get audit logs (admin only)
   */
  static async getAuditLogs(limit: number = 100, offset: number = 0): Promise<AuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching audit logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAuditLogs:', error);
      return [];
    }
  }

  /**
   * Check if current user can perform action
   */
  static async canPerformAction(action: string, resourceType?: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const role = await this.getUserRole(user.id);
      if (!role) return false;

      // Define action permissions
      const actionPermissions: Record<string, keyof typeof getRolePermissions> = {
        'manage_users': 'canManageUsers',
        'manage_events': 'canManageEvents',
        'manage_content': 'canManageContent',
        'view_analytics': 'canViewAnalytics',
        'manage_system': 'canManageSystem',
        'mark_featured': 'canMarkFeatured',
        'moderate_content': 'canModerateContent',
        'view_audit_logs': 'canViewAuditLogs'
      };

      const permission = actionPermissions[action];
      if (!permission) return false;

      return hasPermission(role, permission);
    } catch (error) {
      console.error('Error in canPerformAction:', error);
      return false;
    }
  }

  /**
   * Get current user's role and permissions
   */
  static async getCurrentUserRole(): Promise<RoleCheckResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          hasRole: false,
          role: null,
          permissions: getRolePermissions('user')
        };
      }

      return await this.checkUserRole(user.id);
    } catch (error) {
      console.error('Error in getCurrentUserRole:', error);
      return {
        hasRole: false,
        role: null,
        permissions: getRolePermissions('user')
      };
    }
  }
}

// Export convenience functions
export const {
  getUserRole,
  getRole,
  hasRole,
  isAdminOrSuperAdmin,
  isSuperAdmin,
  checkUserRole,
  hasPermission,
  updateUserRole,
  getAllUsersWithRoles,
  logAdminAction,
  getAuditLogs,
  canPerformAction,
  getCurrentUserRole
} = RBACService;
