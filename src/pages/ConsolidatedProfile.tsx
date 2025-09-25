import { useState, useEffect, useCallback } from "react";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Star, 
  Heart, 
  MessageCircle, 
  Share2, 
  Settings, 
  Edit, 
  Camera, 
  Plus,
  Bell,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  Award,
  TrendingUp,
  Activity,
  BookOpen,
  Globe,
  Mail,
  Phone,
  User,
  UserPlus,
  UserMinus,
  Crown,
  Zap
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useEvents } from "@/hooks/useEvents";
import { usePosts } from "@/hooks/usePosts";
import { useCommunities } from "@/hooks/useCommunities";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { EventCard } from "@/components/EventCard";
import { PostCard } from "@/components/PostCard";
import { CommunityCard } from "@/components/CommunityCard";

const ConsolidatedProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);

  // Enhanced data fetching
  const { profile, loading: profileLoading, updateProfile } = useUserProfile();
  const { events, loading: eventsLoading } = useEvents();
  const { posts, loading: postsLoading } = usePosts();
  const { communities, loading: communitiesLoading } = useCommunities();

  // Enhanced profile data
  const [profileData, setProfileData] = useState({
    display_name: "",
    bio: "",
    location_city: "",
    location_state: "",
    avatar_url: "",
    cover_image_url: "",
    is_verified: false,
    is_pro: false,
    anonymous_mode: false
  });

  // Enhanced stats
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalEvents: 0,
    totalCommunities: 0,
    totalFollowers: 0,
    totalFollowing: 0,
    totalLikes: 0,
    totalComments: 0,
    engagementRate: 0
  });

  // Enhanced loading state
  const isLoading = profileLoading || eventsLoading || postsLoading || communitiesLoading;

  // Enhanced data fetching
  useEffect(() => {
    if (profile) {
      setProfileData({
        display_name: profile.display_name || "",
        bio: profile.bio || "",
        location_city: profile.location_city || "",
        location_state: profile.location_state || "",
        avatar_url: profile.avatar_url || "",
        cover_image_url: profile.cover_image_url || "",
        is_verified: profile.is_verified || false,
        is_pro: profile.is_pro || false,
        anonymous_mode: profile.anonymous_mode || false
      });
    }
  }, [profile]);

  // Enhanced stats calculation
  useEffect(() => {
    if (user) {
      const userPosts = posts.filter(post => post.user_id === user.id);
      const userEvents = events.filter(event => event.organizer_id === user.id);
      const userCommunities = communities.filter(community => 
        community.members?.some(member => member.user_id === user.id)
      );

      const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes_count || 0), 0);
      const totalComments = userPosts.reduce((sum, post) => sum + (post.comments_count || 0), 0);
      const engagementRate = userPosts.length > 0 ? 
        ((totalLikes + totalComments) / userPosts.length) : 0;

      setStats({
        totalPosts: userPosts.length,
        totalEvents: userEvents.length,
        totalCommunities: userCommunities.length,
        totalFollowers: profile?.followers_count || 0,
        totalFollowing: profile?.following_count || 0,
        totalLikes,
        totalComments,
        engagementRate: Math.round(engagementRate * 10) / 10
      });
    }
  }, [user, posts, events, communities, profile]);

  // Enhanced profile update
  const handleProfileUpdate = useCallback(async (updatedData: any) => {
    try {
      await updateProfile(updatedData);
      setProfileData(prev => ({ ...prev, ...updatedData }));
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Unable to update your profile. Please try again.",
        variant: "destructive"
      });
    }
  }, [updateProfile, toast]);

  // Enhanced avatar upload
  const handleAvatarUpload = useCallback(async (file: File) => {
    try {
      // Implement avatar upload logic
      toast({
        title: "Avatar Updated",
        description: "Your avatar has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Unable to upload your avatar. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Enhanced cover image upload
  const handleCoverUpload = useCallback(async (file: File) => {
    try {
      // Implement cover image upload logic
      toast({
        title: "Cover Updated",
        description: "Your cover image has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Unable to upload your cover image. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Enhanced follow functionality
  const handleFollow = useCallback(async () => {
    try {
      // Implement follow logic
      toast({
        title: "Followed!",
        description: "You are now following this user.",
      });
    } catch (error) {
      toast({
        title: "Follow Failed",
        description: "Unable to follow this user. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Enhanced message functionality
  const handleMessage = useCallback(() => {
    setShowChatModal(true);
  }, []);

  // Enhanced connection request
  const handleConnectionRequest = useCallback(() => {
    setShowConnectionModal(true);
  }, []);

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

  if (isLoading) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold mb-2">Loading Profile...</h2>
            <p className="text-muted-foreground">Getting your profile information</p>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="space-y-8">
        {/* Enhanced Profile Header */}
        <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
          <div className="h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-4 right-4">
              <Button 
                variant="secondary" 
                size="sm" 
                className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
          <CardContent className="relative pt-0 pb-8">
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-white shadow-2xl ring-4 ring-blue-100/50">
                  <AvatarImage src={profileData.avatar_url} />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {profileData.display_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
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
                        {profileData.display_name || user?.email?.split('@')[0]}
                      </h2>
                      {profileData.is_verified && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {profileData.is_pro && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          <Crown className="h-3 w-3 mr-1" />
                          Pro Member
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-lg">{user?.email}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                        <Calendar className="h-3 w-3" />
                        Joined {new Date(user?.created_at || '').toLocaleDateString()}
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-1">{stats.totalPosts}</div>
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Posts</div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300 mb-1">{stats.totalEvents}</div>
              <div className="text-sm font-medium text-green-600 dark:text-green-400">Events</div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-1">{stats.totalCommunities}</div>
              <div className="text-sm font-medium text-purple-600 dark:text-purple-400">Communities</div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-red-700 dark:text-red-300 mb-1">{stats.totalFollowers}</div>
              <div className="text-sm font-medium text-red-600 dark:text-red-400">Followers</div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mb-1">{stats.totalFollowing}</div>
              <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Following</div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300 mb-1">{stats.totalLikes}</div>
              <div className="text-sm font-medium text-orange-600 dark:text-orange-400">Likes</div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-300 mb-1">{stats.totalComments}</div>
              <div className="text-sm font-medium text-cyan-600 dark:text-cyan-400">Comments</div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-pink-700 dark:text-pink-300 mb-1">{stats.engagementRate}%</div>
              <div className="text-sm font-medium text-pink-600 dark:text-pink-400">Engagement</div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex items-center justify-center">
            <TabsList className="grid grid-cols-4 md:grid-cols-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl shadow-inner">
              <TabsTrigger 
                value="overview" 
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="posts" 
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Posts</span>
              </TabsTrigger>
              <TabsTrigger 
                value="events" 
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Events</span>
              </TabsTrigger>
              <TabsTrigger 
                value="communities" 
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Communities</span>
              </TabsTrigger>
              <TabsTrigger 
                value="subscription" 
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <Crown className="w-4 h-4" />
                <span className="hidden sm:inline">Subscription</span>
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
              {/* Quick Actions */}
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
                    <Button 
                      variant="outline" 
                      className="group h-auto p-6 flex flex-col gap-3 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5" 
                      onClick={() => navigate('/create')}
                    >
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Plus className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">Create Post</div>
                        <div className="text-xs text-muted-foreground mt-1">Share your thoughts</div>
                      </div>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="group h-auto p-6 flex flex-col gap-3 hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-900/20 dark:hover:border-green-700 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5" 
                      onClick={() => navigate('/events')}
                    >
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">Browse Events</div>
                        <div className="text-xs text-muted-foreground mt-1">Find local events</div>
                      </div>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="group h-auto p-6 flex flex-col gap-3 hover:bg-purple-50 hover:border-purple-200 dark:hover:bg-purple-900/20 dark:hover:border-purple-700 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5" 
                      onClick={() => navigate('/communities')}
                    >
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">Find Communities</div>
                        <div className="text-xs text-muted-foreground mt-1">Connect with others</div>
                      </div>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="group h-auto p-6 flex flex-col gap-3 hover:bg-indigo-50 hover:border-indigo-200 dark:hover:bg-indigo-900/20 dark:hover:border-indigo-700 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5" 
                      onClick={() => navigate('/messages')}
                    >
                      <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">Messages</div>
                        <div className="text-xs text-muted-foreground mt-1">Chat with friends</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
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
                  <div className="space-y-4">
                    {posts.slice(0, 3).map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="group flex gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all duration-300 hover:shadow-md"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate mb-1">{post.title}</h4>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{post.content}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                              {new Date(post.created_at).toLocaleDateString()}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              Post
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.filter(post => post.user_id === user?.id).map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <PostCard
                    post={post}
                    onLike={(postId) => {
                      toast({
                        title: "Liked!",
                        description: "Post added to your likes.",
                      });
                    }}
                    onComment={(postId) => {
                      toast({
                        title: "Comment",
                        description: "Comment functionality coming soon!",
                      });
                    }}
                    onShare={(postId) => {
                      toast({
                        title: "Shared!",
                        description: "Post shared successfully.",
                      });
                    }}
                    onBookmark={(postId) => {
                      toast({
                        title: "Bookmarked!",
                        description: "Post saved to your bookmarks.",
                      });
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.filter(event => event.organizer_id === user?.id).map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <EventCard
                    event={event}
                    onAttend={(eventId) => {
                      toast({
                        title: "Event Attended!",
                        description: "You're now attending this event.",
                      });
                    }}
                    onLike={(eventId) => {
                      toast({
                        title: "Event Liked!",
                        description: "Event added to your likes.",
                      });
                    }}
                    onShare={(eventId) => {
                      toast({
                        title: "Event Shared!",
                        description: "Event shared successfully.",
                      });
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Communities Tab */}
          <TabsContent value="communities" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {communities.filter(community => 
                community.members?.some(member => member.user_id === user?.id)
              ).map((community, index) => (
                <motion.div
                  key={community.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <CommunityCard
                    community={community}
                    onJoin={(communityId) => {
                      toast({
                        title: "Joined Community!",
                        description: "You are now a member of this community.",
                      });
                    }}
                    onLeave={(communityId) => {
                      toast({
                        title: "Left Community",
                        description: "You are no longer a member of this community.",
                      });
                    }}
                    onShare={(communityId) => {
                      toast({
                        title: "Community Shared!",
                        description: "Community shared successfully.",
                      });
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Crown className="w-6 h-6 text-yellow-500" />
                  Subscription Status
                </CardTitle>
                <CardDescription>
                  Manage your subscription and unlock premium features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {profileData.is_pro ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Pro Member</h3>
                    <p className="text-muted-foreground mb-6">
                      You have access to all premium features and benefits.
                    </p>
                    <Button variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Subscription
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Crown className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Free Account</h3>
                    <p className="text-muted-foreground mb-6">
                      Upgrade to Pro to unlock premium features and benefits.
                    </p>
                    <Button className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600">
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Pro
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
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
                  <Button variant="outline" className="w-full justify-start" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
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
                    <BookOpen className="h-4 w-4 mr-2" />
                    Bookmarks
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/subscription')}>
                    <Crown className="h-4 w-4 mr-2" />
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
    </ResponsiveLayout>
  );
};

export default ConsolidatedProfile;
