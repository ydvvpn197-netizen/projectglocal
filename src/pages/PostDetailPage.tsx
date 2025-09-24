import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SocialMediaPost, SocialPost } from '@/components/SocialMediaPost';
import { SocialPostService } from '@/services/socialPostService';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2, ArrowLeft, Send, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id?: string;
  content: string;
  upvotes: number;
  downvotes: number;
  score: number;
  reply_count: number;
  is_anonymous: boolean;
  depth: number;
  created_at: string;
  updated_at: string;
  author_name?: string;
  author_avatar?: string;
  user_vote?: number;
}

export const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<SocialPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    if (postId) {
      loadPost();
      loadComments();
    }
  }, [postId, loadPost, loadComments]);

  const loadPost = useCallback(async () => {
    try {
      if (!postId) return;
      
      const postData = await SocialPostService.getPost(postId);
      if (postData) {
        setPost(postData);
        // Record view
        await SocialPostService.recordView(postId);
      } else {
        navigate('/404');
      }
    } catch (error) {
      console.error('Error loading post:', error);
      navigate('/404');
    } finally {
      setLoading(false);
    }
  }, [postId, navigate]);

  const loadComments = useCallback(async () => {
    try {
      if (!postId) return;

      const { data, error } = await supabase
        .from('social_comments')
        .select(`
          *,
          profiles!social_comments_user_id_fkey(
            display_name,
            avatar_url
          ),
          comment_votes!comment_votes_comment_id_fkey(
            vote_type
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

              const transformedComments = data.map(comment => ({
          ...comment,
          author_name: comment.profiles?.display_name,
          author_avatar: comment.profiles?.avatar_url,
          user_vote: comment.comment_votes?.[0]?.vote_type || 0
        }));

      setComments(transformedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  }, [postId]);

  const handleSubmitComment = async () => {
    if (!user || !postId || !commentContent.trim()) return;

    setSubmittingComment(true);
    try {
      const { data, error } = await supabase
        .from('social_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: commentContent.trim(),
          is_anonymous: false
        })
        .select(`
          *,
          profiles!social_comments_user_id_fkey(
            display_name,
            avatar_url
          )
        `)
        .single();

      if (error) {
        throw error;
      }

      const newComment: Comment = {
        ...data,
        author_name: data.profiles?.display_name,
        author_avatar: data.profiles?.avatar_url,
        user_vote: 0
      };

      setComments(prev => [...prev, newComment]);
      setCommentContent('');
      
      // Update post comment count
      if (post) {
        setPost(prev => prev ? { ...prev, comment_count: prev.comment_count + 1 } : null);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!user || !postId || !replyContent.trim()) return;

    try {
      const { data, error } = await supabase
        .from('social_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          parent_id: parentId,
          content: replyContent.trim(),
          is_anonymous: false,
          depth: 1
        })
        .select(`
          *,
          profiles!social_comments_user_id_fkey(
            display_name,
            avatar_url
          )
        `)
        .single();

      if (error) {
        throw error;
      }

      const newReply: Comment = {
        ...data,
        author_name: data.profiles?.display_name,
        author_avatar: data.profiles?.avatar_url,
        user_vote: 0
      };

      setComments(prev => [...prev, newReply]);
      setReplyContent('');
      setReplyingTo(null);
      
      // Update parent comment reply count
      setComments(prev => prev.map(comment => 
        comment.id === parentId 
          ? { ...comment, reply_count: comment.reply_count + 1 }
          : comment
      ));
      
      // Update post comment count
      if (post) {
        setPost(prev => prev ? { ...prev, comment_count: prev.comment_count + 1 } : null);
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    }
  };

  const handleVoteComment = async (commentId: string, voteType: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('comment_votes')
        .upsert({
          comment_id: commentId,
          user_id: user.id,
          vote_type: voteType
        });

      if (error) {
        throw error;
      }

      // Update local state
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          const previousVote = comment.user_vote || 0;
          let newScore = comment.score;
          
          if (previousVote === voteType) {
            // Remove vote
            newScore = comment.score - voteType;
            return { ...comment, user_vote: 0, score: newScore };
          } else if (previousVote === 0) {
            // Add vote
            newScore = comment.score + voteType;
            return { ...comment, user_vote: voteType, score: newScore };
          } else {
            // Change vote
            newScore = comment.score - previousVote + voteType;
            return { ...comment, user_vote: voteType, score: newScore };
          }
        }
        return comment;
      }));
    } catch (error) {
      console.error('Error voting on comment:', error);
    }
  };

  const handleVote = async (postId: string, voteType: number): Promise<boolean> => {
    try {
      await SocialPostService.votePost(postId, voteType);
      
      if (post) {
        const previousVote = post.user_vote || 0;
        let newScore = post.score;
        
        if (previousVote === voteType) {
          newScore = post.score - voteType;
          setPost({ ...post, user_vote: 0, score: newScore });
        } else if (previousVote === 0) {
          newScore = post.score + voteType;
          setPost({ ...post, user_vote: voteType, score: newScore });
        } else {
          newScore = post.score - previousVote + voteType;
          setPost({ ...post, user_vote: voteType, score: newScore });
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error voting:', error);
      return false;
    }
  };

  const handleSave = async (postId: string, isSaved: boolean): Promise<boolean> => {
    try {
      await SocialPostService.savePost(postId, isSaved);
      
      if (post) {
        setPost({
          ...post,
          is_saved: isSaved,
          save_count: isSaved ? post.save_count + 1 : post.save_count - 1
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error saving post:', error);
      return false;
    }
  };

  const handleShare = async (postId: string): Promise<boolean> => {
    try {
      await SocialPostService.sharePost(postId);
      
      if (post) {
        setPost({ ...post, share_count: post.share_count + 1 });
      }
      
      return true;
    } catch (error) {
      console.error('Error sharing post:', error);
      return false;
    }
  };

  const handlePin = async (postId: string, isPinned: boolean): Promise<boolean> => {
    try {
      await SocialPostService.pinPost(postId, isPinned);
      
      if (post) {
        setPost({ ...post, is_pinned: isPinned });
      }
      
      return true;
    } catch (error) {
      console.error('Error pinning post:', error);
      return false;
    }
  };

  const handleLock = async (postId: string, isLocked: boolean): Promise<boolean> => {
    try {
      await SocialPostService.lockPost(postId, isLocked);
      
      if (post) {
        setPost({ ...post, is_locked: isLocked });
      }
      
      return true;
    } catch (error) {
      console.error('Error locking post:', error);
      return false;
    }
  };

  const handleDelete = async (postId: string): Promise<boolean> => {
    try {
      await SocialPostService.deletePost(postId);
      navigate('/');
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h2>
        <Button onClick={() => navigate('/')}>
          Go back home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Post */}
      <div className="mb-8">
        <SocialMediaPost
          post={post}
          onVote={handleVote}
          onSave={handleSave}
          onShare={handleShare}
          onPin={handlePin}
          onLock={handleLock}
          onDelete={handleDelete}
        />
      </div>

      {/* Comments Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900">
          Comments ({post.comment_count})
        </h3>

        {/* Comment Form */}
        {user && !post.is_locked && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {user.user_metadata?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Add a comment..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      onClick={handleSubmitComment}
                      disabled={!commentContent.trim() || submittingComment}
                      size="sm"
                    >
                      {submittingComment ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id} className={cn(comment.depth > 0 && 'ml-8')}>
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  {/* Vote Buttons */}
                  <div className="flex flex-col items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        'h-6 w-6 hover:bg-green-50 hover:text-green-600',
                        comment.user_vote === 1 && 'text-green-600 bg-green-50'
                      )}
                      onClick={() => handleVoteComment(comment.id, 1)}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <span className={cn(
                      'text-xs font-medium',
                      comment.score > 0 && 'text-green-600',
                      comment.score < 0 && 'text-red-600',
                      comment.score === 0 && 'text-gray-500'
                    )}>
                      {comment.score}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        'h-6 w-6 hover:bg-red-50 hover:text-red-600',
                        comment.user_vote === -1 && 'text-red-600 bg-red-50'
                      )}
                      onClick={() => handleVoteComment(comment.id, -1)}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex-1">
                    {/* Comment Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={comment.author_avatar} />
                        <AvatarFallback>
                          {comment.author_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-900">
                        {comment.is_anonymous ? 'Anonymous' : comment.author_name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>

                    {/* Comment Content */}
                    <p className="text-sm text-gray-700 mb-3">
                      {comment.content}
                    </p>

                    {/* Comment Actions */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {user && !post.is_locked && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        >
                          Reply
                        </Button>
                      )}
                    </div>

                    {/* Reply Form */}
                    {replyingTo === comment.id && user && (
                      <div className="mt-4 flex gap-3">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.user_metadata?.avatar_url} />
                          <AvatarFallback>
                            {user.user_metadata?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Textarea
                            placeholder="Write a reply..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="min-h-[60px]"
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyContent('');
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleSubmitReply(comment.id)}
                              disabled={!replyContent.trim()}
                            >
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty Comments State */}
        {comments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
};
