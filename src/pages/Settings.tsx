import React from 'react';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { ProfileSettings } from '@/components/ProfileSettings';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const Settings: React.FC = () => {
  return (
    <ResponsiveLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <ErrorBoundary>
            <ProfileSettings />
          </ErrorBoundary>
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default Settings;