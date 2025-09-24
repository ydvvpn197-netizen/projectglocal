import { NewsSource, NewsApiArticle, NewsArticle } from '@/types/news';

export class NewsProcessor {
  /**
   * Process and normalize a news article
   */
  processArticle(article: NewsApiArticle, source: NewsSource): NewsArticle {
    return {
      id: '', // Will be set by database
      source_id: source.id,
      external_id: this.generateExternalId(article),
      title: this.cleanTitle(article.title),
      description: this.cleanDescription(article.description),
      content: this.cleanContent(article.content),
      url: this.validateUrl(article.url),
      image_url: this.validateUrl(article.urlToImage),
      published_at: this.parseDate(article.publishedAt),
      author: this.cleanAuthor(article.author),
      category: this.detectCategory(article),
      tags: this.extractTags(article),
      location_lat: undefined, // Will be set by location extractor
      location_lng: undefined, // Will be set by location extractor
      location_name: undefined, // Will be set by location extractor
      relevance_score: 0.5, // Will be calculated later
      engagement_score: 0.0,
      is_verified: this.isVerifiedSource(source),
      is_featured: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Clean and normalize article title
   */
  private cleanTitle(title: string): string {
    if (!title) return 'Untitled Article';
    
    // Remove extra whitespace
    let cleaned = title.trim().replace(/\s+/g, ' ');
    
    // Remove common prefixes
    const prefixes = ['BREAKING:', 'UPDATE:', 'LIVE:', 'EXCLUSIVE:'];
    for (const prefix of prefixes) {
      if (cleaned.toUpperCase().startsWith(prefix)) {
        cleaned = cleaned.substring(prefix.length).trim();
      }
    }
    
    // Capitalize first letter
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  /**
   * Clean and normalize article description
   */
  private cleanDescription(description?: string): string | undefined {
    if (!description) return undefined;
    
    // Remove HTML tags
    let cleaned = description.replace(/<[^>]*>/g, '');
    
    // Remove extra whitespace
    cleaned = cleaned.trim().replace(/\s+/g, ' ');
    
    // Truncate if too long
    if (cleaned.length > 500) {
      cleaned = cleaned.substring(0, 497) + '...';
    }
    
    return cleaned;
  }

  /**
   * Clean and normalize article content
   */
  private cleanContent(content?: string): string | undefined {
    if (!content) return undefined;
    
    // Remove HTML tags
    let cleaned = content.replace(/<[^>]*>/g, '');
    
    // Remove extra whitespace
    cleaned = cleaned.trim().replace(/\s+/g, ' ');
    
    // Truncate if too long
    if (cleaned.length > 2000) {
      cleaned = cleaned.substring(0, 1997) + '...';
    }
    
    return cleaned;
  }

  /**
   * Validate and clean URL
   */
  private validateUrl(url?: string): string | undefined {
    if (!url) return undefined;
    
    try {
      // Ensure URL has protocol
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      new URL(url); // Validate URL format
      return url;
    } catch {
      return undefined;
    }
  }

  /**
   * Parse and validate date
   */
  private parseDate(dateString?: string): string | undefined {
    if (!dateString) return undefined;
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return undefined;
      }
      return date.toISOString();
    } catch {
      return undefined;
    }
  }

  /**
   * Clean and normalize author name
   */
  private cleanAuthor(author?: string): string | undefined {
    if (!author) return undefined;
    
    // Remove extra whitespace
    let cleaned = author.trim().replace(/\s+/g, ' ');
    
    // Remove common suffixes
    const suffixes = ['Reuters', 'AP', 'AFP', 'Associated Press'];
    for (const suffix of suffixes) {
      if (cleaned.includes(suffix)) {
        cleaned = cleaned.replace(suffix, '').trim();
      }
    }
    
    return cleaned || undefined;
  }

  /**
   * Detect article category based on content
   */
  private detectCategory(article: NewsApiArticle): string {
    const text = `${article.title} ${article.description} ${article.content}`.toLowerCase();
    
    // Category keywords
    const categoryKeywords: Record<string, string[]> = {
      'technology': ['tech', 'software', 'app', 'digital', 'ai', 'artificial intelligence', 'startup', 'innovation'],
      'business': ['business', 'economy', 'market', 'finance', 'investment', 'company', 'corporate'],
      'sports': ['sport', 'football', 'basketball', 'baseball', 'soccer', 'tennis', 'olympics', 'championship'],
      'entertainment': ['movie', 'film', 'music', 'celebrity', 'hollywood', 'entertainment', 'show'],
      'health': ['health', 'medical', 'doctor', 'hospital', 'disease', 'treatment', 'medicine'],
      'politics': ['politics', 'government', 'election', 'president', 'congress', 'policy'],
      'science': ['science', 'research', 'study', 'scientist', 'discovery', 'experiment'],
      'environment': ['environment', 'climate', 'weather', 'pollution', 'green', 'sustainability']
    };
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          return category;
        }
      }
    }
    
    return 'general';
  }

  /**
   * Extract tags from article content
   */
  private extractTags(article: NewsApiArticle): string[] {
    const text = `${article.title} ${article.description} ${article.content}`.toLowerCase();
    const tags: string[] = [];
    
    // Extract hashtags
    const hashtags = text.match(/#\w+/g) || [];
    tags.push(...hashtags.map(tag => tag.substring(1)));
    
    // Extract common entities (simplified)
    const entities = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
    const uniqueEntities = [...new Set(entities)].slice(0, 5); // Limit to 5 tags
    tags.push(...uniqueEntities);
    
    return tags.slice(0, 10); // Limit total tags to 10
  }

  /**
   * Generate external ID for article
   */
  private generateExternalId(article: NewsApiArticle): string {
    // Use URL hash or generate from title and source
    if (article.url) {
      try {
        const url = new URL(article.url);
        return `${url.hostname}-${this.hashString(article.title)}`;
      } catch {
        // Fallback to title hash
      }
    }
    
    return `${article.source.name}-${this.hashString(article.title)}`;
  }

  /**
   * Simple string hashing function
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Check if source is verified
   */
  private isVerifiedSource(source: NewsSource): boolean {
    const verifiedSources = [
      'Reuters',
      'Associated Press',
      'BBC News',
      'CNN',
      'The New York Times',
      'The Washington Post',
      'USA Today'
    ];
    
    return verifiedSources.some(verified => 
      source.name.toLowerCase().includes(verified.toLowerCase())
    );
  }

  /**
   * Deduplicate articles
   */
  deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
    const seen = new Set<string>();
    const unique: NewsArticle[] = [];
    
    for (const article of articles) {
      const key = this.getDeduplicationKey(article);
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(article);
      }
    }
    
    return unique;
  }

  /**
   * Get deduplication key for article
   */
  private getDeduplicationKey(article: NewsArticle): string {
    // Use title and source for deduplication
    return `${article.source_id}-${this.normalizeTitle(article.title)}`;
  }

  /**
   * Normalize title for deduplication
   */
  private normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Filter articles by quality
   */
  filterByQuality(articles: NewsArticle[], minQuality: number = 0.3): NewsArticle[] {
    return articles.filter(article => {
      const quality = this.calculateQualityScore(article);
      return quality >= minQuality;
    });
  }

  /**
   * Calculate quality score for article
   */
  private calculateQualityScore(article: NewsArticle): number {
    let score = 0;
    
    // Title quality
    if (article.title && article.title.length > 10) score += 0.2;
    
    // Description quality
    if (article.description && article.description.length > 50) score += 0.2;
    
    // Author quality
    if (article.author) score += 0.1;
    
    // Image quality
    if (article.image_url) score += 0.1;
    
    // Source verification
    if (article.is_verified) score += 0.2;
    
    // URL quality
    if (article.url) score += 0.1;
    
    // Content length
    if (article.content && article.content.length > 100) score += 0.1;
    
    return Math.min(score, 1.0);
  }
}
