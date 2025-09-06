// News page component for TheGlocal project
import React from 'react';
import { LocalNews } from '@/components/LocalNews';

export const News: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <LocalNews />
    </div>
  );
};