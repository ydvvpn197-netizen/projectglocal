import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { UserService } from '@/services/userService';

export interface UserRole {
  role: 'user' | 'artist' | null;
  isUser: boolean;
  isArtist: boolean;
  loading: boolean;
  error: string | null;
}

export const useUserRole = (): UserRole => {
  const { user } = useAuth();
  const [role, setRole] = useState<'user' | 'artist' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.id) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const userRole = await UserService.getUserRole(user.id);
        setRole(userRole);
      } catch (err) {
        console.error('Error fetching user role:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch user role');
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user?.id]);

  return {
    role,
    isUser: role === 'user',
    isArtist: role === 'artist',
    loading,
    error,
  };
};
