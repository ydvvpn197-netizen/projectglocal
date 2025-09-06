// Service Worker for push notifications
const CACHE_NAME = 'theglocal-news-v1';
const urlsToCache = [
  '/',
  '/news',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/logo.png'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Push event
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'New notification', body: event.data.text() };
    }
  }

  const options = {
    body: data.body || 'You have a new notification',
    icon: data.icon || '/logo.png',
    badge: data.badge || '/logo.png',
    image: data.image,
    tag: data.tag || 'default',
    data: data.data || {},
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
    silent: data.silent || false
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'TheGlocal News', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);

  event.notification.close();

  const data = event.notification.data || {};
  const action = event.action;

  if (action === 'dismiss') {
    return;
  }

  // Handle different actions
  if (action === 'read' && data.url) {
    event.waitUntil(
      clients.openWindow(data.url)
    );
  } else if (data.url) {
    event.waitUntil(
      clients.openWindow(data.url)
    );
  } else {
    // Default action - open news page
    event.waitUntil(
      clients.openWindow('/news')
    );
  }
});

// Background sync for offline support
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event);

  if (event.tag === 'news-sync') {
    event.waitUntil(
      syncNewsData()
    );
  }
});

// Sync news data when back online
async function syncNewsData() {
  try {
    // This would sync any offline news data
    console.log('Syncing news data...');
    
    // Send any pending interactions
    const pendingInteractions = await getPendingInteractions();
    for (const interaction of pendingInteractions) {
      await sendInteraction(interaction);
    }
    
    console.log('News data sync completed');
  } catch (error) {
    console.error('Error syncing news data:', error);
  }
}

// Get pending interactions from IndexedDB
async function getPendingInteractions() {
  // This would retrieve pending interactions from IndexedDB
  return [];
}

// Send interaction to server
async function sendInteraction(interaction) {
  // This would send the interaction to the server
  console.log('Sending interaction:', interaction);
}

// Message event for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service worker received message:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service worker activated');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
