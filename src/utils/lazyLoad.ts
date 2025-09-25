/**
 * Lazy loading utilities for better performance
 * Reduces initial bundle size by loading components only when needed
 */

import { lazy, ComponentType } from 'react';

// Lazy load with error boundary
export const createLazyComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: ComponentType
) => {
  const LazyComponent = lazy(importFunc);
  
  return (props: React.ComponentProps<T>) => {
    return React.createElement(LazyComponent, props);
  };
};

// Preload components for better UX
export const preloadComponent = (importFunc: () => Promise<any>) => {
  const promise = importFunc();
  return promise;
};

// Common lazy-loaded components
export const LazyCharts = lazy(() => import('@/components/ui/chart'));
export const LazyAnimations = lazy(() => import('@/components/ui/AnimatedCard'));

// Lazy load heavy libraries
export const lazyLoadFramerMotion = () => {
  return import('framer-motion').then(module => ({
    motion: module.motion,
    AnimatePresence: module.AnimatePresence
  }));
};

// Removed recharts lazy loading since it was removed from dependencies

// Intersection Observer for lazy loading
export const useIntersectionObserver = (
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      options
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [ref, options]);

  return isIntersecting;
};

import React from 'react';
