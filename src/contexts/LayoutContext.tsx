import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LayoutContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

interface LayoutProviderProps {
  children: ReactNode;
}

const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Handle responsive breakpoints
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const value: LayoutContextType = {
    sidebarOpen,
    toggleSidebar,
    setSidebarOpen,
    isMobile,
    isTablet,
    isDesktop,
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

export { LayoutProvider };
