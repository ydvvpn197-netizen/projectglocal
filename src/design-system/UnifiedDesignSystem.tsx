import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

// Unified spacing system
export const spacing = {
  xs: 'space-y-1',
  sm: 'space-y-2', 
  md: 'space-y-4',
  lg: 'space-y-6',
  xl: 'space-y-8',
  '2xl': 'space-y-12'
} as const;

// Unified container variants
export const containerVariants = cva(
  'mx-auto px-4',
  {
    variants: {
      size: {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-7xl',
        '2xl': 'max-w-2xl',
        full: 'max-w-full'
      },
      padding: {
        none: 'px-0',
        sm: 'px-3',
        md: 'px-4',
        lg: 'px-6',
        xl: 'px-8'
      }
    },
    defaultVariants: {
      size: 'xl',
      padding: 'md'
    }
  }
);

// Unified card variants
export const cardVariants = cva(
  'rounded-lg border bg-card text-card-foreground shadow-sm',
  {
    variants: {
      variant: {
        default: 'border-border',
        elevated: 'border-border shadow-md',
        outlined: 'border-2 border-border',
        filled: 'bg-muted border-muted'
      },
      padding: {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8'
      }
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md'
    }
  }
);

// Unified button variants
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline'
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4 py-2',
        lg: 'h-10 px-8',
        icon: 'h-9 w-9'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
);

// Unified input variants
export const inputVariants = cva(
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: '',
        filled: 'bg-muted border-muted',
        error: 'border-destructive focus-visible:ring-destructive'
      },
      size: {
        sm: 'h-8 px-2 text-xs',
        md: 'h-9 px-3',
        lg: 'h-10 px-4'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
);

// Unified typography variants
export const typographyVariants = cva('', {
  variants: {
    variant: {
      h1: 'text-4xl font-bold tracking-tight',
      h2: 'text-3xl font-semibold tracking-tight',
      h3: 'text-2xl font-semibold tracking-tight',
      h4: 'text-xl font-semibold tracking-tight',
      h5: 'text-lg font-semibold',
      h6: 'text-base font-semibold',
      body: 'text-base',
      'body-sm': 'text-sm',
      'body-xs': 'text-xs',
      caption: 'text-sm text-muted-foreground',
      lead: 'text-xl text-muted-foreground'
    }
  },
  defaultVariants: {
    variant: 'body'
  }
});

// Unified layout components
interface UnifiedContainerProps extends VariantProps<typeof containerVariants> {
  children: ReactNode;
  className?: string;
}

export const UnifiedContainer = React.forwardRef<HTMLDivElement, UnifiedContainerProps>(
  ({ children, className, size, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(containerVariants({ size, padding }), className)}
      {...props}
    >
      {children}
    </div>
  )
);

interface UnifiedCardProps extends VariantProps<typeof cardVariants> {
  children: ReactNode;
  className?: string;
}

export const UnifiedCard = React.forwardRef<HTMLDivElement, UnifiedCardProps>(
  ({ children, className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding }), className)}
      {...props}
    >
      {children}
    </div>
  )
);

interface UnifiedButtonProps extends VariantProps<typeof buttonVariants> {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const UnifiedButton = React.forwardRef<HTMLButtonElement, UnifiedButtonProps>(
  ({ children, className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </button>
  )
);

interface UnifiedInputProps extends VariantProps<typeof inputVariants> {
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}

export const UnifiedInput = React.forwardRef<HTMLInputElement, UnifiedInputProps>(
  ({ className, variant, size, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(inputVariants({ variant, size }), className)}
      {...props}
    />
  )
);

interface UnifiedTypographyProps extends VariantProps<typeof typographyVariants> {
  children: ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

export const UnifiedTypography = React.forwardRef<HTMLElement, UnifiedTypographyProps>(
  ({ children, className, variant, as: Component = 'p', ...props }, ref) => {
    const ComponentRef = Component as any;
    return (
      <ComponentRef
        ref={ref}
        className={cn(typographyVariants({ variant }), className)}
        {...props}
      >
        {children}
      </ComponentRef>
    );
  }
);

// Export all variants for external use
export {
  containerVariants,
  cardVariants,
  buttonVariants,
  inputVariants,
  typographyVariants
};
