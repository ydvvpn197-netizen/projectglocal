import { lazy, ComponentType } from 'react';

// Retry function for failed imports
const retry = (fn: () => Promise<any>, retriesLeft = 3, interval = 1000): Promise<any> => {
  return new Promise((resolve, reject) => {
    fn()
      .then(resolve)
      .catch((error) => {
        setTimeout(() => {
          if (retriesLeft === 1) {
            reject(error);
            return;
          }
          retry(fn, retriesLeft - 1, interval).then(resolve, reject);
        }, interval);
      });
  });
};

// Enhanced lazy import with retry logic
export const lazyImport = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  retries = 3
) => {
  return lazy(() => retry(importFunc, retries));
};

// Preload function for critical components
export const preloadComponent = (importFunc: () => Promise<any>) => {
  const Component = lazy(importFunc);
  // Trigger the import
  importFunc();
  return Component;
};

// Route-based preloading
export const preloadRoute = (route: string) => {
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
    default:
      break;
  }
};
