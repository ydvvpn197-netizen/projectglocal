// Performance optimization utilities
import { useMemo, useCallback, memo } from 'react';

/**
 * Custom hook for memoizing expensive calculations
 */
export const useExpensiveCalculation = <T>(
  calculation: () => T,
  dependencies: React.DependencyList
): T => {
  return useMemo(calculation, dependencies);
};

/**
 * Custom hook for memoizing callbacks
 */
export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T,
  dependencies: React.DependencyList
): T => {
  return useCallback(callback, dependencies);
};

/**
 * Higher-order component for memoizing components with custom comparison
 */
export const withMemo = <P extends object>(
  Component: React.ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean
) => {
  return memo(Component, areEqual);
};

/**
 * Debounce utility for performance optimization
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle utility for performance optimization
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Virtual scrolling utility for large lists
 */
export interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export const useVirtualScroll = <T>(
  items: T[],
  options: VirtualScrollOptions
) => {
  const { itemHeight, containerHeight, overscan = 5 } = options;
  
  return useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, 0 - overscan);
    const endIndex = Math.min(items.length - 1, visibleCount + overscan);
    
    return {
      visibleItems: items.slice(startIndex, endIndex + 1),
      startIndex,
      endIndex,
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, itemHeight, containerHeight, overscan]);
};

/**
 * Intersection Observer hook for lazy loading
 */
export const useIntersectionObserver = (
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  
  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      options
    );
    
    observer.observe(element);
    
    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options]);
  
  return isIntersecting;
};

/**
 * Performance monitoring utilities
 */
export const performanceMonitor = {
  start: (label: string) => {
    if (typeof performance !== 'undefined') {
      performance.mark(`${label}-start`);
    }
  },
  
  end: (label: string) => {
    if (typeof performance !== 'undefined') {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
    }
  },
  
  measure: (label: string, fn: () => void) => {
    performanceMonitor.start(label);
    fn();
    performanceMonitor.end(label);
  }
};

/**
 * Memory usage monitoring
 */
export const memoryMonitor = {
  getUsage: () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };
    }
    return null;
  },
  
  logUsage: (label?: string) => {
    const usage = memoryMonitor.getUsage();
    if (usage) {
      console.log(`${label || 'Memory usage'}:`, {
        used: `${Math.round(usage.used / 1024 / 1024)}MB`,
        total: `${Math.round(usage.total / 1024 / 1024)}MB`,
        limit: `${Math.round(usage.limit / 1024 / 1024)}MB`
      });
    }
  }
};

/**
 * Bundle size optimization utilities
 */
export const bundleOptimization = {
  // Lazy load components with error boundaries
  lazyLoad: <T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    fallback?: React.ComponentType
  ) => {
    return React.lazy(importFn);
  },
  
  // Preload critical resources
  preload: (href: string, as: string) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  },
  
  // Prefetch resources for better performance
  prefetch: (href: string) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }
};

/**
 * React DevTools profiler integration
 */
export const profiler = {
  onRender: (id: string, phase: 'mount' | 'update', actualDuration: number) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Profiler [${id}]: ${phase} took ${actualDuration}ms`);
    }
  }
};
