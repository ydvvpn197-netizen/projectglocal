import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  MessageCircle, 
  Heart, 
  Share2, 
  Plus, 
  BarChart3, 
  Star, 
  MoreVertical, 
  Trash2,
  TrendingUp,
  Flame,
  Clock,
  ThumbsUp,
  Search,
  Filter
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// New Community Engagement Components
import { CommunityPostCard } from "@/components/CommunityPostCard";
import { CommunityGroupCard } from "@/components/CommunityGroupCard";
import { CreatePostDialog } from "@/components/CreatePostDialog";
import { CreateGroupDialog } from "@/components/CreateGroupDialog";
import { VoteButtons } from "@/components/VoteButtons";

// New Community Engagement Hooks
import { useCommunityGroups } from "@/hooks/useCommunityGroups";
import { useCommunityPosts } from "@/hooks/useCommunityPosts";
import { useVoting } from "@/hooks/useVoting";
import { useComments } from "@/hooks/useComments";
import { useCommunityPolls } from "@/hooks/useCommunityPolls";

const Community = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Legacy hooks (keeping for backward compatibility)
  const { discussions: recentDiscussions, loading: discussionsLoading, deleteDiscussion } = useDiscussions();
  const { reviews, loading: reviewsLoading } = useReviews();
  const { polls, loading: pollsLoading } = usePolls();
  
  // New Community Engagement hooks
  const { 
    groups, 
    userGroups, 
    trendingGroups, 
    loading: groupsLoading, 
    fetchGroups, 
    fetchTrendingGroups 
  } = useCommunityGroups();
  
  const { 
    posts, 
    loading: postsLoading, 
    fetchRankedPosts, 
    pinPost, 
    lockPost, 
    deletePost 
  } = useCommunityPosts();
  
  const { voteOnPost } = useVoting();
  const { comments, loading: commentsLoading } = useComments();
  const { polls: communityPolls, loading: communityPollsLoading } = useCommunityPolls();

  // State
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'hot' | 'top' | 'new' | 'rising'>('hot');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('posts');

  // Fetch data on component mount
  useEffect(() => {
    fetchGroups();
    fetchTrendingGroups();
    fetchRankedPosts(selectedGroupId, sortBy);
  }, [selectedGroupId, sortBy]);

  const handleVote = async (postId: string, voteType: number) => {
    return await voteOnPost(postId, voteType);
  };

  const handlePin = async (postId: string, isPinned: boolean) => {
    return await pinPost(postId, isPinned);
  };

  const handleLock = async (postId: string, isLocked: boolean) => {
    return await lockPost(postId, isLocked);
  };

  const handleDelete = async (postId: string) => {
    return await deletePost(postId);
  };

  const handleGroupSelect = (groupId: string | null) => {
    setSelectedGroupId(groupId);
  };

  const handleSortChange = (newSortBy: 'hot' | 'top' | 'new' | 'rising') => {
    setSortBy(newSortBy);
  };

  const handleSearch = () => {
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  const getSortIcon = (sortType: string) => {
    switch (sortType) {
      case 'hot':
        return <Flame className="h-4 w-4" />;
      case 'top':
        return <TrendingUp className="h-4 w-4" />;
      case 'new':
        return <Clock className="h-4 w-4" />;
      case 'rising':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Flame className="h-4 w-4" />;
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'technology', label: 'Technology' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'sports', label: 'Sports' },
    { value: 'news', label: 'News' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'education', label: 'Education' },
    { value: 'business', label: 'Business' }
  ];

  const sortOptions = [
    { value: 'hot', label: 'Hot', icon: <Flame className="h-4 w-4" /> },
    { value: 'top', label: 'Top', icon: <TrendingUp className="h-4 w-4" /> },
    { value: 'new', label: 'New', icon: <Clock className="h-4 w-4" /> },
    { value: 'rising', label: 'Rising', icon: <TrendingUp className="h-4 w-4" /> }
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Community</h1>
            <p className="text-gray-600 mt-1">Connect, share, and engage with your local community</p>
          </div>
          
          <div className="flex items-center gap-3">
            <CreatePostDialog 
              groupId={selectedGroupId || undefined}
              trigger={
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
              }
            />
            <CreateGroupDialog 
              trigger={
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Create Group
                </Button>
              }
            />
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search posts, groups, or discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="polls">Polls</TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            {/* Sort Options */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {sortOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={sortBy === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSortChange(option.value as any)}
                    className="flex items-center gap-2"
                  >
                    {option.icon}
                    {option.label}
                  </Button>
                ))}
              </div>
              
              <div className="text-sm text-gray-500">
                {posts.length} posts
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-4">
              {postsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-gray-500">Loading posts...</div>
                </div>
              ) : posts.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="text-gray-500 mb-4">No posts found</div>
                  <CreatePostDialog 
                    trigger={
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Post
                      </Button>
                    }
                  />
                </Card>
              ) : (
                posts.map((post) => (
                  <CommunityPostCard
                    key={post.id}
                    post={post}
                    onVote={handleVote}
                    onPin={handlePin}
                    onLock={handleLock}
                    onDelete={handleDelete}
                    showGroupInfo={true}
                  />
                ))
              )}
            </div>
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupsLoading ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <div className="text-gray-500">Loading groups...</div>
                </div>
              ) : groups.length === 0 ? (
                <div className="col-span-full">
                  <Card className="p-8 text-center">
                    <div className="text-gray-500 mb-4">No groups found</div>
                    <CreateGroupDialog 
                      trigger={
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Group
                        </Button>
                      }
                    />
                  </Card>
                </div>
              ) : (
                groups.map((group) => (
                  <CommunityGroupCard
                    key={group.id}
                    group={group}
                    showJoinButton={true}
                    showStats={true}
                  />
                ))
              )}
            </div>

            {/* Trending Groups */}
            {trendingGroups.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Trending Groups</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trendingGroups.slice(0, 6).map((group) => (
                    <CommunityGroupCard
                      key={group.id}
                      group={group}
                      showJoinButton={true}
                      showStats={false}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Discussions Tab (Legacy) */}
          <TabsContent value="discussions" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Discussions</h3>
              <Button onClick={() => navigate("/create-discussion")}>
                <Plus className="h-4 w-4 mr-2" />
                Start Discussion
              </Button>
            </div>

            {discussionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Loading discussions...</div>
              </div>
            ) : recentDiscussions.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-gray-500 mb-4">No discussions yet</div>
                <Button onClick={() => navigate("/create-discussion")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Start a Discussion
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {recentDiscussions.slice(0, 5).map((discussion) => (
                  <Card key={discussion.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={discussion.author_avatar} />
                              <AvatarFallback>
                                {discussion.author_name?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{discussion.author_name}</span>
                            <span className="text-sm text-gray-500">
                              {new Date(discussion.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-semibold mb-2">{discussion.title}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {discussion.content}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {discussion.replies_count} replies
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {discussion.likes_count} likes
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            {user?.id === discussion.user_id && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem className="text-red-600">
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
                                    <AlertDialogAction
                                      onClick={() => deleteDiscussion(discussion.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

                     {/* Polls Tab */}
           <TabsContent value="polls" className="space-y-6">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-semibold">Community Polls</h3>
               <CreatePollDialog>
                 <Button>
                   <Plus className="h-4 w-4 mr-2" />
                   Create Poll
                 </Button>
               </CreatePollDialog>
             </div>

             {pollsLoading ? (
               <div className="flex items-center justify-center py-12">
                 <div className="text-gray-500">Loading polls...</div>
               </div>
             ) : polls.length === 0 ? (
               <Card className="p-8 text-center">
                 <div className="text-gray-500 mb-4">No polls yet</div>
                 <CreatePollDialog>
                   <Button>
                     <Plus className="h-4 w-4 mr-2" />
                     Create Your First Poll
                   </Button>
                 </CreatePollDialog>
               </Card>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {polls.slice(0, 6).map((poll) => (
                   <PollCard key={poll.id} {...poll} />
                 ))}
               </div>
             )}
           </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Community;