/**
 * RBAC (Role-Based Access Control) Service
 * Manages user roles and permissions
 */

import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'super_admin' | 'admin' | 'moderator' | 'user';

export interface Role {
  id: string;
  userId: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  adminUserId: string;
  action: string;
  targetType: string;
  targetId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export class RBACService {
  private static instance: RBACService;

  static getInstance(): RBACService {
    if (!RBACService.instance) {
      RBACService.instance = new RBACService();
    }
    return RBACService.instance;
  }

  /**
   * Get current user's role
   */
  async getUserRole(): Promise<UserRole | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }

    return data?.role || 'user';
  }

  /**
   * Check if current user is admin
   */
  async isAdmin(): Promise<boolean> {
    const role = await this.getUserRole();
    return role === 'admin' || role === 'super_admin';
  }

  /**
   * Check if current user is super admin
   */
  async isSuperAdmin(): Promise<boolean> {
    const role = await this.getUserRole();
    return role === 'super_admin';
  }

  /**
   * Check if current user is moderator
   */
  async isModerator(): Promise<boolean> {
    const role = await this.getUserRole();
    return role === 'moderator' || role === 'admin' || role === 'super_admin';
  }

  /**
   * Check if current user has specific role
   */
  async hasRole(requiredRole: UserRole): Promise<boolean> {
    const userRole = await this.getUserRole();
    if (!userRole) return false;

    const roleHierarchy: Record<UserRole, number> = {
      'user': 0,
      'moderator': 1,
      'admin': 2,
      'super_admin': 3
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }

  /**
   * Get all users with their roles (admin only)
   */
  async getAllUsersWithRoles(): Promise<Array<{
    id: string;
    email: string;
    role: UserRole;
    created_at: string;
    role_created_at: string;
    display_name?: string;
    avatar_url?: string;
  }>> {
    const { data, error } = await supabase
      .from('admin_dashboard')
      .select('*')
      .order('role_created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Promote user to admin (super admin only)
   */
  async promoteUser(userId: string, role: UserRole): Promise<void> {
    const { data, error } = await supabase.rpc('promote_user_to_admin', {
      target_user_id: userId,
      new_role: role
    });

    if (error) throw error;
  }

  /**
   * Demote user to regular user (super admin only)
   */
  async demoteUser(userId: string): Promise<void> {
    const { data, error } = await supabase.rpc('demote_user', {
      target_user_id: userId
    });

    if (error) throw error;
  }

  /**
   * Get audit logs (admin only)
   */
  async getAuditLogs(limit: number = 50, offset: number = 0): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        admin_user:admin_user_id (
          email,
          profiles (
            display_name,
            avatar_url
          )
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  /**
   * Log admin action
   */
  async logAdminAction(
    action: string,
    targetType: string,
    targetId?: string,
    details?: Record<string, unknown>
  ): Promise<void> {
    const { error } = await supabase.rpc('log_admin_action', {
      action_type: action,
      target_type: targetType,
      target_uuid: targetId,
      action_details: details,
      client_ip: null, // Will be set by the function
      client_user_agent: null // Will be set by the function
    });

    if (error) {
      console.error('Error logging admin action:', error);
      // Don't throw error as logging shouldn't break the main flow
    }
  }

  /**
   * Check if user can edit event
   */
  async canEditEvent(eventOrganizerId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // User can edit their own events
    if (user.id === eventOrganizerId) return true;

    // Admins can edit any event
    return await this.isAdmin();
  }

  /**
   * Check if user can delete event
   */
  async canDeleteEvent(eventOrganizerId: string): Promise<boolean> {
    return await this.canEditEvent(eventOrganizerId);
  }

  /**
   * Check if user can mark event as featured
   */
  async canFeatureEvent(): Promise<boolean> {
    return await this.isAdmin();
  }

  /**
   * Check if user can moderate content
   */
  async canModerateContent(): Promise<boolean> {
    return await this.isModerator();
  }

  /**
   * Check if user can access admin panel
   */
  async canAccessAdminPanel(): Promise<boolean> {
    return await this.isAdmin();
  }

  /**
   * Check if user can manage users
   */
  async canManageUsers(): Promise<boolean> {
    return await this.isSuperAdmin();
  }

  /**
   * Get role display name
   */
  getRoleDisplayName(role: UserRole): string {
    const displayNames: Record<UserRole, string> = {
      'user': 'User',
      'moderator': 'Moderator',
      'admin': 'Administrator',
      'super_admin': 'Super Administrator'
    };
    return displayNames[role];
  }

  /**
   * Get role color for UI
   */
  getRoleColor(role: UserRole): string {
    const colors: Record<UserRole, string> = {
      'user': 'gray',
      'moderator': 'blue',
      'admin': 'green',
      'super_admin': 'purple'
    };
    return colors[role];
  }

  /**
   * Get role description
   */
  getRoleDescription(role: UserRole): string {
    const descriptions: Record<UserRole, string> = {
      'user': 'Regular user with basic permissions',
      'moderator': 'Can moderate content and manage community',
      'admin': 'Can manage events, users, and platform settings',
      'super_admin': 'Full platform access including user management'
    };
    return descriptions[role];
  }

  /**
   * Get permissions for a role
   */
  getRolePermissions(role: UserRole): string[] {
    const permissions: Record<UserRole, string[]> = {
      'user': [
        'create_events',
        'edit_own_events',
        'delete_own_events',
        'create_posts',
        'comment_on_posts',
        'like_content',
        'use_legal_assistant',
        'create_life_wishes'
      ],
      'moderator': [
        'all_user_permissions',
        'moderate_content',
        'delete_any_posts',
        'ban_users',
        'manage_reports'
      ],
      'admin': [
        'all_moderator_permissions',
        'feature_events',
        'manage_events',
        'access_admin_panel',
        'view_analytics',
        'manage_platform_settings'
      ],
      'super_admin': [
        'all_admin_permissions',
        'manage_users',
        'promote_users',
        'demote_users',
        'view_audit_logs',
        'full_platform_control'
      ]
    };
    return permissions[role];
  }
}

export const rbacService = RBACService.getInstance();
