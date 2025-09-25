/**
 * News Data Hook
 * Provides news data functionality (legacy compatibility)
 */

import { useNewsConsolidated } from './useNewsConsolidated';

interface NewsDataFilters {
  category?: string;
  location?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
}

export const useNewsData = (filters: NewsDataFilters = {}) => {
  return useNewsConsolidated(filters);
};
