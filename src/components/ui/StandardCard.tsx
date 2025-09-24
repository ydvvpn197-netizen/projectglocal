import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StandardCardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  variant?: 'default' | 'outline' | 'elevated' | 'glass';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

const variantStyles = {
  default: 'bg-card text-card-foreground',
  outline: 'border border-border bg-card text-card-foreground',
  elevated: 'bg-card text-card-foreground shadow-lg',
  glass: 'bg-card/80 backdrop-blur-sm border border-border/50 text-card-foreground'
};

const sizeStyles = {
  sm: 'p-4',
  default: 'p-6',
  lg: 'p-8'
};

export const StandardCard: React.FC<StandardCardProps> = ({
  children,
  title,
  description,
  footer,
  variant = 'default',
  size = 'default',
  className,
  onClick,
  hover = false
}) => {
  return (
    <Card 
      className={cn(
        'rounded-lg transition-all duration-200',
        variantStyles[variant],
        hover && 'hover:shadow-md hover:scale-[1.02] cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {(title || description) && (
        <CardHeader className={sizeStyles[size]}>
          {title && (
            <CardTitle className="text-lg font-semibold leading-none tracking-tight">
              {title}
            </CardTitle>
          )}
          {description && (
            <CardDescription className="text-sm text-muted-foreground">
              {description}
            </CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className={sizeStyles[size]}>
        {children}
      </CardContent>
      {footer && (
        <CardFooter className={sizeStyles[size]}>
          {footer}
        </CardFooter>
      )}
    </Card>
  );
};
