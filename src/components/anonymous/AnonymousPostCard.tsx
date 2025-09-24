import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { anonymousUserService, AnonymousPost } from '@/services/anonymousUserService';
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  MapPin, 
  Calendar, 
  BarChart3, 
  Newspaper,
  MessageCircle,
  Share2,
  Flag,
  MoreHorizontal
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AnonymousPostCardProps {
  post: AnonymousPost;
  onVote?: (postId: string, voteType: 1 | -1 | 0) => void;
  onComment?: (post: AnonymousPost) => void;
  onShare?: (post: AnonymousPost) => void;
  onReport?: (post: AnonymousPost) => void;
  showComments?: boolean;
  className?: string;
}

export function AnonymousPostCard({
  post,
  onVote,
  onComment,
  onShare,
  onReport,
  showComments = false,
  className = ''
}: AnonymousPostCardProps) {
  const { toast } = useToast();
  const [isVoting, setIsVoting] = useState(false);
  const [userVote, setUserVote] = useState<1 | -1 | 0>(0);
  const [showFullContent, setShowFullContent] = useState(false);

  const postTypeIcons = {
    discussion: MessageSquare,
    question: MessageSquare,
    announcement: Calendar,
    event: Calendar,
    poll: BarChart3,
    news_comment: Newspaper
  };

  const postTypeColors = {
    discussion: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    question: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    announcement: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    event: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    poll: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    news_comment: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  };

  const Icon = postTypeIcons[post.post_type];
  const colorClass = postTypeColors[post.post_type];

  const handleVote = async (voteType: 1 | -1 | 0) => {
    if (isVoting) return;

    setIsVoting(true);
    try {
      await anonymousUserService.voteOnAnonymousPost(post.id, voteType);
      setUserVote(voteType);
      onVote?.(post.id, voteType);
      
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
    onComment?.(post);
  };

  const handleShare = () => {
    onShare?.(post);
  };

  const handleReport = () => {
    onReport?.(post);
  };

  const getInitials = (username: string) => {
    return username
      .split('')
      .filter(char => /[A-Z]/.test(char))
      .slice(0, 2)
      .join('')
      .toUpperCase() || username.slice(0, 2).toUpperCase();
  };

  const formatContent = (content: string) => {
    if (content.length <= 200 || showFullContent) {
      return content;
    }
    return content.slice(0, 200) + '...';
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {getInitials(post.anonymous_username)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{post.anonymous_username}</span>
                <Badge variant="secondary" className="text-xs">
                  Anonymous
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                {post.location_city && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{post.location_city}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Badge className={`text-xs ${colorClass}`}>
              {post.post_type.replace('_', ' ')}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReport}
              className="h-8 w-8 p-0"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Content */}
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="whitespace-pre-wrap">{formatContent(post.content)}</p>
            {post.content.length > 200 && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setShowFullContent(!showFullContent)}
                className="p-0 h-auto text-xs"
              >
                {showFullContent ? 'Show less' : 'Show more'}
              </Button>
            )}
          </div>

          {/* Engagement Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" />
              <span>{post.upvotes}</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsDown className="h-4 w-4" />
              <span>{post.downvotes}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{post.comment_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{post.view_count}</span>
            </div>
          </div>

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
                <MessageCircle className="h-4 w-4 mr-1" />
                Comment
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
            </div>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground mb-2">
                Comments ({post.comment_count})
              </div>
              {/* Comments would be loaded here */}
              <div className="text-sm text-muted-foreground italic">
                Comments will be loaded when implemented
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
