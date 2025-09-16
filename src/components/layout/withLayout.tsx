import React, { ComponentType } from 'react';
import { LayoutWrapper, LayoutType } from './LayoutWrapper';

interface WithLayoutOptions {
  layout?: LayoutType;
  protected?: boolean;
  showSidebar?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  sidebarContent?: React.ReactNode;
  className?: string;
}

export function withLayout<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithLayoutOptions = {}
) {
  const WithLayoutComponent: React.FC<P> = (props) => {
    return (
      <LayoutWrapper {...options}>
        <WrappedComponent {...props} />
      </LayoutWrapper>
    );
  };

  WithLayoutComponent.displayName = `withLayout(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithLayoutComponent;
}

// Convenience HOCs for common layouts
export const withMainLayout = <P extends object>(Component: ComponentType<P>) =>
  withLayout(Component, { layout: 'main', protected: true });

export const withSidebarLayout = <P extends object>(Component: ComponentType<P>) =>
  withLayout(Component, { layout: 'sidebar', protected: true });

export const withFullLayout = <P extends object>(Component: ComponentType<P>) =>
  withLayout(Component, { layout: 'full', protected: true });

export const withMinimalLayout = <P extends object>(Component: ComponentType<P>) =>
  withLayout(Component, { layout: 'minimal', protected: true });
