import { useCallback, useMemo, useRef, useEffect, useState } from 'react';

// Debounce hook for performance optimization
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle hook for performance optimization
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args: any[]) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
};

// Memoized component wrapper
export const withMemo = <P extends object>(
  Component: React.ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean
) => {
  return React.memo(Component, areEqual);
};

// Intersection observer hook for lazy loading
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      options
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [options, hasIntersected]);

  return { ref, isIntersecting, hasIntersected };
};

// Virtual scrolling hook
export const useVirtualScrolling = (
  itemCount: number,
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    itemCount - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight)
  );

  const visibleItems = useMemo(() => {
    const items = [];
    for (let i = visibleStart; i <= visibleEnd; i++) {
      items.push({
        index: i,
        top: i * itemHeight,
        height: itemHeight
      });
    }
    return items;
  }, [visibleStart, visibleEnd, itemHeight]);

  const totalHeight = itemCount * itemHeight;

  return {
    visibleItems,
    totalHeight,
    setScrollTop
  };
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  const renderStart = useRef<number>(0);
  const renderCount = useRef<number>(0);

  useEffect(() => {
    renderStart.current = performance.now();
    renderCount.current += 1;

    return () => {
      const renderTime = performance.now() - renderStart.current;
      
      if (renderTime > 16) { // More than one frame
        console.warn(`${componentName} took ${renderTime.toFixed(2)}ms to render`);
      }
    };
  });

  return {
    renderCount: renderCount.current
  };
};

// Bundle size optimization utilities
export const optimizeImports = {
  // Lazy load heavy components
  lazy: <T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>
  ) => React.lazy(importFn),
  
  // Dynamic imports for code splitting
  dynamic: async <T>(importFn: () => Promise<T>) => {
    const module = await importFn();
    return module;
  },
  
  // Preload critical components
  preload: (importFn: () => Promise<any>) => {
    if (typeof window !== 'undefined') {
      importFn();
    }
  }
};

// Memory optimization utilities
export const memoryOptimizations = {
  // Cleanup function for components
  useCleanup: (cleanupFn: () => void) => {
    useEffect(() => {
      return cleanupFn;
    }, []);
  },
  
  // Weak reference for large objects
  useWeakRef: <T extends object>(value: T) => {
    const ref = useRef<WeakRef<T>>();
    ref.current = new WeakRef(value);
    return ref.current;
  }
};

// Bundle analysis utilities
export const bundleAnalysis = {
  // Track component usage
  trackComponent: (componentName: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'component_usage', {
        component_name: componentName,
        timestamp: Date.now()
      });
    }
  },
  
  // Measure bundle impact
  measureBundleImpact: (componentName: string, startTime: number) => {
    const endTime = performance.now();
    const impact = endTime - startTime;
    
    if (impact > 10) { // More than 10ms
      console.warn(`Bundle impact for ${componentName}: ${impact.toFixed(2)}ms`);
    }
  }
};

// Export all utilities
export default {
  useDebounce,
  useThrottle,
  withMemo,
  useIntersectionObserver,
  useVirtualScrolling,
  usePerformanceMonitor,
  optimizeImports,
  memoryOptimizations,
  bundleAnalysis
};
