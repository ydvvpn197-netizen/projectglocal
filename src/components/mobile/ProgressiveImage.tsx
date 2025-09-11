import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: 'low' | 'medium' | 'high';
  onLoad?: () => void;
  onError?: () => void;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  alt,
  placeholder,
  className,
  width,
  height,
  priority = false,
  quality = 'medium',
  onLoad,
  onError,
}) => {
  const [imageSrc, setImageSrc] = useState<string>(placeholder || '');
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate optimized image URL based on quality and connection
  const getOptimizedSrc = (originalSrc: string, quality: string): string => {
    if (!originalSrc) return '';
    
    // For low bandwidth, use lower quality
    if (quality === 'low') {
      // Add query parameters for image optimization
      const url = new URL(originalSrc);
      url.searchParams.set('w', width?.toString() || '400');
      url.searchParams.set('q', '60');
      url.searchParams.set('f', 'webp');
      return url.toString();
    }
    
    if (quality === 'medium') {
      const url = new URL(originalSrc);
      url.searchParams.set('w', width?.toString() || '800');
      url.searchParams.set('q', '80');
      url.searchParams.set('f', 'webp');
      return url.toString();
    }
    
    return originalSrc;
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (imageRef) {
      observerRef.current.observe(imageRef);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [imageRef, priority, isInView]);

  // Load image when in view
  useEffect(() => {
    if (!isInView || !src) return;

    const img = new Image();
    const optimizedSrc = getOptimizedSrc(src, quality);

    img.onload = () => {
      setImageSrc(optimizedSrc);
      setIsLoaded(true);
      onLoad?.();
    };

    img.onerror = () => {
      setHasError(true);
      onError?.();
    };

    img.src = optimizedSrc;
  }, [isInView, src, quality, width, onLoad, onError]);

  // Network-aware quality adjustment
  useEffect(() => {
    const updateQuality = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection) {
          const effectiveType = connection.effectiveType;
          if (effectiveType === 'slow-2g' || effectiveType === '2g') {
            // Force low quality for slow connections
            if (quality !== 'low' && isInView) {
              const img = new Image();
              img.onload = () => {
                setImageSrc(getOptimizedSrc(src, 'low'));
              };
              img.src = getOptimizedSrc(src, 'low');
            }
          }
        }
      }
    };

    updateQuality();
    
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection?.addEventListener('change', updateQuality);
      return () => connection?.removeEventListener('change', updateQuality);
    }
  }, [src, quality, isInView]);

  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-100 text-gray-400',
          className
        )}
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="text-2xl mb-2">📷</div>
          <div className="text-sm">Image unavailable</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setImageRef}
      className={cn('relative overflow-hidden', className)}
      style={{ width, height }}
    >
      {/* Placeholder/Loading state */}
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="text-gray-400">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      {/* Actual image */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          style={{ width, height }}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}
    </div>
  );
};

export default ProgressiveImage;
