// Hook for managing offline functionality
import { useState, useEffect, useCallback } from 'react';
import { offlineService, type OfflineInteraction } from '@/services/offlineService';
import type { NewsArticle } from '@/types/news';

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInitialized, setIsInitialized] = useState(false);
  const [cacheSize, setCacheSize] = useState({ articles: 0, interactions: 0 });

  // Initialize offline service
  useEffect(() => {
    const initializeOffline = async () => {
      try {
        await offlineService.initialize();
        setIsInitialized(true);
        
        // Get initial cache size
        const size = await offlineService.getCacheSize();
        setCacheSize(size);
      } catch (error) {
        console.error('Failed to initialize offline service:', error);
      }
    };

    initializeOffline();
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Sync pending interactions when back online
      syncPendingInteractions();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync pending interactions
  const syncPendingInteractions = useCallback(async () => {
    if (!isOnline || !isInitialized) {
      return;
    }

    try {
      await offlineService.syncPendingInteractions();
      
      // Update cache size after sync
      const size = await offlineService.getCacheSize();
      setCacheSize(size);
    } catch (error) {
      console.error('Failed to sync pending interactions:', error);
    }
  }, [isOnline, isInitialized]);

  // Cache articles offline
  const cacheArticles = useCallback(async (articles: NewsArticle[]) => {
    if (!isInitialized) {
      return;
    }

    try {
      await offlineService.cacheArticles(articles);
      
      // Update cache size
      const size = await offlineService.getCacheSize();
      setCacheSize(size);
    } catch (error) {
      console.error('Failed to cache articles:', error);
    }
  }, [isInitialized]);

  // Get cached articles
  const getCachedArticles = useCallback(async (city?: string, country?: string): Promise<NewsArticle[]> => {
    if (!isInitialized) {
      return [];
    }

    try {
      return await offlineService.getCachedArticles(city, country);
    } catch (error) {
      console.error('Failed to get cached articles:', error);
      return [];
    }
  }, [isInitialized]);

  // Store offline interaction
  const storeOfflineInteraction = useCallback(async (
    type: OfflineInteraction['type'],
    articleId: string,
    data: any
  ) => {
    if (!isInitialized) {
      return;
    }

    try {
      await offlineService.storeOfflineInteraction(type, articleId, data);
      
      // Update cache size
      const size = await offlineService.getCacheSize();
      setCacheSize(size);
    } catch (error) {
      console.error('Failed to store offline interaction:', error);
    }
  }, [isInitialized]);

  // Get pending interactions
  const getPendingInteractions = useCallback(async (): Promise<OfflineInteraction[]> => {
    if (!isInitialized) {
      return [];
    }

    try {
      return await offlineService.getPendingInteractions();
    } catch (error) {
      console.error('Failed to get pending interactions:', error);
      return [];
    }
  }, [isInitialized]);

  // Clear old cache
  const clearOldCache = useCallback(async () => {
    if (!isInitialized) {
      return;
    }

    try {
      await offlineService.clearOldCache();
      
      // Update cache size
      const size = await offlineService.getCacheSize();
      setCacheSize(size);
    } catch (error) {
      console.error('Failed to clear old cache:', error);
    }
  }, [isInitialized]);

  // Clear all cache
  const clearAllCache = useCallback(async () => {
    if (!isInitialized) {
      return;
    }

    try {
      await offlineService.clearAllCache();
      setCacheSize({ articles: 0, interactions: 0 });
    } catch (error) {
      console.error('Failed to clear all cache:', error);
    }
  }, [isInitialized]);

  return {
    isOnline,
    isInitialized,
    cacheSize,
    cacheArticles,
    getCachedArticles,
    storeOfflineInteraction,
    getPendingInteractions,
    syncPendingInteractions,
    clearOldCache,
    clearAllCache
  };
};
