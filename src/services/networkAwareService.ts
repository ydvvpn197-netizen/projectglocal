/**
 * Network-Aware Service for Low-Bandwidth Optimization
 * Automatically adjusts data loading based on network conditions
 */

export interface NetworkInfo {
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  downlink: number;
  rtt: number;
  saveData: boolean;
}

export interface LoadingStrategy {
  enableLazyLoading: boolean;
  enableCompression: boolean;
  enableProgressiveLoading: boolean;
  maxConcurrentRequests: number;
  requestTimeout: number;
  cacheStrategy: 'aggressive' | 'moderate' | 'minimal';
}

export class NetworkAwareService {
  private static instance: NetworkAwareService;
  private networkInfo: NetworkInfo | null = null;
  private strategy: LoadingStrategy;
  private connection: any = null;

  static getInstance(): NetworkAwareService {
    if (!NetworkAwareService.instance) {
      NetworkAwareService.instance = new NetworkAwareService();
    }
    return NetworkAwareService.instance;
  }

  constructor() {
    this.strategy = this.getDefaultStrategy();
    this.initializeNetworkMonitoring();
  }

  private initializeNetworkMonitoring(): void {
    if ('connection' in navigator) {
      this.connection = (navigator as any).connection;
      this.updateNetworkInfo();
      
      this.connection.addEventListener('change', () => {
        this.updateNetworkInfo();
        this.updateStrategy();
      });
    }
  }

  private updateNetworkInfo(): void {
    if (this.connection) {
      this.networkInfo = {
        effectiveType: this.connection.effectiveType || '4g',
        downlink: this.connection.downlink || 10,
        rtt: this.connection.rtt || 100,
        saveData: this.connection.saveData || false,
      };
    }
  }

  private getDefaultStrategy(): LoadingStrategy {
    return {
      enableLazyLoading: true,
      enableCompression: true,
      enableProgressiveLoading: true,
      maxConcurrentRequests: 6,
      requestTimeout: 10000,
      cacheStrategy: 'moderate',
    };
  }

  private updateStrategy(): void {
    if (!this.networkInfo) return;

    const { effectiveType, downlink, rtt, saveData } = this.networkInfo;

    // Adjust strategy based on network conditions
    if (effectiveType === 'slow-2g' || effectiveType === '2g' || saveData) {
      this.strategy = {
        enableLazyLoading: true,
        enableCompression: true,
        enableProgressiveLoading: true,
        maxConcurrentRequests: 2,
        requestTimeout: 30000,
        cacheStrategy: 'aggressive',
      };
    } else if (effectiveType === '3g') {
      this.strategy = {
        enableLazyLoading: true,
        enableCompression: true,
        enableProgressiveLoading: true,
        maxConcurrentRequests: 4,
        requestTimeout: 15000,
        cacheStrategy: 'moderate',
      };
    } else {
      this.strategy = {
        enableLazyLoading: false,
        enableCompression: false,
        enableProgressiveLoading: false,
        maxConcurrentRequests: 8,
        requestTimeout: 5000,
        cacheStrategy: 'minimal',
      };
    }
  }

  getNetworkInfo(): NetworkInfo | null {
    return this.networkInfo;
  }

  getStrategy(): LoadingStrategy {
    return this.strategy;
  }

  isSlowConnection(): boolean {
    if (!this.networkInfo) return false;
    return (
      this.networkInfo.effectiveType === 'slow-2g' ||
      this.networkInfo.effectiveType === '2g' ||
      this.networkInfo.saveData ||
      this.networkInfo.downlink < 1
    );
  }

  isFastConnection(): boolean {
    if (!this.networkInfo) return true;
    return (
      this.networkInfo.effectiveType === '4g' &&
      this.networkInfo.downlink > 5 &&
      this.networkInfo.rtt < 100
    );
  }

  // Optimized fetch with network awareness
  async fetchWithStrategy(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const strategy = this.getStrategy();
    
    // Add compression headers for slow connections
    if (strategy.enableCompression) {
      options.headers = {
        ...options.headers,
        'Accept-Encoding': 'gzip, deflate, br',
      };
    }

    // Set timeout based on network conditions
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, strategy.requestTimeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Progressive loading for images
  getImageLoadingStrategy(): {
    quality: 'low' | 'medium' | 'high';
    format: 'webp' | 'jpeg' | 'png';
    lazy: boolean;
  } {
    if (this.isSlowConnection()) {
      return {
        quality: 'low',
        format: 'webp',
        lazy: true,
      };
    } else if (this.isFastConnection()) {
      return {
        quality: 'high',
        format: 'webp',
        lazy: false,
      };
    } else {
      return {
        quality: 'medium',
        format: 'webp',
        lazy: true,
      };
    }
  }

  // Data compression for API responses
  async compressData(data: any): Promise<string> {
    if (!this.strategy.enableCompression) {
      return JSON.stringify(data);
    }

    // Simple compression by removing unnecessary whitespace
    return JSON.stringify(data, null, 0);
  }

  // Batch requests for slow connections
  async batchRequests<T>(
    requests: (() => Promise<T>)[],
    batchSize?: number
  ): Promise<T[]> {
    const strategy = this.getStrategy();
    const size = batchSize || strategy.maxConcurrentRequests;
    const results: T[] = [];

    for (let i = 0; i < requests.length; i += size) {
      const batch = requests.slice(i, i + size);
      const batchResults = await Promise.all(
        batch.map(request => request())
      );
      results.push(...batchResults);
    }

    return results;
  }

  // Cache strategy based on network conditions
  getCacheStrategy(): {
    ttl: number;
    maxSize: number;
    priority: 'high' | 'medium' | 'low';
  } {
    const strategy = this.getStrategy();
    
    if (strategy.cacheStrategy === 'aggressive') {
      return {
        ttl: 24 * 60 * 60 * 1000, // 24 hours
        maxSize: 100 * 1024 * 1024, // 100MB
        priority: 'high',
      };
    } else if (strategy.cacheStrategy === 'moderate') {
      return {
        ttl: 6 * 60 * 60 * 1000, // 6 hours
        maxSize: 50 * 1024 * 1024, // 50MB
        priority: 'medium',
      };
    } else {
      return {
        ttl: 1 * 60 * 60 * 1000, // 1 hour
        maxSize: 10 * 1024 * 1024, // 10MB
        priority: 'low',
      };
    }
  }

  // Preload critical resources
  async preloadCriticalResources(resources: string[]): Promise<void> {
    if (this.isSlowConnection()) {
      // Only preload essential resources on slow connections
      const criticalResources = resources.slice(0, 2);
      await this.batchRequests(
        criticalResources.map(url => () => this.preloadResource(url))
      );
    } else {
      // Preload all resources on fast connections
      await this.batchRequests(
        resources.map(url => () => this.preloadResource(url))
      );
    }
  }

  private async preloadResource(url: string): Promise<void> {
    try {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      
      if (url.endsWith('.css')) {
        link.as = 'style';
      } else if (url.endsWith('.js')) {
        link.as = 'script';
      } else if (url.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        link.as = 'image';
      }
      
      document.head.appendChild(link);
    } catch (error) {
      console.warn('Failed to preload resource:', url, error);
    }
  }

  // Network status monitoring
  onNetworkChange(callback: (networkInfo: NetworkInfo) => void): () => void {
    if (!this.connection) return () => {};

    const handleChange = () => {
      this.updateNetworkInfo();
      if (this.networkInfo) {
        callback(this.networkInfo);
      }
    };

    this.connection.addEventListener('change', handleChange);
    
    return () => {
      this.connection.removeEventListener('change', handleChange);
    };
  }
}

export const networkAwareService = NetworkAwareService.getInstance();
