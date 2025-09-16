import React from 'react';
import { CivicEngagementDashboard } from '@/components/CivicEngagementDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';

export const CivicEngagementTest: React.FC = () => {
  return (
    <ResponsiveLayout showNewsFeed={false}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Integration Complete
            </Badge>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Civic Engagement Features - Integration Test</CardTitle>
              <CardDescription>
                All civic engagement features have been successfully integrated into your app.
                This page demonstrates the complete functionality.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl mb-2">🔒</div>
                  <h3 className="font-medium">Anonymous Username System</h3>
                  <p className="text-sm text-gray-500">Reddit-style usernames with privacy levels</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl mb-2">🛡️</div>
                  <h3 className="font-medium">Enhanced Privacy Controls</h3>
                  <p className="text-sm text-gray-500">Granular privacy settings and anonymous mode</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl mb-2">🗳️</div>
                  <h3 className="font-medium">Government Polls</h3>
                  <p className="text-sm text-gray-500">Authority-tagged polls with response tracking</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl mb-2">📢</div>
                  <h3 className="font-medium">Virtual Protests</h3>
                  <p className="text-sm text-gray-500">Community mobilization with impact tracking</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <CivicEngagementDashboard />
      </div>
    </ResponsiveLayout>
  );
};
