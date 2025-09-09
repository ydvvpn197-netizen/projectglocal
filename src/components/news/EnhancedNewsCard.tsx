import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { aiSummarizationService, NewsArticle, AISummary } from '@/services/aiSummarizationService';
import { anonymousUserService } from '@/services/anonymousUserService';
import { 
  ExternalLink, 
  Clock, 
  TrendingUp, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  ThumbsUp, 
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  Sparkles,
  MapPin,
  Calendar,
  User,
  Tag
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface EnhancedNewsCardProps {
  article: NewsArticle;
  onComment?: (article: NewsArticle) => void;
  onShare?: (article: NewsArticle) => void;
  onBookmark?: (article: NewsArticle) => void;
  onVote?: (article: NewsArticle, voteType: 1 | -1 | 0) => void;
  showFullSummary?: boolean;
  className?: string;
}

export function EnhancedNewsCard({
  article,
  onComment,
  onShare,
  onBookmark,
  onVote,
  showFullSummary = false,
  className = ''
}: EnhancedNewsCardProps) {
  const { toast } = useToast();
  const [summary, setSummary] = useState<AISummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isExpanded, setIsExpanded] = useState(showFullSummary);
  const [userVote, setUserVote] = useState<1 | -1 | 0>(0);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    if (article.summary) {
      // Use existing summary if available
      setSummary({
        summary: article.summary,
        key_points: article.key_points || [],
        sentiment: article.sentiment || 'neutral',
        reading_time_minutes: article.reading_time_minutes || 1,
        tags: article.tags || [],
        confidence_score: 0.8,
        generated_at: new Date().toISOString(),
      });
    } else {
      // Generate new summary
      generateSummary();
    }
  }, [article]);

  const generateSummary = async () => {
    setIsLoadingSummary(true);
    try {
      const aiSummary = await aiSummarizationService.generateSummary(article);
      setSummary(aiSummary);
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: 'Summary Error',
        description: 'Failed to generate AI summary. Showing basic content.',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleVote = async (voteType: 1 | -1 | 0) => {
    if (isVoting) return;

    setIsVoting(true);
    try {
      // Record vote anonymously
      await anonymousUserService.voteOnAnonymousPost(article.id, voteType);
      setUserVote(voteType);
      onVote?.(article, voteType);
      
      toast({
        title: 'Vote Recorded',
        description: 'Your vote has been recorded anonymously.',
      });
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: 'Error',
        description: 'Failed to record vote. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsVoting(false);
    }
  };

  const handleComment = () => {
    onComment?.(article);
  };

  const handleShare = () => {
    onShare?.(article);
  };

  const handleBookmark = () => {
    onBookmark?.(article);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'negative':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return '😊';
      case 'negative':
        return '😞';
      default:
        return '😐';
    }
  };

  const formatReadingTime = (minutes: number) => {
    if (minutes < 1) return '< 1 min read';
    if (minutes === 1) return '1 min read';
    return `${minutes} min read`;
  };

  return (
    <Card className={`w-full hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold leading-tight mb-2 line-clamp-2">
              {article.title}
            </h3>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{article.source}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}</span>
              </div>
              {article.location?.city && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{article.location.city}</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {article.category}
              </Badge>
              {summary && (
                <Badge className={`text-xs ${getSentimentColor(summary.sentiment)}`}>
                  {getSentimentIcon(summary.sentiment)} {summary.sentiment}
                </Badge>
              )}
              {summary && (
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatReadingTime(summary.reading_time_minutes)}
                </Badge>
              )}
            </div>
          </div>

          {article.image_url && (
            <div className="ml-4">
              <img
                src={article.image_url}
                alt={article.title}
                className="w-20 h-20 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* AI Summary */}
          {isLoadingSummary ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 animate-pulse" />
                <span>Generating AI summary...</span>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ) : summary ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">AI Summary</span>
                <Badge variant="outline" className="text-xs">
                  {Math.round(summary.confidence_score * 100)}% confidence
                </Badge>
              </div>
              
              <p className="text-sm leading-relaxed">
                {summary.summary}
              </p>

              {/* Key Points */}
              {summary.key_points && summary.key_points.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Key Points</span>
                  </div>
                  <ul className="space-y-1">
                    {summary.key_points.slice(0, isExpanded ? undefined : 3).map((point, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  {summary.key_points.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="h-auto p-0 text-xs"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3 w-3 mr-1" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3 mr-1" />
                          Show {summary.key_points.length - 3} more
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}

              {/* Tags */}
              {summary.tags && summary.tags.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {summary.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {article.content.substring(0, 200)}...
            </p>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                variant={userVote === 1 ? "default" : "ghost"}
                size="sm"
                onClick={() => handleVote(userVote === 1 ? 0 : 1)}
                disabled={isVoting}
                className="h-8"
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button
                variant={userVote === -1 ? "destructive" : "ghost"}
                size="sm"
                onClick={() => handleVote(userVote === -1 ? 0 : -1)}
                disabled={isVoting}
                className="h-8"
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleComment}
                className="h-8"
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Comment
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className="h-8"
              >
                <Bookmark className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="h-8"
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(article.url, '_blank')}
                className="h-8"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Read Full
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
