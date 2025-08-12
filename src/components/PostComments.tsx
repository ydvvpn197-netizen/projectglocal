import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MessageCircle, MoreHorizontal, Trash2, Send } from 'lucide-react';
import { useComments, Comment } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface PostCommentsProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
  postOwnerId?: string;
}

export const PostComments = ({ postId, isOpen, onClose, postOwnerId }: PostCommentsProps) => {
  const { comments, loading, addComment, deleteComment } = useComments(postId);
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getTimeAgo = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, HH:mm');
    } catch {
      return 'Unknown time';
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    const result = await addComment(newComment);
    if (!result?.error) {
      setNewComment('');
    }
    setSubmitting(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  if (!isOpen) return null;

  return (
    <Card className="mt-4 border-t-0 rounded-t-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comments ({comments.length})
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Add Comment */}
        <div className="space-y-3">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={handleKeyPress}
            className="min-h-[80px] resize-none"
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || submitting}
              size="sm"
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {submitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      currentUserId={user?.id}
                      postOwnerId={postOwnerId}
                      onDelete={deleteComment}
                      getInitials={getInitials}
                      getTimeAgo={getTimeAgo}
                    />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  postOwnerId?: string;
  onDelete: (commentId: string) => void;
  getInitials: (name?: string) => string;
  getTimeAgo: (dateString: string) => string;
}

const CommentItem = ({ comment, currentUserId, postOwnerId, onDelete, getInitials, getTimeAgo }: CommentItemProps) => {
  const canDelete = currentUserId === comment.user_id || currentUserId === postOwnerId;
  return (
    <div className="flex gap-3 p-3 rounded-lg bg-muted/30">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={comment.profiles?.avatar_url || ""} />
        <AvatarFallback className="bg-primary/10 text-primary text-xs">
          {getInitials(comment.profiles?.display_name || comment.profiles?.username)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">
              {comment.profiles?.display_name || comment.profiles?.username || 'Anonymous'}
            </span>
            <span className="text-xs text-muted-foreground">
              {getTimeAgo(comment.created_at)}
            </span>
          </div>

          {canDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onDelete(comment.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <p className="text-sm text-foreground break-words">{comment.content}</p>
      </div>
    </div>
  );
};