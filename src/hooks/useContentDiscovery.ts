import { useState, useEffect, useCallback } from 'react';
import { DiscoveryService } from '@/services/discoveryService';
import { useLocation } from './useLocation';
import { useAuth } from './useAuth';

interface DiscoveryFilters {
  categories?: string[];
  tags?: string[];
  location?: {
    enabled: boolean;
    radius: number;
  };
  dateRange?: {
    enabled: boolean;
    start: string;
    end: string;
  };
  sortBy?: 'relevance' | 'popularity' | 'date' | 'distance';
  limit?: number;
}

interface DiscoveryResult {
  id: string;
  type: string;
  title: string;
  description?: string;
  image?: string;
  score: number;
  reason: string;
  metadata: any;
}

export const useContentDiscovery = () => {
  const { user } = useAuth();
  const { currentLocation } = useLocation();
  const [discoveredContent, setDiscoveredContent] = useState<DiscoveryResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DiscoveryFilters>({
    location: { enabled: true, radius: 50 },
    sortBy: 'relevance',
    limit: 20
  });

  // Discover content based on current filters and user preferences
  const discoverContent = useCallback(async (customFilters?: Partial<DiscoveryFilters>) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const mergedFilters = { ...filters, ...customFilters };
      
      // Get user interests and preferences
      const userInterests = await DiscoveryService.getUserInterests(user.id);
      
      // Get available content
      const availableContent = await DiscoveryService.getAvailableContent(user.id);
      
      // Apply discovery filters
      const filteredContent = DiscoveryService.applyDiscoveryFilters(availableContent, mergedFilters);
      
      // Calculate discovery scores
      const scoredContent = DiscoveryService.calculateDiscoveryScores(
        userInterests,
        currentLocation,
        filteredContent,
        mergedFilters
      );
      
      // Sort by discovery score
      const sortedContent = scoredContent.sort((a, b) => b.score - a.score);
      
      // Limit results
      const limitedContent = sortedContent.slice(0, mergedFilters.limit || 20);
      
      setDiscoveredContent(limitedContent);
    } catch (err) {
      console.error('Error discovering content:', err);
      setError(err instanceof Error ? err.message : 'Failed to discover content');
    } finally {
      setLoading(false);
    }
  }, [user, filters, currentLocation]);

  // Update filters and rediscover content
  const updateFilters = useCallback((newFilters: Partial<DiscoveryFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    discoverContent(updatedFilters);
  }, [filters, discoverContent]);

  // Get discovery insights
  const getDiscoveryInsights = useCallback(async () => {
    if (!user || discoveredContent.length === 0) return null;

    try {
      const userInterests = await DiscoveryService.getUserInterests(user.id);
      return DiscoveryService.generateDiscoveryInsights(userInterests, discoveredContent);
    } catch (err) {
      console.error('Error getting discovery insights:', err);
      return null;
    }
  }, [user, discoveredContent]);

  // Get content by category
  const getContentByCategory = useCallback(async (category: string) => {
    if (!user) return [];

    try {
      const availableContent = await DiscoveryService.getAvailableContent(user.id);
      const categoryContent = availableContent.filter(content => 
        content.category === category || content.type === category
      );
      
      const userInterests = await DiscoveryService.getUserInterests(user.id);
      const scoredContent = DiscoveryService.calculateDiscoveryScores(
        userInterests,
        currentLocation,
        categoryContent,
        filters
      );
      
      return scoredContent.sort((a, b) => b.score - a.score);
    } catch (err) {
      console.error('Error getting content by category:', err);
      return [];
    }
  }, [user, currentLocation, filters]);

  // Get trending content in user's area
  const getTrendingContent = useCallback(async () => {
    if (!user || !currentLocation) return [];

    try {
      const trendingContent = await DiscoveryService.getTrendingContent(
        currentLocation,
        filters.location?.radius || 50
      );
      
      return trendingContent;
    } catch (err) {
      console.error('Error getting trending content:', err);
      return [];
    }
  }, [user, currentLocation, filters.location?.radius]);

  // Get personalized recommendations
  const getPersonalizedRecommendations = useCallback(async () => {
    if (!user) return [];

    try {
      const userInterests = await DiscoveryService.getUserInterests(user.id);
      const availableContent = await DiscoveryService.getAvailableContent(user.id);
      
      // Use recommendation algorithms to get personalized content
      const recommendations = DiscoveryService.getPersonalizedRecommendations(
        userInterests,
        availableContent,
        currentLocation
      );
      
      return recommendations;
    } catch (err) {
      console.error('Error getting personalized recommendations:', err);
      return [];
    }
  }, [user, currentLocation]);

  // Get serendipitous content (unexpected but interesting)
  const getSerendipitousContent = useCallback(async () => {
    if (!user) return [];

    try {
      const userInterests = await DiscoveryService.getUserInterests(user.id);
      const availableContent = await DiscoveryService.getAvailableContent(user.id);
      
      // Find content that doesn't match user interests but might be interesting
      const serendipitousContent = DiscoveryService.getSerendipitousContent(
        userInterests,
        availableContent,
        currentLocation
      );
      
      return serendipitousContent;
    } catch (err) {
      console.error('Error getting serendipitous content:', err);
      return [];
    }
  }, [user, currentLocation]);

  // Refresh discovery content
  const refreshDiscovery = useCallback(() => {
    discoverContent();
  }, [discoverContent]);

  // Load initial discovery content
  useEffect(() => {
    if (user) {
      discoverContent();
    }
  }, [user, discoverContent]);

  // Update discovery when location changes
  useEffect(() => {
    if (user && currentLocation && filters.location?.enabled) {
      discoverContent();
    }
  }, [currentLocation, user, filters.location?.enabled, discoverContent]);

  return {
    discoveredContent,
    loading,
    error,
    filters,
    discoverContent,
    updateFilters,
    getDiscoveryInsights,
    getContentByCategory,
    getTrendingContent,
    getPersonalizedRecommendations,
    getSerendipitousContent,
    refreshDiscovery
  };
};
