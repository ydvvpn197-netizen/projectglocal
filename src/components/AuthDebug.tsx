import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export const AuthDebug = () => {
  const { user, session, loading, clearAuthData } = useAuth();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="space-y-1 mb-3">
        <div>Loading: {loading ? 'true' : 'false'}</div>
        <div>User: {user ? 'exists' : 'null'}</div>
        <div>Session: {session ? 'exists' : 'null'}</div>
        {user && (
          <div>User ID: {user.id}</div>
        )}
        {user?.email && (
          <div>Email: {user.email}</div>
        )}
      </div>
      <Button 
        size="sm" 
        variant="destructive" 
        onClick={clearAuthData}
        className="w-full text-xs"
      >
        Clear Auth Data
      </Button>
    </div>
  );
};
