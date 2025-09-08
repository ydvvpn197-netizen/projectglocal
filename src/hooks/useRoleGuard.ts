/**
 * useRoleGuard Hook
 * Separated from components to avoid Fast Refresh warnings
 */

import { useRole, useHasRole, useIsAdmin, useIsSuperAdmin, useHasPermission } from './useRBAC';
import { UserRole, RolePermissions } from '../types/rbac';

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
