/**
 * Role Guard Hook
 * Provides role-based access control guards (legacy compatibility)
 */

import { useRoleGuard as useRoleGuardConsolidated } from './useRBACConsolidated';

interface RoleRequirements {
  roles?: string[];
  permissions?: string[];
  requireAll?: boolean;
}

export const useRoleGuard = (requirements: RoleRequirements) => {
  return useRoleGuardConsolidated(requirements);
};
