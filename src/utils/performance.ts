/**
 * Performance optimization utilities
 */

// Lazy loading utility
export const lazyLoad = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> => {
  return React.lazy(importFunc);
};

// Debounce utility for search and input handling
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility for scroll and resize events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Image optimization utility
export const optimizeImage = (src: string, width?: number, quality: number = 80): string => {
  // For now, return the original src
  // In production, you might want to use a service like Cloudinary or ImageKit
  return src;
};

// Memory usage monitoring
export const getMemoryUsage = (): number => {
  if ('memory' in performance) {
    return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
  }
  return 0;
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void): void => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver => {
  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
};

// Preload critical resources
export const preloadResource = (href: string, as: string): void => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
};

// Prefetch resources for better performance
export const prefetchResource = (href: string): void => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
};

// Service Worker registration for caching
export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// Cache management
export const clearCache = async (): Promise<void> => {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
  }
};

// Bundle size monitoring
export const logBundleSize = (): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Bundle size monitoring enabled');
    // Add bundle size monitoring logic here
  }
};

// Performance budget monitoring
export const checkPerformanceBudget = (): void => {
  const memoryUsage = getMemoryUsage();
  const maxMemory = 50; // MB
  
  if (memoryUsage > maxMemory) {
    console.warn(`Memory usage (${memoryUsage.toFixed(2)}MB) exceeds budget (${maxMemory}MB)`);
  }
};

// Critical resource hints
export const addResourceHints = (): void => {
  // Preconnect to external domains
  const domains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://api.supabase.co',
  ];
  
  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    document.head.appendChild(link);
  });
};

// Performance metrics collection
export const collectPerformanceMetrics = (): void => {
  if ('performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    const metrics = {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
    };
    
    console.log('Performance Metrics:', metrics);
  }
};

// Initialize performance optimizations
export const initializePerformanceOptimizations = (): void => {
  addResourceHints();
  registerServiceWorker();
  collectPerformanceMetrics();
  
  // Monitor performance budget
  setInterval(checkPerformanceBudget, 30000); // Check every 30 seconds
};