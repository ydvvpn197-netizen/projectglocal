import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, MessageCircle, Heart, Share2, Plus, BarChart3, Star, MoreVertical, Trash2 } from "lucide-react";
import { MainLayout } from "@/components/MainLayout";
import { PollCard } from "@/components/PollCard";
import { ReviewCard } from "@/components/ReviewCard";
import { WriteReviewDialog } from "@/components/WriteReviewDialog";
import { CreatePollDialog } from "@/components/CreatePollDialog";
import { GroupView } from "@/components/GroupView";
import { useToast } from "@/hooks/use-toast";
import { useReviews } from "@/hooks/useReviews";
import { usePolls } from "@/hooks/usePolls";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useDiscussions } from "@/hooks/useDiscussions";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";

const Community = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { discussions: recentDiscussions, loading: discussionsLoading, deleteDiscussion } = useDiscussions();
  const { reviews, loading: reviewsLoading } = useReviews();
  const { polls, loading: pollsLoading } = usePolls();
  const { user } = useAuth();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [allGroups, setAllGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's groups and available groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch groups user is a member of
        const { data: memberGroups, error: memberError } = await supabase
          .from('groups')
          .select(`
            *,
            group_members!inner (role),
            member_count:group_members(count)
          `)
          .eq('group_members.user_id', user.id);

        if (memberError) throw memberError;

        const transformedUserGroups = memberGroups?.map(group => ({
          id: group.id,
          name: group.name,
          description: group.description,
          category: group.category,
          members: group.member_count?.[0]?.count || 0,
          posts: 0, // We'll calculate this if needed
          isJoined: true
        })) || [];

        setUserGroups(transformedUserGroups);

        // Fetch all available groups (not joined)
        const userGroupIds = transformedUserGroups.map(g => g.id);
        const { data: availableGroups, error: availableError } = await supabase
          .from('groups')
          .select(`
            *,
            member_count:group_members(count)
          `)
          .not('id', 'in', `(${userGroupIds.join(',') || 'null'})`);

        if (availableError) throw availableError;

        const transformedAvailableGroups = availableGroups?.map(group => ({
          id: group.id,
          name: group.name,
          description: group.description,
          category: group.category,
          members: group.member_count?.[0]?.count || 0,
          posts: 0,
          isJoined: false
        })) || [];

        setAllGroups([...transformedUserGroups, ...transformedAvailableGroups]);
      } catch (error) {
        console.error('Error fetching groups:', error);
        // Fallback to static data
        setUserGroups(staticGroups.filter(g => g.isJoined));
        setAllGroups(staticGroups);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const staticGroups = [
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      name: "Local Photographers",
      description: "Share your photography and get feedback from fellow photographers in the area.",
      members: 234,
      posts: 89,
      category: "Photography",
      isJoined: true
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440002", 
      name: "Food Lovers Unite",
      description: "Discover the best local restaurants and share your culinary adventures.",
      members: 567,
      posts: 234,
      category: "Food",
      isJoined: false
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440003",
      name: "Outdoor Adventures", 
      description: "Plan hiking trips, outdoor activities, and explore nature together.",
      members: 189,
      posts: 156,
      category: "Outdoor",
      isJoined: true
    }
  ];

  const joinGroup = async (groupId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "You have joined the group.",
      });

      // Refresh groups
      window.location.reload();
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: "Error",
        description: "Failed to join group. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Show group view if a group is selected
  if (selectedGroupId) {
    return (
      <MainLayout>
        <GroupView 
          groupId={selectedGroupId}
          onBack={() => setSelectedGroupId(null)}
        />
      </MainLayout>
    );
  }

  const displayGroups = loading ? staticGroups : allGroups;

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">Community</h1>
            </div>
            <p className="text-muted-foreground">
              Connect with like-minded people in your area and join local groups.
            </p>
          </div>
          <Button 
            className="flex items-center gap-2"
            onClick={() => navigate("/community/create-group")}
          >
            <Plus className="h-4 w-4" />
            Create Group
          </Button>
        </div>

        {/* My Groups */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">My Groups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(loading ? staticGroups.filter(g => g.isJoined) : userGroups).map((group) => (
              <Card key={group.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Badge variant="secondary">{group.category}</Badge>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{group.members} members</span>
                      <span>{group.posts} posts</span>
                    </div>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => setSelectedGroupId(group.id)}
                    >
                      View Group
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Community Content Tabs */}
        <Tabs defaultValue="discussions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="discussions" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Discussions
            </TabsTrigger>
            <TabsTrigger value="polls" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Community Polls
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Local Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discussions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Recent Discussions</h2>
              <Button 
                className="flex items-center gap-2"
                onClick={() => navigate("/community/create-discussion")}
              >
                <Plus className="h-4 w-4" />
                Start Discussion
              </Button>
            </div>
            <div className="space-y-4">
              {discussionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : recentDiscussions.length > 0 ? (
                recentDiscussions.map((discussion) => (
                  <Card key={discussion.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={discussion.author_avatar} />
                            <AvatarFallback>
                              {discussion.author_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{discussion.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  by {discussion.author_name} 
                                  {discussion.group_name && ` in ${discussion.group_name}`} • 
                                  {new Date(discussion.created_at).toLocaleDateString()}
                                </p>
                                {discussion.category && (
                                  <Badge variant="secondary" className="mt-2 text-xs">
                                    {discussion.category}
                                  </Badge>
                                )}
                              </div>
                              {user?.id === discussion.user_id && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete Discussion</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete this discussion? This action cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => deleteDiscussion(discussion.id)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {discussion.content}
                        </p>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{discussion.replies_count}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{discussion.likes_count}</span>
                          </div>
                          <Button variant="ghost" size="sm" className="flex items-center gap-1">
                            <Share2 className="h-4 w-4" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No discussions yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Be the first to start a discussion in your community!
                    </p>
                    <Button onClick={() => navigate("/community/create-discussion")}>
                      Start Discussion
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="polls" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Community Polls</h2>
              <CreatePollDialog>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Poll
                </Button>
              </CreatePollDialog>
            </div>
            <div className="space-y-6">
              {pollsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : polls.length > 0 ? (
                polls.map((poll) => (
                  <PollCard
                    key={poll.id}
                    {...poll}
                  />
                ))
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No polls yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create the first community poll to gather opinions!
                    </p>
                    <CreatePollDialog>
                      <Button>Create Poll</Button>
                    </CreatePollDialog>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Local Business Reviews</h2>
              <WriteReviewDialog>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Write Review
                </Button>
              </WriteReviewDialog>
            </div>
            <div className="space-y-6">
              {reviewsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : reviews.length > 0 ? (
                reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    {...review}
                  />
                ))
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Be the first to review a local business!
                    </p>
                    <WriteReviewDialog>
                      <Button>Write Review</Button>
                    </WriteReviewDialog>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Suggested Groups */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Suggested Groups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayGroups.filter(group => !group.isJoined).map((group) => (
              <Card key={group.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Badge variant="secondary">{group.category}</Badge>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{group.members} members</span>
                      <span>{group.posts} posts</span>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => joinGroup(group.id)}
                      disabled={loading}
                    >
                      Join Group
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Community;