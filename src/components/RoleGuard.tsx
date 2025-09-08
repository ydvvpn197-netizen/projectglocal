/**
 * RoleGuard Component
 * Provides role-based access control for React components
 */

import React from 'react';
import { useRole, useHasRole, useIsAdmin, useIsSuperAdmin, useHasPermission } from '../hooks/useRBAC';
import { UserRole, RolePermissions } from '../types/rbac';

interface RoleGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: keyof RolePermissions;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
  requireAny?: boolean; // If true, user needs ANY of the specified requirements
}

/**
 * RoleGuard component that conditionally renders children based on user role/permissions
 */
export function RoleGuard({
  children,
  fallback = null,
  loading = <div>Loading...</div>,
  requiredRole,
  requiredPermission,
  requireAdmin = false,
  requireSuperAdmin = false,
  requireAny = false
}: RoleGuardProps) {
  const { role, loading: roleLoading, hasRole } = useRole();
  const { hasRole: hasRequiredRole, loading: roleCheckLoading } = useHasRole(requiredRole || 'user');
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const { isSuperAdmin, loading: superAdminLoading } = useIsSuperAdmin();
  const { hasPermission, loading: permissionLoading } = useHasPermission(requiredPermission || 'canManageUsers');

  const isLoading = roleLoading || roleCheckLoading || adminLoading || superAdminLoading || permissionLoading;

  if (isLoading) {
    return <>{loading}</>;
  }

  if (!hasRole) {
    return <>{fallback}</>;
  }

  // Check requirements
  const requirements = [];
  
  if (requiredRole) {
    requirements.push(hasRequiredRole);
  }
  
  if (requiredPermission) {
    requirements.push(hasPermission);
  }
  
  if (requireAdmin) {
    requirements.push(isAdmin);
  }
  
  if (requireSuperAdmin) {
    requirements.push(isSuperAdmin);
  }

  // If no requirements specified, allow access
  if (requirements.length === 0) {
    return <>{children}</>;
  }

  // Check if user meets requirements
  const hasAccess = requireAny 
    ? requirements.some(req => req) 
    : requirements.every(req => req);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

/**
 * Hook for conditional rendering based on role
 */
export function useRoleGuard(requirements: {
  requiredRole?: UserRole;
  requiredPermission?: keyof RolePermissions;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
  requireAny?: boolean;
}) {
  const { role, loading: roleLoading, hasRole } = useRole();
  const { hasRole: hasRequiredRole, loading: roleCheckLoading } = useHasRole(requirements.requiredRole || 'user');
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const { isSuperAdmin, loading: superAdminLoading } = useIsSuperAdmin();
  const { hasPermission, loading: permissionLoading } = useHasPermission(requirements.requiredPermission || 'canManageUsers');

  const isLoading = roleLoading || roleCheckLoading || adminLoading || superAdminLoading || permissionLoading;

  if (isLoading || !hasRole) {
    return { hasAccess: false, loading: isLoading };
  }

  const accessChecks = [];
  
  if (requirements.requiredRole) {
    accessChecks.push(hasRequiredRole);
  }
  
  if (requirements.requiredPermission) {
    accessChecks.push(hasPermission);
  }
  
  if (requirements.requireAdmin) {
    accessChecks.push(isAdmin);
  }
  
  if (requirements.requireSuperAdmin) {
    accessChecks.push(isSuperAdmin);
  }

  const hasAccess = accessChecks.length === 0 
    ? true 
    : requirements.requireAny 
      ? accessChecks.some(check => check) 
      : accessChecks.every(check => check);

  return { hasAccess, loading: false, role };
}

/**
 * Component for displaying role-specific content
 */
interface RoleContentProps {
  children: React.ReactNode;
  roles?: UserRole[];
  permissions?: (keyof RolePermissions)[];
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
  fallback?: React.ReactNode;
}

export function RoleContent({
  children,
  roles = [],
  permissions = [],
  requireAdmin = false,
  requireSuperAdmin = false,
  fallback = null
}: RoleContentProps) {
  const { hasAccess, loading } = useRoleGuard({
    requiredRole: roles.length === 1 ? roles[0] : undefined,
    requiredPermission: permissions.length === 1 ? permissions[0] : undefined,
    requireAdmin,
    requireSuperAdmin,
    requireAny: true
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

/**
 * Utility component for admin-only content
 */
export function AdminOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard requireAdmin fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Utility component for super admin-only content
 */
export function SuperAdminOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard requireSuperAdmin fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Utility component for moderator and above
 */
export function ModeratorOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard requiredRole="moderator" fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Utility component for users with specific permission
 */
export function PermissionGuard({ 
  permission, 
  children, 
  fallback = null 
}: { 
  permission: keyof RolePermissions; 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) {
  return (
    <RoleGuard requiredPermission={permission} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}
