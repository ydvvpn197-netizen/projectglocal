import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  ExternalLink,
  Clock,
  MapPin,
  User,
  Eye,
  TrendingUp,
  Calendar,
  Tag,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { OptimizedImage } from './OptimizedImage';
import type { NewsArticle } from '@/hooks/useNewsData';

interface NewsArticleViewProps {
  article: NewsArticle;
  onBack: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  className?: string;
}

export const NewsArticleView: React.FC<NewsArticleViewProps> = ({
  article,
  onBack,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
  className
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [engagement, setEngagement] = useState(article.engagement);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && hasPrevious && onPrevious) {
        onPrevious();
      } else if (event.key === 'ArrowRight' && hasNext && onNext) {
        onNext();
      } else if (event.key === 'Escape') {
        onBack();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hasNext, hasPrevious, onNext, onPrevious, onBack]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setEngagement(prev => ({
      ...prev,
      likes: prev.likes + (isLiked ? -1 : 1)
    }));
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: article.url
      });
    } else {
      navigator.clipboard.writeText(article.url);
    }
  };

  const handleExternalLink = () => {
    window.open(article.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className={`px-4 py-8 ${className}`}
    >
      {/* Navigation Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to News Feed
          </Button>
          
          <div className="flex items-center gap-2">
            {hasPrevious && (
              <Button
                variant="outline"
                size="sm"
                onClick={onPrevious}
                className="flex items-center gap-2"
                title="Previous article (←)"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
            )}
            {hasNext && (
              <Button
                variant="outline"
                size="sm"
                onClick={onNext}
                className="flex items-center gap-2"
                title="Next article (→)"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto">
        <Card className="overflow-hidden">
          {/* Article Header */}
          <CardHeader className="pb-4">
            <div className="space-y-4">
              {/* Category and Source */}
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="text-sm">
                  {article.category}
                </Badge>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {article.sourceName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {article.sourceName}
                  </span>
                </div>
              </div>

              {/* Title */}
              <CardTitle className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                {article.title}
              </CardTitle>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
                </div>
                {article.author && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{article.author}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{article.city}, {article.country}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{engagement.views} views</span>
                </div>
              </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardHeader>

          {/* Article Image */}
          {article.imageUrl && (
            <div className="px-6 pb-4">
              <OptimizedImage
                src={article.imageUrl}
                alt={article.title}
                width={800}
                height={400}
                className="w-full h-64 lg:h-80 object-cover rounded-lg"
                lazy={false}
                quality={90}
              />
            </div>
          )}

          <Separator />

          {/* Article Content */}
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Summary */}
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  {article.summary}
                </p>
              </div>

              {/* Full Content (if available) */}
              {article.content && (
                <div className="prose prose-lg max-w-none">
                  <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {article.content}
                  </div>
                </div>
              )}

              {/* External Link */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Read the full article
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Continue reading on {article.sourceName}
                    </p>
                  </div>
                  <Button
                    onClick={handleExternalLink}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Read More
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>

          <Separator />

          {/* Engagement Actions */}
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Button
                  variant="ghost"
                  onClick={handleLike}
                  className={`flex items-center gap-2 ${
                    isLiked 
                      ? 'text-red-500 hover:text-red-600' 
                      : 'text-gray-600 hover:text-red-500'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="font-medium">{engagement.likes}</span>
                </Button>

                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-500"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="font-medium">{engagement.comments}</span>
                </Button>

                <Button
                  variant="ghost"
                  onClick={handleShare}
                  className="flex items-center gap-2 text-gray-600 hover:text-green-500"
                >
                  <Share2 className="h-5 w-5" />
                  <span className="font-medium">{engagement.shares}</span>
                </Button>
              </div>

              <Button
                variant="ghost"
                onClick={handleBookmark}
                className={`flex items-center gap-2 ${
                  isBookmarked 
                    ? 'text-blue-500 hover:text-blue-600' 
                    : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
                <span className="font-medium">
                  {isBookmarked ? 'Saved' : 'Save'}
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Related Articles or Comments Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Comments & Discussion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Join the Discussion
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Share your thoughts and engage with other readers
                </p>
                <Button variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Add Comment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Keyboard Navigation Hint */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            💡 Tip: Use arrow keys (← →) to navigate between articles, or press Escape to go back
          </p>
        </div>
      </div>
    </motion.div>
  );
};
