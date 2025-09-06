// News caching utilities with SHA-256 article ID generation
import { supabase } from '@/integrations/supabase/client';

export interface CachedArticle {
  article_id: string;
  title: string;
  description?: string;
  content?: string;
  url: string;
  image_url?: string;
  source_name: string;
  published_at: string;
  category?: string;
  location_name?: string;
  location_lat?: number;
  location_lng?: number;
  ai_summary?: string;
  cached_at: string;
  expires_at: string;
}

export interface NewsCacheOptions {
  location?: string;
  radius?: number;
  limit?: number;
  page?: number;
}

/**
 * Generate SHA-256 hash for article ID
 */
export async function generateArticleId(url: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(url);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Check if cache entry is valid (not expired)
 */
export function isCacheValid(expiresAt: string): boolean {
  return new Date(expiresAt) > new Date();
}

/**
 * Get cached articles from database
 */
export async function getCachedArticles(options: NewsCacheOptions = {}): Promise<{
  articles: CachedArticle[];
  total: number;
  cached: boolean;
}> {
  const { location, limit = 20, page = 1 } = options;

  try {
    let query = supabase
      .from('news_cache')
      .select('*', { count: 'exact' })
      .gte('expires_at', new Date().toISOString())
      .order('published_at', { ascending: false });

    if (location) {
      query = query.eq('location_name', location);
    }

    const { data, error, count } = await query
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      throw error;
    }

    return {
      articles: data || [],
      total: count || 0,
      cached: true
    };
  } catch (error) {
    console.error('Error fetching cached articles:', error);
    return {
      articles: [],
      total: 0,
      cached: false
    };
  }
}

/**
 * Cache article in database
 */
export async function cacheArticle(article: Omit<CachedArticle, 'cached_at' | 'expires_at'>): Promise<CachedArticle | null> {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes

    const articleData = {
      ...article,
      cached_at: now.toISOString(),
      expires_at: expiresAt.toISOString()
    };

    const { data, error } = await supabase
      .from('news_cache')
      .upsert(articleData, { onConflict: 'article_id' })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error caching article:', error);
    return null;
  }
}

/**
 * Cache multiple articles
 */
export async function cacheArticles(articles: Omit<CachedArticle, 'cached_at' | 'expires_at'>[]): Promise<CachedArticle[]> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes

  const articlesData = articles.map(article => ({
    ...article,
    cached_at: now.toISOString(),
    expires_at: expiresAt.toISOString()
  }));

  try {
    const { data, error } = await supabase
      .from('news_cache')
      .upsert(articlesData, { onConflict: 'article_id' })
      .select();

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error caching articles:', error);
    return [];
  }
}

/**
 * Clean expired cache entries
 */
export async function cleanExpiredCache(): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('clean_expired_news_cache');

    if (error) {
      throw error;
    }

    return data || 0;
  } catch (error) {
    console.error('Error cleaning expired cache:', error);
    return 0;
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalArticles: number;
  validArticles: number;
  expiredArticles: number;
  oldestCache: string | null;
  newestCache: string | null;
}> {
  try {
    const now = new Date().toISOString();

    // Get total articles
    const { count: totalArticles } = await supabase
      .from('news_cache')
      .select('*', { count: 'exact', head: true });

    // Get valid articles
    const { count: validArticles } = await supabase
      .from('news_cache')
      .select('*', { count: 'exact', head: true })
      .gte('expires_at', now);

    // Get expired articles
    const { count: expiredArticles } = await supabase
      .from('news_cache')
      .select('*', { count: 'exact', head: true })
      .lt('expires_at', now);

    // Get oldest and newest cache entries
    const { data: oldestData } = await supabase
      .from('news_cache')
      .select('cached_at')
      .order('cached_at', { ascending: true })
      .limit(1)
      .single();

    const { data: newestData } = await supabase
      .from('news_cache')
      .select('cached_at')
      .order('cached_at', { ascending: false })
      .limit(1)
      .single();

    return {
      totalArticles: totalArticles || 0,
      validArticles: validArticles || 0,
      expiredArticles: expiredArticles || 0,
      oldestCache: oldestData?.cached_at || null,
      newestCache: newestData?.cached_at || null
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return {
      totalArticles: 0,
      validArticles: 0,
      expiredArticles: 0,
      oldestCache: null,
      newestCache: null
    };
  }
}

/**
 * Check if article is cached and valid
 */
export async function isArticleCached(articleId: string): Promise<CachedArticle | null> {
  try {
    const { data, error } = await supabase
      .from('news_cache')
      .select('*')
      .eq('article_id', articleId)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error checking if article is cached:', error);
    return null;
  }
}

/**
 * Update article cache with new data
 */
export async function updateArticleCache(
  articleId: string, 
  updates: Partial<CachedArticle>
): Promise<CachedArticle | null> {
  try {
    const { data, error } = await supabase
      .from('news_cache')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('article_id', articleId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating article cache:', error);
    return null;
  }
}

/**
 * Delete article from cache
 */
export async function deleteArticleFromCache(articleId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('news_cache')
      .delete()
      .eq('article_id', articleId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting article from cache:', error);
    return false;
  }
}

/**
 * Get articles by location with cache check
 */
export async function getArticlesByLocation(
  location: string,
  options: { limit?: number; page?: number } = {}
): Promise<{
  articles: CachedArticle[];
  total: number;
  cached: boolean;
}> {
  const { limit = 20, page = 1 } = options;

  // First check cache
  const cachedResult = await getCachedArticles({
    location,
    limit,
    page
  });

  if (cachedResult.articles.length > 0) {
    return cachedResult;
  }

  // If no cached articles, return empty result
  // The actual fetching should be done by the Edge Function
  return {
    articles: [],
    total: 0,
    cached: false
  };
}
