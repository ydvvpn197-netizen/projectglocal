// Push notification service for breaking news alerts
import { supabase } from '@/integrations/supabase/client';

export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export interface PushNotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private isSupported: boolean = false;

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  constructor() {
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Check if push notifications are supported
  isPushNotificationSupported(): boolean {
    return this.isSupported;
  }

  // Get current permission status
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported) {
      return { granted: false, denied: true, default: false };
    }

    const permission = Notification.permission;
    return {
      granted: permission === 'granted',
      denied: permission === 'denied',
      default: permission === 'default'
    };
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Push notifications are not supported in this browser');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Register service worker for push notifications
  async registerServiceWorker(): Promise<boolean> {
    if (!this.isSupported) {
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service worker registered successfully');
      return true;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return false;
    }
  }

  // Subscribe to push notifications
  async subscribeToPush(): Promise<boolean> {
    if (!this.isSupported || !this.registration) {
      return false;
    }

    try {
      const permission = await this.requestPermission();
      if (!permission) {
        return false;
      }

      // Get VAPID public key from environment
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.warn('VAPID public key not configured');
        return false;
      }

      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      });

      // Save subscription to Supabase
      await this.saveSubscription(this.subscription);
      
      console.log('Push subscription successful');
      return true;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return false;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.subscription) {
      return true;
    }

    try {
      const success = await this.subscription.unsubscribe();
      if (success) {
        await this.removeSubscription(this.subscription);
        this.subscription = null;
      }
      return success;
    } catch (error) {
      console.error('Push unsubscription failed:', error);
      return false;
    }
  }

  // Send local notification
  async sendLocalNotification(data: PushNotificationData): Promise<void> {
    if (!this.isSupported) {
      return;
    }

    const permission = this.getPermissionStatus();
    if (!permission.granted) {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      const notification = new Notification(data.title, {
        body: data.body,
        icon: data.icon || '/logo.png',
        badge: data.badge || '/logo.png',
        image: data.image,
        tag: data.tag,
        data: data.data,
        requireInteraction: data.requireInteraction || false,
        silent: data.silent || false
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Navigate to news page or specific article
        if (data.data?.url) {
          window.open(data.data.url, '_blank');
        } else {
          window.location.href = '/news';
        }
      };
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }

  // Send breaking news notification
  async sendBreakingNewsNotification(article: Record<string, unknown>): Promise<void> {
    const notificationData: PushNotificationData = {
      title: '🚨 Breaking News',
      body: article.title,
      icon: '/logo.png',
      image: article.image_url,
      tag: 'breaking-news',
      data: {
        url: article.url,
        articleId: article.article_id
      },
      requireInteraction: true,
      actions: [
        {
          action: 'read',
          title: 'Read Now',
          icon: '/icons/read.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/dismiss.png'
        }
      ]
    };

    await this.sendLocalNotification(notificationData);
  }

  // Check for breaking news and send notifications
  async checkForBreakingNews(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return;
      }

      // Get user's notification preferences
      const { data: preferences } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!preferences?.breaking_news_enabled) {
        return;
      }

      // Get recent breaking news articles
      const { data: articles } = await supabase
        .from('news_cache')
        .select('*')
        .eq('category', 'breaking')
        .gte('published_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
        .order('published_at', { ascending: false })
        .limit(1);

      if (articles && articles.length > 0) {
        const article = articles[0];
        
        // Check if user has already been notified about this article
        const { data: existingNotification } = await supabase
          .from('user_notifications')
          .select('id')
          .eq('user_id', user.id)
          .eq('article_id', article.article_id)
          .eq('type', 'breaking_news')
          .single();

        if (!existingNotification) {
          // Send notification
          await this.sendBreakingNewsNotification(article);

          // Record notification
          await supabase
            .from('user_notifications')
            .insert({
              user_id: user.id,
              article_id: article.article_id,
              type: 'breaking_news',
              title: 'Breaking News',
              message: article.title,
              data: { url: article.url }
            });
        }
      }
    } catch (error) {
      console.error('Error checking for breaking news:', error);
    }
  }

  // Initialize push notification service
  async initialize(): Promise<boolean> {
    if (!this.isSupported) {
      return false;
    }

    try {
      // Register service worker
      const swRegistered = await this.registerServiceWorker();
      if (!swRegistered) {
        return false;
      }

      // Check if already subscribed
      this.registration = await navigator.serviceWorker.ready;
      this.subscription = await this.registration.pushManager.getSubscription();

      if (!this.subscription) {
        // Subscribe to push notifications
        return await this.subscribeToPush();
      }

      return true;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return false;
    }
  }

  // Private helper methods
  private async saveSubscription(subscription: PushSubscription): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return;
      }

      await supabase
        .from('user_push_subscriptions')
        .upsert({
          user_id: user.id,
          subscription: JSON.stringify(subscription),
          endpoint: subscription.endpoint,
          p256dh: subscription.getKey('p256dh') ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))) : null,
          auth: subscription.getKey('auth') ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))) : null
        });
    } catch (error) {
      console.error('Error saving subscription:', error);
    }
  }

  private async removeSubscription(subscription: PushSubscription): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return;
      }

      await supabase
        .from('user_push_subscriptions')
        .delete()
        .eq('user_id', user.id)
        .eq('endpoint', subscription.endpoint);
    } catch (error) {
      console.error('Error removing subscription:', error);
    }
  }

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

// Export singleton instance
export const pushNotificationService = PushNotificationService.getInstance();
