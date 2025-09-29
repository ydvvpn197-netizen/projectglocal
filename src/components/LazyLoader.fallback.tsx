import React from 'react';

// Default loading fallback component
export const DefaultFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
    <span className="ml-2">Loading...</span>
  </div>
);
