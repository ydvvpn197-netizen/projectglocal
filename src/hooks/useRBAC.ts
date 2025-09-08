/**
 * React hooks for Role-Based Access Control (RBAC)
 * Provides easy-to-use hooks for role checking and permission management
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { RBACService } from '../services/rbacService';
import { 
  UserRole, 
  RoleCheckResult, 
  RolePermissions,
  AuditLog,
  getRolePermissions 
} from '../types/rbac';

/**
 * Hook to get current user's role and permissions
 */
export function useRole() {
  const { user } = useAuth();
  const [roleData, setRoleData] = useState<RoleCheckResult>({
    hasRole: false,
    role: null,
    permissions: getRolePermissions('user')
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRole = useCallback(async () => {
    if (!user) {
      setRoleData({
        hasRole: false,
        role: null,
        permissions: getRolePermissions('user')
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await RBACService.checkUserRole(user.id);
      setRoleData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch role');
      setRoleData({
        hasRole: false,
        role: null,
        permissions: getRolePermissions('user')
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  return {
    ...roleData,
    loading,
    error,
    refetch: fetchRole
  };
}

/**
 * Hook to check if current user has specific role
 */
export function useHasRole(requiredRole: UserRole) {
  const { user } = useAuth();
  const [hasRole, setHasRole] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setHasRole(false);
      setLoading(false);
      return;
    }

    const checkRole = async () => {
      try {
        setLoading(true);
        const result = await RBACService.hasRole(user.id, requiredRole);
        setHasRole(result);
      } catch (error) {
        console.error('Error checking role:', error);
        setHasRole(false);
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [user, requiredRole]);

  return { hasRole, loading };
}

/**
 * Hook to check if current user is admin or super admin
 */
export function useIsAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const checkAdmin = async () => {
      try {
        setLoading(true);
        const result = await RBACService.isAdminOrSuperAdmin(user.id);
        setIsAdmin(result);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [user]);

  return { isAdmin, loading };
}

/**
 * Hook to check if current user is super admin
 */
export function useIsSuperAdmin() {
  const { user } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsSuperAdmin(false);
      setLoading(false);
      return;
    }

    const checkSuperAdmin = async () => {
      try {
        setLoading(true);
        const result = await RBACService.isSuperAdmin(user.id);
        setIsSuperAdmin(result);
      } catch (error) {
        console.error('Error checking super admin status:', error);
        setIsSuperAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkSuperAdmin();
  }, [user]);

  return { isSuperAdmin, loading };
}

/**
 * Hook to check if current user has specific permission
 */
export function useHasPermission(permission: keyof RolePermissions) {
  const { user } = useAuth();
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setHasPermission(false);
      setLoading(false);
      return;
    }

    const checkPermission = async () => {
      try {
        setLoading(true);
        const result = await RBACService.hasPermission(user.id, permission);
        setHasPermission(result);
      } catch (error) {
        console.error('Error checking permission:', error);
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermission();
  }, [user, permission]);

  return { hasPermission, loading };
}

/**
 * Hook to check if current user can perform specific action
 */
export function useCanPerformAction(action: string, resourceType?: string) {
  const { user } = useAuth();
  const [canPerform, setCanPerform] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCanPerform(false);
      setLoading(false);
      return;
    }

    const checkAction = async () => {
      try {
        setLoading(true);
        const result = await RBACService.canPerformAction(action, resourceType);
        setCanPerform(result);
      } catch (error) {
        console.error('Error checking action permission:', error);
        setCanPerform(false);
      } finally {
        setLoading(false);
      }
    };

    checkAction();
  }, [user, action, resourceType]);

  return { canPerform, loading };
}

/**
 * Hook to manage user roles (admin only)
 */
export function useRoleManagement() {
  const [users, setUsers] = useState<Array<{ user_id: string; role: UserRole; email?: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await RBACService.getAllUsersWithRoles();
      setUsers(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserRole = useCallback(async (userId: string, newRole: UserRole, adminUserId: string) => {
    try {
      setError(null);
      const success = await RBACService.updateUserRole(userId, newRole, adminUserId);
      if (success) {
        // Refresh users list
        await fetchUsers();
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user role');
      return false;
    }
  }, [fetchUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    updateUserRole
  };
}

/**
 * Hook to access audit logs (admin only)
 */
export function useAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async (limit: number = 100, offset: number = 0) => {
    try {
      setLoading(true);
      setError(null);
      const result = await RBACService.getAuditLogs(limit, offset);
      setLogs(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    loading,
    error,
    fetchLogs
  };
}

/**
 * Hook to log admin actions
 */
export function useAdminActionLogger() {
  const { user } = useAuth();

  const logAction = useCallback(async (action: {
    action: string;
    resourceType: string;
    resourceId?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }) => {
    if (!user) {
      throw new Error('User must be authenticated to log actions');
    }

    try {
      const success = await RBACService.logAdminAction(user.id, action);
      if (!success) {
        throw new Error('Failed to log admin action');
      }
      return success;
    } catch (error) {
      console.error('Error logging admin action:', error);
      throw error;
    }
  }, [user]);

  return { logAction };
}
