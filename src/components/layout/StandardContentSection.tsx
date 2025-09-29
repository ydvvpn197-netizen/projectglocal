/**
 * Standard Content Section Component
 * Provides consistent content structure for page sections
 */

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp,
  Users,
  Calendar,
  Globe,
  Star,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal
} from 'lucide-react';

interface StandardContentSectionProps {
  children: ReactNode;
  className?: string;
  
  // Section header
  title?: string;
  subtitle?: string;
  description?: string;
  
  // Actions
  actions?: ReactNode;
  
  // Badges and status
  badges?: Array<{
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    icon?: ReactNode;
  }>;
  
  // Layout options
  variant?: 'default' | 'card' | 'minimal' | 'hero';
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  
  // Styling
  background?: 'default' | 'muted' | 'gradient' | 'transparent';
  border?: boolean;
  shadow?: boolean;
}

export const StandardContentSection: React.FC<StandardContentSectionProps> = ({
  children,
  className,
  title,
  subtitle,
  description,
  actions,
  badges = [],
  variant = 'default',
  spacing = 'md',
  maxWidth = 'full',
  background = 'default',
  border = false,
  shadow = false
}) => {
  const spacingClasses = {
    none: '',
    sm: 'py-4',
    md: 'py-6',
    lg: 'py-8',
    xl: 'py-12'
  };

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-7xl',
    '2xl': 'max-w-8xl',
    full: 'max-w-full'
  };

  const backgroundClasses = {
    default: 'bg-background',
    muted: 'bg-muted/50',
    gradient: 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20',
    transparent: 'bg-transparent'
  };

  const variantClasses = {
    default: '',
    card: 'rounded-lg border bg-card',
    minimal: 'border-b',
    hero: 'rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20'
  };

  const shadowClasses = shadow ? 'shadow-lg' : '';
  const borderClasses = border ? 'border border-border' : '';

  const content = (
    <div className={cn(
      'w-full',
      maxWidthClasses[maxWidth],
      spacingClasses[spacing],
      backgroundClasses[background],
      variantClasses[variant],
      shadowClasses,
      borderClasses,
      className
    )}>
      {/* Section Header */}
      {(title || subtitle || description || actions || badges.length > 0) && (
        <div className="mb-6">
          {subtitle && (
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {subtitle}
            </p>
          )}
          {title && (
            <h2 className="text-2xl font-bold tracking-tight mb-2">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-muted-foreground max-w-2xl">
              {description}
            </p>
          )}
          
          {/* Badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {badges.map((badge, index) => (
                <Badge
                  key={index}
                  variant={badge.variant || 'secondary'}
                  className="flex items-center gap-1"
                >
                  {badge.icon}
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}

          {/* Actions */}
          {actions && (
            <div className="flex flex-wrap gap-2 mt-4">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  if (variant === 'card') {
    return (
      <Card className={cn(className, shadowClasses, borderClasses)}>
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    );
  }

  return content;
};

// Pre-configured section variants
export const HeroSection: React.FC<Omit<StandardContentSectionProps, 'variant' | 'background'>> = (props) => (
  <StandardContentSection
    {...props}
    variant="hero"
    background="gradient"
    spacing="xl"
    shadow={true}
  />
);

export const CardSection: React.FC<Omit<StandardContentSectionProps, 'variant'>> = (props) => (
  <StandardContentSection
    {...props}
    variant="card"
    background="default"
    spacing="md"
    shadow={true}
  />
);

export const MinimalSection: React.FC<Omit<StandardContentSectionProps, 'variant' | 'background'>> = (props) => (
  <StandardContentSection
    {...props}
    variant="minimal"
    background="transparent"
    spacing="sm"
    border={true}
  />
);

export default StandardContentSection;
