import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, XCircle, MessageCircle, Pin, PinOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ModerationRequest {
  id: string;
  title: string;
  content: string;
  user_id: string;
  artist_id: string;
  status: string;
  is_pinned: boolean;
  created_at: string;
  user_display_name: string;
  user_avatar_url: string;
}

interface ApprovedDiscussion {
  id: string;
  title: string;
  content: string;
  user_id: string;
  status: string;
  is_pinned: boolean;
  likes_count: number;
  replies_count: number;
  created_at: string;
  user_display_name: string;
  user_avatar_url: string;
}

export const ArtistModerationPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pendingRequests, setPendingRequests] = useState<ModerationRequest[]>([]);
  const [approvedDiscussions, setApprovedDiscussions] = useState<ApprovedDiscussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');

  useEffect(() => {
    if (user) {
      fetchModerationData();
    }
  }, [user]);

  const fetchModerationData = async () => {
    if (!user) return;

    try {
      // Get the artist record to get the correct artist_id
      const { data: artistRecord, error: artistError } = await supabase
        .from('artists')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (artistError) {
        console.error('Error fetching artist record:', artistError);
        setPendingRequests([]);
        setApprovedDiscussions([]);
        return;
      }

      // Get pending requests
      const { data: pendingData, error: pendingError } = await supabase
        .from('artist_discussions')
        .select('*')
        .eq('artist_id', artistRecord.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (pendingError) throw pendingError;

      // Get approved discussions
      const { data: approvedData, error: approvedError } = await supabase
        .from('artist_discussions')
        .select('*')
        .eq('artist_id', artistRecord.id)
        .eq('status', 'approved')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (approvedError) throw approvedError;

      // Fetch user profiles separately
      const userIds = [
        ...(pendingData?.map(d => d.user_id) || []),
        ...(approvedData?.map(d => d.user_id) || [])
      ];

      let profilesMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url')
          .in('user_id', userIds);

        profilesMap = Object.fromEntries(
          (profilesData || []).map(p => [p.user_id, p])
        );
      }

      setPendingRequests((pendingData || []).map(item => ({
        ...item,
        user_display_name: profilesMap[item.user_id]?.display_name || 'Anonymous',
        user_avatar_url: profilesMap[item.user_id]?.avatar_url || ''
      })));

      setApprovedDiscussions((approvedData || []).map(item => ({
        ...item,
        user_display_name: profilesMap[item.user_id]?.display_name || 'Anonymous',
        user_avatar_url: profilesMap[item.user_id]?.avatar_url || ''
      })));

    } catch (error) {
      console.error('Error fetching moderation data:', error);
      toast({
        title: "Error",
        description: "Failed to load moderation data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDiscussion = async (discussionId: string) => {
    try {
      // Get the artist record to get the correct artist_id
      const { data: artistRecord, error: artistError } = await supabase
        .from('artists')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (artistError) {
        throw new Error('Artist profile not found');
      }

      const { error } = await supabase
        .from('artist_discussions')
        .update({ status: 'approved' })
        .eq('id', discussionId);

      if (error) throw error;

      // Create approval notification
      const { error: notificationError } = await supabase
        .from('artist_discussion_moderation_notifications')
        .insert({
          artist_id: artistRecord.id,
          discussion_id: discussionId,
          type: 'discussion_approved'
        });

      if (notificationError) console.warn('Failed to create notification:', notificationError);

      toast({
        title: "Discussion approved",
        description: "The discussion is now visible to your followers",
      });

      fetchModerationData();
    } catch (error) {
      console.error('Error approving discussion:', error);
      toast({
        title: "Error",
        description: "Failed to approve discussion",
        variant: "destructive",
      });
    }
  };

  const handleRejectDiscussion = async (discussionId: string) => {
    try {
      // Get the artist record to get the correct artist_id
      const { data: artistRecord, error: artistError } = await supabase
        .from('artists')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (artistError) {
        throw new Error('Artist profile not found');
      }

      const { error } = await supabase
        .from('artist_discussions')
        .update({ status: 'rejected' })
        .eq('id', discussionId);

      if (error) throw error;

      // Create rejection notification
      const { error: notificationError } = await supabase
        .from('artist_discussion_moderation_notifications')
        .insert({
          artist_id: artistRecord.id,
          discussion_id: discussionId,
          type: 'discussion_rejected'
        });

      if (notificationError) console.warn('Failed to create notification:', notificationError);

      toast({
        title: "Discussion rejected",
        description: "The discussion request has been rejected",
      });

      fetchModerationData();
    } catch (error) {
      console.error('Error rejecting discussion:', error);
      toast({
        title: "Error",
        description: "Failed to reject discussion",
        variant: "destructive",
      });
    }
  };

  const handleTogglePin = async (discussionId: string, currentPinStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('artist_discussions')
        .update({ is_pinned: !currentPinStatus })
        .eq('id', discussionId);

      if (error) throw error;

      toast({
        title: currentPinStatus ? "Discussion unpinned" : "Discussion pinned",
        description: currentPinStatus 
          ? "The discussion is no longer pinned" 
          : "The discussion is now pinned to the top",
      });

      fetchModerationData();
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast({
        title: "Error",
        description: "Failed to update pin status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'pending' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Pending Requests
          {pendingRequests.length > 0 && (
            <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
              {pendingRequests.length}
            </Badge>
          )}
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'approved' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Approved Discussions ({approvedDiscussions.length})
        </button>
      </div>

      {/* Pending Requests */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingRequests.length > 0 ? (
            pendingRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={request.user_avatar_url} />
                        <AvatarFallback>
                          {request.user_display_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{request.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          by {request.user_display_name} • {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{request.content}</p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleApproveDiscussion(request.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleRejectDiscussion(request.id)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No pending discussion requests</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Approved Discussions */}
      {activeTab === 'approved' && (
        <div className="space-y-4">
          {approvedDiscussions.length > 0 ? (
            approvedDiscussions.map((discussion) => (
              <Card key={discussion.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={discussion.user_avatar_url} />
                        <AvatarFallback>
                          {discussion.user_display_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{discussion.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          by {discussion.user_display_name} • {new Date(discussion.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {discussion.is_pinned && (
                        <Badge variant="secondary">Pinned</Badge>
                      )}
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Approved
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{discussion.content}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{discussion.likes_count} likes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{discussion.replies_count} replies</span>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleTogglePin(discussion.id, discussion.is_pinned)}
                    >
                      {discussion.is_pinned ? (
                        <>
                          <PinOff className="h-4 w-4 mr-2" />
                          Unpin
                        </>
                      ) : (
                        <>
                          <Pin className="h-4 w-4 mr-2" />
                          Pin
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No approved discussions yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
