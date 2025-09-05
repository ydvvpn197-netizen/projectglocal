import React, { useState, useEffect } from 'react';
import { MainLayout } from './MainLayout';
import { MobileLayout } from './MobileLayout';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
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
    <MainLayout>{children}</MainLayout>
  );
}

export { ResponsiveLayout };
export default ResponsiveLayout;
