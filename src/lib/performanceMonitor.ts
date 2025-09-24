/**
 * Performance Monitor
 * 
 * Tracks application performance metrics, route load times,
 * and user interactions for optimization insights.
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

interface RoutePerformance {
  route: string;
  loadTime: number;
  timestamp: number;
  userAgent: string;
  connectionType?: string;
}

interface UserInteraction {
  action: string;
  target: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private routeMetrics: RoutePerformance[] = [];
  private userInteractions: UserInteraction[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();

  constructor() {
    this.initializeObservers();
    this.setupRouteTracking();
  }

  /**
   * Initialize performance observers
   */
  private initializeObservers() {
    if (typeof window === 'undefined') return;

    // Navigation timing observer
    if ('PerformanceObserver' in window) {
      try {
        const navObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              this.recordMetric('navigation', entry.duration, {
                type: 'navigation',
                domContentLoaded: (entry as PerformanceNavigationTiming).domContentLoadedEventEnd - (entry as PerformanceNavigationTiming).domContentLoadedEventStart,
                loadComplete: (entry as PerformanceNavigationTiming).loadEventEnd - (entry as PerformanceNavigationTiming).loadEventStart
              });
            }
          });
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.set('navigation', navObserver);
      } catch (error) {
        console.warn('Navigation timing observer not supported:', error);
      }

      // Resource timing observer
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'resource') {
              this.recordMetric('resource', entry.duration, {
                name: entry.name,
                size: (entry as PerformanceResourceTiming).transferSize || 0,
                type: entry.name.split('.').pop()
              });
            }
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.set('resource', resourceObserver);
      } catch (error) {
        console.warn('Resource timing observer not supported:', error);
      }
    }
  }

  /**
   * Setup route change tracking
   */
  private setupRouteTracking() {
    if (typeof window === 'undefined') return;

    let routeStartTime = 0;
    const currentRoute = '';

    // Track route changes
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      routeStartTime = performance.now();
      const result = originalPushState.apply(history, args);
      return result;
    };

    history.replaceState = function(...args) {
      routeStartTime = performance.now();
      const result = originalReplaceState.apply(history, args);
      return result;
    };

    // Track route changes via popstate
    window.addEventListener('popstate', () => {
      const routeEndTime = performance.now();
      if (routeStartTime > 0 && currentRoute) {
        this.recordRoutePerformance(currentRoute, routeEndTime - routeStartTime);
      }
      routeStartTime = performance.now();
    });

    // Track initial route
    window.addEventListener('load', () => {
      routeStartTime = performance.now();
    });
  }

  /**
   * Record a performance metric
   */
  recordMetric(name: string, value: number, metadata?: Record<string, unknown>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    };

    this.metrics.push(metric);

    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Send to analytics if available
    this.sendToAnalytics('metric', metric);
  }

  /**
   * Record route performance
   */
  recordRoutePerformance(route: string, loadTime: number) {
    const routeMetric: RoutePerformance = {
      route,
      loadTime,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      connectionType: (navigator as Navigator & { connection?: { effectiveType?: string } }).connection?.effectiveType
    };

    this.routeMetrics.push(routeMetric);

    // Keep only last 500 route metrics
    if (this.routeMetrics.length > 500) {
      this.routeMetrics = this.routeMetrics.slice(-500);
    }

    // Send to analytics
    this.sendToAnalytics('route', routeMetric);

    // Log slow routes
    if (loadTime > 3000) {
      console.warn(`Slow route detected: ${route} took ${loadTime.toFixed(2)}ms`);
    }
  }

  /**
   * Record user interaction
   */
  recordUserInteraction(action: string, target: string, metadata?: Record<string, unknown>) {
    const interaction: UserInteraction = {
      action,
      target,
      timestamp: Date.now(),
      metadata
    };

    this.userInteractions.push(interaction);

    // Keep only last 1000 interactions
    if (this.userInteractions.length > 1000) {
      this.userInteractions = this.userInteractions.slice(-1000);
    }

    // Send to analytics
    this.sendToAnalytics('interaction', interaction);
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    const now = Date.now();
    const lastHour = now - (60 * 60 * 1000);
    const lastDay = now - (24 * 60 * 60 * 1000);

    const recentMetrics = this.metrics.filter(m => m.timestamp > lastHour);
    const recentRoutes = this.routeMetrics.filter(r => r.timestamp > lastHour);

    const avgLoadTime = recentRoutes.length > 0 
      ? recentRoutes.reduce((sum, r) => sum + r.loadTime, 0) / recentRoutes.length 
      : 0;

    const slowRoutes = recentRoutes.filter(r => r.loadTime > 2000);
    const fastRoutes = recentRoutes.filter(r => r.loadTime < 1000);

    return {
      totalMetrics: this.metrics.length,
      totalRoutes: this.routeMetrics.length,
      totalInteractions: this.userInteractions.length,
      recentMetrics: recentMetrics.length,
      recentRoutes: recentRoutes.length,
      averageLoadTime: Math.round(avgLoadTime),
      slowRoutes: slowRoutes.length,
      fastRoutes: fastRoutes.length,
      slowRouteList: slowRoutes.map(r => ({ route: r.route, loadTime: Math.round(r.loadTime) }))
    };
  }

  /**
   * Get route performance insights
   */
  getRouteInsights() {
    const routeGroups = this.routeMetrics.reduce((groups, metric) => {
      const route = metric.route;
      if (!groups[route]) {
        groups[route] = [];
      }
      groups[route].push(metric.loadTime);
      return groups;
    }, {} as Record<string, number[]>);

    const insights = Object.entries(routeGroups).map(([route, times]) => ({
      route,
      count: times.length,
      average: Math.round(times.reduce((sum, time) => sum + time, 0) / times.length),
      min: Math.round(Math.min(...times)),
      max: Math.round(Math.max(...times)),
      p95: Math.round(times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)] || 0)
    }));

    return insights.sort((a, b) => b.count - a.count);
  }

  /**
   * Send data to analytics
   */
  private sendToAnalytics(type: string, data: unknown) {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as Window & { gtag?: (event: string, action: string, params: Record<string, unknown>) => void }).gtag) {
      (window as Window & { gtag: (event: string, action: string, params: Record<string, unknown>) => void }).gtag('event', 'performance_metric', {
        metric_type: type,
        metric_data: JSON.stringify(data)
      });
    }

    // Custom analytics endpoint (if configured)
    if (process.env.VITE_ANALYTICS_ENDPOINT) {
      fetch(process.env.VITE_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          data,
          timestamp: Date.now(),
          url: window.location.href
        })
      }).catch(error => {
        console.warn('Failed to send analytics data:', error);
      });
    }
  }

  /**
   * Start timing a custom operation
   */
  startTiming(name: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      this.recordMetric(name, endTime - startTime);
    };
  }

  /**
   * Measure function execution time
   */
  measureFunction<T>(name: string, fn: () => T): T {
    const endTiming = this.startTiming(name);
    try {
      const result = fn();
      endTiming();
      return result;
    } catch (error) {
      endTiming();
      throw error;
    }
  }

  /**
   * Measure async function execution time
   */
  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const endTiming = this.startTiming(name);
    try {
      const result = await fn();
      endTiming();
      return result;
    } catch (error) {
      endTiming();
      throw error;
    }
  }

  /**
   * Cleanup observers
   */
  cleanup() {
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers.clear();
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export types
export type { PerformanceMetric, RoutePerformance, UserInteraction };
