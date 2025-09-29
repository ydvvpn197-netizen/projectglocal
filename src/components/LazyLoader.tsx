import React, { Suspense, lazy, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyLoaderProps {
  fallback?: React.ReactNode;
  delay?: number;
}

// Default loading fallback
const DefaultFallback = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-6 w-6 animate-spin" />
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

// Lazy loader component
export const LazyLoader: React.FC<LazyLoaderProps & { children: React.ReactNode }> = ({
  children,
  fallback,
  delay = 0
}) => {
  const shouldLoad = useLazyLoading(delay);

  if (!shouldLoad) {
    return <>{fallback || <DefaultFallback />}</>;
  }

  return <>{children}</>;
};

// Route-based lazy loading
export const createLazyRoute = (importFunc: () => Promise<{ default: ComponentType<any> }>) => {
  const LazyComponent = lazy(importFunc);
  
  return (props: any) => (
    <Suspense fallback={<DefaultFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Preload function for critical components
export const preloadComponent = (importFunc: () => Promise<any>) => {
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

// Lazy loading with intersection observer
export const LazyIntersectionLoader: React.FC<LazyLoaderProps & { children: React.ReactNode }> = ({
  children,
  fallback,
  delay = 0
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersectionObserver(ref);
  const [shouldLoad, setShouldLoad] = React.useState(false);

  React.useEffect(() => {
    if (isIntersecting && !shouldLoad) {
      const timer = setTimeout(() => {
        setShouldLoad(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isIntersecting, shouldLoad, delay]);

  return (
    <div ref={ref}>
      {shouldLoad ? children : (fallback || <DefaultFallback />)}
    </div>
  );
};