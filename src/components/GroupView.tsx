import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Users, 
  MessageSquare, 
  Settings, 
  UserPlus,
  Hash
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useGroupMessages } from '@/hooks/useGroupMessages';
import { GroupMessage } from './GroupMessage';
import { GroupMemberList } from './GroupMemberList';
import { MessageComposer } from './MessageComposer';
import { useToast } from '@/hooks/use-toast';

interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  created_by: string;
  created_at: string;
  member_count: number;
  user_role: string;
}

interface GroupViewProps {
  groupId: string;
  onBack: () => void;
}

export const GroupView = ({ groupId, onBack }: GroupViewProps) => {
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const { toast } = useToast();

  const {
    messages,
    loading: messagesLoading,
    postMessage,
    editMessage,
    deleteMessage,
    toggleLike,
    markAsViewed
  } = useGroupMessages(groupId);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const fetchGroupDetails = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('community_groups')
        .select(`
          *,
          community_group_members!inner (
            role,
            user_id
          )
        `)
        .eq('id', groupId)
        .eq('community_group_members.user_id', currentUserId)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        toast({
          title: "Access denied",
          description: "You don't have access to this group or it doesn't exist.",
          variant: "destructive"
        });
        onBack();
        return;
      }

      // Get member count
      const { count } = await supabase
        .from('community_group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId);

      setGroup({
        ...data,
        member_count: count || 0,
        user_role: data.community_group_members[0]?.role || 'member'
      });
    } catch (error) {
      console.error('Error fetching group:', error);
      toast({
        title: "Error",
        description: "Failed to load group details.",
        variant: "destructive"
      });
      onBack();
    } finally {
      setLoading(false);
    }
  }, [groupId, currentUserId, toast, onBack]);

  const handlePostMessage = async (content: string) => {
    await postMessage(content);
  };

  const handleReply = async (parentId: string, content: string) => {
    await postMessage(content, parentId);
  };

  const leaveGroup = async () => {
    try {
      const { error } = await supabase
        .from('community_group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', currentUserId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "You have left the group."
      });
      onBack();
    } catch (error) {
      console.error('Error leaving group:', error);
      toast({
        title: "Error",
        description: "Failed to leave group.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (groupId && currentUserId) {
      fetchGroupDetails();
    }
  }, [groupId, currentUserId, fetchGroupDetails]);

  // Group messages by parent_id for threading
  const mainMessages = messages.filter(msg => !msg.parent_id);
  const repliesMap = messages
    .filter(msg => msg.parent_id)
    .reduce((acc, reply) => {
      if (!acc[reply.parent_id!]) acc[reply.parent_id!] = [];
      acc[reply.parent_id!].push(reply);
      return acc;
    }, {} as Record<string, typeof messages>);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-2 flex-1">
            <div className="h-8 bg-muted rounded w-48 animate-pulse" />
            <div className="h-4 bg-muted rounded w-32 animate-pulse" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-4">
            <Card className="animate-pulse">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-24" />
                  <div className="h-4 bg-muted rounded w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Group not found or you don't have access.</p>
        <Button onClick={onBack} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const isAdmin = group.user_role === 'admin' || group.created_by === currentUserId;

  return (
    <div className="space-y-6">
      {/* Group Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <Hash className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">{group.name}</h1>
              <Badge variant="secondary">{group.category}</Badge>
            </div>
            <p className="text-muted-foreground mt-1">{group.description}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {group.member_count} members
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {isAdmin && (
            <Button variant="outline" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Invite Members
            </Button>
          )}
          <Button variant="outline" onClick={leaveGroup}>
            Leave Group
          </Button>
        </div>
      </div>

      <Tabs defaultValue="messages" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Members
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Message Composer */}
              <MessageComposer
                onSubmit={handlePostMessage}
                placeholder="Share something with the group..."
              />

              {/* Messages */}
              {messagesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="h-4 bg-muted rounded w-full" />
                          <div className="h-4 bg-muted rounded w-3/4" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : mainMessages.length > 0 ? (
                <div className="space-y-6">
                  {mainMessages.map((message) => (
                    <GroupMessage
                      key={message.id}
                      message={message}
                      currentUserId={currentUserId}
                      onLike={toggleLike}
                      onReply={handleReply}
                      onEdit={editMessage}
                      onDelete={deleteMessage}
                      onMarkViewed={markAsViewed}
                      replies={repliesMap[message.id] || []}
                    />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                    <p className="text-muted-foreground">
                      Be the first to share something with the group!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-4">
              <GroupMemberList 
                groupId={groupId} 
                currentUserId={currentUserId}
                isGroupAdmin={isAdmin}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="members">
          <div className="max-w-2xl">
            <GroupMemberList 
              groupId={groupId} 
              currentUserId={currentUserId}
              isGroupAdmin={isAdmin}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
