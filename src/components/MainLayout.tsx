import React from 'react';
import { ConsolidatedLayout } from '@/components/layout/ConsolidatedLayout';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
  showNewsFeed?: boolean;
}

export function MainLayout({ children, showNewsFeed = true }: MainLayoutProps) {
  return (
    <ConsolidatedLayout
      variant="main"
      showNewsFeed={showNewsFeed}
      showSidebar={true}
      showMobileNavigation={true}
      maxWidth="full"
      padding="lg"
    >
      {children}
    </ConsolidatedLayout>
  );
}
