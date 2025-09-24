import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Heart, 
  MessageCircle, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Clock 
} from 'lucide-react';
import { GroupMessage as GroupMessageType } from '@/hooks/useGroupMessages';
import { MessageComposer } from './MessageComposer';
import { formatDistanceToNow } from 'date-fns';

interface GroupMessageProps {
  message: GroupMessageType;
  currentUserId?: string;
  onLike: (messageId: string, isLiked: boolean) => Promise<void>;
  onReply: (messageId: string, content: string) => Promise<void>;
  onEdit: (messageId: string, content: string) => Promise<void>;
  onDelete: (messageId: string) => Promise<void>;
  onMarkViewed: (messageId: string) => Promise<void>;
  replies?: GroupMessageType[];
  showReplies?: boolean;
  isReply?: boolean;
}

export const GroupMessage = ({
  message,
  currentUserId,
  onLike,
  onReply,
  onEdit,
  onDelete,
  onMarkViewed,
  replies = [],
  showReplies = true,
  isReply = false
}: GroupMessageProps) => {
  const [showReplyComposer, setShowReplyComposer] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showViewers, setShowViewers] = useState(false);

  const isOwner = currentUserId === message.user_id;
  const timeAgo = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });

  const handleLike = () => {
    onLike(message.id, message.is_liked_by_user);
  };

  const handleReply = async (content: string) => {
    await onReply(message.id, content);
    setShowReplyComposer(false);
  };

  const handleEdit = async (content: string) => {
    await onEdit(message.id, content);
    setIsEditing(false);
  };

  const handleMarkViewed = () => {
    onMarkViewed(message.id);
  };

  // Mark as viewed when message comes into view
  useState(() => {
    if (!isOwner) {
      handleMarkViewed();
    }
  });

  return (
    <div className={`space-y-3 ${isReply ? 'ml-8 border-l-2 border-border pl-4' : ''}`}>
      <Card className="hover:shadow-sm transition-shadow">
        <CardContent className="p-4">
          <div className="flex space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={message.user_avatar_url} />
              <AvatarFallback>
                {message.user_display_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-sm">
                    {message.user_display_name || 'Unknown User'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {timeAgo}
                  </span>
                  {message.is_edited && (
                    <Badge variant="secondary" className="text-xs">
                      <Edit className="h-3 w-3 mr-1" />
                      Edited
                    </Badge>
                  )}
                </div>

                {isOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(message.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                      {message.views_count > 0 && (
                        <DropdownMenuItem onClick={() => setShowViewers(!showViewers)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Views ({message.views_count})
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {isEditing ? (
                <MessageComposer
                  onSubmit={handleEdit}
                  initialValue={message.content}
                  placeholder="Edit your message..."
                  submitLabel="Save Changes"
                />
              ) : (
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>

                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLike}
                      className={`flex items-center space-x-1 h-8 ${
                        message.is_liked_by_user ? 'text-red-500' : 'text-muted-foreground'
                      }`}
                    >
                      <Heart 
                        className={`h-4 w-4 ${
                          message.is_liked_by_user ? 'fill-current' : ''
                        }`} 
                      />
                      <span>{message.likes_count}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowReplyComposer(!showReplyComposer)}
                      className="flex items-center space-x-1 h-8 text-muted-foreground"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>{message.replies_count}</span>
                    </Button>

                    {isOwner && message.views_count > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowViewers(!showViewers)}
                        className="flex items-center space-x-1 h-8 text-muted-foreground"
                      >
                        <Eye className="h-4 w-4" />
                        <span>{message.views_count}</span>
                      </Button>
                    )}
                  </div>

                  {showViewers && isOwner && (
                    <Card className="bg-muted/50">
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{message.views_count} people have seen this message</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {showReplyComposer && !isEditing && (
        <MessageComposer
          onSubmit={handleReply}
          placeholder="Write a reply..."
          parentMessage={{
            id: message.id,
            content: message.content,
            user_display_name: message.user_display_name
          }}
          onCancelReply={() => setShowReplyComposer(false)}
          submitLabel="Reply"
        />
      )}

      {showReplies && replies.length > 0 && (
        <div className="space-y-3">
          {replies.map((reply) => (
            <GroupMessage
              key={reply.id}
              message={reply}
              currentUserId={currentUserId}
              onLike={onLike}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onMarkViewed={onMarkViewed}
              isReply={true}
              showReplies={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};
