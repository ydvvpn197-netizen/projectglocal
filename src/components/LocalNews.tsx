// Main LocalNews component for TheGlocal project
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  RefreshCw, 
  Search, 
  TrendingUp, 
  Clock, 
  Heart, 
  MessageCircle, 
  Share2, 
  BarChart3,
  Globe,
  Loader2
} from 'lucide-react';
import { useNewsData, useNewsInteractions, useLocation, useNewsRealtime } from '@/hooks/useNews.tsx';
import { NewsCard } from './NewsCard';
import { NewsPoll } from './NewsPoll';
import { NewsComments } from './NewsComments';
import type { NewsTab, LocationData } from '@/types/news';

interface LocalNewsProps {
  className?: string;
}

export const LocalNews: React.FC<LocalNewsProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState<NewsTab>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [showPoll, setShowPoll] = useState<string | null>(null);

  const { location, loading: locationLoading, error: locationError, updateLocation } = useLocation();
  const { articles, loading, error, hasMore, loadMore, refresh, isFetching } = useNewsData(activeTab, location || { city: 'Delhi', country: 'India' });
  const { toggleLike, shareArticle, getInteractionData } = useNewsInteractions();
  
  // Real-time subscriptions for live updates
  const articleIds = articles.map(article => article.article_id);
  const realtimeUpdates = useNewsRealtime(articleIds);

  // Handle real-time updates
  useEffect(() => {
    if (realtimeUpdates.length > 0) {
      // Refresh articles when real-time updates are received
      refresh();
    }
  }, [realtimeUpdates, refresh]);

  // Handle location change
  const handleLocationChange = useCallback((newLocation: LocationData) => {
    updateLocation(newLocation);
    refresh();
  }, [updateLocation, refresh]);

  // Handle article actions
  const handleLike = useCallback((articleId: string) => {
    toggleLike(articleId);
  }, [toggleLike]);

  const handleShare = useCallback(async (articleId: string) => {
    try {
      if (navigator.share) {
        const article = articles.find(a => a.article_id === articleId);
        if (article) {
          await navigator.share({
            title: article.title,
            text: article.ai_summary || article.description,
            url: article.url
          });
        }
      } else {
        // Fallback to copying link
        const article = articles.find(a => a.article_id === articleId);
        if (article) {
          await navigator.clipboard.writeText(article.url);
        }
      }
      shareArticle(articleId, 'web');
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  }, [articles, shareArticle]);

  const handleComment = useCallback((articleId: string) => {
    setShowComments(articleId);
  }, []);

  const handlePoll = useCallback((articleId: string) => {
    setShowPoll(articleId);
  }, []);

  // Handle infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        if (hasMore && !isFetching) {
          loadMore();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isFetching, loadMore]);

  // Loading skeleton
  const NewsSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <div className="flex gap-2 mt-3">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (locationLoading) {
    return (
      <div className={`container mx-auto px-4 py-8 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading location...</span>
        </div>
      </div>
    );
  }

  if (locationError) {
    return (
      <div className={`container mx-auto px-4 py-8 ${className}`}>
        <Alert>
          <AlertDescription>
            {locationError}. Using default location: Delhi, India
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Local News
            </h1>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>{location?.city}, {location?.country}</span>
            </div>
          </div>
          <Button
            onClick={refresh}
            disabled={isFetching}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as NewsTab)}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="latest" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Latest
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="for-you" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            For You
          </TabsTrigger>
        </TabsList>

        <TabsContent value="latest" className="space-y-6">
          {loading ? (
            <NewsSkeleton />
          ) : error ? (
            <Alert>
              <AlertDescription>
                Failed to load news: {error.message}
              </AlertDescription>
            </Alert>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {articles.map((article) => (
                  <motion.div
                    key={article.article_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <NewsCard
                      article={article}
                      onLike={() => handleLike(article.article_id)}
                      onComment={() => handleComment(article.article_id)}
                      onShare={() => handleShare(article.article_id)}
                      onPoll={() => handlePoll(article.article_id)}
                      isLiked={getInteractionData(article.article_id).isLiked}
                      likesCount={getInteractionData(article.article_id).likesCount}
                      commentsCount={getInteractionData(article.article_id).commentsCount}
                      sharesCount={getInteractionData(article.article_id).sharesCount}
                      pollsCount={getInteractionData(article.article_id).pollsCount}
                    />
                  </motion.div>
                ))}

                {hasMore && (
                  <div className="flex justify-center py-8">
                    <Button
                      onClick={loadMore}
                      disabled={isFetching}
                      variant="outline"
                    >
                      {isFetching ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load More'
                      )}
                    </Button>
                  </div>
                )}

                {articles.length === 0 && !loading && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Globe className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No news found
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Try refreshing or check back later for updates.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          {loading ? (
            <NewsSkeleton />
          ) : error ? (
            <Alert>
              <AlertDescription>
                Failed to load trending news: {error.message}
              </AlertDescription>
            </Alert>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {articles.map((article) => (
                  <motion.div
                    key={article.article_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <NewsCard
                      article={article}
                      onLike={() => handleLike(article.article_id)}
                      onComment={() => handleComment(article.article_id)}
                      onShare={() => handleShare(article.article_id)}
                      onPoll={() => handlePoll(article.article_id)}
                      isLiked={getInteractionData(article.article_id).isLiked}
                      likesCount={getInteractionData(article.article_id).likesCount}
                      commentsCount={getInteractionData(article.article_id).commentsCount}
                      sharesCount={getInteractionData(article.article_id).sharesCount}
                      pollsCount={getInteractionData(article.article_id).pollsCount}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </TabsContent>

        <TabsContent value="for-you" className="space-y-6">
          {loading ? (
            <NewsSkeleton />
          ) : error ? (
            <Alert>
              <AlertDescription>
                Failed to load personalized news: {error.message}
              </AlertDescription>
            </Alert>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {articles.map((article) => (
                  <motion.div
                    key={article.article_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <NewsCard
                      article={article}
                      onLike={() => handleLike(article.article_id)}
                      onComment={() => handleComment(article.article_id)}
                      onShare={() => handleShare(article.article_id)}
                      onPoll={() => handlePoll(article.article_id)}
                      isLiked={getInteractionData(article.article_id).isLiked}
                      likesCount={getInteractionData(article.article_id).likesCount}
                      commentsCount={getInteractionData(article.article_id).commentsCount}
                      sharesCount={getInteractionData(article.article_id).sharesCount}
                      pollsCount={getInteractionData(article.article_id).pollsCount}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AnimatePresence>
        {showComments && (
          <NewsComments
            articleId={showComments}
            onClose={() => setShowComments(null)}
          />
        )}
        {showPoll && (
          <NewsPoll
            articleId={showPoll}
            onClose={() => setShowPoll(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
