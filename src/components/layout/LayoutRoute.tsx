import React, { ReactNode } from 'react';
import { LayoutWrapper } from './LayoutWrapper';
import { LayoutType } from './PageLayout';

interface LayoutRouteProps {
  children: ReactNode;
  layout?: LayoutType;
  protected?: boolean;
  showSidebar?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  sidebarContent?: ReactNode;
  className?: string;
}

export const LayoutRoute: React.FC<LayoutRouteProps> = ({
  children,
  layout = 'main',
  protected: isProtected = true,
  showSidebar = true,
  showHeader = true,
  showFooter = true,
  sidebarContent,
  className
}) => {
  return (
    <LayoutWrapper
      layout={layout}
      protected={isProtected}
      showSidebar={showSidebar}
      showHeader={showHeader}
      showFooter={showFooter}
      sidebarContent={sidebarContent}
      className={className}
    >
      {children}
    </LayoutWrapper>
  );
};
