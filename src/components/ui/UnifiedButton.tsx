import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { Slot } from '@radix-ui/react-slot';

export interface UnifiedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  asChild?: boolean;
  // Context-specific variants for better UX
  context?: 'event' | 'community' | 'trending' | 'default';
}

const UnifiedButton = React.forwardRef<HTMLButtonElement, UnifiedButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      asChild = false,
      context = 'default',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    // Context-specific styling
    const getContextStyles = () => {
      switch (context) {
        case 'event':
          return 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-md hover:shadow-lg';
        case 'community':
          return 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg';
        case 'trending':
          return 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg';
        default:
          return '';
      }
    };

    // Base variant styles
    const getVariantStyles = () => {
      if (context !== 'default') return '';
      
      switch (variant) {
        case 'primary':
          return 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md';
        case 'secondary':
          return 'bg-secondary text-secondary-foreground hover:bg-secondary/80';
        case 'outline':
          return 'border border-input bg-background hover:bg-accent hover:text-accent-foreground';
        case 'ghost':
          return 'hover:bg-accent hover:text-accent-foreground';
        case 'destructive':
          return 'bg-destructive text-destructive-foreground hover:bg-destructive/90';
        default:
          return '';
      }
    };

    // Size styles
    const getSizeStyles = () => {
      switch (size) {
        case 'sm':
          return 'h-8 px-3 text-xs';
        case 'md':
          return 'h-9 px-4 text-sm';
        case 'lg':
          return 'h-11 px-8 text-base';
        case 'icon':
          return 'h-9 w-9';
        default:
          return 'h-9 px-4 text-sm';
      }
    };

    return (
      <Comp
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          // Size styles
          getSizeStyles(),
          // Variant styles
          getVariantStyles(),
          // Context styles
          getContextStyles(),
          // Additional props
          fullWidth && 'w-full',
          loading && 'cursor-not-allowed',
          className
        )}
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
