import { useContext } from 'react';
import { NewsContext } from '@/contexts/NewsContextDefinition';
import type { NewsContextType } from '@/contexts/NewsContextDefinition';

export const useNews = (): NewsContextType => {
  const context = useContext(NewsContext);
  if (context === undefined) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
};
