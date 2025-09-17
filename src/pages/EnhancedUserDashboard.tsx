import { useState, useEffect, useCallback } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Users,
  Heart,
  Eye,
  Activity,
  BarChart3,
  Bell,
  Globe,
  Target,
  Award,
  Lightbulb
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFollowing } from "@/hooks/useFollowing";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

// Import new enhanced components
import { UserAnalytics } from "@/components/dashboard/UserAnalytics";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { UserInsights } from "@/components/dashboard/UserInsights";
import { FollowSuggestions } from "@/components/follow/FollowSuggestions";
import { FollowLists } from "@/components/follow/FollowLists";
import { FollowDiscovery } from "@/components/follow/FollowDiscovery";

interface UserStats {
  totalBookings: number;
  pendingBookings: number;
  activeBookings: number;
  completedBookings: number;
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalViews: number;
  engagementRate: number;
  followerGrowth: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}

const EnhancedUserDashboard = () => {
  const { user } = useAuth();
  const { followStats } = useFollowing();
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats>({
    totalBookings: 0,
    pendingBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalViews: 0,
    engagementRate: 0,
    followerGrowth: 0
  });
  const [profile, setProfile] = useState<{ avatar_url?: string; display_name?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const quickActions: QuickAction[] = [
    {
      id: 'book-artist',
      title: 'Book an Artist',
      description: 'Find and book artists for your events',
      icon: User,
      href: '/book-artist',
      color: 'bg-blue-500'
    },
    {
      id: 'create-event',
      title: 'Create Event',
      description: 'Organize and promote your events',
      icon: CalendarDays,
      href: '/create-event',
      color: 'bg-green-500'
    },
    {
      id: 'browse-events',
      title: 'Browse Events',
      description: 'Discover local events and activities',
      icon: Globe,
      href: '/events',
      color: 'bg-purple-500'
    },
    {
      id: 'messages',
      title: 'Messages',
      description: 'Chat with artists and organizers',
      icon: MessageCircle,
      href: '/messages',
      color: 'bg-orange-500'
    },
    {
      id: 'create-post',
      title: 'Create Post',
      description: 'Share updates with your community',
      icon: Activity,
      href: '/create-post',
      color: 'bg-pink-500'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View your engagement insights',
      icon: BarChart3,
      href: '#analytics',
      color: 'bg-indigo-500'
    }
  ];

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

      // Fetch comprehensive user statistics
      const [bookingsResult, postsResult, likesResult, commentsResult] = await Promise.all([
        supabase.from('artist_bookings').select('status').eq('user_id', user.id),
        supabase.from('posts').select('id, likes_count, comments_count').eq('user_id', user.id),
        supabase.from('likes').select('id').eq('user_id', user.id),
        supabase.from('comments').select('id').eq('user_id', user.id)
      ]);

      const totalBookings = bookingsResult.data?.length || 0;
      const pendingBookings = bookingsResult.data?.filter(b => b.status === 'pending').length || 0;
      const activeBookings = bookingsResult.data?.filter(b => b.status === 'accepted').length || 0;
      const completedBookings = bookingsResult.data?.filter(b => b.status === 'completed').length || 0;

      const totalPosts = postsResult.data?.length || 0;
      const totalLikes = postsResult.data?.reduce((sum, post) => sum + (post.likes_count || 0), 0) || 0;
      const totalComments = postsResult.data?.reduce((sum, post) => sum + (post.comments_count || 0), 0) || 0;
      const totalViews = totalLikes + totalComments; // Simplified calculation
      const engagementRate = totalPosts > 0 ? ((totalLikes + totalComments) / totalPosts) : 0;

      setStats({
        totalBookings,
        pendingBookings,
        activeBookings,
        completedBookings,
        totalPosts,
        totalLikes,
        totalComments,
        totalViews,
        engagementRate: Math.round(engagementRate * 10) / 10,
        followerGrowth: followStats?.growthRate || 0
      });

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, followStats]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user, fetchUserData]);

  if (!user) {
    navigate('/signin');
    return null;
  }

  if (loading) {
    return (
      <PageLayout layout="main" showSidebar={true} showHeader={true} showFooter={false}>
        <div className="container max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout layout="main" showSidebar={true} showHeader={true} showFooter={false}>
      <div className="container max-w-7xl mx-auto p-6">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="text-lg">
                  {profile?.display_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">{profile?.display_name || 'User'}</h1>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {followStats?.totalFollowers || 0} followers
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {stats.totalLikes} likes
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate('/profile')}>
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button onClick={() => navigate('/create-post')}>
                <Activity className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('bookings')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-bold">{stats.totalBookings}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">+12%</span>
                  </div>
                </div>
                <CalendarDays className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('analytics')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Engagement Rate</p>
                  <p className="text-2xl font-bold">{stats.engagementRate}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">+{stats.followerGrowth}%</span>
                  </div>
                </div>
                <Heart className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('analytics')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">+8.2%</span>
                  </div>
                </div>
                <Eye className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('follow')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Followers</p>
                  <p className="text-2xl font-bold">{followStats?.totalFollowers || 0}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">+{stats.followerGrowth}%</span>
                  </div>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {quickActions.map((action) => (
            <Card 
              key={action.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                if (action.href.startsWith('#')) {
                  setActiveTab(action.href.substring(1));
                } else {
                  navigate(action.href);
                }
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 ${action.color} rounded-lg text-white`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="follow" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Follow
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ActivityFeed />
              <UserInsights />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <UserAnalytics />
          </TabsContent>

          <TabsContent value="follow" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FollowSuggestions />
              <FollowLists />
            </div>
            <FollowDiscovery />
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <ActivityFeed />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <UserInsights />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Manage your profile and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Display Name</h4>
                    <p className="text-muted-foreground">{profile?.display_name || 'Not set'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Email</h4>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Bio</h4>
                    <p className="text-muted-foreground">{profile?.bio || 'No bio added yet'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => navigate('/profile')}>
                      Edit Profile
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/settings')}>
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default EnhancedUserDashboard;
