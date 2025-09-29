import React, { Suspense, lazy, ComponentType } from 'react';

// Default loading fallback
const DefaultFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
    <span className="ml-2">Loading...</span>
  </div>
);

// Higher-order component for lazy loading
export const withLazyLoading = <P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(importFunc);
  
  return (props: P) => (
    <Suspense fallback={fallback || <DefaultFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Hook for lazy loading with delay
export const useLazyLoading = (delay: number = 200) => {
  const [shouldLoad, setShouldLoad] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return shouldLoad;
};

// Route-based lazy loading
export const createLazyRoute = (importFunc: () => Promise<{ default: ComponentType<Record<string, unknown>> }>) => {
  const LazyComponent = lazy(importFunc);
  
  return (props: Record<string, unknown>) => (
    <Suspense fallback={<DefaultFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Preload function for critical components
export const preloadComponent = (importFunc: () => Promise<unknown>) => {
  return () => {
    importFunc().catch((error) => {
      console.warn('Failed to preload component:', error);
    });
  };
};

// Intersection Observer hook for lazy loading on scroll
export const useIntersectionObserver = (
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, options]);

  return isIntersecting;
};

// Lazy loading configuration
export const LAZY_LOADING_CONFIG = {
  threshold: 0.1,
  rootMargin: '50px',
  delay: 100
};

// Intersection Observer options
export const INTERSECTION_OPTIONS = {
  root: null,
  rootMargin: '50px',
  threshold: 0.1
};

// Performance monitoring
export const PERFORMANCE_METRICS = {
  loadTime: 0,
  renderTime: 0,
  errorCount: 0
};
