import React, { memo, lazy, ComponentType } from 'react';
import { OptimizedLazyLoader } from './OptimizedLazyLoader';

// Higher-order component for lazy loading
export const withLazyLoading = <P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(() => Promise.resolve({ default: Component }));
  
  return memo((props: P) => 
    React.createElement(OptimizedLazyLoader, { fallback }, 
      React.createElement(LazyComponent, props)
    )
  );
};

// Utility for creating lazy components
export const createLazyComponent = <P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(importFn);
  
  return memo((props: P) => 
    React.createElement(OptimizedLazyLoader, { fallback }, 
      React.createElement(LazyComponent, props)
    )
  );
};
