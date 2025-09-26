/**
 * Performance Monitoring Utility
 * Tracks and optimizes application performance metrics
 */

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  networkRequests: number;
  bundleSize: number;
  cacheHitRate: number;
  errorRate: number;
}

interface PerformanceEntry {
  timestamp: number;
  metrics: PerformanceMetrics;
  url: string;
  userAgent: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private entries: PerformanceEntry[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private isMonitoring = false;

  constructor() {
    this.metrics = {
      loadTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      networkRequests: 0,
      bundleSize: 0,
      cacheHitRate: 0,
      errorRate: 0
    };
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring || typeof window === 'undefined') return;

    this.isMonitoring = true;
    this.setupObservers();
    this.trackInitialMetrics();
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }

  /**
   * Setup performance observers
   */
  private setupObservers(): void {
    // Navigation timing observer
    if ('PerformanceObserver' in window) {
      const navigationObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.updateNavigationMetrics(entry as PerformanceNavigationTiming);
          }
        });
      });

      navigationObserver.observe({ entryTypes: ['navigation'] });
      this.observers.set('navigation', navigationObserver);

      // Resource timing observer
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        this.metrics.networkRequests += entries.length;
      });

      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', resourceObserver);

      // Paint timing observer
      const paintObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.renderTime = entry.startTime;
          }
        });
      });

      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.set('paint', paintObserver);
    }
  }

  /**
   * Track initial performance metrics
   */
  private trackInitialMetrics(): void {
    // Track memory usage if available
    if ('memory' in performance) {
      const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
    }

    // Track bundle size from performance entries
    this.trackBundleSize();

    // Track cache hit rate
    this.trackCacheHitRate();
  }

  /**
   * Update navigation timing metrics
   */
  private updateNavigationMetrics(entry: PerformanceNavigationTiming): void {
    this.metrics.loadTime = entry.loadEventEnd - entry.fetchStart;
  }

  /**
   * Track bundle size from performance entries
   */
  private trackBundleSize(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        let totalSize = 0;
        
        entries.forEach((entry) => {
          if (entry.name.includes('.js') || entry.name.includes('.css')) {
            totalSize += entry.transferSize || 0;
          }
        });
        
        this.metrics.bundleSize = totalSize / 1024; // KB
      });

      observer.observe({ entryTypes: ['resource'] });
      this.observers.set('bundle', observer);
    }
  }

  /**
   * Track cache hit rate
   */
  private trackCacheHitRate(): void {
    let cacheHits = 0;
    let totalRequests = 0;

    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          totalRequests++;
          if (entry.transferSize === 0 && entry.decodedBodySize > 0) {
            cacheHits++;
          }
        });
        
        this.metrics.cacheHitRate = totalRequests > 0 ? cacheHits / totalRequests : 0;
      });

      observer.observe({ entryTypes: ['resource'] });
      this.observers.set('cache', observer);
    }
  }

  /**
   * Record performance entry
   */
  recordEntry(): void {
    const entry: PerformanceEntry = {
      timestamp: Date.now(),
      metrics: { ...this.metrics },
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.entries.push(entry);

    // Keep only last 100 entries
    if (this.entries.length > 100) {
      this.entries = this.entries.slice(-100);
    }

    // Store in localStorage for analysis
    this.storeMetrics();
  }

  /**
   * Store metrics in localStorage
   */
  private storeMetrics(): void {
    try {
      const stored = localStorage.getItem('performance_metrics');
      const metrics = stored ? JSON.parse(stored) : [];
      
      metrics.push({
        timestamp: Date.now(),
        metrics: this.metrics,
        url: window.location.href
      });

      // Keep only last 50 entries
      if (metrics.length > 50) {
        metrics.splice(0, metrics.length - 50);
      }

      localStorage.setItem('performance_metrics', JSON.stringify(metrics));
    } catch (error) {
      console.warn('Failed to store performance metrics:', error);
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get performance history
   */
  getHistory(): PerformanceEntry[] {
    return [...this.entries];
  }

  /**
   * Calculate performance score
   */
  getPerformanceScore(): number {
    let score = 100;

    // Penalize slow load times
    if (this.metrics.loadTime > 3000) score -= 30;
    else if (this.metrics.loadTime > 2000) score -= 20;
    else if (this.metrics.loadTime > 1000) score -= 10;

    // Penalize slow render times
    if (this.metrics.renderTime > 1500) score -= 20;
    else if (this.metrics.renderTime > 1000) score -= 15;
    else if (this.metrics.renderTime > 500) score -= 10;

    // Penalize high memory usage
    if (this.metrics.memoryUsage > 100) score -= 15;
    else if (this.metrics.memoryUsage > 50) score -= 10;

    // Penalize large bundle sizes
    if (this.metrics.bundleSize > 1000) score -= 20;
    else if (this.metrics.bundleSize > 500) score -= 10;

    // Penalize low cache hit rate
    if (this.metrics.cacheHitRate < 0.5) score -= 15;
    else if (this.metrics.cacheHitRate < 0.7) score -= 10;

    // Reward high cache hit rate
    if (this.metrics.cacheHitRate > 0.9) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get performance recommendations
   */
  getRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.metrics.loadTime > 2000) {
      recommendations.push('🚀 Consider code splitting to reduce initial bundle size');
    }

    if (this.metrics.renderTime > 1000) {
      recommendations.push('⚡ Optimize rendering with React.memo and useMemo');
    }

    if (this.metrics.memoryUsage > 50) {
      recommendations.push('🧠 Check for memory leaks and optimize component cleanup');
    }

    if (this.metrics.bundleSize > 500) {
      recommendations.push('📦 Implement lazy loading for heavy components');
    }

    if (this.metrics.cacheHitRate < 0.7) {
      recommendations.push('💾 Improve caching strategy for static assets');
    }

    if (this.metrics.errorRate > 0.05) {
      recommendations.push('🐛 Address JavaScript errors affecting performance');
    }

    return recommendations;
  }

  /**
   * Export performance data
   */
  exportData(): string {
    return JSON.stringify({
      metrics: this.metrics,
      history: this.entries,
      score: this.getPerformanceScore(),
      recommendations: this.getRecommendations(),
      timestamp: new Date().toISOString()
    }, null, 2);
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export const usePerformanceMonitoring = () => {
  React.useEffect(() => {
    performanceMonitor.startMonitoring();

    const interval = setInterval(() => {
      performanceMonitor.recordEntry();
    }, 30000); // Record every 30 seconds

    return () => {
      clearInterval(interval);
      performanceMonitor.stopMonitoring();
    };
  }, []);

  return {
    metrics: performanceMonitor.getMetrics(),
    score: performanceMonitor.getPerformanceScore(),
    recommendations: performanceMonitor.getRecommendations(),
    exportData: performanceMonitor.exportData
  };
};

import React from 'react';
