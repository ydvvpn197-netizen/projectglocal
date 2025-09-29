/**
 * Page Layout Component
 * Wrapper for individual pages with consistent spacing and structure
 */

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonHref?: string;
  actions?: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  variant?: 'default' | 'centered' | 'full-width';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  description,
  showBackButton = false,
  backButtonText = 'Back',
  backButtonHref,
  actions,
  className = '',
  headerClassName = '',
  contentClassName = '',
  variant = 'default',
  padding = 'md'
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backButtonHref) {
      navigate(backButtonHref);
    } else {
      navigate(-1);
    }
  };

  const paddingClasses = {
    none: '',
    sm: 'px-4 py-6',
    md: 'px-6 py-8',
    lg: 'px-8 py-12'
  };

  const variantClasses = {
    default: '',
    centered: 'flex flex-col items-center justify-center min-h-[60vh]',
    'full-width': 'w-full'
  };

  return (
    <div className={cn(
      'w-full',
      variantClasses[variant],
      className
    )}>
      {/* Page Header */}
      {(title || description || showBackButton || actions) && (
        <div className={cn(
          'mb-6',
          headerClassName
        )}>
          {/* Back Button */}
          {showBackButton && (
            <div className="mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {backButtonText}
              </Button>
            </div>
          )}

          {/* Title and Description */}
          {(title || description) && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="space-y-2">
                {title && (
                  <h1 className="text-3xl font-bold tracking-tight">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-muted-foreground text-lg">
                    {description}
                  </p>
                )}
              </div>
              
              {/* Actions */}
              {actions && (
                <div className="flex items-center gap-2">
                  {actions}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Page Content */}
      <div className={cn(
        'w-full',
        paddingClasses[padding],
        contentClassName
      )}>
        {children}
      </div>
    </div>
  );
};
