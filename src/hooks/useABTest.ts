import { useABTesting } from './useABTestingHook';

// Hook for specific test variants
export const useABTest = (testId: string) => {
  const { getUserVariant, trackEvent, isUserInTest } = useABTesting();
  
  const variant = getUserVariant(testId);
  const isInTest = isUserInTest(testId);
  
  const track = (event: string, metadata?: Record<string, unknown>) => {
    trackEvent(testId, event, metadata);
  };

  return {
    variant,
    isInTest,
    track,
    isControl: variant === 'control',
    isTreatment: variant === 'treatment'
  };
};
