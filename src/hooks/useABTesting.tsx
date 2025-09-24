import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useAuth } from './useAuth';
import { mockABTests, hashString } from './abTestingUtils';

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
  metadata?: Record<string, unknown>;
}

interface ABTestingContextType {
  activeTests: ABTest[];
  getUserVariant: (testId: string) => 'control' | 'treatment' | null;
  trackEvent: (testId: string, event: string, metadata?: Record<string, unknown>) => void;
  isUserInTest: (testId: string) => boolean;
}

const ABTestingContext = createContext<ABTestingContextType | undefined>(undefined);

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


  const getUserVariant = (testId: string): 'control' | 'treatment' | null => {
    return userVariants[testId] || null;
  };

  const trackEvent = (testId: string, event: string, metadata?: Record<string, unknown>) => {
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


