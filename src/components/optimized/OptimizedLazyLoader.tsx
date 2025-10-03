import React, { memo, Suspense } from 'react';
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
