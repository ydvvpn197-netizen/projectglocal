import { supabase } from '@/integrations/supabase/client';
import { RealTimeNewsService } from './realTimeNewsService';
import { NewsEngagementService } from './newsEngagementService';

export interface SimulatedUser {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    city: string;
  };
  preferences: {
    categories: string[];
    radius: number;
  };
  behavior: {
    readingSpeed: number; // words per minute
    engagementRate: number; // 0-1
    commentRate: number; // 0-1
  };
}

export interface SimulationResult {
  userId: string;
  actions: Array<{
    type: 'view' | 'like' | 'comment' | 'share' | 'bookmark';
    articleId: string;
    timestamp: Date;
    duration?: number;
  }>;
  totalActions: number;
  sessionDuration: number;
}

export class UserSimulationService {
  private static instance: UserSimulationService;
  private realTimeNewsService: RealTimeNewsService;
  private engagementService: NewsEngagementService;
  private activeSimulations: Map<string, SimulationResult> = new Map();

  private constructor() {
    this.realTimeNewsService = RealTimeNewsService.getInstance();
    this.engagementService = NewsEngagementService.getInstance();
  }

  public static getInstance(): UserSimulationService {
    if (!UserSimulationService.instance) {
      UserSimulationService.instance = new UserSimulationService();
    }
    return UserSimulationService.instance;
  }

  /**
   * Create simulated users
   */
  createSimulatedUsers(count: number): SimulatedUser[] {
    const users: SimulatedUser[] = [];
    const cities = [
      { name: 'New York', lat: 40.7128, lng: -74.0060 },
      { name: 'London', lat: 51.5074, lng: -0.1278 },
      { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
      { name: 'Paris', lat: 48.8566, lng: 2.3522 },
      { name: 'Sydney', lat: -33.8688, lng: 151.2093 }
    ];

    const categories = ['Technology', 'Business', 'Health', 'Sports', 'Entertainment', 'Politics', 'Science'];
    const behaviors = [
      { readingSpeed: 200, engagementRate: 0.3, commentRate: 0.1 },
      { readingSpeed: 250, engagementRate: 0.5, commentRate: 0.2 },
      { readingSpeed: 180, engagementRate: 0.2, commentRate: 0.05 },
      { readingSpeed: 300, engagementRate: 0.7, commentRate: 0.3 },
      { readingSpeed: 220, engagementRate: 0.4, commentRate: 0.15 }
    ];

    for (let i = 0; i < count; i++) {
      const city = cities[i % cities.length];
      const behavior = behaviors[i % behaviors.length];
      
      users.push({
        id: `sim-user-${i + 1}`,
        name: `Simulated User ${i + 1}`,
        location: {
          lat: city.lat + (Math.random() - 0.5) * 0.1, // Add some randomness
          lng: city.lng + (Math.random() - 0.5) * 0.1,
          city: city.name
        },
        preferences: {
          categories: this.getRandomCategories(categories),
          radius: 25 + Math.random() * 50 // 25-75 km radius
        },
        behavior: behavior
      });
    }

    return users;
  }

  /**
   * Simulate user session
   */
  async simulateUserSession(user: SimulatedUser, durationMinutes: number = 10): Promise<SimulationResult> {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);
    const actions: SimulationResult['actions'] = [];

    console.log(`Starting simulation for user ${user.name} (${durationMinutes} minutes)`);

    // Get news articles for this user
    const { articles } = await this.realTimeNewsService.fetchNewsArticles({
      categories: user.preferences.categories,
      location: user.location,
      radius: user.preferences.radius,
      limit: 20
    });

    if (articles.length === 0) {
      console.log(`No articles found for user ${user.name}`);
      return {
        userId: user.id,
        actions: [],
        totalActions: 0,
        sessionDuration: 0
      };
    }

    // Simulate user behavior
    let currentTime = startTime;
    let articleIndex = 0;

    while (currentTime < endTime && articleIndex < articles.length) {
      const article = articles[articleIndex];
      
      // Simulate viewing the article
      const viewAction = {
        type: 'view' as const,
        articleId: article.id,
        timestamp: new Date(currentTime),
        duration: this.calculateReadingTime(article.content || '', user.behavior.readingSpeed)
      };
      
      actions.push(viewAction);
      
      // Record the view
      await this.engagementService.recordInteraction(
        user.id,
        article.id,
        'view',
        { duration: viewAction.duration }
      );

      // Simulate additional interactions based on engagement rate
      if (Math.random() < user.behavior.engagementRate) {
        const interactionType = this.getRandomInteractionType();
        
        if (interactionType === 'like') {
          await this.engagementService.toggleLike(user.id, article.id);
        } else if (interactionType === 'comment' && Math.random() < user.behavior.commentRate) {
          await this.simulateComment(user.id, article.id);
        } else if (interactionType === 'share') {
          await this.engagementService.recordInteraction(
            user.id,
            article.id,
            'share',
            { platform: 'internal' }
          );
        } else if (interactionType === 'bookmark') {
          await this.engagementService.recordInteraction(
            user.id,
            article.id,
            'bookmark',
            {}
          );
        }

        actions.push({
          type: interactionType,
          articleId: article.id,
          timestamp: new Date(currentTime.getTime() + viewAction.duration * 1000)
        });
      }

      // Move to next article
      articleIndex++;
      
      // Add some randomness to timing
      const timeBetweenArticles = 30 + Math.random() * 120; // 30-150 seconds
      currentTime = new Date(currentTime.getTime() + timeBetweenArticles * 1000);
    }

    const result: SimulationResult = {
      userId: user.id,
      actions,
      totalActions: actions.length,
      sessionDuration: endTime.getTime() - startTime.getTime()
    };

    this.activeSimulations.set(user.id, result);
    console.log(`Simulation completed for user ${user.name}: ${actions.length} actions`);

    return result;
  }

  /**
   * Run multi-user simulation
   */
  async runMultiUserSimulation(
    userCount: number = 5,
    durationMinutes: number = 10
  ): Promise<SimulationResult[]> {
    console.log(`Starting multi-user simulation: ${userCount} users for ${durationMinutes} minutes`);

    const users = this.createSimulatedUsers(userCount);
    const results: SimulationResult[] = [];

    // Run simulations in parallel
    const promises = users.map(user => 
      this.simulateUserSession(user, durationMinutes)
    );

    try {
      const simulationResults = await Promise.all(promises);
      results.push(...simulationResults);

      console.log(`Multi-user simulation completed: ${results.length} users simulated`);
      return results;
    } catch (error) {
      console.error('Multi-user simulation failed:', error);
      throw error;
    }
  }

  /**
   * Get simulation statistics
   */
  getSimulationStats(): {
    activeSimulations: number;
    totalActions: number;
    averageSessionDuration: number;
    userEngagement: Record<string, number>;
  } {
    const simulations = Array.from(this.activeSimulations.values());
    
    const totalActions = simulations.reduce((sum, sim) => sum + sim.totalActions, 0);
    const averageSessionDuration = simulations.length > 0 
      ? simulations.reduce((sum, sim) => sum + sim.sessionDuration, 0) / simulations.length
      : 0;

    const userEngagement: Record<string, number> = {};
    simulations.forEach(sim => {
      userEngagement[sim.userId] = sim.totalActions;
    });

    return {
      activeSimulations: simulations.length,
      totalActions,
      averageSessionDuration,
      userEngagement
    };
  }

  /**
   * Clear simulation results
   */
  clearSimulations(): void {
    this.activeSimulations.clear();
  }

  /**
   * Get random categories for user preferences
   */
  private getRandomCategories(allCategories: string[]): string[] {
    const count = 2 + Math.floor(Math.random() * 3); // 2-4 categories
    const shuffled = [...allCategories].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Calculate reading time based on content and user speed
   */
  private calculateReadingTime(content: string, wordsPerMinute: number): number {
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Get random interaction type
   */
  private getRandomInteractionType(): 'like' | 'comment' | 'share' | 'bookmark' {
    const types = ['like', 'comment', 'share', 'bookmark'];
    const weights = [0.4, 0.2, 0.2, 0.2]; // Like is most common
    
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < types.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return types[i] as any;
      }
    }
    
    return 'like';
  }

  /**
   * Simulate a comment
   */
  private async simulateComment(userId: string, articleId: string): Promise<void> {
    const comments = [
      'Interesting article!',
      'Thanks for sharing this.',
      'I agree with the points made here.',
      'This is very informative.',
      'Great read!',
      'I learned something new today.',
      'This is exactly what I was looking for.',
      'Very well written article.',
      'I have a different perspective on this.',
      'This raises some important questions.'
    ];

    const randomComment = comments[Math.floor(Math.random() * comments.length)];

    try {
      const { error } = await supabase
        .from('news_article_comments')
        .insert({
          article_id: articleId,
          user_id: userId,
          content: randomComment
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to simulate comment:', error);
    }
  }

  /**
   * Monitor real-time activity during simulation
   */
  async monitorRealTimeActivity(durationMinutes: number = 5): Promise<{
    events: Array<{
      type: string;
      timestamp: Date;
      data: any;
    }>;
    totalEvents: number;
  }> {
    const events: Array<{ type: string; timestamp: Date; data: any }> = [];
    const endTime = new Date(Date.now() + durationMinutes * 60 * 1000);

    // Subscribe to news articles changes
    const newsChannel = supabase
      .channel('simulation_monitoring_news')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'news_articles'
        },
        (payload) => {
          events.push({
            type: 'news_article_change',
            timestamp: new Date(),
            data: payload
          });
        }
      )
      .subscribe();

    // Subscribe to user interactions
    const interactionsChannel = supabase
      .channel('simulation_monitoring_interactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'news_article_interactions'
        },
        (payload) => {
          events.push({
            type: 'user_interaction',
            timestamp: new Date(),
            data: payload
          });
        }
      )
      .subscribe();

    // Subscribe to comments
    const commentsChannel = supabase
      .channel('simulation_monitoring_comments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'news_article_comments'
        },
        (payload) => {
          events.push({
            type: 'comment',
            timestamp: new Date(),
            data: payload
          });
        }
      )
      .subscribe();

    // Wait for monitoring duration
    await new Promise(resolve => setTimeout(resolve, durationMinutes * 60 * 1000));

    // Clean up subscriptions
    await supabase.removeChannel(newsChannel);
    await supabase.removeChannel(interactionsChannel);
    await supabase.removeChannel(commentsChannel);

    return {
      events,
      totalEvents: events.length
    };
  }
}
