import React, { ReactNode } from 'react';
import { UnifiedHeader } from './UnifiedHeader';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { useLayout } from '@/hooks/useLayout';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  showSidebar = true,
  showHeader = true,
  showFooter = true,
  className
}) => {
  const { sidebarOpen, isMobile } = useLayout();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      {showHeader && <UnifiedHeader />}
      
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
            showSidebar && !isMobile && sidebarOpen && "ml-64",
            showSidebar && !isMobile && !sidebarOpen && "ml-16",
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
