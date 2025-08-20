import { NewsArticle } from '@/types/news';

export interface CategoryResult {
  category: string;
  confidence: number;
  keywords: string[];
}

export class NewsCategorizer {
  private categoryKeywords: Record<string, string[]> = {
    'general': ['announcement', 'update', 'news', 'report'],
    'local': ['local', 'community', 'neighborhood', 'city', 'town'],
    'business': ['business', 'company', 'market', 'economy', 'finance'],
    'technology': ['technology', 'tech', 'software', 'digital', 'ai'],
    'entertainment': ['entertainment', 'movie', 'music', 'celebrity'],
    'sports': ['sport', 'football', 'basketball', 'game', 'team'],
    'health': ['health', 'medical', 'doctor', 'hospital', 'treatment'],
    'education': ['education', 'school', 'university', 'student'],
    'politics': ['politics', 'election', 'government', 'policy'],
    'environment': ['environment', 'climate', 'weather', 'green']
  };

  async categorizeArticle(article: NewsArticle): Promise<CategoryResult | null> {
    try {
      const text = `${article.title} ${article.description} ${article.content}`.toLowerCase();
      const categoryScores = this.calculateCategoryScores(text);
      const bestCategory = this.findBestCategory(categoryScores);
      
      if (bestCategory && bestCategory.confidence > 0.3) {
        return bestCategory;
      }
      
      return null;
    } catch (error) {
      console.error('Error categorizing article:', error);
      return null;
    }
  }

  private calculateCategoryScores(text: string): Record<string, { score: number; keywords: string[] }> {
    const scores: Record<string, { score: number; keywords: string[] }> = {};
    
    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      let score = 0;
      const matchedKeywords: string[] = [];
      
      for (const keyword of keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) {
          score += matches.length;
          matchedKeywords.push(keyword);
        }
      }
      
      scores[category] = { score, keywords: matchedKeywords };
    }
    
    return scores;
  }

  private findBestCategory(scores: Record<string, { score: number; keywords: string[] }>): CategoryResult | null {
    let bestCategory = '';
    let bestScore = 0;
    let bestKeywords: string[] = [];
    
    for (const [category, data] of Object.entries(scores)) {
      if (data.score > bestScore) {
        bestScore = data.score;
        bestCategory = category;
        bestKeywords = data.keywords;
      }
    }
    
    if (bestScore === 0) return null;
    
    const confidence = Math.min(bestScore / 10, 1.0);
    
    return {
      category: bestCategory,
      confidence,
      keywords: bestKeywords
    };
  }

  getAvailableCategories(): string[] {
    return Object.keys(this.categoryKeywords);
  }
}
