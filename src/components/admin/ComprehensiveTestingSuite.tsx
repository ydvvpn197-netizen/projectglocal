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
  Bookmark
} from 'lucide-react';
import { RealTimeTestingService, RealTimeTestSuite } from '@/services/realTimeTestingService';
import { UserSimulationService, SimulationResult } from '@/services/userSimulationService';

export const ComprehensiveTestingSuite: React.FC = () => {
  const [activeTab, setActiveTab] = useState('realtime');
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [isRunningSimulation, setIsRunningSimulation] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  // Test results
  const [testSuite, setTestSuite] = useState<RealTimeTestSuite | null>(null);
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [monitoringEvents, setMonitoringEvents] = useState<{
    type: string;
    timestamp: string;
    data: Record<string, unknown>;
  }[]>([]);
  
  // Simulation settings
  const [userCount, setUserCount] = useState(5);
  const [simulationDuration, setSimulationDuration] = useState(10);
  const [monitoringDuration, setMonitoringDuration] = useState(5);
  
  // Stats
  const [connectionStats, setConnectionStats] = useState({ activeConnections: 0, connectionTypes: {} });
  const [simulationStats, setSimulationStats] = useState({ activeSimulations: 0, totalActions: 0, averageSessionDuration: 0, userEngagement: {} });
  
  const { toast } = useToast();

  const testingService = RealTimeTestingService.getInstance();
  const simulationService = UserSimulationService.getInstance();

  useEffect(() => {
    // Update stats periodically
    const interval = setInterval(() => {
      if (isMonitoring) {
        setConnectionStats(testingService.getConnectionStats());
      }
      setSimulationStats(simulationService.getSimulationStats());
    }, 1000);

    return () => clearInterval(interval);
  }, [isMonitoring, testingService, simulationService]);

  const handleRunRealTimeTests = async () => {
    setIsRunningTests(true);
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
      setIsRunningTests(false);
    }
  };

  const handleRunUserSimulation = async () => {
    setIsRunningSimulation(true);
    try {
      const results = await simulationService.runMultiUserSimulation(userCount, simulationDuration);
      setSimulationResults(results);
      
      toast({
        title: 'Simulation Completed',
        description: `Simulated ${results.length} users with ${results.reduce((sum, r) => sum + r.totalActions, 0)} total actions`
      });
    } catch (error) {
      toast({
        title: 'Simulation Error',
        description: 'Failed to run user simulation',
        variant: 'destructive'
      });
    } finally {
      setIsRunningSimulation(false);
    }
  };

  const handleStartMonitoring = async () => {
    setIsMonitoring(true);
    try {
      const events = await simulationService.monitorRealTimeActivity(monitoringDuration);
      setMonitoringEvents(events.events);
      
      toast({
        title: 'Monitoring Completed',
        description: `Captured ${events.totalEvents} real-time events`
      });
    } catch (error) {
      toast({
        title: 'Monitoring Error',
        description: 'Failed to monitor real-time activity',
        variant: 'destructive'
      });
    } finally {
      setIsMonitoring(false);
    }
  };

  const getTestIcon = (test: { success: boolean }) => {
    return test.success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getTestColor = (test: { success: boolean }) => {
    return test.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'view': return <Activity className="h-4 w-4" />;
      case 'like': return <Heart className="h-4 w-4" />;
      case 'comment': return <MessageSquare className="h-4 w-4" />;
      case 'share': return <Share2 className="h-4 w-4" />;
      case 'bookmark': return <Bookmark className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'view': return 'bg-blue-100 text-blue-800';
      case 'like': return 'bg-red-100 text-red-800';
      case 'comment': return 'bg-green-100 text-green-800';
      case 'share': return 'bg-purple-100 text-purple-800';
      case 'bookmark': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Comprehensive Testing Suite</h2>
          <p className="text-gray-600">Test real-time functionality and simulate multi-user scenarios</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="realtime">Real-time Tests</TabsTrigger>
          <TabsTrigger value="simulation">User Simulation</TabsTrigger>
          <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Real-time Tests Tab */}
        <TabsContent value="realtime" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Real-time System Tests</span>
                <Button
                  onClick={handleRunRealTimeTests}
                  disabled={isRunningTests}
                >
                  {isRunningTests ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Tests
                    </>
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {testSuite && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <Badge className={testSuite.overallSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {testSuite.overallSuccess ? 'Passed' : 'Failed'}
                      </Badge>
                      <span className="ml-2 text-sm text-gray-500">
                        {testSuite.tests.filter(t => t.success).length}/{testSuite.tests.length} tests passed
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      Duration: {((testSuite.totalDuration || 0) / 1000).toFixed(2)}s
                    </span>
                  </div>
                  
                  <Progress 
                    value={(testSuite.tests.filter(t => t.success).length / testSuite.tests.length) * 100} 
                    className="h-2"
                  />

                  <div className="space-y-2">
                    {testSuite.tests.map((test, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getTestIcon(test)}
                          <span className="font-medium">{test.testName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getTestColor(test)}>
                            {test.success ? 'Passed' : 'Failed'}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {test.duration}ms
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Simulation Tab */}
        <TabsContent value="simulation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Simulation Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userCount">Number of Users</Label>
                  <Input
                    id="userCount"
                    type="number"
                    min="1"
                    max="20"
                    value={userCount}
                    onChange={(e) => setUserCount(parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="simulationDuration">Duration (minutes)</Label>
                  <Input
                    id="simulationDuration"
                    type="number"
                    min="1"
                    max="60"
                    value={simulationDuration}
                    onChange={(e) => setSimulationDuration(parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="mt-4">
                <Button
                  onClick={handleRunUserSimulation}
                  disabled={isRunningSimulation}
                  className="w-full"
                >
                  {isRunningSimulation ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Running Simulation...
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4 mr-2" />
                      Start User Simulation
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {simulationResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Simulation Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{simulationResults.length}</div>
                      <div className="text-sm text-gray-500">Users Simulated</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {simulationResults.reduce((sum, r) => sum + r.totalActions, 0)}
                      </div>
                      <div className="text-sm text-gray-500">Total Actions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {Math.round(simulationStats.averageSessionDuration / 1000 / 60)}m
                      </div>
                      <div className="text-sm text-gray-500">Avg Session</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {simulationResults.map((result, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{result.userId}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{result.totalActions} actions</Badge>
                            <span className="text-sm text-gray-500">
                              {Math.round(result.sessionDuration / 1000 / 60)}m
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {result.actions.slice(0, 10).map((action, actionIndex) => (
                            <Badge key={actionIndex} className={getActionColor(action.type)}>
                              {getActionIcon(action.type)}
                              <span className="ml-1">{action.type}</span>
                            </Badge>
                          ))}
                          {result.actions.length > 10 && (
                            <Badge variant="outline">+{result.actions.length - 10} more</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Live Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Real-time Activity Monitoring</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="monitoringDuration">Duration (minutes)</Label>
                    <Input
                      id="monitoringDuration"
                      type="number"
                      min="1"
                      max="30"
                      value={monitoringDuration}
                      onChange={(e) => setMonitoringDuration(parseInt(e.target.value))}
                      className="w-20"
                    />
                  </div>
                  <Button
                    onClick={handleStartMonitoring}
                    disabled={isMonitoring}
                  >
                    {isMonitoring ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Monitoring...
                      </>
                    ) : (
                      <>
                        <Activity className="h-4 w-4 mr-2" />
                        Start Monitoring
                      </>
                    )}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{connectionStats.activeConnections}</div>
                  <div className="text-sm text-gray-500">Active Connections</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{monitoringEvents.length}</div>
                  <div className="text-sm text-gray-500">Events Captured</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {isMonitoring ? 'Active' : 'Inactive'}
                  </div>
                  <div className="text-sm text-gray-500">Monitoring Status</div>
                </div>
              </div>

              {monitoringEvents.length > 0 && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {monitoringEvents.map((event, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{event.type}</Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {JSON.stringify(event.data, null, 2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Test Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {testSuite ? Math.round((testSuite.tests.filter(t => t.success).length / testSuite.tests.length) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Real-time tests
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">User Engagement</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {simulationStats.totalActions}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total actions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Real-time Events</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {monitoringEvents.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Events captured
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {testSuite?.overallSuccess ? 'Healthy' : 'Issues'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Overall status
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testSuite && (
                  <div>
                    <h4 className="font-medium mb-2">Test Performance</h4>
                    <div className="space-y-2">
                      {testSuite.tests.map((test, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{test.testName}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{test.duration}ms</span>
                            {getTestIcon(test)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {simulationResults.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">User Simulation Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Average Actions per User</span>
                        <span className="text-sm font-medium">
                          {Math.round(simulationStats.totalActions / simulationResults.length)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Average Session Duration</span>
                        <span className="text-sm font-medium">
                          {Math.round(simulationStats.averageSessionDuration / 1000 / 60)} minutes
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
