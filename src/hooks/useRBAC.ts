/**
 * RBAC Hook
 * Provides role-based access control (legacy compatibility)
 */

import { useRBACConsolidated } from './useRBACConsolidated';

export const useRBAC = () => {
  return useRBACConsolidated();
};
