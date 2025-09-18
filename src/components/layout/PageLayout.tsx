import React, { ReactNode } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { SidebarLayout } from './SidebarLayout';
import { cn } from '@/lib/utils';

export type LayoutType = 'main' | 'sidebar' | 'full' | 'minimal';

interface PageLayoutProps {
  children: ReactNode;
  layout?: LayoutType;
  showSidebar?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  sidebarContent?: ReactNode;
  className?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  layout = 'main',
  showSidebar = true,
  showHeader = true,
  showFooter = true,
  sidebarContent,
  className
}) => {
  switch (layout) {
    case 'sidebar':
      return (
        <SidebarLayout 
          sidebarContent={sidebarContent}
          className={className}
        >
          {children}
        </SidebarLayout>
      );
    
    case 'full':
      return (
        <div className={cn("min-h-screen bg-background", className)}>
          {children}
        </div>
      );
    
    case 'minimal':
      return (
        <div className={cn("min-h-screen bg-background flex flex-col", className)}>
          {children}
        </div>
      );
    
    case 'main':
    default:
      return (
        <MainLayout showNewsFeed={true}>
          {children}
        </MainLayout>
      );
  }
};
