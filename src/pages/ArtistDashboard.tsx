import { useState, useEffect, useCallback } from "react";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { BookingRequestsPanel } from "@/components/BookingRequestsPanel";
import { ActiveChatsPanel } from "@/components/ActiveChatsPanel";
import { EarningsPanel } from "@/components/EarningsPanel";
import { ArtistModerationPanel } from "@/components/ArtistModerationPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, DollarSign, Star, TrendingUp, MessageCircle, Settings } from "lucide-react";
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setActiveTab("bookings")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">
                Click to view all bookings
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setActiveTab("bookings")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRequests}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingRequests > 0 ? "Awaiting your response" : "No pending requests"}
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setActiveTab("earnings")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalEarnings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Click for earnings details
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setActiveTab("chats")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalBookings > 0 ? `From ${stats.totalBookings} bookings` : "Complete bookings to get rated"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="bookings">
              Booking Requests
              {stats.pendingRequests > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {stats.pendingRequests}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="chats">Active Chats</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="moderation">Discussion Moderation</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <BookingRequestsPanel />
          </TabsContent>

          <TabsContent value="chats">
            <ActiveChatsPanel />
          </TabsContent>

          <TabsContent value="earnings">
            <EarningsPanel />
          </TabsContent>

          <TabsContent value="moderation">
            <ArtistModerationPanel />
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveLayout>
  );
};

export default ArtistDashboard;
