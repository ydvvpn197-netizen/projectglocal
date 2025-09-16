import React, { ReactNode } from 'react';
import { UnifiedHeader } from './UnifiedHeader';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { useLayout } from '@/hooks/useLayout';
import { cn } from '@/lib/utils';

interface UnifiedLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  headerVariant?: 'default' | 'minimal' | 'glass';
  showSearch?: boolean;
  showCreateButton?: boolean;
  showNotifications?: boolean;
  showUserMenu?: boolean;
  className?: string;
}

export const UnifiedLayout: React.FC<UnifiedLayoutProps> = ({
  children,
  showSidebar = true,
  showHeader = true,
  showFooter = true,
  headerVariant = 'default',
  showSearch = true,
  showCreateButton = true,
  showNotifications = true,
  showUserMenu = true,
  className
}) => {
  const { sidebarOpen, isMobile } = useLayout();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      {showHeader && (
        <UnifiedHeader 
          variant={headerVariant}
          showSearch={showSearch}
          showCreateButton={showCreateButton}
          showNotifications={showNotifications}
          showUserMenu={showUserMenu}
        />
      )}
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <Sidebar 
            isOpen={sidebarOpen}
            isMobile={isMobile}
          />
        )}
        
        {/* Main Content */}
        <main 
          className={cn(
            "flex-1 flex flex-col overflow-hidden transition-all duration-300",
            showSidebar && !isMobile && sidebarOpen && "ml-60",
            showSidebar && !isMobile && !sidebarOpen && "ml-14",
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
};
