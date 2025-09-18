/**
 * AdminRoute Component
 * A specialized route guard that ensures only admins and super admins can access certain pages
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useIsAdmin } from '../hooks/useRBAC';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Shield, Lock, Loader2 } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}

/**
 * AdminRoute component that protects routes requiring admin access
 * Redirects unauthorized users to signin or shows access denied message
 */
export const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children, 
  requireSuperAdmin = false 
}) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const location = useLocation();

  // Show loading state while checking authentication and permissions
  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="text-center py-8">
            <Loader2 className="animate-spin h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Verifying admin access...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to signin if not authenticated
  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Show access denied for non-admin users
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Administrator Access Required
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              <p className="text-gray-600">
                This page requires administrator privileges to access. You do not have sufficient permissions to view this content.
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Shield className="w-4 h-4" />
                <span>Admin or Super Admin role required</span>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-400">
                  If you believe this is an error, please contact your system administrator.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is authenticated and has admin privileges
  return <>{children}</>;
};

/**
 * Utility component specifically for super admin routes
 */
export const SuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AdminRoute requireSuperAdmin={true}>
      {children}
    </AdminRoute>
  );
};
