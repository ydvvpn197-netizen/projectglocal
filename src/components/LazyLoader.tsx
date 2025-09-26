/**
 * Lazy Loader Component
 * Loading component for lazy-loaded content
 */

import React from 'react';

export const LazyLoader: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
};
