import { createContext } from 'react';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName?: string, lastName?: string, userType?: 'user' | 'artist') => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithOAuth: (provider: 'google' | 'facebook') => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ error: Error | null }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ error: Error | null }>;
  clearAuthData: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
