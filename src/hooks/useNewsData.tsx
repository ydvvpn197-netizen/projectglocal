/**
 * News Data Hook
 * Provides news data functionality (legacy compatibility)
 */

import { useNewsConsolidated } from './useNewsConsolidated';

export const useNewsData = (filters: any = {}) => {
  return useNewsConsolidated(filters);
};
