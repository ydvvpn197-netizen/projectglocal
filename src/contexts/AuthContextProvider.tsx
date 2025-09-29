/**
 * Authentication Context Provider
 * Wrapper component for authentication context
 */

import React from 'react';
import { AuthContext, AuthContextType } from '@/components/auth/AuthContext';
import { useAuth } from '@/hooks/useAuth';

interface AuthContextProviderProps {
  children: React.ReactNode;
}

export const AuthContextProvider: React.FC<AuthContextProviderProps> = ({ children }) => {
  const authValue = useAuth();
  
  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
