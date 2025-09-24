import { supabase } from '@/integrations/supabase/client';

export interface NewsEngagement {
  id: string;
  article_id: string;
  user_id: string;
  interaction_type: 'view' | 'like' | 'share' | 'bookmark' | 'comment' | 'read_more';
  interaction_data?: {
    share_platform?: string;
    comment_id?: string;
    read_duration?: number; // in seconds
    scroll_depth?: number; // percentage
    time_on_page?: number; // in seconds
  };
  created_at: string;
}

export interface EngagementAnalytics {
  article_id: string;
  total_views: number;
  unique_views: number;
  total_likes: number;
  total_shares: number;
  total_bookmarks: number;
  total_comments: number;
  total_read_more_clicks: number;
  average_read_duration: number;
  average_scroll_depth: number;
  engagement_score: number;
  top_interaction_type: string;
  user_engagement: {
    has_viewed: boolean;
    has_liked: boolean;
    has_shared: boolean;
    has_bookmarked: boolean;
    has_commented: boolean;
    has_clicked_read_more: boolean;
  };
}

export interface NewsTrends {
  trending_articles: Array<{
    article_id: string;
    title: string;
    engagement_score: number;
    growth_rate: number;
  }>;
  popular_categories: Array<{
    category: string;
    engagement_count: number;
    growth_rate: number;
  }>;
  peak_engagement_times: Array<{
    hour: number;
    engagement_count: number;
  }>;
  user_behavior_insights: {
    average_session_duration: number;
    most_engaged_demographics: string[];
    preferred_content_types: string[];
  };
}

export class NewsEngagementService {
  private static instance: NewsEngagementService;
  private engagementCache = new Map<string, EngagementAnalytics>();

  private constructor() {}

  public static getInstance(): NewsEngagementService {
    if (!NewsEngagementService.instance) {
      NewsEngagementService.instance = new NewsEngagementService();
    }
    return NewsEngagementService.instance;
  }

  /**
   * Track user engagement with a news article
   */
  public async trackEngagement(
    articleId: string,
    userId: string,
    interactionType: NewsEngagement['interaction_type'],
    interactionData?: NewsEngagement['interaction_data']
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('news_article_interactions')
        .upsert({
          article_id: articleId,
          user_id: userId,
          interaction_type: interactionType,
          interaction_data: interactionData || {},
          created_at: new Date().toISOString()
        }, { onConflict: 'article_id,user_id,interaction_type' });

      if (error) throw error;

      // Clear cache for this article
      this.engagementCache.delete(articleId);

      // Update article engagement score
      await this.updateArticleEngagementScore(articleId);

      return { success: true };
    } catch (error) {
      console.error('Error tracking engagement:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to track engagement' 
      };
    }
  }

  /**
   * Track article view with detailed analytics
   */
  public async trackArticleView(
    articleId: string,
    userId: string,
    viewData: {
      read_duration?: number;
      scroll_depth?: number;
      time_on_page?: number;
    }
  ): Promise<{ success: boolean; error?: string }> {
    return this.trackEngagement(articleId, userId, 'view', viewData);
  }

  /**
   * Track like/unlike
   */
  public async trackLike(
    articleId: string,
    userId: string,
    isLiked: boolean
  ): Promise<{ success: boolean; error?: string }> {
    if (isLiked) {
      return this.trackEngagement(articleId, userId, 'like');
    } else {
      // Remove like
      try {
        const { error } = await supabase
          .from('news_article_interactions')
          .delete()
          .eq('article_id', articleId)
          .eq('user_id', userId)
          .eq('interaction_type', 'like');

        if (error) throw error;

        this.engagementCache.delete(articleId);
        await this.updateArticleEngagementScore(articleId);

        return { success: true };
      } catch (error) {
        console.error('Error removing like:', error);
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to remove like' 
        };
      }
    }
  }

  /**
   * Track share
   */
  public async trackShare(
    articleId: string,
    userId: string,
    sharePlatform: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.trackEngagement(articleId, userId, 'share', {
      share_platform: sharePlatform
    });
  }

  /**
   * Track bookmark
   */
  public async trackBookmark(
    articleId: string,
    userId: string,
    isBookmarked: boolean
  ): Promise<{ success: boolean; error?: string }> {
    if (isBookmarked) {
      return this.trackEngagement(articleId, userId, 'bookmark');
    } else {
      // Remove bookmark
      try {
        const { error } = await supabase
          .from('news_article_interactions')
          .delete()
          .eq('article_id', articleId)
          .eq('user_id', userId)
          .eq('interaction_type', 'bookmark');

        if (error) throw error;

        this.engagementCache.delete(articleId);
        await this.updateArticleEngagementScore(articleId);

        return { success: true };
      } catch (error) {
        console.error('Error removing bookmark:', error);
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to remove bookmark' 
        };
      }
    }
  }

  /**
   * Track read more click
   */
  public async trackReadMore(
    articleId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.trackEngagement(articleId, userId, 'read_more');
  }

  /**
   * Get engagement analytics for an article
   */
  public async getArticleEngagement(
    articleId: string,
    userId?: string
  ): Promise<EngagementAnalytics | null> {
    // Check cache first
    const cacheKey = `${articleId}-${userId || 'anonymous'}`;
    if (this.engagementCache.has(cacheKey)) {
      return this.engagementCache.get(cacheKey)!;
    }

    try {
      // Get all interactions for this article
      const { data: interactions, error } = await supabase
        .from('news_article_interactions')
        .select('*')
        .eq('article_id', articleId);

      if (error) throw error;

      // Calculate analytics
      const analytics: EngagementAnalytics = {
        article_id: articleId,
        total_views: 0,
        unique_views: 0,
        total_likes: 0,
        total_shares: 0,
        total_bookmarks: 0,
        total_comments: 0,
        total_read_more_clicks: 0,
        average_read_duration: 0,
        average_scroll_depth: 0,
        engagement_score: 0,
        top_interaction_type: 'view',
        user_engagement: {
          has_viewed: false,
          has_liked: false,
          has_shared: false,
          has_bookmarked: false,
          has_commented: false,
          has_clicked_read_more: false
        }
      };

      const interactionsByType = new Map<string, number>();
      const uniqueUsers = new Set<string>();
      let totalReadDuration = 0;
      let totalScrollDepth = 0;
      let readDurationCount = 0;
      let scrollDepthCount = 0;

      (interactions || []).forEach(interaction => {
        uniqueUsers.add(interaction.user_id);
        interactionsByType.set(
          interaction.interaction_type,
          (interactionsByType.get(interaction.interaction_type) || 0) + 1
        );

        // Count specific interactions
        switch (interaction.interaction_type) {
          case 'view':
            analytics.total_views++;
            if (interaction.interaction_data?.read_duration) {
              totalReadDuration += interaction.interaction_data.read_duration;
              readDurationCount++;
            }
            if (interaction.interaction_data?.scroll_depth) {
              totalScrollDepth += interaction.interaction_data.scroll_depth;
              scrollDepthCount++;
            }
            break;
          case 'like':
            analytics.total_likes++;
            break;
          case 'share':
            analytics.total_shares++;
            break;
          case 'bookmark':
            analytics.total_bookmarks++;
            break;
          case 'comment':
            analytics.total_comments++;
            break;
          case 'read_more':
            analytics.total_read_more_clicks++;
            break;
        }

        // Check user-specific engagement
        if (userId && interaction.user_id === userId) {
          switch (interaction.interaction_type) {
            case 'view':
              analytics.user_engagement.has_viewed = true;
              break;
            case 'like':
              analytics.user_engagement.has_liked = true;
              break;
            case 'share':
              analytics.user_engagement.has_shared = true;
              break;
            case 'bookmark':
              analytics.user_engagement.has_bookmarked = true;
              break;
            case 'comment':
              analytics.user_engagement.has_commented = true;
              break;
            case 'read_more':
              analytics.user_engagement.has_clicked_read_more = true;
              break;
          }
        }
      });

      // Calculate derived metrics
      analytics.unique_views = uniqueUsers.size;
      analytics.average_read_duration = readDurationCount > 0 ? totalReadDuration / readDurationCount : 0;
      analytics.average_scroll_depth = scrollDepthCount > 0 ? totalScrollDepth / scrollDepthCount : 0;

      // Calculate engagement score (weighted combination)
      analytics.engagement_score = 
        (analytics.total_views * 1) +
        (analytics.total_likes * 3) +
        (analytics.total_shares * 5) +
        (analytics.total_bookmarks * 2) +
        (analytics.total_comments * 4) +
        (analytics.total_read_more_clicks * 2);

      // Find top interaction type
      let maxCount = 0;
      interactionsByType.forEach((count, type) => {
        if (count > maxCount) {
          maxCount = count;
          analytics.top_interaction_type = type;
        }
      });

      // Cache the result
      this.engagementCache.set(cacheKey, analytics);

      return analytics;
    } catch (error) {
      console.error('Error getting article engagement:', error);
      return null;
    }
  }

  /**
   * Get news trends and analytics
   */
  public async getNewsTrends(timeRange: '1h' | '6h' | '24h' | '7d' = '24h'): Promise<NewsTrends | null> {
    try {
      const timeRanges = {
        '1h': 60 * 60 * 1000,
        '6h': 6 * 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000
      };

      const timeLimit = new Date(Date.now() - timeRanges[timeRange]);

      // Get recent interactions
      const { data: interactions, error } = await supabase
        .from('news_article_interactions')
        .select(`
          *,
          news_articles (
            id,
            title,
            category
          )
        `)
        .gte('created_at', timeLimit.toISOString());

      if (error) throw error;

      // Get articles for context
      const { data: articles, error: articlesError } = await supabase
        .from('news_articles')
        .select('id, title, category, engagement_score')
        .gte('published_at', timeLimit.toISOString());

      if (articlesError) throw articlesError;

      // Calculate trends
      const articleEngagement = new Map<string, { score: number; interactions: number }>();
      const categoryEngagement = new Map<string, number>();
      const hourlyEngagement = new Map<number, number>();

      (interactions || []).forEach(interaction => {
        const articleId = interaction.article_id;
        const category = interaction.news_articles?.category || 'unknown';
        const hour = new Date(interaction.created_at).getHours();

        // Article engagement
        if (!articleEngagement.has(articleId)) {
          articleEngagement.set(articleId, { score: 0, interactions: 0 });
        }
        const articleData = articleEngagement.get(articleId)!;
        articleData.interactions++;
        
        // Weight interactions
        const weight = {
          'view': 1,
          'like': 3,
          'share': 5,
          'bookmark': 2,
          'comment': 4,
          'read_more': 2
        }[interaction.interaction_type] || 1;
        
        articleData.score += weight;

        // Category engagement
        categoryEngagement.set(category, (categoryEngagement.get(category) || 0) + weight);

        // Hourly engagement
        hourlyEngagement.set(hour, (hourlyEngagement.get(hour) || 0) + 1);
      });

      // Build trending articles
      const trendingArticles = Array.from(articleEngagement.entries())
        .map(([articleId, data]) => {
          const article = articles?.find(a => a.id === articleId);
          return {
            article_id: articleId,
            title: article?.title || 'Unknown Article',
            engagement_score: data.score,
            growth_rate: data.interactions // Simplified growth rate
          };
        })
        .sort((a, b) => b.engagement_score - a.engagement_score)
        .slice(0, 10);

      // Build popular categories
      const popularCategories = Array.from(categoryEngagement.entries())
        .map(([category, count]) => ({
          category,
          engagement_count: count,
          growth_rate: count // Simplified growth rate
        }))
        .sort((a, b) => b.engagement_count - a.engagement_count)
        .slice(0, 5);

      // Build peak engagement times
      const peakEngagementTimes = Array.from(hourlyEngagement.entries())
        .map(([hour, count]) => ({ hour, engagement_count: count }))
        .sort((a, b) => b.engagement_count - a.engagement_count)
        .slice(0, 5);

      const trends: NewsTrends = {
        trending_articles: trendingArticles,
        popular_categories: popularCategories,
        peak_engagement_times: peakEngagementTimes,
        user_behavior_insights: {
          average_session_duration: 180, // 3 minutes - would be calculated from actual data
          most_engaged_demographics: ['25-34', '35-44'], // Would be calculated from user data
          preferred_content_types: ['community', 'infrastructure', 'business']
        }
      };

      return trends;
    } catch (error) {
      console.error('Error getting news trends:', error);
      return null;
    }
  }

  /**
   * Update article engagement score
   */
  private async updateArticleEngagementScore(articleId: string): Promise<void> {
    try {
      await supabase.rpc('update_article_engagement_score', {
        article_uuid: articleId
      });
    } catch (error) {
      console.error('Error updating article engagement score:', error);
    }
  }

  /**
   * Get user's engagement history
   */
  public async getUserEngagementHistory(
    userId: string,
    limit: number = 50
  ): Promise<NewsEngagement[]> {
    try {
      const { data, error } = await supabase
        .from('news_article_interactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting user engagement history:', error);
      return [];
    }
  }

  /**
   * Clear engagement cache
   */
  public clearCache(): void {
    this.engagementCache.clear();
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.engagementCache.size,
      keys: Array.from(this.engagementCache.keys())
    };
  }
}

export const newsEngagementService = NewsEngagementService.getInstance();
