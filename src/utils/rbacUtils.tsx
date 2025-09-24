/**
 * RBAC Utility Functions
 * Separated from components to avoid Fast Refresh warnings
 */

import React from 'react';
import { UserRole, RolePermissions } from '../types/rbac';

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
