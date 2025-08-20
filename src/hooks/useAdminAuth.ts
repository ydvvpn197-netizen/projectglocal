import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminService } from '@/services/adminService';
import { 
  AdminUser, 
  AdminPermissions, 
  UseAdminAuthReturn 
} from '@/types/admin';

export const useAdminAuth = (): UseAdminAuthReturn => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [permissions, setPermissions] = useState<AdminPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const adminService = new AdminService();

  // Check if user is admin and load admin data
  const checkAdminStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAdminUser(null);
        setPermissions(null);
        return;
      }

      const isAdmin = await adminService.isAdmin();
      if (!isAdmin) {
        setAdminUser(null);
        setPermissions(null);
        return;
      }

      const adminData = await adminService.getCurrentAdminUser();
      if (adminData) {
        setAdminUser(adminData);
        setPermissions(adminData.role?.permissions || null);
        
        // Update last login
        await adminService.updateLastLogin(adminData.id);
      }
    } catch (err) {
      console.error('Error checking admin status:', err);
      setError('Failed to verify admin status');
      setAdminUser(null);
      setPermissions(null);
    } finally {
      setIsLoading(false);
    }
  }, [adminService]);

  // Admin login (uses regular auth but checks admin status)
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!data.user) {
        throw new Error('Login failed');
      }

      // Check if user is admin
      const isAdmin = await adminService.isAdmin();
      if (!isAdmin) {
        throw new Error('Access denied. Admin privileges required.');
      }

      // Load admin data
      const adminData = await adminService.getCurrentAdminUser();
      if (adminData) {
        setAdminUser(adminData);
        setPermissions(adminData.role?.permissions || null);
        
        // Update last login
        await adminService.updateLastLogin(adminData.id);
      } else {
        throw new Error('Failed to load admin data');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [adminService]);

  // Admin logout
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Log the logout action
      if (adminUser) {
        await adminService.logAction('logout', 'admin_session', adminUser.id);
      }

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }

      setAdminUser(null);
      setPermissions(null);
    } catch (err) {
      console.error('Admin logout error:', err);
      setError('Logout failed');
    } finally {
      setIsLoading(false);
    }
  }, [adminService, adminUser]);

  // Check if admin has specific permission
  const checkPermission = useCallback((permission: string): boolean => {
    if (!permissions) return false;

    // Check if permission exists in any category
    for (const category in permissions) {
      const categoryPermissions = permissions[category];
      if (Array.isArray(categoryPermissions) && categoryPermissions.includes(permission)) {
        return true;
      }
    }

    return false;
  }, [permissions]);

  // Check if admin has specific role
  const hasRole = useCallback((role: string): boolean => {
    if (!adminUser?.role) return false;
    return adminUser.role.name === role;
  }, [adminUser]);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await checkAdminStatus();
        } else if (event === 'SIGNED_OUT') {
          setAdminUser(null);
          setPermissions(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [checkAdminStatus]);

  // Initial check
  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  return {
    adminUser,
    permissions,
    isLoading,
    error,
    login,
    logout,
    checkPermission,
    hasRole
  };
};
