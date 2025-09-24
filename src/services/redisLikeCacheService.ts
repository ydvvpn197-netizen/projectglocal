/**
 * Redis-like Caching Service
 * Provides in-memory caching with Redis-like functionality for frequently accessed data
 */

export interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  enablePersistence: boolean;
  enableCompression: boolean;
  enableEncryption: boolean;
  compressionThreshold: number;
}

export interface CacheEntry<T = unknown> {
  key: string;
  value: T;
  ttl: number;
  createdAt: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
}

export interface CacheStats {
  size: number;
  hitRate: number;
  missRate: number;
  totalHits: number;
  totalMisses: number;
  memoryUsage: number;
  oldestEntry: number;
  newestEntry: number;
}

export interface CacheOptions {
  ttl?: number;
  tags?: string[];
  priority?: 'low' | 'normal' | 'high';
  compress?: boolean;
  encrypt?: boolean;
}

export class RedisLikeCacheService {
  private static instance: RedisLikeCacheService;
  private cache = new Map<string, CacheEntry>();
  private tags = new Map<string, Set<string>>();
  private config: CacheConfig;
  private stats = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
  };

  static getInstance(): RedisLikeCacheService {
    if (!RedisLikeCacheService.instance) {
      RedisLikeCacheService.instance = new RedisLikeCacheService();
    }
    return RedisLikeCacheService.instance;
  }

  constructor() {
    this.config = this.getDefaultConfig();
    this.initializePersistence();
    this.startCleanupInterval();
  }

  private getDefaultConfig(): CacheConfig {
    return {
      maxSize: 1000, // Maximum number of entries
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      enablePersistence: true,
      enableCompression: true,
      enableEncryption: false,
      compressionThreshold: 1024, // 1KB
    };
  }

  /**
   * Set a value in the cache
   */
  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<boolean> {
    try {
      const ttl = options.ttl || this.config.defaultTTL;
      const now = Date.now();
      
      // Check if we need to evict entries
      if (this.cache.size >= this.config.maxSize) {
        await this.evictLRU();
      }

      // Prepare value for storage
      let processedValue = value;
      let size = this.calculateSize(value);

      // Compress if enabled and above threshold
      if (options.compress !== false && this.config.enableCompression && size > this.config.compressionThreshold) {
        processedValue = await this.compress(value);
        size = this.calculateSize(processedValue);
      }

      // Encrypt if enabled
      if (options.encrypt && this.config.enableEncryption) {
        processedValue = await this.encrypt(processedValue);
      }

      // Create cache entry
      const entry: CacheEntry<T> = {
        key,
        value: processedValue,
        ttl,
        createdAt: now,
        accessCount: 0,
        lastAccessed: now,
        size,
      };

      // Store in cache
      this.cache.set(key, entry);

      // Add to tags if specified
      if (options.tags) {
        options.tags.forEach(tag => {
          if (!this.tags.has(tag)) {
            this.tags.set(tag, new Set());
          }
          this.tags.get(tag)!.add(key);
        });
      }

      // Persist if enabled
      if (this.config.enablePersistence) {
        await this.persistEntry(key, entry);
      }

      return true;
    } catch (error) {
      console.error('Failed to set cache entry:', error);
      return false;
    }
  }

  /**
   * Get a value from the cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      this.stats.totalRequests++;
      
      const entry = this.cache.get(key);
      
      if (!entry) {
        this.stats.misses++;
        return null;
      }

      // Check if expired
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        this.removeFromTags(key);
        this.stats.misses++;
        return null;
      }

      // Update access statistics
      entry.accessCount++;
      entry.lastAccessed = Date.now();
      this.stats.hits++;

      // Decrypt if needed
      let value = entry.value;
      if (this.config.enableEncryption && typeof value === 'string') {
        value = await this.decrypt(value);
      }

      // Decompress if needed
      if (this.config.enableCompression && typeof value === 'string') {
        value = await this.decompress(value);
      }

      return value as T;
    } catch (error) {
      console.error('Failed to get cache entry:', error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Delete a value from the cache
   */
  async del(key: string): Promise<boolean> {
    try {
      const deleted = this.cache.delete(key);
      this.removeFromTags(key);
      
      if (this.config.enablePersistence) {
        await this.removePersistedEntry(key);
      }
      
      return deleted;
    } catch (error) {
      console.error('Failed to delete cache entry:', error);
      return false;
    }
  }

  /**
   * Check if a key exists in the cache
   */
  async exists(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.removeFromTags(key);
      return false;
    }
    
    return true;
  }

  /**
   * Get multiple values at once
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    const promises = keys.map(key => this.get<T>(key));
    return Promise.all(promises);
  }

  /**
   * Set multiple values at once
   */
  async mset<T>(entries: Array<{ key: string; value: T; options?: CacheOptions }>): Promise<boolean> {
    try {
      const promises = entries.map(({ key, value, options }) => 
        this.set(key, value, options)
      );
      const results = await Promise.all(promises);
      return results.every(result => result);
    } catch (error) {
      console.error('Failed to set multiple cache entries:', error);
      return false;
    }
  }

  /**
   * Get all keys matching a pattern
   */
  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return Array.from(this.cache.keys()).filter(key => regex.test(key));
  }

  /**
   * Delete all keys matching a pattern
   */
  async delPattern(pattern: string): Promise<number> {
    const keys = await this.keys(pattern);
    const promises = keys.map(key => this.del(key));
    const results = await Promise.all(promises);
    return results.filter(result => result).length;
  }

  /**
   * Delete all entries with specific tags
   */
  async delByTags(tags: string[]): Promise<number> {
    const keysToDelete = new Set<string>();
    
    tags.forEach(tag => {
      const tagKeys = this.tags.get(tag);
      if (tagKeys) {
        tagKeys.forEach(key => keysToDelete.add(key));
      }
    });

    const promises = Array.from(keysToDelete).map(key => this.del(key));
    const results = await Promise.all(promises);
    return results.filter(result => result).length;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const now = Date.now();
    
    return {
      size: this.cache.size,
      hitRate: this.stats.totalRequests > 0 ? this.stats.hits / this.stats.totalRequests : 0,
      missRate: this.stats.totalRequests > 0 ? this.stats.misses / this.stats.totalRequests : 0,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      memoryUsage: entries.reduce((sum, entry) => sum + entry.size, 0),
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.createdAt)) : 0,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => e.createdAt)) : 0,
    };
  }

  /**
   * Clear all cache entries
   */
  async flush(): Promise<boolean> {
    try {
      this.cache.clear();
      this.tags.clear();
      this.stats = { hits: 0, misses: 0, totalRequests: 0 };
      
      if (this.config.enablePersistence) {
        await this.clearPersistedData();
      }
      
      return true;
    } catch (error) {
      console.error('Failed to flush cache:', error);
      return false;
    }
  }

  /**
   * Get TTL for a key
   */
  async ttl(key: string): Promise<number> {
    const entry = this.cache.get(key);
    if (!entry) return -1;
    
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.removeFromTags(key);
      return -1;
    }
    
    const remaining = entry.ttl - (Date.now() - entry.createdAt);
    return Math.max(0, remaining);
  }

  /**
   * Set TTL for a key
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    entry.ttl = ttl;
    entry.createdAt = Date.now();
    return true;
  }

  // Private helper methods

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.createdAt > entry.ttl;
  }

  private calculateSize(value: unknown): number {
    return JSON.stringify(value).length * 2; // Rough estimate in bytes
  }

  private async compress(value: unknown): Promise<string> {
    // Simple compression using JSON stringify (in real app, use actual compression)
    return JSON.stringify(value);
  }

  private async decompress(value: string): Promise<unknown> {
    // Simple decompression (in real app, use actual decompression)
    return JSON.parse(value);
  }

  private async encrypt(value: unknown): Promise<string> {
    // Simple base64 encoding (in real app, use proper encryption)
    return btoa(JSON.stringify(value));
  }

  private async decrypt(value: string): Promise<unknown> {
    // Simple base64 decoding (in real app, use proper decryption)
    return JSON.parse(atob(value));
  }

  private async evictLRU(): Promise<void> {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    // Remove the least recently used entry
    if (entries.length > 0) {
      const [key] = entries[0];
      this.cache.delete(key);
      this.removeFromTags(key);
    }
  }

  private removeFromTags(key: string): void {
    this.tags.forEach((keys, tag) => {
      keys.delete(key);
      if (keys.size === 0) {
        this.tags.delete(tag);
      }
    });
  }

  private initializePersistence(): void {
    if (this.config.enablePersistence && typeof window !== 'undefined') {
      this.loadPersistedData();
    }
  }

  private async loadPersistedData(): Promise<void> {
    try {
      const persisted = localStorage.getItem('redis_like_cache');
      if (persisted) {
        const data = JSON.parse(persisted);
        // Restore cache entries (simplified implementation)
        console.log('Loaded persisted cache data');
      }
    } catch (error) {
      console.error('Failed to load persisted cache data:', error);
    }
  }

  private async persistEntry(key: string, entry: CacheEntry): Promise<void> {
    try {
      const persisted = localStorage.getItem('redis_like_cache') || '{}';
      const data = JSON.parse(persisted);
      data[key] = entry;
      localStorage.setItem('redis_like_cache', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to persist cache entry:', error);
    }
  }

  private async removePersistedEntry(key: string): Promise<void> {
    try {
      const persisted = localStorage.getItem('redis_like_cache');
      if (persisted) {
        const data = JSON.parse(persisted);
        delete data[key];
        localStorage.setItem('redis_like_cache', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Failed to remove persisted cache entry:', error);
    }
  }

  private async clearPersistedData(): Promise<void> {
    try {
      localStorage.removeItem('redis_like_cache');
    } catch (error) {
      console.error('Failed to clear persisted cache data:', error);
    }
  }

  private startCleanupInterval(): void {
    // Clean up expired entries every minute
    setInterval(() => {
      const now = Date.now();
      const expiredKeys: string[] = [];
      
      this.cache.forEach((entry, key) => {
        if (this.isExpired(entry)) {
          expiredKeys.push(key);
        }
      });
      
      expiredKeys.forEach(key => {
        this.cache.delete(key);
        this.removeFromTags(key);
      });
    }, 60000);
  }

  /**
   * Update cache configuration
   */
  updateConfig(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): CacheConfig {
    return { ...this.config };
  }
}

export const redisLikeCacheService = RedisLikeCacheService.getInstance();
