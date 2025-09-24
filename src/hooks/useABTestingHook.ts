import { useContext } from 'react';
import { ABTestingContext } from './useABTesting';

export const useABTesting = () => {
  const context = useContext(ABTestingContext);
  if (context === undefined) {
    throw new Error('useABTesting must be used within an ABTestingProvider');
  }
  return context;
};
