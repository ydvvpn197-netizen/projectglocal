import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  ThumbsUp, 
  ThumbsDown, 
  Reply, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useNewsComments, NewsComment, CreateCommentRequest } from '@/hooks/useNewsComments';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface NewsCommentsProps {
  articleId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const NewsComments: React.FC<NewsCommentsProps> = ({ 
  articleId, 
  isOpen, 
  onClose 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    comments, 
    loading, 
    submitting, 
    error, 
    addComment, 
    editComment, 
    deleteComment, 
    voteComment 
  } = useNewsComments(articleId);

  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || submitting) return;

    const commentData: CreateCommentRequest = {
      article_id: articleId,
      content: newComment,
      parent_comment_id: replyingTo || undefined
    };

    const result = await addComment(commentData);
    if (result.success) {
      setNewComment('');
      setReplyingTo(null);
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim() || submitting) return;

    const result = await editComment(commentId, editContent);
    if (result.success) {
      setEditingComment(null);
      setEditContent('');
      toast({
        title: "Comment updated",
        description: "Your comment has been updated successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update comment",
        variant: "destructive",
      });
    }
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    const result = await deleteComment(commentId);
    if (result.success) {
      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  const handleVote = async (commentId: string, voteType: -1 | 0 | 1) => {
    const result = await voteComment(commentId, voteType);
    if (!result.success) {
      toast({
        title: "Error",
        description: result.error || "Failed to vote",
        variant: "destructive",
      });
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const startReply = (commentId: string) => {
    setReplyingTo(commentId);
    setNewComment('');
  };

  const startEdit = (comment: NewsComment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setNewComment('');
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const renderComment = (comment: NewsComment, isReply: boolean = false) => {
    const isExpanded = expandedReplies.has(comment.id);
    const canEdit = user?.id === comment.user_id;
    const canDelete = user?.id === comment.user_id;

    return (
      <motion.div
        key={comment.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`${isReply ? 'ml-8 mt-4' : 'mb-4'}`}
      >
        <Card className={`${isReply ? 'border-l-4 border-l-blue-200' : ''} feed-item`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.author_avatar} />
                <AvatarFallback className="text-xs">
                  {getInitials(comment.author_name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm text-gray-900 dark:text-white">
                    {comment.author_name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {getTimeAgo(comment.created_at)}
                  </span>
                  {comment.is_edited && (
                    <Badge variant="outline" className="text-xs">
                      edited
                    </Badge>
                  )}
                </div>

                {editingComment === comment.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Edit your comment..."
                      className="min-h-[80px]"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleEditComment(comment.id)}
                        disabled={submitting || !editContent.trim()}
                      >
                        {submitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Save'
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                      {comment.content}
                    </p>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-gray-600 hover:text-green-600"
                          onClick={() => handleVote(comment.id, comment.user_vote === 1 ? 0 : 1)}
                        >
                          <ThumbsUp className={`h-3 w-3 ${comment.user_vote === 1 ? 'text-green-600' : ''}`} />
                          <span className="ml-1 text-xs">{comment.upvotes}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-gray-600 hover:text-red-600"
                          onClick={() => handleVote(comment.id, comment.user_vote === -1 ? 0 : -1)}
                        >
                          <ThumbsDown className={`h-3 w-3 ${comment.user_vote === -1 ? 'text-red-600' : ''}`} />
                          <span className="ml-1 text-xs">{comment.downvotes}</span>
                        </Button>
                      </div>

                      {!isReply && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-gray-600 hover:text-blue-600"
                          onClick={() => startReply(comment.id)}
                        >
                          <Reply className="h-3 w-3" />
                          <span className="ml-1 text-xs">Reply</span>
                        </Button>
                      )}

                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-gray-600 hover:text-blue-600"
                          onClick={() => startEdit(comment)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}

                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-gray-600 hover:text-red-600"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}

                      {comment.reply_count > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-gray-600 hover:text-blue-600"
                          onClick={() => toggleReplies(comment.id)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                          <span className="ml-1 text-xs">
                            {isExpanded ? 'Hide' : 'Show'} {comment.reply_count} {comment.reply_count === 1 ? 'reply' : 'replies'}
                          </span>
                        </Button>
                      )}
                    </div>

                    {/* Reply form */}
                    {replyingTo === comment.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <Textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder={`Reply to ${comment.author_name}...`}
                          className="min-h-[80px] mb-2"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleSubmitComment}
                            disabled={submitting || !newComment.trim()}
                          >
                            {submitting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-1" />
                                Reply
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelReply}
                          >
                            Cancel
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* Replies */}
                    {isExpanded && comment.replies && comment.replies.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4"
                      >
                        {comment.replies.map(reply => renderComment(reply, true))}
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-gradient">
              <MessageCircle className="h-5 w-5" />
              Comments ({comments.length})
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto">
          {/* New comment form */}
          {user && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {getInitials(user.user_metadata?.display_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts on this article..."
                    className="min-h-[100px] mb-3"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSubmitComment}
                      disabled={submitting || !newComment.trim()}
                      className="btn-community"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Post Comment
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Comments list */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading comments...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No comments yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Be the first to share your thoughts on this article.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {comments.map(comment => renderComment(comment))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </motion.div>
    </motion.div>
  );
};