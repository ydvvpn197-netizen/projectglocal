import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { notificationService } from '@/services/notificationService';
import { testNotifications, cleanupTestNotifications, createSampleNotifications } from '@/utils/testNotifications';
import { supabase } from '@/integrations/supabase/client';
import { notificationHealthCheck, HealthCheckResult } from '@/services/notificationHealthCheck';
import { CheckCircle, XCircle, Clock, Bell, RefreshCw, Trash2, Plus, Heart } from 'lucide-react';

interface TestResult {
  test: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message?: string;
  duration?: number;
}

export const NotificationSystemTest: React.FC = () => {
  const { user } = useAuth();
  const { counts, refresh, refreshCounts } = useNotifications();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [realtimeEvents, setRealtimeEvents] = useState<unknown[]>([]);
  const [healthCheck, setHealthCheck] = useState<HealthCheckResult | null>(null);
  const [isHealthCheckRunning, setIsHealthCheckRunning] = useState(false);

  const tests: TestResult[] = [
    { test: 'Database Connection', status: 'pending' },
    { test: 'Create Personal Notification', status: 'pending' },
    { test: 'Create General Notification', status: 'pending' },
    { test: 'Mark as Read', status: 'pending' },
    { test: 'Delete Notification', status: 'pending' },
    { test: 'Real-time Subscription', status: 'pending' },
    { test: 'Notification Counts', status: 'pending' },
    { test: 'Error Handling', status: 'pending' },
  ];

  const updateTestResult = (testName: string, status: TestResult['status'], message?: string, duration?: number) => {
    setTestResults(prev => prev.map(test => 
      test.test === testName 
        ? { ...test, status, message, duration }
        : test
    ));
  };

  const runTest = async (testName: string, testFn: () => Promise<unknown>) => {
    const startTime = Date.now();
    updateTestResult(testName, 'running');
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      updateTestResult(testName, 'passed', `Success: ${JSON.stringify(result)}`, duration);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTestResult(testName, 'failed', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, duration);
      throw error;
    }
  };

  const runAllTests = async () => {
    if (!user?.id) {
      alert('Please log in to run tests');
      return;
    }

    setIsRunning(true);
    setTestResults(tests);

    try {
      // Test 1: Database Connection
      await runTest('Database Connection', async () => {
        const { data, error } = await supabase
          .from('personal_notifications')
          .select('count')
          .limit(1);
        
        if (error) throw error;
        return { connected: true, count: data?.length || 0 };
      });

      // Test 2: Create Personal Notification
      await runTest('Create Personal Notification', async () => {
        const notificationId = await notificationService.createPersonalNotification(
          user.id,
          'Test Notification',
          'This is a test notification for system verification',
          'system_announcement',
          { test: true, timestamp: new Date().toISOString() }
        );
        
        if (!notificationId) throw new Error('Failed to create notification');
        return { notificationId };
      });

      // Test 3: Create General Notification (admin only)
      await runTest('Create General Notification', async () => {
        const { data, error } = await supabase
          .from('general_notifications')
          .insert({
            title: 'Test General Notification',
            message: 'This is a test general notification',
            type: 'system',
            priority: 'low',
            target_audience: 'all'
          })
          .select('id')
          .single();
        
        if (error) throw error;
        return { notificationId: data.id };
      });

      // Test 4: Mark as Read
      await runTest('Mark as Read', async () => {
        const { data: notifications } = await supabase
          .from('personal_notifications')
          .select('id')
          .eq('user_id', user.id)
          .eq('read', false)
          .limit(1);
        
        if (!notifications || notifications.length === 0) {
          return { skipped: 'No unread notifications to mark' };
        }
        
        const success = await notificationService.markAsRead(notifications[0].id, user.id);
        if (!success) throw new Error('Failed to mark notification as read');
        return { success };
      });

      // Test 5: Delete Notification
      await runTest('Delete Notification', async () => {
        const { data: notifications } = await supabase
          .from('personal_notifications')
          .select('id')
          .eq('user_id', user.id)
          .like('title', 'Test%')
          .limit(1);
        
        if (!notifications || notifications.length === 0) {
          return { skipped: 'No test notifications to delete' };
        }
        
        const success = await notificationService.deleteNotification(notifications[0].id, user.id);
        if (!success) throw new Error('Failed to delete notification');
        return { success };
      });

      // Test 6: Real-time Subscription
      await runTest('Real-time Subscription', async () => {
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Real-time subscription timeout'));
          }, 10000);

          const subscription = supabase
            .channel('test_notifications')
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'personal_notifications',
                filter: `user_id=eq.${user.id}`
              },
              (payload) => {
                clearTimeout(timeout);
                subscription.unsubscribe();
                resolve({ realtimeWorking: true, payload });
              }
            )
            .subscribe();

          // Create a test notification to trigger the subscription
          setTimeout(async () => {
            try {
              await notificationService.createPersonalNotification(
                user.id,
                'Real-time Test',
                'Testing real-time functionality',
                'system_announcement'
              );
            } catch (error) {
              clearTimeout(timeout);
              subscription.unsubscribe();
              reject(error);
            }
          }, 1000);
        });
      });

      // Test 7: Notification Counts
      await runTest('Notification Counts', async () => {
        const counts = await notificationService.getNotificationCounts(user.id);
        if (counts.total < 0) throw new Error('Invalid count values');
        return counts;
      });

      // Test 8: Error Handling
      await runTest('Error Handling', async () => {
        try {
          await notificationService.createPersonalNotification(
            'invalid-user-id',
            'Test',
            'Test',
            'system_announcement'
          );
          throw new Error('Should have failed with invalid user ID');
        } catch (error) {
          // Expected to fail
          return { errorHandlingWorking: true };
        }
      });

    } catch (error) {
      console.error('Test suite failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const setupRealtimeMonitoring = useCallback(() => {
    if (!user?.id) return;

    setRealtimeStatus('connecting');
    
    const subscription = supabase
      .channel('notification_monitoring')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'personal_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          setRealtimeEvents(prev => [{
            ...payload,
            timestamp: new Date().toISOString()
          }, ...prev.slice(0, 9)]); // Keep last 10 events
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'general_notifications'
        },
        (payload) => {
          setRealtimeEvents(prev => [{
            ...payload,
            timestamp: new Date().toISOString()
          }, ...prev.slice(0, 9)]);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('connected');
        } else if (status === 'CHANNEL_ERROR') {
          setRealtimeStatus('disconnected');
        }
      });

    return () => {
      subscription.unsubscribe();
      setRealtimeStatus('disconnected');
    };
  }, [user?.id]);

  useEffect(() => {
    const cleanup = setupRealtimeMonitoring();
    return cleanup;
  }, [setupRealtimeMonitoring]);

  const createTestNotification = async () => {
    if (!user?.id) return;
    
    await notificationService.createPersonalNotification(
      user.id,
      'Manual Test Notification',
      'This notification was created manually for testing',
      'system_announcement',
      { manual: true, timestamp: new Date().toISOString() }
    );
  };

  const runHealthCheck = async () => {
    setIsHealthCheckRunning(true);
    try {
      const result = await notificationHealthCheck.performHealthCheck();
      setHealthCheck(result);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsHealthCheckRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification System Test</CardTitle>
          <CardDescription>Please log in to run notification system tests</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification System Test Suite
          </CardTitle>
          <CardDescription>
            Comprehensive testing of the notification system including real-time functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Bell className="h-4 w-4" />
              )}
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            
            <Button 
              onClick={createTestNotification} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Test Notification
            </Button>
            
            <Button 
              onClick={refresh} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            
            <Button 
              onClick={runHealthCheck} 
              variant="outline"
              disabled={isHealthCheckRunning}
              className="flex items-center gap-2"
            >
              {isHealthCheckRunning ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Heart className="h-4 w-4" />
              )}
              {isHealthCheckRunning ? 'Checking...' : 'Health Check'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{counts.personal}</div>
              <div className="text-sm text-muted-foreground">Personal Notifications</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{counts.general}</div>
              <div className="text-sm text-muted-foreground">General Notifications</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{counts.total}</div>
              <div className="text-sm text-muted-foreground">Total Notifications</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {healthCheck && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              System Health Check
              <Badge className={notificationHealthCheck.getStatusColor(healthCheck.status)}>
                {notificationHealthCheck.getStatusIcon(healthCheck.status)} {healthCheck.status}
              </Badge>
            </CardTitle>
            <CardDescription>
              Last checked: {new Date(healthCheck.timestamp).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(healthCheck.checks).map(([key, check]) => (
                <div key={key} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium capitalize">{key}</span>
                    <Badge className={check.status === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {check.status === 'pass' ? '✅' : '❌'} {check.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{check.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">Duration: {check.duration}ms</p>
                </div>
              ))}
            </div>
            
            {healthCheck.recommendations && healthCheck.recommendations.length > 0 && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Recommendations:</h4>
                <ul className="text-sm space-y-1">
                  {healthCheck.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <span className="font-medium">{result.test}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(result.status)}>
                    {result.status}
                  </Badge>
                  {result.duration && (
                    <span className="text-sm text-muted-foreground">
                      {result.duration}ms
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Real-time Status: 
            <Badge className={
              realtimeStatus === 'connected' ? 'bg-green-100 text-green-800' :
              realtimeStatus === 'connecting' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }>
              {realtimeStatus}
            </Badge>
          </CardTitle>
          <CardDescription>
            Live monitoring of real-time notification events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {realtimeEvents.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No real-time events yet. Create a notification to see events here.
              </p>
            ) : (
              realtimeEvents.map((event, index) => (
                <div key={index} className="p-3 border rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{event.eventType}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <strong>Table:</strong> {event.table}
                  </div>
                  {event.new && (
                    <div className="text-sm mt-1">
                      <strong>Data:</strong> {JSON.stringify(event.new, null, 2)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
