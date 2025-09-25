/**
 * RBAC Hook
 * Provides role-based access control functionality
 */

import { useState, useEffect } from 'react';
import { rbacService, UserRole } from '@/services/rbacService';

export interface RBACState {
  role: UserRole | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isModerator: boolean;
  loading: boolean;
  error: string | null;
}

export function useRBAC() {
  const [state, setState] = useState<RBACState>({
    role: null,
    isAdmin: false,
    isSuperAdmin: false,
    isModerator: false,
    loading: true,
    error: null
  });

  useEffect(() => {
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const [role, isAdmin, isSuperAdmin, isModerator] = await Promise.all([
        rbacService.getUserRole(),
        rbacService.isAdmin(),
        rbacService.isSuperAdmin(),
        rbacService.isModerator()
      ]);

      setState({
        role,
        isAdmin,
        isSuperAdmin,
        isModerator,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error loading user role:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load user role'
      }));
    }
  };

  const hasRole = async (requiredRole: UserRole): Promise<boolean> => {
    try {
      return await rbacService.hasRole(requiredRole);
    } catch (error) {
      console.error('Error checking role:', error);
      return false;
    }
  };

  const canEditEvent = async (eventOrganizerId: string): Promise<boolean> => {
    try {
      return await rbacService.canEditEvent(eventOrganizerId);
    } catch (error) {
      console.error('Error checking edit permission:', error);
      return false;
    }
  };

  const canDeleteEvent = async (eventOrganizerId: string): Promise<boolean> => {
    try {
      return await rbacService.canDeleteEvent(eventOrganizerId);
    } catch (error) {
      console.error('Error checking delete permission:', error);
      return false;
    }
  };

  const canFeatureEvent = async (): Promise<boolean> => {
    try {
      return await rbacService.canFeatureEvent();
    } catch (error) {
      console.error('Error checking feature permission:', error);
      return false;
    }
  };

  const canModerateContent = async (): Promise<boolean> => {
    try {
      return await rbacService.canModerateContent();
    } catch (error) {
      console.error('Error checking moderation permission:', error);
      return false;
    }
  };

  const canAccessAdminPanel = async (): Promise<boolean> => {
    try {
      return await rbacService.canAccessAdminPanel();
    } catch (error) {
      console.error('Error checking admin panel access:', error);
      return false;
    }
  };

  const canManageUsers = async (): Promise<boolean> => {
    try {
      return await rbacService.canManageUsers();
    } catch (error) {
      console.error('Error checking user management permission:', error);
      return false;
    }
  };

  return {
    ...state,
    hasRole,
    canEditEvent,
    canDeleteEvent,
    canFeatureEvent,
    canModerateContent,
    canAccessAdminPanel,
    canManageUsers,
    refresh: loadUserRole
  };
}

/**
 * Hook for checking specific permissions
 */
export function usePermission(permission: UserRole | string) {
  const { role, isAdmin, isSuperAdmin, isModerator, loading } = useRBAC();

  const hasPermission = (): boolean => {
    if (loading || !role) return false;

    // Check role-based permissions
    if (typeof permission === 'string') {
      switch (permission) {
        case 'admin':
          return isAdmin;
        case 'super_admin':
          return isSuperAdmin;
        case 'moderator':
          return isModerator;
        default:
          return false;
      }
    }

    // Check specific role
    return role === permission;
  };

  return {
    hasPermission: hasPermission(),
    loading
  };
}

/**
 * Hook for admin-specific functionality
 */
export function useAdmin() {
  const rbac = useRBAC();

  const promoteUser = async (userId: string, role: UserRole): Promise<void> => {
    if (!rbac.isSuperAdmin) {
      throw new Error('Only super admins can promote users');
    }
    await rbacService.promoteUser(userId, role);
    await rbac.refresh();
  };

  const demoteUser = async (userId: string): Promise<void> => {
    if (!rbac.isSuperAdmin) {
      throw new Error('Only super admins can demote users');
    }
    await rbacService.demoteUser(userId);
    await rbac.refresh();
  };

  const getAllUsers = async (): Promise<any[]> => {
    if (!rbac.isAdmin) {
      throw new Error('Only admins can view all users');
    }
    return await rbacService.getAllUsersWithRoles();
  };

  const getAuditLogs = async (limit?: number, offset?: number): Promise<any[]> => {
    if (!rbac.isAdmin) {
      throw new Error('Only admins can view audit logs');
    }
    return await rbacService.getAuditLogs(limit, offset);
  };

  const logAction = async (
    action: string,
    targetType: string,
    targetId?: string,
    details?: any
  ): Promise<void> => {
    await rbacService.logAdminAction(action, targetType, targetId, details);
  };

  return {
    ...rbac,
    promoteUser,
    demoteUser,
    getAllUsers,
    getAuditLogs,
    logAction
  };
}

/**
 * Simple hook for checking if user is admin
 */
export function useIsAdmin() {
  const { isAdmin, loading } = useRBAC();
  return { isAdmin, loading };
}