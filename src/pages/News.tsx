import React, { useState, useEffect, useCallback } from 'react';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  ExternalLink, 
  RefreshCw,
  Newspaper,
  TrendingUp,
  Globe,
  Users,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { useAuth } from '@/hooks/useAuth';
import { NewsAggregationService } from '@/services/newsAggregationService';
import { NewsArticle, NewsCategory } from '@/types/news';
import { useToast } from '@/hooks/use-toast';

interface NewsFilters {
  category: NewsCategory | 'all';
  source: 'all' | 'local' | 'external';
  timeRange: 'all' | 'today' | 'week' | 'month';
  searchQuery: string;
}

const News: React.FC = () => {
  const { user } = useAuth();
  const { currentLocation } = useLocation();
  const { toast } = useToast();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState<NewsFilters>({
    category: 'all',
    source: 'all',
    timeRange: 'all',
    searchQuery: ''
  });

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const loadNews = useCallback(async () => {
    const newsService = new NewsAggregationService();
    try {
      setLoading(true);
      setError(null);

      let newsData: NewsArticle[] = [];

      if (activeTab === 'local' && currentLocation) {
        // Fetch local news based on user's location
        newsData = await newsService.getNearbyNewsArticles(
          currentLocation.latitude,
          currentLocation.longitude,
          50, // 50km radius
          filters.category !== 'all' ? filters.category : undefined,
          20
        );
      } else if (activeTab === 'personalized' && user) {
        // Fetch personalized news feed
        newsData = await newsService.getUserNewsFeed(user.id, 20);
      } else {
        // Fetch general news
        newsData = await newsService.searchNewsArticles(
          filters.searchQuery || '',
          {
            category: filters.category !== 'all' ? filters.category : undefined,
            dateFrom: getDateFilter(filters.timeRange)
          },
          20
        );
      }

      setArticles(newsData);
    } catch (err) {
      console.error('Error loading news:', err);
      setError('Failed to load news. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load news articles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentLocation, user, filters, toast]);

  const refreshNews = async () => {
    setRefreshing(true);
    await loadNews();
    setRefreshing(false);
    toast({
      title: "Success",
      description: "News feed refreshed",
    });
  };

  const getDateFilter = (timeRange: string): string | undefined => {
    const now = new Date();
    switch (timeRange) {
      case 'today':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return undefined;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      politics: 'bg-red-100 text-red-800',
      business: 'bg-blue-100 text-blue-800',
      technology: 'bg-purple-100 text-purple-800',
      entertainment: 'bg-pink-100 text-pink-800',
      sports: 'bg-green-100 text-green-800',
      health: 'bg-emerald-100 text-emerald-800',
      science: 'bg-indigo-100 text-indigo-800',
      local: 'bg-orange-100 text-orange-800',
      world: 'bg-gray-100 text-gray-800',
      national: 'bg-yellow-100 text-yellow-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  };

  const handleFilterChange = (key: keyof NewsFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const renderArticleCard = (article: NewsArticle) => (
    <Card key={article.id} className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {article.image_url && (
            <div className="flex-shrink-0">
              <img
                src={article.image_url}
                alt={article.title}
                className="w-24 h-24 object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                {article.title}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(article.url || '#', '_blank')}
                className="flex-shrink-0"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {article.description || article.summary}
            </p>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Newspaper className="h-3 w-3" />
                  <span>{article.source_name || 'Unknown Source'}</span>
                </div>
                {article.author && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{article.author}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(article.published_at)}</span>
                </div>
                {article.location_name && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{article.location_name}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {article.category && (
                  <Badge className={getCategoryColor(article.category)}>
                    {article.category}
                  </Badge>
                )}
                {article.is_breaking && (
                  <Badge variant="destructive" className="text-xs">
                    Breaking
                  </Badge>
                )}
                {article.is_trending && (
                  <Badge variant="secondary" className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Trending
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSkeleton = () => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Skeleton className="w-24 h-24 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-3" />
            <div className="flex gap-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ResponsiveLayout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Newspaper className="h-8 w-8 text-primary" />
                News Feed
              </h1>
              <p className="text-gray-600 mt-1">
                Stay updated with the latest local and global news
              </p>
            </div>
            <Button
              onClick={refreshNews}
              disabled={refreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search news articles..."
                value={filters.searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="politics">Politics</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="science">Science</SelectItem>
                <SelectItem value="local">Local</SelectItem>
                <SelectItem value="world">World</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.timeRange} onValueChange={(value) => handleFilterChange('timeRange', value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            All News
          </TabsTrigger>
          <TabsTrigger value="local" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Local News
          </TabsTrigger>
          <TabsTrigger value="personalized" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            For You
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {error && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => renderSkeleton())}
            </div>
          ) : articles.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No news articles found</h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria or check back later for new content.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {articles.map(renderArticleCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="local" className="mt-6">
          {!currentLocation ? (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Location access is required to show local news. Please enable location services.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {error && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => renderSkeleton())}
                </div>
              ) : articles.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No local news found</h3>
                    <p className="text-gray-600">
                      We couldn't find any news articles for your area. Try expanding your search or check back later.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {articles.map(renderArticleCard)}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="personalized" className="mt-6">
          {!user ? (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please sign in to view your personalized news feed.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {error && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => renderSkeleton())}
                </div>
              ) : articles.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No personalized news yet</h3>
                    <p className="text-gray-600">
                      Your personalized feed will improve as you interact with more articles.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {articles.map(renderArticleCard)}
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </ResponsiveLayout>
  );
};

export default News;
