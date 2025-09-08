/**
 * RBAC Utility Functions
 * Separated from components to avoid Fast Refresh warnings
 */

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
  // This function will be implemented in the hook file
  // This is just a placeholder to avoid Fast Refresh warnings
  return { hasAccess: false, loading: false, role: null as UserRole | null };
}

/**
 * Higher-order component for role-based access control
 */
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  guardProps: {
    fallback?: React.ReactNode;
    loading?: React.ReactNode;
    requiredRole?: UserRole;
    requiredPermission?: keyof RolePermissions;
    requireAdmin?: boolean;
    requireSuperAdmin?: boolean;
    requireAny?: boolean;
  }
) {
  return function RoleGuardedComponent(props: P) {
    // This will be implemented properly in the component file
    return <Component {...props} />;
  };
}
