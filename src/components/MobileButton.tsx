import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { cva, type VariantProps } from 'class-variance-authority';

const mobileButtonVariants = cva(
  'mobile-transition touch-target mobile-focus',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70',
        ghost: 'hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
        link: 'text-primary underline-offset-4 hover:underline active:text-primary/80',
        community: 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 active:from-purple-800 active:to-blue-800',
        event: 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 active:from-orange-700 active:to-red-700',
        success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
        warning: 'bg-yellow-600 text-white hover:bg-yellow-700 active:bg-yellow-800',
      },
      size: {
        sm: 'mobile-btn-sm',
        md: 'mobile-btn-base',
        lg: 'mobile-btn-lg',
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0',
        'icon-lg': 'h-12 w-12 p-0',
      },
      fullWidth: {
        true: 'mobile-btn-full',
        false: '',
      },
      rounded: {
        default: 'rounded-md',
        full: 'rounded-full',
        none: 'rounded-none',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      fullWidth: false,
      rounded: 'default',
    },
  }
);

export interface MobileButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof mobileButtonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export const MobileButton = React.forwardRef<HTMLButtonElement, MobileButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth, 
    rounded,
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    return (
      <Button
        className={cn(
          mobileButtonVariants({ variant, size, fullWidth, rounded }),
          {
            'mobile-disabled': disabled || loading,
            'mobile-loading': loading,
          },
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {!loading && leftIcon && (
          <span className="mr-2">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </Button>
    );
  }
);

MobileButton.displayName = 'MobileButton';

// Specialized mobile button components
export function MobileFloatingActionButton({
  icon,
  onClick,
  className,
  ...props
}: {
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
} & Omit<MobileButtonProps, 'children' | 'leftIcon' | 'rightIcon'>) {
  return (
    <MobileButton
      variant="community"
      size="icon-lg"
      rounded="full"
      className={cn(
        'fixed bottom-20 right-4 z-50 shadow-lg mobile-only',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {icon}
    </MobileButton>
  );
}

export function MobileBottomActionButton({
  icon,
  label,
  onClick,
  className,
  ...props
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
} & Omit<MobileButtonProps, 'children' | 'leftIcon' | 'rightIcon'>) {
  return (
    <MobileButton
      variant="ghost"
      size="sm"
      className={cn(
        'flex flex-col items-center gap-1 h-12 w-12 p-0',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </MobileButton>
  );
}

export function MobileTabButton({
  icon,
  label,
  active,
  onClick,
  className,
  ...props
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
} & Omit<MobileButtonProps, 'children' | 'leftIcon' | 'rightIcon'>) {
  return (
    <MobileButton
      variant={active ? 'default' : 'ghost'}
      size="sm"
      className={cn(
        'flex flex-col items-center gap-1 h-12 w-12 p-0',
        {
          'text-primary bg-primary/10': active,
        },
        className
      )}
      onClick={onClick}
      {...props}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </MobileButton>
  );
}

export function MobileCardButton({
  children,
  variant = 'outline',
  size = 'sm',
  className,
  ...props
}: MobileButtonProps) {
  return (
    <MobileButton
      variant={variant}
      size={size}
      className={cn('w-full', className)}
      {...props}
    >
      {children}
    </MobileButton>
  );
}

export function MobileIconButton({
  icon,
  variant = 'ghost',
  size = 'icon',
  className,
  ...props
}: {
  icon: React.ReactNode;
} & Omit<MobileButtonProps, 'children' | 'leftIcon' | 'rightIcon'>) {
  return (
    <MobileButton
      variant={variant}
      size={size}
      className={className}
      {...props}
    >
      {icon}
    </MobileButton>
  );
}
