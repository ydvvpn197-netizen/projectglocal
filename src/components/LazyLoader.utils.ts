import { ComponentType } from 'react';

// Preload function for critical components
export const preloadComponent = (importFunc: () => Promise<unknown>) => {
  return () => {
    importFunc().catch((error) => {
      console.warn('Failed to preload component:', error);
    });
  };
};