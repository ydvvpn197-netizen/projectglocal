/**
 * Authentication Context
 * Re-exports authentication context and hook from components/auth
 */

export { AuthContext, AuthContextType } from '@/components/auth/AuthContext';
export { useAuth } from '@/hooks/useAuth';

// Default export to satisfy Fast Refresh
const AuthContextModule = {
  AuthContext,
  AuthContextType,
  useAuth
};

export default AuthContextModule;
