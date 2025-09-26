import { useContext } from 'react';
import { AuthContext } from '@/components/auth/AuthContext';
import { AuthContextType } from '@/components/auth/AuthContext';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Check if we're in development mode and provide more helpful error
    if (import.meta.env.DEV) {
      console.error('useAuth must be used within an AuthProvider. Make sure your component is wrapped in <AuthProvider>.');
      console.error('Current component stack:', new Error().stack);
    }
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
