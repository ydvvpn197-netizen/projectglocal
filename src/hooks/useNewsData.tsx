import { useState, useEffect, useCallback } from 'react';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content?: string;
  source: string;
  sourceName: string;
  publishedAt: string;
  imageUrl: string | null;
  city: string;
  country: string;
  category: string;
  url: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  author?: string;
  tags?: string[];
}

// Mock articles data - in real app, this would come from an API
const mockArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'Local Community Event This Weekend Brings Together Artists and Food Vendors',
    summary: 'Join us for a community gathering featuring local artists, food vendors, and live music performances. The event aims to support local businesses and create a vibrant community atmosphere.',
    content: 'Full article content about the community event...',
    source: 'local-news',
    sourceName: 'Local News',
    publishedAt: new Date().toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
    city: 'Delhi',
    country: 'India',
    category: 'community',
    url: 'https://example.com/article1',
    engagement: { likes: 25, comments: 8, shares: 3, views: 150 },
    author: 'Sarah Johnson',
    tags: ['community', 'events', 'local business']
  },
  {
    id: '2',
    title: 'New Infrastructure Development Announced for Public Transportation',
    summary: 'City officials announce comprehensive plans for improved public transportation including new metro lines and bus routes to better serve the growing population.',
    content: 'Full article content about infrastructure development...',
    source: 'city-news',
    sourceName: 'City News',
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
    city: 'Delhi',
    country: 'India',
    category: 'infrastructure',
    url: 'https://example.com/article2',
    engagement: { likes: 42, comments: 15, shares: 7, views: 320 },
    author: 'Michael Chen',
    tags: ['infrastructure', 'transportation', 'development']
  },
  {
    id: '3',
    title: 'Local Artists Collective Launches New Exhibition Space',
    summary: 'A group of local artists has opened a new collaborative exhibition space in the downtown area, featuring rotating displays of contemporary art.',
    content: 'Full article content about the art exhibition...',
    source: 'arts-news',
    sourceName: 'Arts & Culture',
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
    city: 'Delhi',
    country: 'India',
    category: 'arts',
    url: 'https://example.com/article3',
    engagement: { likes: 18, comments: 5, shares: 2, views: 89 },
    author: 'Emma Rodriguez',
    tags: ['arts', 'culture', 'exhibition']
  },
  {
    id: '4',
    title: 'Environmental Initiative: Community Garden Project Takes Root',
    summary: 'Local residents have started a community garden project to promote sustainable living and provide fresh produce to neighborhood families.',
    content: 'Full article content about the community garden...',
    source: 'green-news',
    sourceName: 'Green Living',
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
    city: 'Delhi',
    country: 'India',
    category: 'environment',
    url: 'https://example.com/article4',
    engagement: { likes: 33, comments: 12, shares: 5, views: 210 },
    author: 'David Park',
    tags: ['environment', 'sustainability', 'community']
  },
  {
    id: '5',
    title: 'Tech Startup Hub Opens Doors to Local Entrepreneurs',
    summary: 'A new co-working space and startup incubator has opened in the business district, offering resources and mentorship for local entrepreneurs.',
    content: 'Full article content about the tech hub...',
    source: 'tech-news',
    sourceName: 'Tech Weekly',
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
    city: 'Delhi',
    country: 'India',
    category: 'technology',
    url: 'https://example.com/article5',
    engagement: { likes: 56, comments: 23, shares: 9, views: 445 },
    author: 'Lisa Wang',
    tags: ['technology', 'startup', 'entrepreneurship']
  }
];

export const useNewsData = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setArticles(mockArticles);
    } catch (err) {
      setError('Failed to fetch news articles');
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getArticleById = useCallback((id: string): NewsArticle | undefined => {
    return articles.find(article => article.id === id);
  }, [articles]);

  const getArticlesByCategory = useCallback((category: string): NewsArticle[] => {
    if (category === 'all') return articles;
    return articles.filter(article => article.category === category);
  }, [articles]);

  const getArticlesByLocation = useCallback((location: string): NewsArticle[] => {
    if (location === 'all') return articles;
    return articles.filter(article => 
      article.city.toLowerCase() === location.toLowerCase()
    );
  }, [articles]);

  const searchArticles = useCallback((query: string): NewsArticle[] => {
    if (!query.trim()) return articles;
    
    const lowercaseQuery = query.toLowerCase();
    return articles.filter(article =>
      article.title.toLowerCase().includes(lowercaseQuery) ||
      article.summary.toLowerCase().includes(lowercaseQuery) ||
      article.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      article.author?.toLowerCase().includes(lowercaseQuery)
    );
  }, [articles]);

  const getTrendingArticles = useCallback((): NewsArticle[] => {
    return [...articles].sort((a, b) => 
      (b.engagement.likes + b.engagement.comments + b.engagement.shares) - 
      (a.engagement.likes + a.engagement.comments + a.engagement.shares)
    );
  }, [articles]);

  const getLatestArticles = useCallback((): NewsArticle[] => {
    return [...articles].sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }, [articles]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return {
    articles,
    loading,
    error,
    fetchArticles,
    getArticleById,
    getArticlesByCategory,
    getArticlesByLocation,
    searchArticles,
    getTrendingArticles,
    getLatestArticles,
  };
};
