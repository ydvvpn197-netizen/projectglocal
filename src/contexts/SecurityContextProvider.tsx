import React from 'react';
import { SecurityContext } from './SecurityContext';
import { SecurityManager } from '@/utils/securityUtils';

// Security provider component
export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const securityManager = new SecurityManager();
  
  return (
    <SecurityContext.Provider value={{ securityManager }}>
      {children}
    </SecurityContext.Provider>
  );
}
