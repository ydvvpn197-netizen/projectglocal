import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

export interface PerformanceMetrics {
  cls: number;
  inp: number;
  fcp: number;
  lcp: number;
  ttfb: number;
  timestamp: number;
  url: string;
  userAgent: string;
}

export interface PerformanceAlert {
  metric: string;
  value: number;
  threshold: number;
  severity: 'warning' | 'critical';
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics | null = null;
  private alerts: PerformanceAlert[] = [];
  private thresholds = {
    cls: 0.1,
    inp: 200,
    fcp: 1800,
    lcp: 2500,
    ttfb: 800,
  };

  constructor() {
    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    onCLS((metric) => this.handleMetric('cls', metric.value));
    onINP((metric) => this.handleMetric('inp', metric.value));
    onFCP((metric) => this.handleMetric('fcp', metric.value));
    onLCP((metric) => this.handleMetric('lcp', metric.value));
    onTTFB((metric) => this.handleMetric('ttfb', metric.value));

    this.monitorBundlePerformance();
    this.monitorResourceLoading();
  }

  private handleMetric(metricName: keyof PerformanceMetrics, value: number) {
    if (!this.metrics) {
      this.metrics = {
        cls: 0,
        inp: 0,
        fcp: 0,
        lcp: 0,
        ttfb: 0,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };
    }

    this.metrics[metricName] = value;
    this.checkThresholds(metricName, value);
  }

  private checkThresholds(metricName: keyof PerformanceMetrics, value: number) {
    const threshold = this.thresholds[metricName];
    let severity: 'warning' | 'critical' = 'warning';

    if (metricName === 'cls') {
      if (value > 0.25) severity = 'critical';
      else if (value > 0.1) severity = 'warning';
    } else {
      if (value > threshold * 1.5) severity = 'critical';
      else if (value > threshold) severity = 'warning';
    }

    if (value > threshold) {
      this.alerts.push({
        metric: metricName,
        value,
        threshold,
        severity,
        timestamp: Date.now(),
      });

      if (severity === 'critical') {
        console.error(`🚨 Critical Performance Alert: ${metricName} = ${value} (threshold: ${threshold})`);
      } else {
        console.warn(`⚠️ Performance Warning: ${metricName} = ${value} (threshold: ${threshold})`);
      }
    }
  }

  private monitorBundlePerformance() {
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach((script) => {
      const startTime = performance.now();
      script.addEventListener('load', () => {
        const loadTime = performance.now() - startTime;
        if (loadTime > 1000) {
          console.warn(`⚠️ Slow script loading: ${script.getAttribute('src')} took ${loadTime.toFixed(2)}ms`);
        }
      });
    });
  }

  private monitorResourceLoading() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming;
          if (resource.duration > 2000) {
            console.warn(`⚠️ Slow resource loading: ${resource.name} took ${resource.duration.toFixed(2)}ms`);
          }
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  public getMetrics(): PerformanceMetrics | null {
    return this.metrics;
  }

  public getAlerts(): PerformanceAlert[] {
    return this.alerts;
  }

  public getPerformanceScore(): number {
    if (!this.metrics) return 0;

    let score = 100;
    const weights = { cls: 0.25, inp: 0.15, fcp: 0.2, lcp: 0.3, ttfb: 0.1 };

    Object.entries(this.metrics).forEach(([key, value]) => {
      if (key === 'timestamp' || key === 'url' || key === 'userAgent') return;
      
      const metricName = key as keyof typeof this.thresholds;
      const threshold = this.thresholds[metricName];
      const weight = weights[metricName as keyof typeof weights];
      
      if (value > threshold) {
        const penalty = Math.min((value / threshold - 1) * 50, 50);
        score -= penalty * weight;
      }
    });

    return Math.max(0, Math.round(score));
  }

  public reportToAnalytics() {
    if (!this.metrics) return;

    const analyticsData = {
      ...this.metrics,
      score: this.getPerformanceScore(),
      alerts: this.alerts,
    };

    console.log('Performance Report:', analyticsData);
  }
}

export const performanceMonitor = new PerformanceMonitor();

export const usePerformanceMonitoring = () => {
  return {
    metrics: performanceMonitor.getMetrics(),
    alerts: performanceMonitor.getAlerts(),
    score: performanceMonitor.getPerformanceScore(),
    report: () => performanceMonitor.reportToAnalytics(),
  };
};

export const analyzeBundleSize = () => {
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  
  const analysis = {
    scripts: scripts.map(script => ({
      src: script.getAttribute('src'),
      size: script.getAttribute('data-size') || 'unknown',
    })),
    stylesheets: stylesheets.map(link => ({
      href: link.getAttribute('href'),
      size: link.getAttribute('data-size') || 'unknown',
    })),
    totalScripts: scripts.length,
    totalStylesheets: stylesheets.length,
  };

  console.log('Bundle Analysis:', analysis);
  return analysis;
};

export const getOptimizationRecommendations = (metrics: PerformanceMetrics) => {
  const recommendations: string[] = [];

  if (metrics.lcp > 2500) {
    recommendations.push('Optimize Largest Contentful Paint: Consider image optimization, preloading critical resources');
  }

  if (metrics.fcp > 1800) {
    recommendations.push('Improve First Contentful Paint: Reduce render-blocking resources, optimize CSS');
  }

  if (metrics.cls > 0.1) {
    recommendations.push('Reduce Cumulative Layout Shift: Set explicit dimensions for images and dynamic content');
  }

  if (metrics.inp > 200) {
    recommendations.push('Improve Interaction to Next Paint: Reduce JavaScript execution time, use code splitting');
  }

  if (metrics.ttfb > 800) {
    recommendations.push('Optimize Time to First Byte: Improve server response time, use CDN');
  }

  return recommendations;
};