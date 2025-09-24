import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  blur?: number;
  grayscale?: boolean;
  lazy?: boolean;
  placeholder?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
  sizes?: string;
  srcSet?: string;
}

// Image optimization service
class ImageOptimizationService {
  private static instance: ImageOptimizationService;
  private cache = new Map<string, string>();
  private loadingPromises = new Map<string, Promise<string>>();

  static getInstance(): ImageOptimizationService {
    if (!ImageOptimizationService.instance) {
      ImageOptimizationService.instance = new ImageOptimizationService();
    }
    return ImageOptimizationService.instance;
  }

  optimizeImageUrl(
    src: string, 
    options: {
      width: number;
      height: number;
      quality: number;
      format: string;
      blur?: number;
      grayscale?: boolean;
    }
  ): string {
    const cacheKey = `${src}-${JSON.stringify(options)}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // For now, return the original URL
    // In production, this would integrate with an image optimization service
    const optimizedUrl = src;
    this.cache.set(cacheKey, optimizedUrl);
    return optimizedUrl;
  }

  generateBlurPlaceholder(width: number, height: number): string {
    // Generate a simple blur placeholder
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, width, height);
    }
    return canvas.toDataURL();
  }

  generateSrcSet(src: string, sizes: number[]): string {
    return sizes
      .map(size => `${this.optimizeImageUrl(src, { width: size, height: size * 0.75, quality: 80, format: 'webp' })} ${size}w`)
      .join(', ');
  }

  generateSizes(breakpoints: { minWidth: number; size: string }[]): string {
    return breakpoints
      .map(bp => `(min-width: ${bp.minWidth}px) ${bp.size}`)
      .join(', ');
  }

  getPlaceholderImage(options: {
    width: number;
    height: number;
    quality: number;
    format: string;
    blur?: number;
    grayscale?: boolean;
  }): string {
    return this.generateBlurPlaceholder(options.width, options.height);
  }

  async lazyLoadImage(
    imgElement: HTMLImageElement,
    src: string,
    options: {
      width: number;
      height: number;
      quality: number;
      format: string;
      blur?: number;
      grayscale?: boolean;
    }
  ): Promise<void> {
    const cacheKey = `${src}-${JSON.stringify(options)}`;
    
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!;
    }

    const promise = new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        imgElement.src = this.optimizeImageUrl(src, options);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });

    this.loadingPromises.set(cacheKey, promise);
    return promise;
  }
}

const imageOptimizationService = ImageOptimizationService.getInstance();

export const OptimizedImage: React.FC<OptimizedImageProps> = React.memo(({
  src,
  alt,
  width = 400,
  height = 300,
  quality = 80,
  format = 'webp',
  blur = 0,
  grayscale = false,
  lazy = true,
  placeholder,
  className,
  onLoad,
  onError,
  priority = false,
  sizes,
  srcSet,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const optimizationOptions = useMemo(() => ({
    width,
    height,
    quality,
    format,
    blur,
    grayscale
  }), [width, height, quality, format, blur, grayscale]);

  // Memoized handlers to prevent unnecessary re-renders
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    setCurrentSrc(imageOptimizationService.getPlaceholderImage(optimizationOptions));
    onError?.();
  }, [onError, optimizationOptions]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const optimizedUrl = imageOptimizationService.optimizeImageUrl(src, optimizationOptions);
            setCurrentSrc(optimizedUrl);
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [src, lazy, optimizationOptions]);

  // Load image immediately if not lazy or priority
  useEffect(() => {
    if (!lazy || priority) {
      const optimizedUrl = imageOptimizationService.optimizeImageUrl(src, optimizationOptions);
      setCurrentSrc(optimizedUrl);
    }
  }, [src, lazy, priority, optimizationOptions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  if (hasError) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400',
          className
        )}
        style={{ width, height }}
      >
        <div className="text-center">
          <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          <p className="text-xs">Image unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {placeholder && !isLoaded && (
        <div 
          className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse"
          style={{ width, height }}
        />
      )}
      
      <motion.img
        ref={imgRef}
        src={lazy ? placeholder || imageOptimizationService.generateBlurPlaceholder(width, height) : currentSrc}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          'transition-all duration-300',
          !isLoaded && 'blur-sm',
          isLoaded && 'blur-0',
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading={lazy ? 'lazy' : 'eager'}
        sizes={sizes}
        srcSet={srcSet}
        {...props}
      />
      
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Responsive image component
interface ResponsiveImageProps extends Omit<OptimizedImageProps, 'width' | 'height'> {
  sizes?: string;
  srcSet?: string;
  breakpoints?: { minWidth: number; size: string }[];
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = React.memo(({
  src,
  alt,
  sizes,
  srcSet,
  breakpoints = [
    { minWidth: 640, size: '50vw' },
    { minWidth: 768, size: '33vw' },
    { minWidth: 1024, size: '25vw' }
  ],
  ...props
}) => {
  const [responsiveSrcSet, setResponsiveSrcSet] = useState<string>('');
  const [responsiveSizes, setResponsiveSizes] = useState<string>('');

  useEffect(() => {
    if (src) {
      // Generate responsive srcset
      const sizes = [320, 640, 768, 1024, 1280, 1536];
      const generatedSrcSet = imageOptimizationService.generateSrcSet(src, sizes);
      setResponsiveSrcSet(generatedSrcSet);

      // Generate responsive sizes
      const generatedSizes = imageOptimizationService.generateSizes(breakpoints);
      setResponsiveSizes(generatedSizes);
    }
  }, [src, breakpoints]);

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      srcSet={srcSet || responsiveSrcSet}
      sizes={sizes || responsiveSizes}
      {...props}
    />
  );
});

ResponsiveImage.displayName = 'ResponsiveImage';

// Lazy image component with intersection observer
export const LazyImage: React.FC<OptimizedImageProps> = React.memo((props) => {
  return <OptimizedImage {...props} lazy={true} />;
});

LazyImage.displayName = 'LazyImage';

// Preload image component for critical images
export const PreloadImage: React.FC<OptimizedImageProps> = React.memo((props) => {
  return <OptimizedImage {...props} lazy={false} priority={true} />;
});

PreloadImage.displayName = 'PreloadImage';