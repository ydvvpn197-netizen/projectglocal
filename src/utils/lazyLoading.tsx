import { Suspense } from 'react';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({ children, fallback }) => (
  <Suspense fallback={fallback || <div>Loading...</div>}>
    {children}
  </Suspense>
);