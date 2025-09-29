import { supabase } from '@/integrations/supabase/client';
import { anonymousUserService } from './anonymousUserService';

export interface AdvancedPerformanceMetrics {
  // Core Web Vitals
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  fcp: number | null;
  ttfb: number | null;
  
  // Additional metrics
  bundleSize: number | null;
  loadTime: number | null;
  renderTime: number | null;
  memoryUsage: number | null;
  networkLatency: number | null;
  cacheHitRate: number | null;
  
  // User experience metrics
  timeToInteractive: number | null;
  firstMeaningfulPaint: number | null;
  speedIndex: number | null;
  
  // Custom metrics
  apiResponseTime: number | null;
  componentRenderTime: number | null;
  imageLoadTime: number | null;
  fontLoadTime: number | null;
  
  // Error metrics
  errorCount: number;
  warningCount: number;
  crashCount: number;
}

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'critical';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export interface PerformanceReport {
  id: string;
  timestamp: Date;
  metrics: AdvancedPerformanceMetrics;
  score: number;
  alerts: PerformanceAlert[];
  recommendations: string[];
  userAgent: string;
  url: string;
  sessionId: string;
  userId?: string;
}

export interface PerformanceConfig {
  enableRealTimeMonitoring: boolean;
  enableAlerts: boolean;
  enableReporting: boolean;
  sampleRate: number;
  alertThresholds: {
    lcp: number;
    fid: number;
    cls: number;
    fcp: number;
    ttfb: number;
    bundleSize: number;
    memoryUsage: number;
    apiResponseTime: number;
  };
  reportInterval: number; // in milliseconds
  maxReportsPerSession: number;
}

const defaultConfig: PerformanceConfig = {
  enableRealTimeMonitoring: true,
  enableAlerts: true,
  enableReporting: true,
  sampleRate: 0.1, // 10% of users
  alertThresholds: {
    lcp: 2500, // 2.5 seconds
    fid: 100,  // 100ms
    cls: 0.1,  // 0.1
    fcp: 1800, // 1.8 seconds
    ttfb: 800, // 800ms
    bundleSize: 500, // 500KB
    memoryUsage: 100, // 100MB
    apiResponseTime: 1000 // 1 second
  },
  reportInterval: 30000, // 30 seconds
  maxReportsPerSession: 10
};

export class PerformanceMonitoringEnhanced {
  private static instance: PerformanceMonitoringEnhanced;
  private config: PerformanceConfig;
  private metrics: AdvancedPerformanceMetrics;
  private alerts: PerformanceAlert[] = [];
  private reports: PerformanceReport[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private reportTimer: NodeJS.Timeout | null = null;
  private sessionId: string;
  private userId?: string;
  private startTime: number;

  constructor(config: PerformanceConfig = defaultConfig) {
    this.config = config;
    this.metrics = this.initializeMetrics();
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    
    this.initialize();
  }

  static getInstance(): PerformanceMonitoringEnhanced {
    if (!PerformanceMonitoringEnhanced.instance) {
      PerformanceMonitoringEnhanced.instance = new PerformanceMonitoringEnhanced();
    }
    return PerformanceMonitoringEnhanced.instance;
  }

  /**
   * Initialize performance monitoring
   */
  private async initialize(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      // Get user ID if available
      const { data: { user } } = await supabase.auth.getUser();
      this.userId = user?.id;

      // Initialize all monitoring
      this.initializeCoreWebVitals();
      this.initializeCustomMetrics();
      this.initializeErrorTracking();
      this.initializeResourceMonitoring();
      this.initializeMemoryMonitoring();
      this.initializeNetworkMonitoring();
      
      // Start reporting if enabled
      if (this.config.enableReporting) {
        this.startReporting();
      }

      console.log('Enhanced performance monitoring initialized');
    } catch (error) {
      console.error('Failed to initialize performance monitoring:', error);
    }
  }

  /**
   * Initialize Core Web Vitals monitoring
   */
  private initializeCoreWebVitals(): void {
    // Dynamically import web-vitals to avoid bundle bloat
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS((metric) => {
        this.metrics.cls = metric.value;
        this.checkAlert('cls', metric.value);
      });

      getFID((metric) => {
        this.metrics.fid = metric.value;
        this.checkAlert('fid', metric.value);
      });

      getFCP((metric) => {
        this.metrics.fcp = metric.value;
        this.checkAlert('fcp', metric.value);
      });

      getLCP((metric) => {
        this.metrics.lcp = metric.value;
        this.checkAlert('lcp', metric.value);
      });

      getTTFB((metric) => {
        this.metrics.ttfb = metric.value;
        this.checkAlert('ttfb', metric.value);
      });
    }).catch(() => {
      console.warn('web-vitals not available');
    });
  }

  /**
   * Initialize custom metrics monitoring
   */
  private initializeCustomMetrics(): void {
    // Track page load time
    window.addEventListener('load', () => {
      this.metrics.loadTime = performance.now();
      this.metrics.renderTime = Date.now() - this.startTime;
    });

    // Track bundle size
    this.trackBundleSize();

    // Track component render times
    this.trackComponentRenderTimes();

    // Track image load times
    this.trackImageLoadTimes();

    // Track font load times
    this.trackFontLoadTimes();
  }

  /**
   * Initialize error tracking
   */
  private initializeErrorTracking(): void {
    // Track JavaScript errors
    window.addEventListener('error', (event) => {
      this.metrics.errorCount++;
      this.createAlert('error', 'javascript_error', 1, 0, `JavaScript error: ${event.message}`);
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.metrics.errorCount++;
      this.createAlert('error', 'unhandled_rejection', 1, 0, `Unhandled promise rejection: ${event.reason}`);
    });

    // Track console warnings
    const originalWarn = console.warn;
    console.warn = (...args) => {
      this.metrics.warningCount++;
      originalWarn.apply(console, args);
    };
  }

  /**
   * Initialize resource monitoring
   */
  private initializeResourceMonitoring(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming;
          
          // Track API response times
          if (resource.name.includes('/api/')) {
            this.metrics.apiResponseTime = resource.responseEnd - resource.requestStart;
            this.checkAlert('apiResponseTime', this.metrics.apiResponseTime);
          }
          
          // Track image load times
          if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
            this.metrics.imageLoadTime = resource.duration;
          }
          
          // Track font load times
          if (resource.name.match(/\.(woff|woff2|ttf|otf)$/)) {
            this.metrics.fontLoadTime = resource.duration;
          }
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
    this.observers.set('resource', observer);
  }

  /**
   * Initialize memory monitoring
   */
  private initializeMemoryMonitoring(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      
      const updateMemoryUsage = () => {
        this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
        this.checkAlert('memoryUsage', this.metrics.memoryUsage);
      };

      // Update memory usage every 10 seconds
      setInterval(updateMemoryUsage, 10000);
      updateMemoryUsage();
    }
  }

  /**
   * Initialize network monitoring
   */
  private initializeNetworkMonitoring(): void {
    // Track network latency
    const trackNetworkLatency = async () => {
      try {
        const start = Date.now();
        await fetch('/api/ping', { method: 'HEAD' });
        this.metrics.networkLatency = Date.now() - start;
      } catch (error) {
        // Network error, don't update latency
      }
    };

    // Track network latency every 30 seconds
    setInterval(trackNetworkLatency, 30000);
    trackNetworkLatency();
  }

  /**
   * Track bundle size
   */
  private trackBundleSize(): void {
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
    this.checkAlert('bundleSize', totalSize);
  }

  /**
   * Track component render times
   */
  private trackComponentRenderTimes(): void {
    // This would be implemented with React DevTools or custom hooks
    // For now, we'll track overall render time
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure' && entry.name.includes('render')) {
          this.metrics.componentRenderTime = entry.duration;
        }
      }
    });

    observer.observe({ entryTypes: ['measure'] });
    this.observers.set('measure', observer);
  }

  /**
   * Track image load times
   */
  private trackImageLoadTimes(): void {
    const images = document.querySelectorAll('img');
    let totalLoadTime = 0;
    let loadedImages = 0;

    images.forEach(img => {
      if (img.complete) {
        totalLoadTime += 0; // Already loaded
        loadedImages++;
      } else {
        img.addEventListener('load', () => {
          totalLoadTime += performance.now();
          loadedImages++;
          if (loadedImages === images.length) {
            this.metrics.imageLoadTime = totalLoadTime / loadedImages;
          }
        });
      }
    });
  }

  /**
   * Track font load times
   */
  private trackFontLoadTimes(): void {
    if ('fonts' in document) {
      (document as any).fonts.ready.then(() => {
        this.metrics.fontLoadTime = performance.now();
      });
    }
  }

  /**
   * Check for performance alerts
   */
  private checkAlert(metric: keyof PerformanceConfig['alertThresholds'], value: number): void {
    const threshold = this.config.alertThresholds[metric];
    
    if (value > threshold) {
      this.createAlert('warning', metric, value, threshold, 
        `${metric} exceeded threshold: ${value} > ${threshold}`);
    }
  }

  /**
   * Create performance alert
   */
  private createAlert(
    type: PerformanceAlert['type'],
    metric: string,
    value: number,
    threshold: number,
    message: string
  ): void {
    if (!this.config.enableAlerts) return;

    const alert: PerformanceAlert = {
      id: this.generateAlertId(),
      type,
      metric,
      value,
      threshold,
      message,
      timestamp: new Date(),
      resolved: false
    };

    this.alerts.push(alert);
    
    // Log alert
    console.warn(`Performance Alert: ${message}`);
    
    // Send alert to server if enabled
    if (this.config.enableReporting) {
      this.sendAlertToServer(alert);
    }
  }

  /**
   * Start performance reporting
   */
  private startReporting(): void {
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
    }

    this.reportTimer = setInterval(() => {
      if (this.reports.length < this.config.maxReportsPerSession) {
        this.generateReport();
      }
    }, this.config.reportInterval);
  }

  /**
   * Generate performance report
   */
  private async generateReport(): Promise<void> {
    try {
      const report: PerformanceReport = {
        id: this.generateReportId(),
        timestamp: new Date(),
        metrics: { ...this.metrics },
        score: this.calculatePerformanceScore(),
        alerts: [...this.alerts],
        recommendations: this.generateRecommendations(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        sessionId: this.sessionId,
        userId: this.userId
      };

      this.reports.push(report);

      // Send report to server
      await this.sendReportToServer(report);
    } catch (error) {
      console.error('Failed to generate performance report:', error);
    }
  }

  /**
   * Calculate performance score
   */
  private calculatePerformanceScore(): number {
    const { lcp, fid, cls, fcp, ttfb, bundleSize, memoryUsage, apiResponseTime } = this.metrics;
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

    // Bundle size scoring
    if (bundleSize && bundleSize > 500) score -= 10;
    else if (bundleSize && bundleSize > 1000) score -= 20;

    // Memory usage scoring
    if (memoryUsage && memoryUsage > 100) score -= 10;
    else if (memoryUsage && memoryUsage > 200) score -= 20;

    // API response time scoring
    if (apiResponseTime && apiResponseTime > 1000) score -= 10;
    else if (apiResponseTime && apiResponseTime > 2000) score -= 20;

    return Math.max(0, score);
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const { lcp, fid, cls, fcp, ttfb, bundleSize, memoryUsage, apiResponseTime } = this.metrics;

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

    if (memoryUsage && memoryUsage > 100) {
      recommendations.push('Optimize memory usage - check for memory leaks and optimize data structures');
    }

    if (apiResponseTime && apiResponseTime > 1000) {
      recommendations.push('Optimize API response times - implement caching and optimize database queries');
    }

    return recommendations;
  }

  /**
   * Send report to server
   */
  private async sendReportToServer(report: PerformanceReport): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('performance_reports')
        .insert({
          id: report.id,
          timestamp: report.timestamp.toISOString(),
          metrics: report.metrics,
          score: report.score,
          alerts: report.alerts,
          recommendations: report.recommendations,
          user_agent: report.userAgent,
          url: report.url,
          session_id: report.sessionId,
          user_id: report.userId
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to send performance report:', error);
    }
  }

  /**
   * Send alert to server
   */
  private async sendAlertToServer(alert: PerformanceAlert): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('performance_alerts')
        .insert({
          id: alert.id,
          type: alert.type,
          metric: alert.metric,
          value: alert.value,
          threshold: alert.threshold,
          message: alert.message,
          timestamp: alert.timestamp.toISOString(),
          resolved: alert.resolved,
          session_id: this.sessionId,
          user_id: this.userId
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to send performance alert:', error);
    }
  }

  /**
   * Get current metrics
   */
  public getMetrics(): AdvancedPerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get current alerts
   */
  public getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  /**
   * Get performance reports
   */
  public getReports(): PerformanceReport[] {
    return [...this.reports];
  }

  /**
   * Get performance score
   */
  public getPerformanceScore(): number {
    return this.calculatePerformanceScore();
  }

  /**
   * Check if performance is good
   */
  public isPerformanceGood(): boolean {
    const { lcp, fid, cls } = this.metrics;
    
    return (
      (lcp === null || lcp <= 2500) &&
      (fid === null || fid <= 100) &&
      (cls === null || cls <= 0.1)
    );
  }

  /**
   * Update configuration
   */
  public updateConfig(updates: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...updates };
    
    // Restart reporting if interval changed
    if (updates.reportInterval) {
      this.startReporting();
    }
  }

  /**
   * Clear alerts
   */
  public clearAlerts(): void {
    this.alerts = [];
  }

  /**
   * Clear reports
   */
  public clearReports(): void {
    this.reports = [];
  }

  /**
   * Destroy monitoring
   */
  public destroy(): void {
    // Clear timers
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
    }

    // Disconnect observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();

    // Clear data
    this.alerts = [];
    this.reports = [];
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate alert ID
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate report ID
   */
  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize metrics
   */
  private initializeMetrics(): AdvancedPerformanceMetrics {
    return {
      lcp: null,
      fid: null,
      cls: null,
      fcp: null,
      ttfb: null,
      bundleSize: null,
      loadTime: null,
      renderTime: null,
      memoryUsage: null,
      networkLatency: null,
      cacheHitRate: null,
      timeToInteractive: null,
      firstMeaningfulPaint: null,
      speedIndex: null,
      apiResponseTime: null,
      componentRenderTime: null,
      imageLoadTime: null,
      fontLoadTime: null,
      errorCount: 0,
      warningCount: 0,
      crashCount: 0
    };
  }
}

export const performanceMonitoringEnhanced = PerformanceMonitoringEnhanced.getInstance();
