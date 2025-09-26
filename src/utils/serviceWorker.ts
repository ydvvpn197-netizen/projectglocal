/**
 * Service Worker Utilities
 * Utilities for service worker registration and management
 */

export interface ServiceWorkerOptions {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

export const registerServiceWorker = async (options: ServiceWorkerOptions = {}): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      if (registration.installing) {
        console.log('Service worker installing');
      } else if (registration.waiting) {
        console.log('Service worker waiting');
      } else if (registration.active) {
        console.log('Service worker active');
        options.onSuccess?.(registration);
      }
      
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      options.onError?.(error as Error);
      return null;
    }
  }
  
  return null;
};
