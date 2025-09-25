import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  Users, 
  MessageSquare, 
  Settings, 
  UserPlus,
  Hash,
  MapPin,
  Calendar,
  Star,
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Loader2,
  Crown,
  Shield,
  Eye,
  Share2
} from "lucide-react";
import { CommunityGroup } from "@/types/community";
import { useCommunityGroups } from "@/hooks/useCommunityGroups";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { communityService } from "@/services/communityService";
import { CommunityPostCard } from "@/components/CommunityPostCard";
import { CommunityGroupCard } from "@/components/CommunityGroupCard";
import { supabase } from "@/integrations/supabase/client";

interface CommunityMember {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  total_posts: number;
  total_points: number;
}

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  post_type: string;
  user_id: string;
  author_name: string;
  author_avatar?: string;
  score: number;
  comment_count: number;
  view_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}

const CommunityDetail = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { joinGroup, leaveGroup, isGroupMember, getUserRole } = useCommunityGroups();
  
  const [group, setGroup] = useState<CommunityGroup | null>(null);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'moderator' | 'member' | null>(null);
  const [joiningGroup, setJoiningGroup] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("recent");

  // Fetch group details
  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!groupId) return;

      try {
        setLoading(true);
        
        // Fetch group details
        const { data: groupData, error: groupError } = await supabase
          .from('community_groups')
          .select('*')
          .eq('id', groupId)
          .single();

        if (groupError) throw groupError;
        setGroup(groupData);

        // Check membership status
        if (user) {
          const [memberStatus, role] = await Promise.all([
            isGroupMember(groupId),
            getUserRole(groupId)
          ]);
          setIsMember(memberStatus);
          setUserRole(role);
        }

        // Fetch members - try group_members first, then fallback to group_messages
        let membersData: Record<string, unknown>[] = [];
        try {
          const { data: groupMembersData, error: membersError } = await supabase
            .from('group_members')
            .select(`
              *,
              profiles:user_id (
                id,
                display_name,
                avatar_url
              )
            `)
            .eq('group_id', groupId)
            .order('joined_at', { ascending: false });

          if (!membersError && groupMembersData) {
            membersData = groupMembersData;
          }
        } catch (error) {
          console.log('No group_members found, will use group_messages for members');
        }

        // If no group_members, get unique users from group_messages
        if (membersData.length === 0) {
          const { data: messagesData, error: messagesError } = await supabase
            .from('group_messages')
            .select(`
              user_id,
              profiles:user_id (
                id,
                display_name,
                avatar_url
              ),
              created_at
            `)
            .eq('group_id', groupId)
            .order('created_at', { ascending: false });

          if (!messagesError && messagesData) {
            // Get unique users from messages
            const uniqueUsers = new Map();
            messagesData.forEach((message: Record<string, unknown>) => {
              if (message.user_id && !uniqueUsers.has(message.user_id)) {
                uniqueUsers.set(message.user_id, {
                  id: message.user_id,
                  user_id: message.user_id,
                  display_name: message.profiles?.display_name || 'Anonymous',
                  avatar_url: message.profiles?.avatar_url,
                  role: 'member',
                  joined_at: message.created_at,
                  total_posts: 0,
                  total_points: 0
                });
              }
            });
            membersData = Array.from(uniqueUsers.values());
          }
        }
        
        // Calculate member stats in parallel for better performance
        const memberStatsPromises = membersData.map(async (member: Record<string, unknown>) => {
          // Calculate total posts for this member in this group
          const { count: postCount } = await supabase
            .from('group_messages')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', groupId)
            .eq('user_id', member.user_id);

          // Calculate points based on posts and recent activity
          const { data: postsData } = await supabase
            .from('group_messages')
            .select('id, created_at')
            .eq('group_id', groupId)
            .eq('user_id', member.user_id);

          // Points calculation: 10 per post, 5 bonus for recent posts (last week)
          const recentPostsCount = postsData?.filter(post => 
            new Date(post.created_at).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000)
          ).length || 0;
          const totalPoints = (postCount || 0) * 10 + recentPostsCount * 5;

          return {
            id: member.id || member.user_id,
            user_id: member.user_id,
            display_name: member.profiles?.display_name || 'Anonymous',
            avatar_url: member.profiles?.avatar_url,
            role: member.role || 'member',
            joined_at: member.joined_at,
            total_posts: postCount || 0,
            total_points: totalPoints
          };
        });

        const formattedMembers: CommunityMember[] = await Promise.all(memberStatsPromises);
        setMembers(formattedMembers);

        // Fetch posts - use group_messages as posts since community_posts is empty
        const { data: postsData, error: postsError } = await supabase
          .from('group_messages')
          .select(`
            *,
            profiles:user_id (
              display_name,
              avatar_url
            )
          `)
          .eq('group_id', groupId)
          .is('parent_id', null) // Only top-level messages (not replies)
          .order('created_at', { ascending: false });

        if (postsError) throw postsError;
        
        const formattedPosts: CommunityPost[] = postsData.map((post: Record<string, unknown>) => ({
          id: post.id,
          title: post.content?.toString().substring(0, 50) + '...' || 'Untitled',
          content: post.content,
          post_type: 'text',
          user_id: post.user_id,
          author_name: post.profiles?.display_name || 'Anonymous',
          author_avatar: post.profiles?.avatar_url,
          score: 0,
          comment_count: post.replies?.length || 0,
          view_count: Math.floor(Math.random() * 50) + 1, // Simulated view count
          is_pinned: false,
          is_locked: false,
          created_at: post.created_at,
          updated_at: post.updated_at
        }));
        setPosts(formattedPosts);

      } catch (error) {
        console.error('Error fetching group details:', error);
        toast({
          title: "Error",
          description: "Failed to load community details",
          variant: "destructive",
        });
        navigate('/community');
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [groupId, user, getUserRole, isGroupMember, navigate, toast]);

  const handleJoinLeave = async () => {
    if (!user || !groupId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to join communities",
        variant: "destructive",
      });
      return;
    }

    try {
      setJoiningGroup(true);
      
      if (isMember) {
        const success = await leaveGroup(groupId);
        if (success) {
          setIsMember(false);
          setUserRole(null);
          toast({
            title: "Success",
            description: "You have left the community",
          });
        }
      } else {
        const success = await joinGroup(groupId);
        if (success) {
          setIsMember(true);
          setUserRole('member');
          toast({
            title: "Success",
            description: "You have joined the community",
          });
        }
      }
    } catch (error) {
      console.error('Error handling join/leave:', error);
      toast({
        title: "Error",
        description: "Failed to update membership",
        variant: "destructive",
      });
    } finally {
      setJoiningGroup(false);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "popular":
        return b.score - a.score;
      case "comments":
        return b.comment_count - a.comment_count;
      case "views":
        return b.view_count - a.view_count;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading community...</span>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (!group) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Community not found</h2>
            <p className="text-muted-foreground mb-4">The community you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/community')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Communities
            </Button>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/community')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{group.name}</h1>
            <p className="text-muted-foreground">{group.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            {isMember && (
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            )}
            <Button 
              className={isMember ? "bg-red-500 hover:bg-red-600" : "btn-community"}
              onClick={handleJoinLeave}
              disabled={joiningGroup}
            >
              {joiningGroup ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Users className="w-4 h-4 mr-2" />
              )}
              {joiningGroup ? 'Processing...' : (isMember ? 'Leave Community' : 'Join Community')}
            </Button>
          </div>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{group.member_count || 0}</p>
                  <p className="text-sm text-muted-foreground">Members</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{group.post_count || 0}</p>
                  <p className="text-sm text-muted-foreground">Posts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{group.location_city || 'Local'}</p>
                  <p className="text-sm text-muted-foreground">Location</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{new Date(group.created_at).getFullYear()}</p>
                  <p className="text-sm text-muted-foreground">Founded</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {posts.slice(0, 3).map((post) => (
                  <div key={post.id} className="flex items-center gap-3 p-3 border-b last:border-b-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={post.author_avatar} />
                      <AvatarFallback>
                        {post.author_name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{post.title}</p>
                      <p className="text-xs text-muted-foreground">
                        by {post.author_name} • {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{post.score} points</span>
                      <span>{post.comment_count} comments</span>
                    </div>
                  </div>
                ))}
                {posts.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No posts yet. Be the first to start a discussion!
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    Top Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {members.slice(0, 5).map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar_url} />
                        <AvatarFallback>
                          {member.display_name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{member.display_name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {member.total_points} pts
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="w-5 h-5 text-blue-500" />
                    Community Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">#{group.category}</Badge>
                    <Badge variant={group.is_public ? "default" : "destructive"}>
                      {group.is_public ? "Public" : "Private"}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Created by: {group.created_by}</p>
                    <p>Location: {group.location_city || 'Local'}</p>
                    <p>Posts require approval: {group.require_approval ? 'Yes' : 'No'}</p>
                    <p>Anonymous posts: {group.allow_anonymous_posts ? 'Allowed' : 'Not allowed'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="discussions" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search discussions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border rounded-md px-3 py-2"
                >
                  <option value="recent">Most Recent</option>
                  <option value="popular">Most Popular</option>
                  <option value="comments">Most Comments</option>
                  <option value="views">Most Views</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
                {isMember && (
                  <Button className="btn-community">
                    <Plus className="w-4 h-4 mr-2" />
                    New Post
                  </Button>
                )}
              </div>
            </div>

            {sortedPosts.length > 0 ? (
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
                {sortedPosts.map((post) => (
                  <CommunityPostCard
                    key={post.id}
                    post={post}
                    showGroupInfo={false}
                  />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No discussions yet</h3>
                  <p className="text-muted-foreground mb-4">
                    {isMember ? "Start the first discussion in this community!" : "Join the community to start discussions"}
                  </p>
                  {isMember && (
                    <Button className="btn-community">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Post
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Community Members ({members.length})</h3>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search members..."
                  className="w-64"
                />
                <select className="border rounded-md px-3 py-2">
                  <option value="all">All Roles</option>
                  <option value="admin">Admins</option>
                  <option value="moderator">Moderators</option>
                  <option value="member">Members</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <Card key={member.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar_url} />
                      <AvatarFallback>
                        {member.display_name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{member.display_name}</p>
                        {member.role === 'admin' && <Crown className="w-4 h-4 text-yellow-500" />}
                        {member.role === 'moderator' && <Shield className="w-4 h-4 text-blue-500" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{member.total_points} pts</p>
                      <p className="text-xs text-muted-foreground">{member.total_posts} posts</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="about" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>About {group.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground">
                    {group.description || "No description available."}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Community Rules</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Be respectful and kind to other members</li>
                    <li>• Stay on topic and relevant to the community</li>
                    <li>• No spam, advertising, or self-promotion</li>
                    <li>• Follow the community guidelines</li>
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Community Settings</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Privacy:</span>
                        <Badge variant={group.is_public ? "default" : "destructive"}>
                          {group.is_public ? "Public" : "Private"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Post Approval:</span>
                        <span>{group.require_approval ? "Required" : "Not Required"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Anonymous Posts:</span>
                        <span>{group.allow_anonymous_posts ? "Allowed" : "Not Allowed"}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Statistics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Members:</span>
                        <span>{group.member_count || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Posts:</span>
                        <span>{group.post_count || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span>{new Date(group.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveLayout>
  );
};

export default CommunityDetail;
