import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { ConsolidatedSidebar } from './ConsolidatedSidebar';
import { ConsolidatedHeader } from './ConsolidatedHeader';
import { ConsolidatedFooter } from './ConsolidatedFooter';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebarExports';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { NetworkStatus } from '@/components/NetworkStatus';
import { PromotionalBanner } from '@/components/marketing/PromotionalBanner';
import { SimpleNews } from '@/components/SimpleNews';
import { MobileLayout } from '@/components/navigation/MobileBottomNavigation';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface ConsolidatedLayoutProps {
  children: ReactNode;
  className?: string;
  
  // Layout configuration
  variant?: 'main' | 'admin' | 'project' | 'mobile';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  
  // Feature toggles
  showNewsFeed?: boolean;
  showHeader?: boolean;
  showSidebar?: boolean;
  showFooter?: boolean;
  showSearch?: boolean;
  showNotifications?: boolean;
  showUserMenu?: boolean;
  showCreateButton?: boolean;
  showMobileNavigation?: boolean;
  
  // Sidebar configuration
  sidebarCollapsible?: boolean;
  sidebarOpen?: boolean;
  onSidebarToggle?: () => void;
  
  // Project sidebar specific props
  categories?: string[];
  trendingProjects?: Array<{
    id: number;
    title: string;
    artist: string;
    image: string;
    likes: number;
  }>;
  onSearch?: (query: string) => void;
  onCategorySelect?: (category: string) => void;
  onProjectClick?: (projectId: number) => void;
}

export const ConsolidatedLayout: React.FC<ConsolidatedLayoutProps> = ({
  children,
  className,
  variant = 'main',
  maxWidth = 'xl',
  padding = 'md',
  showNewsFeed = true,
  showHeader = false,
  showSidebar = true,
  showFooter = false,
  showSearch = true,
  showNotifications = true,
  showUserMenu = true,
  showCreateButton = true,
  showMobileNavigation = true,
  sidebarCollapsible = true,
  sidebarOpen = true,
  onSidebarToggle,
  categories = [],
  trendingProjects = [],
  onSearch,
  onCategorySelect,
  onProjectClick,
}) => {
  const { user } = useAuth();
  const { adminUser } = useAdminAuth();
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const isTablet = useMediaQuery('(max-width: 768px)');

  // Determine if we should show sidebar
  const shouldShowSidebar = showSidebar && (variant !== 'mobile');
  
  // Determine if we should show mobile navigation
  const shouldShowMobileNav = showMobileNavigation && isMobile && user && variant !== 'admin';

  // Get max width classes
  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      case '2xl': return 'max-w-2xl';
      case 'full': return 'max-w-full';
      default: return 'max-w-7xl';
    }
  };

  // Get padding classes
  const getPaddingClass = () => {
    switch (padding) {
      case 'none': return '';
      case 'sm': return 'px-2 py-2';
      case 'md': return 'px-4 py-4';
      case 'lg': return 'px-6 py-6';
      default: return 'px-4 py-4';
    }
  };

  // Mobile layout with bottom navigation
  if (shouldShowMobileNav) {
    return (
      <MobileLayout>
        <div className={cn(
          'w-full min-h-screen',
          'bg-background text-foreground',
          'mobile-safe-area',
          className
        )}>
          {/* Network Status Alert */}
          <NetworkStatus />
          
          {/* Promotional Banner */}
          <PromotionalBanner 
            position="top" 
            variant="default" 
            maxCampaigns={1}
            className="z-40"
          />
          
          <div className={cn('w-full mx-auto', getMaxWidthClass(), getPaddingClass())}>
            {children}
          </div>
        </div>
      </MobileLayout>
    );
  }

  // Admin layout
  if (variant === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile sidebar toggle */}
        {isMobile && (
          <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSidebarToggle}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">
              Admin Panel
            </div>
          </div>
        )}

        <div className="flex">
          {/* Sidebar */}
          {shouldShowSidebar && (
            <div className="hidden lg:block">
              <ConsolidatedSidebar
                variant="admin"
                isOpen={sidebarOpen}
                isMobile={isMobile}
                showSearch={showSearch}
                showNotifications={showNotifications}
                showUserMenu={showUserMenu}
                showCreateButton={false}
              />
            </div>
          )}

          {/* Mobile sidebar overlay */}
          {isMobile && sidebarOpen && (
            <ConsolidatedSidebar
              variant="mobile"
              isOpen={sidebarOpen}
              isMobile={isMobile}
              showSearch={showSearch}
              showNotifications={showNotifications}
              showUserMenu={showUserMenu}
              showCreateButton={false}
            />
          )}

          {/* Main content */}
          <div className={cn(
            "flex-1 flex flex-col",
            !isMobile && shouldShowSidebar && "lg:ml-64"
          )}>
            <main className="flex-1 overflow-auto bg-background">
              <div className={cn(
                'w-full mx-auto',
                getMaxWidthClass(),
                getPaddingClass(),
                'pt-16 lg:pt-4'
              )}>
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  // Project layout with project sidebar
  if (variant === 'project') {
    return (
      <SidebarProvider>
        <div className="min-h-screen bg-background flex">
          {/* Network Status Alert */}
          <NetworkStatus />
          
          {/* Promotional Banner */}
          <PromotionalBanner 
            position="top" 
            variant="default" 
            maxCampaigns={1}
            className="z-40"
          />
          
          {/* Desktop Project Sidebar - Hidden on mobile */}
          {shouldShowSidebar && (
            <div className="hidden lg:block">
              <ConsolidatedSidebar
                variant="project"
                isOpen={sidebarOpen}
                isMobile={isMobile}
                categories={categories}
                trendingProjects={trendingProjects}
                onSearch={onSearch}
                onCategorySelect={onCategorySelect}
                onProjectClick={onProjectClick}
                showSearch={showSearch}
                showNotifications={showNotifications}
                showUserMenu={showUserMenu}
                showCreateButton={showCreateButton}
              />
            </div>
          )}

          {/* Main Content Area */}
          <SidebarInset className="flex-1">
            <main className="flex-1 overflow-auto bg-background">
              <div className={cn(
                'w-full mx-auto',
                getMaxWidthClass(),
                getPaddingClass(),
                'pt-16 lg:pt-4'
              )}>
                {showNewsFeed ? (
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Content Area */}
                    <div className="lg:col-span-3 min-h-0">
                      {children}
                    </div>
                    
                    {/* News Feed Sidebar - Only show on larger screens */}
                    <div className="hidden lg:block lg:col-span-1">
                      <div className="sticky top-6">
                        <SimpleNews className="max-h-[calc(100vh-3rem)] overflow-y-auto" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-7xl mx-auto">
                    {children}
                  </div>
                )}
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  // Main layout (default)
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Network Status Alert */}
        <NetworkStatus />
        
        {/* Promotional Banner */}
        <PromotionalBanner 
          position="top" 
          variant="default" 
          maxCampaigns={1}
          className="z-40"
        />
        
        {/* Header */}
        {showHeader && (
          <div className="sticky top-0 z-30">
            <ConsolidatedHeader
              variant="default"
              showSearch={showSearch}
              showCreateButton={showCreateButton}
              showNotifications={showNotifications}
              showUserMenu={showUserMenu}
              showNavigation={!shouldShowSidebar}
            />
          </div>
        )}
        
        {/* Main Content Area with Sidebar */}
        <div className="flex flex-1">
          {/* Mobile Navigation - Only show on mobile */}
          {shouldShowMobileNav && (
            <MobileLayout />
          )}
          
          {/* Desktop Sidebar - Hidden on mobile */}
          {shouldShowSidebar && (
            <div className="hidden lg:block">
              <ConsolidatedSidebar
                variant="main"
                isOpen={sidebarOpen}
                isMobile={isMobile}
                showSearch={showSearch}
                showNotifications={showNotifications}
                showUserMenu={showUserMenu}
                showCreateButton={showCreateButton}
              />
            </div>
          )}

          {/* Main Content Area */}
          <SidebarInset className="flex-1">
            <main className="flex-1 overflow-auto bg-background">
            <div className={cn(
              'w-full mx-auto',
              getMaxWidthClass(),
              getPaddingClass(),
              'pt-16 lg:pt-4'
            )}>
              {showNewsFeed ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Main Content Area */}
                  <div className="lg:col-span-3 min-h-0">
                    {children}
                  </div>
                  
                  {/* News Feed Sidebar - Only show on larger screens */}
                  <div className="hidden lg:block lg:col-span-1">
                    <div className="sticky top-6">
                      <SimpleNews className="max-h-[calc(100vh-3rem)] overflow-y-auto" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-7xl mx-auto">
                  {children}
                </div>
              )}
            </div>
          </main>
          
          {/* Footer */}
          {showFooter && (
            <ConsolidatedFooter
              variant="default"
              showNewsletter={true}
              showSocialLinks={true}
              showContactInfo={true}
              showQuickLinks={true}
              showLegalLinks={true}
            />
          )}
        </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ConsolidatedLayout;
