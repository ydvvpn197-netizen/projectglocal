/**
 * Route optimization utilities and constants
 */

import React, { useEffect } from 'react';

export type RoutePriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface RouteGroup {
  name: string;
  priority: RoutePriority;
  routes: string[];
}

export const ROUTE_GROUPS: RouteGroup[] = [
  {
    name: 'core',
    priority: 'HIGH',
    routes: ['/', '/dashboard', '/profile']
  },
  {
    name: 'community',
    priority: 'MEDIUM',
    routes: ['/events', '/posts', '/follow']
  },
  {
    name: 'features',
    priority: 'LOW',
    routes: ['/settings', '/analytics', '/admin']
  }
];

export const ROUTE_PRIORITIES: Record<string, RoutePriority> = {
  '/': 'HIGH',
  '/dashboard': 'HIGH',
  '/profile': 'HIGH',
  '/events': 'MEDIUM',
  '/posts': 'MEDIUM',
  '/follow': 'MEDIUM',
  '/settings': 'LOW',
  '/analytics': 'LOW',
  '/admin': 'LOW'
};

/**
 * Get route priority
 */
export const getRoutePriority = (routeName: string): RoutePriority => {
  return ROUTE_PRIORITIES[routeName] || 'MEDIUM';
};

/**
 * Preload route group
 */
export const preloadRouteGroup = async (group: RouteGroup): Promise<void> => {
  const { routes } = group;
  
  // Preload critical routes first
  const criticalRoutes = routes.filter(route => 
    route === '/' || route === '/dashboard' || route === '/profile'
  );
  
  const otherRoutes = routes.filter(route => 
    !criticalRoutes.includes(route)
  );
  
  // Preload critical routes
  for (const route of criticalRoutes) {
    try {
      await preloadRoute(route);
    } catch (error) {
      console.warn(`Failed to preload critical route: ${route}`, error);
    }
  }
  
  // Preload other routes with delay
  setTimeout(async () => {
    for (const route of otherRoutes) {
      try {
        await preloadRoute(route);
      } catch (error) {
        console.warn(`Failed to preload route: ${route}`, error);
      }
    }
  }, 100);
};

/**
 * Preload individual route
 */
export const preloadRoute = async (route: string): Promise<void> => {
  // This would typically preload route components
  // For now, we'll simulate the preload
  return new Promise(resolve => {
    setTimeout(resolve, 50);
  });
};

/**
 * Get route groups for preloading
 */
export const getRouteGroups = (routeName: string): RouteGroup[] => {
  const currentGroup = ROUTE_GROUPS.find(group => 
    group.routes.includes(routeName)
  );
  
  if (!currentGroup) {
    return ROUTE_GROUPS;
  }
  
  // Return current group and related groups
  const relatedGroups = ROUTE_GROUPS.filter(group => 
    group.priority === currentGroup.priority || 
    group.priority === 'HIGH'
  );
  
  return relatedGroups;
};

/**
 * Create optimized lazy component
 */
export const createOptimizedLazyComponent = (importFn: () => Promise<{ default: React.ComponentType<any> }>) => {
  return React.lazy(importFn);
};

/**
 * Hook for route performance monitoring
 */
export const useRoutePerformance = (routeName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // Log performance metrics
      console.log(`Route ${routeName} loaded in ${loadTime.toFixed(2)}ms`);
      
      // Send to analytics if available
      if (typeof window !== 'undefined' && (window as Window & { gtag?: (event: string, action: string, params: Record<string, unknown>) => void }).gtag) {
        (window as Window & { gtag: (event: string, action: string, params: Record<string, unknown>) => void }).gtag('event', 'route_load_time', {
          route_name: routeName,
          load_time: Math.round(loadTime)
        });
      }
    };
  }, [routeName]);
};

/**
 * Preload hook for critical routes
 */
export const useRoutePreload = (routeName: string, priority: RoutePriority = 'MEDIUM') => {
  useEffect(() => {
    if (priority === 'HIGH') {
      // Immediately preload high priority routes
      import(`@/pages/${routeName}`).catch(() => {
        console.warn(`Failed to preload route: ${routeName}`);
      });
    }
  }, [routeName, priority]);
};