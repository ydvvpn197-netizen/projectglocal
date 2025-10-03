import { useContext } from 'react';
import { LayoutContext } from './LayoutContext';

// Hook moved to separate file for Fast Refresh compatibility
export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};
