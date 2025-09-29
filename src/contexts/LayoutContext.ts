import { createContext } from 'react';

export interface LayoutContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

// Re-export LayoutProvider and useLayout from LayoutContext.tsx
export { LayoutProvider, useLayout } from './LayoutContext.tsx';