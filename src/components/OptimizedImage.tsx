// Optimized image component with lazy loading and optimization
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { imageOptimizationService, type ImageOptimizationOptions } from '@/services/imageOptimizationService';
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
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
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
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);

  const optimizationOptions: ImageOptimizationOptions = {
    width,
    height,
    quality,
    format,
    blur,
    grayscale
  };

  useEffect(() => {
    if (!src) {
      setCurrentSrc(imageOptimizationService.getPlaceholderImage(optimizationOptions));
      return;
    }

    const optimizedUrl = imageOptimizationService.optimizeImageUrl(src, optimizationOptions);
    
    if (lazy && imgRef.current) {
      // Lazy load the image
      imageOptimizationService.lazyLoadImage(imgRef.current, src, optimizationOptions)
        .then(() => {
          setIsLoaded(true);
          onLoad?.();
        })
        .catch(() => {
          setHasError(true);
          onError?.();
        });
    } else {
      // Load immediately
      setCurrentSrc(optimizedUrl);
    }
  }, [src, width, height, quality, format, blur, grayscale, lazy, onLoad, onError, optimizationOptions]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setCurrentSrc(imageOptimizationService.getPlaceholderImage(optimizationOptions));
    onError?.();
  };

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
        {...props}
      />
      
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

// Responsive image component
interface ResponsiveImageProps extends Omit<OptimizedImageProps, 'width' | 'height'> {
  sizes?: string;
  srcSet?: string;
  breakpoints?: { minWidth: number; size: string }[];
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
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
};
