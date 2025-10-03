import React, { memo, Suspense, lazy, ComponentType } from 'react';
import { cn } from '@/lib/utils';
import { DefaultFallback } from './LazyLoader.utils';

interface LazyLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  minHeight?: string;
}

// Optimized lazy loader with intersection observer
export const OptimizedLazyLoader = memo<LazyLoaderProps>(({
  children,
  fallback,
  className,
  minHeight = '200px'
}) => {
  return (
    <div className={cn('w-full', className)} style={{ minHeight }}>
      <Suspense fallback={fallback || <DefaultFallback minHeight={minHeight} />}>
        {children}
      </Suspense>
    </div>
  );
});

OptimizedLazyLoader.displayName = 'OptimizedLazyLoader';

// Higher-order component for lazy loading
export const withLazyLoading = <P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(() => Promise.resolve({ default: Component }));
  
  return memo((props: P) => (
    <OptimizedLazyLoader fallback={fallback}>
      <LazyComponent {...props} />
    </OptimizedLazyLoader>
  ));
};

// Utility for creating lazy components
export const createLazyComponent = <P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(importFn);
  
  return memo((props: P) => (
    <OptimizedLazyLoader fallback={fallback}>
      <LazyComponent {...props} />
    </OptimizedLazyLoader>
  ));
};
