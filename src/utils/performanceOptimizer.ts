import { useEffect, useCallback, useMemo, useRef, useState } from 'react';

// Performance monitoring and optimization utilities

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  timestamp: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private config = {
    enableLogging: process.env.NODE_ENV === 'development',
    logThreshold: 16, // 16ms = 60fps
    maxMetrics: 100
  };

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTiming(componentName: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      this.recordMetric({
        renderTime,
        componentName,
        timestamp: Date.now()
      });
    };
  }

  recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    if (this.metrics.length > this.config.maxMetrics) {
      this.metrics = this.metrics.slice(-this.config.maxMetrics);
    }
    
    if (this.config.enableLogging && metric.renderTime > this.config.logThreshold) {
      console.warn(`Slow render: ${metric.componentName} took ${metric.renderTime.toFixed(2)}ms`);
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getAverageRenderTime(componentName?: string): number {
    const filteredMetrics = componentName 
      ? this.metrics.filter(m => m.componentName === componentName)
      : this.metrics;
    
    if (filteredMetrics.length === 0) return 0;
    
    const totalTime = filteredMetrics.reduce((sum, metric) => sum + metric.renderTime, 0);
    return totalTime / filteredMetrics.length;
  }
}

// Hook for performance monitoring
export function usePerformanceMonitor(componentName: string, enabled: boolean = true) {
  const monitor = PerformanceMonitor.getInstance();
  const renderCount = useRef(0);
  
  useEffect(() => {
    if (!enabled) return;
    
    renderCount.current += 1;
    const endTiming = monitor.startTiming(`${componentName}#${renderCount.current}`);
    
    return endTiming;
  });
}

// Hook for optimized memoization
export function useOptimizedMemo<T>(factory: () => T, deps: React.DependencyList): T {
  return useMemo(() => {
    const startTime = performance.now();
    const result = factory();
    const endTime = performance.now();
    
    if (endTime - startTime > 5) {
      console.warn(`Expensive computation: ${endTime - startTime}ms`);
    }
    
    return result;
  }, deps);
}

// Hook for optimized callbacks
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback((...args: Parameters<T>) => {
    const startTime = performance.now();
    const result = callback(...args);
    const endTime = performance.now();
    
    if (endTime - startTime > 5) {
      console.warn(`Expensive callback: ${endTime - startTime}ms`);
    }
    
    return result;
  }, deps);
}

// Performance utilities
export const performanceUtils = {
  throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
    let inThrottle: boolean;
    return ((...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    }) as T;
  },

  debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
    let timeoutId: NodeJS.Timeout;
    return ((...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    }) as T;
  }
};

// Initialize performance monitoring
export function initializePerformanceMonitoring(): void {
  const monitor = PerformanceMonitor.getInstance();
  
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          console.warn(`Long task: ${entry.duration}ms`);
        }
      }
    });
    
    observer.observe({ entryTypes: ['longtask'] });
  }
}

export { PerformanceMonitor };