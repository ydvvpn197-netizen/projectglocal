/**
 * Real-time News Hook
 * Provides real-time news functionality (legacy compatibility)
 */

import { useNewsConsolidated } from './useNewsConsolidated';

export const useRealTimeNews = (filters: any = {}) => {
  return useNewsConsolidated(filters);
};
