import React, { useState, useEffect } from 'react';
import { MainLayout } from './MainLayout';
import { MobileLayout } from './MobileLayout';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      // Use 1024px as the breakpoint (lg in Tailwind)
      setIsMobile(window.innerWidth < 1024);
    };

    // Check on mount
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Use mobile layout for screens smaller than lg (1024px)
  if (isMobile) {
    return <MobileLayout>{children}</MobileLayout>;
  }

  // Use desktop layout for larger screens
  return <MainLayout>{children}</MainLayout>;
}
