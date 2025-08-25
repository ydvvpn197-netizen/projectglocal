import React, { useState, useEffect } from 'react';
import { SocialMediaPost, SocialPost } from './SocialMediaPost';
import { SocialPostService, PostFilters } from '@/services/socialPostService';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SocialMediaFeedProps {
  filters?: PostFilters;
  showCreateButton?: boolean;
  className?: string;
}

export const SocialMediaFeed: React.FC<SocialMediaFeedProps> = ({
  filters = {},
  showCreateButton = true,
  className
}) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 10;

  const loadPosts = async (isRefresh = false) => {
    try {
      const currentOffset = isRefresh ? 0 : offset;
      const newPosts = await SocialPostService.getPosts({
        ...filters,
        limit,
        offset: currentOffset
      });

      if (isRefresh) {
        setPosts(newPosts);
        setOffset(limit);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
        setOffset(prev => prev + limit);
      }

      setHasMore(newPosts.length === limit);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPosts(true);
  };

  const handleLoadMore = async () => {
    if (!hasMore || loading) return;
    await loadPosts();
  };

  const handleVote = async (postId: string, voteType: number): Promise<boolean> => {
    try {
      await SocialPostService.votePost(postId, voteType);
      
      // Update local state
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const previousVote = post.user_vote || 0;
          let newScore = post.score;
          
          if (previousVote === voteType) {
            // Remove vote
            newScore = post.score - voteType;
            return { ...post, user_vote: 0, score: newScore };
          } else if (previousVote === 0) {
            // Add vote
            newScore = post.score + voteType;
            return { ...post, user_vote: voteType, score: newScore };
          } else {
            // Change vote
            newScore = post.score - previousVote + voteType;
            return { ...post, user_vote: voteType, score: newScore };
          }
        }
        return post;
      }));
      
      return true;
    } catch (error) {
      console.error('Error voting:', error);
      return false;
    }
  };

  const handleSave = async (postId: string, isSaved: boolean): Promise<boolean> => {
    try {
      await SocialPostService.savePost(postId, isSaved);
      
      // Update local state
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            is_saved: isSaved,
            save_count: isSaved ? post.save_count + 1 : post.save_count - 1
          };
        }
        return post;
      }));
      
      return true;
    } catch (error) {
      console.error('Error saving post:', error);
      return false;
    }
  };

  const handleShare = async (postId: string): Promise<boolean> => {
    try {
      await SocialPostService.sharePost(postId);
      
      // Update local state
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return { ...post, share_count: post.share_count + 1 };
        }
        return post;
      }));
      
      return true;
    } catch (error) {
      console.error('Error sharing post:', error);
      return false;
    }
  };

  const handlePin = async (postId: string, isPinned: boolean): Promise<boolean> => {
    try {
      await SocialPostService.pinPost(postId, isPinned);
      
      // Update local state
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return { ...post, is_pinned: isPinned };
        }
        return post;
      }));
      
      return true;
    } catch (error) {
      console.error('Error pinning post:', error);
      return false;
    }
  };

  const handleLock = async (postId: string, isLocked: boolean): Promise<boolean> => {
    try {
      await SocialPostService.lockPost(postId, isLocked);
      
      // Update local state
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return { ...post, is_locked: isLocked };
        }
        return post;
      }));
      
      return true;
    } catch (error) {
      console.error('Error locking post:', error);
      return false;
    }
  };

  const handleDelete = async (postId: string): Promise<boolean> => {
    try {
      await SocialPostService.deletePost(postId);
      
      // Remove from local state
      setPosts(prev => prev.filter(post => post.id !== postId));
      
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  };

  useEffect(() => {
    loadPosts(true);
  }, [filters]);

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Community Feed</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {showCreateButton && user && (
            <Button size="sm">
              Create Post
            </Button>
          )}
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {posts.map((post) => (
          <SocialMediaPost
            key={post.id}
            post={post}
            onVote={handleVote}
            onSave={handleSave}
            onShare={handleShare}
            onPin={handlePin}
            onLock={handleLock}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? (
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

      {/* Empty State */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No posts yet
          </h3>
          <p className="text-gray-500 mb-4">
            Be the first to share something with the community!
          </p>
          {user && (
            <Button>
              Create Your First Post
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
