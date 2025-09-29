import React, { Suspense, lazy, ComponentType } from 'react';
import { DefaultFallback } from './LazyLoader.fallback';

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

// Route-based lazy loading
export const createLazyRoute = (importFunc: () => Promise<{ default: ComponentType<Record<string, unknown>> }>) => {
  const LazyComponent = lazy(importFunc);
  
  return (props: Record<string, unknown>) => (
    <Suspense fallback={<DefaultFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};
