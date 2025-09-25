/**
 * Authentication Hook
 * Provides authentication state and methods
 */

import { useContext } from 'react';
import { AuthContext } from '@/components/auth/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
