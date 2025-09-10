import { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [adminSession, setAdminSession] = useState<string | null>(null);

  const adminService = useMemo(() => new AdminService(), []);

  // Check if user is admin and load admin data
  const checkAdminStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if we have an admin session token
      const storedAdminSession = localStorage.getItem('admin_session_token');
      if (!storedAdminSession) {
        setAdminUser(null);
        setPermissions(null);
        setAdminSession(null);
        return;
      }

      // Verify the admin session is still valid
      const isValidSession = await adminService.verifyAdminSession(storedAdminSession);
      if (!isValidSession) {
        // Clear invalid session
        localStorage.removeItem('admin_session_token');
        setAdminUser(null);
        setPermissions(null);
        setAdminSession(null);
        return;
      }

      // Load admin data using the session
      const adminData = await adminService.getAdminBySession(storedAdminSession);
      if (adminData) {
        setAdminUser(adminData);
        setPermissions(adminData.role?.permissions || null);
        setAdminSession(storedAdminSession);
        
        // Update last login
        await adminService.updateLastLogin(adminData.id);
      } else {
        // Clear invalid session
        localStorage.removeItem('admin_session_token');
        setAdminUser(null);
        setPermissions(null);
        setAdminSession(null);
      }
    } catch (err) {
      console.error('Error checking admin status:', err);
      setError('Failed to verify admin status');
      setAdminUser(null);
      setPermissions(null);
      setAdminSession(null);
      localStorage.removeItem('admin_session_token');
    } finally {
      setIsLoading(false);
    }
  }, [adminService]);

  // Admin login (completely separate from regular user auth)
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // First, check if the email exists in admin_users table
      const adminExists = await adminService.checkAdminExists(email);
      if (!adminExists) {
        throw new Error('Access denied. Admin privileges required.');
      }

      // Create a separate admin session (not using Supabase auth)
      const adminSessionToken = await adminService.createAdminSession(email, password);
      if (!adminSessionToken) {
        throw new Error('Invalid admin credentials');
      }

      // Store the admin session token
      localStorage.setItem('admin_session_token', adminSessionToken);
      setAdminSession(adminSessionToken);

      // Load admin data
      const adminData = await adminService.getAdminBySession(adminSessionToken);
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
      if (adminUser && adminSession) {
        await adminService.logAction('logout', 'admin_session', adminUser.id);
        await adminService.invalidateAdminSession(adminSession);
      }

      // Clear admin session
      localStorage.removeItem('admin_session_token');
      setAdminUser(null);
      setPermissions(null);
      setAdminSession(null);
    } catch (err) {
      console.error('Admin logout error:', err);
      setError('Logout failed');
    } finally {
      setIsLoading(false);
    }
  }, [adminService, adminUser, adminSession]);

  // Check if admin has specific permission
  const checkPermission = useCallback((permission: string): boolean => {
    if (!permissions) return false;
    return permissions[permission as keyof AdminPermissions] === true;
  }, [permissions]);

  // Check if admin has specific role
  const hasRole = useCallback((role: string): boolean => {
    if (!adminUser?.role) return false;
    return adminUser.role.name === role;
  }, [adminUser]);

  // Check if admin is super admin
  const isSuperAdmin = useCallback((): boolean => {
    return hasRole('super_admin');
  }, [hasRole]);

  // Initialize admin auth on mount
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
    hasRole,
    isSuperAdmin,
    checkAdminStatus,
    isAuthenticated: !!adminUser && !!adminSession
  };
};