import React from 'react';
import { AdminAuthGuard } from './AdminAuthGuard';

// Higher-order component for protecting admin routes
export const withAdminAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requiredPermission?: string;
    requiredRole?: string;
    fallback?: React.ReactNode;
  }
) => {
  const WrappedComponent = React.forwardRef<HTMLElement, P>((props, ref) => (
    <AdminAuthGuard
      requiredPermission={options?.requiredPermission}
      requiredRole={options?.requiredRole}
      fallback={options?.fallback}
    >
      <Component {...props} ref={ref} />
    </AdminAuthGuard>
  ));

  WrappedComponent.displayName = `withAdminAuth(${Component.displayName || Component.name})`;
  return WrappedComponent;
};
