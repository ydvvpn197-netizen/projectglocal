import { RealTimeTestingService, RealTimeTestSuite } from './realTimeTestingService';
import { UserSimulationService, SimulationResult } from './userSimulationService';

export interface TestRunConfig {
  realTimeTests: boolean;
  userSimulation: boolean;
  monitoring: boolean;
  userCount?: number;
  simulationDuration?: number;
  monitoringDuration?: number;
}

export interface TestRunResult {
  id: string;
  timestamp: Date;
  config: TestRunConfig;
  realTimeResults?: RealTimeTestSuite;
  simulationResults?: SimulationResult[];
  monitoringResults?: any;
  overallSuccess: boolean;
  duration: number;
  summary: {
    totalTests: number;
    passedTests: number;
    totalUsers: number;
    totalActions: number;
    eventsCaptured: number;
  };
}

export class TestRunnerService {
  private static instance: TestRunnerService;
  private testHistory: TestRunResult[] = [];
  private isRunning = false;

  private constructor() {}

  public static getInstance(): TestRunnerService {
    if (!TestRunnerService.instance) {
      TestRunnerService.instance = new TestRunnerService();
    }
    return TestRunnerService.instance;
  }

  async runComprehensiveTest(config: TestRunConfig): Promise<TestRunResult> {
    if (this.isRunning) {
      throw new Error('Test run already in progress');
    }

    this.isRunning = true;
    const startTime = Date.now();
    const testId = `test_${Date.now()}`;

    const result: TestRunResult = {
      id: testId,
      timestamp: new Date(),
      config,
      overallSuccess: true,
      duration: 0,
      summary: {
        totalTests: 0,
        passedTests: 0,
        totalUsers: 0,
        totalActions: 0,
        eventsCaptured: 0
      }
    };

    try {
      const realTimeService = RealTimeTestingService.getInstance();
      const simulationService = UserSimulationService.getInstance();

      // Run real-time tests
      if (config.realTimeTests) {
        console.log('Running real-time tests...');
        result.realTimeResults = await realTimeService.runRealTimeTestSuite();
        result.summary.totalTests = result.realTimeResults.tests.length;
        result.summary.passedTests = result.realTimeResults.tests.filter(t => t.success).length;
        
        if (!result.realTimeResults.overallSuccess) {
          result.overallSuccess = false;
        }
      }

      // Run user simulation
      if (config.userSimulation && config.userCount && config.simulationDuration) {
        console.log('Running user simulation...');
        result.simulationResults = await simulationService.runMultiUserSimulation(
          config.userCount,
          config.simulationDuration
        );
        result.summary.totalUsers = result.simulationResults.length;
        result.summary.totalActions = result.simulationResults.reduce(
          (sum, r) => sum + r.totalActions,
          0
        );
      }

      // Run monitoring
      if (config.monitoring && config.monitoringDuration) {
        console.log('Running real-time monitoring...');
        result.monitoringResults = await simulationService.monitorRealTimeActivity(
          config.monitoringDuration
        );
        result.summary.eventsCaptured = result.monitoringResults.totalEvents;
      }

      result.duration = Date.now() - startTime;
      this.testHistory.push(result);

      console.log('Comprehensive test completed:', result);
      return result;

    } catch (error) {
      result.overallSuccess = false;
      result.duration = Date.now() - startTime;
      this.testHistory.push(result);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  async runQuickTest(): Promise<TestRunResult> {
    return this.runComprehensiveTest({
      realTimeTests: true,
      userSimulation: false,
      monitoring: false
    });
  }

  async runFullTest(): Promise<TestRunResult> {
    return this.runComprehensiveTest({
      realTimeTests: true,
      userSimulation: true,
      monitoring: true,
      userCount: 5,
      simulationDuration: 5,
      monitoringDuration: 3
    });
  }

  getTestHistory(): TestRunResult[] {
    return [...this.testHistory];
  }

  getLatestTestResult(): TestRunResult | null {
    return this.testHistory.length > 0 ? this.testHistory[this.testHistory.length - 1] : null;
  }

  getTestResultById(id: string): TestRunResult | null {
    return this.testHistory.find(result => result.id === id) || null;
  }

  clearTestHistory(): void {
    this.testHistory = [];
  }

  getTestStatistics(): {
    totalRuns: number;
    successRate: number;
    averageDuration: number;
    totalTestsRun: number;
    totalUsersSimulated: number;
    totalActionsPerformed: number;
  } {
    if (this.testHistory.length === 0) {
      return {
        totalRuns: 0,
        successRate: 0,
        averageDuration: 0,
        totalTestsRun: 0,
        totalUsersSimulated: 0,
        totalActionsPerformed: 0
      };
    }

    const totalRuns = this.testHistory.length;
    const successfulRuns = this.testHistory.filter(r => r.overallSuccess).length;
    const averageDuration = this.testHistory.reduce((sum, r) => sum + r.duration, 0) / totalRuns;
    const totalTestsRun = this.testHistory.reduce((sum, r) => sum + r.summary.totalTests, 0);
    const totalUsersSimulated = this.testHistory.reduce((sum, r) => sum + r.summary.totalUsers, 0);
    const totalActionsPerformed = this.testHistory.reduce((sum, r) => sum + r.summary.totalActions, 0);

    return {
      totalRuns,
      successRate: (successfulRuns / totalRuns) * 100,
      averageDuration,
      totalTestsRun,
      totalUsersSimulated,
      totalActionsPerformed
    };
  }

  isTestRunning(): boolean {
    return this.isRunning;
  }

  async runPerformanceTest(): Promise<{
    connectionLatency: number;
    subscriptionLatency: number;
    dataProcessingLatency: number;
    overallPerformance: 'excellent' | 'good' | 'fair' | 'poor';
  }> {
    const realTimeService = RealTimeTestingService.getInstance();
    
    const startTime = Date.now();
    
    // Test connection latency
    const connectionStart = Date.now();
    await realTimeService.testConnection();
    const connectionLatency = Date.now() - connectionStart;

    // Test subscription latency
    const subscriptionStart = Date.now();
    const unsubscribe = realTimeService.testSubscription();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for subscription
    unsubscribe();
    const subscriptionLatency = Date.now() - subscriptionStart;

    // Test data processing latency
    const processingStart = Date.now();
    await realTimeService.testDataProcessing();
    const dataProcessingLatency = Date.now() - processingStart;

    const totalLatency = connectionLatency + subscriptionLatency + dataProcessingLatency;
    
    let overallPerformance: 'excellent' | 'good' | 'fair' | 'poor';
    if (totalLatency < 1000) {
      overallPerformance = 'excellent';
    } else if (totalLatency < 2000) {
      overallPerformance = 'good';
    } else if (totalLatency < 5000) {
      overallPerformance = 'fair';
    } else {
      overallPerformance = 'poor';
    }

    return {
      connectionLatency,
      subscriptionLatency,
      dataProcessingLatency,
      overallPerformance
    };
  }

  async runStressTest(userCount: number, duration: number): Promise<{
    success: boolean;
    averageResponseTime: number;
    errorRate: number;
    maxConcurrentUsers: number;
    systemStability: 'stable' | 'degraded' | 'unstable';
  }> {
    const simulationService = UserSimulationService.getInstance();
    
    const startTime = Date.now();
    const results = await simulationService.runMultiUserSimulation(userCount, duration);
    const endTime = Date.now();

    const totalActions = results.reduce((sum, r) => sum + r.totalActions, 0);
    const averageResponseTime = results.reduce((sum, r) => sum + r.averageResponseTime, 0) / results.length;
    const errorCount = results.reduce((sum, r) => sum + r.errors.length, 0);
    const errorRate = (errorCount / totalActions) * 100;

    let systemStability: 'stable' | 'degraded' | 'unstable';
    if (errorRate < 1) {
      systemStability = 'stable';
    } else if (errorRate < 5) {
      systemStability = 'degraded';
    } else {
      systemStability = 'unstable';
    }

    return {
      success: errorRate < 10,
      averageResponseTime,
      errorRate,
      maxConcurrentUsers: userCount,
      systemStability
    };
  }
}
