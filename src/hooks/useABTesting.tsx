import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useAuth } from './useAuth';

interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: {
    control: string;
    treatment: string;
  };
  trafficAllocation: number; // 0-1, percentage of users who see the test
  isActive: boolean;
  startDate: string;
  endDate?: string;
}

interface ABTestResult {
  testId: string;
  variant: 'control' | 'treatment';
  userId: string;
  timestamp: string;
  event: string;
  metadata?: Record<string, any>;
}

interface ABTestingContextType {
  activeTests: ABTest[];
  getUserVariant: (testId: string) => 'control' | 'treatment' | null;
  trackEvent: (testId: string, event: string, metadata?: Record<string, any>) => void;
  isUserInTest: (testId: string) => boolean;
}

const ABTestingContext = createContext<ABTestingContextType | undefined>(undefined);

// Mock AB tests - replace with real data from your analytics service
const mockABTests: ABTest[] = [
  {
    id: 'unified-navigation',
    name: 'Unified Navigation',
    description: 'Test the new unified navigation system vs old sidebar',
    variants: {
      control: 'sidebar',
      treatment: 'unified'
    },
    trafficAllocation: 0.5, // 50% of users
    isActive: true,
    startDate: new Date().toISOString(),
  },
  {
    id: 'post-creation-flow',
    name: 'Post Creation Flow',
    description: 'Test unified post creator vs separate creation pages',
    variants: {
      control: 'separate',
      treatment: 'unified'
    },
    trafficAllocation: 0.3, // 30% of users
    isActive: true,
    startDate: new Date().toISOString(),
  },
  {
    id: 'onboarding-simplification',
    name: 'Onboarding Simplification',
    description: 'Test simplified 2-step onboarding vs original 4-step',
    variants: {
      control: 'original',
      treatment: 'simplified'
    },
    trafficAllocation: 0.4, // 40% of users
    isActive: true,
    startDate: new Date().toISOString(),
  }
];

export const ABTestingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activeTests, setActiveTests] = useState<ABTest[]>([]);
  const [userVariants, setUserVariants] = useState<Record<string, 'control' | 'treatment'>>({});

  useEffect(() => {
    // Load active tests from your analytics service
    setActiveTests(mockABTests.filter(test => test.isActive));
  }, []);

  useEffect(() => {
    if (user) {
      // Assign user to test variants based on consistent hashing
      const newVariants: Record<string, 'control' | 'treatment'> = {};
      
      activeTests.forEach(test => {
        if (Math.random() < test.trafficAllocation) {
          // Use user ID for consistent assignment
          const hash = hashString(user.id + test.id);
          newVariants[test.id] = hash % 2 === 0 ? 'control' : 'treatment';
        }
      });
      
      setUserVariants(newVariants);
    }
  }, [user, activeTests]);

  const hashString = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };

  const getUserVariant = (testId: string): 'control' | 'treatment' | null => {
    return userVariants[testId] || null;
  };

  const trackEvent = (testId: string, event: string, metadata?: Record<string, any>) => {
    if (!user) return;

    const variant = getUserVariant(testId);
    if (!variant) return;

    const result: ABTestResult = {
      testId,
      variant,
      userId: user.id,
      timestamp: new Date().toISOString(),
      event,
      metadata
    };

    // Send to analytics service
    console.log('AB Test Event:', result);
    
    // In production, send to your analytics service:
    // analytics.track('ab_test_event', result);
  };

  const isUserInTest = (testId: string): boolean => {
    return userVariants[testId] !== undefined;
  };

  return (
    <ABTestingContext.Provider value={{
      activeTests,
      getUserVariant,
      trackEvent,
      isUserInTest
    }}>
      {children}
    </ABTestingContext.Provider>
  );
};

export const useABTesting = (): ABTestingContextType => {
  const context = useContext(ABTestingContext);
  if (context === undefined) {
    throw new Error('useABTesting must be used within an ABTestingProvider');
  }
  return context;
};

// Hook for specific test variants
export const useABTest = (testId: string) => {
  const { getUserVariant, trackEvent, isUserInTest } = useABTesting();
  
  const variant = getUserVariant(testId);
  const isInTest = isUserInTest(testId);
  
  const track = (event: string, metadata?: Record<string, any>) => {
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

export default useABTesting;
