import React from 'react';
import { useUserRole } from '@/hooks/useUserRole';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('user' | 'artist')[];
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallback = null,
  loading = <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
}) => {
  const { role, loading: roleLoading } = useUserRole();

  if (roleLoading) {
    return <>{loading}</>;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface ArtistOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ArtistOnly: React.FC<ArtistOnlyProps> = ({ children, fallback = null }) => {
  return (
    <RoleGuard allowedRoles={['artist']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
};

interface UserOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const UserOnly: React.FC<UserOnlyProps> = ({ children, fallback = null }) => {
  return (
    <RoleGuard allowedRoles={['user']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
};
