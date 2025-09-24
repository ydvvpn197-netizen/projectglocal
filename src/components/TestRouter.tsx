import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { 
  getSupabaseStatus, 
  testSupabaseConnection, 
  forceReconnection,
  getConnectionStatus,
  getRetryCount,
  getNetworkStatus
} from '@/integrations/supabase/client';
import { handleError, handleAuthError, handleApiError } from '@/services/errorHandlingService';
import ConnectionStatus from './ConnectionStatus';

// Define proper types for test results
interface TestResults {
  supabaseStatus?: Awaited<ReturnType<typeof getSupabaseStatus>>;
  connectionTest?: boolean;
  networkStatus?: ReturnType<typeof getNetworkStatus>;
  connectionStatus?: ReturnType<typeof getConnectionStatus>;
  retryCount?: number;
  timestamp?: string;
  forceReconnection?: boolean;
  errorHandling?: {
    general: { recovered: boolean; fallbackValue?: unknown };
    auth: { recovered: boolean; shouldRetry: boolean };
    api: { recovered: boolean; shouldRetry: boolean; retryDelay?: number };
  };
  error?: string;
  forceReconnectionError?: string;
  errorHandlingError?: string;
}

/**
 * Test Router Component
 * Provides testing tools for error handling and connection status
 */
const TestRouter: React.FC = () => {
  const { user, connectionStatus, isOnline } = useAuth();
  const [testResults, setTestResults] = useState<TestResults>({});
  const [isLoading, setIsLoading] = useState(false);

  const runConnectionTest = async () => {
    setIsLoading(true);
    try {
      const status = await getSupabaseStatus();
      const connectionTest = await testSupabaseConnection();
      const networkStatus = getNetworkStatus();
      
      setTestResults({
        supabaseStatus: status,
        connectionTest,
        networkStatus,
        connectionStatus: getConnectionStatus(),
        retryCount: getRetryCount(),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Connection test failed:', error);
      setTestResults({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsLoading(false);
    }
  };

  const testForceReconnection = async () => {
    setIsLoading(true);
    try {
      const result = await forceReconnection();
      setTestResults(prev => ({
        ...prev,
        forceReconnection: result,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Force reconnection failed:', error);
      setTestResults(prev => ({
        ...prev,
        forceReconnectionError: error instanceof Error ? error.message : 'Unknown error'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const testErrorHandling = async () => {
    setIsLoading(true);
    try {
      // Test general error handling
      const generalError = await handleError(new Error('Test general error'), {
        context: 'Test',
        showToast: false
      });

      // Test auth error handling
      const authError = await handleAuthError(new Error('Test auth error'));

      // Test API error handling
      const apiError = await handleApiError(new Error('Test API error'));

      setTestResults(prev => ({
        ...prev,
        errorHandling: {
          general: generalError,
          auth: authError,
          api: apiError
        },
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error handling test failed:', error);
      setTestResults(prev => ({
        ...prev,
        errorHandlingError: error instanceof Error ? error.message : 'Unknown error'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const simulateError = () => {
    throw new Error('This is a simulated error to test the ErrorBoundary');
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧪 Test Router & Error Handling
          </CardTitle>
          <CardDescription>
            Test various error handling scenarios and connection status
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Current Status Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Connection Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ConnectionStatus />
                <div className="mt-2 space-y-1 text-sm">
                  <div>User: {user ? user.email : 'Not signed in'}</div>
                  <div>Network: {isOnline ? 'Online' : 'Offline'}</div>
                  <div>Status: {connectionStatus}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  onClick={runConnectionTest} 
                  disabled={isLoading}
                  className="w-full"
                  variant="outline"
                >
                  {isLoading ? 'Testing...' : 'Test Connection'}
                </Button>
                
                <Button 
                  onClick={testForceReconnection} 
                  disabled={isLoading}
                  className="w-full"
                  variant="outline"
                >
                  {isLoading ? 'Reconnecting...' : 'Force Reconnect'}
                </Button>
                
                <Button 
                  onClick={testErrorHandling} 
                  disabled={isLoading}
                  className="w-full"
                  variant="outline"
                >
                  {isLoading ? 'Testing...' : 'Test Error Handling'}
                </Button>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Test Results */}
          {Object.keys(testResults).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test Results</CardTitle>
                <CardDescription>
                  Results from the latest tests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-xs">
                  {JSON.stringify(testResults, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Error Boundary Test */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Error Boundary Test</CardTitle>
              <CardDescription>
                Test the ErrorBoundary component by simulating an error
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={simulateError}
                variant="destructive"
                className="w-full"
              >
                🚨 Simulate Error (Test ErrorBoundary)
              </Button>
              <p className="text-xs text-gray-600 mt-2">
                This will trigger the ErrorBoundary to catch and display the error
              </p>
            </CardContent>
          </Card>

          {/* Navigation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Navigation</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                Go Home
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/config-status'}>
                Config Status
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/community'}>
                Community
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/feed'}>
                Feed
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestRouter;
