/**
 * Standard Page Layout Component
 * Provides consistent layout structure for all pages
 */

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Settings, 
  MoreHorizontal,
  Star,
  TrendingUp,
  Users,
  Calendar,
  Globe
} from 'lucide-react';

interface StandardPageLayoutProps {
  children: ReactNode;
  className?: string;
  
  // Header configuration
  title?: string;
  subtitle?: string;
  description?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  
  // Actions
  actions?: ReactNode;
  secondaryActions?: ReactNode;
  
  // Badges and status
  badges?: Array<{
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    icon?: ReactNode;
  }>;
  
  // Layout options
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  showHeader?: boolean;
  showFooter?: boolean;
  
  // Content sections
  headerContent?: ReactNode;
  sidebarContent?: ReactNode;
  footerContent?: ReactNode;
  
  // Styling
  variant?: 'default' | 'minimal' | 'hero' | 'dashboard';
  background?: 'default' | 'gradient' | 'pattern' | 'solid';
}

export const StandardPageLayout: React.FC<StandardPageLayoutProps> = ({
  children,
  className,
  title,
  subtitle,
  description,
  showBackButton = false,
  onBackClick,
  actions,
  secondaryActions,
  badges = [],
  maxWidth = 'xl',
  padding = 'md',
  showHeader = true,
  showFooter = false,
  headerContent,
  sidebarContent,
  footerContent,
  variant = 'default',
  background = 'default'
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-7xl',
    '2xl': 'max-w-8xl',
    full: 'max-w-full'
  };

  const paddingClasses = {
    none: '',
    sm: 'px-4 py-6',
    md: 'px-6 py-8',
    lg: 'px-8 py-12',
    xl: 'px-12 py-16'
  };

  const backgroundClasses = {
    default: 'bg-background',
    gradient: 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30',
    pattern: 'bg-background bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-transparent to-transparent',
    solid: 'bg-slate-50 dark:bg-slate-900'
  };

  const variantClasses = {
    default: 'min-h-screen',
    minimal: 'min-h-[50vh]',
    hero: 'min-h-screen flex items-center',
    dashboard: 'min-h-screen'
  };

  return (
    <div className={cn(
      variantClasses[variant],
      backgroundClasses[background],
      className
    )}>
      <div className={cn(
        'mx-auto w-full',
        maxWidthClasses[maxWidth],
        paddingClasses[padding]
      )}>
        {/* Header Section */}
        {showHeader && (
          <div className="mb-8">
            {/* Back Button */}
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackClick}
                className="mb-4 -ml-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}

            {/* Title Section */}
            {(title || subtitle || description) && (
              <div className="mb-6">
                {subtitle && (
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    {subtitle}
                  </p>
                )}
                {title && (
                  <h1 className="text-3xl font-bold tracking-tight mb-2">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-lg text-muted-foreground max-w-3xl">
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
              </div>
            )}

            {/* Actions */}
            {(actions || secondaryActions) && (
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex flex-wrap gap-2">
                  {actions}
                </div>
                {secondaryActions && (
                  <div className="flex gap-2">
                    {secondaryActions}
                  </div>
                )}
              </div>
            )}

            {/* Custom Header Content */}
            {headerContent}

            <Separator className="mt-6" />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>

          {/* Sidebar */}
          {sidebarContent && (
            <aside className="lg:w-80 flex-shrink-0">
              <div className="sticky top-8">
                {sidebarContent}
              </div>
            </aside>
          )}
        </div>

        {/* Footer Content */}
        {showFooter && footerContent && (
          <div className="mt-12 pt-8 border-t">
            {footerContent}
          </div>
        )}
      </div>
    </div>
  );
};

// Pre-configured layout variants
export const HeroPageLayout: React.FC<Omit<StandardPageLayoutProps, 'variant' | 'background'>> = (props) => (
  <StandardPageLayout
    {...props}
    variant="hero"
    background="gradient"
    showHeader={true}
  />
);

export const DashboardPageLayout: React.FC<Omit<StandardPageLayoutProps, 'variant' | 'background'>> = (props) => (
  <StandardPageLayout
    {...props}
    variant="dashboard"
    background="default"
    showHeader={true}
    showFooter={false}
  />
);

export const MinimalPageLayout: React.FC<Omit<StandardPageLayoutProps, 'variant' | 'background'>> = (props) => (
  <StandardPageLayout
    {...props}
    variant="minimal"
    background="default"
    showHeader={true}
    showFooter={false}
  />
);

export default StandardPageLayout;
