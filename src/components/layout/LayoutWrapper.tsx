import React, { ReactNode } from 'react';
import { PageLayout, LayoutType } from './PageLayout';
import { ProtectedPageLayout } from './ProtectedPageLayout';

interface LayoutWrapperProps {
  children: ReactNode;
  layout?: LayoutType;
  protected?: boolean;
  showSidebar?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  sidebarContent?: ReactNode;
  className?: string;
}

export const LayoutWrapper: React.FC<LayoutWrapperProps> = ({
  children,
  layout = 'main',
  protected: isProtected = false,
  showSidebar = true,
  showHeader = true,
  showFooter = true,
  sidebarContent,
  className
}) => {
  if (isProtected) {
    return (
      <ProtectedPageLayout
        layout={layout}
        showSidebar={showSidebar}
        showHeader={showHeader}
        showFooter={showFooter}
        sidebarContent={sidebarContent}
        className={className}
      >
        {children}
      </ProtectedPageLayout>
    );
  }

  return (
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
  );
};
