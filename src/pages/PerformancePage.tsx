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
