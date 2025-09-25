/**
 * Mobile Bottom Navigation Component
 * Navigation for mobile devices
 */

import React from 'react';

export const MobileLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
};