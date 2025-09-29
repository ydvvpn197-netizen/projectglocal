import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { designTokens } from './design-tokens';

/**
 * Unified Button Component
 * Single source of truth for all button styling across the application
 */
const unifiedButtonVariants = cva(
  [
    // Base styles
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-medium transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    'hover:scale-[1.02] active:scale-[0.98]',
  ],
  {
    variants: {
      variant: {
        // Primary variants
        primary: [
          'bg-primary text-primary-foreground',
          'hover:bg-primary/90',
          'shadow-sm hover:shadow-md',
        ],
        'primary-gradient': [
          'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground',
          'hover:from-primary/90 hover:to-primary/70',
          'shadow-sm hover:shadow-md',
        ],
        
        // Secondary variants
        secondary: [
          'bg-secondary text-secondary-foreground',
          'hover:bg-secondary/80',
          'shadow-sm hover:shadow-md',
        ],
        'secondary-outline': [
          'border border-secondary bg-transparent text-secondary-foreground',
          'hover:bg-secondary hover:text-secondary-foreground',
          'shadow-sm hover:shadow-md',
        ],
        
        // Accent variants
        accent: [
          'bg-accent text-accent-foreground',
          'hover:bg-accent/90',
          'shadow-sm hover:shadow-md',
        ],
        'accent-gradient': [
          'bg-gradient-to-r from-accent to-accent/80 text-accent-foreground',
          'hover:from-accent/90 hover:to-accent/70',
          'shadow-sm hover:shadow-md',
        ],
        
        // Status variants
        success: [
          'bg-success text-white',
          'hover:bg-success/90',
          'shadow-sm hover:shadow-md',
        ],
        warning: [
          'bg-warning text-white',
          'hover:bg-warning/90',
          'shadow-sm hover:shadow-md',
        ],
        destructive: [
          'bg-destructive text-destructive-foreground',
          'hover:bg-destructive/90',
          'shadow-sm hover:shadow-md',
        ],
        
        // Outline variants
        outline: [
          'border border-input bg-background',
          'hover:bg-accent hover:text-accent-foreground',
          'shadow-sm hover:shadow-md',
        ],
        ghost: [
          'hover:bg-accent hover:text-accent-foreground',
        ],
        link: [
          'text-primary underline-offset-4 hover:underline',
        ],
        
        // Context-specific variants
        'event-primary': [
          'bg-gradient-to-r from-orange-500 to-yellow-500 text-white',
          'hover:from-orange-600 hover:to-yellow-600',
          'shadow-md hover:shadow-lg',
        ],
        'community-primary': [
          'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
          'hover:from-purple-600 hover:to-pink-600',
          'shadow-md hover:shadow-lg',
        ],
        'trending-primary': [
          'bg-gradient-to-r from-red-500 to-orange-500 text-white',
          'hover:from-red-600 hover:to-orange-600',
          'shadow-md hover:shadow-lg',
        ],
      },
      size: {
        xs: 'h-6 px-2 text-xs rounded-sm',
        sm: 'h-8 px-3 text-xs rounded-md',
        md: 'h-9 px-4 text-sm rounded-md',
        lg: 'h-11 px-8 text-base rounded-lg',
        xl: 'h-12 px-10 text-lg rounded-lg',
        icon: 'h-9 w-9 rounded-md',
        'icon-sm': 'h-8 w-8 rounded-sm',
        'icon-lg': 'h-11 w-11 rounded-lg',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface UnifiedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof unifiedButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const UnifiedButton = React.forwardRef<HTMLButtonElement, UnifiedButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(unifiedButtonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!loading && leftIcon && <span className="flex items-center">{leftIcon}</span>}
        {loading && loadingText ? loadingText : children}
        {!loading && rightIcon && <span className="flex items-center">{rightIcon}</span>}
      </Comp>
    );
  }
);

UnifiedButton.displayName = 'UnifiedButton';

export { UnifiedButton };
