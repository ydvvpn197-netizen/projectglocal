/**
 * Unified News Service
 * Consolidates all news-related functionality into a single service
 */

import { resilientSupabase } from '@/integrations/supabase/client';

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary?: string;
  source: string;
  url: string;
  image_url?: string;
  published_at: string;
  cached_at: string;
  expires_at: string;
  city?: string;
  country?: string;
  category?: string;
  tags?: string[];
  ai_summary?: string;
  source_name?: string;
  location_name?: string;
  location_lat?: number;
  location_lng?: number;
}

export interface NewsSummary {
  id: string;
  article_id: string;
  summary: string;
  ai_model: string;
  confidence_score: number;
  created_at: string;
}

export interface NewsPreferences {
  preferred_cities: string[];
  preferred_countries: string[];
  preferred_sources: string[];
  preferred_categories: string[];
  excluded_sources: string[];
  excluded_categories: string[];
  preferred_keywords: string[];
  interaction_weight: number;
  locality_weight: number;
  recency_weight: number;
}

export class UnifiedNewsService {
  /**
   * Get news articles with caching and AI summarization
   */
  static async getNewsArticles(params: {
    city?: string;
    country?: string;
    category?: string;
    limit?: number;
    offset?: number;
    includeSummary?: boolean;
  } = {}): Promise<{ articles: NewsArticle[]; error?: string }> {
    try {
      let query = resilientSupabase
        .from('news_cache')
        .select('*')
        .order('published_at', { ascending: false });

      if (params.city) {
        query = query.eq('city', params.city);
      }
      if (params.country) {
        query = query.eq('country', params.country);
      }
      if (params.category) {
        query = query.eq('category', params.category);
      }
      if (params.limit) {
        query = query.limit(params.limit);
      }
      if (params.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching news articles:', error);
        return { articles: [], error: error.message };
      }

      // If summaries are requested, fetch them
      if (params.includeSummary && data) {
        const articleIds = data.map(article => article.article_id);
        const { data: summaries } = await resilientSupabase
          .from('news_summaries')
          .select('*')
          .in('article_id', articleIds);

        // Merge summaries with articles
        data.forEach(article => {
          const summary = summaries?.find(s => s.article_id === article.article_id);
          if (summary) {
            article.ai_summary = summary.summary;
          }
        });
      }

      return { articles: data || [] };
    } catch (error) {
      console.error('Error in getNewsArticles:', error);
      return { articles: [], error: 'Failed to fetch news articles' };
    }
  }

  /**
   * Generate AI summary for news article
   */
  static async generateNewsSummary(articleId: string, content: string): Promise<{ summary: string; error?: string }> {
    try {
      // This would integrate with your AI service
      // For now, return a simple summary
      const summary = content.substring(0, 200) + '...';
      
      // Store the summary
      const { error } = await resilientSupabase
        .from('news_summaries')
        .insert({
          article_id: articleId,
          summary,
          ai_model: 'gpt-3.5-turbo',
          confidence_score: 0.8
        });

      if (error) {
        console.error('Error storing news summary:', error);
        return { summary, error: error.message };
      }

      return { summary };
    } catch (error) {
      console.error('Error generating news summary:', error);
      return { summary: '', error: 'Failed to generate summary' };
    }
  }

  /**
   * Get user's news preferences
   */
  static async getUserNewsPreferences(userId: string): Promise<{ preferences: NewsPreferences | null; error?: string }> {
    try {
      const { data, error } = await resilientSupabase
        .from('user_news_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching news preferences:', error);
        return { preferences: null, error: error.message };
      }

      return { preferences: data };
    } catch (error) {
      console.error('Error in getUserNewsPreferences:', error);
      return { preferences: null, error: 'Failed to fetch preferences' };
    }
  }

  /**
   * Update user's news preferences
   */
  static async updateUserNewsPreferences(
    userId: string, 
    preferences: Partial<NewsPreferences>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await resilientSupabase
        .from('user_news_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          last_updated: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating news preferences:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updateUserNewsPreferences:', error);
      return { success: false, error: 'Failed to update preferences' };
    }
  }

  /**
   * Get trending news based on user preferences and location
   */
  static async getTrendingNews(
    userId: string,
    params: {
      city?: string;
      country?: string;
      limit?: number;
    } = {}
  ): Promise<{ articles: NewsArticle[]; error?: string }> {
    try {
      // Get user preferences
      const { preferences } = await this.getUserNewsPreferences(userId);
      
      let query = resilientSupabase
        .from('news_cache')
        .select('*')
        .order('published_at', { ascending: false });

      // Apply location filters
      if (params.city) {
        query = query.eq('city', params.city);
      } else if (preferences?.preferred_cities?.length) {
        query = query.in('city', preferences.preferred_cities);
      }

      if (params.country) {
        query = query.eq('country', params.country);
      } else if (preferences?.preferred_countries?.length) {
        query = query.in('country', preferences.preferred_countries);
      }

      // Apply category filters
      if (preferences?.preferred_categories?.length) {
        query = query.in('category', preferences.preferred_categories);
      }

      // Exclude unwanted sources/categories
      if (preferences?.excluded_sources?.length) {
        query = query.not('source', 'in', `(${preferences.excluded_sources.join(',')})`);
      }

      if (preferences?.excluded_categories?.length) {
        query = query.not('category', 'in', `(${preferences.excluded_categories.join(',')})`);
      }

      if (params.limit) {
        query = query.limit(params.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching trending news:', error);
        return { articles: [], error: error.message };
      }

      return { articles: data || [] };
    } catch (error) {
      console.error('Error in getTrendingNews:', error);
      return { articles: [], error: 'Failed to fetch trending news' };
    }
  }

  /**
   * Like a news article
   */
  static async likeNewsArticle(userId: string, articleId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await resilientSupabase
        .from('news_likes')
        .insert({
          user_id: userId,
          article_id: articleId
        });

      if (error) {
        console.error('Error liking news article:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in likeNewsArticle:', error);
      return { success: false, error: 'Failed to like article' };
    }
  }

  /**
   * Comment on a news article
   */
  static async commentOnNewsArticle(
    userId: string, 
    articleId: string, 
    content: string,
    parentId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await resilientSupabase
        .from('news_comments')
        .insert({
          user_id: userId,
          article_id: articleId,
          content,
          parent_id: parentId
        });

      if (error) {
        console.error('Error commenting on news article:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in commentOnNewsArticle:', error);
      return { success: false, error: 'Failed to comment on article' };
    }
  }

  /**
   * Share a news article
   */
  static async shareNewsArticle(
    userId: string, 
    articleId: string, 
    platform: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await resilientSupabase
        .from('news_shares')
        .insert({
          user_id: userId,
          article_id: articleId,
          share_platform: platform
        });

      if (error) {
        console.error('Error sharing news article:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in shareNewsArticle:', error);
      return { success: false, error: 'Failed to share article' };
    }
  }
}

export const unifiedNewsService = new UnifiedNewsService();
