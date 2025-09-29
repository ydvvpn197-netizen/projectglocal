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

// Route-based lazy loading
export const createLazyRoute = (importFunc: () => Promise<{ default: ComponentType<Record<string, unknown>> }>) => {
  const LazyComponent = lazy(importFunc);
  
  return (props: Record<string, unknown>) => (
    <Suspense fallback={<DefaultFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};
