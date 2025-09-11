import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { EventDiscussionService, EventDiscussion, CreateDiscussionData } from '@/services/eventDiscussionService';
import { 
  MessageSquare, 
  Heart, 
  Reply, 
  MoreHorizontal, 
  Send, 
  Eye, 
  EyeOff,
  Edit,
  Trash2,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface EventDiscussionProps {
  eventId: string;
  className?: string;
}

export const EventDiscussion: React.FC<EventDiscussionProps> = ({ eventId, className = '' }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [discussions, setDiscussions] = useState<EventDiscussion[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchDiscussions();
  }, [eventId]);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const { discussions: fetchedDiscussions, error } = await EventDiscussionService.fetchEventDiscussions(eventId);
      
      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }
      
      setDiscussions(fetchedDiscussions);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      toast({
        title: "Error",
        description: "Failed to load discussions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDiscussion = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to participate in discussions.",
        variant: "destructive",
      });
      return;
    }

    if (!newDiscussion.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const discussionData: CreateDiscussionData = {
        event_id: eventId,
        content: newDiscussion.trim(),
        is_anonymous: isAnonymous
      };

      const result = await EventDiscussionService.createDiscussion(discussionData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Discussion posted successfully!",
        });
        setNewDiscussion('');
        setIsAnonymous(false);
        fetchDiscussions(); // Refresh discussions
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to post discussion.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error submitting discussion:', error);
      toast({
        title: "Error",
        description: "Failed to post discussion.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to reply to discussions.",
        variant: "destructive",
      });
      return;
    }

    if (!replyContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const discussionData: CreateDiscussionData = {
        event_id: eventId,
        content: replyContent.trim(),
        parent_id: parentId,
        is_anonymous: isAnonymous
      };

      const result = await EventDiscussionService.createDiscussion(discussionData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Reply posted successfully!",
        });
        setReplyContent('');
        setReplyingTo(null);
        fetchDiscussions(); // Refresh discussions
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to post reply.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      toast({
        title: "Error",
        description: "Failed to post reply.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (discussionId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to like discussions.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await EventDiscussionService.toggleDiscussionLike(discussionId);
      
      if (result.success) {
        fetchDiscussions(); // Refresh discussions to show updated like count
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to like discussion.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error liking discussion:', error);
      toast({
        title: "Error",
        description: "Failed to like discussion.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (discussionId: string) => {
    if (!editContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter content to edit.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await EventDiscussionService.updateDiscussion(discussionId, editContent.trim());
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Discussion updated successfully!",
        });
        setEditingId(null);
        setEditContent('');
        fetchDiscussions(); // Refresh discussions
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update discussion.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating discussion:', error);
      toast({
        title: "Error",
        description: "Failed to update discussion.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (discussionId: string) => {
    if (!confirm('Are you sure you want to delete this discussion?')) {
      return;
    }

    try {
      const result = await EventDiscussionService.deleteDiscussion(discussionId);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Discussion deleted successfully!",
        });
        fetchDiscussions(); // Refresh discussions
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete discussion.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting discussion:', error);
      toast({
        title: "Error",
        description: "Failed to delete discussion.",
        variant: "destructive",
      });
    }
  };

  const DiscussionItem = ({ discussion, isReply = false }: { discussion: EventDiscussion; isReply?: boolean }) => (
    <div className={`${isReply ? 'ml-8 border-l-2 border-muted pl-4' : ''}`}>
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={discussion.author_avatar} />
              <AvatarFallback>
                {discussion.is_anonymous ? 'A' : (discussion.author_name?.[0] || 'U')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm">
                  {discussion.is_anonymous ? 'Anonymous' : discussion.author_name}
                </span>
                {discussion.is_anonymous && (
                  <Badge variant="secondary" className="text-xs">
                    <EyeOff className="h-3 w-3 mr-1" />
                    Anonymous
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}
                </span>
              </div>
              
              {editingId === discussion.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Edit your discussion..."
                    className="min-h-[80px]"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleEdit(discussion.id)}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      setEditingId(null);
                      setEditContent('');
                    }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-foreground mb-3">{discussion.content}</p>
              )}

              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(discussion.id)}
                  className={`flex items-center gap-1 ${discussion.user_liked ? 'text-red-500' : ''}`}
                >
                  <Heart className={`h-4 w-4 ${discussion.user_liked ? 'fill-current' : ''}`} />
                  <span>{discussion.likes_count}</span>
                </Button>
                
                {!isReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setReplyingTo(discussion.id);
                      setReplyContent('');
                    }}
                    className="flex items-center gap-1"
                  >
                    <Reply className="h-4 w-4" />
                    Reply
                  </Button>
                )}

                {user?.id === discussion.user_id && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingId(discussion.id);
                        setEditContent(discussion.content);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(discussion.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reply Form */}
      {replyingTo === discussion.id && (
        <Card className="mb-4 ml-8">
          <CardContent className="p-4">
            <div className="space-y-3">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="min-h-[80px]"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="anonymous-reply"
                    checked={isAnonymous}
                    onCheckedChange={setIsAnonymous}
                  />
                  <Label htmlFor="anonymous-reply" className="text-sm">
                    Post anonymously
                  </Label>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSubmitReply(discussion.id)}
                    disabled={submitting}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Reply
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Replies */}
      {discussion.replies && discussion.replies.length > 0 && (
        <div className="space-y-2">
          {discussion.replies.map((reply) => (
            <DiscussionItem key={reply.id} discussion={reply} isReply={true} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Event Discussions ({discussions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* New Discussion Form */}
          <div className="space-y-4">
            <Textarea
              value={newDiscussion}
              onChange={(e) => setNewDiscussion(e.target.value)}
              placeholder="Share your thoughts about this event..."
              className="min-h-[100px]"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
                <Label htmlFor="anonymous" className="text-sm">
                  Post anonymously
                </Label>
              </div>
              <Button
                onClick={handleSubmitDiscussion}
                disabled={submitting || !newDiscussion.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                {submitting ? 'Posting...' : 'Post Discussion'}
              </Button>
            </div>
          </div>

          {/* Discussions List */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 bg-muted rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                        <div className="h-4 bg-muted rounded w-full"></div>
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : discussions.length > 0 ? (
            <div className="space-y-4">
              {discussions.map((discussion) => (
                <DiscussionItem key={discussion.id} discussion={discussion} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Discussions Yet</h3>
              <p className="text-muted-foreground">
                Be the first to start a discussion about this event!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EventDiscussion;
