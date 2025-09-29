/**
 * RBAC Types
 * Type definitions for role-based access control
 */

export type UserRole = 'user' | 'artist' | 'moderator' | 'admin' | 'super_admin';

export interface RolePermissions {
  canCreatePosts: boolean;
  canEditPosts: boolean;
  canDeletePosts: boolean;
  canModerateContent: boolean;
  canManageUsers: boolean;
  canAccessAnalytics: boolean;
  canManageSettings: boolean;
  canAccessAdminPanel: boolean;
}

export interface RoleCheckResult {
  hasRole: boolean;
  role: UserRole | null;
  permissions: RolePermissions;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

export function getRolePermissions(role: UserRole): RolePermissions {
  const permissions: Record<UserRole, RolePermissions> = {
    user: {
      canCreatePosts: true,
      canEditPosts: false,
      canDeletePosts: false,
      canModerateContent: false,
      canManageUsers: false,
      canAccessAnalytics: false,
      canManageSettings: false,
      canAccessAdminPanel: false,
    },
    artist: {
      canCreatePosts: true,
      canEditPosts: true,
      canDeletePosts: false,
      canModerateContent: false,
      canManageUsers: false,
      canAccessAnalytics: false,
      canManageSettings: false,
      canAccessAdminPanel: false,
    },
    moderator: {
      canCreatePosts: true,
      canEditPosts: true,
      canDeletePosts: true,
      canModerateContent: true,
      canManageUsers: false,
      canAccessAnalytics: true,
      canManageSettings: false,
      canAccessAdminPanel: false,
    },
    admin: {
      canCreatePosts: true,
      canEditPosts: true,
      canDeletePosts: true,
      canModerateContent: true,
      canManageUsers: true,
      canAccessAnalytics: true,
      canManageSettings: true,
      canAccessAdminPanel: true,
    },
    super_admin: {
      canCreatePosts: true,
      canEditPosts: true,
      canDeletePosts: true,
      canModerateContent: true,
      canManageUsers: true,
      canAccessAnalytics: true,
      canManageSettings: true,
      canAccessAdminPanel: true,
    },
  };

  return permissions[role];
}
