import { EnhancedNewsAggregationService } from './enhancedNewsAggregationService';

export interface SchedulerConfig {
  enabled: boolean;
  intervalMinutes: number;
  maxRetries: number;
  retryDelayMinutes: number;
}

export class NewsAggregationScheduler {
  private static instance: NewsAggregationScheduler;
  private aggregationService: EnhancedNewsAggregationService;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private config: SchedulerConfig;

  private constructor() {
    this.aggregationService = EnhancedNewsAggregationService.getInstance();
    this.config = {
      enabled: true,
      intervalMinutes: 15, // Fetch news every 15 minutes
      maxRetries: 3,
      retryDelayMinutes: 5
    };
  }

  public static getInstance(): NewsAggregationScheduler {
    if (!NewsAggregationScheduler.instance) {
      NewsAggregationScheduler.instance = new NewsAggregationScheduler();
    }
    return NewsAggregationScheduler.instance;
  }

  /**
   * Start the scheduler
   */
  start(): void {
    if (this.intervalId) {
      console.log('News aggregation scheduler is already running');
      return;
    }

    if (!this.config.enabled) {
      console.log('News aggregation scheduler is disabled');
      return;
    }

    console.log(`Starting news aggregation scheduler (interval: ${this.config.intervalMinutes} minutes)`);
    
    // Run immediately on start
    this.runAggregation();

    // Set up interval
    this.intervalId = setInterval(() => {
      this.runAggregation();
    }, this.config.intervalMinutes * 60 * 1000);
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('News aggregation scheduler stopped');
    }
  }

  /**
   * Run news aggregation
   */
  async runAggregation(): Promise<void> {
    if (this.isRunning) {
      console.log('News aggregation is already running, skipping...');
      return;
    }

    this.isRunning = true;
    console.log('Starting news aggregation...');

    try {
      const result = await this.aggregationService.fetchNewsFromAllSources();
      
      console.log('News aggregation completed:', {
        articlesFetched: result.total_articles_fetched,
        articlesProcessed: result.total_articles_processed,
        articlesStored: result.total_articles_stored,
        sourcesProcessed: result.sources_processed.length,
        processingTime: `${result.processing_time_ms}ms`,
        errors: result.processing_errors
      });

      // Log any errors
      if (result.processing_errors > 0) {
        console.warn(`${result.processing_errors} sources had processing errors`);
      }

    } catch (error) {
      console.error('News aggregation failed:', error);
      
      // Retry logic could be implemented here
      await this.handleAggregationError(error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Handle aggregation errors
   */
  private async handleAggregationError(error: any): Promise<void> {
    console.error('Handling aggregation error:', error);
    
    // In a production environment, you might want to:
    // 1. Send alerts to administrators
    // 2. Log to external monitoring service
    // 3. Implement retry logic with exponential backoff
    // 4. Store error metrics for analysis
  }

  /**
   * Update scheduler configuration
   */
  updateConfig(newConfig: Partial<SchedulerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart scheduler if interval changed
    if (newConfig.intervalMinutes && this.intervalId) {
      this.stop();
      this.start();
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): SchedulerConfig {
    return { ...this.config };
  }

  /**
   * Get scheduler status
   */
  getStatus(): {
    isRunning: boolean;
    isEnabled: boolean;
    intervalMinutes: number;
    nextRun?: Date;
  } {
    return {
      isRunning: this.isRunning,
      isEnabled: this.config.enabled,
      intervalMinutes: this.config.intervalMinutes,
      nextRun: this.intervalId ? new Date(Date.now() + this.config.intervalMinutes * 60 * 1000) : undefined
    };
  }

  /**
   * Force run aggregation (for manual triggers)
   */
  async forceRun(): Promise<void> {
    console.log('Force running news aggregation...');
    await this.runAggregation();
  }

  /**
   * Test a specific news source
   */
  async testSource(sourceId: string): Promise<{ success: boolean; articles: number; error?: string }> {
    try {
      const sources = await this.aggregationService.getNewsSources();
      const source = sources.find(s => s.id === sourceId);
      
      if (!source) {
        return {
          success: false,
          articles: 0,
          error: 'Source not found'
        };
      }

      return await this.aggregationService.testNewsSource(source);
    } catch (error) {
      return {
        success: false,
        articles: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Auto-start scheduler in browser environment
if (typeof window !== 'undefined') {
  // Only start in production or when explicitly enabled
  const shouldAutoStart = process.env.NODE_ENV === 'production' || 
                         process.env.VITE_AUTO_START_NEWS_SCHEDULER === 'true';
  
  if (shouldAutoStart) {
    const scheduler = NewsAggregationScheduler.getInstance();
    scheduler.start();
    
    // Make scheduler available globally for debugging
    (window as any).newsScheduler = scheduler;
  }
}
