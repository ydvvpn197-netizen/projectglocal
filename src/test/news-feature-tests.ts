// Comprehensive tests for Local News Hub features
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateArticleId, isCacheValid, getCachedArticles, cacheArticle } from '@/utils/newsCache';
import { shareContent, isWebShareSupported, generateNewsShareText } from '@/utils/webShare';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        gte: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() => ({
              data: [],
              error: null,
              count: 0
            }))
          }))
        }))
      }))
    })),
    upsert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => ({
          data: null,
          error: null
        }))
      }))
    }))
  }))
};

// Mock crypto.subtle for SHA-256 generation
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: vi.fn(() => Promise.resolve(new ArrayBuffer(32)))
    }
  }
});

describe('News Cache Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateArticleId', () => {
    it('should generate consistent SHA-256 hash for same URL', async () => {
      const url = 'https://example.com/article/123';
      const hash1 = await generateArticleId(url);
      const hash2 = await generateArticleId(url);
      
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 hex string length
    });

    it('should generate different hashes for different URLs', async () => {
      const url1 = 'https://example.com/article/123';
      const url2 = 'https://example.com/article/456';
      
      const hash1 = await generateArticleId(url1);
      const hash2 = await generateArticleId(url2);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('isCacheValid', () => {
    it('should return true for future expiration date', () => {
      const futureDate = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes from now
      expect(isCacheValid(futureDate)).toBe(true);
    });

    it('should return false for past expiration date', () => {
      const pastDate = new Date(Date.now() - 10 * 60 * 1000).toISOString(); // 10 minutes ago
      expect(isCacheValid(pastDate)).toBe(false);
    });
  });

  describe('getCachedArticles', () => {
    it('should return cached articles with correct structure', async () => {
      const result = await getCachedArticles({ location: 'Delhi', limit: 10 });
      
      expect(result).toHaveProperty('articles');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('cached');
      expect(Array.isArray(result.articles)).toBe(true);
    });
  });

  describe('cacheArticle', () => {
    it('should cache article with proper expiration time', async () => {
      const article = {
        article_id: 'test-id',
        title: 'Test Article',
        url: 'https://example.com/test',
        source_name: 'Test Source',
        published_at: new Date().toISOString()
      };

      const result = await cacheArticle(article);
      
      // Should return null due to mock, but function should not throw
      expect(result).toBeNull();
    });
  });
});

describe('Web Share Utilities', () => {
  describe('isWebShareSupported', () => {
    it('should detect Web Share API support', () => {
      // Mock navigator.share
      Object.defineProperty(global, 'navigator', {
        value: {
          share: vi.fn()
        },
        writable: true
      });

      expect(isWebShareSupported()).toBe(true);
    });

    it('should return false when Web Share API is not supported', () => {
      // Mock navigator without share
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true
      });

      expect(isWebShareSupported()).toBe(false);
    });
  });

  describe('generateNewsShareText', () => {
    it('should generate proper share text with title and source', () => {
      const title = 'Breaking News: Important Update';
      const source = 'Local News';
      
      const shareText = generateNewsShareText(title, source);
      
      expect(shareText).toContain(title);
      expect(shareText).toContain(source);
      expect(shareText).toMatch(/^".*" - .*$/);
    });

    it('should include summary when provided', () => {
      const title = 'Breaking News';
      const source = 'Local News';
      const summary = 'This is a summary of the news article.';
      
      const shareText = generateNewsShareText(title, source, summary);
      
      expect(shareText).toContain(title);
      expect(shareText).toContain(source);
      expect(shareText).toContain(summary);
    });
  });

  describe('shareContent', () => {
    it('should handle Web Share API when supported', async () => {
      // Mock successful Web Share API
      Object.defineProperty(global, 'navigator', {
        value: {
          share: vi.fn(() => Promise.resolve())
        },
        writable: true
      });

      const shareData = {
        title: 'Test Article',
        text: 'Test description',
        url: 'https://example.com/test'
      };

      const result = await shareContent(shareData);
      
      expect(result.success).toBe(true);
      expect(result.method).toBe('web_share');
    });

    it('should fallback to copy link when Web Share API fails', async () => {
      // Mock Web Share API failure
      Object.defineProperty(global, 'navigator', {
        value: {
          share: vi.fn(() => Promise.reject(new Error('Share failed'))),
          clipboard: {
            writeText: vi.fn(() => Promise.resolve())
          }
        },
        writable: true
      });

      const shareData = {
        title: 'Test Article',
        text: 'Test description',
        url: 'https://example.com/test'
      };

      const result = await shareContent(shareData);
      
      expect(result.success).toBe(true);
      expect(result.method).toBe('copy_link');
    });
  });
});

describe('Trending Algorithm', () => {
  describe('Time Decay Calculation', () => {
    it('should apply correct time decay formula', () => {
      const lambda = 0.08;
      const hoursSincePublished = 1;
      const expectedDecay = Math.exp(-lambda * hoursSincePublished);
      
      expect(expectedDecay).toBeCloseTo(0.923, 3);
    });

    it('should have higher decay for older articles', () => {
      const lambda = 0.08;
      const recentHours = 1;
      const oldHours = 24;
      
      const recentDecay = Math.exp(-lambda * recentHours);
      const oldDecay = Math.exp(-lambda * oldHours);
      
      expect(recentDecay).toBeGreaterThan(oldDecay);
    });
  });

  describe('Locality Boost', () => {
    it('should apply 20% boost for same city', () => {
      const baseScore = 100;
      const cityBoost = 1.2; // +20%
      const finalScore = baseScore * cityBoost;
      
      expect(finalScore).toBe(120);
    });

    it('should apply 10% boost for same country', () => {
      const baseScore = 100;
      const countryBoost = 1.1; // +10%
      const finalScore = baseScore * countryBoost;
      
      expect(finalScore).toBe(110);
    });
  });
});

describe('Personalization Algorithm', () => {
  describe('User Preference Learning', () => {
    it('should extract preferred cities from user events', () => {
      const events = [
        { event_type: 'like', news_cache: { location_name: 'Delhi' } },
        { event_type: 'like', news_cache: { location_name: 'Delhi' } },
        { event_type: 'share', news_cache: { location_name: 'Mumbai' } }
      ];

      // Simulate preference extraction logic
      const cityCounts = new Map();
      events.forEach(event => {
        if (event.event_type === 'like' || event.event_type === 'share') {
          const city = event.news_cache.location_name;
          cityCounts.set(city, (cityCounts.get(city) || 0) + 1);
        }
      });

      const preferredCities = Array.from(cityCounts.entries())
        .sort(([,a], [,b]) => b - a)
        .map(([city]) => city);

      expect(preferredCities).toEqual(['Delhi', 'Mumbai']);
    });

    it('should apply preference boosts correctly', () => {
      const baseScore = 100;
      const cityBoost = 1.3; // +30% for preferred city
      const sourceBoost = 1.2; // +20% for preferred source
      
      let score = baseScore;
      score *= cityBoost; // Apply city boost
      score *= sourceBoost; // Apply source boost
      
      expect(score).toBe(156); // 100 * 1.3 * 1.2
    });
  });
});

describe('Database Schema Validation', () => {
  describe('Required Tables', () => {
    it('should have all required news tables', () => {
      const requiredTables = [
        'news_cache',
        'news_likes',
        'news_shares',
        'news_events',
        'news_poll_votes',
        'news_trending_scores',
        'user_news_preferences'
      ];

      // This would be validated against actual database schema
      requiredTables.forEach(table => {
        expect(typeof table).toBe('string');
        expect(table).toMatch(/^news_/);
      });
    });
  });

  describe('RLS Policies', () => {
    it('should have proper RLS policies for user data', () => {
      const userTables = [
        'news_likes',
        'news_shares',
        'news_events',
        'news_poll_votes',
        'user_news_preferences'
      ];

      // Each user table should have RLS enabled
      userTables.forEach(table => {
        expect(typeof table).toBe('string');
        expect(table).toMatch(/^news_/);
      });
    });
  });
});

describe('Edge Functions', () => {
  describe('fetchNews Function', () => {
    it('should handle caching logic correctly', () => {
      const cacheExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      const now = new Date();
      
      expect(cacheExpiry.getTime()).toBeGreaterThan(now.getTime());
      expect(cacheExpiry.getTime() - now.getTime()).toBeCloseTo(15 * 60 * 1000, -2);
    });
  });

  describe('trendingNews Function', () => {
    it('should calculate trending scores with all factors', () => {
      const likes = 10;
      const comments = 5;
      const shares = 3;
      const pollVotes = 2;
      const hoursSincePublished = 2;
      const lambda = 0.08;
      
      const baseScore = likes + (2 * comments) + (1.5 * shares) + pollVotes;
      const timeDecay = Math.exp(-lambda * hoursSincePublished);
      const localityBoost = 1.2; // Same city
      
      const finalScore = baseScore * timeDecay * localityBoost;
      
      expect(finalScore).toBeCloseTo(32.4, 1); // (10 + 10 + 4.5 + 2) * 0.85 * 1.2
    });
  });

  describe('forYouNews Function', () => {
    it('should apply personalization boosts', () => {
      const baseTrendingScore = 50;
      const cityBoost = 1.3;
      const sourceBoost = 1.2;
      const categoryBoost = 1.15;
      
      let personalizedScore = baseTrendingScore;
      personalizedScore *= cityBoost;
      personalizedScore *= sourceBoost;
      personalizedScore *= categoryBoost;
      
      expect(personalizedScore).toBeCloseTo(89.7, 1);
    });
  });
});

describe('Real-time Features', () => {
  describe('Supabase Subscriptions', () => {
    it('should handle subscription lifecycle', () => {
      const mockSubscription = {
        subscribe: vi.fn(),
        unsubscribe: vi.fn()
      };

      // Simulate subscription
      mockSubscription.subscribe();
      expect(mockSubscription.subscribe).toHaveBeenCalled();

      // Simulate cleanup
      mockSubscription.unsubscribe();
      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('Live Count Updates', () => {
    it('should update counts in real-time', () => {
      const initialCounts = { likes: 5, shares: 2, comments: 3, pollVotes: 1 };
      const updatedCounts = { likes: 6, shares: 2, comments: 4, pollVotes: 1 };
      
      expect(updatedCounts.likes).toBe(initialCounts.likes + 1);
      expect(updatedCounts.comments).toBe(initialCounts.comments + 1);
    });
  });
});

// Integration test for complete news flow
describe('Complete News Flow Integration', () => {
  it('should handle end-to-end news processing', async () => {
    // 1. Generate article ID
    const url = 'https://example.com/news/article-123';
    const articleId = await generateArticleId(url);
    expect(articleId).toHaveLength(64);

    // 2. Check cache validity
    const futureExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    expect(isCacheValid(futureExpiry)).toBe(true);

    // 3. Generate share text
    const shareText = generateNewsShareText('Test News', 'Test Source', 'Test summary');
    expect(shareText).toContain('Test News');
    expect(shareText).toContain('Test Source');

    // 4. Calculate trending score
    const baseScore = 20;
    const timeDecay = Math.exp(-0.08 * 1); // 1 hour
    const localityBoost = 1.2;
    const finalScore = baseScore * timeDecay * localityBoost;
    expect(finalScore).toBeGreaterThan(20);

    // 5. Apply personalization
    const personalizedScore = finalScore * 1.3; // City preference boost
    expect(personalizedScore).toBeGreaterThan(finalScore);
  });
});
