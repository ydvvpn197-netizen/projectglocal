// Utility functions for AB testing
export const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

// Mock AB tests - replace with real data from your analytics service
export const mockABTests = [
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
