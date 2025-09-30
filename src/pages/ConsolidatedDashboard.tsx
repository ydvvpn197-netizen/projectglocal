import React, { useState, useEffect, useCallback } from 'react';
import { ClientBookingsPanel } from '@/components/ClientBookingsPanel';
import { BookingRequestsPanel } from '@/components/BookingRequestsPanel';
import { AcceptedBookingsPanel } from '@/components/AcceptedBookingsPanel';
import { ActiveChatsPanel } from '@/components/ActiveChatsPanel';
import { EarningsPanel } from '@/components/EarningsPanel';
import { ArtistModerationPanel } from '@/components/ArtistModerationPanel';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
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
  Zap,
  Target,
  Award,
  BarChart3,
  MessageSquare,
  Navigation,
  Compass,
  Flag,
  Hash,
  AtSign,
  ExternalLink,
  AlertTriangle,
  BookOpen as BookOpenIcon,
  Music,
  Camera,
  Mic,
  Coffee,
  Car,
  Building,
  Leaf,
  Mountain,
  Globe,
  UserPlus,
  Crown,
  Sparkles,
  TrendingUp as TrendingUpIcon,
  TrendingDown,
  Activity as ActivityIcon,
  BarChart3 as BarChart3Icon,
  MessageSquare as MessageSquareIcon,
  Navigation as NavigationIcon,
  Compass as CompassIcon,
  Flag as FlagIcon,
  Hash as HashIcon,
  AtSign as AtSignIcon,
  ExternalLink as ExternalLinkIcon,
  BookOpen as BookOpenIcon2,
  Music as MusicIcon,
  Camera as CameraIcon,
  Mic as MicIcon,
  Coffee as CoffeeIcon,
  Car as CarIcon,
  Building as BuildingIcon,
  Leaf as LeafIcon,
  Mountain as MountainIcon,
  Globe as GlobeIcon,
  UserPlus as UserPlusIcon,
  Crown as CrownIcon,
  Sparkles as SparklesIcon,
  TrendingUp as TrendingUpIcon2,
  TrendingDown as TrendingDownIcon,
  Activity as ActivityIcon2,
  BarChart3 as BarChart3Icon2,
  MessageSquare as MessageSquareIcon2,
  Navigation as NavigationIcon2,
  Compass as CompassIcon2,
  Flag as FlagIcon2,
  Hash as HashIcon2,
  AtSign as AtSignIcon2,
  ExternalLink as ExternalLinkIcon2,
  BookOpen as BookOpenIcon3,
  Music as MusicIcon2,
  Camera as CameraIcon2,
  Mic as MicIcon2,
  Coffee as CoffeeIcon2,
  Car as CarIcon2,
  Building as BuildingIcon2,
  Leaf as LeafIcon2,
  Mountain as MountainIcon2,
  Globe as GlobeIcon2,
  UserPlus as UserPlusIcon2,
  Crown as CrownIcon2,
  Sparkles as SparklesIcon2,
  TrendingUp as TrendingUpIcon3,
  TrendingDown as TrendingDownIcon2,
  Activity as ActivityIcon3
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalBookings: number;
  pendingRequests: number;
  totalEarnings: number;
  averageRating: number;
  activeChats: number;
  completedBookings: number;
  upcomingBookings: number;
  totalClients: number;
  profileViews: number;
  profileCompletion: number;
}

interface RecentActivity {
  id: string;
  type: 'booking' | 'message' | 'rating' | 'payment' | 'profile_view';
  title: string;
  description: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'cancelled';
  amount?: number;
  rating?: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
}

const ConsolidatedDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'earnings' | 'chats' | 'analytics'>('overview');
  const [userType, setUserType] = useState<'user' | 'artist'>('user');
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingRequests: 0,
    totalEarnings: 0,
    averageRating: 0,
    activeChats: 0,
    completedBookings: 0,
    upcomingBookings: 0,
    totalClients: 0,
    profileViews: 0,
    profileCompletion: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine user type based on profile data
  useEffect(() => {
    const checkUserType = async () => {
      if (!user) return;
      
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_artist')
          .eq('id', user.id)
          .single();
        
        if (profile?.is_artist) {
          setUserType('artist');
        }
      } catch (err) {
        console.error('Error checking user type:', err);
      }
    };

    checkUserType();
  }, [user]);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        if (userType === 'artist') {
          await loadArtistDashboard();
        } else {
          await loadUserDashboard();
        }
        
        await loadRecentActivity();
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user, userType, loadArtistDashboard, loadUserDashboard]);

  const loadArtistDashboard = useCallback(async () => {
    try {
      // Load artist-specific stats
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('artist_id', user?.id);
      
      const { data: earnings } = await supabase
        .from('payments')
        .select('amount')
        .eq('artist_id', user?.id)
        .eq('status', 'completed');
      
      const { data: chats } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('artist_id', user?.id);
      
      const totalEarnings = earnings?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
      const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0;
      const pendingRequests = bookings?.filter(b => b.status === 'pending').length || 0;
      
      setStats({
        totalBookings: bookings?.length || 0,
        pendingRequests,
        totalEarnings,
        averageRating: 4.8, // Mock data
        activeChats: chats?.length || 0,
        completedBookings,
        upcomingBookings: bookings?.filter(b => b.status === 'confirmed').length || 0,
        totalClients: new Set(bookings?.map(b => b.client_id)).size || 0,
        profileViews: 0, // Mock data
        profileCompletion: 85 // Mock data
      });
    } catch (err) {
      console.error('Error loading artist dashboard:', err);
    }
  }, [user]);

  const loadUserDashboard = useCallback(async () => {
    try {
      // Load user-specific stats
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('client_id', user?.id);
      
      const { data: chats } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('client_id', user?.id);
      
      setStats({
        totalBookings: bookings?.length || 0,
        pendingRequests: 0,
        totalEarnings: 0,
        averageRating: 0,
        activeChats: chats?.length || 0,
        completedBookings: bookings?.filter(b => b.status === 'completed').length || 0,
        upcomingBookings: bookings?.filter(b => b.status === 'confirmed').length || 0,
        totalClients: 0,
        profileViews: 0,
        profileCompletion: 75 // Mock data
      });
    } catch (err) {
      console.error('Error loading user dashboard:', err);
    }
  }, [user]);

  const loadRecentActivity = async () => {
    try {
      // Mock recent activity data
      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'booking',
          title: 'New Booking Request',
          description: 'Someone wants to book your services',
          timestamp: new Date().toISOString(),
          status: 'pending'
        },
        {
          id: '2',
          type: 'message',
          title: 'New Message',
          description: 'You have a new message from a client',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'completed'
        },
        {
          id: '3',
          type: 'rating',
          title: 'New Rating',
          description: 'You received a 5-star rating',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: 'completed',
          rating: 5
        }
      ];
      
      setRecentActivity(mockActivity);
    } catch (err) {
      console.error('Error loading recent activity:', err);
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'create-post',
      title: 'Create Post',
      description: 'Share something with your community',
      icon: <Plus className="w-5 h-5" />,
      action: () => navigate('/create-post'),
      color: 'bg-blue-500'
    },
    {
      id: 'create-event',
      title: 'Create Event',
      description: 'Organize a community event',
      icon: <CalendarDays className="w-5 h-5" />,
      action: () => navigate('/create-event'),
      color: 'bg-green-500'
    },
    {
      id: 'join-community',
      title: 'Join Community',
      description: 'Discover local communities',
      icon: <Users className="w-5 h-5" />,
      action: () => navigate('/communities'),
      color: 'bg-purple-500'
    },
    {
      id: 'book-artist',
      title: 'Book Artist',
      description: 'Find and book local artists',
      icon: <Star className="w-5 h-5" />,
      action: () => navigate('/book-artist'),
      color: 'bg-yellow-500'
    }
  ];

  const artistQuickActions: QuickAction[] = [
    {
      id: 'update-profile',
      title: 'Update Profile',
      description: 'Keep your profile fresh',
      icon: <User className="w-5 h-5" />,
      action: () => navigate('/profile'),
      color: 'bg-blue-500'
    },
    {
      id: 'manage-bookings',
      title: 'Manage Bookings',
      description: 'View and manage your bookings',
      icon: <CalendarDays className="w-5 h-5" />,
      action: () => setActiveTab('bookings'),
      color: 'bg-green-500'
    },
    {
      id: 'view-earnings',
      title: 'View Earnings',
      description: 'Check your earnings and payments',
      icon: <DollarSign className="w-5 h-5" />,
      action: () => setActiveTab('earnings'),
      color: 'bg-purple-500'
    },
    {
      id: 'active-chats',
      title: 'Active Chats',
      description: 'Respond to client messages',
      icon: <MessageCircle className="w-5 h-5" />,
      action: () => setActiveTab('chats'),
      color: 'bg-yellow-500'
    }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold">{stats.totalBookings}</p>
              </div>
              <CalendarDays className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Earnings</p>
                <p className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rating</p>
                <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Chats</p>
                <p className="text-2xl font-bold">{stats.activeChats}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            {userType === 'artist' ? 'Manage your artist profile and bookings' : 'Explore and engage with your community'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(userType === 'artist' ? artistQuickActions : quickActions).map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={action.action}
              >
                <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center text-white`}>
                  {action.icon}
                </div>
                <div className="text-center">
                  <h3 className="font-semibold">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest interactions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  {activity.type === 'booking' && <CalendarDays className="w-5 h-5 text-blue-500" />}
                  {activity.type === 'message' && <MessageCircle className="w-5 h-5 text-green-500" />}
                  {activity.type === 'rating' && <Star className="w-5 h-5 text-yellow-500" />}
                  {activity.type === 'payment' && <DollarSign className="w-5 h-5 text-purple-500" />}
                  {activity.type === 'profile_view' && <Eye className="w-5 h-5 text-gray-500" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{activity.title}</h4>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                  {activity.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBookings = () => {
    if (userType === 'artist') {
      return (
        <div className="space-y-6">
          <BookingRequestsPanel />
          <AcceptedBookingsPanel />
        </div>
      );
    } else {
      return <ClientBookingsPanel />;
    }
  };

  const renderEarnings = () => {
    if (userType === 'artist') {
      return <EarningsPanel />;
    } else {
      return (
        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Earnings</h3>
          <p className="text-gray-600">Earnings are only available for artists</p>
        </div>
      );
    }
  };

  const renderChats = () => {
    if (userType === 'artist') {
      return <ActiveChatsPanel />;
    } else {
      return (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Chats</h3>
          <p className="text-gray-600">Start a conversation with an artist to see your chats here</p>
        </div>
      );
    }
  };

  const renderAnalytics = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Analytics</CardTitle>
          <CardDescription>Your profile performance and engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Profile Completion</span>
                <span className="text-sm text-gray-600">{stats.profileCompletion}%</span>
              </div>
              <Progress value={stats.profileCompletion} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold">{stats.profileViews}</p>
                <p className="text-sm text-gray-600">Profile Views</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold">{stats.totalClients}</p>
                <p className="text-sm text-gray-600">Total Clients</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <PageLayout>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Loading Dashboard</h1>
            <p className="text-muted-foreground">Loading your dashboard data...</p>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h1 className="text-3xl font-bold">Error Loading Dashboard</h1>
              <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Error</Badge>
            </div>
            <p className="text-muted-foreground">We encountered an error while loading your dashboard.</p>
          </div>
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">
                  {userType === 'artist' ? 'Artist Dashboard' : 'User Dashboard'}
                </h1>
                <Badge variant={userType === 'artist' ? 'default' : 'secondary'}>
                  <User className="w-3 h-3 mr-1" />
                  {userType === 'artist' ? 'Artist' : 'User'}
                </Badge>
                <Badge variant="outline">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Dashboard
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {userType === 'artist' 
                  ? 'Manage your bookings, earnings, and client interactions'
                  : 'Explore communities, book artists, and stay connected'}
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as string)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="chats">Chats</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {renderOverview()}
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            {renderBookings()}
          </TabsContent>

          <TabsContent value="earnings" className="space-y-6">
            {renderEarnings()}
          </TabsContent>

          <TabsContent value="chats" className="space-y-6">
            {renderChats()}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {renderAnalytics()}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default ConsolidatedDashboard;