import { useState, useEffect, useCallback } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ClientBookingsPanel } from "@/components/ClientBookingsPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  CalendarDays, 
  DollarSign, 
  Star, 
  TrendingUp, 
  MessageCircle, 
  Settings, 
  User, 
  Clock, 
  CheckCircle, 
  Heart,
  Bookmark,
  Users,
  MapPin,
  Plus,
  BookOpen,
  Trophy,
  Bell,
  Eye,
  Activity,
  Zap
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface UserStats {
  totalBookings: number;
  pendingBookings: number;
  activeBookings: number;
  completedBookings: number;
  totalPosts: number;
  totalLikes: number;
  totalFollowers: number;
  totalFollowing: number;
  communitiesJoined: number;
  eventsAttended: number;
}

interface UserActivity {
  id: string;
  type: 'post' | 'booking' | 'event' | 'community';
  title: string;
  description: string;
  date: string;
  status?: string;
}

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<UserStats>({
    totalBookings: 0,
    pendingBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    totalPosts: 0,
    totalLikes: 0,
    totalFollowers: 0,
    totalFollowing: 0,
    communitiesJoined: 0,
    eventsAttended: 0
  });
  const [profile, setProfile] = useState<{ 
    avatar_url?: string; 
    display_name?: string;
    bio?: string;
    location_city?: string;
    location_state?: string;
    created_at?: string;
  } | null>(null);
  const [recentActivity, setRecentActivity] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchUserData = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch booking statistics
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('artist_bookings')
        .select('status')
        .eq('user_id', user.id);

      if (bookingsError && bookingsError.code !== 'PGRST116') {
        console.error('Error fetching bookings:', bookingsError);
      }

      // Fetch posts statistics
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (postsError && postsError.code !== 'PGRST116') {
        console.error('Error fetching posts:', postsError);
      }

      // Fetch community memberships
      const { data: communitiesData, error: communitiesError } = await supabase
        .from('community_members')
        .select('id')
        .eq('user_id', user.id);

      if (communitiesError && communitiesError.code !== 'PGRST116') {
        console.error('Error fetching communities:', communitiesError);
      }

      // Fetch followers/following (if follows table exists)
      const { data: followersData } = await supabase
        .from('user_follows')
        .select('id')
        .eq('following_id', user.id);

      const { data: followingData } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id);

      const totalBookings = bookingsData?.length || 0;
      const pendingBookings = bookingsData?.filter((b: any) => b.status === 'pending').length || 0;
      const activeBookings = bookingsData?.filter((b: any) => b.status === 'accepted').length || 0;
      const completedBookings = bookingsData?.filter((b: any) => b.status === 'completed').length || 0;

      setStats({
        totalBookings,
        pendingBookings,
        activeBookings,
        completedBookings,
        totalPosts: postsData?.length || 0,
        totalLikes: 0, // This would require a likes table
        totalFollowers: followersData?.length || 0,
        totalFollowing: followingData?.length || 0,
        communitiesJoined: communitiesData?.length || 0,
        eventsAttended: 0 // This would require event attendance tracking
      });

      // Create recent activity from posts
      const activities: UserActivity[] = [];
      if (postsData) {
        postsData.forEach((post: any) => {
          activities.push({
            id: post.id,
            type: 'post',
            title: post.title,
            description: 'Created a new post',
            date: new Date(post.created_at).toLocaleDateString(),
          });
        });
      }

      setRecentActivity(activities);

    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user, fetchUserData]);

  if (!user) {
    navigate('/signin');
    return null;
  }

  const getProfileCompletion = () => {
    if (!profile) return 0;
    
    let completed = 0;
    const total = 6;
    
    if (profile.display_name) completed++;
    if (profile.bio) completed++;
    if (profile.avatar_url) completed++;
    if (profile.location_city) completed++;
    if (user?.email) completed++;
    if (user?.created_at) completed++;
    
    return Math.round((completed / total) * 100);
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold mb-2">Loading Dashboard...</h2>
            <p className="text-muted-foreground">Getting your latest data</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">My Dashboard</h1>
            <p className="text-muted-foreground">
              Track your activity, manage your profile, and stay connected with your community
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/profile')}>
              <User className="h-4 w-4 mr-2" />
              View Profile
            </Button>
            <Button variant="outline" onClick={() => navigate('/settings')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Profile Overview Card */}
        <Card className="relative overflow-hidden">
          <div className="h-20 bg-gradient-to-r from-blue-500 to-purple-500"></div>
          <CardContent className="relative pt-0">
            <div className="flex items-end gap-6 -mt-10">
              <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                  {profile?.display_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">{profile?.display_name || user.email?.split('@')[0]}</h2>
                    <p className="text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="outline">Community Member</Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">Profile Completion</div>
                    <div className="text-2xl font-bold">{getProfileCompletion()}%</div>
                    <Progress value={getProfileCompletion()} className="w-20 h-2 mt-1" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab("activity")}>
            <CardContent className="p-4 text-center">
              <BookOpen className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-xl font-bold text-blue-600">{stats.totalPosts}</div>
              <div className="text-xs text-muted-foreground">Posts Created</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab("bookings")}>
            <CardContent className="p-4 text-center">
              <CalendarDays className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-xl font-bold text-green-600">{stats.totalBookings}</div>
              <div className="text-xs text-muted-foreground">Total Bookings</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab("community")}>
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="text-xl font-bold text-purple-600">{stats.communitiesJoined}</div>
              <div className="text-xs text-muted-foreground">Communities</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab("social")}>
            <CardContent className="p-4 text-center">
              <Heart className="h-6 w-6 mx-auto mb-2 text-red-600" />
              <div className="text-xl font-bold text-red-600">{stats.totalFollowers}</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab("social")}>
            <CardContent className="p-4 text-center">
              <Eye className="h-6 w-6 mx-auto mb-2 text-indigo-600" />
              <div className="text-xl font-bold text-indigo-600">{stats.totalFollowing}</div>
              <div className="text-xs text-muted-foreground">Following</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab("activity")}>
            <CardContent className="p-4 text-center">
              <Activity className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <div className="text-xl font-bold text-orange-600">{recentActivity.length}</div>
              <div className="text-xs text-muted-foreground">Recent Activity</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Bookings
              {stats.pendingBookings > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 w-4 rounded-full p-0 text-xs">
                  {stats.pendingBookings}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Community
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Social
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>
                    Common tasks and shortcuts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 hover:bg-primary/5" onClick={() => navigate('/create')}>
                      <Plus className="w-5 h-5" />
                      <span className="text-sm">Create Post</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 hover:bg-primary/5" onClick={() => navigate('/events')}>
                      <CalendarDays className="w-5 h-5" />
                      <span className="text-sm">Browse Events</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 hover:bg-primary/5" onClick={() => navigate('/communities')}>
                      <Users className="w-5 h-5" />
                      <span className="text-sm">Find Communities</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 hover:bg-primary/5" onClick={() => navigate('/messages')}>
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm">Messages</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Your latest interactions and updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentActivity.length > 0 ? (
                    <div className="space-y-3">
                      {recentActivity.slice(0, 5).map((activity) => (
                        <div key={activity.id} className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{activity.title}</h4>
                            <p className="text-xs text-muted-foreground">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">{activity.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="mb-2">No recent activity</p>
                      <p className="text-xs mb-4">Start engaging with your community!</p>
                      <Button size="sm" onClick={() => navigate('/create')}>
                        Create Your First Post
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Activity History</CardTitle>
                <CardDescription>
                  All your recent posts, interactions, and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{activity.title}</h4>
                          <p className="text-sm text-muted-foreground mb-1">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">{activity.date}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Activity className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Activity Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start creating posts and engaging with the community to see your activity here.
                    </p>
                    <Button onClick={() => navigate('/create')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Post
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <div className="space-y-6">
              {/* Booking Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <CalendarDays className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                    <div className="text-xl font-bold">{stats.totalBookings}</div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                    <div className="text-xl font-bold">{stats.pendingBookings}</div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Activity className="h-6 w-6 mx-auto mb-2 text-green-600" />
                    <div className="text-xl font-bold">{stats.activeBookings}</div>
                    <div className="text-sm text-muted-foreground">Active</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <CheckCircle className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                    <div className="text-xl font-bold">{stats.completedBookings}</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </CardContent>
                </Card>
              </div>

              {/* Booking Panel */}
              <ClientBookingsPanel />
            </div>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community">
            <Card>
              <CardHeader>
                <CardTitle>My Communities</CardTitle>
                <CardDescription>
                  Communities you're part of and community activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Communities Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Join communities to connect with like-minded people in your area.
                  </p>
                  <Button onClick={() => navigate('/communities')}>
                    <Users className="w-4 h-4 mr-2" />
                    Explore Communities
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Followers</CardTitle>
                  <CardDescription>
                    People who follow your activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <div className="text-2xl font-bold mb-2">{stats.totalFollowers}</div>
                    <p className="text-muted-foreground">Followers</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Following</CardTitle>
                  <CardDescription>
                    People you're following
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Eye className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <div className="text-2xl font-bold mb-2">{stats.totalFollowing}</div>
                    <p className="text-muted-foreground">Following</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/profile')}>
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/settings')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Account Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/privacy')}>
                    <Eye className="h-4 w-4 mr-2" />
                    Privacy Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/notifications')}>
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Frequently used features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/messages')}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Messages
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/bookmarks')}>
                    <Bookmark className="h-4 w-4 mr-2" />
                    Bookmarks
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/subscription')}>
                    <Trophy className="h-4 w-4 mr-2" />
                    Subscription
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => window.location.reload()}>
                    <Activity className="h-4 w-4 mr-2" />
                    Refresh Data
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default UserDashboard;