/**
 * Role Guard Hook
 * Provides role-based access control guards (legacy compatibility)
 */

import { useRoleGuard as useRoleGuardConsolidated } from './useRBACConsolidated';

export const useRoleGuard = (requirements: any) => {
  return useRoleGuardConsolidated(requirements);
};
