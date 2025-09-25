// Comprehensive monitoring system for Project Glocal
import { useEffect, useCallback, useRef } from 'react';

interface MonitoringConfig {
  enablePerformanceMonitoring: boolean;
  enableErrorTracking: boolean;
  enableUserAnalytics: boolean;
  enableSecurityMonitoring: boolean;
  enableRealTimeMonitoring: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  maxLogEntries: number;
  flushInterval: number;
}

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  componentName: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

interface ErrorEvent {
  message: string;
  stack?: string;
  componentName: string;
  userId?: string;
  sessionId: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userAgent: string;
  url: string;
}

interface UserEvent {
  eventType: string;
  eventData: any;
  userId?: string;
  sessionId: string;
  timestamp: number;
  componentName: string;
  privacyLevel: 'anonymous' | 'pseudonymous' | 'identified';
}

interface SecurityEvent {
  eventType: 'xss_attempt' | 'csrf_attempt' | 'rate_limit_exceeded' | 'suspicious_activity';
  details: any;
  userId?: string;
  sessionId: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress?: string;
  userAgent: string;
}

class MonitoringSystem {
  private config: MonitoringConfig;
  private metrics: PerformanceMetrics[] = [];
  private errors: ErrorEvent[] = [];
  private userEvents: UserEvent[] = [];
  private securityEvents: SecurityEvent[] = [];
  private sessionId: string;
  private flushTimer: NodeJS.Timeout | null = null;
  private isOnline: boolean = true;

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = {
      enablePerformanceMonitoring: true,
      enableErrorTracking: true,
      enableUserAnalytics: true,
      enableSecurityMonitoring: true,
      enableRealTimeMonitoring: true,
      logLevel: 'info',
      maxLogEntries: 1000,
      flushInterval: 30000, // 30 seconds
      ...config
    };

    this.sessionId = this.generateSessionId();
    this.setupEventListeners();
    this.startFlushTimer();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupEventListeners(): void {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.flushData();
      }
    });

    // Before unload
    window.addEventListener('beforeunload', () => {
      this.flushData();
    });

    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        stack: event.error?.stack,
        componentName: 'Global',
        severity: 'high',
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    });

    // Unhandled promise rejection
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        componentName: 'Global',
        severity: 'high',
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    });
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flushData();
    }, this.config.flushInterval);
  }

  // Performance monitoring
  trackPerformance(metrics: Omit<PerformanceMetrics, 'timestamp' | 'sessionId'>): void {
    if (!this.config.enablePerformanceMonitoring) return;

    const performanceData: PerformanceMetrics = {
      ...metrics,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.metrics.push(performanceData);
    this.trimMetrics();

    if (this.config.enableRealTimeMonitoring) {
      this.sendToServer('performance', performanceData);
    }
  }

  // Error tracking
  trackError(error: Omit<ErrorEvent, 'timestamp' | 'sessionId'>): void {
    if (!this.config.enableErrorTracking) return;

    const errorData: ErrorEvent = {
      ...error,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.errors.push(errorData);
    this.trimErrors();

    if (this.config.enableRealTimeMonitoring) {
      this.sendToServer('error', errorData);
    }
  }

  // User analytics
  trackUserEvent(event: Omit<UserEvent, 'timestamp' | 'sessionId'>): void {
    if (!this.config.enableUserAnalytics) return;

    const userEventData: UserEvent = {
      ...event,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.userEvents.push(userEventData);
    this.trimUserEvents();

    if (this.config.enableRealTimeMonitoring) {
      this.sendToServer('user_event', userEventData);
    }
  }

  // Security monitoring
  trackSecurityEvent(event: Omit<SecurityEvent, 'timestamp' | 'sessionId'>): void {
    if (!this.config.enableSecurityMonitoring) return;

    const securityEventData: SecurityEvent = {
      ...event,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.securityEvents.push(securityEventData);
    this.trimSecurityEvents();

    if (this.config.enableRealTimeMonitoring) {
      this.sendToServer('security_event', securityEventData);
    }
  }

  // Send data to server
  private async sendToServer(type: string, data: any): Promise<void> {
    if (!this.isOnline) {
      this.storeOfflineData(type, data);
      return;
    }

    try {
      const response = await fetch('/api/monitoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': this.sessionId
        },
        body: JSON.stringify({ type, data })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.warn('Failed to send monitoring data:', error);
      this.storeOfflineData(type, data);
    }
  }

  // Store data for offline sync
  private storeOfflineData(type: string, data: any): void {
    const offlineData = JSON.parse(localStorage.getItem('monitoring_offline') || '[]');
    offlineData.push({ type, data, timestamp: Date.now() });
    localStorage.setItem('monitoring_offline', JSON.stringify(offlineData));
  }

  // Flush offline data when online
  private async flushOfflineData(): Promise<void> {
    const offlineData = JSON.parse(localStorage.getItem('monitoring_offline') || '[]');
    
    for (const item of offlineData) {
      await this.sendToServer(item.type, item.data);
    }
    
    localStorage.removeItem('monitoring_offline');
  }

  // Flush all data
  async flushData(): Promise<void> {
    if (!this.isOnline) return;

    try {
      await this.flushOfflineData();

      const batchData = {
        performance: this.metrics,
        errors: this.errors,
        userEvents: this.userEvents,
        securityEvents: this.securityEvents,
        sessionId: this.sessionId,
        timestamp: Date.now()
      };

      await this.sendToServer('batch', batchData);

      // Clear local data after successful send
      this.metrics = [];
      this.errors = [];
      this.userEvents = [];
      this.securityEvents = [];
    } catch (error) {
      console.warn('Failed to flush monitoring data:', error);
    }
  }

  // Trim arrays to prevent memory issues
  private trimMetrics(): void {
    if (this.metrics.length > this.config.maxLogEntries) {
      this.metrics = this.metrics.slice(-this.config.maxLogEntries);
    }
  }

  private trimErrors(): void {
    if (this.errors.length > this.config.maxLogEntries) {
      this.errors = this.errors.slice(-this.config.maxLogEntries);
    }
  }

  private trimUserEvents(): void {
    if (this.userEvents.length > this.config.maxLogEntries) {
      this.userEvents = this.userEvents.slice(-this.config.maxLogEntries);
    }
  }

  private trimSecurityEvents(): void {
    if (this.securityEvents.length > this.config.maxLogEntries) {
      this.securityEvents = this.securityEvents.slice(-this.config.maxLogEntries);
    }
  }

  // Get current metrics
  getMetrics(): {
    performance: PerformanceMetrics[];
    errors: ErrorEvent[];
    userEvents: UserEvent[];
    securityEvents: SecurityEvent[];
  } {
    return {
      performance: [...this.metrics],
      errors: [...this.errors],
      userEvents: [...this.userEvents],
      securityEvents: [...this.securityEvents]
    };
  }

  // Update configuration
  updateConfig(newConfig: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.flushInterval) {
      this.startFlushTimer();
    }
  }

  // Cleanup
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    this.flushData();
  }
}

// React hooks for monitoring
export const useMonitoring = (config?: Partial<MonitoringConfig>) => {
  const monitoringRef = useRef<MonitoringSystem | null>(null);

  useEffect(() => {
    if (!monitoringRef.current) {
      monitoringRef.current = new MonitoringSystem(config);
    }

    return () => {
      if (monitoringRef.current) {
        monitoringRef.current.destroy();
        monitoringRef.current = null;
      }
    };
  }, [config]);

  const trackPerformance = useCallback((metrics: Omit<PerformanceMetrics, 'timestamp' | 'sessionId'>) => {
    monitoringRef.current?.trackPerformance(metrics);
  }, []);

  const trackError = useCallback((error: Omit<ErrorEvent, 'timestamp' | 'sessionId'>) => {
    monitoringRef.current?.trackError(error);
  }, []);

  const trackUserEvent = useCallback((event: Omit<UserEvent, 'timestamp' | 'sessionId'>) => {
    monitoringRef.current?.trackUserEvent(event);
  }, []);

  const trackSecurityEvent = useCallback((event: Omit<SecurityEvent, 'timestamp' | 'sessionId'>) => {
    monitoringRef.current?.trackSecurityEvent(event);
  }, []);

  const getMetrics = useCallback(() => {
    return monitoringRef.current?.getMetrics() || {
      performance: [],
      errors: [],
      userEvents: [],
      securityEvents: []
    };
  }, []);

  const flushData = useCallback(async () => {
    await monitoringRef.current?.flushData();
  }, []);

  return {
    trackPerformance,
    trackError,
    trackUserEvent,
    trackSecurityEvent,
    getMetrics,
    flushData
  };
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  const { trackPerformance } = useMonitoring();

  useEffect(() => {
    const startTime = performance.now();
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;

    return () => {
      const endTime = performance.now();
      const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      trackPerformance({
        renderTime: endTime - startTime,
        memoryUsage: endMemory - startMemory,
        componentName
      });
    };
  }, [componentName, trackPerformance]);
};

// Error boundary integration
export const useErrorTracking = (componentName: string) => {
  const { trackError } = useMonitoring();

  const trackComponentError = useCallback((error: Error, errorInfo?: any) => {
    trackError({
      message: error.message,
      stack: error.stack,
      componentName,
      severity: 'high',
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }, [componentName, trackError]);

  return { trackComponentError };
};

// User analytics hook
export const useUserAnalytics = (componentName: string) => {
  const { trackUserEvent } = useMonitoring();

  const trackEvent = useCallback((eventType: string, eventData: any, privacyLevel: 'anonymous' | 'pseudonymous' | 'identified' = 'anonymous') => {
    trackUserEvent({
      eventType,
      eventData,
      componentName,
      privacyLevel
    });
  }, [componentName, trackUserEvent]);

  return { trackEvent };
};

// Security monitoring hook
export const useSecurityMonitoring = (componentName: string) => {
  const { trackSecurityEvent } = useMonitoring();

  const trackSecurityIncident = useCallback((eventType: SecurityEvent['eventType'], details: any, severity: SecurityEvent['severity'] = 'medium') => {
    trackSecurityEvent({
      eventType,
      details,
      severity,
      userAgent: navigator.userAgent
    });
  }, [trackSecurityEvent]);

  return { trackSecurityIncident };
};

export default MonitoringSystem;
