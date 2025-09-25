import { useState, useEffect, useCallback } from "react";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Search, 
  Plus, 
  Users, 
  MapPin, 
  Clock, 
  Star, 
  Filter,
  Grid3X3,
  List,
  TrendingUp,
  Flame,
  Heart,
  Share2,
  MoreHorizontal,
  MessageCircle,
  Bell,
  Settings,
  Zap,
  Target,
  Award,
  Crown,
  Sparkles,
  Rocket,
  Lightbulb,
  BarChart3,
  TrendingDown,
  Activity,
  CheckCircle,
  AlertCircle,
  Info,
  HelpCircle,
  ExternalLink,
  Copy,
  Link,
  Navigation,
  Compass,
  Flag,
  Tag,
  Hash,
  AtSign,
  CreditCard,
  Wallet,
  PiggyBank,
  CalendarDays,
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
  Activity as ActivityIcon,
  RefreshCw,
  Bookmark,
  Globe,
  Lock,
  Unlock,
  Shield,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  UserCog,
  UserEdit,
  UserSearch,
  UserStar,
  UserHeart,
  UserMessage,
  UserPhone,
  UserMail,
  UserCalendar,
  UserClock,
  UserMap,
  UserHome,
  UserWork,
  UserSchool,
  UserGame,
  UserMusic,
  UserArt,
  UserSport,
  UserFood,
  UserTravel,
  UserTech,
  UserHealth,
  UserFinance,
  UserShopping,
  UserGift,
  UserParty,
  UserSun,
  UserMoon,
  UserCloud,
  UserRain,
  UserSnow,
  UserWind,
  UserDroplet,
  UserThermometer,
  UserEye,
  UserSearch as UserSearchIcon,
  UserFilter,
  UserGrid,
  UserList,
  UserMore,
  UserSettings,
  UserBell,
  UserMail as UserMailIcon,
  UserPhone as UserPhoneIcon,
  UserMap as UserMapIcon,
  UserNavigation,
  UserCompass,
  UserFlag,
  UserTag,
  UserHash,
  UserAtSign,
  UserDollarSign,
  UserCreditCard,
  UserWallet,
  UserPiggyBank,
  UserTrendingDown,
  UserActivity
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCommunities } from "@/hooks/useCommunities";
import { useEvents } from "@/hooks/useEvents";
import { usePosts } from "@/hooks/usePosts";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

interface CommunityCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  count: number;
}

interface CommunityFilter {
  category: string;
  location: string;
  size: string;
  activity: string;
  sortBy: string;
}

interface CommunityMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  joinedAt: string;
  isOnline: boolean;
}

const ConsolidatedCommunity = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { communities, loading, joinCommunity, leaveCommunity } = useCommunities();
  const { events } = useEvents();
  const { posts } = usePosts();

  // Enhanced state management
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("members");
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("discover");
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Enhanced filters
  const [filters, setFilters] = useState<CommunityFilter>({
    category: "All Categories",
    location: "Any Location",
    size: "Any Size",
    activity: "Any Activity",
    sortBy: "members"
  });

  // Enhanced categories with icons and colors
  const categories: CommunityCategory[] = [
    { id: "all", name: "All Categories", icon: Grid3X3, color: "bg-gray-500", count: communities.length },
    { id: "music", name: "Music", icon: Music, color: "bg-purple-500", count: communities.filter(c => c.category === "Music").length },
    { id: "art", name: "Art", icon: Palette, color: "bg-pink-500", count: communities.filter(c => c.category === "Art").length },
    { id: "community", name: "Community", icon: Users, color: "bg-blue-500", count: communities.filter(c => c.category === "Community").length },
    { id: "food", name: "Food", icon: Utensils, color: "bg-orange-500", count: communities.filter(c => c.category === "Food").length },
    { id: "tech", name: "Technology", icon: Laptop, color: "bg-indigo-500", count: communities.filter(c => c.category === "Technology").length },
    { id: "wellness", name: "Health & Wellness", icon: Dumbbell, color: "bg-green-500", count: communities.filter(c => c.category === "Health & Wellness").length },
    { id: "sports", name: "Sports", icon: Target, color: "bg-red-500", count: communities.filter(c => c.category === "Sports").length },
    { id: "education", name: "Education", icon: GraduationCap, color: "bg-yellow-500", count: communities.filter(c => c.category === "Education").length },
    { id: "business", name: "Business", icon: Briefcase, color: "bg-gray-600", count: communities.filter(c => c.category === "Business").length },
    { id: "entertainment", name: "Entertainment", icon: PartyPopper, color: "bg-pink-600", count: communities.filter(c => c.category === "Entertainment").length }
  ];

  // Enhanced data processing
  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (community.description && community.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (community.tags && community.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesCategory = selectedCategory === "All Categories" || community.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedCommunities = [...filteredCommunities].sort((a, b) => {
    switch (sortBy) {
      case "members":
        return (b.member_count || b.members || 0) - (a.member_count || a.members || 0);
      case "activity":
        return (b.activity_score || 0) - (a.activity_score || 0);
      case "created":
        return new Date(b.created_at || b.createdAt).getTime() - new Date(a.created_at || a.createdAt).getTime();
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // Enhanced handlers
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Simulate refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Communities Refreshed",
        description: "Latest communities have been loaded.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh communities. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [toast]);

  const handleJoinCommunity = useCallback(async (communityId: string) => {
    try {
      await joinCommunity(communityId);
      toast({
        title: "Joined Community",
        description: "You've successfully joined this community!",
      });
    } catch (error) {
      toast({
        title: "Join Failed",
        description: "Unable to join community. Please try again.",
        variant: "destructive"
      });
    }
  }, [joinCommunity, toast]);

  const handleLeaveCommunity = useCallback(async (communityId: string) => {
    try {
      await leaveCommunity(communityId);
      toast({
        title: "Left Community",
        description: "You've successfully left this community.",
      });
    } catch (error) {
      toast({
        title: "Leave Failed",
        description: "Unable to leave community. Please try again.",
        variant: "destructive"
      });
    }
  }, [leaveCommunity, toast]);

  const handleJoinModal = (community: any) => {
    setSelectedCommunity(community);
    setIsJoinModalOpen(true);
  };

  // Enhanced join modal
  const JoinCommunityModal = ({ community, isOpen, onClose }: { community: any; isOpen: boolean; onClose: () => void }) => {
    const [joinReason, setJoinReason] = useState("");

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{community.name}</DialogTitle>
            <DialogDescription>
              Join this amazing community and connect with like-minded people
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Enhanced Community Details */}
            <div className="flex gap-4">
              <img 
                src={community.image_url || community.image || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop"} 
                alt={community.name}
                className="w-32 h-24 rounded-lg object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{community.member_count || community.members || 0} members</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{community.location || "Online"}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{community.activity_level || "Active"} community</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Created {new Date(community.created_at || community.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Enhanced Join Form */}
            <div className="space-y-4">
              <h3 className="font-semibold">Why do you want to join this community?</h3>
              <textarea
                placeholder="Tell us about your interests and what you hope to contribute..."
                value={joinReason}
                onChange={(e) => setJoinReason(e.target.value)}
                className="w-full p-3 border rounded-lg resize-none"
                rows={3}
              />
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex gap-3">
              <Button 
                className="flex-1 btn-event"
                onClick={() => {
                  handleJoinCommunity(community.id);
                  onClose();
                }}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Join Community
              </Button>
              <Button 
                variant="outline" 
                onClick={onClose}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <ResponsiveLayout>
      <div className="space-y-8">
        {/* Enhanced Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Communities
            </h1>
            <p className="text-muted-foreground mt-2">
              Connect with like-minded people and build meaningful relationships
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="btn-event" asChild>
              <Link to="/create-community">
                <Plus className="w-4 h-4 mr-2" />
                Create Community
              </Link>
            </Button>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="discover" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="nearby" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Nearby
            </TabsTrigger>
            <TabsTrigger value="my-communities" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              My Communities
            </TabsTrigger>
          </TabsList>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-6">
            {/* Enhanced Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Enhanced Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search communities, topics, or interests..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  {/* Enhanced Category Filter */}
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          <div className="flex items-center gap-2">
                            <category.icon className="w-4 h-4" />
                            {category.name} ({category.count})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Enhanced Sort By */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full lg:w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="members">Members</SelectItem>
                      <SelectItem value="activity">Activity</SelectItem>
                      <SelectItem value="created">Created</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Enhanced View Mode Toggle */}
                  <div className="flex border rounded-lg">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="rounded-r-none"
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="rounded-l-none"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Communities Grid/List */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {selectedCategory === "All Categories" ? "All Communities" : selectedCategory} ({sortedCommunities.length})
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </div>
              </div>
              
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loading ? (
                    // Enhanced loading skeleton
                    [...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                      >
                        <Card className="animate-pulse">
                          <div className="h-48 bg-muted rounded-t-lg"></div>
                          <CardContent className="p-4">
                            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-full mb-2"></div>
                            <div className="h-3 bg-muted rounded w-2/3"></div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  ) : sortedCommunities.length > 0 ? (
                    sortedCommunities.map((community, index) => (
                      <motion.div
                        key={community.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                      >
                        <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300">
                          <div className="relative">
                            <img 
                              src={community.image_url || community.image || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop"} 
                              alt={community.name}
                              className="w-full h-48 object-cover rounded-t-lg"
                            />
                            <div className="absolute top-4 right-4">
                              <Badge className="bg-white/90 text-black">
                                {community.category}
                              </Badge>
                            </div>
                            <div className="absolute bottom-4 left-4">
                              <div className="flex items-center gap-2 text-white">
                                <Users className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                  {community.member_count || community.members || 0} members
                                </span>
                              </div>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div>
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                  {community.name}
                                  {community.is_verified && (
                                    <Badge className="bg-blue-500 text-white text-xs">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Verified
                                    </Badge>
                                  )}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {community.description}
                                </p>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarImage src={community.creator_avatar || community.creator?.avatar} />
                                    <AvatarFallback>{(community.creator_name || community.creator?.name || 'C')[0]}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm text-muted-foreground">
                                    {community.creator_name || community.creator?.name || 'Community Creator'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleJoinModal(community)}
                                  >
                                    <UserPlus className="w-4 h-4 mr-1" />
                                    Join
                                  </Button>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full">
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">No Communities Found</h3>
                          <p className="text-muted-foreground mb-4">
                            {searchQuery || selectedCategory !== "All Categories" 
                              ? "No communities match your search criteria." 
                              : "There are no communities available at the moment."}
                          </p>
                          <Link to="/create-community">
                            <Button className="btn-event">
                              <Plus className="w-4 h-4 mr-2" />
                              Create Community
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {loading ? (
                    // Enhanced loading skeleton for list view
                    [...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                      >
                        <Card className="animate-pulse">
                          <CardContent className="p-6">
                            <div className="flex gap-6">
                              <div className="w-32 h-24 bg-muted rounded-lg flex-shrink-0"></div>
                              <div className="flex-1">
                                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                                <div className="h-3 bg-muted rounded w-2/3"></div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  ) : sortedCommunities.length > 0 ? (
                    sortedCommunities.map((community, index) => (
                      <motion.div
                        key={community.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ x: 5 }}
                      >
                        <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300">
                          <CardContent className="p-6">
                            <div className="flex gap-6">
                              <img 
                                src={community.image_url || community.image || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop"} 
                                alt={community.name}
                                className="w-32 h-24 rounded-lg object-cover flex-shrink-0"
                              />
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                      {community.name}
                                      {community.is_verified && (
                                        <Badge className="bg-blue-500 text-white text-xs">
                                          <CheckCircle className="w-3 h-3 mr-1" />
                                          Verified
                                        </Badge>
                                      )}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                      {community.description}
                                    </p>
                                  </div>
                                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </div>
                                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {community.member_count || community.members || 0} members
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {community.location || "Online"}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Activity className="w-3 h-3" />
                                    {community.activity_level || "Active"}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <CalendarDays className="w-3 h-3" />
                                    {new Date(community.created_at || community.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                      <Avatar className="w-6 h-6">
                                        <AvatarImage src={community.creator_avatar || community.creator?.avatar} />
                                        <AvatarFallback>{(community.creator_name || community.creator?.name || 'C')[0]}</AvatarFallback>
                                      </Avatar>
                                      <span className="text-sm font-medium">{community.creator_name || community.creator?.name || 'Community Creator'}</span>
                                    </div>
                                    <Badge className="badge-event">{community.category}</Badge>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleJoinModal(community)}
                                    >
                                      <UserPlus className="w-4 h-4 mr-1" />
                                      Join
                                    </Button>
                                    <Button variant="ghost" size="icon">
                                      <MessageCircle className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No Communities Found</h3>
                        <p className="text-muted-foreground mb-4">
                          {searchQuery || selectedCategory !== "All Categories" 
                            ? "No communities match your search criteria." 
                            : "There are no communities available at the moment."}
                        </p>
                        <Link to="/create-community">
                          <Button className="btn-event">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Community
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </section>
          </TabsContent>

          {/* Other tabs content would go here */}
          <TabsContent value="trending" className="space-y-6">
            <Card>
              <CardContent className="p-8 text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Trending Communities</h3>
                <p className="text-muted-foreground">Coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nearby" className="space-y-6">
            <Card>
              <CardContent className="p-8 text-center">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Nearby Communities</h3>
                <p className="text-muted-foreground">Coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-communities" className="space-y-6">
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">My Communities</h3>
                <p className="text-muted-foreground">Coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Enhanced Join Modal */}
        {selectedCommunity && (
          <JoinCommunityModal
            community={selectedCommunity}
            isOpen={isJoinModalOpen}
            onClose={() => {
              setIsJoinModalOpen(false);
              setSelectedCommunity(null);
            }}
          />
        )}
      </div>
    </ResponsiveLayout>
  );
};

export default ConsolidatedCommunity;
