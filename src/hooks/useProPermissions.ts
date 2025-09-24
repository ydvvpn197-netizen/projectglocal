import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { ProPermissionService, ProPermission } from '@/services/proPermissionService';

export interface UseProPermissionsReturn {
  permissions: ProPermission | null;
  loading: boolean;
  error: string | null;
  canCommentOnNews: boolean;
  canFeatureListing: boolean;
  hasPrioritySupport: boolean;
  isPro: boolean;
  refreshPermissions: () => Promise<void>;
  checkPermission: (permission: keyof ProPermission) => boolean;
}

export function useProPermissions(): UseProPermissionsReturn {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<ProPermission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPermissions = useCallback(async () => {
    if (!user?.id) {
      setPermissions(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userPermissions = await ProPermissionService.checkProPermissions(user.id);
      setPermissions(userPermissions);
    } catch (err) {
      console.error('Error loading Pro permissions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load permissions');
      setPermissions({
        can_comment_news: false,
        can_feature_listing: false,
        has_priority_support: false,
        is_pro: false,
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const refreshPermissions = useCallback(async () => {
    if (user?.id) {
      // Clear cache before refreshing
      ProPermissionService.clearUserCache(user.id);
      await loadPermissions();
    }
  }, [user?.id, loadPermissions]);

  const checkPermission = useCallback((permission: keyof ProPermission): boolean => {
    return permissions?.[permission] || false;
  }, [permissions]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  return {
    permissions,
    loading,
    error,
    canCommentOnNews: permissions?.can_comment_news || false,
    canFeatureListing: permissions?.can_feature_listing || false,
    hasPrioritySupport: permissions?.has_priority_support || false,
    isPro: permissions?.is_pro || false,
    refreshPermissions,
    checkPermission,
  };
}

// Specific hooks for individual permissions
export function useCanCommentOnNews() {
  const { canCommentOnNews, loading } = useProPermissions();
  return { canCommentOnNews, loading };
}

export function useCanFeatureListing() {
  const { canFeatureListing, loading } = useProPermissions();
  return { canFeatureListing, loading };
}

export function useHasPrioritySupport() {
  const { hasPrioritySupport, loading } = useProPermissions();
  return { hasPrioritySupport, loading };
}

export function useIsPro() {
  const { isPro, loading } = useProPermissions();
  return { isPro, loading };
}
