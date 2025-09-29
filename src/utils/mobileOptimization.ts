/**
 * Mobile Performance Optimization Utilities
 * Comprehensive mobile-specific performance enhancements
 */

export interface MobilePerformanceConfig {
  enableImageOptimization: boolean;
  enableLazyLoading: boolean;
  enableTouchOptimization: boolean;
  enableViewportOptimization: boolean;
  enableMemoryOptimization: boolean;
  enableNetworkOptimization: boolean;
}

export class MobileOptimizer {
  private config: MobilePerformanceConfig;
  private intersectionObserver?: IntersectionObserver;
  private resizeObserver?: ResizeObserver;
  private performanceObserver?: PerformanceObserver;

  constructor(config: Partial<MobilePerformanceConfig> = {}) {
    this.config = {
      enableImageOptimization: true,
      enableLazyLoading: true,
      enableTouchOptimization: true,
      enableViewportOptimization: true,
      enableMemoryOptimization: true,
      enableNetworkOptimization: true,
      ...config
    };
  }

  /**
   * Initialize mobile optimizations
   */
  initialize(): void {
    if (this.config.enableImageOptimization) {
      this.optimizeImages();
    }
    
    if (this.config.enableLazyLoading) {
      this.setupLazyLoading();
    }
    
    if (this.config.enableTouchOptimization) {
      this.optimizeTouchEvents();
    }
    
    if (this.config.enableViewportOptimization) {
      this.optimizeViewport();
    }
    
    if (this.config.enableMemoryOptimization) {
      this.optimizeMemoryUsage();
    }
    
    if (this.config.enableNetworkOptimization) {
      this.optimizeNetworkRequests();
    }

    this.setupPerformanceMonitoring();
  }

  /**
   * Optimize images for mobile devices
   */
  private optimizeImages(): void {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      // Add loading="lazy" for better performance
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
      
      // Add decoding="async" for non-blocking image decoding
      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }
      
      // Optimize for mobile viewport
      if (!img.hasAttribute('sizes')) {
        img.setAttribute('sizes', '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw');
      }
      
      // Add responsive image attributes
      if (!img.hasAttribute('srcset') && img.src) {
        this.generateResponsiveSrcSet(img);
      }
    });
  }

  /**
   * Generate responsive srcset for images
   */
  private generateResponsiveSrcSet(img: HTMLImageElement): void {
    const baseSrc = img.src;
    const srcset = [
      `${baseSrc}?w=320 320w`,
      `${baseSrc}?w=640 640w`,
      `${baseSrc}?w=960 960w`,
      `${baseSrc}?w=1280 1280w`
    ].join(', ');
    
    img.setAttribute('srcset', srcset);
  }

  /**
   * Setup lazy loading for images and components
   */
  private setupLazyLoading(): void {
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            
            // Lazy load images
            if (target.tagName === 'IMG') {
              const img = target as HTMLImageElement;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
              }
            }
            
            // Lazy load background images
            if (target.dataset.bgImage) {
              target.style.backgroundImage = `url(${target.dataset.bgImage})`;
              target.removeAttribute('data-bg-image');
            }
            
            // Lazy load components
            if (target.dataset.lazyComponent) {
              this.loadLazyComponent(target);
            }
            
            this.intersectionObserver?.unobserve(target);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );

    // Observe all lazy elements
    document.querySelectorAll('[data-lazy]').forEach(el => {
      this.intersectionObserver?.observe(el);
    });
  }

  /**
   * Load lazy components dynamically
   */
  private async loadLazyComponent(element: HTMLElement): Promise<void> {
    const componentName = element.dataset.lazyComponent;
    if (!componentName) return;

    try {
      // Dynamic import based on component name
      const module = await import(`@/components/${componentName}.tsx`);
      const Component = module.default || module[componentName];
      
      if (Component) {
        // Render component (this would need React integration)
        element.innerHTML = '';
        // ReactDOM.render(<Component />, element);
      }
    } catch (error) {
      console.error(`Failed to load lazy component: ${componentName}`, error);
    }
  }

  /**
   * Optimize touch events for better mobile performance
   */
  private optimizeTouchEvents(): void {
    // Add touch-action CSS for better scrolling
    const style = document.createElement('style');
    style.textContent = `
      * {
        touch-action: manipulation;
      }
      
      .scrollable {
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
      }
      
      button, a, [role="button"] {
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }
    `;
    document.head.appendChild(style);

    // Optimize touch event listeners
    let touchStartTime = 0;
    let touchStartY = 0;
    let touchStartX = 0;

    document.addEventListener('touchstart', (e) => {
      touchStartTime = performance.now();
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const touchEndTime = performance.now();
      const touchDuration = touchEndTime - touchStartTime;
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndX = e.changedTouches[0].clientX;
      
      const deltaY = Math.abs(touchEndY - touchStartY);
      const deltaX = Math.abs(touchEndX - touchStartX);
      
      // Prevent accidental clicks during scrolling
      if (touchDuration < 200 && deltaY < 10 && deltaX < 10) {
        // This is a tap, not a scroll
        const target = e.target as HTMLElement;
        if (target && target.click) {
          target.click();
        }
      }
    }, { passive: true });
  }

  /**
   * Optimize viewport for mobile devices
   */
  private optimizeViewport(): void {
    // Ensure proper viewport meta tag
    let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      document.head.appendChild(viewportMeta);
    }
    
    viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    
    // Add safe area insets for devices with notches
    const safeAreaStyle = document.createElement('style');
    safeAreaStyle.textContent = `
      :root {
        --safe-area-inset-top: env(safe-area-inset-top);
        --safe-area-inset-right: env(safe-area-inset-right);
        --safe-area-inset-bottom: env(safe-area-inset-bottom);
        --safe-area-inset-left: env(safe-area-inset-left);
      }
      
      .safe-area {
        padding-top: var(--safe-area-inset-top);
        padding-right: var(--safe-area-inset-right);
        padding-bottom: var(--safe-area-inset-bottom);
        padding-left: var(--safe-area-inset-left);
      }
    `;
    document.head.appendChild(safeAreaStyle);
  }

  /**
   * Optimize memory usage for mobile devices
   */
  private optimizeMemoryUsage(): void {
    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as Performance & { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
        const usagePercent = (usedMB / limitMB) * 100;
        
        if (usagePercent > 80) {
          console.warn(`High memory usage: ${usagePercent.toFixed(1)}%`);
          this.triggerGarbageCollection();
        }
      }, 30000); // Check every 30 seconds
    }

    // Clean up unused event listeners
    this.setupMemoryCleanup();
  }

  /**
   * Trigger garbage collection if available
   */
  private triggerGarbageCollection(): void {
    if (window.gc) {
      window.gc();
    }
  }

  /**
   * Setup memory cleanup routines
   */
  private setupMemoryCleanup(): void {
    // Clean up on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.cleanupInactiveResources();
      }
    });

    // Clean up on memory pressure
    if ('memory' in performance) {
      const memory = (performance as Performance & { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      if (memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.9) {
        this.cleanupInactiveResources();
      }
    }
  }

  /**
   * Clean up inactive resources
   */
  private cleanupInactiveResources(): void {
    // Remove unused images from cache
    const images = document.querySelectorAll('img[data-lazy]');
    images.forEach(img => {
      if (!this.isElementInViewport(img)) {
        img.removeAttribute('src');
      }
    });

    // Clean up unused DOM elements
    const unusedElements = document.querySelectorAll('[data-cleanup]');
    unusedElements.forEach(el => {
      if (!this.isElementInViewport(el)) {
        el.remove();
      }
    });
  }

  /**
   * Check if element is in viewport
   */
  private isElementInViewport(element: Element): boolean {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * Optimize network requests for mobile
   */
  private optimizeNetworkRequests(): void {
    // Implement request batching
    const requestQueue: Array<() => Promise<unknown>> = [];
    let isProcessing = false;

    const processQueue = async () => {
      if (isProcessing || requestQueue.length === 0) return;
      
      isProcessing = true;
      const batch = requestQueue.splice(0, 5); // Process 5 requests at a time
      
      try {
        await Promise.all(batch.map(request => request()));
      } catch (error) {
        console.error('Batch request failed:', error);
      } finally {
        isProcessing = false;
        if (requestQueue.length > 0) {
          setTimeout(processQueue, 100);
        }
      }
    };

    // Override fetch to use batching
    const originalFetch = window.fetch;
    window.fetch = async (input, init) => {
      return new Promise((resolve, reject) => {
        requestQueue.push(async () => {
          try {
            const result = await originalFetch(input, init);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
        
        processQueue();
      });
    };

    // Implement request caching
    const cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();
    
    const cachedFetch = async (url: string, options: RequestInit = {}) => {
      const cacheKey = `${url}-${JSON.stringify(options)}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return new Response(JSON.stringify(cached.data));
      }
      
      const response = await originalFetch(url, options);
      const data = await response.json();
      
      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl: 300000 // 5 minutes
      });
      
      return response;
    };
  }

  /**
   * Setup performance monitoring for mobile
   */
  private setupPerformanceMonitoring(): void {
    this.performanceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
          const measure = entry as PerformanceMeasure;
          if (measure.duration > 100) {
            console.warn(`Slow operation: ${measure.name} took ${measure.duration.toFixed(2)}ms`);
          }
        }
        
        if (entry.entryType === 'navigation') {
          const nav = entry as PerformanceNavigationTiming;
          this.analyzeNavigationTiming(nav);
        }
      }
    });

    this.performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
  }

  /**
   * Analyze navigation timing for mobile optimization
   */
  private analyzeNavigationTiming(nav: PerformanceNavigationTiming): void {
    const metrics = {
      dns: nav.domainLookupEnd - nav.domainLookupStart,
      tcp: nav.connectEnd - nav.connectStart,
      request: nav.responseStart - nav.requestStart,
      response: nav.responseEnd - nav.responseStart,
      dom: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
      load: nav.loadEventEnd - nav.loadEventStart
    };

    // Log slow metrics
    Object.entries(metrics).forEach(([key, value]) => {
      if (value > 1000) {
        console.warn(`Slow ${key}: ${value.toFixed(2)}ms`);
      }
    });
  }

  /**
   * Get mobile performance recommendations
   */
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    
    // Check for common mobile performance issues
    if (document.querySelectorAll('img:not([loading])').length > 0) {
      recommendations.push('Add loading="lazy" to images for better performance');
    }
    
    if (document.querySelectorAll('*[style*="background-image"]').length > 0) {
      recommendations.push('Consider using <img> tags instead of background images for better mobile performance');
    }
    
    if (document.querySelectorAll('script:not([async]):not([defer])').length > 0) {
      recommendations.push('Add async or defer attributes to script tags');
    }
    
    return recommendations;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.intersectionObserver?.disconnect();
    this.resizeObserver?.disconnect();
    this.performanceObserver?.disconnect();
  }
}

// Export singleton instance
export const mobileOptimizer = new MobileOptimizer();

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    mobileOptimizer.initialize();
  });
} else {
  mobileOptimizer.initialize();
}
