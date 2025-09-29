/**
 * Authentication Context
 * Re-exports authentication context and hook from components/auth
 */

// Re-export for convenience
export { AuthContext, AuthContextType } from '@/components/auth/AuthContext';
export { useAuth } from '@/hooks/useAuth';

// Default export to satisfy Fast Refresh
const AuthContextModule = () => null;
export default AuthContextModule;

