import { supabase } from '@/integrations/supabase/client';
import { notificationService } from './notificationService';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    database: { status: 'pass' | 'fail'; message: string; duration: number };
    realtime: { status: 'pass' | 'fail'; message: string; duration: number };
    notifications: { status: 'pass' | 'fail'; message: string; duration: number };
    performance: { status: 'pass' | 'fail'; message: string; duration: number };
  };
  timestamp: string;
  recommendations?: string[];
}

export class NotificationHealthCheck {
  private static instance: NotificationHealthCheck;
  private lastCheck: HealthCheckResult | null = null;
  private readonly CHECK_INTERVAL = 60000; // 1 minute
  private checkTimer: NodeJS.Timeout | null = null;

  static getInstance(): NotificationHealthCheck {
    if (!NotificationHealthCheck.instance) {
      NotificationHealthCheck.instance = new NotificationHealthCheck();
    }
    return NotificationHealthCheck.instance;
  }

  async performHealthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const checks = {
      database: await this.checkDatabase(),
      realtime: await this.checkRealtime(),
      notifications: await this.checkNotifications(),
      performance: await this.checkPerformance()
    };

    const overallStatus = this.determineOverallStatus(checks);
    const recommendations = this.generateRecommendations(checks);

    const result: HealthCheckResult = {
      status: overallStatus,
      checks,
      timestamp: new Date().toISOString(),
      recommendations
    };

    this.lastCheck = result;
    return result;
  }

  private async checkDatabase(): Promise<{ status: 'pass' | 'fail'; message: string; duration: number }> {
    const startTime = Date.now();
    
    try {
      // Test basic database connectivity
      const { data, error } = await supabase
        .from('personal_notifications')
        .select('count')
        .limit(1);

      const duration = Date.now() - startTime;
      
      if (error) {
        return {
          status: 'fail',
          message: `Database error: ${error.message}`,
          duration
        };
      }

      // Test table structure
      const { data: tableInfo, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .in('table_name', ['personal_notifications', 'general_notifications']);

      if (tableError || !tableInfo || tableInfo.length < 2) {
        return {
          status: 'fail',
          message: 'Notification tables missing or inaccessible',
          duration
        };
      }

      return {
        status: 'pass',
        message: `Database healthy (${duration}ms)`,
        duration
      };
    } catch (error) {
      return {
        status: 'fail',
        message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      };
    }
  }

  private async checkRealtime(): Promise<{ status: 'pass' | 'fail'; message: string; duration: number }> {
    const startTime = Date.now();
    
    try {
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve({
            status: 'fail',
            message: 'Real-time connection timeout',
            duration: Date.now() - startTime
          });
        }, 5000);

        const testChannel = supabase
          .channel('health_check_test')
          .on('system', {}, (status) => {
            clearTimeout(timeout);
            testChannel.unsubscribe();
            
            if (status === 'SUBSCRIBED') {
              resolve({
                status: 'pass',
                message: `Real-time healthy (${Date.now() - startTime}ms)`,
                duration: Date.now() - startTime
              });
            } else {
              resolve({
                status: 'fail',
                message: `Real-time connection failed: ${status}`,
                duration: Date.now() - startTime
              });
            }
          })
          .subscribe();
      });
    } catch (error) {
      return {
        status: 'fail',
        message: `Real-time check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      };
    }
  }

  private async checkNotifications(): Promise<{ status: 'pass' | 'fail'; message: string; duration: number }> {
    const startTime = Date.now();
    
    try {
      // Test notification service functionality
      const generalNotifications = await notificationService.getGeneralNotifications(5);
      const counts = await notificationService.getNotificationCounts();
      
      const duration = Date.now() - startTime;
      
      if (!Array.isArray(generalNotifications) || typeof counts !== 'object') {
        return {
          status: 'fail',
          message: 'Notification service returned invalid data',
          duration
        };
      }

      return {
        status: 'pass',
        message: `Notifications working (${generalNotifications.length} general, ${counts.total} total)`,
        duration
      };
    } catch (error) {
      return {
        status: 'fail',
        message: `Notification service error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      };
    }
  }

  private async checkPerformance(): Promise<{ status: 'pass' | 'fail'; message: string; duration: number }> {
    const startTime = Date.now();
    
    try {
      // Test multiple operations to check performance
      const operations = [
        notificationService.getGeneralNotifications(10),
        notificationService.getNotificationCounts(),
        supabase.from('personal_notifications').select('count').limit(1)
      ];

      await Promise.all(operations);
      const duration = Date.now() - startTime;
      
      if (duration > 2000) {
        return {
          status: 'fail',
          message: `Performance degraded (${duration}ms)`,
          duration
        };
      }

      return {
        status: 'pass',
        message: `Performance good (${duration}ms)`,
        duration
      };
    } catch (error) {
      return {
        status: 'fail',
        message: `Performance check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      };
    }
  }

  private determineOverallStatus(checks: HealthCheckResult['checks']): 'healthy' | 'degraded' | 'unhealthy' {
    const failedChecks = Object.values(checks).filter(check => check.status === 'fail').length;
    const totalChecks = Object.keys(checks).length;

    if (failedChecks === 0) {
      return 'healthy';
    } else if (failedChecks <= totalChecks / 2) {
      return 'degraded';
    } else {
      return 'unhealthy';
    }
  }

  private generateRecommendations(checks: HealthCheckResult['checks']): string[] {
    const recommendations: string[] = [];

    if (checks.database.status === 'fail') {
      recommendations.push('Check database connection and table structure');
    }

    if (checks.realtime.status === 'fail') {
      recommendations.push('Verify Supabase real-time configuration and network connectivity');
    }

    if (checks.notifications.status === 'fail') {
      recommendations.push('Review notification service implementation and error logs');
    }

    if (checks.performance.status === 'fail') {
      recommendations.push('Optimize database queries and consider adding indexes');
    }

    if (recommendations.length === 0) {
      recommendations.push('System is operating normally');
    }

    return recommendations;
  }

  startPeriodicChecks(): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
    }

    this.checkTimer = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, this.CHECK_INTERVAL);
  }

  stopPeriodicChecks(): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
  }

  getLastCheck(): HealthCheckResult | null {
    return this.lastCheck;
  }

  getStatusColor(status: HealthCheckResult['status']): string {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'unhealthy': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  getStatusIcon(status: HealthCheckResult['status']): string {
    switch (status) {
      case 'healthy': return '✅';
      case 'degraded': return '⚠️';
      case 'unhealthy': return '❌';
      default: return '❓';
    }
  }
}

export const notificationHealthCheck = NotificationHealthCheck.getInstance();
