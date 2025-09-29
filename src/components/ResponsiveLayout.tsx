/**
 * Responsive Layout Component
 * Enhanced responsive layout wrapper with mobile-first design
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { MobileLayout } from '@/components/navigation/MobileBottomNavigation';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  showNewsFeed?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  useMobileLayout?: boolean;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ 
  children, 
  className,
  showNewsFeed = false,
  maxWidth = 'xl',
  padding = 'md',
  useMobileLayout = true
}) => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  };

  const paddingClasses = {
    none: '',
    sm: 'px-2 sm:px-4',
    md: 'px-4 sm:px-6 lg:px-8',
    lg: 'px-6 sm:px-8 lg:px-12'
  };

  // Use mobile layout for mobile devices
  if (isMobile && useMobileLayout) {
    return (
      <MobileLayout>
        <div className={cn(
          'w-full',
          'bg-background text-foreground',
          'mobile-safe-area',
          className
        )}>
          <div className={cn(
            'mx-auto w-full',
            maxWidthClasses[maxWidth],
            paddingClasses[padding]
          )}>
            {children}
          </div>
        </div>
      </MobileLayout>
    );
  }

  // Desktop layout
  return (
    <div className={cn(
      'min-h-screen w-full',
      'bg-background text-foreground',
      'mobile-safe-area',
      className
    )}>
      <div className={cn(
        'mx-auto w-full',
        maxWidthClasses[maxWidth],
        paddingClasses[padding]
      )}>
        {children}
      </div>
    </div>
  );
};
