import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { type VariantProps } from 'class-variance-authority';
import {
  containerVariants,
  cardVariants,
  buttonVariants,
  inputVariants,
  typographyVariants
} from './design-system-constants';

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
    const ComponentRef = Component as keyof JSX.IntrinsicElements;
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
