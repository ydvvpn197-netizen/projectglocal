import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Bell, 
  Wifi, 
  WifiOff, 
  Smartphone, 
  Settings, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Info
} from 'lucide-react';
import { pwaService, PWAInstallPrompt, PWAUpdateInfo, OfflineCapability } from '@/services/pwaService';
import { useAuth } from '@/hooks/useAuth';

interface PWAIntegrationProps {
  className?: string;
}

export const PWAIntegration: React.FC<PWAIntegrationProps> = ({ className }) => {
  const { user } = useAuth();
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt>({
    deferredPrompt: null,
    isInstallable: false,
    isInstalled: false
  });
  const [updateInfo, setUpdateInfo] = useState<PWAUpdateInfo>({
    hasUpdate: false,
    currentVersion: '1.0.0',
    updateAvailable: false
  });
  const [offlineCapabilities, setOfflineCapabilities] = useState<OfflineCapability>({
    canWorkOffline: false,
    cachedResources: [],
    offlinePages: [],
    syncStrategies: {
      networkFirst: [],
      cacheFirst: [],
      staleWhileRevalidate: []
    }
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check initial PWA status
    checkPWAStatus();
    
    // Setup install prompt listener
    pwaService.onInstallPrompt(handleInstallPrompt);
    
    // Check notification permission
    checkNotificationPermission();
    
    // Setup online/offline listeners
    setupConnectionListeners();
    
    // Check for updates periodically
    const updateInterval = setInterval(checkForUpdates, 30000); // Check every 30 seconds
    
    return () => {
      pwaService.removeInstallPromptListener(handleInstallPrompt);
      clearInterval(updateInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkPWAStatus]);

  const checkPWAStatus = useCallback(async () => {
    setInstallPrompt(pwaService.getInstallPrompt());
    setOfflineCapabilities(pwaService.getOfflineCapabilities());
    await checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      const updates = await pwaService.checkForUpdates();
      setUpdateInfo(updates);
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  };

  const checkNotificationPermission = async () => {
    try {
      const permission = await pwaService.requestNotificationPermission();
      setNotificationsEnabled(permission === 'granted');
    } catch (error) {
      console.error('Failed to check notification permission:', error);
    }
  };

  const setupConnectionListeners = () => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  };

  const handleInstallPrompt = (prompt: PWAInstallPrompt) => {
    setInstallPrompt(prompt);
  };

  const handleInstall = async () => {
    setIsLoading(true);
    try {
      const success = await pwaService.installPWA();
      if (success) {
        setInstallPrompt({
          deferredPrompt: null,
          isInstallable: false,
          isInstalled: true
        });
      }
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    setIsLoading(true);
    try {
      if (enabled) {
        await pwaService.subscribeToPush();
      } else {
        await pwaService.unsubscribeFromPush();
      }
      setNotificationsEnabled(enabled);
    } catch (error) {
      console.error('Notification toggle failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyUpdate = async () => {
    setIsLoading(true);
    try {
      const success = await pwaService.applyUpdate();
      if (success) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCache = async () => {
    setIsLoading(true);
    try {
      await pwaService.clearCache();
      // Refresh the page to reload resources
      window.location.reload();
    } catch (error) {
      console.error('Clear cache failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      await pwaService.sendPushNotification({
        title: 'Test Notification',
        body: 'This is a test notification from TheGlocal PWA',
        icon: '/icons/icon-192x192.png',
        data: { url: '/' }
      });
    } catch (error) {
      console.error('Failed to send test notification:', error);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">PWA Features</h2>
          <p className="text-muted-foreground">
            Progressive Web App capabilities and offline functionality
          </p>
        </div>
        <Badge variant={installPrompt.isInstalled ? "default" : "secondary"}>
          {installPrompt.isInstalled ? "Installed" : "Web App"}
        </Badge>
      </div>

      <Tabs defaultValue="install" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="install">Install</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="offline">Offline</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="install" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Install App
              </CardTitle>
              <CardDescription>
                Install TheGlocal as a native app on your device
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {installPrompt.isInstalled ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    TheGlocal is installed as a Progressive Web App on your device.
                  </AlertDescription>
                </Alert>
              ) : installPrompt.isInstallable ? (
                <div className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      You can install TheGlocal as an app on your device for a better experience.
                    </AlertDescription>
                  </Alert>
                  <Button 
                    onClick={handleInstall} 
                    disabled={isLoading}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Install App
                  </Button>
                </div>
              ) : (
                <Alert>
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    App installation is not available. Make sure you're using a supported browser.
                  </AlertDescription>
                </Alert>
              )}

              {updateInfo.updateAvailable && (
                <div className="space-y-2">
                  <Alert>
                    <RefreshCw className="h-4 w-4" />
                    <AlertDescription>
                      A new version is available. Update to get the latest features.
                    </AlertDescription>
                  </Alert>
                  <Button 
                    onClick={handleApplyUpdate} 
                    disabled={isLoading}
                    variant="outline"
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Update App
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Push Notifications
              </CardTitle>
              <CardDescription>
                Get notified about important updates and events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Enable Notifications</p>
                  <p className="text-xs text-muted-foreground">
                    Receive push notifications for events, protests, and community updates
                  </p>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={handleNotificationToggle}
                  disabled={isLoading}
                />
              </div>

              {notificationsEnabled && (
                <div className="space-y-2">
                  <Button 
                    onClick={sendTestNotification}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Send Test Notification
                  </Button>
                </div>
              )}

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Notifications help you stay connected with your local community.
                  You can disable them anytime in your browser settings.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="h-5 w-5 text-green-500" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-500" />
                )}
                Offline Capabilities
              </CardTitle>
              <CardDescription>
                Work with your community even when offline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Connection Status</span>
                <Badge variant={isOnline ? "default" : "destructive"}>
                  {isOnline ? "Online" : "Offline"}
                </Badge>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Offline Features</h4>
                <div className="grid grid-cols-1 gap-2">
                  {offlineCapabilities.canWorkOffline ? (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Offline mode supported
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <XCircle className="h-4 w-4" />
                      Offline mode not supported
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Cached resources: {offlineCapabilities.cachedResources.length}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Offline pages: {offlineCapabilities.offlinePages.length}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Sync Strategies</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>Network First: {offlineCapabilities.syncStrategies.networkFirst.length} endpoints</div>
                  <div>Cache First: {offlineCapabilities.syncStrategies.cacheFirst.length} resources</div>
                  <div>Stale While Revalidate: {offlineCapabilities.syncStrategies.staleWhileRevalidate.length} endpoints</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                PWA Settings
              </CardTitle>
              <CardDescription>
                Manage your Progressive Web App preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Clear Cache</p>
                    <p className="text-xs text-muted-foreground">
                      Clear all cached data and reload the app
                    </p>
                  </div>
                  <Button 
                    onClick={handleClearCache}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                  >
                    Clear Cache
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Check for Updates</p>
                    <p className="text-xs text-muted-foreground">
                      Manually check for app updates
                    </p>
                  </div>
                  <Button 
                    onClick={checkForUpdates}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Check Updates
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">App Information</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>Version: {updateInfo.currentVersion}</div>
                  <div>Platform: {navigator.platform}</div>
                  <div>User Agent: {navigator.userAgent.substring(0, 50)}...</div>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  PWA features enhance your experience with offline capabilities,
                  push notifications, and native app-like functionality.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PWAIntegration;
