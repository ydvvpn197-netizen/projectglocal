import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SPARouterProps {
  children: React.ReactNode;
}

/**
 * Component to handle SPA routing and initial path detection
 */
export const SPARouter: React.FC<SPARouterProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if we have an initial path from the SPA routing script
    if (window.__SPA_INITIAL_PATH__ && location.pathname === '/') {
      const initialPath = window.__SPA_INITIAL_PATH__;
      console.log('SPA Router: Redirecting to initial path:', initialPath);
      
      // Clear the initial path
      delete window.__SPA_INITIAL_PATH__;
      
      // Navigate to the intended path
      navigate(initialPath, { replace: true });
    }
  }, [navigate, location.pathname]);

  return <>{children}</>;
};

// Extend Window interface for SPA routing
declare global {
  interface Window {
    __SPA_INITIAL_PATH__?: string;
  }
}
