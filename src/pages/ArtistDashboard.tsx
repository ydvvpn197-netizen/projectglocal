import { useState, useEffect, useCallback } from "react";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { BookingRequestsPanel } from "@/components/BookingRequestsPanel";
import { AcceptedBookingsPanel } from "@/components/AcceptedBookingsPanel";
import { ActiveChatsPanel } from "@/components/ActiveChatsPanel";
import { EarningsPanel } from "@/components/EarningsPanel";
import { ArtistModerationPanel } from "@/components/ArtistModerationPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, DollarSign, Star, TrendingUp, MessageCircle, Settings, CheckCircle, User, Eye, Activity, Trophy, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface ArtistStats {
  totalBookings: number;
  pendingRequests: number;
  totalEarnings: number;
  averageRating: number;
}

const ArtistDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<ArtistStats>({
    totalBookings: 0,
    pendingRequests: 0,
    totalEarnings: 0,
    averageRating: 0
  });
  const [profile, setProfile] = useState<{ 
    avatar_url?: string; 
    display_name?: string; 
    is_verified?: boolean; 
    bio?: string; 
    artist_skills?: string[] 
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bookings");

  const fetchArtistData = useCallback(async () => {
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

      // Get artist ID first
      const { data: artistData, error: artistError } = await supabase
        .from('artists')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (artistError) {
        console.log('No artist record found, using mock data');
        setStats({
          totalBookings: 0,
          pendingRequests: 0,
          totalEarnings: 0,
          averageRating: 0
        });
        return;
      }

      // Fetch real stats from database
      const [bookingsResult, pendingResult, conversationsResult] = await Promise.all([
        // Total bookings (accepted + completed)
        supabase
          .from('artist_bookings')
          .select('id, budget_min, budget_max, status')
          .eq('artist_id', artistData.id)
          .in('status', ['accepted', 'completed']),
        
        // Pending requests
        supabase
          .from('artist_bookings')
          .select('id')
          .eq('artist_id', artistData.id)
          .eq('status', 'pending'),
        
        // Active conversations
        supabase
          .from('chat_conversations')
          .select('id')
          .eq('artist_id', user.id)
          .eq('status', 'active')
      ]);

      const totalBookings = bookingsResult.data?.length || 0;
      const pendingRequests = pendingResult.data?.length || 0;
      
      // Calculate total earnings from completed bookings (using budget_max as estimated earnings)
      const completedBookings = bookingsResult.data?.filter(b => b.status === 'completed') || [];
      const totalEarnings = completedBookings.reduce((sum, booking) => {
        return sum + (booking.budget_max || booking.budget_min || 0);
      }, 0);
      
      // Mock average rating for now
      const averageRating = totalBookings > 0 ? 4.2 + Math.random() * 0.8 : 0;

      setStats({
        totalBookings,
        pendingRequests,
        totalEarnings,
        averageRating
      });

    } catch (error) {
      console.error('Error fetching artist data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchArtistData();
    }
  }, [user, fetchArtistData]);

  if (!user) {
    navigate('/signin');
    return null;
  }

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Artist Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your bookings, track earnings, and grow your business
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/settings')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Profile Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback>
                  {profile?.display_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-semibold">{profile?.display_name}</h2>
                  {profile?.is_verified && (
                    <Badge variant="secondary">Verified</Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{profile?.bio}</p>
                <div className="flex items-center gap-4 mt-2">
                  {profile?.artist_skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {profile.artist_skills.slice(0, 3).map((skill: string) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {profile.artist_skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{profile.artist_skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setActiveTab("bookings")}
          >
            <CardContent className="p-4 text-center">
              <CalendarDays className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-xl font-bold text-blue-600">{stats.totalBookings}</div>
              <div className="text-xs text-muted-foreground">Total Bookings</div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setActiveTab("bookings")}
          >
            <CardContent className="p-4 text-center">
              <MessageCircle className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
              <div className="text-xl font-bold text-yellow-600">{stats.pendingRequests}</div>
              <div className="text-xs text-muted-foreground">Pending Requests</div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setActiveTab("earnings")}
          >
            <CardContent className="p-4 text-center">
              <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-xl font-bold text-green-600">${stats.totalEarnings.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Total Earnings</div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setActiveTab("performance")}
          >
            <CardContent className="p-4 text-center">
              <Star className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="text-xl font-bold text-purple-600">{stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}</div>
              <div className="text-xs text-muted-foreground">Average Rating</div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setActiveTab("chats")}
          >
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-indigo-600" />
              <div className="text-xl font-bold text-indigo-600">85%</div>
              <div className="text-xs text-muted-foreground">Response Rate</div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setActiveTab("portfolio")}
          >
            <CardContent className="p-4 text-center">
              <Settings className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <div className="text-xl font-bold text-orange-600">Pro</div>
              <div className="text-xs text-muted-foreground">Account Type</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Bookings
              {stats.pendingRequests > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 w-4 rounded-full p-0 text-xs">
                  {stats.pendingRequests}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="accepted" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Active
            </TabsTrigger>
            <TabsTrigger value="chats" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Chats
            </TabsTrigger>
            <TabsTrigger value="earnings" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Earnings
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Portfolio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <BookingRequestsPanel />
          </TabsContent>

          <TabsContent value="accepted">
            <AcceptedBookingsPanel />
          </TabsContent>

          <TabsContent value="chats">
            <ActiveChatsPanel />
          </TabsContent>

          <TabsContent value="earnings">
            <EarningsPanel />
          </TabsContent>

          <TabsContent value="performance">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription>
                    Your performance as an artist
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Rating</span>
                    <span className="text-lg font-bold">{stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Response Rate</span>
                    <span className="text-lg font-bold">85%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Completion Rate</span>
                    <span className="text-lg font-bold">92%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Repeat Clients</span>
                    <span className="text-lg font-bold">67%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Growth Insights
                  </CardTitle>
                  <CardDescription>
                    Track your business growth
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">Growth analytics coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="portfolio">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Portfolio Management
                  </CardTitle>
                  <CardDescription>
                    Manage your portfolio and showcase your work
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/profile')}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Public Profile
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/artist-onboarding')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Update Portfolio
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Trophy className="h-4 w-4 mr-2" />
                    Manage Skills
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="h-4 w-4 mr-2" />
                    Portfolio Analytics
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>
                    Common artist tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/create')}>
                    <Activity className="h-4 w-4 mr-2" />
                    Share Your Work
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/messages')}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message Clients
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/settings')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Account Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => window.location.reload()}>
                    <Activity className="h-4 w-4 mr-2" />
                    Refresh Dashboard
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveLayout>
  );
};

export default ArtistDashboard;
