// Enhanced News page component for TheGlocal project
import React, { useState } from 'react';
import { ResponsiveLayout } from '../components/ResponsiveLayout';
import { LocalNews } from '../components/LocalNews';
import { NewsPreferences } from '../components/NewsPreferences';
import { Button } from '../components/ui/button';
import { Settings } from 'lucide-react';

const NewsContent: React.FC = () => {
  const [showPreferences, setShowPreferences] = useState(false);

  const handlePreferencesClick = () => {
    setShowPreferences(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Local News</h1>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handlePreferencesClick}
        >
          <Settings className="h-4 w-4 mr-2" />
          News Settings
        </Button>
      </div>
      
      <LocalNews />

      {/* Preferences Modal */}
      <NewsPreferences
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
      />
    </div>
  );
};

const News: React.FC = () => {
  return (
    <ResponsiveLayout showNewsFeed={false}>
      <NewsContent />
    </ResponsiveLayout>
  );
};

export default News;
