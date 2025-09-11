/**
 * Performance optimization hooks
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { debounce, throttle } from '../utils/performance';

// Debounced callback hook
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const debouncedCallback = useMemo(
    () => debounce(callback, delay),
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      debouncedCallback.cancel?.();
    };
  }, [debouncedCallback]);

  return debouncedCallback as T;
};

// Throttled callback hook
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const throttledCallback = useMemo(
    () => throttle(callback, delay),
    [callback, delay]
  );

  return throttledCallback as T;
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (
  options?: IntersectionObserverInit
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
      {
        rootMargin: '50px',
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [options, hasIntersected]);

  return { ref, isIntersecting, hasIntersected };
};

// Virtual scrolling hook
export const useVirtualScroll = (
  itemHeight: number,
  containerHeight: number,
  itemCount: number
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    itemCount
  );

  const visibleItems = useMemo(() => {
    const items = [];
    for (let i = visibleStart; i < visibleEnd; i++) {
      items.push({
        index: i,
        top: i * itemHeight,
      });
    }
    return items;
  }, [visibleStart, visibleEnd, itemHeight]);

  const totalHeight = itemCount * itemHeight;
  const offsetY = visibleStart * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
  };
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;

    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render #${renderCount.current}: ${renderTime.toFixed(2)}ms`);
    }

    startTime.current = performance.now();
  });

  return {
    renderCount: renderCount.current,
  };
};

// Memory usage monitoring hook
export const useMemoryMonitor = () => {
  const [memoryUsage, setMemoryUsage] = useState<number>(0);

  useEffect(() => {
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMemoryUsage(memory.usedJSHeapSize / 1024 / 1024); // MB
      }
    };

    updateMemoryUsage();
    const interval = setInterval(updateMemoryUsage, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return memoryUsage;
};

// Lazy loading hook
export const useLazyLoad = <T>(
  importFunc: () => Promise<T>,
  deps: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (data || loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await importFunc();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [importFunc, data, loading]);

  useEffect(() => {
    load();
  }, deps);

  return { data, loading, error, reload: load };
};

// Optimized state hook with shallow comparison
export const useOptimizedState = <T>(initialState: T) => {
  const [state, setState] = useState(initialState);
  const prevState = useRef<T>(initialState);

  const setOptimizedState = useCallback((newState: T | ((prev: T) => T)) => {
    setState(prev => {
      const next = typeof newState === 'function' ? (newState as (prev: T) => T)(prev) : newState;
      
      // Shallow comparison for objects
      if (typeof next === 'object' && next !== null && typeof prev === 'object' && prev !== null) {
        if (JSON.stringify(next) === JSON.stringify(prev)) {
          return prev; // No change, return previous state
        }
      } else if (next === prev) {
        return prev; // No change, return previous state
      }

      prevState.current = prev;
      return next;
    });
  }, []);

  return [state, setOptimizedState] as const;
};

// Batch updates hook
export const useBatchUpdates = () => {
  const [updates, setUpdates] = useState<(() => void)[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const batchUpdate = useCallback((update: () => void) => {
    setUpdates(prev => [...prev, update]);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      updates.forEach(update => update());
      setUpdates([]);
    }, 0);
  }, [updates]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return batchUpdate;
};

// Resource preloading hook
export const usePreload = () => {
  const preloadedResources = useRef<Set<string>>(new Set());

  const preload = useCallback((href: string, as: string = 'script') => {
    if (preloadedResources.current.has(href)) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);

    preloadedResources.current.add(href);
  }, []);

  const preloadImage = useCallback((src: string) => {
    preload(src, 'image');
  }, [preload]);

  const preloadScript = useCallback((src: string) => {
    preload(src, 'script');
  }, [preload]);

  const preloadStyle = useCallback((href: string) => {
    preload(href, 'style');
  }, [preload]);

  return {
    preload,
    preloadImage,
    preloadScript,
    preloadStyle,
  };
};

// Performance budget hook
export const usePerformanceBudget = (maxRenderTime: number = 16) => {
  const [isOverBudget, setIsOverBudget] = useState(false);
  const renderTimes = useRef<number[]>([]);

  const measureRender = useCallback((renderFn: () => void) => {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    const renderTime = end - start;

    renderTimes.current.push(renderTime);
    
    // Keep only last 10 render times
    if (renderTimes.current.length > 10) {
      renderTimes.current.shift();
    }

    // Check if average render time exceeds budget
    const averageRenderTime = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length;
    setIsOverBudget(averageRenderTime > maxRenderTime);

    return renderTime;
  }, [maxRenderTime]);

  return {
    isOverBudget,
    measureRender,
    renderTimes: renderTimes.current,
  };
};
