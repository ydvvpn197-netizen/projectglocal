// Service Worker for TheGlocal PWA
const CACHE_NAME = 'glocal-v1';
const STATIC_CACHE = 'glocal-static-v1';
const DYNAMIC_CACHE = 'glocal-dynamic-v1';
const API_CACHE = 'glocal-api-v1';

// Cache strategies
const CACHE_STRATEGIES = {
  networkFirst: [
    '/api/events',
    '/api/news',
    '/api/protests',
    '/api/communities',
    '/api/polls'
  ],
  cacheFirst: [
    '/icons/',
    '/images/',
    '/static/',
    '/manifest.json'
  ],
  staleWhileRevalidate: [
    '/api/user',
    '/api/profile',
    '/api/settings'
  ]
};

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/offline-events.html',
  '/offline-news.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-512x512.png'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache static assets:', error);
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Delete old caches
              return cacheName !== CACHE_NAME &&
                     cacheName !== STATIC_CACHE &&
                     cacheName !== DYNAMIC_CACHE &&
                     cacheName !== API_CACHE;
            })
            .map((cacheName) => {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event
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
  
  // Determine cache strategy
  const strategy = getCacheStrategy(url.pathname);
  
  event.respondWith(
    handleRequest(request, strategy)
  );
});

// Handle request based on cache strategy
async function handleRequest(request, strategy) {
  const url = new URL(request.url);
  
  try {
    switch (strategy) {
      case 'networkFirst':
        return await networkFirst(request);
      case 'cacheFirst':
        return await cacheFirst(request);
      case 'staleWhileRevalidate':
        return await staleWhileRevalidate(request);
      default:
        return await networkFirst(request);
    }
  } catch (error) {
    console.error('Request handling failed:', error);
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return await getOfflinePage(request);
    }
    
    // Return cached response or network response
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Network first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
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

// Cache first strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    throw error;
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(API_CACHE);
      cache.then((c) => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch((error) => {
    console.error('Network request failed:', error);
    return cachedResponse;
  });
  
  return cachedResponse || fetchPromise;
}

// Get cache strategy for a path
function getCacheStrategy(pathname) {
  // Check for specific patterns
  if (CACHE_STRATEGIES.networkFirst.some(pattern => pathname.startsWith(pattern))) {
    return 'networkFirst';
  }
  
  if (CACHE_STRATEGIES.cacheFirst.some(pattern => pathname.startsWith(pattern))) {
    return 'cacheFirst';
  }
  
  if (CACHE_STRATEGIES.staleWhileRevalidate.some(pattern => pathname.startsWith(pattern))) {
    return 'staleWhileRevalidate';
  }
  
  // Default strategy based on request type
  if (pathname.startsWith('/api/')) {
    return 'networkFirst';
  }
  
  if (pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
    return 'cacheFirst';
  }
  
  return 'networkFirst';
}

// Get offline page
async function getOfflinePage(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Determine appropriate offline page
  let offlinePage = '/offline.html';
  
  if (pathname.startsWith('/events')) {
    offlinePage = '/offline-events.html';
  } else if (pathname.startsWith('/news')) {
    offlinePage = '/offline-news.html';
  }
  
  try {
    const cachedPage = await caches.match(offlinePage);
    if (cachedPage) {
      return cachedPage;
    }
    
    // Fallback to basic offline page
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Offline - TheGlocal</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 20px;
              background: #f5f5f5;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .container {
              text-align: center;
              max-width: 400px;
              background: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 { color: #333; margin-bottom: 20px; }
            p { color: #666; margin-bottom: 30px; }
            .retry-btn {
              background: #6366f1;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 16px;
            }
            .retry-btn:hover { background: #5b5bd6; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>You're Offline</h1>
            <p>It looks like you're not connected to the internet. Some features may not be available.</p>
            <button class="retry-btn" onclick="window.location.reload()">
              Try Again
            </button>
          </div>
        </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  } catch (error) {
    console.error('Failed to get offline page:', error);
    throw error;
  }
}

// Background sync
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Perform background sync
async function doBackgroundSync() {
  try {
    console.log('Performing background sync...');
    
    // Sync offline data
    await syncOfflineData();
    
    // Update cached content
    await updateCachedContent();
    
    console.log('Background sync completed');
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Sync offline data
async function syncOfflineData() {
  // Implementation for syncing offline data
  // This would sync any data that was created while offline
  console.log('Syncing offline data...');
}

// Update cached content
async function updateCachedContent() {
  // Implementation for updating cached content
  // This would refresh stale cached content
  console.log('Updating cached content...');
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'New notification from TheGlocal',
      icon: data.icon || '/icons/icon-192x192.png',
      badge: data.badge || '/icons/badge-72x72.png',
      image: data.image,
      tag: data.tag || 'default',
      data: data.data || {},
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
      timestamp: data.timestamp || Date.now(),
      renotify: data.renotify || false,
      actions: data.actions || []
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'TheGlocal', options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no existing window, open a new one
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Message handling
self.addEventListener('message', (event) => {
  console.log('Message received in service worker:', event.data);
  
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
      case 'CACHE_URL':
        cacheUrl(event.data.url);
        break;
      case 'CLEAR_CACHE':
        clearCache();
        break;
      default:
        console.log('Unknown message type:', event.data.type);
    }
  }
});

// Cache a specific URL
async function cacheUrl(url) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      await cache.put(url, response);
      console.log('URL cached:', url);
    }
  } catch (error) {
    console.error('Failed to cache URL:', error);
  }
}

// Clear all caches
async function clearCache() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('All caches cleared');
  } catch (error) {
    console.error('Failed to clear caches:', error);
  }
}

// Periodic background sync
self.addEventListener('periodicsync', (event) => {
  console.log('Periodic sync triggered:', event.tag);
  
  if (event.tag === 'content-sync') {
    event.waitUntil(doPeriodicSync());
  }
});

// Perform periodic sync
async function doPeriodicSync() {
  try {
    console.log('Performing periodic sync...');
    
    // Update news and events
    await updateNewsAndEvents();
    
    // Clean up old cache entries
    await cleanupOldCacheEntries();
    
    console.log('Periodic sync completed');
  } catch (error) {
    console.error('Periodic sync failed:', error);
  }
}

// Update news and events
async function updateNewsAndEvents() {
  // Implementation for updating news and events
  console.log('Updating news and events...');
}

// Clean up old cache entries
async function cleanupOldCacheEntries() {
  // Implementation for cleaning up old cache entries
  console.log('Cleaning up old cache entries...');
}