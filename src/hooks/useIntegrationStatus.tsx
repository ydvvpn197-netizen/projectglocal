/**
 * React hook for monitoring integration status
 * Provides real-time integration health monitoring
 */

import { useState, useEffect, useCallback } from 'react';
import { integrationStatusService, IntegrationHealth, IntegrationStatus } from '@/services/integrationStatusService';

export interface UseIntegrationStatusOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  onStatusChange?: (health: IntegrationHealth) => void;
}

export interface UseIntegrationStatusReturn {
  health: IntegrationHealth | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getIntegrationStatus: (name: string) => IntegrationStatus | undefined;
  isIntegrationHealthy: (name: string) => boolean;
  isIntegrationConfigured: (name: string) => boolean;
  isIntegrationConnected: (name: string) => boolean;
}

export function useIntegrationStatus(
  options: UseIntegrationStatusOptions = {}
): UseIntegrationStatusReturn {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    onStatusChange
  } = options;

  const [health, setHealth] = useState<IntegrationHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const healthData = await integrationStatusService.getIntegrationHealth();
      setHealth(healthData);
      
      if (onStatusChange) {
        onStatusChange(healthData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch integration status';
      setError(errorMessage);
      console.error('Integration status fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [onStatusChange]);

  const refresh = useCallback(async () => {
    integrationStatusService.clearCache();
    await fetchHealth();
  }, [fetchHealth]);

  const getIntegrationStatus = useCallback((name: string): IntegrationStatus | undefined => {
    return health?.integrations.find(integration => 
      integration.name.toLowerCase() === name.toLowerCase()
    );
  }, [health]);

  const isIntegrationHealthy = useCallback((name: string): boolean => {
    const integration = getIntegrationStatus(name);
    return integration ? integration.configured && integration.connected : false;
  }, [getIntegrationStatus]);

  const isIntegrationConfigured = useCallback((name: string): boolean => {
    const integration = getIntegrationStatus(name);
    return integration ? integration.configured : false;
  }, [getIntegrationStatus]);

  const isIntegrationConnected = useCallback((name: string): boolean => {
    const integration = getIntegrationStatus(name);
    return integration ? integration.connected : false;
  }, [getIntegrationStatus]);

  // Initial fetch
  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchHealth, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchHealth]);

  return {
    health,
    loading,
    error,
    refresh,
    getIntegrationStatus,
    isIntegrationHealthy,
    isIntegrationConfigured,
    isIntegrationConnected
  };
}

/**
 * Hook for monitoring specific integration status
 */
export function useIntegrationStatusByName(
  integrationName: string,
  options: UseIntegrationStatusOptions = {}
) {
  const { health, loading, error, refresh } = useIntegrationStatus(options);
  
  const integration = health?.integrations.find(i => 
    i.name.toLowerCase() === integrationName.toLowerCase()
  );

  return {
    integration,
    loading,
    error,
    refresh,
    isHealthy: integration ? integration.configured && integration.connected : false,
    isConfigured: integration ? integration.configured : false,
    isConnected: integration ? integration.connected : false,
    error: integration?.error
  };
}

/**
 * Hook for checking if all required integrations are healthy
 */
export function useRequiredIntegrationsStatus(
  options: UseIntegrationStatusOptions = {}
) {
  const { health, loading, error, refresh } = useIntegrationStatus(options);
  
  const requiredIntegrations = health?.integrations.filter(i => i.required) || [];
  const allRequiredHealthy = requiredIntegrations.every(i => i.configured && i.connected);
  const someRequiredUnhealthy = requiredIntegrations.some(i => !i.configured || !i.connected);

  return {
    allRequiredHealthy,
    someRequiredUnhealthy,
    requiredIntegrations,
    loading,
    error,
    refresh
  };
}
