import React, { ReactNode } from 'react';
import { ConsolidatedHeader as Header } from './layout/ConsolidatedHeader';
import { ConsolidatedSidebar as Sidebar } from './layout/ConsolidatedSidebar';
import { ConsolidatedFooter as Footer } from './layout/ConsolidatedFooter';
import { RightSidebar } from './layout/RightSidebar';
import { SidebarProvider } from '@/components/ui/sidebarExports';
import { cn } from '@/lib/utils';
import { useLayout } from '@/hooks/useLayout';
import { useAuth } from '@/hooks/useAuth';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
  showHeader?: boolean;
  showSidebar?: boolean;
  showRightSidebar?: boolean;
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
  showRightSidebar = false,
  headerVariant = 'default',
  sidebarCollapsible = true,
  maxContentWidth = 'xl',
  showNewsFeed = true
}: MainLayoutProps) {
  const { user } = useAuth();
  const { sidebarOpen } = useLayout();
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const isTablet = useMediaQuery('(max-width: 768px)');
  const isDesktop = useMediaQuery('(min-width: 1280px)');

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-7xl',
    '2xl': 'max-w-[1600px]',
    full: 'max-w-full'
  };

  // Don't show sidebar on mobile if user is not authenticated
  const shouldShowSidebar = showSidebar && user && !isTablet;
  const shouldShowRightSidebar = showRightSidebar && user && isDesktop;

  return (
    <div className={cn(
      'min-h-screen bg-muted/20',
      'flex flex-col',
      className
    )}>
      {/* Header */}
      {showHeader && (
        <Header 
          variant={headerVariant}
          showNavigation={!shouldShowSidebar}
          showSearch={true}
          showNotifications={true}
          showUserMenu={true}
          showCreateButton={true}
        />
      )}

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        {shouldShowSidebar && (
          <SidebarProvider>
            <div className="fixed left-0 top-14 bottom-0 w-64 hidden lg:block z-30">
              <Sidebar 
                isOpen={sidebarOpen}
                isMobile={isMobile}
              />
            </div>
          </SidebarProvider>
        )}

        {/* Main Content */}
        <main className={cn(
          'flex-1',
          'w-full min-w-0',
          shouldShowSidebar && !isMobile && 'lg:ml-64'
        )}>
          {/* Center Content Area */}
          <div className={cn(
            'w-full h-full',
            shouldShowRightSidebar ? 'max-w-3xl' : maxWidthClasses[maxContentWidth],
            'px-4 sm:px-6 lg:px-8',
            'mx-auto'
          )}>
            <div className="py-6">
              {children}
            </div>
          </div>

          {/* Right Sidebar */}
          {shouldShowRightSidebar && (
            <div className="hidden xl:block w-80 flex-shrink-0">
              <div className="sticky top-20 pr-8 py-6">
                <RightSidebar />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
