export interface LayoutContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  headerHeight: number;
  footerHeight: number;
  setHeaderHeight: (height: number) => void;
  setFooterHeight: (height: number) => void;
}
