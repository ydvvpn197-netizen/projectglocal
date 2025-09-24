import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminLogin } from './AdminLogin';
import { Loader2 } from 'lucide-react';
import { AdminSetup } from '@/utils/adminSetup';

interface AdminAuthGuardProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
  fallback?: React.ReactNode;
}

export const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({
  children,
  requiredPermission,
  requiredRole,
  fallback
}) => {
  const { adminUser, permissions, isLoading, checkPermission, hasRole } = useAdminAuth();
  const location = useLocation();
  const [hasAdmins, setHasAdmins] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const hasAdmins = await AdminSetup.hasAdminUsers();
        setHasAdmins(hasAdmins);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setHasAdmins(true); // Assume admins exist on error
      }
    };

    checkAdminStatus();
  }, []);

  // Show loading spinner while checking auth status or admin existence
  if (isLoading || hasAdmins === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Redirect to setup if no admins exist
  if (hasAdmins === false) {
    return <Navigate to="/admin/setup" replace />;
  }

  // If not authenticated as admin, redirect to admin login
  if (!adminUser) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check required permission
  if (requiredPermission && !checkPermission(requiredPermission)) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access this page.
            </p>
            <p className="text-sm text-muted-foreground">
              Required permission: {requiredPermission}
            </p>
          </div>
        </div>
      )
    );
  }

  // Check required role
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">
              You don't have the required role to access this page.
            </p>
            <p className="text-sm text-muted-foreground">
              Required role: {requiredRole}
            </p>
          </div>
        </div>
      )
    );
  }

  // If all checks pass, render children
  return <>{children}</>;
};
