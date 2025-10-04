import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

/**
 * DashboardRouter Component
 * 
 * This component determines the user type and redirects to the appropriate dashboard:
 * - Artists -> /artist-dashboard
 * - Regular users -> /dashboard
 * - Admins -> /admin (if they have admin permissions)
 * 
 * This provides a unified entry point for dashboard navigation
 */
export const DashboardRouter: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const determineDashboardRoute = async () => {
      if (!user) {
        navigate('/signin');
        return;
      }

      try {
        // Check if user is an artist
        const { data: artistData, error: artistError } = await supabase
          .from('artists')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (artistData && !artistError) {
          // User is an artist, redirect to artist dashboard
          navigate('/artist?view=dashboard', { replace: true });
          return;
        }

        // Check if user has admin role
        const { data: roleData, error: roleError } = await supabase
          .from('roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (roleData && !roleError && ['admin', 'super_admin'].includes(roleData.role)) {
          // User has admin permissions, redirect to admin dashboard
          navigate('/admin', { replace: true });
          return;
        }

        // Default to regular user dashboard
        navigate('/dashboard', { replace: true });

      } catch (error) {
        console.error('Error determining dashboard route:', error);
        // Fallback to regular user dashboard
        navigate('/dashboard', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    determineDashboardRoute();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Loading Dashboard...</h2>
          <p className="text-muted-foreground">
            Determining the best dashboard for you
          </p>
        </div>
      </div>
    );
  }

  return null; // This component only handles routing, no UI to render
};

export default DashboardRouter;
