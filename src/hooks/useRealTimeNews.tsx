/**
 * Real-time News Hook
 * Provides real-time news functionality (legacy compatibility)
 */

import { useNewsConsolidated } from './useNewsConsolidated';

interface NewsFilters {
  category?: string;
  location?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
}

export const useRealTimeNews = (filters: NewsFilters = {}) => {
  return useNewsConsolidated(filters);
};
