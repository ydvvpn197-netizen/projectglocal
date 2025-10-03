import React, { ReactNode, memo, Suspense } from 'react';
import { cn } from '@/lib/utils';
import { UnifiedContainer, UnifiedCard, UnifiedTypography } from '@/design-system/UnifiedDesignSystem';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface OptimizedPageProps {
  children: ReactNode;
  className?: string;
  
  // Header configuration
  title?: string;
  subtitle?: string;
  description?: string;
  showBackButton?: boolean;
  backButtonHref?: string;
  
  // Actions
  actions?: ReactNode;
  
  // Layout options
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'minimal' | 'hero';
  
  // Loading state
  isLoading?: boolean;
  loadingText?: string;
}

// Loading fallback component
const PageLoadingFallback = memo(({ text = "Loading..." }: { text?: string }) => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="flex flex-col items-center space-y-2">
      <Loader2 className="h-6 w-6 animate-spin" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  </div>
));

PageLoadingFallback.displayName = 'PageLoadingFallback';

export const OptimizedPage = memo<OptimizedPageProps>(({
  children,
  className,
  title,
  subtitle,
  description,
  showBackButton = false,
  backButtonHref = '/',
  actions,
  maxWidth = 'xl',
  padding = 'md',
  variant = 'default',
  isLoading = false,
  loadingText = "Loading content..."
}) => {
  if (isLoading) {
    return (
      <UnifiedContainer size={maxWidth} padding={padding} className={className}>
        <PageLoadingFallback text={loadingText} />
      </UnifiedContainer>
    );
  }

  // Minimal variant - just content
  if (variant === 'minimal') {
    return (
      <UnifiedContainer size={maxWidth} padding={padding} className={className}>
        {children}
      </UnifiedContainer>
    );
  }

  // Hero variant - full width with background
  if (variant === 'hero') {
    return (
      <div className={cn('min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100', className)}>
        <UnifiedContainer size={maxWidth} padding={padding} className="py-12">
          {showBackButton && (
            <Button variant="ghost" size="sm" asChild className="mb-6">
              <Link to={backButtonHref}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
          )}
          
          {title && (
            <UnifiedTypography variant="h1" className="mb-4">
              {title}
            </UnifiedTypography>
          )}
          
          {subtitle && (
            <UnifiedTypography variant="h2" className="mb-6 text-muted-foreground">
              {subtitle}
            </UnifiedTypography>
          )}
          
          {description && (
            <UnifiedTypography variant="lead" className="mb-8 max-w-2xl">
              {description}
            </UnifiedTypography>
          )}
          
          {actions && (
            <div className="flex flex-wrap gap-4 mb-8">
              {actions}
            </div>
          )}
          
          <Suspense fallback={<PageLoadingFallback />}>
            {children}
          </Suspense>
        </UnifiedContainer>
      </div>
    );
  }

  // Default variant - standard page layout
  return (
    <UnifiedContainer size={maxWidth} padding={padding} className={className}>
      <div className="space-y-6">
        {/* Header Section */}
        {(title || subtitle || description || showBackButton || actions) && (
          <div className="space-y-4">
            {showBackButton && (
              <Button variant="ghost" size="sm" asChild>
                <Link to={backButtonHref}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Link>
              </Button>
            )}
            
            {title && (
              <UnifiedTypography variant="h1">
                {title}
              </UnifiedTypography>
            )}
            
            {subtitle && (
              <UnifiedTypography variant="h2" className="text-muted-foreground">
                {subtitle}
              </UnifiedTypography>
            )}
            
            {description && (
              <UnifiedTypography variant="lead">
                {description}
              </UnifiedTypography>
            )}
            
            {actions && (
              <div className="flex flex-wrap gap-4">
                {actions}
              </div>
            )}
          </div>
        )}
        
        {/* Content Section */}
        <Suspense fallback={<PageLoadingFallback />}>
          {children}
        </Suspense>
      </div>
    </UnifiedContainer>
  );
});

OptimizedPage.displayName = 'OptimizedPage';
