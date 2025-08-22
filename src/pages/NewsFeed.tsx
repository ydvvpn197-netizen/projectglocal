import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Simple placeholder page to satisfy routing until full feature is ready
export default function NewsFeed() {
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>News Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <p>News feed is coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
