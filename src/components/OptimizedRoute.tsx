/**
 * OptimizedRoute Component
 * 
 * Provides optimized route loading with preloading, error boundaries,
 * and performance monitoring for better user experience.
 */

import React, { Suspense, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  createOptimizedLazyComponent, 
  preloadRouteGroup, 
  getRoutePriority, 
  useRoutePerformance, 
  useRoutePreload,
  RoutePriority 
} from '@/lib/routeOptimization';

interface OptimizedRouteProps {
  children: React.ReactNode;
  preloadGroups?: string[];
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Loading fallback component with route-specific loading states
 */
const RouteLoadingFallback: React.FC<{ routeName?: string }> = ({ routeName }) => {
  const [dots, setDots] = useState('');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <div className="text-center">
        <h3 className="text-lg font-medium text-foreground">
          Loading {routeName || 'page'}
        </h3>
        <p className="text-sm text-muted-foreground">
          Please wait{dots}
        </p>
      </div>
    </div>
  );
};

/**
 * Error boundary for route components
 */
class RouteErrorBoundary extends React.Component<
  { children: React.ReactNode; routeName?: string },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; routeName?: string }) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Route Error in ${this.props.routeName}:`, error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4 p-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-destructive mb-2">
              Something went wrong
            </h2>
            <p className="text-muted-foreground mb-4">
              We encountered an error while loading {this.props.routeName || 'this page'}.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}

/**
 * OptimizedRoute component with preloading and error handling
 */
export const OptimizedRoute: React.FC<OptimizedRouteProps> = ({
  children,
  preloadGroups = [],
  priority = 'MEDIUM'
}) => {
  const location = useLocation();
  const [isPreloading, setIsPreloading] = useState(false);
  
  // Extract route name from pathname
  const routeName = location.pathname.split('/').pop() || location.pathname;
  
  useEffect(() => {
    // Preload specified route groups
    if (preloadGroups.length > 0) {
      setIsPreloading(true);
      
      Promise.all(
        preloadGroups.map(group => {
          try {
            preloadRouteGroup(group as { name: string; priority: 'HIGH' | 'MEDIUM' | 'LOW'; routes: string[] });
          } catch (error) {
            console.warn(`Failed to preload route group: ${group}`, error);
          }
        })
      ).finally(() => {
        setIsPreloading(false);
      });
    }
  }, [preloadGroups]);
  
  // Determine loading priority based on route
  const routePriority = getRoutePriority(routeName);
  const loadingDelay = routePriority === 'HIGH' ? 0 : routePriority === 'MEDIUM' ? 100 : 200;
  
  return (
    <RouteErrorBoundary routeName={routeName}>
      <Suspense fallback={<RouteLoadingFallback routeName={routeName} />}>
        {isPreloading && (
          <div className="fixed top-0 left-0 w-full h-1 bg-primary/20 z-50">
            <div className="h-full bg-primary animate-pulse"></div>
          </div>
        )}
        {children}
      </Suspense>
    </RouteErrorBoundary>
  );
};

