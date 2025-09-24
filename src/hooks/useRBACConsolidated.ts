/**
 * Consolidated RBAC Hook - Combines useRBAC, useRoleGuard, and useProPermissions
 * Provides comprehensive role-based access control functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { RBACService } from '@/services/rbacService';
import { stripeService } from '@/services/stripeService';
import { 
  UserRole, 
  RoleCheckResult, 
  RolePermissions,
  AuditLog,
  getRolePermissions 
} from '../types/rbac';
import type { UserPlanInfo } from '@/types/monetization';

export interface ProPermission {
  canCreateServices: boolean;
  canFeatureEvents: boolean;
  canAccessAnalytics: boolean;
  canModerateContent: boolean;
  canManageUsers: boolean;
  canAccessAPI: boolean;
  canCreatePolls: boolean;
  canAccessVoiceControl: boolean;
}

export interface UseRBACConsolidatedReturn {
  // Role data
  role: UserRole | null;
  hasRole: boolean;
  permissions: RolePermissions;
  loading: boolean;
  error: string | null;
  
  // Admin checks
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isModerator: boolean;
  
  // Pro permissions
  proPermissions: ProPermission;
  isPro: boolean;
  planInfo: UserPlanInfo | null;
  
  // Role checking functions
  hasRequiredRole: (role: UserRole) => boolean;
  hasPermission: (permission: keyof RolePermissions) => boolean;
  hasProPermission: (permission: keyof ProPermission) => boolean;
  
  // Role guard
  checkAccess: (requirements: {
    requiredRole?: UserRole;
    requiredPermission?: keyof RolePermissions;
    requiredProPermission?: keyof ProPermission;
    requireAdmin?: boolean;
    requireSuperAdmin?: boolean;
    requirePro?: boolean;
    requireAny?: boolean;
  }) => { hasAccess: boolean; loading: boolean; reason?: string };
  
  // Actions
  refetch: () => Promise<void>;
  refreshPlanInfo: () => Promise<void>;
}

/**
 * Consolidated RBAC hook that combines all role and permission functionality
 */
export function useRBACConsolidated(): UseRBACConsolidatedReturn {
  const { user } = useAuth();
  
  // Role state
  const [roleData, setRoleData] = useState<RoleCheckResult>({
    hasRole: false,
    role: null,
    permissions: getRolePermissions('user')
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pro permissions state
  const [planInfo, setPlanInfo] = useState<UserPlanInfo | null>(null);
  const [proLoading, setProLoading] = useState(true);
  const [proError, setProError] = useState<string | null>(null);

  // Fetch user role
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

  // Fetch user plan info
  const fetchPlanInfo = useCallback(async () => {
    if (!user) {
      setPlanInfo(null);
      setProLoading(false);
      return;
    }

    try {
      setProLoading(true);
      setProError(null);
      const info = await stripeService.getUserPlanInfo(user.id);
      setPlanInfo(info);
    } catch (err) {
      console.error('Error loading user plan info:', err);
      setProError(err instanceof Error ? err.message : 'Failed to load plan information');
    } finally {
      setProLoading(false);
    }
  }, [user]);

  // Initialize data
  useEffect(() => {
    fetchRole();
    fetchPlanInfo();
  }, [fetchRole, fetchPlanInfo]);

  // Computed values
  const isAdmin = roleData.role === 'admin' || roleData.role === 'super_admin';
  const isSuperAdmin = roleData.role === 'super_admin';
  const isModerator = roleData.role === 'moderator' || isAdmin;
  const isPro = planInfo?.is_premium || false;

  // Pro permissions based on plan
  const proPermissions: ProPermission = {
    canCreateServices: planInfo?.can_create_services || false,
    canFeatureEvents: planInfo?.can_feature_events || false,
    canAccessAnalytics: planInfo?.is_premium || false,
    canModerateContent: isModerator,
    canManageUsers: isAdmin,
    canAccessAPI: planInfo?.is_premium || false,
    canCreatePolls: planInfo?.is_premium || false,
    canAccessVoiceControl: planInfo?.is_premium || false,
  };

  // Role checking functions
  const hasRequiredRole = useCallback((role: UserRole): boolean => {
    if (!roleData.hasRole) return false;
    
    const roleHierarchy: Record<UserRole, number> = {
      'user': 0,
      'artist': 1,
      'moderator': 2,
      'admin': 3,
      'super_admin': 4
    };
    
    const userLevel = roleHierarchy[roleData.role || 'user'];
    const requiredLevel = roleHierarchy[role];
    
    return userLevel >= requiredLevel;
  }, [roleData]);

  const hasPermission = useCallback((permission: keyof RolePermissions): boolean => {
    return roleData.permissions[permission] || false;
  }, [roleData.permissions]);

  const hasProPermission = useCallback((permission: keyof ProPermission): boolean => {
    return proPermissions[permission] || false;
  }, [proPermissions]);

  // Comprehensive access check
  const checkAccess = useCallback((requirements: {
    requiredRole?: UserRole;
    requiredPermission?: keyof RolePermissions;
    requiredProPermission?: keyof ProPermission;
    requireAdmin?: boolean;
    requireSuperAdmin?: boolean;
    requirePro?: boolean;
    requireAny?: boolean;
  }) => {
    if (loading || proLoading) {
      return { hasAccess: false, loading: true };
    }

    if (!user) {
      return { hasAccess: false, loading: false, reason: 'Not authenticated' };
    }

    const accessChecks: boolean[] = [];
    const reasons: string[] = [];

    // Role checks
    if (requirements.requiredRole) {
      const hasRole = hasRequiredRole(requirements.requiredRole);
      accessChecks.push(hasRole);
      if (!hasRole) reasons.push(`Requires ${requirements.requiredRole} role`);
    }

    // Permission checks
    if (requirements.requiredPermission) {
      const hasPerm = hasPermission(requirements.requiredPermission);
      accessChecks.push(hasPerm);
      if (!hasPerm) reasons.push(`Requires ${requirements.requiredPermission} permission`);
    }

    // Pro permission checks
    if (requirements.requiredProPermission) {
      const hasProPerm = hasProPermission(requirements.requiredProPermission);
      accessChecks.push(hasProPerm);
      if (!hasProPerm) reasons.push(`Requires ${requirements.requiredProPermission} pro permission`);
    }

    // Admin checks
    if (requirements.requireAdmin) {
      accessChecks.push(isAdmin);
      if (!isAdmin) reasons.push('Requires admin access');
    }

    if (requirements.requireSuperAdmin) {
      accessChecks.push(isSuperAdmin);
      if (!isSuperAdmin) reasons.push('Requires super admin access');
    }

    // Pro checks
    if (requirements.requirePro) {
      accessChecks.push(isPro);
      if (!isPro) reasons.push('Requires pro subscription');
    }

    // Determine access
    const hasAccess = accessChecks.length === 0 
      ? true 
      : requirements.requireAny 
        ? accessChecks.some(check => check) 
        : accessChecks.every(check => check);

    return { 
      hasAccess, 
      loading: false, 
      reason: hasAccess ? undefined : reasons.join(', ')
    };
  }, [loading, proLoading, user, hasRequiredRole, hasPermission, hasProPermission, isAdmin, isSuperAdmin, isPro]);

  // Refresh functions
  const refetch = useCallback(async () => {
    await Promise.all([fetchRole(), fetchPlanInfo()]);
  }, [fetchRole, fetchPlanInfo]);

  const refreshPlanInfo = useCallback(async () => {
    await fetchPlanInfo();
  }, [fetchPlanInfo]);

  return {
    // Role data
    role: roleData.role,
    hasRole: roleData.hasRole,
    permissions: roleData.permissions,
    loading: loading || proLoading,
    error: error || proError,
    
    // Admin checks
    isAdmin,
    isSuperAdmin,
    isModerator,
    
    // Pro permissions
    proPermissions,
    isPro,
    planInfo,
    
    // Role checking functions
    hasRequiredRole,
    hasPermission,
    hasProPermission,
    
    // Role guard
    checkAccess,
    
    // Actions
    refetch,
    refreshPlanInfo,
  };
}

/**
 * Convenience hooks for specific use cases
 */

// Hook for checking if user has specific role
export function useHasRole(requiredRole: UserRole) {
  const { hasRequiredRole, loading } = useRBACConsolidated();
  
  return {
    hasRole: hasRequiredRole(requiredRole),
    loading
  };
}

// Hook for checking admin status
export function useIsAdmin() {
  const { isAdmin, loading } = useRBACConsolidated();
  
  return {
    isAdmin,
    loading
  };
}

// Hook for checking super admin status
export function useIsSuperAdmin() {
  const { isSuperAdmin, loading } = useRBACConsolidated();
  
  return {
    isSuperAdmin,
    loading
  };
}

// Hook for checking pro permissions
export function useProPermissions() {
  const { proPermissions, isPro, planInfo, loading } = useRBACConsolidated();
  
  const checkPermission = (permission: keyof ProPermission): boolean => {
    return proPermissions[permission] || false;
  };

  return {
    proPermissions,
    isPro,
    planInfo,
    loading,
    checkPermission
  };
}

// Hook for role guard functionality
export function useRoleGuard(requirements: {
  requiredRole?: UserRole;
  requiredPermission?: keyof RolePermissions;
  requiredProPermission?: keyof ProPermission;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
  requirePro?: boolean;
  requireAny?: boolean;
}) {
  const { checkAccess } = useRBACConsolidated();
  
  return checkAccess(requirements);
}
