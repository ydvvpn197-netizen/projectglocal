import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  Activity,
  Database,
  Zap,
  Brain,
  Globe,
  BarChart3,
  AlertTriangle
} from 'lucide-react';
import { RealTimeTestingService, RealTimeTestSuite, TestResult } from '@/services/realTimeTestingService';

export const RealTimeTestingDashboard: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testSuite, setTestSuite] = useState<RealTimeTestSuite | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [connectionStats, setConnectionStats] = useState({ activeConnections: 0, connectionTypes: {} });
  const { toast } = useToast();

  const testingService = RealTimeTestingService.getInstance();

  useEffect(() => {
    // Update connection stats periodically
    const interval = setInterval(() => {
      if (isMonitoring) {
        setConnectionStats(testingService.getConnectionStats());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isMonitoring, testingService]);

  const handleRunTests = async () => {
    setIsRunning(true);
    try {
      const results = await testingService.runRealTimeTestSuite();
      setTestSuite(results);
      
      toast({
        title: results.overallSuccess ? 'Tests Passed' : 'Tests Failed',
        description: `${results.tests.filter(t => t.success).length}/${results.tests.length} tests passed`,
        variant: results.overallSuccess ? 'default' : 'destructive'
      });
    } catch (error) {
      toast({
        title: 'Test Error',
        description: 'Failed to run test suite',
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleStartMonitoring = () => {
    testingService.startRealTimeMonitoring();
    setIsMonitoring(true);
    toast({
      title: 'Monitoring Started',
      description: 'Real-time monitoring is now active'
    });
  };

  const handleStopMonitoring = () => {
    testingService.stopRealTimeMonitoring();
    setIsMonitoring(false);
    setConnectionStats({ activeConnections: 0, connectionTypes: {} });
    toast({
      title: 'Monitoring Stopped',
      description: 'Real-time monitoring has been stopped'
    });
  };

  const getTestIcon = (test: TestResult) => {
    return test.success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getTestColor = (test: TestResult) => {
    return test.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getTestDuration = (duration: number) => {
    return duration < 1000 ? `${duration}ms` : `${(duration / 1000).toFixed(2)}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Real-Time Testing Dashboard</h2>
          <p className="text-gray-600">Test and monitor real-time news functionality</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={isMonitoring ? handleStopMonitoring : handleStartMonitoring}
            variant={isMonitoring ? "destructive" : "outline"}
          >
            {isMonitoring ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Stop Monitoring
              </>
            ) : (
              <>
                <Activity className="h-4 w-4 mr-2" />
                Start Monitoring
              </>
            )}
          </Button>
          <Button
            onClick={handleRunTests}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Test Suite
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Connection Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectionStats.activeConnections}</div>
            <p className="text-xs text-muted-foreground">
              Real-time connections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monitoring Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isMonitoring ? 'Active' : 'Inactive'}
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time monitoring
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Status</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {testSuite ? (testSuite.overallSuccess ? 'Passed' : 'Failed') : 'Not Run'}
            </div>
            <p className="text-xs text-muted-foreground">
              Last test suite
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      {testSuite && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Test Results</span>
              <div className="flex items-center gap-2">
                <Badge className={testSuite.overallSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {testSuite.overallSuccess ? 'Passed' : 'Failed'}
                </Badge>
                <span className="text-sm text-gray-500">
                  {getTestDuration(testSuite.totalDuration)}
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Overall Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span>
                    {testSuite.tests.filter(t => t.success).length} / {testSuite.tests.length} tests passed
                  </span>
                </div>
                <Progress 
                  value={(testSuite.tests.filter(t => t.success).length / testSuite.tests.length) * 100} 
                  className="h-2"
                />
              </div>

              {/* Individual Test Results */}
              <div className="space-y-2">
                {testSuite.tests.map((test, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTestIcon(test)}
                      <div>
                        <div className="font-medium">{test.testName}</div>
                        {test.details && (
                          <div className="text-sm text-gray-500">
                            {Object.entries(test.details).map(([key, value]) => (
                              <span key={key} className="mr-3">
                                {key}: {String(value)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTestColor(test)}>
                        {test.success ? 'Passed' : 'Failed'}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {getTestDuration(test.duration)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Error Details */}
              {testSuite.tests.some(t => !t.success) && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="font-medium">Failed Tests:</div>
                      {testSuite.tests
                        .filter(t => !t.success)
                        .map((test, index) => (
                          <div key={index} className="text-sm">
                            <strong>{test.testName}:</strong> {test.error}
                          </div>
                        ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connection Types */}
      {isMonitoring && Object.keys(connectionStats.connectionTypes).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Connection Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(connectionStats.connectionTypes).map(([type, count]) => (
                <div key={type} className="text-center">
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-gray-500 capitalize">{type}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {testSuite?.tests.find(t => t.testName === 'Database Connection')?.success ? '✓' : '✗'}
            </div>
            <p className="text-xs text-muted-foreground">
              Connection test
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Real-time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {testSuite?.tests.find(t => t.testName === 'Real-time Subscriptions')?.success ? '✓' : '✗'}
            </div>
            <p className="text-xs text-muted-foreground">
              Subscriptions test
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {testSuite?.tests.find(t => t.testName === 'AI Summarization')?.success ? '✓' : '✗'}
            </div>
            <p className="text-xs text-muted-foreground">
              Summarization test
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Multi-user</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {testSuite?.tests.find(t => t.testName === 'Multi-user Simulation')?.success ? '✓' : '✗'}
            </div>
            <p className="text-xs text-muted-foreground">
              Multi-user test
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
