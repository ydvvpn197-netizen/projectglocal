import { supabase } from '@/integrations/supabase/client';
import { AIIntegrationService } from './aiIntegrationService';
import { NewsSummary, SummarizationOptions } from './newsSummarizationService';

export interface EnhancedNewsSummary extends NewsSummary {
  aiGenerated: boolean;
  provider: string;
  processingTime: number;
  wordCount: number;
  language: string;
  entities?: string[];
  topics?: string[];
}

export class EnhancedNewsSummarizationService {
  private static instance: EnhancedNewsSummarizationService;
  private aiService: AIIntegrationService;
  private cache = new Map<string, EnhancedNewsSummary>();
  private fallbackEnabled = true;

  private constructor() {
    this.aiService = AIIntegrationService.getInstance();
  }

  public static getInstance(): EnhancedNewsSummarizationService {
    if (!EnhancedNewsSummarizationService.instance) {
      EnhancedNewsSummarizationService.instance = new EnhancedNewsSummarizationService();
    }
    return EnhancedNewsSummarizationService.instance;
  }

  /**
   * Generate enhanced summary for a news article
   */
  async generateEnhancedSummary(
    article: {
      id: string;
      title: string;
      content: string;
      description?: string;
    },
    options: SummarizationOptions = {}
  ): Promise<EnhancedNewsSummary> {
    const {
      maxLength = 150,
      includeKeyPoints = true,
      includeSentiment = true,
      includeTags = true,
      language = 'en'
    } = options;

    // Check cache first
    const cacheKey = `${article.id}-${maxLength}-${language}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const startTime = Date.now();
    let summary: EnhancedNewsSummary;

    try {
      // Try AI generation first
      const aiResponse = await this.aiService.generateAISummary(article, options);
      
      summary = {
        id: `summary-${article.id}-${Date.now()}`,
        articleId: article.id,
        summary: aiResponse.summary,
        keyPoints: aiResponse.keyPoints,
        sentiment: aiResponse.sentiment,
        confidence: aiResponse.confidence,
        readingTime: aiResponse.readingTime,
        tags: aiResponse.tags,
        createdAt: new Date().toISOString(),
        aiGenerated: true,
        provider: this.aiService.getCurrentProvider(),
        processingTime: Date.now() - startTime,
        wordCount: this.countWords(article.content),
        language,
        entities: this.extractEntities(article),
        topics: this.extractTopics(article)
      };

    } catch (aiError) {
      console.warn('AI summarization failed, falling back to rule-based approach:', aiError);
      
      if (this.fallbackEnabled) {
        // Fallback to rule-based summarization
        summary = await this.generateFallbackSummary(article, options, startTime);
      } else {
        throw aiError;
      }
    }

    // Cache the result
    this.cache.set(cacheKey, summary);

    // Store in database
    await this.storeEnhancedSummary(summary);

    return summary;
  }

  /**
   * Generate fallback summary using rule-based approach
   */
  private async generateFallbackSummary(
    article: { title: string; content: string; description?: string },
    options: SummarizationOptions,
    startTime: number
  ): Promise<EnhancedNewsSummary> {
    const {
      maxLength = 150,
      includeKeyPoints = true,
      includeSentiment = true,
      includeTags = true,
      language = 'en'
    } = options;

    // Use the existing rule-based summarization logic
    const summary = await this.createIntelligentSummary(article, maxLength);
    const keyPoints = includeKeyPoints ? this.extractKeyPoints(article) : [];
    const sentiment = includeSentiment ? this.analyzeSentiment(article) : 'neutral';
    const tags = includeTags ? this.extractTags(article) : [];
    const readingTime = this.calculateReadingTime(article.content);

    return {
      id: `summary-${Date.now()}`,
      articleId: article.id,
      summary,
      keyPoints,
      sentiment,
      confidence: 0.75, // Lower confidence for rule-based
      readingTime,
      tags,
      createdAt: new Date().toISOString(),
      aiGenerated: false,
      provider: 'rule-based',
      processingTime: Date.now() - startTime,
      wordCount: this.countWords(article.content),
      language,
      entities: this.extractEntities(article),
      topics: this.extractTopics(article)
    };
  }

  /**
   * Create intelligent summary using text processing (from original service)
   */
  private async createIntelligentSummary(
    article: { title: string; content: string; description?: string },
    maxLength: number
  ): Promise<string> {
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

    return keyPoints.slice(0, 5);
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
    
    return [...foundTags, ...locationFound].slice(0, 8);
  }

  /**
   * Calculate estimated reading time
   */
  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Extract entities from article
   */
  private extractEntities(article: { title: string; content: string }): string[] {
    const text = (article.title + ' ' + article.content);
    
    // Simple entity extraction (could be enhanced with NLP)
    const entities: string[] = [];
    
    // Extract capitalized words (potential proper nouns)
    const capitalizedWords = text.match(/\b[A-Z][a-z]+\b/g) || [];
    const uniqueWords = [...new Set(capitalizedWords)];
    
    // Filter out common words
    const commonWords = ['The', 'This', 'That', 'These', 'Those', 'A', 'An', 'And', 'Or', 'But'];
    const filteredWords = uniqueWords.filter(word => 
      !commonWords.includes(word) && word.length > 2
    );
    
    entities.push(...filteredWords.slice(0, 10));
    
    return entities;
  }

  /**
   * Extract topics from article
   */
  private extractTopics(article: { title: string; content: string }): string[] {
    const text = (article.title + ' ' + article.content).toLowerCase();
    
    const topicKeywords = {
      'Technology': ['tech', 'software', 'ai', 'artificial intelligence', 'digital', 'computer', 'internet'],
      'Business': ['business', 'company', 'corporate', 'finance', 'market', 'economy', 'investment'],
      'Health': ['health', 'medical', 'doctor', 'hospital', 'medicine', 'treatment', 'disease'],
      'Sports': ['sport', 'football', 'basketball', 'soccer', 'cricket', 'tennis', 'olympics'],
      'Politics': ['politics', 'government', 'election', 'president', 'minister', 'parliament', 'policy'],
      'Entertainment': ['entertainment', 'movie', 'music', 'celebrity', 'film', 'actor', 'singer'],
      'Science': ['science', 'research', 'study', 'discovery', 'experiment', 'scientist', 'laboratory'],
      'Environment': ['environment', 'climate', 'pollution', 'green', 'sustainable', 'renewable', 'carbon']
    };

    const foundTopics: string[] = [];
    
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      const hasKeywords = keywords.some(keyword => text.includes(keyword));
      if (hasKeywords) {
        foundTopics.push(topic);
      }
    });

    return foundTopics;
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
   * Store enhanced summary in database
   */
  private async storeEnhancedSummary(summary: EnhancedNewsSummary): Promise<void> {
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
          ai_generated: summary.aiGenerated,
          provider: summary.provider,
          processing_time: summary.processingTime,
          word_count: summary.wordCount,
          language: summary.language,
          entities: summary.entities,
          topics: summary.topics,
          created_at: summary.createdAt
        }, { onConflict: 'id' });

      if (error) throw error;
    } catch (error) {
      console.error('Error storing enhanced summary:', error);
    }
  }

  /**
   * Get enhanced summary for an article
   */
  async getEnhancedSummary(articleId: string): Promise<EnhancedNewsSummary | null> {
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
        createdAt: data.created_at,
        aiGenerated: data.ai_generated || false,
        provider: data.provider || 'unknown',
        processingTime: data.processing_time || 0,
        wordCount: data.word_count || 0,
        language: data.language || 'en',
        entities: data.entities || [],
        topics: data.topics || []
      };
    } catch (error) {
      console.error('Error fetching enhanced summary:', error);
      return null;
    }
  }

  /**
   * Batch generate enhanced summaries
   */
  async batchGenerateEnhancedSummaries(
    articles: Array<{ id: string; title: string; content: string; description?: string }>,
    options: SummarizationOptions = {}
  ): Promise<EnhancedNewsSummary[]> {
    const promises = articles.map(article => 
      this.generateEnhancedSummary(article, options)
    );

    try {
      return await Promise.all(promises);
    } catch (error) {
      console.error('Error batch generating enhanced summaries:', error);
      return [];
    }
  }

  /**
   * Set fallback enabled/disabled
   */
  setFallbackEnabled(enabled: boolean): void {
    this.fallbackEnabled = enabled;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}
