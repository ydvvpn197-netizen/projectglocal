import React, { ReactNode, memo } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { NetworkStatus } from '@/components/NetworkStatus';
import { PromotionalBanner } from '@/components/marketing/PromotionalBanner';
import { OptimizedSidebar } from './OptimizedSidebar';
import { OptimizedHeader } from './OptimizedHeader';
import { OptimizedFooter } from './OptimizedFooter';
import { MobileNavigation } from './MobileNavigation';

// Simplified layout variants
type LayoutVariant = 'main' | 'admin' | 'minimal';

interface OptimizedLayoutProps {
  children: ReactNode;
  className?: string;
  variant?: LayoutVariant;
  showSidebar?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  showMobileNav?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

// Memoized layout component for better performance
export const OptimizedLayout = memo<OptimizedLayoutProps>(({
  children,
  className,
  variant = 'main',
  showSidebar = true,
  showHeader = false,
  showFooter = false,
  showMobileNav = true,
  maxWidth = 'xl',
  padding = 'md'
}) => {
  const { user } = useAuth();
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const isTablet = useMediaQuery('(max-width: 768px)');

  // Responsive layout logic
  const shouldShowSidebar = showSidebar && !isMobile && variant !== 'minimal';
  const shouldShowMobileNav = showMobileNav && isMobile && user && variant !== 'admin';

  // Get responsive classes
  const getMaxWidthClass = () => {
    const classes = {
      sm: 'max-w-sm',
      md: 'max-w-md', 
      lg: 'max-w-lg',
      xl: 'max-w-7xl',
      full: 'max-w-full'
    };
    return classes[maxWidth];
  };

  const getPaddingClass = () => {
    const classes = {
      none: '',
      sm: 'px-3 py-3',
      md: 'px-4 py-4',
      lg: 'px-6 py-6'
    };
    return classes[padding];
  };

  // Mobile layout
  if (shouldShowMobileNav) {
    return (
      <div className={cn('min-h-screen bg-background', className)}>
        <NetworkStatus />
        <PromotionalBanner position="top" variant="default" maxCampaigns={1} />
        
        <div className={cn('w-full mx-auto', getMaxWidthClass(), getPaddingClass())}>
          {children}
        </div>
        
        <MobileNavigation />
      </div>
    );
  }

  // Admin layout
  if (variant === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <NetworkStatus />
        
        <div className="flex">
          {shouldShowSidebar && <OptimizedSidebar variant="admin" />}
          
          <div className={cn('flex-1', shouldShowSidebar && 'lg:ml-64')}>
            <main className="min-h-screen">
              <div className={cn('w-full mx-auto', getMaxWidthClass(), getPaddingClass())}>
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  // Main layout
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      <NetworkStatus />
      <PromotionalBanner position="top" variant="default" maxCampaigns={1} />
      
      {showHeader && <OptimizedHeader />}
      
      <div className="flex">
        {shouldShowSidebar && <OptimizedSidebar variant="main" />}
        
        <div className={cn('flex-1', shouldShowSidebar && 'lg:ml-64')}>
          <main className="min-h-screen">
            <div className={cn('w-full mx-auto', getMaxWidthClass(), getPaddingClass())}>
              {children}
            </div>
          </main>
          
          {showFooter && <OptimizedFooter />}
        </div>
      </div>
    </div>
  );
});

OptimizedLayout.displayName = 'OptimizedLayout';
