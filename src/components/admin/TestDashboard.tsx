import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Users, 
  Activity,
  Database,
  Zap,
  Brain,
  Globe,
  BarChart3,
  Clock,
  TrendingUp,
  MessageSquare,
  Heart,
  Share2,
  Bookmark,
  AlertTriangle,
  Target,
  Gauge,
  Timer,
  Layers
} from 'lucide-react';
import { TestRunnerService, TestRunConfig, TestRunResult } from '@/services/testRunnerService';
import { RealTimeTestingService } from '@/services/realTimeTestingService';
import { UserSimulationService } from '@/services/userSimulationService';

export const TestDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<TestRunResult | null>(null);
  const [testHistory, setTestHistory] = useState<TestRunResult[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  
  // Test configuration
  const [testConfig, setTestConfig] = useState<TestRunConfig>({
    realTimeTests: true,
    userSimulation: true,
    monitoring: true,
    userCount: 5,
    simulationDuration: 5,
    monitoringDuration: 3
  });

  const { toast } = useToast();
  const testRunner = TestRunnerService.getInstance();
  const realTimeService = RealTimeTestingService.getInstance();
  const simulationService = UserSimulationService.getInstance();

  useEffect(() => {
    loadTestHistory();
    loadStatistics();
  }, []);

  const loadTestHistory = () => {
    setTestHistory(testRunner.getTestHistory());
  };

  const loadStatistics = () => {
    setStatistics(testRunner.getTestStatistics());
  };

  const handleRunQuickTest = async () => {
    setIsRunning(true);
    try {
      const result = await testRunner.runQuickTest();
      setCurrentTest(result);
      loadTestHistory();
      loadStatistics();
      
      toast({
        title: result.overallSuccess ? 'Quick Test Passed' : 'Quick Test Failed',
        description: `${result.summary.passedTests}/${result.summary.totalTests} tests passed`,
        variant: result.overallSuccess ? 'default' : 'destructive'
      });
    } catch (error) {
      toast({
        title: 'Test Error',
        description: 'Failed to run quick test',
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunFullTest = async () => {
    setIsRunning(true);
    try {
      const result = await testRunner.runFullTest();
      setCurrentTest(result);
      loadTestHistory();
      loadStatistics();
      
      toast({
        title: result.overallSuccess ? 'Full Test Passed' : 'Full Test Failed',
        description: `Completed in ${(result.duration / 1000).toFixed(2)}s`,
        variant: result.overallSuccess ? 'default' : 'destructive'
      });
    } catch (error) {
      toast({
        title: 'Test Error',
        description: 'Failed to run full test',
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunCustomTest = async () => {
    setIsRunning(true);
    try {
      const result = await testRunner.runComprehensiveTest(testConfig);
      setCurrentTest(result);
      loadTestHistory();
      loadStatistics();
      
      toast({
        title: result.overallSuccess ? 'Custom Test Passed' : 'Custom Test Failed',
        description: `Completed in ${(result.duration / 1000).toFixed(2)}s`,
        variant: result.overallSuccess ? 'default' : 'destructive'
      });
    } catch (error) {
      toast({
        title: 'Test Error',
        description: 'Failed to run custom test',
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunPerformanceTest = async () => {
    setIsRunning(true);
    try {
      const result = await testRunner.runPerformanceTest();
      
      toast({
        title: 'Performance Test Completed',
        description: `Overall performance: ${result.overallPerformance}`,
        variant: result.overallPerformance === 'excellent' || result.overallPerformance === 'good' ? 'default' : 'destructive'
      });
    } catch (error) {
      toast({
        title: 'Performance Test Error',
        description: 'Failed to run performance test',
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunStressTest = async () => {
    setIsRunning(true);
    try {
      const result = await testRunner.runStressTest(10, 5);
      
      toast({
        title: 'Stress Test Completed',
        description: `System stability: ${result.systemStability}`,
        variant: result.success ? 'default' : 'destructive'
      });
    } catch (error) {
      toast({
        title: 'Stress Test Error',
        description: 'Failed to run stress test',
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Test Dashboard</h2>
          <p className="text-gray-600">Comprehensive testing and monitoring for real-time news system</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isRunning ? 'destructive' : 'default'}>
            {isRunning ? 'Running Tests...' : 'Ready'}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tests">Test Suite</TabsTrigger>
          <TabsTrigger value="simulation">Simulation</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Test Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statistics ? Math.round(statistics.successRate) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {statistics?.totalRuns || 0} total runs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Users Simulated</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statistics?.totalUsersSimulated || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total simulated users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Actions Performed</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statistics?.totalActionsPerformed || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total user actions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
                <Timer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statistics ? Math.round(statistics.averageDuration / 1000) : 0}s
                </div>
                <p className="text-xs text-muted-foreground">
                  Test execution time
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleRunQuickTest}
                  disabled={isRunning}
                  className="w-full"
                >
                  {isRunning ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Run Quick Test
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleRunFullTest}
                  disabled={isRunning}
                  variant="outline"
                  className="w-full"
                >
                  <Layers className="h-4 w-4 mr-2" />
                  Run Full Test Suite
                </Button>
                
                <Button
                  onClick={handleRunPerformanceTest}
                  disabled={isRunning}
                  variant="outline"
                  className="w-full"
                >
                  <Gauge className="h-4 w-4 mr-2" />
                  Performance Test
                </Button>
                
                <Button
                  onClick={handleRunStressTest}
                  disabled={isRunning}
                  variant="outline"
                  className="w-full"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Stress Test
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Real-time Service</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Database Connection</span>
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">AI Integration</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Configured</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">News Sources</span>
                    <Badge className="bg-blue-100 text-blue-800">3 Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {currentTest && (
            <Card>
              <CardHeader>
                <CardTitle>Latest Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className={getStatusColor(currentTest.overallSuccess)}>
                        {currentTest.overallSuccess ? 'Passed' : 'Failed'}
                      </Badge>
                      <span className="ml-2 text-sm text-gray-500">
                        {new Date(currentTest.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      Duration: {(currentTest.duration / 1000).toFixed(2)}s
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{currentTest.summary.totalTests}</div>
                      <div className="text-sm text-gray-500">Tests Run</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{currentTest.summary.passedTests}</div>
                      <div className="text-sm text-gray-500">Passed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{currentTest.summary.totalUsers}</div>
                      <div className="text-sm text-gray-500">Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{currentTest.summary.totalActions}</div>
                      <div className="text-sm text-gray-500">Actions</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Test Suite Tab */}
        <TabsContent value="tests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Real-time Tests</Label>
                  <input
                    type="checkbox"
                    checked={testConfig.realTimeTests}
                    onChange={(e) => setTestConfig({...testConfig, realTimeTests: e.target.checked})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>User Simulation</Label>
                  <input
                    type="checkbox"
                    checked={testConfig.userSimulation}
                    onChange={(e) => setTestConfig({...testConfig, userSimulation: e.target.checked})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Monitoring</Label>
                  <input
                    type="checkbox"
                    checked={testConfig.monitoring}
                    onChange={(e) => setTestConfig({...testConfig, monitoring: e.target.checked})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>User Count</Label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={testConfig.userCount || 5}
                    onChange={(e) => setTestConfig({...testConfig, userCount: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Simulation Duration (minutes)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="60"
                    value={testConfig.simulationDuration || 5}
                    onChange={(e) => setTestConfig({...testConfig, simulationDuration: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Monitoring Duration (minutes)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={testConfig.monitoringDuration || 3}
                    onChange={(e) => setTestConfig({...testConfig, monitoringDuration: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="mt-4">
                <Button
                  onClick={handleRunCustomTest}
                  disabled={isRunning}
                  className="w-full"
                >
                  {isRunning ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Running Custom Test...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Custom Test
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Simulation Tab */}
        <TabsContent value="simulation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Simulation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    User simulation tests multi-user scenarios by simulating real user interactions
                    with the news system including viewing articles, commenting, liking, and sharing.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{statistics?.totalUsersSimulated || 0}</div>
                    <div className="text-sm text-gray-500">Total Users Simulated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{statistics?.totalActionsPerformed || 0}</div>
                    <div className="text-sm text-gray-500">Total Actions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {statistics?.totalUsersSimulated ? Math.round(statistics.totalActionsPerformed / statistics.totalUsersSimulated) : 0}
                    </div>
                    <div className="text-sm text-gray-500">Avg Actions/User</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Activity className="h-4 w-4" />
                  <AlertDescription>
                    Monitor real-time events, connection status, and system performance
                    to ensure optimal user experience.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">Active</div>
                    <div className="text-sm text-gray-500">Real-time Subscriptions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-sm text-gray-500">Events Captured</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test History</CardTitle>
            </CardHeader>
            <CardContent>
              {testHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No test runs yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {testHistory.map((test) => (
                    <div key={test.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(test.overallSuccess)}>
                            {test.overallSuccess ? 'Passed' : 'Failed'}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(test.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {(test.duration / 1000).toFixed(2)}s
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Tests:</span>
                          <span className="ml-1 font-medium">
                            {test.summary.passedTests}/{test.summary.totalTests}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Users:</span>
                          <span className="ml-1 font-medium">{test.summary.totalUsers}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Actions:</span>
                          <span className="ml-1 font-medium">{test.summary.totalActions}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Events:</span>
                          <span className="ml-1 font-medium">{test.summary.eventsCaptured}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
