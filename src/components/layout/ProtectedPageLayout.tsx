import React, { ReactNode } from 'react';
import { PageLayout, LayoutType } from './PageLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface ProtectedPageLayoutProps {
  children: ReactNode;
  layout?: LayoutType;
  showSidebar?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  sidebarContent?: ReactNode;
  className?: string;
}

export const ProtectedPageLayout: React.FC<ProtectedPageLayoutProps> = ({
  children,
  layout = 'main',
  showSidebar = true,
  showHeader = true,
  showFooter = true,
  sidebarContent,
  className
}) => {
  return (
    <ProtectedRoute>
      <PageLayout
        layout={layout}
        showSidebar={showSidebar}
        showHeader={showHeader}
        showFooter={showFooter}
        sidebarContent={sidebarContent}
        className={className}
      >
        {children}
      </PageLayout>
    </ProtectedRoute>
  );
};
