/**
 * Pro Permissions Hook
 * Provides pro subscription permissions (legacy compatibility)
 */

import { useProPermissions as useProPermissionsConsolidated } from './useRBACConsolidated';

export const useProPermissions = () => {
  return useProPermissionsConsolidated();
};
