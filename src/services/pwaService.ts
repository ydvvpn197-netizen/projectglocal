import { supabase } from '@/integrations/supabase/client';
import { anonymousUserService } from './anonymousUserService';

export interface PWAConfig {
  name: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  orientation: 'portrait' | 'landscape' | 'any';
  startUrl: string;
  scope: string;
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
    purpose?: 'any' | 'maskable' | 'monochrome';
  }>;
  categories: string[];
  lang: string;
  dir: 'ltr' | 'rtl';
  preferRelatedApplications: boolean;
  relatedApplications: Array<{
    platform: string;
    url: string;
    id?: string;
  }>;
}

export interface PushNotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
  renotify?: boolean;
}

export interface OfflineCapability {
  canWorkOffline: boolean;
  cachedResources: string[];
  offlinePages: string[];
  syncStrategies: {
    networkFirst: string[];
    cacheFirst: string[];
    staleWhileRevalidate: string[];
  };
}

export interface PWAInstallPrompt {
  deferredPrompt: any;
  isInstallable: boolean;
  isInstalled: boolean;
}

export interface PWAUpdateInfo {
  hasUpdate: boolean;
  newVersion?: string;
  currentVersion: string;
  updateAvailable: boolean;
}

export class PWAService {
  private static instance: PWAService;
  private config: PWAConfig;
  private registration: ServiceWorkerRegistration | null = null;
  private pushSubscription: PushSubscription | null = null;
  private deferredPrompt: any = null;
  private installListeners: Array<(prompt: PWAInstallPrompt) => void> = [];

  constructor() {
    this.config = {
      name: 'TheGlocal',
      shortName: 'Glocal',
      description: 'Local community platform with privacy-first design',
      themeColor: '#6366f1',
      backgroundColor: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      startUrl: '/',
      scope: '/',
      icons: [
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: '/icons/icon-maskable-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ],
      categories: ['social', 'community', 'local'],
      lang: 'en',
      dir: 'ltr',
      preferRelatedApplications: false,
      relatedApplications: []
    };

    this.initializePWA();
  }

  static getInstance(): PWAService {
    if (!PWAService.instance) {
      PWAService.instance = new PWAService();
    }
    return PWAService.instance;
  }

  /**
   * Initialize PWA features
   */
  private async initializePWA(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        console.log('Service Worker registered successfully');
        this.setupUpdateListener();
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }

    this.setupInstallPrompt();
    this.setupPushNotifications();
    this.setupOfflineHandling();
  }

  /**
   * Setup PWA install prompt
   */
  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      
      const prompt: PWAInstallPrompt = {
        deferredPrompt: e,
        isInstallable: true,
        isInstalled: this.isInstalled()
      };

      this.installListeners.forEach(listener => listener(prompt));
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      console.log('PWA was installed');
      this.trackInstallation();
    });
  }

  /**
   * Setup push notifications
   */
  private async setupPushNotifications(): Promise<void> {
    if ('Notification' in window && 'PushManager' in window) {
      try {
        const permission = await this.requestNotificationPermission();
        if (permission === 'granted') {
          await this.subscribeToPush();
        }
      } catch (error) {
        console.error('Push notification setup failed:', error);
      }
    }
  }

  /**
   * Setup offline handling
   */
  private setupOfflineHandling(): void {
    window.addEventListener('online', () => {
      this.handleOnline();
    });

    window.addEventListener('offline', () => {
      this.handleOffline();
    });

    // Check initial connection status
    if (!navigator.onLine) {
      this.handleOffline();
    }
  }

  /**
   * Install PWA
   */
  async installPWA(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        this.trackInstallation();
        return true;
      } else {
        console.log('User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('PWA installation failed:', error);
      return false;
    }
  }

  /**
   * Check if PWA is installed
   */
  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone ||
           document.referrer.includes('android-app://');
  }

  /**
   * Check if PWA can be installed
   */
  canInstall(): boolean {
    return !!this.deferredPrompt;
  }

  /**
   * Get install prompt info
   */
  getInstallPrompt(): PWAInstallPrompt {
    return {
      deferredPrompt: this.deferredPrompt,
      isInstallable: this.canInstall(),
      isInstalled: this.isInstalled()
    };
  }

  /**
   * Add install prompt listener
   */
  onInstallPrompt(callback: (prompt: PWAInstallPrompt) => void): void {
    this.installListeners.push(callback);
  }

  /**
   * Remove install prompt listener
   */
  removeInstallPromptListener(callback: (prompt: PWAInstallPrompt) => void): void {
    const index = this.installListeners.indexOf(callback);
    if (index > -1) {
      this.installListeners.splice(index, 1);
    }
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      throw new Error('Notification permission denied');
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(): Promise<PushSubscription | null> {
    try {
      if (!this.registration) {
        throw new Error('Service Worker not registered');
      }

      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY || ''
        )
      });

      this.pushSubscription = subscription;

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);

      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush(): Promise<boolean> {
    try {
      if (!this.pushSubscription) {
        return false;
      }

      const success = await this.pushSubscription.unsubscribe();
      if (success) {
        this.pushSubscription = null;
        await this.removeSubscriptionFromServer();
      }

      return success;
    } catch (error) {
      console.error('Push unsubscription failed:', error);
      return false;
    }
  }

  /**
   * Send push notification
   */
  async sendPushNotification(
    data: PushNotificationData,
    targetUsers?: string[]
  ): Promise<boolean> {
    try {
      const { data: response, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          notification: data,
          target_users: targetUsers
        }
      });

      if (error) throw error;
      return response.success;
    } catch (error) {
      console.error('Failed to send push notification:', error);
      return false;
    }
  }

  /**
   * Show local notification
   */
  showLocalNotification(data: PushNotificationData): void {
    if (Notification.permission === 'granted') {
      const notification = new Notification(data.title, {
        body: data.body,
        icon: data.icon || '/icons/icon-192x192.png',
        badge: data.badge || '/icons/badge-72x72.png',
        image: data.image,
        tag: data.tag,
        data: data.data,
        requireInteraction: data.requireInteraction,
        silent: data.silent,
        timestamp: data.timestamp || Date.now(),
        renotify: data.renotify
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Handle notification click
        if (data.data?.url) {
          window.location.href = data.data.url;
        }
      };
    }
  }

  /**
   * Get offline capabilities
   */
  getOfflineCapabilities(): OfflineCapability {
    return {
      canWorkOffline: 'serviceWorker' in navigator && 'caches' in window,
      cachedResources: [
        '/',
        '/manifest.json',
        '/icons/icon-192x192.png',
        '/icons/icon-512x512.png',
        '/offline.html'
      ],
      offlinePages: [
        '/offline.html',
        '/offline-events.html',
        '/offline-news.html'
      ],
      syncStrategies: {
        networkFirst: ['/api/events', '/api/news', '/api/protests'],
        cacheFirst: ['/icons/', '/images/', '/static/'],
        staleWhileRevalidate: ['/api/user', '/api/profile']
      }
    };
  }

  /**
   * Cache resource for offline use
   */
  async cacheResource(url: string, cacheName: string = 'glocal-cache'): Promise<boolean> {
    try {
      const cache = await caches.open(cacheName);
      const response = await fetch(url);
      
      if (response.ok) {
        await cache.put(url, response);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to cache resource:', error);
      return false;
    }
  }

  /**
   * Get cached resource
   */
  async getCachedResource(url: string, cacheName: string = 'glocal-cache'): Promise<Response | null> {
    try {
      const cache = await caches.open(cacheName);
      return await cache.match(url);
    } catch (error) {
      console.error('Failed to get cached resource:', error);
      return null;
    }
  }

  /**
   * Clear cache
   */
  async clearCache(cacheName?: string): Promise<boolean> {
    try {
      if (cacheName) {
        await caches.delete(cacheName);
      } else {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      return true;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }

  /**
   * Check for PWA updates
   */
  async checkForUpdates(): Promise<PWAUpdateInfo> {
    try {
      if (!this.registration) {
        return {
          hasUpdate: false,
          currentVersion: '1.0.0',
          updateAvailable: false
        };
      }

      await this.registration.update();
      
      return {
        hasUpdate: false, // This would be set by the service worker
        currentVersion: '1.0.0',
        updateAvailable: false
      };
    } catch (error) {
      console.error('Failed to check for updates:', error);
      return {
        hasUpdate: false,
        currentVersion: '1.0.0',
        updateAvailable: false
      };
    }
  }

  /**
   * Apply PWA update
   */
  async applyUpdate(): Promise<boolean> {
    try {
      if (!this.registration) {
        return false;
      }

      await this.registration.update();
      return true;
    } catch (error) {
      console.error('Failed to apply update:', error);
      return false;
    }
  }

  /**
   * Get PWA configuration
   */
  getConfig(): PWAConfig {
    return this.config;
  }

  /**
   * Update PWA configuration
   */
  updateConfig(updates: Partial<PWAConfig>): void {
    this.config = { ...this.config, ...updates };
    this.updateManifest();
  }

  /**
   * Generate PWA manifest
   */
  generateManifest(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * Handle online event
   */
  private handleOnline(): void {
    console.log('App is online');
    
    // Sync offline data
    this.syncOfflineData();
    
    // Show online indicator
    this.showOnlineIndicator();
    
    // Retry failed requests
    this.retryFailedRequests();
  }

  /**
   * Handle offline event
   */
  private handleOffline(): void {
    console.log('App is offline');
    
    // Show offline indicator
    this.showOfflineIndicator();
    
    // Enable offline mode
    this.enableOfflineMode();
  }

  /**
   * Show online indicator
   */
  private showOnlineIndicator(): void {
    // Implementation for showing online indicator
    const indicator = document.createElement('div');
    indicator.className = 'pwa-online-indicator';
    indicator.textContent = 'Back online';
    indicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      z-index: 9999;
      font-size: 14px;
    `;
    
    document.body.appendChild(indicator);
    
    setTimeout(() => {
      indicator.remove();
    }, 3000);
  }

  /**
   * Show offline indicator
   */
  private showOfflineIndicator(): void {
    // Implementation for showing offline indicator
    const indicator = document.createElement('div');
    indicator.className = 'pwa-offline-indicator';
    indicator.textContent = 'You are offline';
    indicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      z-index: 9999;
      font-size: 14px;
    `;
    
    document.body.appendChild(indicator);
  }

  /**
   * Enable offline mode
   */
  private enableOfflineMode(): void {
    // Implementation for enabling offline mode
    document.body.classList.add('offline-mode');
  }

  /**
   * Sync offline data
   */
  private async syncOfflineData(): Promise<void> {
    try {
      // Implementation for syncing offline data
      console.log('Syncing offline data...');
      
      // Sync cached data with server
      await this.syncCachedData();
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  }

  /**
   * Sync cached data
   */
  private async syncCachedData(): Promise<void> {
    // Implementation for syncing cached data
    console.log('Syncing cached data...');
  }

  /**
   * Retry failed requests
   */
  private retryFailedRequests(): void {
    // Implementation for retrying failed requests
    console.log('Retrying failed requests...');
  }

  /**
   * Setup update listener
   */
  private setupUpdateListener(): void {
    if (!this.registration) return;

    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration?.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New update available
            this.showUpdateAvailable();
          }
        });
      }
    });
  }

  /**
   * Show update available notification
   */
  private showUpdateAvailable(): void {
    const notification = new Notification('Update Available', {
      body: 'A new version of the app is available. Click to update.',
      icon: '/icons/icon-192x192.png',
      tag: 'update-available'
    });

    notification.onclick = () => {
      window.location.reload();
    };
  }

  /**
   * Send subscription to server
   */
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = await anonymousUserService.getCurrentSessionId();

      await supabase
        .from('push_subscriptions')
        .insert({
          user_id: user?.id,
          session_id: sessionId,
          subscription: subscription.toJSON(),
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
    }
  }

  /**
   * Remove subscription from server
   */
  private async removeSubscriptionFromServer(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = await anonymousUserService.getCurrentSessionId();

      let query = supabase
        .from('push_subscriptions')
        .delete();

      if (user?.id) {
        query = query.eq('user_id', user.id);
      } else if (sessionId) {
        query = query.eq('session_id', sessionId);
      }

      await query;
    } catch (error) {
      console.error('Failed to remove subscription from server:', error);
    }
  }

  /**
   * Track PWA installation
   */
  private async trackInstallation(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = await anonymousUserService.getCurrentSessionId();

      await supabase
        .from('pwa_installations')
        .insert({
          user_id: user?.id,
          session_id: sessionId,
          installed_at: new Date().toISOString(),
          user_agent: navigator.userAgent,
          platform: navigator.platform
        });
    } catch (error) {
      console.error('Failed to track installation:', error);
    }
  }

  /**
   * Update manifest
   */
  private updateManifest(): void {
    const manifestElement = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    if (manifestElement) {
      manifestElement.href = `data:application/json,${encodeURIComponent(this.generateManifest())}`;
    }
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

export const pwaService = PWAService.getInstance();
