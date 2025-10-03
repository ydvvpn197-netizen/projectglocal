import React, { ReactNode, memo, useMemo, Suspense, lazy } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebarExports';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// Import components directly to avoid circular dependencies
import { ConsolidatedSidebar } from './ConsolidatedSidebar';
import { ConsolidatedHeader } from './ConsolidatedHeader';
import { ConsolidatedFooter } from './ConsolidatedFooter';
import { NetworkStatus } from '@/components/NetworkStatus';
import { PromotionalBanner } from '@/components/marketing/PromotionalBanner';
import { LocalNews } from '@/components/LocalNews';
import { MobileLayout } from '@/components/navigation/MobileBottomNavigation';

interface ConsolidatedLayoutProps {
  children: ReactNode;
  className?: string;
  
  // Simplified layout configuration
  variant?: 'main' | 'admin' | 'minimal';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  
  // Essential feature toggles only
  showHeader?: boolean;
  showSidebar?: boolean;
  showFooter?: boolean;
  showMobileNav?: boolean;
}

export const ConsolidatedLayout = memo<ConsolidatedLayoutProps>(({
  children,
  className,
  variant = 'main',
  maxWidth = 'xl',
  padding = 'md',
  showHeader = false,
  showSidebar = true,
  showFooter = false,
  showMobileNav = true,
}) => {
  const { user } = useAuth();
  const isMobile = useMediaQuery('(max-width: 1024px)');

  // Memoized responsive logic
  const layoutConfig = useMemo(() => {
    const shouldShowSidebar = showSidebar && !isMobile && variant !== 'minimal';
    const shouldShowMobileNav = showMobileNav && isMobile && user && variant !== 'admin';
    
    return {
      shouldShowSidebar,
      shouldShowMobileNav,
      isMobile
    };
  }, [showSidebar, showMobileNav, isMobile, user, variant]);

  // Memoized style classes
  const styleClasses = useMemo(() => {
    const maxWidthMap = {
      sm: 'max-w-sm',
      md: 'max-w-md', 
      lg: 'max-w-lg',
      xl: 'max-w-7xl',
      full: 'max-w-full'
    };
    
    const paddingMap = {
      none: '',
      sm: 'px-3 py-3',
      md: 'px-4 py-4',
      lg: 'px-6 py-6'
    };
    
    return {
      maxWidth: maxWidthMap[maxWidth],
      padding: paddingMap[padding]
    };
  }, [maxWidth, padding]);

  // Mobile layout with bottom navigation
  if (layoutConfig.shouldShowMobileNav) {
    return (
      <div className={cn(
        'w-full min-h-screen bg-background text-foreground mobile-safe-area',
        className
      )}>
        <NetworkStatus />
        <PromotionalBanner position="top" variant="default" maxCampaigns={1} className="z-40" />
        
        <div className={cn('w-full mx-auto space-y-4', styleClasses.maxWidth, styleClasses.padding)}>
          {children}
        </div>
        
        <MobileLayout />
      </div>
    );
  }

  // Admin layout
  if (variant === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        {layoutConfig.isMobile && (
          <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm lg:hidden">
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">
              Admin Panel
            </div>
          </div>
        )}

        <div className="flex">
          {layoutConfig.shouldShowSidebar && (
            <div className="hidden lg:block">
              <ConsolidatedSidebar variant="admin" />
            </div>
          )}

          <div className={cn(
            "flex-1 flex flex-col",
            !layoutConfig.isMobile && layoutConfig.shouldShowSidebar && "lg:ml-64"
          )}>
            <main className="flex-1 overflow-auto bg-background">
              <div className={cn('w-full mx-auto pt-16 lg:pt-4', styleClasses.maxWidth, styleClasses.padding)}>
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  // Minimal layout
  if (variant === 'minimal') {
    return (
      <div className={cn('min-h-screen bg-background', className)}>
        <div className={cn('w-full mx-auto', styleClasses.maxWidth, styleClasses.padding)}>
          {children}
        </div>
      </div>
    );
  }

  // Main layout (default)
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <NetworkStatus />
        <PromotionalBanner position="top" variant="default" maxCampaigns={1} className="z-40" />
        
        {showHeader && (
          <div className="sticky top-0 z-30">
            <ConsolidatedHeader variant="default" />
          </div>
        )}
        
        <div className="flex flex-1">
          {layoutConfig.shouldShowMobileNav && <MobileLayout />}
          
          {layoutConfig.shouldShowSidebar && (
            <ConsolidatedSidebar variant="main" />
          )}

          <SidebarInset className="flex-1 min-w-0">
            <main className="flex-1 overflow-auto bg-background">
              <div className={cn('w-full pt-16 lg:pt-4 space-y-6', styleClasses.maxWidth, styleClasses.padding)}>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                  <div className="lg:col-span-3 min-h-0 space-y-4">
                    <Suspense fallback={<div className="flex items-center justify-center min-h-[200px]">Loading content...</div>}>
                      {children}
                    </Suspense>
                  </div>
                  
                  <div className="hidden lg:block lg:col-span-1">
                    <div className="sticky top-6">
                      <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-lg"></div>}>
                        <LocalNews className="max-h-[calc(100vh-3rem)] overflow-y-auto" />
                      </Suspense>
                    </div>
                  </div>
                </div>
              </div>
            </main>
            
            {showFooter && (
              <Suspense fallback={<div className="h-32 bg-muted animate-pulse"></div>}>
                <ConsolidatedFooter />
              </Suspense>
            )}
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
});

ConsolidatedLayout.displayName = 'ConsolidatedLayout';

export default ConsolidatedLayout;
