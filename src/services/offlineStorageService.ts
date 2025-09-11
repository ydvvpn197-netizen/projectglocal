/**
 * Enhanced Offline Storage Service for Mobile-First Experience
 * Provides IndexedDB-based offline storage with sync capabilities
 */

export interface OfflineNewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  url: string;
  publishedAt: string;
  source: string;
  category: string;
  cachedAt: number;
  isRead: boolean;
}

export interface OfflineEventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  organizer: string;
  cachedAt: number;
  isAttending: boolean;
}

export interface OfflineUserAction {
  id: string;
  type: 'like' | 'comment' | 'share' | 'bookmark' | 'attend';
  targetId: string;
  targetType: 'news' | 'event' | 'post';
  data: any;
  timestamp: number;
  synced: boolean;
}

export class OfflineStorageService {
  private static instance: OfflineStorageService;
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'TheGlocalOffline';
  private readonly DB_VERSION = 2;

  static getInstance(): OfflineStorageService {
    if (!OfflineStorageService.instance) {
      OfflineStorageService.instance = new OfflineStorageService();
    }
    return OfflineStorageService.instance;
  }

  async initialize(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // News store
        if (!db.objectStoreNames.contains('news')) {
          const newsStore = db.createObjectStore('news', { keyPath: 'id' });
          newsStore.createIndex('cachedAt', 'cachedAt', { unique: false });
          newsStore.createIndex('category', 'category', { unique: false });
          newsStore.createIndex('isRead', 'isRead', { unique: false });
        }

        // Events store
        if (!db.objectStoreNames.contains('events')) {
          const eventsStore = db.createObjectStore('events', { keyPath: 'id' });
          eventsStore.createIndex('date', 'date', { unique: false });
          eventsStore.createIndex('cachedAt', 'cachedAt', { unique: false });
          eventsStore.createIndex('isAttending', 'isAttending', { unique: false });
        }

        // User actions store for sync
        if (!db.objectStoreNames.contains('userActions')) {
          const actionsStore = db.createObjectStore('userActions', { keyPath: 'id' });
          actionsStore.createIndex('synced', 'synced', { unique: false });
          actionsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  // News operations
  async saveNewsItem(newsItem: Omit<OfflineNewsItem, 'cachedAt' | 'isRead'>): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    const item: OfflineNewsItem = {
      ...newsItem,
      cachedAt: Date.now(),
      isRead: false,
    };

    const transaction = this.db.transaction(['news'], 'readwrite');
    const store = transaction.objectStore('news');
    await store.put(item);
  }

  async getNewsItems(limit: number = 50): Promise<OfflineNewsItem[]> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['news'], 'readonly');
    const store = transaction.objectStore('news');
    const index = store.index('cachedAt');
    
    return new Promise((resolve, reject) => {
      const request = index.openCursor(null, 'prev');
      const results: OfflineNewsItem[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && results.length < limit) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async markNewsAsRead(newsId: string): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['news'], 'readwrite');
    const store = transaction.objectStore('news');
    const item = await store.get(newsId);
    
    if (item) {
      item.isRead = true;
      await store.put(item);
    }
  }

  // Events operations
  async saveEventItem(eventItem: Omit<OfflineEventItem, 'cachedAt' | 'isAttending'>): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    const item: OfflineEventItem = {
      ...eventItem,
      cachedAt: Date.now(),
      isAttending: false,
    };

    const transaction = this.db.transaction(['events'], 'readwrite');
    const store = transaction.objectStore('events');
    await store.put(item);
  }

  async getEventItems(limit: number = 50): Promise<OfflineEventItem[]> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['events'], 'readonly');
    const store = transaction.objectStore('events');
    const index = store.index('cachedAt');
    
    return new Promise((resolve, reject) => {
      const request = index.openCursor(null, 'prev');
      const results: OfflineEventItem[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && results.length < limit) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // User actions for sync
  async saveUserAction(action: Omit<OfflineUserAction, 'id' | 'timestamp' | 'synced'>): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    const item: OfflineUserAction = {
      ...action,
      id: `${action.type}_${action.targetId}_${Date.now()}`,
      timestamp: Date.now(),
      synced: false,
    };

    const transaction = this.db.transaction(['userActions'], 'readwrite');
    const store = transaction.objectStore('userActions');
    await store.put(item);
  }

  async getUnsyncedActions(): Promise<OfflineUserAction[]> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['userActions'], 'readonly');
    const store = transaction.objectStore('userActions');
    const index = store.index('synced');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(false);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async markActionAsSynced(actionId: string): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['userActions'], 'readwrite');
    const store = transaction.objectStore('userActions');
    const item = await store.get(actionId);
    
    if (item) {
      item.synced = true;
      await store.put(item);
    }
  }

  // Settings operations
  async saveSetting(key: string, value: any): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['settings'], 'readwrite');
    const store = transaction.objectStore('settings');
    await store.put({ key, value });
  }

  async getSetting(key: string): Promise<any> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['settings'], 'readonly');
    const store = transaction.objectStore('settings');
    const result = await store.get(key);
    return result?.value;
  }

  // Cleanup operations
  async clearOldData(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    const cutoffTime = Date.now() - maxAge;

    // Clear old news
    const newsTransaction = this.db.transaction(['news'], 'readwrite');
    const newsStore = newsTransaction.objectStore('news');
    const newsIndex = newsStore.index('cachedAt');
    const newsRequest = newsIndex.openCursor(IDBKeyRange.upperBound(cutoffTime));

    newsRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };

    // Clear old events
    const eventsTransaction = this.db.transaction(['events'], 'readwrite');
    const eventsStore = eventsTransaction.objectStore('events');
    const eventsIndex = eventsStore.index('cachedAt');
    const eventsRequest = eventsIndex.openCursor(IDBKeyRange.upperBound(cutoffTime));

    eventsRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
  }

  // Storage quota management
  async getStorageUsage(): Promise<{ used: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        quota: estimate.quota || 0,
      };
    }
    return { used: 0, quota: 0 };
  }

  // Network status monitoring
  isOnline(): boolean {
    return navigator.onLine;
  }

  onNetworkChange(callback: (isOnline: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }
}

export const offlineStorage = OfflineStorageService.getInstance();
