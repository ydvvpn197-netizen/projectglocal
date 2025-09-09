import { supabase } from '../integrations/supabase/client';
import { aiSummarizationService } from './aiSummarizationService';

export interface NewsSummary {
  id: string;
  articleId: string;
  summary: string;
  keyPoints: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  readingTime: number; // in minutes
  tags: string[];
  createdAt: string;
}

export interface SummarizationOptions {
  maxLength?: number;
  includeKeyPoints?: boolean;
  includeSentiment?: boolean;
  includeTags?: boolean;
  language?: string;
}

export class NewsSummarizationService {
  private static instance: NewsSummarizationService;
  private cache = new Map<string, NewsSummary>();

  private constructor() {}

  public static getInstance(): NewsSummarizationService {
    if (!NewsSummarizationService.instance) {
      NewsSummarizationService.instance = new NewsSummarizationService();
    }
    return NewsSummarizationService.instance;
  }

  /**
   * Generate a summary for a news article
   */
  public async generateSummary(
    article: {
      id: string;
      title: string;
      content: string;
      description?: string;
    },
    options: SummarizationOptions = {}
  ): Promise<NewsSummary> {
    const {
      maxLength = 150,
      includeKeyPoints = true,
      includeSentiment = true,
      includeTags = true,
      language = 'en'
    } = options;

    // Check cache first
    const cacheKey = `${article.id}-${maxLength}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // Generate intelligent summary using AI
      const summary = await this.createIntelligentSummary(article, maxLength);
      const keyPoints = includeKeyPoints ? this.extractKeyPoints(article) : [];
      const sentiment = includeSentiment ? this.analyzeSentiment(article) : 'neutral';
      const tags = includeTags ? this.extractTags(article) : [];
      const readingTime = this.calculateReadingTime(article.content);

      const newsSummary: NewsSummary = {
        id: `summary-${article.id}-${Date.now()}`,
        articleId: article.id,
        summary,
        keyPoints,
        sentiment,
        confidence: 0.85, // In production, this would come from the AI model
        readingTime,
        tags,
        createdAt: new Date().toISOString()
      };

      // Cache the result
      this.cache.set(cacheKey, newsSummary);

      // Store in database
      await this.storeSummary(newsSummary);

      return newsSummary;
    } catch (error) {
      console.error('Error generating summary:', error);
      throw error;
    }
  }

  /**
   * Create an intelligent summary using AI
   */
  private async createIntelligentSummary(
    article: { title: string; content: string; description?: string },
    maxLength: number
  ): Promise<string> {
    try {
      // Use the AI summarization service
      const summary = await aiSummarizationService.generateSummary(article.content, article.title);
      
      // Ensure it doesn't exceed max length
      if (summary.length > maxLength) {
        return summary.substring(0, maxLength - 3) + '...';
      }
      
      return summary;
    } catch (error) {
      console.error('Error generating AI summary:', error);
      // Fallback to basic summarization
      return this.createBasicSummary(article, maxLength);
    }
  }

  /**
   * Create a basic summary as fallback
   */
  private createBasicSummary(
    article: { title: string; content: string; description?: string },
    maxLength: number
  ): string {
    // Use the description if available and within length
    if (article.description && article.description.length <= maxLength) {
      return article.description;
    }

    // Extract sentences and score them
    const sentences = this.extractSentences(article.content);
    const scoredSentences = this.scoreSentences(sentences, article.title);
    
    // Select top sentences
    const selectedSentences = this.selectTopSentences(scoredSentences, maxLength);
    
    // Combine and clean up
    let summary = selectedSentences.join(' ');
    
    // Ensure it doesn't exceed max length
    if (summary.length > maxLength) {
      summary = summary.substring(0, maxLength - 3) + '...';
    }

    return summary;
  }

  /**
   * Extract key points from the article
   */
  private extractKeyPoints(article: { title: string; content: string }): string[] {
    const keyPoints: string[] = [];
    
    // Extract from title
    const titleWords = article.title.toLowerCase().split(' ');
    const importantWords = titleWords.filter(word => 
      !['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'].includes(word)
    );
    
    if (importantWords.length > 0) {
      keyPoints.push(`Focus on: ${importantWords.slice(0, 3).join(', ')}`);
    }

    // Extract from content using simple patterns
    const sentences = this.extractSentences(article.content);
    const importantSentences = sentences
      .filter(sentence => 
        sentence.includes('announced') || 
        sentence.includes('launched') || 
        sentence.includes('opened') || 
        sentence.includes('completed') ||
        sentence.includes('started') ||
        sentence.includes('revealed')
      )
      .slice(0, 3);

    keyPoints.push(...importantSentences.map(sentence => 
      sentence.length > 100 ? sentence.substring(0, 100) + '...' : sentence
    ));

    return keyPoints.slice(0, 5); // Limit to 5 key points
  }

  /**
   * Analyze sentiment of the article
   */
  private analyzeSentiment(article: { title: string; content: string }): 'positive' | 'negative' | 'neutral' {
    const positiveWords = [
      'success', 'achievement', 'growth', 'improvement', 'launch', 'opening', 'celebration',
      'breakthrough', 'innovation', 'progress', 'development', 'expansion', 'partnership',
      'collaboration', 'award', 'recognition', 'milestone', 'victory', 'triumph'
    ];

    const negativeWords = [
      'crisis', 'problem', 'issue', 'concern', 'challenge', 'difficulty', 'failure',
      'decline', 'reduction', 'cut', 'loss', 'damage', 'accident', 'incident',
      'controversy', 'scandal', 'conflict', 'dispute', 'protest', 'strike'
    ];

    const text = (article.title + ' ' + article.content).toLowerCase();
    
    const positiveCount = positiveWords.reduce((count, word) => 
      count + (text.split(word).length - 1), 0
    );
    
    const negativeCount = negativeWords.reduce((count, word) => 
      count + (text.split(word).length - 1), 0
    );

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * Extract relevant tags from the article
   */
  private extractTags(article: { title: string; content: string }): string[] {
    const commonTags = [
      'community', 'development', 'infrastructure', 'business', 'technology',
      'environment', 'health', 'education', 'culture', 'arts', 'sports',
      'government', 'politics', 'economy', 'transportation', 'housing',
      'safety', 'security', 'innovation', 'startup', 'local'
    ];

    const text = (article.title + ' ' + article.content).toLowerCase();
    const foundTags = commonTags.filter(tag => text.includes(tag));
    
    // Add location-based tags
    const locationTags = ['delhi', 'mumbai', 'bangalore', 'chennai', 'kolkata'];
    const locationFound = locationTags.filter(location => text.includes(location));
    
    return [...foundTags, ...locationFound].slice(0, 8); // Limit to 8 tags
  }

  /**
   * Calculate estimated reading time
   */
  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200; // Average reading speed
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Extract sentences from text
   */
  private extractSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 20);
  }

  /**
   * Score sentences based on relevance
   */
  private scoreSentences(sentences: string[], title: string): Array<{ sentence: string; score: number }> {
    const titleWords = title.toLowerCase().split(/\s+/);
    
    return sentences.map(sentence => {
      let score = 0;
      const sentenceLower = sentence.toLowerCase();
      
      // Score based on title word matches
      titleWords.forEach(word => {
        if (sentenceLower.includes(word)) {
          score += 2;
        }
      });
      
      // Score based on position (first sentences are more important)
      const position = sentences.indexOf(sentence);
      score += Math.max(0, 5 - position);
      
      // Score based on length (not too short, not too long)
      const length = sentence.length;
      if (length > 50 && length < 200) {
        score += 1;
      }
      
      // Score based on important words
      const importantWords = ['announced', 'launched', 'opened', 'completed', 'started', 'revealed'];
      importantWords.forEach(word => {
        if (sentenceLower.includes(word)) {
          score += 3;
        }
      });
      
      return { sentence, score };
    });
  }

  /**
   * Select top sentences for summary
   */
  private selectTopSentences(
    scoredSentences: Array<{ sentence: string; score: number }>,
    maxLength: number
  ): string[] {
    // Sort by score
    const sorted = scoredSentences.sort((a, b) => b.score - a.score);
    
    const selected: string[] = [];
    let currentLength = 0;
    
    for (const { sentence } of sorted) {
      if (currentLength + sentence.length <= maxLength) {
        selected.push(sentence);
        currentLength += sentence.length;
      }
      
      if (selected.length >= 3) break; // Limit to 3 sentences
    }
    
    return selected;
  }

  /**
   * Store summary in database
   */
  private async storeSummary(summary: NewsSummary): Promise<void> {
    try {
      const { error } = await supabase
        .from('news_article_summaries')
        .upsert({
          id: summary.id,
          article_id: summary.articleId,
          summary: summary.summary,
          key_points: summary.keyPoints,
          sentiment: summary.sentiment,
          confidence: summary.confidence,
          reading_time: summary.readingTime,
          tags: summary.tags,
          created_at: summary.createdAt
        }, { onConflict: 'id' });

      if (error) throw error;
    } catch (error) {
      console.error('Error storing summary:', error);
    }
  }

  /**
   * Get summary for an article
   */
  public async getSummary(articleId: string): Promise<NewsSummary | null> {
    try {
      const { data, error } = await supabase
        .from('news_article_summaries')
        .select('*')
        .eq('article_id', articleId)
        .single();

      if (error) throw error;

      if (!data) return null;

      return {
        id: data.id,
        articleId: data.article_id,
        summary: data.summary,
        keyPoints: data.key_points || [],
        sentiment: data.sentiment,
        confidence: data.confidence,
        readingTime: data.reading_time,
        tags: data.tags || [],
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Error fetching summary:', error);
      return null;
    }
  }

  /**
   * Batch generate summaries for multiple articles
   */
  public async batchGenerateSummaries(
    articles: Array<{ id: string; title: string; content: string; description?: string }>,
    options: SummarizationOptions = {}
  ): Promise<NewsSummary[]> {
    const promises = articles.map(article => 
      this.generateSummary(article, options)
    );

    try {
      return await Promise.all(promises);
    } catch (error) {
      console.error('Error batch generating summaries:', error);
      return [];
    }
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const newsSummarizationService = NewsSummarizationService.getInstance();