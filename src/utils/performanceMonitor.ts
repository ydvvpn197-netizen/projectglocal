import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  componentCount: number;
  errorCount: number;
  networkLatency: number;
  bundleSize: number;
}

interface PerformanceConfig {
  enableMonitoring: boolean;
  sampleRate: number;
  maxMetrics: number;
  reportInterval: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private config: PerformanceConfig;
  private observers: Map<string, PerformanceObserver> = new Map();
  private isMonitoring = false;

  constructor() {
    this.config = {
      enableMonitoring: process.env.NODE_ENV === 'development' || 
                       import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',
      sampleRate: 0.1, // 10% of operations
      maxMetrics: 1000,
      reportInterval: 30000 // 30 seconds
    };
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMonitoring(): void {
    if (!this.config.enableMonitoring || this.isMonitoring) return;

    this.isMonitoring = true;
    this.setupPerformanceObservers();
    this.startPeriodicReporting();
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }

  private setupPerformanceObservers(): void {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > 50) { // Tasks longer than 50ms
              this.recordMetric({
                renderTime: entry.duration,
                memoryUsage: this.getMemoryUsage(),
                componentCount: this.getComponentCount(),
                errorCount: 0,
                networkLatency: 0,
                bundleSize: this.getBundleSize()
              });
            }
          });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.set('longtask', longTaskObserver);
      } catch (error) {
        console.warn('Long task observer not supported:', error);
      }

      // Monitor navigation timing
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              this.recordMetric({
                renderTime: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
                memoryUsage: this.getMemoryUsage(),
                componentCount: this.getComponentCount(),
                errorCount: 0,
                networkLatency: navEntry.responseEnd - navEntry.requestStart,
                bundleSize: this.getBundleSize()
              });
            }
          });
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.set('navigation', navigationObserver);
      } catch (error) {
        console.warn('Navigation observer not supported:', error);
      }

      // Monitor resource timing
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === 'resource') {
              const resourceEntry = entry as PerformanceResourceTiming;
              if (resourceEntry.duration > 1000) { // Resources taking longer than 1s
                this.recordMetric({
                  renderTime: 0,
                  memoryUsage: this.getMemoryUsage(),
                  componentCount: this.getComponentCount(),
                  errorCount: 0,
                  networkLatency: resourceEntry.duration,
                  bundleSize: this.getBundleSize()
                });
              }
            }
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.set('resource', resourceObserver);
      } catch (error) {
        console.warn('Resource observer not supported:', error);
      }
    }
  }

  private recordMetric(metric: PerformanceMetrics): void {
    if (Math.random() > this.config.sampleRate) return;

    this.metrics.push({
      ...metric,
      timestamp: Date.now()
    } as PerformanceMetrics & { timestamp: number });

    // Keep only recent metrics
    if (this.metrics.length > this.config.maxMetrics) {
      this.metrics = this.metrics.slice(-this.config.maxMetrics);
    }
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as Record<string, unknown>).memory;
      return memory ? memory.usedJSHeapSize : 0;
    }
    return 0;
  }

  private getComponentCount(): number {
    return document.querySelectorAll('[data-react-component]').length;
  }

  private getBundleSize(): number {
    // Estimate bundle size based on loaded scripts
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src && src.includes('assets')) {
        // Rough estimation based on script count
        totalSize += 100000; // 100KB per script estimate
      }
    });
    return totalSize;
  }

  private startPeriodicReporting(): void {
    setInterval(() => {
      this.reportMetrics();
    }, this.config.reportInterval);
  }

  private reportMetrics(): void {
    if (this.metrics.length === 0) return;

    const recentMetrics = this.metrics.slice(-10); // Last 10 metrics
    const avgRenderTime = recentMetrics.reduce((sum, m) => sum + m.renderTime, 0) / recentMetrics.length;
    const avgMemoryUsage = recentMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) / recentMetrics.length;
    const avgNetworkLatency = recentMetrics.reduce((sum, m) => sum + m.networkLatency, 0) / recentMetrics.length;

    console.log('📊 Performance Metrics:', {
      avgRenderTime: `${avgRenderTime.toFixed(2)}ms`,
      avgMemoryUsage: `${(avgMemoryUsage / 1024 / 1024).toFixed(2)}MB`,
      avgNetworkLatency: `${avgNetworkLatency.toFixed(2)}ms`,
      componentCount: recentMetrics[0]?.componentCount || 0,
      sampleSize: recentMetrics.length
    });

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService({
        avgRenderTime,
        avgMemoryUsage,
        avgNetworkLatency,
        componentCount: recentMetrics[0]?.componentCount || 0,
        timestamp: Date.now()
      });
    }
  }

  private sendToMonitoringService(data: Record<string, unknown>): void {
    // Example: Send to monitoring service
    fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(error => {
      console.warn('Failed to send metrics:', error);
    });
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getAverageMetrics(): Partial<PerformanceMetrics> {
    if (this.metrics.length === 0) return {};

    return {
      renderTime: this.metrics.reduce((sum, m) => sum + m.renderTime, 0) / this.metrics.length,
      memoryUsage: this.metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / this.metrics.length,
      componentCount: this.metrics[this.metrics.length - 1]?.componentCount || 0,
      errorCount: this.metrics.reduce((sum, m) => sum + m.errorCount, 0),
      networkLatency: this.metrics.reduce((sum, m) => sum + m.networkLatency, 0) / this.metrics.length,
      bundleSize: this.metrics[this.metrics.length - 1]?.bundleSize || 0
    };
  }

  clearMetrics(): void {
    this.metrics = [];
  }
}

// React hook for performance monitoring
export const usePerformanceMonitor = (componentName: string) => {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  useEffect(() => {
    renderStartTime.current = performance.now();
    renderCount.current += 1;

    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      
      if (renderTime > 16) { // Longer than one frame (16.67ms)
        const monitor = PerformanceMonitor.getInstance();
        monitor.recordMetric({
          renderTime,
          memoryUsage: monitor.getMemoryUsage(),
          componentCount: monitor.getComponentCount(),
          errorCount: 0,
          networkLatency: 0,
          bundleSize: monitor.getBundleSize()
        });
      }
    };
  });

  const measureAsync = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> => {
    const startTime = performance.now();
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      
      if (duration > 100) { // Operations longer than 100ms
        console.warn(`Slow operation detected: ${operationName} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`Operation failed: ${operationName} after ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  }, []);

  return {
    measureAsync,
    renderCount: renderCount.current
  };
};

// Component performance wrapper
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  const WrappedComponent = (props: P) => {
    const { measureAsync } = usePerformanceMonitor(componentName);
    
    return React.createElement(Component, { ...props, measureAsync });
  };

  WrappedComponent.displayName = `withPerformanceMonitoring(${componentName})`;
  return WrappedComponent;
}

// Initialize performance monitoring
export const initializePerformanceMonitoring = () => {
  const monitor = PerformanceMonitor.getInstance();
  monitor.startMonitoring();
  
  // Monitor page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      monitor.stopMonitoring();
    } else {
      monitor.startMonitoring();
    }
  });

  return monitor;
};

export default PerformanceMonitor;