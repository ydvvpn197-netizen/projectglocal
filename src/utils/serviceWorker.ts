// Service Worker registration and management utilities

interface ServiceWorkerConfig {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
  skipWaiting?: boolean;
  immediate?: boolean;
}

export const registerServiceWorker = async (config: ServiceWorkerConfig = {}) => {
  const {
    onUpdate,
    onSuccess,
    onError,
    skipWaiting = true,
    immediate = false
  } = config;

  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none'
    });

    console.log('Service Worker registered successfully');

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content is available
              console.log('New content is available');
              onUpdate?.(registration);
            } else {
              // Content is cached for offline use
              console.log('Content is cached for offline use');
              onSuccess?.(registration);
            }
          }
        });
      }
    });

    // Handle controller change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (skipWaiting) {
        window.location.reload();
      }
    });

    // Handle messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('Message from Service Worker:', event.data);
      
      switch (event.data.type) {
        case 'CACHE_UPDATED':
          console.log('Cache updated:', event.data.cacheName);
          break;
        case 'OFFLINE_ACTION_QUEUED':
          console.log('Offline action queued:', event.data.action);
          break;
        case 'SYNC_COMPLETE':
          console.log('Background sync complete');
          break;
        default:
          console.log('Unknown message type:', event.data.type);
      }
    });

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    onError?.(error as Error);
    return null;
  }
};

export const unregisterServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    for (const registration of registrations) {
      await registration.unregister();
      console.log('Service Worker unregistered');
    }
  } catch (error) {
    console.error('Error unregistering Service Worker:', error);
  }
};

export const updateServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (registration) {
      await registration.update();
      console.log('Service Worker updated');
    }
  } catch (error) {
    console.error('Error updating Service Worker:', error);
  }
};

export const clearServiceWorkerCache = async () => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const cacheNames = await caches.keys();
    
    for (const cacheName of cacheNames) {
      await caches.delete(cacheName);
      console.log('Cache cleared:', cacheName);
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

export const getServiceWorkerStatus = async () => {
  if (!('serviceWorker' in navigator)) {
    return { supported: false };
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    const controller = navigator.serviceWorker.controller;
    
    return {
      supported: true,
      registered: !!registration,
      active: !!controller,
      state: registration?.active?.state || 'unknown',
      scope: registration?.scope || null
    };
  } catch (error) {
    console.error('Error getting Service Worker status:', error);
    return { supported: true, error: error.message };
  }
};

export const sendMessageToServiceWorker = (message: Record<string, unknown>) => {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    console.warn('Service Worker not available');
    return;
  }

  navigator.serviceWorker.controller.postMessage(message);
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn('Notification permission denied');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const showNotification = (title: string, options: NotificationOptions = {}) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    console.warn('Notifications not available');
    return;
  }

  const notification = new Notification(title, {
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    ...options
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  return notification;
};

export const subscribeToPushNotifications = async (vapidPublicKey: string) => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (!registration) {
      console.warn('Service Worker not registered');
      return null;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey
    });

    console.log('Push subscription created:', subscription);
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
};

export const unsubscribeFromPushNotifications = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (!registration) {
      return false;
    }

    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      console.log('Push subscription removed');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
};

export const getPushSubscription = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (!registration) {
      return null;
    }

    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error('Error getting push subscription:', error);
    return null;
  }
};

export default {
  registerServiceWorker,
  unregisterServiceWorker,
  updateServiceWorker,
  clearServiceWorkerCache,
  getServiceWorkerStatus,
  sendMessageToServiceWorker,
  requestNotificationPermission,
  showNotification,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  getPushSubscription
};
