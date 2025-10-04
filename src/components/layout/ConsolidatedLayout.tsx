import React, { ReactNode, memo, useMemo, Suspense, lazy } from 'react';
import { useLocation } from 'react-router-dom';
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
import { MobileLayout } from '@/components/MobileLayout';

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
  showHeader = true,
  showSidebar = true,
  showFooter = true,
  showMobileNav = true,
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 1024px)');

  // Detect if we're on an auth page
  const isAuthPage = useMemo(() => {
    const authRoutes = ['/auth', '/signin', '/signup', '/forgot-password', '/reset-password', '/auth/callback'];
    return authRoutes.includes(location.pathname) || location.pathname.startsWith('/auth');
  }, [location.pathname]);

  // Memoized responsive logic
  const layoutConfig = useMemo(() => {
    // For auth pages, use minimal layout
    if (isAuthPage) {
      return {
        shouldShowSidebar: false,
        shouldShowMobileNav: false,
        isMobile
      };
    }

    const shouldShowSidebar = showSidebar && !isMobile && variant !== 'minimal';
    const shouldShowMobileNav = showMobileNav && isMobile && user && variant !== 'admin';
    
    return {
      shouldShowSidebar,
      shouldShowMobileNav,
      isMobile
    };
  }, [showSidebar, showMobileNav, isMobile, user, variant, isAuthPage]);

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

  // Auth pages - render without any layout wrapper since they have their own full-screen layout
  if (isAuthPage) {
    return <>{children}</>;
  }

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
                <div className="max-w-7xl mx-auto">
                  <Suspense fallback={<div className="flex items-center justify-center min-h-[200px]">Loading content...</div>}>
                    {children}
                  </Suspense>
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
