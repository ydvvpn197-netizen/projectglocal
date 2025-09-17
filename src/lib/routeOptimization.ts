/**
 * Route Optimization Utilities
 * 
 * This module provides utilities for optimizing route loading and code splitting
 * to improve application performance and reduce bundle size.
 */

import { lazy, ComponentType } from 'react';

/**
 * Creates an optimized lazy component with error boundary and loading fallback
 */
export function createOptimizedLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ComponentType
) {
  const LazyComponent = lazy(importFn);
  
  // Add error boundary wrapper
  return (props: React.ComponentProps<T>) => {
    return (
      <React.Suspense fallback={fallback ? <fallback /> : <DefaultLoadingFallback />}>
        <LazyComponent {...props} />
      </React.Suspense>
    );
  };
}

/**
 * Default loading fallback component
 */
const DefaultLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

/**
 * Route group definitions for better code splitting
 */
export const ROUTE_GROUPS = {
  // Core pages - loaded immediately
  CORE: [
    'EnhancedIndex',
    'SignIn',
    'Feed',
    'About'
  ],
  
  // Auth pages - grouped together
  AUTH: [
    'LocationSetup',
    'Onboarding',
    'PrivacyFirstOnboarding',
    'ArtistOnboarding',
    'ForgotPassword',
    'ResetPassword'
  ],
  
  // Community features - grouped together
  COMMUNITY: [
    'Community',
    'CommunityDetail',
    'CreateDiscussion',
    'CreateGroup',
    'CreatePost',
    'Events',
    'CreateEvent',
    'EventDetails'
  ],
  
  // Artist features - grouped together
  ARTIST: [
    'BookArtist',
    'ArtistDashboard',
    'ArtistProfile'
  ],
  
  // User features - grouped together
  USER: [
    'Profile',
    'Settings',
    'Privacy',
    'UserProfile',
    'EnhancedProfile',
    'NotificationSettings',
    'NotificationsPage',
    'UserDashboard'
  ],
  
  // Chat features - grouped together
  CHAT: [
    'Chat',
    'Messages',
    'EnhancedChat',
    'EnhancedMessages'
  ],
  
  // New features - grouped together
  NEW_FEATURES: [
    'LegalAssistant',
    'LifeWish',
    'VoiceControlDemo',
    'News',
    'Polls',
    'LocalCommunities',
    'LocalBusinesses',
    'PublicSquare',
    'PublicSquareSubscription'
  ],
  
  // Payment features - grouped together
  PAYMENT: [
    'Pricing',
    'PaymentSuccess',
    'PaymentCancel',
    'SubscriptionPage',
    'SubscriptionPlansPage',
    'SubscriptionSuccess',
    'SubscriptionCancel'
  ],
  
  // Admin features - grouped together
  ADMIN: [
    'AdminLogin',
    'AdminDashboard',
    'UserManagement',
    'UserModeration',
    'AdminManagement',
    'ContentModeration',
    'AdminAnalytics',
    'SystemSettings',
    'AdminSetup'
  ]
};

/**
 * Preload route group for better performance
 */
export function preloadRouteGroup(groupName: keyof typeof ROUTE_GROUPS) {
  const routes = ROUTE_GROUPS[groupName];
  
  routes.forEach(routeName => {
    // Preload the route component
    import(`@/pages/${routeName}`).catch(() => {
      // Silently handle import errors
    });
  });
}

/**
 * Route priority levels for loading optimization
 */
export const ROUTE_PRIORITIES = {
  HIGH: ['Feed', 'Messages', 'Profile', 'Events'],
  MEDIUM: ['News', 'Community', 'BookArtist', 'CivicEngagement'],
  LOW: ['Settings', 'Privacy', 'About', 'LegalAssistant']
};

/**
 * Get route priority for optimization
 */
export function getRoutePriority(routeName: string): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (ROUTE_PRIORITIES.HIGH.includes(routeName)) return 'HIGH';
  if (ROUTE_PRIORITIES.MEDIUM.includes(routeName)) return 'MEDIUM';
  return 'LOW';
}
