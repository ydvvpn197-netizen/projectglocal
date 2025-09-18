import { supabase } from '@/integrations/supabase/client';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
  memoryUsage: number;
  networkRequests: number;
  cacheHitRate: number;
}

interface OptimizationConfig {
  enableLazyLoading: boolean;
  enableImageOptimization: boolean;
  enableDataPreloading: boolean;
  enableComponentMemoization: boolean;
  cacheStrategy: 'aggressive' | 'conservative' | 'disabled';
  prefetchStrategy: 'hover' | 'viewport' | 'none';
}

class PerformanceOptimizationService {
  private static instance: PerformanceOptimizationService;
  private metrics: PerformanceMetrics = {
    loadTime: 0,
    renderTime: 0,
    interactionTime: 0,
    memoryUsage: 0,
    networkRequests: 0,
    cacheHitRate: 0
  };
  private config: OptimizationConfig = {
    enableLazyLoading: true,
    enableImageOptimization: true,
    enableDataPreloading: true,
    enableComponentMemoization: true,
    cacheStrategy: 'aggressive',
    prefetchStrategy: 'hover'
  };
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private preloadQueue: Array<() => Promise<any>> = [];
  private intersectionObserver?: IntersectionObserver;

  static getInstance(): PerformanceOptimizationService {
    if (!PerformanceOptimizationService.instance) {
      PerformanceOptimizationService.instance = new PerformanceOptimizationService();
    }
    return PerformanceOptimizationService.instance;
  }

  /**
   * Initialize performance monitoring and optimizations
   */
  initialize(): void {
    this.setupPerformanceObserver();
    this.setupIntersectionObserver();
    this.setupResourcePreloading();
    this.startMetricsCollection();
  }

  /**
   * Setup performance observer for Web Vitals
   */
  private setupPerformanceObserver(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.loadTime = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.interactionTime = lastEntry.processingStart - lastEntry.startTime;
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Navigation timing
      const navigationObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.renderTime = entry.loadEventEnd - entry.loadEventStart;
        });
      });
      navigationObserver.observe({ entryTypes: ['navigation'] });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }
  }

  /**
   * Setup intersection observer for lazy loading
   */
  private setupIntersectionObserver(): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            this.handleLazyLoad(element);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );
  }

  /**
   * Handle lazy loading of elements
   */
  private handleLazyLoad(element: HTMLElement): void {
    if (element.dataset.src) {
      // Lazy load images
      if (element.tagName === 'IMG') {
        (element as HTMLImageElement).src = element.dataset.src;
        element.removeAttribute('data-src');
      }
    }

    if (element.dataset.component) {
      // Lazy load components
      import(element.dataset.component).then((module) => {
        // Component lazy loading logic
        console.log('Lazy loaded component:', element.dataset.component);
      });
    }

    this.intersectionObserver?.unobserve(element);
  }

  /**
   * Setup resource preloading
   */
  private setupResourcePreloading(): void {
    if (this.config.prefetchStrategy === 'hover') {
      this.setupHoverPreloading();
    } else if (this.config.prefetchStrategy === 'viewport') {
      this.setupViewportPreloading();
    }
  }

  /**
   * Setup hover-based preloading
   */
  private setupHoverPreloading(): void {
    document.addEventListener('mouseover', (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && link.href && !link.dataset.preloaded) {
        this.preloadRoute(link.href);
        link.dataset.preloaded = 'true';
      }
    });
  }

  /**
   * Setup viewport-based preloading
   */
  private setupViewportPreloading(): void {
    const preloadObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLAnchorElement;
            if (element.href && !element.dataset.preloaded) {
              this.preloadRoute(element.href);
              element.dataset.preloaded = 'true';
            }
          }
        });
      },
      { rootMargin: '100px' }
    );

    // Observe all links
    document.querySelectorAll('a[href]').forEach((link) => {
      preloadObserver.observe(link);
    });
  }

  /**
   * Preload route resources
   */
  private preloadRoute(href: string): void {
    if (this.config.enableDataPreloading) {
      // Preload route-specific data
      this.preloadRouteData(href);
    }
  }

  /**
   * Preload route-specific data
   */
  private async preloadRouteData(href: string): Promise<void> {
    const url = new URL(href, window.location.origin);
    const pathname = url.pathname;

    // Define preloading strategies for different routes
    const preloadStrategies: Record<string, () => Promise<any>> = {
      '/profile': () => this.preloadUserProfile(),
      '/community': () => this.preloadCommunityData(),
      '/events': () => this.preloadEventsData(),
      '/news': () => this.preloadNewsData(),
    };

    const strategy = Object.keys(preloadStrategies).find(route => 
      pathname.startsWith(route)
    );

    if (strategy && preloadStrategies[strategy]) {
      try {
        await preloadStrategies[strategy]();
      } catch (error) {
        console.warn('Preload failed for route:', pathname, error);
      }
    }
  }

  /**
   * Preload user profile data
   */
  private async preloadUserProfile(): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const cacheKey = `profile_${user.id}`;
    if (this.isValidCache(cacheKey)) {
      return this.getFromCache(cacheKey);
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      this.setCache(cacheKey, data, 5 * 60 * 1000); // 5 minutes TTL
    }

    return data;
  }

  /**
   * Preload community data
   */
  private async preloadCommunityData(): Promise<any> {
    const cacheKey = 'community_posts_recent';
    if (this.isValidCache(cacheKey)) {
      return this.getFromCache(cacheKey);
    }

    const { data, error } = await supabase
      .from('anonymous_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      this.setCache(cacheKey, data, 2 * 60 * 1000); // 2 minutes TTL
    }

    return data;
  }

  /**
   * Preload events data
   */
  private async preloadEventsData(): Promise<any> {
    const cacheKey = 'events_upcoming';
    if (this.isValidCache(cacheKey)) {
      return this.getFromCache(cacheKey);
    }

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .limit(10);

    if (!error && data) {
      this.setCache(cacheKey, data, 10 * 60 * 1000); // 10 minutes TTL
    }

    return data;
  }

  /**
   * Preload news data
   */
  private async preloadNewsData(): Promise<any> {
    const cacheKey = 'news_recent';
    if (this.isValidCache(cacheKey)) {
      return this.getFromCache(cacheKey);
    }

    const { data, error } = await supabase
      .from('news_cache')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(15);

    if (!error && data) {
      this.setCache(cacheKey, data, 5 * 60 * 1000); // 5 minutes TTL
    }

    return data;
  }

  /**
   * Cache management
   */
  private setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });

    // Cleanup old cache entries
    if (this.cache.size > 100) {
      this.cleanupCache();
    }
  }

  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    return cached?.data;
  }

  private isValidCache(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;

    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > value.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Start collecting performance metrics
   */
  private startMetricsCollection(): void {
    // Memory usage monitoring
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.metrics.memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      }, 10000); // Every 10 seconds
    }

    // Network requests monitoring
    const originalFetch = window.fetch;
    let requestCount = 0;
    let cacheHits = 0;

    window.fetch = async (...args) => {
      requestCount++;
      this.metrics.networkRequests = requestCount;

      // Check if request could be served from cache
      const url = args[0] as string;
      if (this.couldBeServedFromCache(url)) {
        cacheHits++;
        this.metrics.cacheHitRate = cacheHits / requestCount;
      }

      return originalFetch(...args);
    };
  }

  private couldBeServedFromCache(url: string): boolean {
    // Simple heuristic - check if URL matches cached data patterns
    return this.cache.has(url) || 
           Array.from(this.cache.keys()).some(key => url.includes(key));
  }

  /**
   * Image optimization utilities
   */
  optimizeImageUrl(url: string, width?: number, height?: number): string {
    if (!this.config.enableImageOptimization || !url) return url;

    // If it's a Supabase storage URL, add optimization parameters
    if (url.includes('supabase.co/storage')) {
      const params = new URLSearchParams();
      if (width) params.set('width', width.toString());
      if (height) params.set('height', height.toString());
      params.set('quality', '85');
      params.set('format', 'webp');
      
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}${params.toString()}`;
    }

    return url;
  }

  /**
   * Component memoization helper
   */
  shouldComponentUpdate<T>(prevProps: T, nextProps: T): boolean {
    if (!this.config.enableComponentMemoization) return true;

    // Shallow comparison for props
    if (prevProps === nextProps) return false;

    if (typeof prevProps !== 'object' || typeof nextProps !== 'object') {
      return prevProps !== nextProps;
    }

    const prevKeys = Object.keys(prevProps as object);
    const nextKeys = Object.keys(nextProps as object);

    if (prevKeys.length !== nextKeys.length) return true;

    for (const key of prevKeys) {
      if ((prevProps as any)[key] !== (nextProps as any)[key]) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get performance score (0-100)
   */
  getPerformanceScore(): number {
    const weights = {
      loadTime: 0.3,
      renderTime: 0.2,
      interactionTime: 0.2,
      memoryUsage: 0.15,
      cacheHitRate: 0.15
    };

    // Normalize metrics to 0-1 scale and calculate weighted score
    const normalizedMetrics = {
      loadTime: Math.max(0, 1 - this.metrics.loadTime / 3000), // 3s baseline
      renderTime: Math.max(0, 1 - this.metrics.renderTime / 1000), // 1s baseline
      interactionTime: Math.max(0, 1 - this.metrics.interactionTime / 100), // 100ms baseline
      memoryUsage: Math.max(0, 1 - this.metrics.memoryUsage), // Lower is better
      cacheHitRate: this.metrics.cacheHitRate // Higher is better
    };

    const score = Object.entries(normalizedMetrics).reduce((total, [key, value]) => {
      return total + value * weights[key as keyof typeof weights];
    }, 0);

    return Math.round(score * 100);
  }

  /**
   * Generate performance report
   */
  generateReport(): {
    score: number;
    metrics: PerformanceMetrics;
    recommendations: string[];
  } {
    const score = this.getPerformanceScore();
    const recommendations: string[] = [];

    if (this.metrics.loadTime > 2500) {
      recommendations.push('Consider enabling more aggressive caching');
    }
    if (this.metrics.interactionTime > 100) {
      recommendations.push('Optimize heavy JavaScript operations');
    }
    if (this.metrics.memoryUsage > 0.8) {
      recommendations.push('Reduce memory usage by cleaning up unused objects');
    }
    if (this.metrics.cacheHitRate < 0.7) {
      recommendations.push('Improve caching strategy for better performance');
    }

    return {
      score,
      metrics: this.getMetrics(),
      recommendations
    };
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export const performanceOptimizationService = PerformanceOptimizationService.getInstance();
