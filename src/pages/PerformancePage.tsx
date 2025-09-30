/**
 * @internal Test/Demo page
 * This page is for testing and demonstration purposes.
 * Should be moved to /dev route behind feature flag.
 * Not for production use.
 */

import React from 'react';
import { PerformanceDashboard } from '@/components/PerformanceDashboard';

const PerformancePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PerformanceDashboard />
    </div>
  );
};

export default PerformancePage;
