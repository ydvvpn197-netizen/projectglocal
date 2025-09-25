import React, { forwardRef } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface EnhancedButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  fullWidth?: boolean;
  tooltip?: string;
}

export const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({
    children,
    loading = false,
    loadingText,
    icon,
    iconPosition = 'left',
    variant = 'default',
    size = 'default',
    fullWidth = false,
    tooltip,
    className,
    disabled,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        disabled={isDisabled}
        className={cn(
          'relative transition-all duration-200',
          fullWidth && 'w-full',
          loading && 'cursor-not-allowed',
          className
        )}
        title={tooltip}
        {...props}
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        
        {!loading && icon && iconPosition === 'left' && (
          <span className="mr-2">{icon}</span>
        )}
        
        <span className={cn(
          loading && 'opacity-0',
          'transition-opacity duration-200'
        )}>
          {loading ? loadingText || 'Loading...' : children}
        </span>
        
        {!loading && icon && iconPosition === 'right' && (
          <span className="ml-2">{icon}</span>
        )}
      </Button>
    );
  }
);

EnhancedButton.displayName = 'EnhancedButton';
