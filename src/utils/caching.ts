/**
 * Caching utilities for improved performance
 */

// Cache configuration
const CACHE_CONFIG = {
  // API cache settings
  api: {
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 100,
  },
  // Image cache settings
  images: {
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    maxSize: 50,
  },
  // User data cache settings
  user: {
    ttl: 10 * 60 * 1000, // 10 minutes
    maxSize: 20,
  },
  // Static data cache settings
  static: {
    ttl: 60 * 60 * 1000, // 1 hour
    maxSize: 30,
  },
} as const;

// Cache item interface
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Generic cache class
class Cache<T> {
  private cache = new Map<string, CacheItem<T>>();
  private maxSize: number;
  private ttl: number;

  constructor(maxSize: number, ttl: number) {
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  set(key: string, data: T): void {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: this.ttl,
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Clean up expired items
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Cache instances
export const apiCache = new Cache<any>(CACHE_CONFIG.api.maxSize, CACHE_CONFIG.api.ttl);
export const imageCache = new Cache<string>(CACHE_CONFIG.images.maxSize, CACHE_CONFIG.images.ttl);
export const userCache = new Cache<any>(CACHE_CONFIG.user.maxSize, CACHE_CONFIG.user.ttl);
export const staticCache = new Cache<any>(CACHE_CONFIG.static.maxSize, CACHE_CONFIG.static.ttl);

// Cache key generators
export const generateCacheKey = (...parts: (string | number)[]): string => {
  return parts.join(':');
};

// API response caching
export const cacheApiResponse = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> => {
  // Check cache first
  const cached = apiCache.get(key);
  if (cached) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetcher();
  
  // Cache the response
  if (ttl) {
    apiCache.set(key, data);
  } else {
    apiCache.set(key, data);
  }

  return data;
};

// Image caching with lazy loading
export const cacheImage = (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Check if image is already cached
    const cached = imageCache.get(src);
    if (cached) {
      resolve(cached);
      return;
    }

    const img = new Image();
    img.onload = () => {
      imageCache.set(src, src);
      resolve(src);
    };
    img.onerror = reject;
    img.src = src;
  });
};

// User data caching
export const cacheUserData = <T>(key: string, data: T): void => {
  userCache.set(key, data);
};

export const getCachedUserData = <T>(key: string): T | null => {
  return userCache.get(key);
};

// Static data caching
export const cacheStaticData = <T>(key: string, data: T): void => {
  staticCache.set(key, data);
};

export const getCachedStaticData = <T>(key: string): T | null => {
  return staticCache.get(key);
};

// Cache invalidation
export const invalidateCache = (pattern?: string): void => {
  if (pattern) {
    // Invalidate specific cache entries matching pattern
    [apiCache, imageCache, userCache, staticCache].forEach(cache => {
      // This is a simplified implementation
      // In a real app, you'd want more sophisticated pattern matching
      cache.clear();
    });
  } else {
    // Clear all caches
    apiCache.clear();
    imageCache.clear();
    userCache.clear();
    staticCache.clear();
  }
};

// Cache statistics
export const getCacheStats = () => {
  return {
    api: apiCache.size(),
    images: imageCache.size(),
    user: userCache.size(),
    static: staticCache.size(),
    total: apiCache.size() + imageCache.size() + userCache.size() + staticCache.size(),
  };
};

// Periodic cache cleanup
export const startCacheCleanup = (): void => {
  setInterval(() => {
    apiCache.cleanup();
    imageCache.cleanup();
    userCache.cleanup();
    staticCache.cleanup();
  }, 5 * 60 * 1000); // Clean up every 5 minutes
};

// React Query cache integration
export const createQueryCacheConfig = () => {
  return {
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        retry: 3,
        retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: 1,
      },
    },
  };
};

// Local storage caching for persistent data
export const localStorageCache = {
  set: <T>(key: string, data: T, ttl?: number): void => {
    const item = {
      data,
      timestamp: Date.now(),
      ttl: ttl || 24 * 60 * 60 * 1000, // Default 24 hours
    };
    localStorage.setItem(key, JSON.stringify(item));
  },

  get: <T>(key: string): T | null => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    try {
      const item = JSON.parse(itemStr);
      if (Date.now() - item.timestamp > item.ttl) {
        localStorage.removeItem(key);
        return null;
      }
      return item.data;
    } catch {
      localStorage.removeItem(key);
      return null;
    }
  },

  remove: (key: string): void => {
    localStorage.removeItem(key);
  },

  clear: (): void => {
    localStorage.clear();
  },
};

// Session storage caching for temporary data
export const sessionStorageCache = {
  set: <T>(key: string, data: T): void => {
    sessionStorage.setItem(key, JSON.stringify(data));
  },

  get: <T>(key: string): T | null => {
    const itemStr = sessionStorage.getItem(key);
    if (!itemStr) return null;

    try {
      return JSON.parse(itemStr);
    } catch {
      sessionStorage.removeItem(key);
      return null;
    }
  },

  remove: (key: string): void => {
    sessionStorage.removeItem(key);
  },

  clear: (): void => {
    sessionStorage.clear();
  },
};

// Initialize caching system
export const initializeCaching = (): void => {
  startCacheCleanup();
  console.log('Caching system initialized');
};
