// News page component for TheGlocal project
import React from 'react';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { SimpleNews } from '@/components/SimpleNews';

const News: React.FC = () => {
  return (
    <ResponsiveLayout showNewsFeed={false}>
      <SimpleNews />
    </ResponsiveLayout>
  );
};

export default News;