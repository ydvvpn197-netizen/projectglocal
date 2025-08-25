import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CommunityService } from '@/services/communityService';
import { PointsService } from '@/services/pointsService';
import { useAuth } from '@/hooks/useAuth';

interface TestResult {
  test: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  data?: any;
}

export const CommunityTestPanel: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const addResult = (test: string, status: 'success' | 'error' | 'pending', message: string, data?: any) => {
    setResults(prev => [...prev, { test, status, message, data }]);
  };

  const runAllTests = async () => {
    setIsLoading(true);
    setResults([]);

    try {
      // Test 1: Check if user is authenticated
      addResult('User Authentication', 'pending', 'Checking user authentication...');
      if (!user) {
        addResult('User Authentication', 'error', 'User not authenticated');
        return;
      }
      addResult('User Authentication', 'success', `User authenticated: ${user.email}`);

      // Test 2: Test leaderboard fetching
      addResult('Leaderboard Fetch', 'pending', 'Fetching leaderboard...');
      try {
        const leaderboard = await PointsService.getLeaderboard({ limit: 5 });
        addResult('Leaderboard Fetch', 'success', `Fetched ${leaderboard.length} leaderboard entries`, leaderboard);
      } catch (error: any) {
        addResult('Leaderboard Fetch', 'error', `Failed to fetch leaderboard: ${error.message}`);
      }

      // Test 3: Test community groups fetching
      addResult('Community Groups Fetch', 'pending', 'Fetching community groups...');
      try {
        const groups = await CommunityService.getGroups();
        addResult('Community Groups Fetch', 'success', `Fetched ${groups.length} community groups`, groups);
      } catch (error: any) {
        addResult('Community Groups Fetch', 'error', `Failed to fetch groups: ${error.message}`);
      }

      // Test 4: Test user groups fetching
      addResult('User Groups Fetch', 'pending', 'Fetching user groups...');
      try {
        const userGroups = await CommunityService.getUserGroups(user.id);
        addResult('User Groups Fetch', 'success', `User is member of ${userGroups.length} groups`, userGroups);
      } catch (error: any) {
        addResult('User Groups Fetch', 'error', `Failed to fetch user groups: ${error.message}`);
      }

      // Test 5: Test points system
      addResult('Points System', 'pending', 'Testing points system...');
      try {
        const userPoints = await PointsService.getUserPoints(user.id);
        addResult('Points System', 'success', `User has ${userPoints?.total_points || 0} points`, userPoints);
      } catch (error: any) {
        addResult('Points System', 'error', `Failed to get user points: ${error.message}`);
      }

      // Test 6: Test adding points
      addResult('Add Points', 'pending', 'Testing adding points...');
      try {
        const success = await PointsService.addPoints(user.id, 10, 'test', 'Test points addition');
        if (success) {
          addResult('Add Points', 'success', 'Successfully added 10 test points');
        } else {
          addResult('Add Points', 'error', 'Failed to add points');
        }
      } catch (error: any) {
        addResult('Add Points', 'error', `Failed to add points: ${error.message}`);
      }

    } catch (error: any) {
      addResult('General Error', 'error', `Unexpected error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Community Features Test Panel</span>
          <div className="flex gap-2">
            <Button 
              onClick={runAllTests} 
              disabled={isLoading}
              variant="default"
            >
              {isLoading ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            <Button 
              onClick={clearResults} 
              variant="outline"
              disabled={results.length === 0}
            >
              Clear Results
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {results.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Click "Run All Tests" to start testing community features
            </div>
          ) : (
            results.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{result.test}</h3>
                  <Badge className={getStatusColor(result.status)}>
                    {result.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                {result.data && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-blue-600">View Data</summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-32">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
