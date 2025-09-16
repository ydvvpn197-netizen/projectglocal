import React, { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useLayout } from '@/hooks/useLayout';
import { cn } from '@/lib/utils';

interface SidebarLayoutProps {
  children: ReactNode;
  sidebarContent?: ReactNode;
  className?: string;
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  children,
  sidebarContent,
  className
}) => {
  const { sidebarOpen, isMobile } = useLayout();

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
};
