import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Bookmark, 
  Share2, 
  Heart, 
  MapPin, 
  Clock, 
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useNewsFeed } from '@/hooks/useNewsFeed';
import { NewsArticle } from '@/types/news';

const NewsFeed: React.FC = () => {
  const {
    articles,
    loading,
    error,
    preferences,
    filters,
    hasMore,
    fetchArticles,
    searchArticles,
    updatePreferences,
    setFilters,
    recordInteraction,
    toggleBookmark,
    refresh,
    loadMore
  } = useNewsFeed();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('');

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'local', label: 'Local News' },
    { value: 'business', label: 'Business' },
    { value: 'technology', label: 'Technology' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'sports', label: 'Sports' },
    { value: 'health', label: 'Health' },
    { value: 'education', label: 'Education' },
    { value: 'politics', label: 'Politics' },
    { value: 'environment', label: 'Environment' }
  ];

  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      searchArticles({
        query: searchQuery,
        category: selectedCategory || undefined,
        date_from: selectedDateRange === 'today' ? new Date().toISOString().split('T')[0] : undefined
      });
    } else {
      refresh();
    }
  }, [searchQuery, selectedCategory, selectedDateRange, searchArticles, refresh]);

  const handleCategoryFilter = useCallback((category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: category ? [category] : undefined
    }));
  }, [setFilters]);

  const handleDateFilter = useCallback((dateRange: string) => {
    setFilters(prev => ({
      ...prev,
      date_range: dateRange || undefined
    }));
  }, [setFilters]);

  const handleLike = useCallback(async (article: NewsArticle) => {
    await recordInteraction(article.id, 'like');
  }, [recordInteraction]);

  const handleShare = useCallback(async (article: NewsArticle) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description,
          url: article.url
        });
        await recordInteraction(article.id, 'share');
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      if (article.url) {
        await navigator.clipboard.writeText(article.url);
        await recordInteraction(article.id, 'share');
      }
    }
  }, [recordInteraction]);

  const handleBookmark = useCallback(async (article: NewsArticle) => {
    await toggleBookmark(article.id);
  }, [toggleBookmark]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={refresh} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Local News Feed</h1>
        <p className="text-muted-foreground">
          Stay updated with the latest local and personalized news
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Time</SelectItem>
                {dateRanges.map(range => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* News Articles */}
      <div className="space-y-6">
        {articles.length === 0 && !loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">No articles found</p>
                <Button onClick={refresh} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          articles.map((article) => (
            <Card key={article.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {article.image_url && (
                    <div className="md:w-48 md:flex-shrink-0">
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-32 md:h-40 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-muted-foreground mb-3 line-clamp-3">
                          {article.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {article.category && (
                        <Badge variant="secondary">
                          {article.category}
                        </Badge>
                      )}
                      {article.location_name && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {article.location_name}
                        </Badge>
                      )}
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(article.published_at)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(article)}
                        >
                          <Heart className="w-4 h-4 mr-1" />
                          Like
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShare(article)}
                        >
                          <Share2 className="w-4 h-4 mr-1" />
                          Share
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBookmark(article)}
                        >
                          <Bookmark className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                      </div>
                      {article.url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(article.url, '_blank')}
                        >
                          Read More
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center">
            <Button
              onClick={loadMore}
              disabled={loading}
              variant="outline"
              className="w-full md:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More Articles'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsFeed;
