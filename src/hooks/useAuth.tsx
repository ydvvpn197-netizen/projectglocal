import { useContext } from 'react';
import { AuthContext } from '@/components/auth/AuthContext';
import { AuthContextType } from '@/contexts/AuthContextTypes';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
