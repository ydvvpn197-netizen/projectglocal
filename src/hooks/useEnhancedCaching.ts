import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';
import { redisLikeCacheService } from '@/services/redisLikeCacheService';
import { localStorageCache, sessionStorageCache } from '@/utils/caching';

export interface CacheStrategy {
  type: 'memory' | 'localStorage' | 'sessionStorage' | 'redis-like';
  ttl?: number;
  tags?: string[];
  priority?: 'low' | 'normal' | 'high';
  compress?: boolean;
  encrypt?: boolean;
}

export interface EnhancedQueryOptions<TData = unknown, TError = Error> extends Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> {
  cacheStrategy?: CacheStrategy;
  prefetch?: boolean;
  backgroundRefetch?: boolean;
  optimisticUpdates?: boolean;
}

export interface EnhancedMutationOptions<TData = unknown, TError = Error, TVariables = unknown> extends Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'> {
  cacheStrategy?: CacheStrategy;
  invalidateQueries?: string[];
  optimisticUpdates?: boolean;
}

/**
 * Enhanced caching hook with multiple storage strategies
 */
export function useEnhancedQuery<TData = unknown, TError = Error>(
  queryKey: (string | number | boolean | object)[],
  queryFn: () => Promise<TData>,
  options: EnhancedQueryOptions<TData, TError> = {}
) {
  const {
    cacheStrategy = { type: 'memory', ttl: 5 * 60 * 1000 },
    prefetch = false,
    backgroundRefetch = true,
    optimisticUpdates = false,
    ...queryOptions
  } = options;

  const queryClient = useQueryClient();

  // Generate cache key
  const cacheKey = useMemo(() => {
    return `query:${queryKey.join(':')}`;
  }, [queryKey]);

  // Enhanced query function with caching
  const enhancedQueryFn = useCallback(async (): Promise<TData> => {
    // Check cache first
    let cachedData: TData | null = null;

    switch (cacheStrategy.type) {
      case 'localStorage':
        cachedData = localStorageCache.get<TData>(cacheKey);
        break;
      case 'sessionStorage':
        cachedData = sessionStorageCache.get<TData>(cacheKey);
        break;
      case 'redis-like':
        cachedData = await redisLikeCacheService.get<TData>(cacheKey);
        break;
      default:
        // Memory cache is handled by React Query
        break;
    }

    if (cachedData) {
      return cachedData;
    }

    // Fetch fresh data
    const data = await queryFn();

    // Cache the result
    switch (cacheStrategy.type) {
      case 'localStorage':
        localStorageCache.set(cacheKey, data, cacheStrategy.ttl);
        break;
      case 'sessionStorage':
        sessionStorageCache.set(cacheKey, data);
        break;
      case 'redis-like':
        await redisLikeCacheService.set(cacheKey, data, {
          ttl: cacheStrategy.ttl,
          tags: cacheStrategy.tags,
          priority: cacheStrategy.priority,
          compress: cacheStrategy.compress,
          encrypt: cacheStrategy.encrypt,
        });
        break;
    }

    return data;
  }, [queryFn, cacheKey, cacheStrategy]);

  // Prefetch data if requested
  useEffect(() => {
    if (prefetch) {
      queryClient.prefetchQuery({
        queryKey,
        queryFn: enhancedQueryFn,
        ...queryOptions,
      });
    }
  }, [prefetch, queryClient, queryKey, enhancedQueryFn, queryOptions]);

  // Background refetch
  useEffect(() => {
    if (backgroundRefetch) {
      const interval = setInterval(() => {
        queryClient.invalidateQueries({ queryKey });
      }, cacheStrategy.ttl || 5 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [backgroundRefetch, queryClient, queryKey, cacheStrategy.ttl]);

  return useQuery({
    queryKey,
    queryFn: enhancedQueryFn,
    ...queryOptions,
  });
}

/**
 * Enhanced mutation hook with cache invalidation
 */
export function useEnhancedMutation<TData = unknown, TError = Error, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: EnhancedMutationOptions<TData, TError, TVariables> = {}
) {
  const {
    cacheStrategy = { type: 'memory' },
    invalidateQueries = [],
    optimisticUpdates = false,
    ...mutationOptions
  } = options;

  const queryClient = useQueryClient();

  // Enhanced mutation function
  const enhancedMutationFn = useCallback(async (variables: TVariables): Promise<TData> => {
    // Optimistic updates
    if (optimisticUpdates) {
      // Implement optimistic updates logic here
      // This would update the cache immediately with expected data
    }

    try {
      const result = await mutationFn(variables);

      // Invalidate related queries
      invalidateQueries.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      });

      // Clear specific caches if needed
      if (cacheStrategy.type === 'localStorage') {
        invalidateQueries.forEach(key => {
          localStorageCache.remove(`query:${key}`);
        });
      } else if (cacheStrategy.type === 'sessionStorage') {
        invalidateQueries.forEach(key => {
          sessionStorageCache.remove(`query:${key}`);
        });
      } else if (cacheStrategy.type === 'redis-like') {
        await redisLikeCacheService.delByTags(invalidateQueries);
      }

      return result;
    } catch (error) {
      // Revert optimistic updates on error
      if (optimisticUpdates) {
        // Revert optimistic updates logic here
      }
      throw error;
    }
  }, [mutationFn, invalidateQueries, queryClient, cacheStrategy, optimisticUpdates]);

  return useMutation({
    mutationFn: enhancedMutationFn,
    ...mutationOptions,
  });
}

/**
 * Cache management utilities
 */
export function useCacheManagement() {
  const queryClient = useQueryClient();

  const clearCache = useCallback(async (strategy?: CacheStrategy) => {
    if (!strategy) {
      // Clear all caches
      queryClient.clear();
      localStorageCache.clear();
      sessionStorageCache.clear();
      await redisLikeCacheService.flush();
      return;
    }

    switch (strategy.type) {
      case 'memory':
        queryClient.clear();
        break;
      case 'localStorage':
        localStorageCache.clear();
        break;
      case 'sessionStorage':
        sessionStorageCache.clear();
        break;
      case 'redis-like':
        await redisLikeCacheService.flush();
        break;
    }
  }, [queryClient]);

  const invalidateCache = useCallback(async (pattern: string, strategy?: CacheStrategy) => {
    if (!strategy) {
      // Invalidate all caches matching pattern
      queryClient.invalidateQueries();
      // Clear localStorage and sessionStorage entries matching pattern
      Object.keys(localStorage).forEach(key => {
        if (key.includes(pattern)) {
          localStorage.removeItem(key);
        }
      });
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes(pattern)) {
          sessionStorage.removeItem(key);
        }
      });
      await redisLikeCacheService.delPattern(pattern);
      return;
    }

    switch (strategy.type) {
      case 'memory':
        queryClient.invalidateQueries();
        break;
      case 'localStorage':
        Object.keys(localStorage).forEach(key => {
          if (key.includes(pattern)) {
            localStorage.removeItem(key);
          }
        });
        break;
      case 'sessionStorage':
        Object.keys(sessionStorage).forEach(key => {
          if (key.includes(pattern)) {
            sessionStorage.removeItem(key);
          }
        });
        break;
      case 'redis-like':
        await redisLikeCacheService.delPattern(pattern);
        break;
    }
  }, [queryClient]);

  const getCacheStats = useCallback(async () => {
    const memoryStats = {
      type: 'memory',
      size: queryClient.getQueryCache().getAll().length,
    };

    const localStorageStats = {
      type: 'localStorage',
      size: Object.keys(localStorage).length,
    };

    const sessionStorageStats = {
      type: 'sessionStorage',
      size: Object.keys(sessionStorage).length,
    };

    const redisLikeStats = redisLikeCacheService.getStats();

    return {
      memory: memoryStats,
      localStorage: localStorageStats,
      sessionStorage: sessionStorageStats,
      redisLike: redisLikeStats,
    };
  }, [queryClient]);

  return {
    clearCache,
    invalidateCache,
    getCacheStats,
  };
}

/**
 * Prefetch hook for critical data
 */
export function usePrefetch() {
  const queryClient = useQueryClient();

  const prefetchQuery = useCallback(async <TData = unknown>(
    queryKey: (string | number | boolean | object)[],
    queryFn: () => Promise<TData>,
    options: EnhancedQueryOptions<TData> = {}
  ) => {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn,
      ...options,
    });
  }, [queryClient]);

  const prefetchQueries = useCallback(async <TData = unknown>(
    queries: Array<{
      queryKey: (string | number | boolean | object)[];
      queryFn: () => Promise<TData>;
      options?: EnhancedQueryOptions<TData>;
    }>
  ) => {
    const promises = queries.map(({ queryKey, queryFn, options }) =>
      queryClient.prefetchQuery({
        queryKey,
        queryFn,
        ...options,
      })
    );

    await Promise.all(promises);
  }, [queryClient]);

  return {
    prefetchQuery,
    prefetchQueries,
  };
}

/**
 * Cache warming hook
 */
export function useCacheWarming() {
  const { prefetchQueries } = usePrefetch();

  const warmCache = useCallback(async <TData = unknown>(
    queries: Array<{
      queryKey: (string | number | boolean | object)[];
      queryFn: () => Promise<TData>;
      priority?: 'low' | 'normal' | 'high';
      cacheStrategy?: CacheStrategy;
    }>
  ) => {
    // Sort queries by priority
    const sortedQueries = queries.sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      return (priorityOrder[b.priority || 'normal'] || 2) - (priorityOrder[a.priority || 'normal'] || 2);
    });

    // Warm cache in batches to avoid overwhelming the system
    const batchSize = 3;
    for (let i = 0; i < sortedQueries.length; i += batchSize) {
      const batch = sortedQueries.slice(i, i + batchSize);
      await prefetchQueries(batch);
      
      // Small delay between batches
      if (i + batchSize < sortedQueries.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }, [prefetchQueries]);

  return {
    warmCache,
  };
}

export default {
  useEnhancedQuery,
  useEnhancedMutation,
  useCacheManagement,
  usePrefetch,
  useCacheWarming,
};
