/**
 * Monitoring service for error tracking, performance monitoring, and analytics
 * This service provides a centralized way to track application metrics and errors
 */

export interface MonitoringEvent {
  type: 'error' | 'performance' | 'user_action' | 'api_call';
  name: string;
  data?: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  tags?: Record<string, string>;
}

export interface ErrorEvent {
  message: string;
  stack?: string;
  context?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class MonitoringService {
  private static instance: MonitoringService;
  private events: MonitoringEvent[] = [];
  private isInitialized = false;
  private sessionId: string;

  private constructor() {
    this.sessionId = this.generateSessionId();
  }

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  /**
   * Initialize monitoring service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Set up performance monitoring
      this.setupPerformanceMonitoring();
      
      // Set up error monitoring
      this.setupErrorMonitoring();
      
      // Set up user action tracking
      this.setupUserActionTracking();

      this.isInitialized = true;
      this.trackEvent('monitoring_initialized', { type: 'system' });
    } catch (error) {
      console.error('Failed to initialize monitoring:', error);
    }
  }

  /**
   * Track a custom event
   */
  trackEvent(name: string, data?: Record<string, any>, userId?: string): void {
    const event: MonitoringEvent = {
      type: 'user_action',
      name,
      data,
      timestamp: new Date().toISOString(),
      userId,
      sessionId: this.sessionId
    };

    this.events.push(event);
    this.sendToMonitoringService(event);
  }

  /**
   * Track an error
   */
  trackError(error: ErrorEvent, userId?: string): void {
    const event: MonitoringEvent = {
      type: 'error',
      name: 'application_error',
      data: {
        message: error.message,
        stack: error.stack,
        context: error.context,
        severity: error.severity
      },
      timestamp: new Date().toISOString(),
      userId,
      sessionId: this.sessionId
    };

    this.events.push(event);
    this.sendToMonitoringService(event);
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metric: PerformanceMetric): void {
    const event: MonitoringEvent = {
      type: 'performance',
      name: metric.name,
      data: {
        value: metric.value,
        unit: metric.unit,
        tags: metric.tags
      },
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId
    };

    this.events.push(event);
    this.sendToMonitoringService(event);
  }

  /**
   * Track API calls
   */
  trackApiCall(
    endpoint: string,
    method: string,
    duration: number,
    statusCode: number,
    userId?: string
  ): void {
    const event: MonitoringEvent = {
      type: 'api_call',
      name: 'api_request',
      data: {
        endpoint,
        method,
        duration,
        statusCode,
        success: statusCode >= 200 && statusCode < 300
      },
      timestamp: new Date().toISOString(),
      userId,
      sessionId: this.sessionId
    };

    this.events.push(event);
    this.sendToMonitoringService(event);
  }

  /**
   * Get all tracked events
   */
  getEvents(): MonitoringEvent[] {
    return [...this.events];
  }

  /**
   * Clear events (useful for testing)
   */
  clearEvents(): void {
    this.events = [];
  }

  /**
   * Set up performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    // Monitor page load performance
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.trackPerformance({
            name: 'page_load_time',
            value: navigation.loadEventEnd - navigation.loadEventStart,
            unit: 'ms'
          });

          this.trackPerformance({
            name: 'dom_content_loaded',
            value: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            unit: 'ms'
          });
        }
      });

      // Monitor long tasks
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) { // Tasks longer than 50ms
              this.trackPerformance({
                name: 'long_task',
                value: entry.duration,
                unit: 'ms',
                tags: { entryType: entry.entryType }
              });
            }
          }
        });
        observer.observe({ entryTypes: ['longtask'] });
      }
    }
  }

  /**
   * Set up error monitoring
   */
  private setupErrorMonitoring(): void {
    if (typeof window !== 'undefined') {
      // Monitor unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.trackError({
          message: event.reason?.message || 'Unhandled promise rejection',
          stack: event.reason?.stack,
          severity: 'high'
        });
      });

      // Monitor JavaScript errors
      window.addEventListener('error', (event) => {
        this.trackError({
          message: event.message,
          stack: event.error?.stack,
          context: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          },
          severity: 'medium'
        });
      });
    }
  }

  /**
   * Set up user action tracking
   */
  private setupUserActionTracking(): void {
    if (typeof window !== 'undefined') {
      // Track navigation
      let lastUrl = window.location.href;
      const observer = new MutationObserver(() => {
        if (window.location.href !== lastUrl) {
          this.trackEvent('page_navigation', {
            from: lastUrl,
            to: window.location.href
          });
          lastUrl = window.location.href;
        }
      });
      observer.observe(document, { subtree: true, childList: true });

      // Track user interactions
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (target.tagName === 'BUTTON' || target.closest('button')) {
          this.trackEvent('button_click', {
            buttonText: target.textContent?.trim(),
            buttonType: target.getAttribute('type'),
            buttonClass: target.className
          });
        }
      });
    }
  }

  /**
   * Send event to monitoring service
   */
  private async sendToMonitoringService(event: MonitoringEvent): Promise<void> {
    try {
      // In production, this would send to a real monitoring service like Sentry, LogRocket, etc.
      if (import.meta.env.DEV) {
        console.log('📊 Monitoring Event:', event);
      }

      // Example: Send to external monitoring service
      // await fetch('/api/monitoring', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event)
      // });

      // For now, just store locally
      this.storeEventLocally(event);
    } catch (error) {
      console.error('Failed to send monitoring event:', error);
    }
  }

  /**
   * Store event locally (for development/testing)
   */
  private storeEventLocally(event: MonitoringEvent): void {
    const storedEvents = JSON.parse(localStorage.getItem('monitoring_events') || '[]');
    storedEvents.push(event);
    
    // Keep only last 100 events
    if (storedEvents.length > 100) {
      storedEvents.splice(0, storedEvents.length - 100);
    }
    
    localStorage.setItem('monitoring_events', JSON.stringify(storedEvents));
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get monitoring statistics
   */
  getStats(): {
    totalEvents: number;
    errorCount: number;
    performanceCount: number;
    userActionCount: number;
    apiCallCount: number;
  } {
    const stats = {
      totalEvents: this.events.length,
      errorCount: 0,
      performanceCount: 0,
      userActionCount: 0,
      apiCallCount: 0
    };

    this.events.forEach(event => {
      switch (event.type) {
        case 'error':
          stats.errorCount++;
          break;
        case 'performance':
          stats.performanceCount++;
          break;
        case 'user_action':
          stats.userActionCount++;
          break;
        case 'api_call':
          stats.apiCallCount++;
          break;
      }
    });

    return stats;
  }
}

// Export singleton instance
export const monitoringService = MonitoringService.getInstance();
