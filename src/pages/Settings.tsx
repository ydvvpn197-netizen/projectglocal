import React from 'react';
import { ProfileSettings } from '@/components/ProfileSettings';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const Settings: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <ErrorBoundary>
          <ProfileSettings />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default Settings;