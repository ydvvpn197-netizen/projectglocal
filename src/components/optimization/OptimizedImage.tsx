import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Image as ImageIcon, 
  Download, 
  ZoomIn, 
  RotateCw, 
  Loader2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
  lazy?: boolean;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
  sizes?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  showControls?: boolean;
  enableZoom?: boolean;
  enableDownload?: boolean;
  fallback?: React.ReactNode;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder,
  lazy = true,
  quality = 80,
  format = 'auto',
  sizes,
  priority = false,
  onLoad,
  onError,
  showControls = false,
  enableZoom = false,
  enableDownload = false,
  fallback
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [blurDataURL, setBlurDataURL] = useState<string>('');
  
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate optimized image URL
  const generateOptimizedUrl = (originalSrc: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  }) => {
    if (!originalSrc) return '';
    
    // If it's already an optimized URL, return as is
    if (originalSrc.includes('?')) return originalSrc;
    
    const params = new URLSearchParams();
    
    if (options.width) params.append('w', options.width.toString());
    if (options.height) params.append('h', options.height.toString());
    if (options.quality) params.append('q', options.quality.toString());
    if (options.format && options.format !== 'auto') {
      params.append('f', options.format);
    }
    
    return params.toString() ? `${originalSrc}?${params.toString()}` : originalSrc;
  };

  // Generate blur placeholder
  const generateBlurPlaceholder = (src: string) => {
    // Create a simple blur placeholder
    const canvas = document.createElement('canvas');
    canvas.width = 20;
    canvas.height = 20;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, 20, 20);
    }
    
    return canvas.toDataURL();
  };

  // Load image with optimization
  const loadImage = async (imageSrc: string) => {
    if (!imageSrc) return;
    
    setIsLoading(true);
    setHasError(false);
    
    try {
      const optimizedUrl = generateOptimizedUrl(imageSrc, {
        width,
        height,
        quality,
        format
      });
      
      // Preload the image
      const img = new Image();
      
      img.onload = () => {
        setImageSrc(optimizedUrl);
        setIsLoaded(true);
        setIsLoading(false);
        onLoad?.();
      };
      
      img.onerror = () => {
        setHasError(true);
        setIsLoading(false);
        onError?.();
      };
      
      img.src = optimizedUrl;
      
      // Generate blur placeholder
      if (!blurDataURL) {
        setBlurDataURL(generateBlurPlaceholder(imageSrc));
      }
      
    } catch (error) {
      console.error('Error loading image:', error);
      setHasError(true);
      setIsLoading(false);
      onError?.();
    }
  };

  // Intersection observer for lazy loading
  useEffect(() => {
    if (!lazy || priority) {
      loadImage(src);
      return;
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage(src);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );
    
    observerRef.current = observer;
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [src, lazy, priority]);

  // Handle zoom
  const handleZoom = () => {
    if (enableZoom) {
      setIsZoomed(!isZoomed);
    }
  };

  // Handle download
  const handleDownload = async () => {
    if (!enableDownload || !imageSrc) return;
    
    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = alt || 'image';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download started",
        description: "Image is being downloaded"
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      toast({
        title: "Download failed",
        description: "Could not download the image",
        variant: "destructive"
      });
    }
  };

  // Handle rotation
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        {fallback || (
          <div className="text-center p-4">
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Failed to load image</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => loadImage(src)}
            >
              Retry
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading state */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10"
          >
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Loading image...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blur placeholder */}
      <AnimatePresence>
        {isLoading && blurDataURL && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-5"
          >
            <img
              src={blurDataURL}
              alt=""
              className="w-full h-full object-cover blur-sm scale-110"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main image */}
      <motion.img
        ref={imgRef}
        src={imageSrc || src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        className={`w-full h-full object-cover transition-all duration-300 ${
          isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
        }`}
        style={{
          transform: `rotate(${rotation}deg)`,
          filter: isLoading ? 'blur(5px)' : 'none'
        }}
        onClick={handleZoom}
        loading={lazy ? 'lazy' : 'eager'}
        decoding="async"
      />

      {/* Controls overlay */}
      <AnimatePresence>
        {showControls && isLoaded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-2 right-2 flex gap-2"
          >
            {enableZoom && (
              <Button
                variant="secondary"
                size="icon"
                onClick={handleZoom}
                className="h-8 w-8 bg-white/90 hover:bg-white"
              >
                {isZoomed ? <EyeOff className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
              </Button>
            )}
            
            {enableDownload && (
              <Button
                variant="secondary"
                size="icon"
                onClick={handleDownload}
                className="h-8 w-8 bg-white/90 hover:bg-white"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant="secondary"
              size="icon"
              onClick={handleRotate}
              className="h-8 w-8 bg-white/90 hover:bg-white"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zoom overlay */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsZoomed(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={imageSrc || src}
                alt={alt}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-4 right-4 h-8 w-8 bg-white/90 hover:bg-white"
                onClick={() => setIsZoomed(false)}
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Image gallery component with optimization
export const OptimizedImageGallery: React.FC<{
  images: string[];
  alt: string;
  className?: string;
  enableZoom?: boolean;
  enableDownload?: boolean;
}> = ({ images, alt, className, enableZoom = true, enableDownload = true }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main image */}
      <OptimizedImage
        src={images[currentIndex]}
        alt={alt}
        className="w-full h-64 object-cover rounded-lg"
        enableZoom={enableZoom}
        enableDownload={enableDownload}
        showControls
      />

      {/* Thumbnail navigation */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex ? 'border-blue-500' : 'border-gray-200'
              }`}
            >
              <OptimizedImage
                src={image}
                alt={`${alt} ${index + 1}`}
                className="w-full h-full object-cover"
                lazy={false}
                quality={60}
              />
            </button>
          ))}
        </div>
      )}

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <Button
            variant="secondary"
            size="icon"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8 bg-white/90 hover:bg-white"
            onClick={prevImage}
          >
            ←
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 bg-white/90 hover:bg-white"
            onClick={nextImage}
          >
            →
          </Button>
        </>
      )}
    </div>
  );
};

export default OptimizedImage;
