// Image optimization service for news article images
export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  blur?: number;
  grayscale?: boolean;
}

export interface OptimizedImage {
  url: string;
  width: number;
  height: number;
  format: string;
  size: number;
  placeholder?: string;
}

export class ImageOptimizationService {
  private static instance: ImageOptimizationService;
  private cache = new Map<string, OptimizedImage>();
  private readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

  static getInstance(): ImageOptimizationService {
    if (!ImageOptimizationService.instance) {
      ImageOptimizationService.instance = new ImageOptimizationService();
    }
    return ImageOptimizationService.instance;
  }

  // Optimize image URL using various services
  optimizeImageUrl(
    originalUrl: string, 
    options: ImageOptimizationOptions = {}
  ): string {
    if (!originalUrl || originalUrl === '') {
      return this.getPlaceholderImage(options);
    }

    const {
      width = 400,
      height = 300,
      quality = 80,
      format = 'webp',
      blur = 0,
      grayscale = false
    } = options;

    // Check if it's already an optimized URL
    if (this.isOptimizedUrl(originalUrl)) {
      return originalUrl;
    }

    // Use different optimization services based on the image source
    if (originalUrl.includes('unsplash.com')) {
      return this.optimizeUnsplashUrl(originalUrl, width, height, quality);
    }

    if (originalUrl.includes('pixabay.com')) {
      return this.optimizePixabayUrl(originalUrl, width, height, quality);
    }

    // For other images, use a generic optimization service
    return this.optimizeGenericUrl(originalUrl, width, height, quality, format, blur, grayscale);
  }

  // Generate placeholder image
  getPlaceholderImage(options: ImageOptimizationOptions = {}): string {
    const { width = 400, height = 300 } = options;
    
    // Use a placeholder service
    return `https://via.placeholder.com/${width}x${height}/f3f4f6/9ca3af?text=News+Image`;
  }

  // Generate blur placeholder
  generateBlurPlaceholder(width: number, height: number): string {
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="system-ui">
          Loading...
        </text>
      </svg>
    `)}`;
  }

  // Lazy load image with intersection observer
  async lazyLoadImage(
    imgElement: HTMLImageElement,
    src: string,
    options: ImageOptimizationOptions = {}
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              observer.unobserve(imgElement);
              
              const optimizedUrl = this.optimizeImageUrl(src, options);
              const placeholder = this.generateBlurPlaceholder(
                options.width || 400,
                options.height || 300
              );

              // Set placeholder first
              imgElement.src = placeholder;
              imgElement.style.filter = 'blur(5px)';
              imgElement.style.transition = 'filter 0.3s ease';

              // Load optimized image
              const tempImg = new Image();
              tempImg.onload = () => {
                imgElement.src = optimizedUrl;
                imgElement.style.filter = 'none';
                resolve();
              };
              tempImg.onerror = () => {
                imgElement.src = this.getPlaceholderImage(options);
                imgElement.style.filter = 'none';
                reject(new Error('Failed to load image'));
              };
              tempImg.src = optimizedUrl;
            }
          });
        },
        { threshold: 0.1 }
      );

      observer.observe(imgElement);
    });
  }

  // Preload critical images
  async preloadImages(urls: string[], options: ImageOptimizationOptions = {}): Promise<void> {
    const promises = urls.map(url => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to preload: ${url}`));
        img.src = this.optimizeImageUrl(url, options);
      });
    });

    await Promise.allSettled(promises);
  }

  // Get image dimensions
  async getImageDimensions(url: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      img.src = url;
    });
  }

  // Check if image is cached
  isImageCached(url: string): boolean {
    return this.cache.has(url);
  }

  // Get cached image
  getCachedImage(url: string): OptimizedImage | null {
    return this.cache.get(url) || null;
  }

  // Cache image metadata
  cacheImage(url: string, metadata: OptimizedImage): void {
    this.cache.set(url, metadata);
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Private helper methods
  private isOptimizedUrl(url: string): boolean {
    return url.includes('via.placeholder.com') || 
           url.includes('images.unsplash.com') ||
           url.includes('cdn.pixabay.com');
  }

  private optimizeUnsplashUrl(url: string, width: number, height: number, quality: number): string {
    // Unsplash optimization
    if (url.includes('unsplash.com/photos/')) {
      const photoId = url.split('/photos/')[1]?.split('?')[0];
      if (photoId) {
        return `https://images.unsplash.com/photo-${photoId}?w=${width}&h=${height}&q=${quality}&fm=webp&fit=crop`;
      }
    }
    return url;
  }

  private optimizePixabayUrl(url: string, width: number, height: number, quality: number): string {
    // Pixabay optimization
    if (url.includes('pixabay.com/')) {
      return url.replace(/_\d+\.jpg/, `_${width}.jpg`);
    }
    return url;
  }

  private optimizeGenericUrl(
    url: string, 
    width: number, 
    height: number, 
    quality: number, 
    format: string,
    blur: number,
    grayscale: boolean
  ): string {
    // For generic images, we can use a service like Cloudinary or similar
    // For now, return the original URL
    return url;
  }

  // Generate responsive image srcset
  generateSrcSet(baseUrl: string, sizes: number[]): string {
    return sizes
      .map(size => `${this.optimizeImageUrl(baseUrl, { width: size })} ${size}w`)
      .join(', ');
  }

  // Generate responsive image sizes attribute
  generateSizes(breakpoints: { minWidth: number; size: string }[]): string {
    return breakpoints
      .map(bp => `(min-width: ${bp.minWidth}px) ${bp.size}`)
      .join(', ') + ', 100vw';
  }
}

// Export singleton instance
export const imageOptimizationService = ImageOptimizationService.getInstance();
