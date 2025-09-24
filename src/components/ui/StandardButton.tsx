import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StandardButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'default' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  href?: string;
}

const variantStyles = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
};

const sizeStyles = {
  sm: 'h-8 px-3 text-xs',
  default: 'h-9 px-4 py-2',
  lg: 'h-10 px-8'
};

export const StandardButton: React.FC<StandardButtonProps> = ({
  children,
  variant = 'primary',
  size = 'default',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className,
  onClick,
  type = 'button',
  href
}) => {
  const buttonContent = (
    <>
      {loading && (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {Icon && iconPosition === 'left' && !loading && (
        <Icon className="mr-2 h-4 w-4" />
      )}
      {children}
      {Icon && iconPosition === 'right' && !loading && (
        <Icon className="ml-2 h-4 w-4" />
      )}
    </>
  );

  const buttonProps = {
    className: cn(
      'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
      variantStyles[variant],
      sizeStyles[size],
      className
    ),
    disabled: disabled || loading,
    onClick,
    type
  };

  if (href) {
    return (
      <a href={href} {...buttonProps}>
        {buttonContent}
      </a>
    );
  }

  return (
    <button {...buttonProps}>
      {buttonContent}
    </button>
  );
};
