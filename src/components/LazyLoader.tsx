import { Suspense, ReactNode } from 'react';

interface LazyLoaderProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const DefaultFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

export const LazyLoader = ({ children, fallback = <DefaultFallback /> }: LazyLoaderProps) => {
  return <Suspense fallback={fallback}>{children}</Suspense>;
};

// Specific loaders for different contexts
export const PageLoader = () => <DefaultFallback />;

export const ComponentLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
  </div>
);

export const CardLoader = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-muted rounded w-full mb-1"></div>
    <div className="h-3 bg-muted rounded w-2/3"></div>
  </div>
);
