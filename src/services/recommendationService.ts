import { supabase } from '@/integrations/supabase/client';
import { Recommendation, UserPreference, ContentScore } from '@/types/recommendations';
import { RecommendationAlgorithms } from '@/utils/recommendationAlgorithms';

export class RecommendationService {
  private static instance: RecommendationService;

  static getInstance(): RecommendationService {
    if (!RecommendationService.instance) {
      RecommendationService.instance = new RecommendationService();
    }
    return RecommendationService.instance;
  }

  async getRecommendations(userId: string, limit: number = 20): Promise<Recommendation[]> {
    try {
      // Get user profile with preferences and behavior
      const userProfile = await this.getUserProfile(userId);
      
      // Get available content
      const availableContent = await this.getAvailableContent(userId);
      
      // Generate recommendations using AI algorithms
      const recommendations = RecommendationAlgorithms.generateRecommendations(userProfile, availableContent, limit);
      
      return recommendations;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  private async getUserProfile(userId: string): Promise<any> {
    try {
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      const { data: behavior } = await supabase
        .from('user_behavior')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      return {
        userId,
        preferences: preferences || {},
        behavior: behavior || [],
        interests: preferences?.interests || [],
        location: preferences?.location || null
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return { userId, preferences: {}, behavior: [], interests: [], location: null };
    }
  }

  private async getAvailableContent(userId: string): Promise<any[]> {
    try {
      // Get posts, events, artists, etc.
      const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .neq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      const { data: events } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      const { data: artists } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_artist', true)
        .neq('id', userId)
        .limit(50);

      return [
        ...(posts || []).map(post => ({ ...post, type: 'post' })),
        ...(events || []).map(event => ({ ...event, type: 'event' })),
        ...(artists || []).map(artist => ({ ...artist, type: 'artist' }))
      ];
    } catch (error) {
      console.error('Error getting available content:', error);
      return [];
    }
  }

  private async generatePreferencesFromBehavior(userId: string): Promise<UserPreference[]> {
    const preferences: UserPreference[] = [];
    
    // Analyze user's posts
    const { data: posts } = await supabase
      .from('posts')
      .select('type, category')
      .eq('user_id', userId)
      .limit(100);

    if (posts) {
      const categoryCounts = new Map<string, number>();
      
      posts.forEach(post => {
        if (post.type) {
          categoryCounts.set(post.type, (categoryCounts.get(post.type) || 0) + 1);
        }
        if (post.category) {
          categoryCounts.set(post.category, (categoryCounts.get(post.category) || 0) + 1);
        }
      });

      // Convert to preferences
      categoryCounts.forEach((count, category) => {
        preferences.push({
          id: `${userId}-${category}`,
          userId,
          category,
          weight: Math.min(1, count / 10), // Normalize weight
          source: 'behavioral',
          lastUpdated: new Date().toISOString()
        });
      });
    }

    // Analyze user's likes
    const { data: likes } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', userId)
      .limit(100);

    if (likes) {
      for (const like of likes) {
        const { data: post } = await supabase
          .from('posts')
          .select('type, category')
          .eq('id', like.post_id)
          .single();

        if (post) {
          const existingPref = preferences.find(p => p.category === (post.type || post.category));
          if (existingPref) {
            existingPref.weight += 0.1;
          } else {
            preferences.push({
              id: `${userId}-${post.type || post.category}`,
              userId,
              category: post.type || post.category || 'general',
              weight: 0.1,
              source: 'behavioral',
              lastUpdated: new Date().toISOString()
            });
          }
        }
      }
    }

    return preferences;
  }

  private async getContentScores(userId: string, preferences: UserPreference[]): Promise<ContentScore[]> {
    const contentScores: ContentScore[] = [];
    
    // Get recent content
    const { data: posts } = await supabase
      .from('posts')
      .select(`
        id,
        user_id,
        title,
        content,
        type,
        category,
        likes_count,
        comments_count,
        created_at
      `)
      .eq('status', 'active')
      .neq('user_id', userId) // Don't recommend user's own content
      .order('created_at', { ascending: false })
      .limit(200);

    if (!posts) return contentScores;

    for (const post of posts) {
      const score = await this.calculateContentScore(post, preferences, userId);
      contentScores.push(score);
    }

    return contentScores;
  }

  private async calculateContentScore(
    content: any, 
    preferences: UserPreference[], 
    userId: string
  ): Promise<ContentScore> {
    let relevanceScore = 0;
    let popularityScore = 0;
    let freshnessScore = 0;
    let locationScore = 0;

    // Calculate relevance score based on user preferences
    preferences.forEach(pref => {
      if (content.type === pref.category || content.category === pref.category) {
        relevanceScore += pref.weight;
      }
    });

    // Calculate popularity score
    const engagement = (content.likes_count || 0) + (content.comments_count || 0) * 2;
    popularityScore = Math.min(1, engagement / 100);

    // Calculate freshness score
    const hoursSinceCreation = (Date.now() - new Date(content.created_at).getTime()) / (1000 * 60 * 60);
    freshnessScore = Math.max(0, 1 - (hoursSinceCreation / 168)); // 168 hours = 1 week

    // Calculate location score (if user has location)
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('latitude, longitude')
      .eq('user_id', userId)
      .single();

    if (userProfile?.latitude && userProfile?.longitude) {
      // For now, assume all content has some location relevance
      locationScore = 0.5;
    }

    // Calculate overall score
    const overallScore = (
      relevanceScore * 0.4 +
      popularityScore * 0.3 +
      freshnessScore * 0.2 +
      locationScore * 0.1
    );

    return {
      contentId: content.id,
      contentType: 'post',
      relevanceScore,
      popularityScore,
      freshnessScore,
      locationScore,
      overallScore,
      factors: {
        userInterest: relevanceScore,
        contentQuality: popularityScore,
        engagement: popularityScore,
        recency: freshnessScore,
        proximity: locationScore
      }
    };
  }

  private async generateRecommendations(
    userId: string, 
    contentScores: ContentScore[], 
    limit: number
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    
    // Sort by overall score
    const sortedScores = contentScores
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, limit);

    for (const score of sortedScores) {
      const reason = this.generateRecommendationReason(score);
      
      recommendations.push({
        id: `${userId}-${score.contentId}`,
        userId,
        contentId: score.contentId,
        contentType: score.contentType as any,
        score: score.overallScore,
        reason,
        algorithm: 'hybrid',
        metadata: {
          relevanceScore: score.relevanceScore,
          popularityScore: score.popularityScore,
          freshnessScore: score.freshnessScore,
          locationScore: score.locationScore
        },
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      });
    }

    return recommendations;
  }

  private generateRecommendationReason(score: ContentScore): string {
    const reasons: string[] = [];
    
    if (score.factors.userInterest > 0.5) {
      reasons.push('matches your interests');
    }
    
    if (score.factors.contentQuality > 0.7) {
      reasons.push('highly engaging content');
    }
    
    if (score.factors.recency > 0.8) {
      reasons.push('fresh content');
    }
    
    if (score.factors.proximity > 0.6) {
      reasons.push('local to you');
    }

    if (reasons.length === 0) {
      return 'trending in your area';
    }

    return reasons.join(', ');
  }

  async updateUserPreferences(userId: string, category: string, weight: number): Promise<void> {
    await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        category,
        weight,
        source: 'explicit',
        last_updated: new Date().toISOString()
      });
  }

  async trackUserBehavior(
    userId: string, 
    action: string, 
    contentType: string, 
    contentId: string
  ): Promise<void> {
    await supabase
      .from('user_behavior')
      .insert({
        user_id: userId,
        action,
        content_type: contentType,
        content_id: contentId,
        metadata: {},
        timestamp: new Date().toISOString(),
        session_id: `session-${Date.now()}`
      });
  }
}

export const recommendationService = RecommendationService.getInstance();
