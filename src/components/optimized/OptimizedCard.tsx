import React, { ReactNode, memo } from 'react';
import { cn } from '@/lib/utils';
import { UnifiedCard, UnifiedTypography } from '@/design-system/UnifiedDesignSystem';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface OptimizedCardProps {
  children: ReactNode;
  className?: string;
  
  // Header configuration
  title?: string;
  subtitle?: string;
  description?: string;
  
  // Actions
  actions?: ReactNode;
  headerActions?: ReactNode;
  
  // Status and badges
  status?: 'default' | 'success' | 'warning' | 'error';
  badges?: Array<{
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  }>;
  
  // Layout options
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  showHeader?: boolean;
  showFooter?: boolean;
  
  // Interactive states
  clickable?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export const OptimizedCard = memo<OptimizedCardProps>(({
  children,
  className,
  title,
  subtitle,
  description,
  actions,
  headerActions,
  status = 'default',
  badges = [],
  variant = 'default',
  padding = 'md',
  showHeader = true,
  showFooter = false,
  clickable = false,
  onClick,
  disabled = false
}) => {
  const getStatusClasses = () => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50/50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50/50';
      case 'error':
        return 'border-red-200 bg-red-50/50';
      default:
        return '';
    }
  };

  const getClickableClasses = () => {
    if (!clickable || disabled) return '';
    return 'cursor-pointer hover:shadow-md transition-shadow duration-200 hover:scale-[1.02] active:scale-[0.98]';
  };

  const handleClick = () => {
    if (clickable && !disabled && onClick) {
      onClick();
    }
  };

  return (
    <UnifiedCard
      variant={variant}
      padding="none"
      className={cn(
        getStatusClasses(),
        getClickableClasses(),
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={handleClick}
    >
      {/* Header */}
      {showHeader && (title || subtitle || description || headerActions || badges.length > 0) && (
        <div className="p-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {title && (
                <UnifiedTypography variant="h4" className="mb-1">
                  {title}
                </UnifiedTypography>
              )}
              
              {subtitle && (
                <UnifiedTypography variant="h6" className="text-muted-foreground mb-2">
                  {subtitle}
                </UnifiedTypography>
              )}
              
              {description && (
                <UnifiedTypography variant="body-sm" className="text-muted-foreground mb-3">
                  {description}
                </UnifiedTypography>
              )}
              
              {badges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {badges.map((badge, index) => (
                    <Badge key={index} variant={badge.variant || 'secondary'}>
                      {badge.label}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            {headerActions && (
              <div className="flex items-center space-x-2 ml-4">
                {headerActions}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className={cn(
        'flex-1',
        padding === 'none' ? '' : `p-${padding === 'sm' ? '3' : padding === 'md' ? '4' : padding === 'lg' ? '6' : '8'}`
      )}>
        {children}
      </div>
      
      {/* Footer */}
      {showFooter && actions && (
        <>
          <Separator />
          <div className="p-4">
            <div className="flex items-center justify-end space-x-2">
              {actions}
            </div>
          </div>
        </>
      )}
    </UnifiedCard>
  );
});

OptimizedCard.displayName = 'OptimizedCard';
