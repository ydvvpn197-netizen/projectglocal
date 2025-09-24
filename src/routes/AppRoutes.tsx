/**
 * App Routes Component
 * Main routing configuration
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<div className="p-8">Welcome to TheGlocal</div>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};