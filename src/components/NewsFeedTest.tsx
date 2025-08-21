import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from '@/hooks/useLocation';

export const NewsFeedTest = () => {
  const { currentLocation } = useLocation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>News Feed Test</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Current Location: {currentLocation ? `${currentLocation.latitude}, ${currentLocation.longitude}` : 'Unknown'}</p>
        <p>This is a placeholder news feed component.</p>
      </CardContent>
    </Card>
  );
};