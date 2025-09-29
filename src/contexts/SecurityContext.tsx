import React from 'react';
import { SecurityManager } from '@/utils/securityUtils';

// Security context for React components
export const SecurityContext = React.createContext<{
  securityManager: SecurityManager;
}>({
  securityManager: new SecurityManager(),
});
