import React from 'react';
import { CommunityTestPanel } from '@/components/CommunityTestPanel';

export const CommunityTest: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Community Features Test</h1>
      <CommunityTestPanel />
    </div>
  );
};
