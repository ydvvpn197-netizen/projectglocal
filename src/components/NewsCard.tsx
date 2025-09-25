// NewsCard component for displaying individual news articles
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  BarChart3, 
  ExternalLink,
  Clock,
  MapPin
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { OptimizedImage } from './optimization/OptimizedImage';
import { useNewsRealtime } from '@/hooks/useNews';
import type { NewsCardProps } from '@/types/news';

export const NewsCard: React.FC<NewsCardProps> = ({
  article,
  showActions = true,
  onLike,
  onComment,
  onShare,
  onPoll,
  isLiked = false,
  likesCount = 0,
  commentsCount = 0,
  sharesCount = 0,
  pollsCount = 0
}) => {
  // Real-time subscriptions for live interaction updates
  const realtimeUpdates = useNewsRealtime([article.article_id]);
  
  // Handle real-time updates
  React.useEffect(() => {
    if (realtimeUpdates.length > 0) {
      // The parent component will handle refreshing the data
      // This is just to ensure the component is aware of real-time updates
    }
  }, [realtimeUpdates]);

  const handleExternalLink = () => {
    window.open(article.url, '_blank', 'noopener,noreferrer');
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike?.(article.article_id);
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComment?.(article.article_id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.(article.article_id);
  };

  const handlePoll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPoll?.(article.article_id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {article.title}
              </h3>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}</span>
                </div>
                {article.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{article.city}</span>
                  </div>
                )}
              </div>
            </div>
            {article.image_url && (
              <div className="flex-shrink-0">
                <OptimizedImage
                  src={article.image_url}
                  alt={article.title}
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover rounded-lg"
                  lazy={true}
                  quality={85}
                />
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* AI Summary */}
          {article.ai_summary && (
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
              {article.ai_summary}
            </p>
          )}

          {/* Source */}
          <div className="flex items-center gap-2 mb-4">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {article.source_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {article.source_name}
            </span>
            {article.category && (
              <Badge variant="secondary" className="text-xs">
                {article.category}
              </Badge>
            )}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`flex items-center gap-2 ${
                    isLiked 
                      ? 'text-red-500 hover:text-red-600' 
                      : 'text-gray-600 hover:text-red-500'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm">{likesCount}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleComment}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-500"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm">{commentsCount}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="flex items-center gap-2 text-gray-600 hover:text-green-500"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="text-sm">{sharesCount}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePoll}
                  className="flex items-center gap-2 text-gray-600 hover:text-purple-500"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-sm">{pollsCount}</span>
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExternalLink}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="text-sm">Read More</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
