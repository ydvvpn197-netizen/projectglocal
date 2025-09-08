/**
 * Role-Based Access Control (RBAC) Types
 * Defines user roles, permissions, and related interfaces
 */

export type UserRole = 'super_admin' | 'admin' | 'moderator' | 'user';

export interface Role {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  admin_user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface RolePermissions {
  canManageUsers: boolean;
  canManageEvents: boolean;
  canManageContent: boolean;
  canViewAnalytics: boolean;
  canManageSystem: boolean;
  canMarkFeatured: boolean;
  canModerateContent: boolean;
  canViewAuditLogs: boolean;
}

export interface UserWithRole {
  id: string;
  email: string;
  role: UserRole;
  permissions: RolePermissions;
}

export interface RoleCheckResult {
  hasRole: boolean;
  role: UserRole | null;
  permissions: RolePermissions;
}

export interface AdminAction {
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// Role hierarchy for permission inheritance
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 0,
  moderator: 1,
  admin: 2,
  super_admin: 3,
};

// Permission definitions for each role
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  user: {
    canManageUsers: false,
    canManageEvents: false,
    canManageContent: false,
    canViewAnalytics: false,
    canManageSystem: false,
    canMarkFeatured: false,
    canModerateContent: false,
    canViewAuditLogs: false,
  },
  moderator: {
    canManageUsers: false,
    canManageEvents: false,
    canManageContent: true,
    canViewAnalytics: false,
    canManageSystem: false,
    canMarkFeatured: false,
    canModerateContent: true,
    canViewAuditLogs: false,
  },
  admin: {
    canManageUsers: true,
    canManageEvents: true,
    canManageContent: true,
    canViewAnalytics: true,
    canManageSystem: false,
    canMarkFeatured: true,
    canModerateContent: true,
    canViewAuditLogs: true,
  },
  super_admin: {
    canManageUsers: true,
    canManageEvents: true,
    canManageContent: true,
    canViewAnalytics: true,
    canManageSystem: true,
    canMarkFeatured: true,
    canModerateContent: true,
    canViewAuditLogs: true,
  },
};

// Helper function to get permissions for a role
export function getRolePermissions(role: UserRole): RolePermissions {
  return ROLE_PERMISSIONS[role];
}

// Helper function to check if a role has a specific permission
export function hasPermission(role: UserRole, permission: keyof RolePermissions): boolean {
  return ROLE_PERMISSIONS[role][permission];
}

// Helper function to check if a role is higher than another
export function isRoleHigher(role1: UserRole, role2: UserRole): boolean {
  return ROLE_HIERARCHY[role1] > ROLE_HIERARCHY[role2];
}

// Helper function to check if a role is admin or higher
export function isAdminOrHigher(role: UserRole): boolean {
  return role === 'admin' || role === 'super_admin';
}

// Helper function to check if a role is super admin
export function isSuperAdmin(role: UserRole): boolean {
  return role === 'super_admin';
}
