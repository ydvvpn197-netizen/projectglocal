// Offline service for caching news articles and handling offline interactions
import { supabase } from '@/integrations/supabase/client';
import type { NewsArticle, NewsEvent } from '@/types/news';

export interface OfflineInteraction {
  id: string;
  type: 'like' | 'comment' | 'share' | 'poll_vote';
  articleId: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

export interface OfflineCache {
  articles: NewsArticle[];
  lastSync: number;
  version: string;
}

export class OfflineService {
  private static instance: OfflineService;
  private dbName = 'TheGlocalNewsDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

  static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  // Initialize IndexedDB
  async initialize(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB');
        reject(false);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve(true);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create articles store
        if (!db.objectStoreNames.contains('articles')) {
          const articlesStore = db.createObjectStore('articles', { keyPath: 'article_id' });
          articlesStore.createIndex('published_at', 'published_at', { unique: false });
          articlesStore.createIndex('city', 'city', { unique: false });
          articlesStore.createIndex('country', 'country', { unique: false });
        }

        // Create interactions store
        if (!db.objectStoreNames.contains('interactions')) {
          const interactionsStore = db.createObjectStore('interactions', { keyPath: 'id', autoIncrement: true });
          interactionsStore.createIndex('articleId', 'articleId', { unique: false });
          interactionsStore.createIndex('type', 'type', { unique: false });
          interactionsStore.createIndex('synced', 'synced', { unique: false });
          interactionsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Create cache metadata store
        if (!db.objectStoreNames.contains('cache_metadata')) {
          db.createObjectStore('cache_metadata', { keyPath: 'key' });
        }
      };
    });
  }

  // Cache news articles offline
  async cacheArticles(articles: NewsArticle[]): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['articles', 'cache_metadata'], 'readwrite');
      const articlesStore = transaction.objectStore('articles');
      const metadataStore = transaction.objectStore('cache_metadata');

      let completed = 0;
      const total = articles.length;

      if (total === 0) {
        resolve();
        return;
      }

      articles.forEach((article) => {
        const request = articlesStore.put(article);
        request.onsuccess = () => {
          completed++;
          if (completed === total) {
            // Update cache metadata
            metadataStore.put({
              key: 'last_sync',
              value: Date.now(),
              articleCount: total
            });
            resolve();
          }
        };
        request.onerror = () => {
          reject(new Error('Failed to cache article'));
        };
      });
    });
  }

  // Get cached articles
  async getCachedArticles(city?: string, country?: string): Promise<NewsArticle[]> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['articles'], 'readonly');
      const store = transaction.objectStore('articles');
      const request = store.getAll();

      request.onsuccess = () => {
        let articles = request.result;

        // Filter by location if specified
        if (city && country) {
          articles = articles.filter(article => 
            article.city === city && article.country === country
          );
        }

        // Sort by published date
        articles.sort((a, b) => 
          new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
        );

        resolve(articles);
      };

      request.onerror = () => {
        reject(new Error('Failed to get cached articles'));
      };
    });
  }

  // Store offline interaction
  async storeOfflineInteraction(
    type: OfflineInteraction['type'],
    articleId: string,
    data: any
  ): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    const interaction: OfflineInteraction = {
      id: `${type}_${articleId}_${Date.now()}`,
      type,
      articleId,
      data,
      timestamp: Date.now(),
      synced: false
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['interactions'], 'readwrite');
      const store = transaction.objectStore('interactions');
      const request = store.add(interaction);

      request.onsuccess = () => {
        console.log('Offline interaction stored:', interaction);
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to store offline interaction'));
      };
    });
  }

  // Get pending interactions
  async getPendingInteractions(): Promise<OfflineInteraction[]> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['interactions'], 'readonly');
      const store = transaction.objectStore('interactions');
      const index = store.index('synced');
      const request = index.getAll(false); // Get unsynced interactions

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error('Failed to get pending interactions'));
      };
    });
  }

  // Sync pending interactions
  async syncPendingInteractions(): Promise<void> {
    const pendingInteractions = await this.getPendingInteractions();

    for (const interaction of pendingInteractions) {
      try {
        await this.syncInteraction(interaction);
        await this.markInteractionAsSynced(interaction.id);
      } catch (error) {
        console.error('Failed to sync interaction:', interaction, error);
      }
    }
  }

  // Sync individual interaction
  private async syncInteraction(interaction: OfflineInteraction): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    switch (interaction.type) {
      case 'like':
        await supabase
          .from('news_likes')
          .insert({
            article_id: interaction.articleId,
            user_id: user.id
          });
        break;

      case 'comment':
        await supabase
          .from('news_comments')
          .insert({
            article_id: interaction.articleId,
            user_id: user.id,
            content: interaction.data.content,
            parent_id: interaction.data.parentId
          });
        break;

      case 'share':
        await supabase
          .from('news_shares')
          .insert({
            article_id: interaction.articleId,
            user_id: user.id,
            platform: interaction.data.platform
          });
        break;

      case 'poll_vote':
        await supabase
          .from('news_poll_votes')
          .upsert({
            poll_id: interaction.data.pollId,
            user_id: user.id,
            option_index: interaction.data.optionIndex
          }, { onConflict: 'poll_id,user_id' });
        break;
    }

    // Track event
    await supabase
      .from('news_events')
      .insert({
        article_id: interaction.articleId,
        user_id: user.id,
        event_type: interaction.type,
        event_data: interaction.data
      });
  }

  // Mark interaction as synced
  private async markInteractionAsSynced(interactionId: string): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['interactions'], 'readwrite');
      const store = transaction.objectStore('interactions');
      const request = store.get(interactionId);

      request.onsuccess = () => {
        const interaction = request.result;
        if (interaction) {
          interaction.synced = true;
          const updateRequest = store.put(interaction);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(new Error('Failed to mark interaction as synced'));
        } else {
          resolve();
        }
      };

      request.onerror = () => {
        reject(new Error('Failed to get interaction'));
      };
    });
  }

  // Check if we're online
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Get cache size
  async getCacheSize(): Promise<{ articles: number; interactions: number }> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['articles', 'interactions'], 'readonly');
      const articlesStore = transaction.objectStore('articles');
      const interactionsStore = transaction.objectStore('interactions');

      const articlesRequest = articlesStore.count();
      const interactionsRequest = interactionsStore.count();

      let articlesCount = 0;
      let interactionsCount = 0;

      articlesRequest.onsuccess = () => {
        articlesCount = articlesRequest.result;
        if (interactionsRequest.readyState === 'done') {
          resolve({ articles: articlesCount, interactions: interactionsCount });
        }
      };

      interactionsRequest.onsuccess = () => {
        interactionsCount = interactionsRequest.result;
        if (articlesRequest.readyState === 'done') {
          resolve({ articles: articlesCount, interactions: interactionsCount });
        }
      };

      articlesRequest.onerror = () => reject(new Error('Failed to count articles'));
      interactionsRequest.onerror = () => reject(new Error('Failed to count interactions'));
    });
  }

  // Clear old cache
  async clearOldCache(): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    const cutoffTime = Date.now() - this.CACHE_DURATION;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['articles'], 'readwrite');
      const store = transaction.objectStore('articles');
      const index = store.index('published_at');
      const range = IDBKeyRange.upperBound(cutoffTime);
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => {
        reject(new Error('Failed to clear old cache'));
      };
    });
  }

  // Clear all cache
  async clearAllCache(): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['articles', 'interactions', 'cache_metadata'], 'readwrite');
      
      const articlesStore = transaction.objectStore('articles');
      const interactionsStore = transaction.objectStore('interactions');
      const metadataStore = transaction.objectStore('cache_metadata');

      const articlesRequest = articlesStore.clear();
      const interactionsRequest = interactionsStore.clear();
      const metadataRequest = metadataStore.clear();

      let completed = 0;
      const total = 3;

      const checkComplete = () => {
        completed++;
        if (completed === total) {
          resolve();
        }
      };

      articlesRequest.onsuccess = checkComplete;
      interactionsRequest.onsuccess = checkComplete;
      metadataRequest.onsuccess = checkComplete;

      articlesRequest.onerror = () => reject(new Error('Failed to clear articles'));
      interactionsRequest.onerror = () => reject(new Error('Failed to clear interactions'));
      metadataRequest.onerror = () => reject(new Error('Failed to clear metadata'));
    });
  }
}

// Export singleton instance
export const offlineService = OfflineService.getInstance();
