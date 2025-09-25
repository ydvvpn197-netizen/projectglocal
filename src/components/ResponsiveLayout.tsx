/**
 * Responsive Layout Component
 * Responsive layout wrapper
 */

import React from 'react';

export const ResponsiveLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
};