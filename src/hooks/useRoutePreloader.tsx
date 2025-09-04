import { useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

// Route preloading configuration
const ROUTE_PRELOAD_CONFIG = {
  // Immediate preload (when app loads)
  immediate: [
    '/feed',
    '/discover',
    '/community',
    '/events',
  ],
  // Preload on hover
  hover: {
    '/feed': ['/create', '/profile'],
    '/discover': ['/book-artist'],
    '/community': ['/community/create-discussion', '/community/create-group'],
    '/events': ['/create-event'],
    '/book-artist': ['/artist-dashboard'],
    '/profile': ['/settings'],
  },
  // Preload on specific actions
  action: {
    '/artist-dashboard': ['/messages', '/chat'],
    '/messages': ['/chat'],
  }
};

export const useRoutePreloader = () => {
  const location = useLocation();

  // Memoize the preloadRoute function to prevent infinite loops
  const preloadRoute = useMemo(() => {
    return (route: string) => {
      // Dynamic import for route preloading
      switch (route) {
        case '/feed':
          import('../pages/Feed');
          break;
        case '/discover':
          import('../pages/Discover');
          break;
        case '/community':
          import('../pages/Community');
          break;
        case '/events':
          import('../pages/Events');
          break;
        case '/book-artist':
          import('../pages/BookArtist');
          break;
        case '/profile':
          import('../pages/Profile');
          break;
        case '/settings':
          import('../pages/Settings');
          break;
        case '/messages':
          import('../pages/Messages');
          break;
        case '/chat':
          import('../pages/Chat');
          break;
        case '/create':
          import('../pages/CreatePost');
          break;
        case '/create-event':
          import('../pages/CreateEvent');
          break;
        case '/artist-dashboard':
          import('../pages/ArtistDashboard');
          break;
        case '/community/create-discussion':
          import('../pages/CreateDiscussion');
          break;
        case '/community/create-group':
          import('../pages/CreateGroup');
          break;
        default:
          break;
      }
    };
  }, []); // Empty dependency array to ensure it's only created once

  const preloadRelatedRoutes = useCallback((currentRoute: string) => {
    const relatedRoutes = ROUTE_PRELOAD_CONFIG.hover[currentRoute as keyof typeof ROUTE_PRELOAD_CONFIG.hover];
    if (relatedRoutes) {
      relatedRoutes.forEach(route => preloadRoute(route));
    }
  }, [preloadRoute]);

  // Preload immediate routes on mount - only run once
  useEffect(() => {
    ROUTE_PRELOAD_CONFIG.immediate.forEach(route => preloadRoute(route));
  }, [preloadRoute]); // Add preloadRoute dependency

  // Preload related routes when current route changes
  useEffect(() => {
    preloadRelatedRoutes(location.pathname);
  }, [location.pathname, preloadRelatedRoutes]);

  return {
    preloadRoute,
    preloadRelatedRoutes,
  };
};

// Hook for preloading on hover
export const useHoverPreload = (route: string) => {
  const { preloadRoute } = useRoutePreloader();

  const handleMouseEnter = useCallback(() => {
    preloadRoute(route);
  }, [route, preloadRoute]);

  return { handleMouseEnter };
};

// Hook for preloading on action
export const useActionPreload = (action: string) => {
  const { preloadRoute } = useRoutePreloader();

  const preloadActionRoutes = useCallback(() => {
    const actionRoutes = ROUTE_PRELOAD_CONFIG.action[action as keyof typeof ROUTE_PRELOAD_CONFIG.action];
    if (actionRoutes) {
      actionRoutes.forEach(route => preloadRoute(route));
    }
  }, [action, preloadRoute]);

  return { preloadActionRoutes };
};
