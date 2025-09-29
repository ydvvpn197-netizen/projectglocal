/**
 * Database Query Optimizer
 * Provides optimized database queries and caching strategies
 */

import { supabase } from '@/integrations/supabase/client';

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  select?: string;
  filters?: Record<string, unknown>;
  cache?: boolean;
  cacheTTL?: number; // seconds
}

export interface CacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number;
}

class DatabaseOptimizer {
  private cache = new Map<string, CacheEntry>();
  private queryCache = new Map<string, Promise<unknown>>();

  /**
   * Optimized query with caching and pagination
   */
  async optimizedQuery<T>(
    table: string,
    options: QueryOptions = {}
  ): Promise<{ data: T[] | null; error: unknown; count?: number }> {
    const {
      limit = 20,
      offset = 0,
      orderBy = 'created_at',
      orderDirection = 'desc',
      select = '*',
      filters = {},
      cache = true,
      cacheTTL = 300 // 5 minutes
    } = options;

    const cacheKey = this.generateCacheKey(table, options);

    // Check cache first
    if (cache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < cached.ttl * 1000) {
        return { data: cached.data, error: null };
      }
      this.cache.delete(cacheKey);
    }

    // Check if query is already in progress
    if (this.queryCache.has(cacheKey)) {
      return this.queryCache.get(cacheKey)!;
    }

    // Execute query
    const queryPromise = this.executeOptimizedQuery<T>(
      table,
      { limit, offset, orderBy, orderDirection, select, filters }
    );

    this.queryCache.set(cacheKey, queryPromise);

    try {
      const result = await queryPromise;

      // Cache successful results
      if (cache && !result.error) {
        this.cache.set(cacheKey, {
          data: result.data,
          timestamp: Date.now(),
          ttl: cacheTTL
        });
      }

      return result;
    } finally {
      this.queryCache.delete(cacheKey);
    }
  }

  /**
   * Execute optimized query with proper indexing hints
   */
  private async executeOptimizedQuery<T>(
    table: string,
    options: {
      limit: number;
      offset: number;
      orderBy: string;
      orderDirection: 'asc' | 'desc';
      select: string;
      filters: Record<string, unknown>;
    }
  ): Promise<{ data: T[] | null; error: unknown; count?: number }> {
    let query = supabase.from(table).select(options.select, { count: 'exact' });

    // Apply filters with optimized conditions
    for (const [key, value] of Object.entries(options.filters)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else if (typeof value === 'string' && value.includes('%')) {
          query = query.ilike(key, value);
        } else {
          query = query.eq(key, value);
        }
      }
    }

    // Apply ordering and pagination
    query = query
      .order(options.orderBy, { ascending: options.orderDirection === 'asc' })
      .range(options.offset, options.offset + options.limit - 1);

    const { data, error, count } = await query;

    return { data, error, count };
  }

  /**
   * Optimized batch operations
   */
  async batchInsert<T>(
    table: string,
    records: T[],
    batchSize: number = 100
  ): Promise<{ data: unknown[] | null; error: unknown }> {
    const results: unknown[] = [];
    const errors: unknown[] = [];

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from(table)
        .insert(batch)
        .select();

      if (error) {
        errors.push(error);
      } else {
        results.push(...(data || []));
      }
    }

    return {
      data: results.length > 0 ? results : null,
      error: errors.length > 0 ? errors : null
    };
  }

  /**
   * Optimized upsert operation
   */
  async optimizedUpsert<T>(
    table: string,
    record: T,
    conflictColumns: string[]
  ): Promise<{ data: unknown | null; error: unknown }> {
    const { data, error } = await supabase
      .from(table)
      .upsert(record, { 
        onConflict: conflictColumns.join(',') 
      })
      .select()
      .single();

    return { data, error };
  }

  /**
   * Generate cache key for query
   */
  private generateCacheKey(table: string, options: QueryOptions): string {
    const sortedOptions = Object.keys(options)
      .sort()
      .reduce((result, key) => {
        result[key] = options[key as keyof QueryOptions];
        return result;
      }, {} as Record<string, unknown>);

    return `${table}:${JSON.stringify(sortedOptions)}`;
  }

  /**
   * Clear cache for specific table or all cache
   */
  clearCache(table?: string): void {
    if (table) {
      const keysToDelete = Array.from(this.cache.keys()).filter(key =>
        key.startsWith(`${table}:`)
      );
      keysToDelete.forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    hitRate: number;
    entries: Array<{ key: string; age: number; ttl: number }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: Date.now() - entry.timestamp,
      ttl: entry.ttl
    }));

    return {
      size: this.cache.size,
      hitRate: 0, // Would need to track hits/misses for accurate rate
      entries
    };
  }

  /**
   * Preload frequently accessed data
   */
  async preloadCommonData(): Promise<void> {
    const commonQueries = [
      { table: 'profiles', options: { limit: 50, cache: true } },
      { table: 'communities', options: { limit: 20, cache: true } },
      { table: 'news_cache', options: { limit: 30, cache: true, cacheTTL: 180 } }
    ];

    await Promise.all(
      commonQueries.map(({ table, options }) =>
        this.optimizedQuery(table, options)
      )
    );
  }
}

// Singleton instance
export const databaseOptimizer = new DatabaseOptimizer();

// Optimized query hooks for common operations
export const useOptimizedQuery = <T>(
  table: string,
  options: QueryOptions = {}
) => {
  const [data, setData] = React.useState<T[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<unknown>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await databaseOptimizer.optimizedQuery<T>(table, options);
      setData(result.data);
      setError(result.error);
      setLoading(false);
    };

    fetchData();
  }, [table, options]);

  return { data, loading, error, refetch: () => fetchData() };
};

import React from 'react';
