import React from 'react';
import { Loader2 } from 'lucide-react';
import { useLazyLoading, useIntersectionObserver } from './LazyLoader.utils';

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