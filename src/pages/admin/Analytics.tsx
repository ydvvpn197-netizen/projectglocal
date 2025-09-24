import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Simple placeholder page to avoid type errors while enabling routing
export default function Analytics() {
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Analytics dashboard is coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
