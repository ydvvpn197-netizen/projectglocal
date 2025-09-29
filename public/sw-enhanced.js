/**
 * Enhanced Service Worker for Advanced Caching
 * Implements multiple caching strategies for optimal performance
 */

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAMES = {
  static: `static-cache-${CACHE_VERSION}`,
  dynamic: `dynamic-cache-${CACHE_VERSION}`,
  api: `api-cache-${CACHE_VERSION}`,
  images: `images-cache-${CACHE_VERSION}`,
  fonts: `fonts-cache-${CACHE_VERSION}`,
};

const CACHE_CONFIG = {
  static: {
    maxEntries: 50,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  dynamic: {
    maxEntries: 100,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
  api: {
    maxEntries: 200,
    maxAge: 5 * 60 * 1000, // 5 minutes
  },
  images: {
    maxEntries: 100,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
  fonts: {
    maxEntries: 20,
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
  },
};

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only',
};

// URL patterns for different cache strategies
const URL_PATTERNS = {
  static: [
    /\.(?:js|css|html|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
    /^\/static\//,
    /^\/assets\//,
  ],
  api: [
    /^\/api\//,
    /^\/supabase\//,
  ],
  images: [
    /\.(?:png|jpg|jpeg|gif|svg|webp|avif)$/,
    /^\/images\//,
  ],
  fonts: [
    /\.(?:woff|woff2|ttf|eot)$/,
    /^\/fonts\//,
  ],
};

// Install event
self.addEventListener('install', (event) => {
  console.log('Enhanced Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Pre-cache critical static assets
      caches.open(CACHE_NAMES.static).then((cache) => {
        return cache.addAll([
          '/',
          '/index.html',
          '/manifest.json',
          '/offline.html',
        ]);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting(),
    ])
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Enhanced Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      cleanupOldCaches(),
      // Take control of all clients
      self.clients.claim(),
    ])
  );
});

// Fetch event with enhanced caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Determine cache strategy based on URL
  const strategy = determineCacheStrategy(request);
  
  event.respondWith(
    handleRequest(request, strategy)
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon || '/icon-192x192.png',
        badge: data.badge || '/badge-72x72.png',
        tag: data.tag,
        data: data.data,
        actions: data.actions,
        requireInteraction: data.requireInteraction,
      })
    );
  }
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action) {
    // Handle specific action
    handleNotificationAction(event.action, event.notification.data);
  } else {
    // Default click behavior
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  }
});

// Message handling for cache management
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'CACHE_CLEAR':
      handleCacheClear(data);
      break;
    case 'CACHE_INVALIDATE':
      handleCacheInvalidate(data);
      break;
    case 'CACHE_STATS':
      handleCacheStats(event.ports[0]);
      break;
    case 'CACHE_WARM':
      handleCacheWarm(data);
      break;
    default:
      console.log('Unknown message type:', type);
  }
});

// Helper functions

function determineCacheStrategy(request) {
  const url = new URL(request.url);
  
  // Check for static assets
  for (const pattern of URL_PATTERNS.static) {
    if (pattern.test(url.pathname)) {
      return CACHE_STRATEGIES.CACHE_FIRST;
    }
  }
  
  // Check for API calls
  for (const pattern of URL_PATTERNS.api) {
    if (pattern.test(url.pathname)) {
      return CACHE_STRATEGIES.NETWORK_FIRST;
    }
  }
  
  // Check for images
  for (const pattern of URL_PATTERNS.images) {
    if (pattern.test(url.pathname)) {
      return CACHE_STRATEGIES.CACHE_FIRST;
    }
  }
  
  // Check for fonts
  for (const pattern of URL_PATTERNS.fonts) {
    if (pattern.test(url.pathname)) {
      return CACHE_STRATEGIES.CACHE_FIRST;
    }
  }
  
  // Default to stale-while-revalidate for HTML pages
  return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
}

async function handleRequest(request, strategy) {
  const url = new URL(request.url);
  const cacheName = getCacheName(url);
  
  try {
    switch (strategy) {
      case CACHE_STRATEGIES.CACHE_FIRST:
        return await cacheFirst(request, cacheName);
      case CACHE_STRATEGIES.NETWORK_FIRST:
        return await networkFirst(request, cacheName);
      case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
        return await staleWhileRevalidate(request, cacheName);
      case CACHE_STRATEGIES.NETWORK_ONLY:
        return await fetch(request);
      case CACHE_STRATEGIES.CACHE_ONLY:
        return await cacheOnly(request, cacheName);
      default:
        return await staleWhileRevalidate(request, cacheName);
    }
  } catch (error) {
    console.error('Request handling failed:', error);
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return await caches.match('/offline.html');
    }
    
    // Return a generic error response
    return new Response('Service Unavailable', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  
  if (networkResponse.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(cacheName);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => {
    // Network failed, return cached response if available
    return cachedResponse;
  });
  
  return cachedResponse || fetchPromise;
}

async function cacheOnly(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (!cachedResponse) {
    throw new Error('No cached response available');
  }
  
  return cachedResponse;
}

function getCacheName(url) {
  for (const [type, patterns] of Object.entries(URL_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(url.pathname)) {
        return CACHE_NAMES[type];
      }
    }
  }
  
  return CACHE_NAMES.dynamic;
}

async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const validCacheNames = Object.values(CACHE_NAMES);
  
  const deletePromises = cacheNames
    .filter(cacheName => !validCacheNames.includes(cacheName))
    .map(cacheName => caches.delete(cacheName));
  
  await Promise.all(deletePromises);
}

async function cleanupCache(cacheName, maxEntries, maxAge) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length <= maxEntries) {
    return;
  }
  
  // Sort by date (oldest first)
  const sortedKeys = await Promise.all(
    keys.map(async (key) => {
      const response = await cache.match(key);
      const date = response.headers.get('date');
      return {
        key,
        date: date ? new Date(date).getTime() : 0,
      };
    })
  );
  
  sortedKeys.sort((a, b) => a.date - b.date);
  
  // Remove oldest entries
  const keysToDelete = sortedKeys.slice(0, keys.length - maxEntries);
  await Promise.all(keysToDelete.map(({ key }) => cache.delete(key)));
}

async function handleBackgroundSync() {
  // Implement background sync logic here
  console.log('Handling background sync...');
}

function handleNotificationAction(action, data) {
  console.log('Notification action:', action, data);
  
  // Handle specific notification actions
  switch (action) {
    case 'view':
      clients.openWindow(data.url);
      break;
    case 'dismiss':
      // Notification already closed
      break;
    default:
      console.log('Unknown notification action:', action);
  }
}

async function handleCacheClear(data) {
  const { cacheName } = data;
  
  if (cacheName) {
    await caches.delete(cacheName);
  } else {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
  }
}

async function handleCacheInvalidate(data) {
  const { pattern } = data;
  
  for (const cacheName of Object.values(CACHE_NAMES)) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    const keysToDelete = keys.filter(key => {
      const url = new URL(key.url);
      return pattern.test(url.pathname);
    });
    
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
  }
}

async function handleCacheStats(port) {
  const stats = {};
  
  for (const [name, cacheName] of Object.entries(CACHE_NAMES)) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    stats[name] = {
      size: keys.length,
      maxEntries: CACHE_CONFIG[name].maxEntries,
      maxAge: CACHE_CONFIG[name].maxAge,
    };
  }
  
  port.postMessage({ type: 'CACHE_STATS', data: stats });
}

async function handleCacheWarm(data) {
  const { urls, cacheName } = data;
  
  const cache = await caches.open(cacheName || CACHE_NAMES.dynamic);
  
  const promises = urls.map(async (url) => {
    try {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
      }
    } catch (error) {
      console.error('Failed to warm cache for:', url, error);
    }
  });
  
  await Promise.all(promises);
}

// Periodic cache cleanup
setInterval(async () => {
  for (const [name, config] of Object.entries(CACHE_CONFIG)) {
    await cleanupCache(CACHE_NAMES[name], config.maxEntries, config.maxAge);
  }
}, 60 * 60 * 1000); // Run every hour

console.log('Enhanced Service Worker loaded');
