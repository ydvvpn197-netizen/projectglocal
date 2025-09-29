/**
 * Layout Context Provider
 * Wrapper component for layout context
 */

import React from 'react';
import { LayoutProvider } from './LayoutContext';

interface LayoutContextProviderProps {
  children: React.ReactNode;
}

export const LayoutContextProvider: React.FC<LayoutContextProviderProps> = ({ children }) => {
  return (
    <LayoutProvider>
      {children}
    </LayoutProvider>
  );
};

export default LayoutContextProvider;
