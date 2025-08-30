import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';
import { testNotifications, cleanupTestNotifications } from '@/utils/testNotifications';
import { notificationService } from '@/services/notificationService';
import { Bell, Play, Trash2, Check, X } from 'lucide-react';

const TestNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, fetchNotifications } = useNotifications();
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const handleRunTests = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to test notifications",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    setTestResults(null);

    try {
      const results = await testNotifications(user.id);
      setTestResults(results);
      
      if (results.success) {
        toast({
          title: "Tests Passed!",
          description: `Created ${results.notificationsCreated} notifications. Unread count: ${results.unreadCount}`,
        });
        // Refresh notifications
        await fetchNotifications();
      } else {
        toast({
          title: "Tests Failed",
          description: results.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Test error:', error);
      toast({
        title: "Test Error",
        description: "An error occurred while running tests",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleCleanup = async () => {
    if (!user) return;

    try {
      await cleanupTestNotifications(user.id);
      await fetchNotifications();
      toast({
        title: "Cleanup Complete",
        description: "Test notifications have been removed",
      });
    } catch (error) {
      console.error('Cleanup error:', error);
      toast({
        title: "Cleanup Error",
        description: "An error occurred during cleanup",
        variant: "destructive",
      });
    }
  };

  const handleCreateTestNotification = async (type: string) => {
    if (!user) return;

    try {
      await notificationService.createNotification({
        user_id: user.id,
        type: type as any,
        title: `Test ${type}`,
        message: `This is a test ${type} notification`,
        data: { test: true, timestamp: new Date().toISOString() }
      });

      await fetchNotifications();
      toast({
        title: "Test Notification Created",
        description: `Created a test ${type} notification`,
      });
    } catch (error) {
      console.error('Error creating test notification:', error);
      toast({
        title: "Error",
        description: "Failed to create test notification",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <ResponsiveLayout>
        <div className="container mx-auto py-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                Please sign in to test notifications
              </p>
            </CardContent>
          </Card>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notification Testing</h1>
            <p className="text-muted-foreground">
              Test and verify the notification system functionality
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Bell className="h-3 w-3" />
              {unreadCount} unread
            </Badge>
          </div>
        </div>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
            <CardDescription>
              Run automated tests to verify notification functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={handleRunTests} 
                disabled={testing}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                {testing ? 'Running Tests...' : 'Run All Tests'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCleanup}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Cleanup Test Data
              </Button>
              <Button 
                variant="outline" 
                onClick={markAllAsRead}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Mark All Read
              </Button>
            </div>

            {testResults && (
              <div className={`p-4 rounded-lg border ${
                testResults.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <h4 className="font-medium mb-2">
                  {testResults.success ? '✅ Tests Passed' : '❌ Tests Failed'}
                </h4>
                <pre className="text-sm">
                  {JSON.stringify(testResults, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manual Test Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Test Notifications</CardTitle>
            <CardDescription>
              Create individual test notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                'booking_request',
                'booking_accepted',
                'booking_declined',
                'message_request',
                'new_follower',
                'event_reminder',
                'event_update',
                'discussion_request',
                'discussion_approved',
                'discussion_rejected',
                'payment_received',
                'payment_failed',
                'system_announcement'
              ].map((type) => (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  onClick={() => handleCreateTestNotification(type)}
                  className="text-xs"
                >
                  {type}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Current Notifications</CardTitle>
            <CardDescription>
              View and manage current notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No notifications found
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${
                      notification.read ? 'bg-muted/30' : 'bg-primary/5 border-l-4 border-l-primary'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {notification.type}
                          </Badge>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ResponsiveLayout>
  );
};

export default TestNotifications;
