// Bundle optimization utilities for Project Glocal
import React, { lazy, ComponentType, LazyExoticComponent } from 'react';

interface BundleConfig {
  preloadDelay: number;
  maxConcurrentLoads: number;
  retryAttempts: number;
  retryDelay: number;
}

const defaultConfig: BundleConfig = {
  preloadDelay: 2000, // 2 seconds
  maxConcurrentLoads: 3,
  retryAttempts: 3,
  retryDelay: 1000,
};

class BundleOptimizer {
  private config: BundleConfig;
  private loadingQueue: Set<string> = new Set();
  private preloadedComponents: Set<string> = new Set();

  constructor(config: Partial<BundleConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  // Create optimized lazy component with retry logic
  createLazyComponent<T extends ComponentType<Record<string, unknown>>>(
    importFn: () => Promise<{ default: T }>,
    componentName: string,
    fallback?: React.ComponentType
  ): LazyExoticComponent<T> {
    let retryCount = 0;

    const loadComponent = async (): Promise<{ default: T }> => {
      try {
        const module = await importFn();
        this.preloadedComponents.add(componentName);
        return module;
      } catch (error) {
        console.warn(`Failed to load ${componentName}, attempt ${retryCount + 1}:`, error);
        
        if (retryCount < this.config.retryAttempts) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
          return loadComponent();
        }
        
        throw error;
      }
    };

    return lazy(loadComponent);
  }

  // Preload components based on user behavior
  preloadComponent(componentName: string, importFn: () => Promise<Record<string, unknown>>): void {
    if (this.preloadedComponents.has(componentName)) return;
    if (this.loadingQueue.size >= this.config.maxConcurrentLoads) return;

    this.loadingQueue.add(componentName);
    
    setTimeout(() => {
      importFn()
        .then(() => {
          this.preloadedComponents.add(componentName);
          console.log(`✅ Preloaded ${componentName}`);
        })
        .catch(error => {
          console.warn(`❌ Failed to preload ${componentName}:`, error);
        })
        .finally(() => {
          this.loadingQueue.delete(componentName);
        });
    }, this.config.preloadDelay);
  }

  // Preload route components based on current route
  preloadRouteComponents(currentRoute: string): void {
    const routePreloadMap: Record<string, string[]> = {
      '/': ['/feed', '/discover', '/profile'],
      '/feed': ['/discover', '/profile', '/settings'],
      '/discover': ['/feed', '/profile', '/events'],
      '/profile': ['/settings', '/notifications'],
      '/events': ['/discover', '/profile'],
      '/settings': ['/profile', '/privacy'],
    };

    const componentsToPreload = routePreloadMap[currentRoute] || [];
    
    componentsToPreload.forEach(route => {
      this.preloadRoute(route);
    });
  }

  // Preload specific route
  private preloadRoute(route: string): void {
    const routeComponentMap: Record<string, () => Promise<Record<string, unknown>>> = {
      '/feed': () => import('@/pages/Feed'),
      '/discover': () => import('@/pages/Discover'),
      '/profile': () => import('@/pages/Profile'),
      '/settings': () => import('@/pages/Settings'),
      '/events': () => import('@/pages/Events'),
      '/notifications': () => import('@/pages/NotificationsPage'),
      '/privacy': () => import('@/pages/Privacy'),
    };

    const importFn = routeComponentMap[route];
    if (importFn) {
      this.preloadComponent(route, importFn);
    }
  }

  // Get bundle size information
  getBundleInfo(): {
    totalSize: number;
    loadedComponents: string[];
    preloadedComponents: string[];
    loadingQueue: string[];
  } {
    return {
      totalSize: this.preloadedComponents.size,
      loadedComponents: Array.from(this.preloadedComponents),
      preloadedComponents: Array.from(this.preloadedComponents),
      loadingQueue: Array.from(this.loadingQueue),
    };
  }

  // Clear preloaded components (for testing)
  clearCache(): void {
    this.preloadedComponents.clear();
    this.loadingQueue.clear();
  }
}

// Global bundle optimizer instance
export const bundleOptimizer = new BundleOptimizer();

// Hook for route-based preloading
export function useRoutePreloading(currentRoute: string) {
  React.useEffect(() => {
    bundleOptimizer.preloadRouteComponents(currentRoute);
  }, [currentRoute]);
}

// Hook for component preloading
export function useComponentPreloading(componentName: string, importFn: () => Promise<Record<string, unknown>>) {
  React.useEffect(() => {
    bundleOptimizer.preloadComponent(componentName, importFn);
  }, [componentName, importFn]);
}

// Utility for creating optimized route components
export function createOptimizedRoute<T extends ComponentType<Record<string, unknown>>>(
  importFn: () => Promise<{ default: T }>,
  componentName: string
): LazyExoticComponent<T> {
  return bundleOptimizer.createLazyComponent(importFn, componentName);
}

// Bundle size monitoring
export function useBundleMonitoring() {
  const [bundleInfo, setBundleInfo] = React.useState(bundleOptimizer.getBundleInfo());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setBundleInfo(bundleOptimizer.getBundleInfo());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return bundleInfo;
}

// Dynamic import with error handling
export async function dynamicImport<T>(
  importFn: () => Promise<T>,
  fallback?: T
): Promise<T> {
  try {
    return await importFn();
  } catch (error) {
    console.warn('Dynamic import failed:', error);
    if (fallback) {
      return fallback;
    }
    throw error;
  }
}

// Code splitting utilities
export const codeSplitting = {
  // Split by feature
  byFeature: {
    auth: () => import('@/components/auth/AuthProvider'),
    news: () => import('@/components/NewsCard'),
    chat: () => import('@/pages/EnhancedChat'),
    admin: () => import('@/pages/admin/Dashboard'),
  },
  
  // Split by route
  byRoute: {
    home: () => import('@/pages/EnhancedIndex'),
    feed: () => import('@/pages/Feed'),
    discover: () => import('@/pages/Discover'),
    profile: () => import('@/pages/Profile'),
    settings: () => import('@/pages/Settings'),
  },
  
  // Split by component type
  byType: {
    ui: () => import('@/components/ui/button'),
    forms: () => import('@/components/ui/form'),
    charts: () => import('@/components/ui/chart'),
  },
};

export default bundleOptimizer;
