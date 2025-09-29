import React from 'react';
import { SecurityContext } from '@/contexts/SecurityContext';

// Hook to use security context
export function useSecurityContext() {
  const context = React.useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within a SecurityProvider');
  }
  return context;
}
