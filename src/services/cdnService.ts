/**
 * CDN Service for Static Asset Optimization
 * Provides CDN integration for images, fonts, and static resources
 */

export interface CDNConfig {
  provider: 'cloudflare' | 'aws-cloudfront' | 'vercel' | 'custom';
  baseUrl: string;
  apiKey?: string;
  zoneId?: string;
  enableImageOptimization: boolean;
  enableWebP: boolean;
  enableAVIF: boolean;
  quality: number;
  maxWidth: number;
  maxHeight: number;
}

export interface OptimizedAsset {
  originalUrl: string;
  optimizedUrl: string;
  format: 'webp' | 'avif' | 'jpeg' | 'png';
  width: number;
  height: number;
  size: number;
  quality: number;
}

export interface AssetTransform {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png' | 'auto';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  gravity?: 'auto' | 'center' | 'top' | 'bottom' | 'left' | 'right';
  blur?: number;
  sharpen?: number;
}

export class CDNService {
  private static instance: CDNService;
  private config: CDNConfig;
  private cache = new Map<string, OptimizedAsset>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  static getInstance(): CDNService {
    if (!CDNService.instance) {
      CDNService.instance = new CDNService();
    }
    return CDNService.instance;
  }

  constructor() {
    this.config = this.getDefaultConfig();
  }

  private getDefaultConfig(): CDNConfig {
    return {
      provider: 'cloudflare',
      baseUrl: 'https://cdn.theglocal.in',
      enableImageOptimization: true,
      enableWebP: true,
      enableAVIF: true,
      quality: 80,
      maxWidth: 1920,
      maxHeight: 1080,
    };
  }

  /**
   * Configure CDN settings
   */
  configure(config: Partial<CDNConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get optimized image URL
   */
  getOptimizedImageUrl(
    originalUrl: string,
    transform: AssetTransform = {}
  ): string {
    if (!this.config.enableImageOptimization) {
      return originalUrl;
    }

    const cacheKey = `${originalUrl}_${JSON.stringify(transform)}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.optimizedUrl;
    }

    const optimizedUrl = this.buildOptimizedUrl(originalUrl, transform);
    
    // Cache the result
    this.cache.set(cacheKey, {
      ...this.createOptimizedAsset(originalUrl, optimizedUrl, transform),
      timestamp: Date.now(),
    });

    return optimizedUrl;
  }

  /**
   * Get responsive image URLs for different screen sizes
   */
  getResponsiveImageUrls(
    originalUrl: string,
    baseTransform: AssetTransform = {}
  ): {
    mobile: string;
    tablet: string;
    desktop: string;
    retina: string;
  } {
    return {
      mobile: this.getOptimizedImageUrl(originalUrl, {
        ...baseTransform,
        width: 480,
        quality: 75,
      }),
      tablet: this.getOptimizedImageUrl(originalUrl, {
        ...baseTransform,
        width: 768,
        quality: 80,
      }),
      desktop: this.getOptimizedImageUrl(originalUrl, {
        ...baseTransform,
        width: 1200,
        quality: 85,
      }),
      retina: this.getOptimizedImageUrl(originalUrl, {
        ...baseTransform,
        width: 2400,
        quality: 90,
      }),
    };
  }

  /**
   * Get optimized font URL
   */
  getOptimizedFontUrl(fontUrl: string): string {
    if (!fontUrl.startsWith('http')) {
      return fontUrl;
    }

    // Add font optimization parameters
    const url = new URL(fontUrl);
    url.searchParams.set('display', 'swap');
    url.searchParams.set('subset', 'latin');
    
    return url.toString();
  }

  /**
   * Preload critical assets
   */
  async preloadAssets(assets: string[]): Promise<void> {
    const preloadPromises = assets.map(asset => this.preloadAsset(asset));
    await Promise.all(preloadPromises);
  }

  /**
   * Preload a single asset
   */
  private async preloadAsset(assetUrl: string): Promise<void> {
    try {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = assetUrl;
      
      if (assetUrl.match(/\.(css)$/)) {
        link.as = 'style';
      } else if (assetUrl.match(/\.(js)$/)) {
        link.as = 'script';
      } else if (assetUrl.match(/\.(woff2?|ttf|otf)$/)) {
        link.as = 'font';
        link.crossOrigin = 'anonymous';
      } else if (assetUrl.match(/\.(jpg|jpeg|png|gif|webp|avif)$/)) {
        link.as = 'image';
      }
      
      document.head.appendChild(link);
    } catch (error) {
      console.warn('Failed to preload asset:', assetUrl, error);
    }
  }

  /**
   * Build optimized URL based on CDN provider
   */
  private buildOptimizedUrl(originalUrl: string, transform: AssetTransform): string {
    if (!originalUrl.startsWith('http')) {
      return originalUrl;
    }

    switch (this.config.provider) {
      case 'cloudflare':
        return this.buildCloudflareUrl(originalUrl, transform);
      case 'aws-cloudfront':
        return this.buildCloudFrontUrl(originalUrl, transform);
      case 'vercel':
        return this.buildVercelUrl(originalUrl, transform);
      case 'custom':
        return this.buildCustomUrl(originalUrl, transform);
      default:
        return originalUrl;
    }
  }

  /**
   * Build Cloudflare Image Resizing URL
   */
  private buildCloudflareUrl(originalUrl: string, transform: AssetTransform): string {
    const params = new URLSearchParams();
    
    if (transform.width) params.set('width', transform.width.toString());
    if (transform.height) params.set('height', transform.height.toString());
    if (transform.quality) params.set('quality', transform.quality.toString());
    if (transform.format && transform.format !== 'auto') {
      params.set('format', transform.format);
    } else if (this.config.enableAVIF) {
      params.set('format', 'avif');
    } else if (this.config.enableWebP) {
      params.set('format', 'webp');
    }
    
    if (transform.fit) params.set('fit', transform.fit);
    if (transform.gravity) params.set('gravity', transform.gravity);
    if (transform.blur) params.set('blur', transform.blur.toString());
    if (transform.sharpen) params.set('sharpen', transform.sharpen.toString());

    const queryString = params.toString();
    return `${this.config.baseUrl}/cdn-cgi/image/${queryString ? `/${queryString}` : ''}/${encodeURIComponent(originalUrl)}`;
  }

  /**
   * Build AWS CloudFront URL
   */
  private buildCloudFrontUrl(originalUrl: string, transform: AssetTransform): string {
    // This would integrate with AWS CloudFront and Lambda@Edge
    // For now, return a mock implementation
    const params = new URLSearchParams();
    
    if (transform.width) params.set('w', transform.width.toString());
    if (transform.height) params.set('h', transform.height.toString());
    if (transform.quality) params.set('q', transform.quality.toString());
    if (transform.format && transform.format !== 'auto') {
      params.set('f', transform.format);
    }

    const queryString = params.toString();
    return `${this.config.baseUrl}/images/${encodeURIComponent(originalUrl)}${queryString ? `?${queryString}` : ''}`;
  }

  /**
   * Build Vercel Image Optimization URL
   */
  private buildVercelUrl(originalUrl: string, transform: AssetTransform): string {
    const params = new URLSearchParams();
    
    if (transform.width) params.set('w', transform.width.toString());
    if (transform.height) params.set('h', transform.height.toString());
    if (transform.quality) params.set('q', transform.quality.toString());
    if (transform.format && transform.format !== 'auto') {
      params.set('f', transform.format);
    }

    const queryString = params.toString();
    return `${this.config.baseUrl}/_next/image?url=${encodeURIComponent(originalUrl)}&${queryString}`;
  }

  /**
   * Build custom CDN URL
   */
  private buildCustomUrl(originalUrl: string, transform: AssetTransform): string {
    const params = new URLSearchParams();
    
    if (transform.width) params.set('width', transform.width.toString());
    if (transform.height) params.set('height', transform.height.toString());
    if (transform.quality) params.set('quality', transform.quality.toString());
    if (transform.format && transform.format !== 'auto') {
      params.set('format', transform.format);
    }

    const queryString = params.toString();
    return `${this.config.baseUrl}/optimize/${encodeURIComponent(originalUrl)}${queryString ? `?${queryString}` : ''}`;
  }

  /**
   * Create optimized asset object
   */
  private createOptimizedAsset(
    originalUrl: string,
    optimizedUrl: string,
    transform: AssetTransform
  ): OptimizedAsset {
    return {
      originalUrl,
      optimizedUrl,
      format: (transform.format as 'webp' | 'jpeg' | 'png' | 'avif') || 'webp',
      width: transform.width || this.config.maxWidth,
      height: transform.height || this.config.maxHeight,
      size: 0, // Would be calculated from actual response
      quality: transform.quality || this.config.quality,
    };
  }

  /**
   * Get CDN statistics
   */
  getCDNStats(): {
    cacheSize: number;
    config: CDNConfig;
    supportedFormats: string[];
  } {
    return {
      cacheSize: this.cache.size,
      config: { ...this.config },
      supportedFormats: this.getSupportedFormats(),
    };
  }

  /**
   * Get supported image formats
   */
  private getSupportedFormats(): string[] {
    const formats = ['jpeg', 'png', 'gif'];
    
    if (this.config.enableWebP) {
      formats.push('webp');
    }
    
    if (this.config.enableAVIF) {
      formats.push('avif');
    }
    
    return formats;
  }

  /**
   * Clear CDN cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Purge CDN cache for specific URL
   */
  async purgeCache(url: string): Promise<boolean> {
    try {
      // This would call the CDN provider's purge API
      // For now, just remove from local cache
      const keysToDelete = Array.from(this.cache.keys()).filter(key => 
        key.includes(url)
      );
      
      keysToDelete.forEach(key => this.cache.delete(key));
      
      return true;
    } catch (error) {
      console.error('Failed to purge CDN cache:', error);
      return false;
    }
  }

  /**
   * Check if CDN is available
   */
  async checkCDNAvailability(): Promise<boolean> {
    try {
      const testUrl = `${this.config.baseUrl}/health`;
      const response = await fetch(testUrl, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.warn('CDN availability check failed:', error);
      return false;
    }
  }

  /**
   * Get optimal format based on browser support
   */
  getOptimalFormat(): 'webp' | 'avif' | 'jpeg' {
    if (this.config.enableAVIF && this.supportsAVIF()) {
      return 'avif';
    } else if (this.config.enableWebP && this.supportsWebP()) {
      return 'webp';
    } else {
      return 'jpeg';
    }
  }

  /**
   * Check if browser supports AVIF
   */
  private supportsAVIF(): boolean {
    if (typeof window === 'undefined') return false;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  }

  /**
   * Check if browser supports WebP
   */
  private supportsWebP(): boolean {
    if (typeof window === 'undefined') return false;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
}

export const cdnService = CDNService.getInstance();
