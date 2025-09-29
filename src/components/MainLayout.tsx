import React, { ReactNode } from 'react';
import { Header } from './layout/Header';
import { ConsolidatedSidebar as Sidebar } from './layout/ConsolidatedSidebar';
import { Footer } from './layout/Footer';
import { cn } from '@/lib/utils';
import { useLayout } from '@/contexts/LayoutContext';
import { useAuth } from '@/hooks/useAuth';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
  showHeader?: boolean;
  showSidebar?: boolean;
  showFooter?: boolean;
  headerVariant?: 'default' | 'minimal' | 'glass';
  sidebarCollapsible?: boolean;
  maxContentWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  showNewsFeed?: boolean;
}

export function MainLayout({
  children,
  className = '',
  showHeader = true,
  showSidebar = true,
  showFooter = true,
  headerVariant = 'default',
  sidebarCollapsible = true,
  maxContentWidth = 'xl',
  showNewsFeed = true
}: MainLayoutProps) {
  const { user } = useAuth();
  const { sidebarOpen } = useLayout();
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const isTablet = useMediaQuery('(max-width: 768px)');

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-7xl',
    '2xl': 'max-w-8xl',
    full: 'max-w-full'
  };

  // Don't show sidebar on mobile if user is not authenticated
  const shouldShowSidebar = showSidebar && user && !isTablet;

  return (
    <div className={cn(
      'min-h-screen bg-background',
      'flex flex-col',
      className
    )}>
      {/* Header */}
      {showHeader && (
        <Header 
          variant={headerVariant}
          showNavigation={!shouldShowSidebar}
        />
      )}

      {/* Main Content Area */}
      <div className={cn(
        'flex flex-1',
        'transition-all duration-300',
        shouldShowSidebar && !isMobile && (sidebarOpen ? 'lg:ml-64' : 'lg:ml-16')
      )}>
        {/* Sidebar */}
        {shouldShowSidebar && (
          <Sidebar 
            isOpen={sidebarOpen}
            isMobile={isMobile}
          />
        )}

        {/* Content Area */}
        <main className={cn(
          'flex-1 flex flex-col',
          'w-full min-w-0', // Prevents flex item from overflowing
          'bg-background'
        )}>
          {/* Page Content */}
          <div className={cn(
            'flex-1',
            'mx-auto w-full px-4 sm:px-6 lg:px-8',
            maxWidthClasses[maxContentWidth]
          )}>
            <div className="py-6">
              {children}
            </div>
          </div>

          {/* Footer */}
          {showFooter && (
            <Footer />
          )}
        </main>
      </div>
    </div>
  );
}
