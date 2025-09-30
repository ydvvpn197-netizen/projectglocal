/**
 * Responsive Layout Component
 * Enhanced responsive layout wrapper with mobile-first design
 * Now uses the new MainLayout system for better structure
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useAuth } from '@/hooks/useAuth';
import { MainLayout } from '@/components/MainLayout';
import { MobileLayout } from '@/components/navigation/MobileBottomNavigation';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  showNewsFeed?: boolean;
  showRightSidebar?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  useMobileLayout?: boolean;
  showHeader?: boolean;
  showSidebar?: boolean;
  headerVariant?: 'default' | 'minimal' | 'glass';
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ 
  children, 
  className,
  showNewsFeed = false,
  showRightSidebar = false,
  maxWidth = 'xl',
  padding = 'md',
  useMobileLayout = true,
  showHeader = true,
  showSidebar = true,
  headerVariant = 'default'
}) => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const isTablet = useMediaQuery('(max-width: 768px)');
  const { user } = useAuth();
  
  // Use mobile layout for mobile devices
  if (isMobile && useMobileLayout && user) {
    return (
      <MobileLayout>
        <div className={cn(
          'w-full',
          'bg-background text-foreground',
          'mobile-safe-area',
          className
        )}>
          <div className="px-4 py-6">
            {children}
          </div>
        </div>
      </MobileLayout>
    );
  }

  // Use the main layout for desktop and tablet
  return (
    <MainLayout
      className={className}
      showHeader={showHeader}
      showSidebar={showSidebar && !!user}
      showRightSidebar={showRightSidebar}
      headerVariant={headerVariant}
      maxContentWidth={maxWidth}
      showNewsFeed={showNewsFeed}
    >
      {children}
    </MainLayout>
  );
};
