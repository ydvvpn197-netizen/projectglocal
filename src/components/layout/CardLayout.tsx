/**
 * Card Layout Component
 * Consistent card-based layout for content sections
 */

import React, { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CardLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  variant?: 'default' | 'bordered' | 'elevated' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const CardLayout: React.FC<CardLayoutProps> = ({
  children,
  title,
  description,
  className = '',
  headerClassName = '',
  contentClassName = '',
  variant = 'default',
  padding = 'md'
}) => {
  const variantClasses = {
    default: '',
    bordered: 'border-2',
    elevated: 'shadow-lg',
    ghost: 'bg-transparent border-none shadow-none'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <Card className={cn(
      'w-full',
      variantClasses[variant],
      className
    )}>
      {(title || description) && (
        <CardHeader className={cn(
          'pb-4',
          headerClassName
        )}>
          {title && (
            <CardTitle className="text-xl font-semibold">
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
      
      <CardContent className={cn(
        paddingClasses[padding],
        contentClassName
      )}>
        {children}
      </CardContent>
    </Card>
  );
};
