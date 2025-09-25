import React, { useState, useEffect, useCallback } from 'react';
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
  BarChart3,
  TrendingUp,
  Globe,
  RefreshCw,
  Loader2,
  ArrowRight,
  Calendar,
  User
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { OptimizedImage } from './optimization/OptimizedImage';
import { useNewsData, type NewsArticle } from '@/hooks/useNewsData';


interface EnhancedNewsFeedProps {
  onArticleClick: (article: NewsArticle) => void;
  className?: string;
}

export const EnhancedNewsFeed: React.FC<EnhancedNewsFeedProps> = ({ 
  onArticleClick, 
  className 
}) => {
  const { 
    articles, 
    loading, 
    error, 
    fetchArticles, 
    getArticlesByCategory, 
    getArticlesByLocation, 
    searchArticles, 
    getTrendingArticles, 
    getLatestArticles 
  } = useNewsData();
  
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [activeTab, setActiveTab] = useState('trending');

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

  const sortOptions = [
    { value: 'latest', label: 'Latest' },
    { value: 'trending', label: 'Trending' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'oldest', label: 'Oldest' }
  ];

  useEffect(() => {
    if (articles.length > 0) {
      setFilteredArticles(articles);
    }
  }, [articles]);

  useEffect(() => {
    let filtered = searchArticles(searchQuery);
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    // Filter by location
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(article => 
        article.city.toLowerCase() === selectedLocation.toLowerCase()
      );
    }

    // Sort articles
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case 'trending':
          return (b.engagement.likes + b.engagement.comments + b.engagement.shares) - 
                 (a.engagement.likes + a.engagement.comments + a.engagement.shares);
        case 'popular':
          return b.engagement.views - a.engagement.views;
        case 'oldest':
          return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        default:
          return 0;
      }
    });

    setFilteredArticles(filtered);
  }, [articles, searchQuery, selectedCategory, selectedLocation, sortBy, searchArticles]);

  const handleRefresh = useCallback(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleArticleClick = useCallback((article: NewsArticle) => {
    onArticleClick(article);
  }, [onArticleClick]);

  const trendingArticles = getTrendingArticles().slice(0, 3);
  const latestArticles = getLatestArticles();

  if (loading) {
    return (
      <div className={`px-4 py-8 ${className}`}>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                News Feed
              </h1>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>Delhi, India</span>
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

  return (
    <div className={`px-4 py-8 ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              News Feed
            </h1>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>Delhi, India</span>
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
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
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
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
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
            {trendingArticles.map((article) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => handleArticleClick(article)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {article.title}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{article.author}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {article.category}
                          </Badge>
                        </div>
                      </div>
                      {article.imageUrl && (
                        <div className="flex-shrink-0">
                          <OptimizedImage
                            src={article.imageUrl}
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
                    <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                      {article.summary}
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
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        Read More
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="latest" className="mt-6">
          <div className="space-y-6">
            {latestArticles.map((article) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => handleArticleClick(article)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {article.title}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{article.author}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {article.category}
                          </Badge>
                        </div>
                      </div>
                      {article.imageUrl && (
                        <div className="flex-shrink-0">
                          <OptimizedImage
                            src={article.imageUrl}
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
                    <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                      {article.summary}
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
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        Read More
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-6">
            <AnimatePresence>
              {filteredArticles.length === 0 ? (
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
                filteredArticles.map((article) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card 
                      className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                      onClick={() => handleArticleClick(article)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-xl mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {article.title}
                            </CardTitle>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>{article.author}</span>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {article.category}
                              </Badge>
                            </div>
                          </div>
                          {article.imageUrl && (
                            <div className="flex-shrink-0">
                              <OptimizedImage
                                src={article.imageUrl}
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
                        <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                          {article.summary}
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
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            Read More
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
