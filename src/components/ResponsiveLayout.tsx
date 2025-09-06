import React, { useState, useEffect } from 'react';
import { MainLayout } from './MainLayout';
import { MobileLayout } from './MobileLayout';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  showNewsFeed?: boolean;
}

function ResponsiveLayout({ children, showNewsFeed = true }: ResponsiveLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Initial check
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  return isMobile ? (
    <MobileLayout>{children}</MobileLayout>
  ) : (
    <MainLayout showNewsFeed={showNewsFeed}>{children}</MainLayout>
  );
}

export { ResponsiveLayout };
export default ResponsiveLayout;
