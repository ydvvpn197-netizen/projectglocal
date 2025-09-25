import { useState, useEffect, useCallback } from "react";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
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
  Zap,
  BarChart3,
  Globe,
  Target,
  Award,
  Lightbulb,
  Rocket,
  Shield,
  Lock,
  Unlock,
  RefreshCw,
  Download,
  Upload,
  Share2,
  Edit,
  Trash2,
  Archive,
  Filter,
  Search,
  Grid3X3,
  List,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  Minus,
  X,
  Check,
  AlertCircle,
  Info,
  HelpCircle,
  ExternalLink,
  Copy,
  Link,
  Mail,
  Phone,
  Map,
  Navigation,
  Compass,
  Flag,
  Tag,
  Hash,
  AtSign,
  CreditCard,
  Wallet,
  PiggyBank,
  TrendingDown,
  Calendar,
  Clock3,
  Timer,
  Stopwatch,
  Hourglass,
  Play,
  Pause,
  Square,
  RotateCcw,
  RotateCw,
  Maximize,
  Minimize,
  Move,
  Grip,
  Drag,
  MousePointer,
  Hand,
  Fingerprint,
  Scan,
  QrCode,
  Barcode,
  Camera,
  Video,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Headphones,
  Speaker,
  Radio,
  Wifi,
  WifiOff,
  Bluetooth,
  BluetoothOff,
  Battery,
  BatteryLow,
  BatteryCharging,
  Power,
  PowerOff,
  Zap as ZapIcon,
  Target as TargetIcon,
  Shield as ShieldIcon,
  Lightbulb as LightbulbIcon,
  Rocket as RocketIcon,
  CheckCircle as CheckCircleIcon,
  BarChart3 as BarChart3Icon,
  UserPlus as UserPlusIcon,
  BookOpen as BookOpenIcon,
  Megaphone as MegaphoneIcon,
  Building2 as Building2Icon,
  TreePine as TreePineIcon,
  Music as MusicIcon,
  Palette as PaletteIcon,
  Utensils as UtensilsIcon,
  Dumbbell as DumbbellIcon,
  GraduationCap as GraduationCapIcon,
  Briefcase as BriefcaseIcon,
  Gamepad2 as Gamepad2Icon,
  Camera as CameraIcon,
  Car as CarIcon,
  Home as HomeIcon,
  Wifi as WifiIcon,
  Smartphone as SmartphoneIcon,
  Laptop as LaptopIcon,
  Headphones as HeadphonesIcon,
  Coffee as CoffeeIcon,
  ShoppingBag as ShoppingBagIcon,
  Gift as GiftIcon,
  PartyPopper as PartyPopperIcon,
  Sun as SunIcon,
  Moon as MoonIcon,
  Cloud as CloudIcon,
  CloudRain as CloudRainIcon,
  Snowflake as SnowflakeIcon,
  Wind as WindIcon,
  Droplets as DropletsIcon,
  Thermometer as ThermometerIcon,
  Eye as EyeIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  Grid3X3 as Grid3X3Icon,
  List as ListIcon,
  MoreHorizontal as MoreHorizontalIcon,
  Settings as SettingsIcon,
  Bell as BellIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Map as MapIcon,
  Navigation as NavigationIcon,
  Compass as CompassIcon,
  Flag as FlagIcon,
  Tag as TagIcon,
  Hash as HashIcon,
  AtSign as AtSignIcon,
  DollarSign as DollarSignIcon,
  CreditCard as CreditCardIcon,
  Wallet as WalletIcon,
  PiggyBank as PiggyBankIcon,
  TrendingDown as TrendingDownIcon,
  Activity as ActivityIcon
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFollowing } from "@/hooks/useFollowing";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

// Import enhanced components
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
  totalFollowers: number;
  totalFollowing: number;
  communitiesJoined: number;
  eventsAttended: number;
  engagementRate: number;
  followerGrowth: number;
}

interface UserActivity {
  id: string;
  type: 'post' | 'booking' | 'event' | 'community';
  title: string;
  description: string;
  date: string;
  status?: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}

const ConsolidatedDashboard = () => {
  const { user } = useAuth();
  const { followStats } = useFollowing();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<UserStats>({
    totalBookings: 0,
    pendingBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalViews: 0,
    totalFollowers: 0,
    totalFollowing: 0,
    communitiesJoined: 0,
    eventsAttended: 0,
    engagementRate: 0,
    followerGrowth: 0
  });
  const [profile, setProfile] = useState<{ 
    avatar_url?: string; 
    display_name?: string;
    bio?: string;
    location_city?: string;
    location_state?: string;
    created_at?: string;
    is_verified?: boolean;
    is_pro?: boolean;
  } | null>(null);
  const [recentActivity, setRecentActivity] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Enhanced quick actions
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

  // Enhanced data fetching
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
      const [bookingsResult, postsResult, likesResult, commentsResult, communitiesResult] = await Promise.all([
        supabase.from('artist_bookings').select('status').eq('user_id', user.id),
        supabase.from('posts').select('id, likes_count, comments_count').eq('user_id', user.id),
        supabase.from('likes').select('id').eq('user_id', user.id),
        supabase.from('comments').select('id').eq('user_id', user.id),
        supabase.from('community_members').select('id').eq('user_id', user.id)
      ]);

      const totalBookings = bookingsResult.data?.length || 0;
      const pendingBookings = bookingsResult.data?.filter(b => b.status === 'pending').length || 0;
      const activeBookings = bookingsResult.data?.filter(b => b.status === 'accepted').length || 0;
      const completedBookings = bookingsResult.data?.filter(b => b.status === 'completed').length || 0;

      const totalPosts = postsResult.data?.length || 0;
      const totalLikes = postsResult.data?.reduce((sum, post) => sum + (post.likes_count || 0), 0) || 0;
      const totalComments = postsResult.data?.reduce((sum, post) => sum + (post.comments_count || 0), 0) || 0;
      const totalViews = totalLikes + totalComments;
      const engagementRate = totalPosts > 0 ? ((totalLikes + totalComments) / totalPosts) : 0;

      // Fetch followers/following
      const { data: followersData } = await supabase
        .from('user_follows')
        .select('id')
        .eq('following_id', user.id);

      const { data: followingData } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id);

      setStats({
        totalBookings,
        pendingBookings,
        activeBookings,
        completedBookings,
        totalPosts,
        totalLikes,
        totalComments,
        totalViews,
        totalFollowers: followersData?.length || 0,
        totalFollowing: followingData?.length || 0,
        communitiesJoined: communitiesResult.data?.length || 0,
        eventsAttended: 0,
        engagementRate: Math.round(engagementRate * 10) / 10,
        followerGrowth: followStats?.growthRate || 0
      });

      // Create recent activity from posts
      const activities: UserActivity[] = [];
      if (postsResult.data) {
        postsResult.data.forEach((post: any) => {
          activities.push({
            id: post.id,
            type: 'post',
            title: post.title || 'New Post',
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
  }, [user, followStats, toast]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user, fetchUserData]);

  if (!user) {
    navigate('/signin');
    return null;
  }

  // Enhanced profile completion calculation
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
        {/* Enhanced Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">My Dashboard</h1>
            <p className="text-muted-foreground">
              Track your activity, manage your profile, and stay connected with your community
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/profile?from=dashboard')}>
              <User className="h-4 w-4 mr-2" />
              View Profile
            </Button>
            <Button variant="outline" onClick={() => navigate('/settings')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Enhanced Profile Overview Card */}
        <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
          <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-4 right-4">
              <Button variant="secondary" size="sm" className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
                <Settings className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
          <CardContent className="relative pt-0 pb-8">
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-white shadow-2xl ring-4 ring-blue-100/50">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {profile?.display_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        {profile?.display_name || user.email?.split('@')[0]}
                      </h2>
                      {profile?.is_verified && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {profile?.is_pro && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          <Crown className="h-3 w-3 mr-1" />
                          Pro Member
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-lg">{user.email}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                        <CalendarDays className="h-3 w-3" />
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                        <Activity className="h-3 w-3" />
                        Active Member
                      </span>
                    </div>
                  </div>
                  <div className="text-center md:text-right space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Profile Completion</div>
                    <div className="flex items-center gap-3">
                      <div className="text-3xl font-bold text-blue-600">{getProfileCompletion()}%</div>
                      <div className="relative">
                        <Progress 
                          value={getProfileCompletion()} 
                          className="w-24 h-3 bg-gray-200 dark:bg-gray-700" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20"></div>
                      </div>
                    </div>
                    {getProfileCompletion() < 100 && (
                      <p className="text-xs text-muted-foreground">
                        Complete your profile to unlock more features
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card 
            className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30" 
            onClick={() => setActiveTab("activity")}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-1">{stats.totalPosts}</div>
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Posts Created</div>
              <div className="text-xs text-muted-foreground mt-1">Click to view</div>
            </CardContent>
          </Card>

          <Card 
            className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 hover:from-green-100 hover:to-green-200 dark:hover:from-green-800/30 dark:hover:to-green-700/30" 
            onClick={() => setActiveTab("bookings")}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <CalendarDays className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300 mb-1">{stats.totalBookings}</div>
              <div className="text-sm font-medium text-green-600 dark:text-green-400">Total Bookings</div>
              <div className="text-xs text-muted-foreground mt-1">Click to manage</div>
            </CardContent>
          </Card>

          <Card 
            className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-800/30 dark:hover:to-purple-700/30" 
            onClick={() => setActiveTab("community")}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-1">{stats.communitiesJoined}</div>
              <div className="text-sm font-medium text-purple-600 dark:text-purple-400">Communities</div>
              <div className="text-xs text-muted-foreground mt-1">Click to explore</div>
            </CardContent>
          </Card>

          <Card 
            className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 hover:from-red-100 hover:to-red-200 dark:hover:from-red-800/30 dark:hover:to-red-700/30" 
            onClick={() => setActiveTab("social")}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-red-700 dark:text-red-300 mb-1">{stats.totalFollowers}</div>
              <div className="text-sm font-medium text-red-600 dark:text-red-400">Followers</div>
              <div className="text-xs text-muted-foreground mt-1">Your audience</div>
            </CardContent>
          </Card>

          <Card 
            className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 hover:from-indigo-100 hover:to-indigo-200 dark:hover:from-indigo-800/30 dark:hover:to-indigo-700/30" 
            onClick={() => setActiveTab("social")}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mb-1">{stats.totalFollowing}</div>
              <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Following</div>
              <div className="text-xs text-muted-foreground mt-1">Your interests</div>
            </CardContent>
          </Card>

          <Card 
            className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-800/30 dark:hover:to-orange-700/30" 
            onClick={() => setActiveTab("activity")}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300 mb-1">{recentActivity.length}</div>
              <div className="text-sm font-medium text-orange-600 dark:text-orange-400">Recent Activity</div>
              <div className="text-xs text-muted-foreground mt-1">Your updates</div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex items-center justify-center">
            <TabsList className="grid grid-cols-3 md:grid-cols-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl shadow-inner">
              <TabsTrigger 
                value="overview" 
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger 
                value="follow" 
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Follow</span>
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Activity</span>
              </TabsTrigger>
              <TabsTrigger 
                value="insights" 
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <Lightbulb className="w-4 h-4" />
                <span className="hidden sm:inline">Insights</span>
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Enhanced Quick Actions */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    Quick Actions
                  </CardTitle>
                  <CardDescription>
                    Jump into your most common tasks with one click
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {quickActions.slice(0, 4).map((action) => (
                      <Button 
                        key={action.id}
                        variant="outline" 
                        className="group h-auto p-6 flex flex-col gap-3 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5" 
                        onClick={() => {
                          if (action.href.startsWith('#')) {
                            setActiveTab(action.href.substring(1));
                          } else {
                            navigate(action.href);
                          }
                        }}
                      >
                        <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                          <action.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{action.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">{action.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Recent Activity */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Your latest interactions and updates across the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.slice(0, 5).map((activity) => (
                        <motion.div 
                          key={activity.id} 
                          className="group flex gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all duration-300 hover:shadow-md"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <BookOpen className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate mb-1">{activity.title}</h4>
                            <p className="text-xs text-muted-foreground mb-2">{activity.description}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                                {activity.date}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {activity.type}
                              </Badge>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                        <Button variant="ghost" size="sm" className="w-full" onClick={() => setActiveTab("activity")}>
                          View All Activity
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Activity className="w-10 h-10 text-blue-500 dark:text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No recent activity</h3>
                      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                        Start engaging with your community! Create posts, join events, and connect with others.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button onClick={() => navigate('/create')} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Post
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/events')}>
                          <CalendarDays className="w-4 h-4 mr-2" />
                          Browse Events
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <UserAnalytics />
          </TabsContent>

          {/* Follow Tab */}
          <TabsContent value="follow" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FollowSuggestions />
              <FollowLists />
            </div>
            <FollowDiscovery />
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <ActivityFeed />
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <UserInsights />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/profile?from=dashboard')}>
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

export default ConsolidatedDashboard;
