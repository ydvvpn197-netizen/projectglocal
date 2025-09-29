import React, { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { useLayout } from '@/contexts/LayoutContext';
import { cn } from '@/lib/utils';

interface SidebarLayoutProps {
  children: ReactNode;
  sidebarContent?: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  headerVariant?: 'default' | 'minimal' | 'glass';
  showSearch?: boolean;
  showCreateButton?: boolean;
  showNotifications?: boolean;
  showUserMenu?: boolean;
  showNavigation?: boolean;
  className?: string;
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  children,
  sidebarContent,
  showHeader = false,
  showFooter = false,
  headerVariant = 'default',
  showSearch = true,
  showCreateButton = true,
  showNotifications = true,
  showUserMenu = true,
  showNavigation = true,
  className
}) => {
  const { sidebarOpen, isMobile } = useLayout();

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
          <div className="flex-1 overflow-auto">
            {children}
          </div>
          
          {/* Footer */}
          {showFooter && <Footer />}
        </main>
      </div>
    </div>
  );
};
