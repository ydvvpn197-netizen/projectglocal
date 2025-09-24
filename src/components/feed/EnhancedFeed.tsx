import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Eye,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Reply,
  Send,
  Smile,
  Camera,
  Mic,
  Paperclip,
  Loader2,
  TrendingUp,
  Clock,
  Users,
  MapPin
} from 'lucide-react';
import { useInfiniteFeed, useInfiniteScroll, useSmartPrefetch } from '@/hooks/useInfiniteFeed';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface EnhancedFeedProps {
  feedType?: 'trending' | 'latest' | 'following' | 'local';
  className?: string;
}

export const EnhancedFeed: React.FC<EnhancedFeedProps> = ({ 
  feedType = 'trending',
  className 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());

  const {
    posts,
    loadMore,
    hasNextPage,
    isLoading,
    isLoadingMore,
    isError,
    error,
    refetch
  } = useInfiniteFeed({ feedType });

  const { prefetchPost } = useSmartPrefetch();
  const observerRef = useInfiniteScroll(loadMore, hasNextPage);

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  // Handle post interactions
  const handleLike = useCallback(async (postId: string) => {
    if (!user) return;

    const isLiked = likedPosts.has(postId);
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (isLiked) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });

    try {
      if (isLiked) {
        await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', user.id);
      } else {
        await supabase.from('likes').insert({ post_id: postId, user_id: user.id });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.add(postId);
        } else {
          newSet.delete(postId);
        }
        return newSet;
      });
    }
  }, [user, likedPosts]);

  const handleBookmark = useCallback(async (postId: string) => {
    if (!user) return;

    const isBookmarked = bookmarkedPosts.has(postId);
    setBookmarkedPosts(prev => {
      const newSet = new Set(prev);
      if (isBookmarked) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });

    // TODO: Implement bookmark functionality
    toast({
      title: isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
      description: isBookmarked ? "Post removed from your bookmarks" : "Post saved to your bookmarks"
    });
  }, [user, bookmarkedPosts, toast]);

  const handleShare = useCallback(async (postId: string) => {
    const shareUrl = `${window.location.origin}/post/${postId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this post on TheGlocal',
          url: shareUrl
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied",
        description: "Post link copied to clipboard"
      });
    }
  }, [toast]);

  // Render post content based on type
  const renderPostContent = (post: any) => {
    switch (post.type) {
      case "event":
        return (
          <div className="space-y-3">
            <p className="text-gray-900">{post.content}</p>
            <Card className="event-card border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {post.image_urls?.[0] && (
                    <img 
                      src={post.image_urls[0]} 
                      alt={post.title || 'Event'}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{post.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      {post.event_date && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(post.event_date).toLocaleDateString()}
                        </span>
                      )}
                      {post.event_location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {post.event_location}
                        </span>
                      )}
                    </div>
                    {post.price_range && (
                      <Badge variant="secondary">{post.price_range}</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      default:
        return (
          <div className="space-y-3">
            {post.title && <h3 className="font-semibold text-lg">{post.title}</h3>}
            <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
            {post.image_urls && post.image_urls.length > 0 && (
              <div className="grid grid-cols-1 gap-2">
                {post.image_urls.map((image: string, index: number) => (
                  <img 
                    key={index}
                    src={image} 
                    alt="Post content"
                    className="w-full rounded-lg object-cover max-h-96"
                    loading="lazy"
                    onMouseEnter={() => prefetchPost(post.id)}
                  />
                ))}
              </div>
            )}
          </div>
        );
    }
  };

  // Loading skeleton
  const PostSkeleton = () => (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-3 bg-gray-200 rounded w-16" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Failed to load posts</h3>
          <p className="text-muted-foreground mb-4">
            {error?.message || "Something went wrong while loading posts"}
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
          <p className="text-muted-foreground mb-4">
            Be the first to share something with your community!
          </p>
          <Button onClick={() => window.location.href = '/create'}>
            Create Post
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <AnimatePresence>
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            layout
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.author?.avatar_url || undefined} />
                      <AvatarFallback>
                        {post.author?.display_name?.[0] || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {post.is_anonymous ? 'Anonymous' : (post.author?.display_name || 'Unknown')}
                        </h3>
                        {post.likes_count && post.likes_count > 5 && (
                          <Badge variant="destructive" className="text-xs">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatTimeAgo(post.created_at)}</span>
                        <span>•</span>
                        <span className="capitalize">{post.type}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {renderPostContent(post)}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`gap-2 ${likedPosts.has(post.id) ? 'text-red-500' : ''}`}
                      onClick={() => handleLike(post.id)}
                    >
                      <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                      {post.likes_count || 0}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <MessageCircle className="w-4 h-4" />
                      {post.comments_count || 0}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => handleShare(post.id)}
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleBookmark(post.id)}
                    >
                      <Bookmark className={`w-4 h-4 ${bookmarkedPosts.has(post.id) ? 'fill-current text-blue-500' : ''}`} />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Eye className="w-4 h-4" />
                      {post.views_count || 0}
                    </Button>
                  </div>
                </div>
                
                {post.tags && post.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {post.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Loading more indicator */}
      {isLoadingMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center py-8"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading more posts...</span>
          </div>
        </motion.div>
      )}

      {/* Intersection observer trigger */}
      {hasNextPage && (
        <div ref={observerRef} className="h-4" />
      )}

      {/* End of feed indicator */}
      {!hasNextPage && posts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-muted-foreground"
        >
          <p>You've reached the end of the feed</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => refetch()}
          >
            Refresh Feed
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default EnhancedFeed;
