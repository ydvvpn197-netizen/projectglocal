import { supabase } from '@/integrations/supabase/client';
import { EnhancedNewsAggregationService } from './enhancedNewsAggregationService';
import { EnhancedNewsSummarizationService } from './enhancedNewsSummarizationService';
import { NewsAggregationScheduler } from './newsAggregationScheduler';

export interface TestResult {
  testName: string;
  success: boolean;
  duration: number;
  error?: string;
  details?: Record<string, unknown>;
}

export interface RealTimeTestSuite {
  id: string;
  name: string;
  description: string;
  tests: TestResult[];
  startTime: Date;
  endTime?: Date;
  overallSuccess: boolean;
  totalDuration: number;
}

export class RealTimeTestingService {
  private static instance: RealTimeTestingService;
  private aggregationService: EnhancedNewsAggregationService;
  private summarizationService: EnhancedNewsSummarizationService;
  private scheduler: NewsAggregationScheduler;
  private activeConnections: Map<string, { unsubscribe: () => void }> = new Map();
  private testResults: TestResult[] = [];

  private constructor() {
    this.aggregationService = EnhancedNewsAggregationService.getInstance();
    this.summarizationService = EnhancedNewsSummarizationService.getInstance();
    this.scheduler = NewsAggregationScheduler.getInstance();
  }

  public static getInstance(): RealTimeTestingService {
    if (!RealTimeTestingService.instance) {
      RealTimeTestingService.instance = new RealTimeTestingService();
    }
    return RealTimeTestingService.instance;
  }

  /**
   * Run comprehensive real-time tests
   */
  async runRealTimeTestSuite(): Promise<RealTimeTestSuite> {
    const testSuite: RealTimeTestSuite = {
      id: `test-${Date.now()}`,
      name: 'Real-Time News System Test Suite',
      description: 'Comprehensive testing of real-time news functionality',
      tests: [],
      startTime: new Date(),
      overallSuccess: true,
      totalDuration: 0
    };

    console.log('Starting real-time test suite...');

    try {
      // Test 1: Database Connection
      await this.testDatabaseConnection(testSuite);

      // Test 2: News Sources
      await this.testNewsSources(testSuite);

      // Test 3: Real-time Subscriptions
      await this.testRealTimeSubscriptions(testSuite);

      // Test 4: News Aggregation
      await this.testNewsAggregation(testSuite);

      // Test 5: AI Summarization
      await this.testAISummarization(testSuite);

      // Test 6: User Interactions
      await this.testUserInteractions(testSuite);

      // Test 7: Performance Tests
      await this.testPerformance(testSuite);

      // Test 8: Multi-user Simulation
      await this.testMultiUserSimulation(testSuite);

      testSuite.endTime = new Date();
      testSuite.totalDuration = testSuite.endTime.getTime() - testSuite.startTime.getTime();
      testSuite.overallSuccess = testSuite.tests.every(test => test.success);

      console.log('Real-time test suite completed:', {
        success: testSuite.overallSuccess,
        duration: testSuite.totalDuration,
        testsPassed: testSuite.tests.filter(t => t.success).length,
        testsTotal: testSuite.tests.length
      });

      return testSuite;
    } catch (error) {
      testSuite.endTime = new Date();
      testSuite.totalDuration = testSuite.endTime.getTime() - testSuite.startTime.getTime();
      testSuite.overallSuccess = false;
      
      console.error('Real-time test suite failed:', error);
      return testSuite;
    }
  }

  /**
   * Test database connection
   */
  private async testDatabaseConnection(testSuite: RealTimeTestSuite): Promise<void> {
    const startTime = Date.now();
    
    try {
      const { data, error } = await supabase
        .from('news_sources')
        .select('count')
        .limit(1);

      if (error) throw error;

      testSuite.tests.push({
        testName: 'Database Connection',
        success: true,
        duration: Date.now() - startTime,
        details: { connected: true }
      });
    } catch (error) {
      testSuite.tests.push({
        testName: 'Database Connection',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test news sources
   */
  private async testNewsSources(testSuite: RealTimeTestSuite): Promise<void> {
    const startTime = Date.now();
    
    try {
      const sources = await this.aggregationService.getNewsSources();
      const activeSources = sources.filter(s => s.is_active);

      testSuite.tests.push({
        testName: 'News Sources',
        success: activeSources.length > 0,
        duration: Date.now() - startTime,
        details: { 
          totalSources: sources.length,
          activeSources: activeSources.length 
        }
      });
    } catch (error) {
      testSuite.tests.push({
        testName: 'News Sources',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test real-time subscriptions
   */
  private async testRealTimeSubscriptions(testSuite: RealTimeTestSuite): Promise<void> {
    const startTime = Date.now();
    
    try {
      let subscriptionReceived = false;
      const timeout = 5000; // 5 seconds timeout

      // Subscribe to news articles changes
      const channel = supabase
        .channel('test_news_subscription')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'news_articles'
          },
          (payload) => {
            console.log('Real-time subscription test received:', payload);
            subscriptionReceived = true;
          }
        )
        .subscribe();

      // Wait for subscription to be established
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test subscription by inserting a test article
      const testArticle = {
        source_id: (await this.aggregationService.getNewsSources())[0]?.id,
        title: 'Test Article for Real-time Testing',
        content: 'This is a test article to verify real-time functionality.',
        url: `https://test.com/article-${Date.now()}`,
        published_at: new Date().toISOString(),
        category: 'Test',
        relevance_score: 0.5,
        engagement_score: 0.0
      };

      const { error: insertError } = await supabase
        .from('news_articles')
        .insert(testArticle);

      if (insertError) throw insertError;

      // Wait for subscription to receive the change
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Clean up test article
      await supabase
        .from('news_articles')
        .delete()
        .eq('title', testArticle.title);

      // Unsubscribe
      await supabase.removeChannel(channel);

      testSuite.tests.push({
        testName: 'Real-time Subscriptions',
        success: subscriptionReceived,
        duration: Date.now() - startTime,
        details: { subscriptionReceived }
      });
    } catch (error) {
      testSuite.tests.push({
        testName: 'Real-time Subscriptions',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test news aggregation
   */
  private async testNewsAggregation(testSuite: RealTimeTestSuite): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test fetching from a single source
      const sources = await this.aggregationService.getNewsSources();
      const activeSource = sources.find(s => s.is_active);
      
      if (!activeSource) {
        throw new Error('No active news sources found');
      }

      const testResult = await this.aggregationService.testNewsSource(activeSource);

      testSuite.tests.push({
        testName: 'News Aggregation',
        success: testResult.success,
        duration: Date.now() - startTime,
        details: { 
          source: activeSource.name,
          articlesFound: testResult.articles,
          error: testResult.error
        }
      });
    } catch (error) {
      testSuite.tests.push({
        testName: 'News Aggregation',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test AI summarization
   */
  private async testAISummarization(testSuite: RealTimeTestSuite): Promise<void> {
    const startTime = Date.now();
    
    try {
      const testArticle = {
        id: 'test-article',
        title: 'Test Article for AI Summarization',
        content: 'This is a test article to verify AI summarization functionality. It contains multiple sentences to test the summarization process.',
        description: 'A test article for AI summarization testing'
      };

      const summary = await this.summarizationService.generateEnhancedSummary(testArticle, {
        maxLength: 100,
        includeKeyPoints: true,
        includeSentiment: true,
        includeTags: true
      });

      testSuite.tests.push({
        testName: 'AI Summarization',
        success: !!summary.summary && summary.summary.length > 0,
        duration: Date.now() - startTime,
        details: { 
          summaryLength: summary.summary.length,
          aiGenerated: summary.aiGenerated,
          provider: summary.provider,
          keyPoints: summary.keyPoints.length,
          sentiment: summary.sentiment
        }
      });
    } catch (error) {
      testSuite.tests.push({
        testName: 'AI Summarization',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test user interactions
   */
  private async testUserInteractions(testSuite: RealTimeTestSuite): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test creating a user interaction
      const testInteraction = {
        user_id: 'test-user-id',
        article_id: 'test-article-id',
        interaction_type: 'view',
        interaction_data: { test: true }
      };

      // This would normally require a real user, so we'll simulate
      const { error } = await supabase
        .from('news_article_interactions')
        .insert(testInteraction);

      // Clean up test interaction
      if (!error) {
        await supabase
          .from('news_article_interactions')
          .delete()
          .eq('user_id', testInteraction.user_id)
          .eq('article_id', testInteraction.article_id);
      }

      testSuite.tests.push({
        testName: 'User Interactions',
        success: !error,
        duration: Date.now() - startTime,
        details: { interactionCreated: !error }
      });
    } catch (error) {
      testSuite.tests.push({
        testName: 'User Interactions',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test performance
   */
  private async testPerformance(testSuite: RealTimeTestSuite): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test database query performance
      const queryStart = Date.now();
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .limit(10);
      const queryDuration = Date.now() - queryStart;

      if (error) throw error;

      testSuite.tests.push({
        testName: 'Performance',
        success: queryDuration < 1000, // Should complete within 1 second
        duration: Date.now() - startTime,
        details: { 
          queryDuration,
          articlesReturned: data?.length || 0,
          performanceGood: queryDuration < 1000
        }
      });
    } catch (error) {
      testSuite.tests.push({
        testName: 'Performance',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test multi-user simulation
   */
  private async testMultiUserSimulation(testSuite: RealTimeTestSuite): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Simulate multiple users subscribing to real-time updates
      const userCount = 5;
      const subscriptions: Array<{ unsubscribe: () => void }> = [];
      let receivedUpdates = 0;

      // Create multiple subscriptions
      for (let i = 0; i < userCount; i++) {
        const channel = supabase
          .channel(`test_user_${i}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'news_articles'
            },
            (payload) => {
              receivedUpdates++;
              console.log(`User ${i} received update:`, payload);
            }
          )
          .subscribe();
        
        subscriptions.push(channel);
      }

      // Wait for subscriptions to be established
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate a news update
      const testArticle = {
        source_id: (await this.aggregationService.getNewsSources())[0]?.id,
        title: 'Multi-user Test Article',
        content: 'This article tests multi-user real-time functionality.',
        url: `https://test.com/multi-user-${Date.now()}`,
        published_at: new Date().toISOString(),
        category: 'Test',
        relevance_score: 0.5,
        engagement_score: 0.0
      };

      const { error: insertError } = await supabase
        .from('news_articles')
        .insert(testArticle);

      if (insertError) throw insertError;

      // Wait for all users to receive the update
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Clean up
      await supabase
        .from('news_articles')
        .delete()
        .eq('title', testArticle.title);

      // Unsubscribe all users
      for (const channel of subscriptions) {
        await supabase.removeChannel(channel);
      }

      testSuite.tests.push({
        testName: 'Multi-user Simulation',
        success: receivedUpdates >= userCount,
        duration: Date.now() - startTime,
        details: { 
          userCount,
          receivedUpdates,
          allUsersReceived: receivedUpdates >= userCount
        }
      });
    } catch (error) {
      testSuite.tests.push({
        testName: 'Multi-user Simulation',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get test results
   */
  getTestResults(): TestResult[] {
    return [...this.testResults];
  }

  /**
   * Clear test results
   */
  clearTestResults(): void {
    this.testResults = [];
  }

  /**
   * Monitor real-time connections
   */
  getConnectionStats(): {
    activeConnections: number;
    connectionTypes: Record<string, number>;
  } {
    const connectionTypes: Record<string, number> = {};
    
    for (const [key, connection] of this.activeConnections) {
      const type = key.split('_')[0];
      connectionTypes[type] = (connectionTypes[type] || 0) + 1;
    }

    return {
      activeConnections: this.activeConnections.size,
      connectionTypes
    };
  }

  /**
   * Start real-time monitoring
   */
  startRealTimeMonitoring(): void {
    console.log('Starting real-time monitoring...');
    
    // Monitor news articles
    const newsChannel = supabase
      .channel('monitoring_news')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'news_articles'
        },
        (payload) => {
          console.log('News article change detected:', payload);
        }
      )
      .subscribe();

    // Monitor user interactions
    const interactionsChannel = supabase
      .channel('monitoring_interactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'news_article_interactions'
        },
        (payload) => {
          console.log('User interaction detected:', payload);
        }
      )
      .subscribe();

    this.activeConnections.set('monitoring_news', newsChannel);
    this.activeConnections.set('monitoring_interactions', interactionsChannel);
  }

  /**
   * Stop real-time monitoring
   */
  stopRealTimeMonitoring(): void {
    console.log('Stopping real-time monitoring...');
    
    for (const [key, connection] of this.activeConnections) {
      supabase.removeChannel(connection);
    }
    
    this.activeConnections.clear();
  }
}
