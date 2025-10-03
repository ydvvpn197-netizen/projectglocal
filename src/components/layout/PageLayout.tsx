import React, { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOptimizedLayout } from '@/hooks/useOptimizedLayout';
import { ConsolidatedHeader } from './ConsolidatedHeader';
import { ConsolidatedSidebar } from './ConsolidatedSidebar';
import { ConsolidatedFooter } from './ConsolidatedFooter';
import { MobileNavigation } from './MobileNavigation';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: ReactNode;
  variant?: 'main' | 'admin' | 'minimal';
  showHeader?: boolean;
  showSidebar?: boolean;
  showFooter?: boolean;
  showMobileNav?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  variant = 'main',
  showHeader,
  showSidebar,
  showFooter,
  showMobileNav,
  maxWidth = 'xl',
  padding = 'md',
  className
}) => {
  const { user, isLoading } = useAuth();
  const { layoutConfig, responsiveClasses, isMobile } = useOptimizedLayout({
    variant,
    showHeader,
    showSidebar,
    showFooter,
    showMobileNav,
    maxWidth,
    padding
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {layoutConfig.showHeader && (
        <ConsolidatedHeader />
      )}

      <div className="flex">
        {/* Sidebar */}
        {layoutConfig.showSidebar && !isMobile && (
          <ConsolidatedSidebar />
        )}

        {/* Main Content */}
        <main className={cn(
          'flex-1 min-h-screen',
          layoutConfig.showSidebar && !isMobile ? 'lg:ml-64' : '',
          layoutConfig.showMobileNav && isMobile ? 'pb-16' : '',
          responsiveClasses.content
        )}>
          <div className={cn(
            'mx-auto',
            responsiveClasses.container,
            className
          )}>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      {layoutConfig.showMobileNav && isMobile && (
        <MobileNavigation />
      )}

      {/* Footer */}
      {layoutConfig.showFooter && (
        <ConsolidatedFooter />
      )}
    </div>
  );
};
