import React, { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { useLayout } from '@/hooks/useLayout';
import { cn } from '@/lib/utils';

export type LayoutType = 'main' | 'sidebar' | 'full' | 'minimal';

interface MainLayoutProps {
  children: ReactNode;
  layout?: LayoutType;
  showSidebar?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  headerVariant?: 'default' | 'minimal' | 'glass';
  showSearch?: boolean;
  showCreateButton?: boolean;
  showNotifications?: boolean;
  showUserMenu?: boolean;
  showNavigation?: boolean;
  sidebarContent?: ReactNode;
  className?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  layout = 'main',
  showSidebar = true,
  showHeader = true,
  showFooter = true,
  headerVariant = 'default',
  showSearch = true,
  showCreateButton = true,
  showNotifications = true,
  showUserMenu = true,
  showNavigation = true,
  sidebarContent,
  className
}) => {
  const { sidebarOpen, isMobile } = useLayout();

  // Handle different layout types
  switch (layout) {
    case 'full':
      return (
        <div className={cn("min-h-screen bg-background", className)}>
          {children}
        </div>
      );
    
    case 'minimal':
      return (
        <div className={cn("min-h-screen bg-background flex flex-col", className)}>
          {showHeader && (
            <Header 
              variant={headerVariant}
              showSearch={showSearch}
              showCreateButton={showCreateButton}
              showNotifications={showNotifications}
              showUserMenu={showUserMenu}
              showNavigation={showNavigation}
            />
          )}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
          {showFooter && <Footer />}
        </div>
      );
    
    case 'sidebar':
      return (
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <Sidebar 
            isOpen={sidebarOpen}
            isMobile={isMobile}
            customContent={sidebarContent}
          />
          
          {/* Main Content */}
          <main 
            className={cn(
              "flex-1 flex flex-col overflow-hidden transition-all duration-300",
              !isMobile && sidebarOpen && "ml-64",
              !isMobile && !sidebarOpen && "ml-16",
              className
            )}
          >
            {children}
          </main>
        </div>
      );
    
    case 'main':
    default:
      return (
        <div className="min-h-screen bg-background flex flex-col">
          {/* Header */}
          {showHeader && (
            <Header 
              variant={headerVariant}
              showSearch={showSearch}
              showCreateButton={showCreateButton}
              showNotifications={showNotifications}
              showUserMenu={showUserMenu}
              showNavigation={showNavigation}
            />
          )}
          
          {/* Main Content Area */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            {showSidebar && (
              <Sidebar 
                isOpen={sidebarOpen}
                isMobile={isMobile}
                customContent={sidebarContent}
              />
            )}
            
            {/* Main Content */}
            <main 
              className={cn(
                "flex-1 flex flex-col overflow-hidden transition-all duration-300",
                showSidebar && !isMobile && sidebarOpen && "ml-64",
                showSidebar && !isMobile && !sidebarOpen && "ml-16",
                className
              )}
            >
              <div className="flex-1 overflow-auto px-1 py-1">
                {children}
              </div>
              
              {/* Footer */}
              {showFooter && <Footer />}
            </main>
          </div>
        </div>
      );
  }
};
