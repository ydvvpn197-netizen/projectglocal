import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Heart, 
  MessageCircle, 
  Share2, 
  TrendingUp,
  Globe,
  RefreshCw,
  Loader2,
  ArrowRight,
  Calendar,
  User,
  Wifi,
  WifiOff,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Zap
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { OptimizedImage } from './optimization/OptimizedImage';
import { useRealTimeNews, NewsFilters } from '../hooks/useRealTimeNews';
import { NewsArticle } from '../types/news';
import { NewsSummary } from '../services/newsSummarizationService';
import { realTimeNewsService } from '../services/realTimeNewsService';

interface RealTimeNewsFeedProps {
  onArticleClick: (article: NewsArticle) => void;
  className?: string;
}

export const RealTimeNewsFeed: React.FC<RealTimeNewsFeedProps> = ({ 
  onArticleClick, 
  className 
}) => {
  const [filters, setFilters] = useState<NewsFilters>({
    category: 'all',
    location: 'all',
    timeRange: '24h'
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('trending');
  const [expandedSummaries, setExpandedSummaries] = useState<Set<string>>(new Set());

  const {
    articles,
    summaries,
    loading,
    error,
    lastUpdated,
    isConnected,
    refreshArticles,
    getArticleSummary,
    getTrendingArticles,
    getLatestArticles,
    getArticlesByCategory,
    searchArticles,
    totalArticles
  } = useRealTimeNews(filters);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'community', label: 'Community' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'arts', label: 'Arts & Culture' },
    { value: 'environment', label: 'Environment' },
    { value: 'technology', label: 'Technology' },
    { value: 'business', label: 'Business' },
    { value: 'health', label: 'Health' }
  ];

  const locations = [
    { value: 'all', label: 'All Locations' },
    { value: 'delhi', label: 'Delhi' },
    { value: 'mumbai', label: 'Mumbai' },
    { value: 'bangalore', label: 'Bangalore' },
    { value: 'chennai', label: 'Chennai' }
  ];

  const timeRanges = [
    { value: '1h', label: 'Last Hour' },
    { value: '6h', label: 'Last 6 Hours' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' }
  ];

  // Update filters when search query changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, searchQuery }));
  }, [searchQuery]);

  const handleRefresh = useCallback(() => {
    refreshArticles();
  }, [refreshArticles]);

  const handleArticleClick = useCallback((article: NewsArticle) => {
    onArticleClick(article);
  }, [onArticleClick]);

  const toggleSummaryExpansion = useCallback((articleId: string) => {
    setExpandedSummaries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  }, []);

  const handleReadMore = useCallback((article: NewsArticle) => {
    // Open external link in new tab
    window.open(article.url, '_blank', 'noopener,noreferrer');
  }, []);

  const getDisplayArticles = useCallback(() => {
    switch (activeTab) {
      case 'trending':
        return getTrendingArticles();
      case 'latest':
        return getLatestArticles();
      case 'all':
        return searchQuery ? searchArticles(searchQuery) : articles;
      default:
        return articles;
    }
  }, [activeTab, getTrendingArticles, getLatestArticles, articles, searchQuery, searchArticles]);

  const renderArticleCard = (article: NewsArticle) => {
    const summary = getArticleSummary(article.id);
    const isExpanded = expandedSummaries.has(article.id);
    const displayArticles = getDisplayArticles();

    return (
      <motion.div
        key={article.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Card 
          className="overflow-hidden hover:shadow-elegant transition-all duration-300 cursor-pointer group feed-item"
          onClick={() => handleArticleClick(article)}
        >
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl mb-2 line-clamp-2 group-hover:text-gradient transition-colors">
                  {article.title}
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{article.source}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{article.location.city}</span>
                  </div>
                  <Badge className="badge-community text-xs">
                    {article.category}
                  </Badge>
                  {summary && (
                    <Badge 
                      variant={summary.sentiment === 'positive' ? 'default' : summary.sentiment === 'negative' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {summary.sentiment}
                    </Badge>
                  )}
                </div>
              </div>
              {article.image_url && (
                <div className="flex-shrink-0">
                  <OptimizedImage
                    src={article.image_url}
                    alt={article.title}
                    width={120}
                    height={80}
                    className="w-30 h-20 object-cover rounded-lg"
                    lazy={true}
                    quality={85}
                  />
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Summary Section */}
            {summary && (
              <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gradient-community">
                      AI Summary
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {summary.readingTime} min read
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSummaryExpansion(article.id);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                  {isExpanded ? summary.summary : `${summary.summary.substring(0, 150)}...`}
                </p>

                {isExpanded && summary.keyPoints.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Key Points:
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      {summary.keyPoints.map((point, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {summary.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {summary.tags.slice(0, 5).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Original Description */}
            <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
              {article.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-600">
                  <Heart className="h-4 w-4 mr-1" />
                  {article.engagement.likes}
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {article.engagement.comments}
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-green-600">
                  <Share2 className="h-4 w-4 mr-1" />
                  {article.engagement.shares}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 btn-community"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReadMore(article);
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                  Read Full Story
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (loading && articles.length === 0) {
    return (
      <div className={`px-4 py-8 ${className}`}>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Real-Time News Feed
              </h1>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>Delhi, India</span>
                <div className="flex items-center gap-1 ml-4">
                  {isConnected ? (
                    <Wifi className="h-4 w-4 text-green-500" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-red-500" />
                  )}
                  <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                    {isConnected ? 'Live' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
                    <div className="flex gap-2 mt-3">
                      <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`px-4 py-8 ${className}`}>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading News</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const displayArticles = getDisplayArticles();

  return (
    <div className={`px-4 py-8 ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gradient">
              Real-Time News Feed
            </h1>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>Delhi, India</span>
              <div className="flex items-center gap-1 ml-4">
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>
              {lastUpdated && (
                <span className="ml-4">
                  Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="badge-trending flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {totalArticles} articles
            </Badge>
            <Button
              onClick={handleRefresh}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search news articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select 
              value={filters.category} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={filters.location} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.value} value={location.value}>
                    {location.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={filters.timeRange} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, timeRange: value as '1h' | '6h' | '24h' | '7d' }))}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                {timeRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="latest" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Latest
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            All News
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="mt-6">
          <div className="space-y-6">
            <AnimatePresence>
              {displayArticles.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card>
                    <CardContent className="p-8 text-center">
                      <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No trending news found
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Check back later for trending stories in your area.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                displayArticles.map(renderArticleCard)
              )}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="latest" className="mt-6">
          <div className="space-y-6">
            <AnimatePresence>
              {displayArticles.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No latest news found
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        New articles will appear here as they're published.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                displayArticles.map(renderArticleCard)
              )}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-6">
            <AnimatePresence>
              {displayArticles.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Globe className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No news found
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Try adjusting your search criteria or check back later for updates.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                displayArticles.map(renderArticleCard)
              )}
            </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
