/**
 * Performance Monitoring Utilities
 * Tracks Core Web Vitals and performance metrics
 */

export interface PerformanceMetrics {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  fcp: number | null;
  ttfb: number | null;
  bundleSize: number | null;
  loadTime: number | null;
}

export interface PerformanceConfig {
  enableLogging: boolean;
  enableReporting: boolean;
  reportEndpoint?: string;
  sampleRate: number;
}

const defaultConfig: PerformanceConfig = {
  enableLogging: import.meta.env.DEV,
  enableReporting: import.meta.env.PROD,
  sampleRate: 0.1, // 10% of users
};

class PerformanceMonitor {
  private config: PerformanceConfig;
  private metrics: PerformanceMetrics = {
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
    bundleSize: null,
    loadTime: null,
  };

  constructor(config: PerformanceConfig = defaultConfig) {
    this.config = config;
    this.initialize();
  }

  private initialize(): void {
    if (typeof window === 'undefined') return;

    // Track page load time
    this.trackPageLoadTime();
    
    // Track bundle size
    this.trackBundleSize();
    
    // Initialize Core Web Vitals tracking
    this.trackWebVitals();
    
    // Track resource loading
    this.trackResourceLoading();
  }

  private trackPageLoadTime(): void {
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      this.metrics.loadTime = loadTime;
      
      if (this.config.enableLogging) {
        console.log(`Page load time: ${loadTime.toFixed(2)}ms`);
      }
    });
  }

  private trackBundleSize(): void {
    // Estimate bundle size from loaded scripts
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;
    
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src && src.includes('js/')) {
        // Estimate size based on script name patterns
        totalSize += 100; // Rough estimate
      }
    });
    
    this.metrics.bundleSize = totalSize;
    
    if (this.config.enableLogging) {
      console.log(`Estimated bundle size: ${totalSize}KB`);
    }
  }

  private trackWebVitals(): void {
    // Dynamically import web-vitals to avoid bundle bloat
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS((metric) => {
        this.metrics.cls = metric.value;
        this.logMetric('CLS', metric);
      });

      getFID((metric) => {
        this.metrics.fid = metric.value;
        this.logMetric('FID', metric);
      });

      getFCP((metric) => {
        this.metrics.fcp = metric.value;
        this.logMetric('FCP', metric);
      });

      getLCP((metric) => {
        this.metrics.lcp = metric.value;
        this.logMetric('LCP', metric);
      });

      getTTFB((metric) => {
        this.metrics.ttfb = metric.value;
        this.logMetric('TTFB', metric);
      });
    }).catch(() => {
      console.warn('web-vitals not available');
    });
  }

  private trackResourceLoading(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming;
          
          if (this.config.enableLogging) {
            console.log(`Resource loaded: ${resource.name} (${resource.duration.toFixed(2)}ms)`);
          }
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  private logMetric(name: string, metric: any): void {
    if (this.config.enableLogging) {
      console.log(`${name}: ${metric.value.toFixed(2)}${metric.name.includes('CLS') ? '' : 'ms'}`);
    }

    // Report to analytics if enabled
    if (this.config.enableReporting && this.shouldReport()) {
      this.reportMetric(name, metric);
    }
  }

  private shouldReport(): boolean {
    return Math.random() < this.config.sampleRate;
  }

  private reportMetric(name: string, metric: any): void {
    if (!this.config.reportEndpoint) return;

    fetch(this.config.reportEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metric: name,
        value: metric.value,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
    }).catch(() => {
      // Silently fail for analytics
    });
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getPerformanceScore(): number {
    const { lcp, fid, cls, fcp, ttfb } = this.metrics;
    let score = 100;

    // LCP scoring (0-2.5s is good)
    if (lcp && lcp > 2500) score -= 20;
    else if (lcp && lcp > 4000) score -= 40;

    // FID scoring (0-100ms is good)
    if (fid && fid > 100) score -= 20;
    else if (fid && fid > 300) score -= 40;

    // CLS scoring (0-0.1 is good)
    if (cls && cls > 0.1) score -= 20;
    else if (cls && cls > 0.25) score -= 40;

    // FCP scoring (0-1.8s is good)
    if (fcp && fcp > 1800) score -= 10;
    else if (fcp && fcp > 3000) score -= 20;

    // TTFB scoring (0-800ms is good)
    if (ttfb && ttfb > 800) score -= 10;
    else if (ttfb && ttfb > 1800) score -= 20;

    return Math.max(0, score);
  }

  public isPerformanceGood(): boolean {
    const { lcp, fid, cls } = this.metrics;
    
    return (
      (lcp === null || lcp <= 2500) &&
      (fid === null || fid <= 100) &&
      (cls === null || cls <= 0.1)
    );
  }

  public getRecommendations(): string[] {
    const recommendations: string[] = [];
    const { lcp, fid, cls, fcp, ttfb, bundleSize } = this.metrics;

    if (lcp && lcp > 2500) {
      recommendations.push('Optimize Largest Contentful Paint - consider image optimization and critical CSS');
    }

    if (fid && fid > 100) {
      recommendations.push('Reduce First Input Delay - minimize JavaScript execution time');
    }

    if (cls && cls > 0.1) {
      recommendations.push('Improve Cumulative Layout Shift - ensure images have dimensions and avoid dynamic content');
    }

    if (fcp && fcp > 1800) {
      recommendations.push('Optimize First Contentful Paint - reduce render-blocking resources');
    }

    if (ttfb && ttfb > 800) {
      recommendations.push('Improve Time to First Byte - optimize server response time');
    }

    if (bundleSize && bundleSize > 500) {
      recommendations.push('Reduce bundle size - implement code splitting and remove unused dependencies');
    }

    return recommendations;
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export hook for React components
import { useState, useEffect } from 'react';

export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(performanceMonitor.getMetrics());
  const [score, setScore] = useState<number>(performanceMonitor.getPerformanceScore());
  const [isGood, setIsGood] = useState<boolean>(performanceMonitor.isPerformanceGood());

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(performanceMonitor.getMetrics());
      setScore(performanceMonitor.getPerformanceScore());
      setIsGood(performanceMonitor.isPerformanceGood());
    };

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    score,
    isGood,
    recommendations: performanceMonitor.getRecommendations(),
  };
};

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  performanceMonitor;
}