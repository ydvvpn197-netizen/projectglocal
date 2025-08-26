import React, { useState, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const cardVariants = cva(
  'relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'border-border',
        elevated: 'border-border shadow-lg hover:shadow-xl',
        glass: 'border-white/20 bg-white/10 backdrop-blur-md',
        gradient: 'bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20',
        outline: 'border-2 border-dashed border-muted-foreground/25',
        interactive: 'border-border hover:border-primary/50 cursor-pointer',
      },
      size: {
        sm: 'p-3',
        default: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
      },
      animation: {
        none: '',
        hover: 'hover:scale-105 hover:-translate-y-1',
        lift: 'hover:shadow-2xl hover:-translate-y-2',
        glow: 'hover:shadow-lg hover:shadow-primary/25',
        pulse: 'animate-pulse',
        bounce: 'hover:animate-bounce',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      animation: 'none',
    },
  }
);

export interface AnimatedCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  children: React.ReactNode;
  loading?: boolean;
  skeleton?: boolean;
  skeletonLines?: number;
  clickable?: boolean;
  onClick?: () => void;
  hoverEffect?: 'scale' | 'lift' | 'glow' | 'none';
  entranceAnimation?: 'fade' | 'slide' | 'zoom' | 'flip' | 'none';
  delay?: number;
  interactive?: boolean;
  disabled?: boolean;
  badge?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  image?: {
    src: string;
    alt: string;
    height?: number;
  };
  overlay?: React.ReactNode;
  shimmer?: boolean;
}

const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  (
    {
      className,
      variant,
      size,
      animation,
      children,
      loading = false,
      skeleton = false,
      skeletonLines = 3,
      clickable = false,
      onClick,
      hoverEffect = 'scale',
      entranceAnimation = 'fade',
      delay = 0,
      interactive = false,
      disabled = false,
      badge,
      header,
      footer,
      image,
      overlay,
      shimmer = false,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const isClickable = clickable || interactive || !!onClick;

    const entranceVariants = {
      fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      },
      slide: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
      },
      zoom: {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.9 },
      },
      flip: {
        initial: { opacity: 0, rotateY: -90 },
        animate: { opacity: 1, rotateY: 0 },
        exit: { opacity: 0, rotateY: 90 },
      },
      none: {
        initial: {},
        animate: {},
        exit: {},
      },
    };

    const hoverVariants = {
      scale: {
        hover: { scale: 1.02, y: -2 },
        tap: { scale: 0.98 },
      },
      lift: {
        hover: { y: -8, scale: 1.02 },
        tap: { y: -4, scale: 0.98 },
      },
      glow: {
        hover: { 
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          y: -2 
        },
        tap: { scale: 0.98 },
      },
      none: {
        hover: {},
        tap: {},
      },
    };

    const handleClick = () => {
      if (!disabled && (clickable || interactive || onClick)) {
        onClick?.();
      }
    };

    const handleMouseDown = () => {
      if (!disabled) {
        setIsPressed(true);
      }
    };

    const handleMouseUp = () => {
      setIsPressed(false);
    };

    const handleMouseEnter = () => {
      if (!disabled) {
        setIsHovered(true);
      }
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      setIsPressed(false);
    };

    const renderSkeleton = () => (
      <div className="space-y-3">
        {image && (
          <div className="h-32 bg-muted animate-pulse rounded-md" />
        )}
        {Array.from({ length: skeletonLines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "bg-muted animate-pulse rounded",
              i === 0 ? "h-4 w-3/4" : "h-3 w-full"
            )}
          />
        ))}
      </div>
    );

    const renderShimmer = () => (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    );

    return (
      <AnimatePresence>
        <motion.div
          ref={(node) => {
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
            cardRef.current = node;
          }}
          className={cn(
            cardVariants({ variant, size, animation, className }),
            isClickable && !disabled && 'cursor-pointer',
            disabled && 'opacity-50 cursor-not-allowed',
            shimmer && 'relative overflow-hidden'
          )}
          variants={entranceVariants[entranceAnimation]}
          initial="initial"
          animate="animate"
          exit="exit"
          whileHover={!disabled && hoverEffect !== 'none' ? hoverVariants[hoverEffect].hover : undefined}
          whileTap={!disabled && hoverEffect !== 'none' ? hoverVariants[hoverEffect].tap : undefined}
          transition={{
            duration: 0.3,
            delay: delay / 1000,
            ease: "easeOut"
          }}
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          {...props}
        >
          {shimmer && renderShimmer()}
          
          {badge && (
            <div className="absolute top-2 right-2 z-10">
              {badge}
            </div>
          )}

          {image && (
            <div className="relative mb-4 overflow-hidden rounded-md">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full object-cover transition-transform duration-300 hover:scale-105"
                style={{ height: image.height || 200 }}
              />
              {overlay && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  {overlay}
                </div>
              )}
            </div>
          )}

          {header && (
            <div className="mb-4">
              {header}
            </div>
          )}

          <div className="relative z-10">
            {loading || skeleton ? renderSkeleton() : children}
          </div>

          {footer && (
            <div className="mt-4 pt-4 border-t border-border">
              {footer}
            </div>
          )}

          {isHovered && interactive && (
            <motion.div
              className="absolute inset-0 bg-primary/5 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </motion.div>
      </AnimatePresence>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';

export { AnimatedCard, cardVariants };
