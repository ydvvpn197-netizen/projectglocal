import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { DynamicStats } from '@/components/DynamicStats';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  ArrowRight,
  MapPin,
  Users,
  Calendar,
  Zap,
  Sparkles,
  TrendingUp,
  Flame,
  Star,
  Heart,
  MessageCircle,
  Share2,
  Clock,
  Tag,
  Award,
  Trophy,
  Globe,
  Home,
  Plus,
  Bell,
  Settings,
  Ticket,
  Play,
  Camera,
  Mic,
  BookOpen,
  Music,
  Palette,
  Code,
  Coffee,
  Car,
  Building,
  Leaf,
  Mountain,
  Shield,
  HeartHandshake,
  Target,
  Lightbulb,
  Rocket,
  CheckCircle,
  BarChart3,
  UserPlus,
  Megaphone,
  Building2,
  TreePine,
  Utensils,
  Dumbbell,
  GraduationCap,
  Briefcase,
  Gamepad2,
  Smartphone,
  Laptop,
  Headphones,
  ShoppingBag,
  Gift,
  PartyPopper,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Snowflake,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  Search,
  Filter,
  Grid3X3,
  List,
  MoreHorizontal,
  Mail,
  Phone,
  Map,
  Navigation,
  Compass,
  Flag,
  Hash,
  AtSign,
  DollarSign,
  CreditCard,
  Wallet,
  PiggyBank,
  TrendingDown,
  Activity
} from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { usePosts } from '@/hooks/usePosts';
import { useCommunities } from '@/hooks/useCommunities';

// Enhanced hero features with better animations and interactions
const heroFeatures = [
  {
    id: 'local-events',
    title: 'Discover Local Events',
    description: 'Find and join amazing events happening in your community',
    icon: Calendar,
    color: 'from-blue-500 to-cyan-500',
    href: '/events',
    stats: { label: 'Events', value: '500+' }
  },
  {
    id: 'community-connect',
    title: 'Connect with Community',
    description: 'Join vibrant communities and connect with like-minded people',
    icon: Users,
    color: 'from-purple-500 to-pink-500',
    href: '/communities',
    stats: { label: 'Communities', value: '50+' }
  },
  {
    id: 'share-content',
    title: 'Share Your Story',
    description: 'Create posts, share experiences, and engage with your community',
    icon: Share2,
    color: 'from-green-500 to-emerald-500',
    href: '/create',
    stats: { label: 'Posts', value: '1K+' }
  },
  {
    id: 'local-news',
    title: 'Stay Informed',
    description: 'Get the latest local news and updates from your area',
    icon: Globe,
    color: 'from-orange-500 to-red-500',
    href: '/news',
    stats: { label: 'News', value: '100+' }
  }
];

// Enhanced trending content with better categorization
const trendingContent = {
  events: [
    {
      id: 1,
      title: "Local Music Festival 2024",
      description: "A three-day celebration of local music talent featuring over 50 artists",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop",
      date: "Dec 15-17, 2024",
      location: "Central Park, Downtown",
      attendees: 1250,
      category: "Music",
      trending: true
    },
    {
      id: 2,
      title: "Art Exhibition Opening",
      description: "Join us for the grand opening of our latest contemporary art exhibition",
      image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=400&fit=crop",
      date: "Dec 10, 2024",
      location: "Downtown Gallery",
      attendees: 89,
      category: "Art",
      trending: false
    }
  ],
  posts: [
    {
      id: 1,
      title: "Amazing sunset at the beach today!",
      content: "The colors were absolutely breathtaking. Perfect evening for a walk.",
      author: {
        name: "Sarah Johnson",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
        verified: true
      },
      likes: 42,
      comments: 8,
      shares: 3,
      timestamp: "2 hours ago",
      trending: true
    },
    {
      id: 2,
      title: "Local farmers market finds",
      content: "Fresh organic vegetables and homemade bread. Supporting local farmers!",
      author: {
        name: "Mike Chen",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        verified: false
      },
      likes: 28,
      comments: 5,
      shares: 2,
      timestamp: "4 hours ago",
      trending: false
    }
  ],
  communities: [
    {
      id: 1,
      name: "Local Food Enthusiasts",
      description: "Discovering the best local restaurants and food spots",
      members: 1250,
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=200&fit=crop",
      category: "Food",
      trending: true
    },
    {
      id: 2,
      name: "Tech Entrepreneurs",
      description: "Connecting local tech professionals and entrepreneurs",
      members: 890,
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop",
      category: "Technology",
      trending: false
    }
  ]
};

// Enhanced community spotlight with better data
const communitySpotlight = [
  {
    id: 1,
    name: "Green Thumbs Collective",
    description: "Promoting sustainable gardening and environmental awareness",
    members: 450,
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=200&fit=crop",
    category: "Environment",
    featured: true,
    stats: {
      events: 12,
      posts: 89,
      growth: "+15%"
    }
  },
  {
    id: 2,
    name: "Local Artists Network",
    description: "Supporting and showcasing local artistic talent",
    members: 320,
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=200&fit=crop",
    category: "Arts",
    featured: false,
    stats: {
      events: 8,
      posts: 156,
      growth: "+22%"
    }
  }
];

// Enhanced categories with better icons and descriptions
const categories = [
  { name: "Music", icon: Music, color: "bg-purple-500", count: 45 },
  { name: "Art", icon: Palette, color: "bg-pink-500", count: 32 },
  { name: "Food", icon: Utensils, color: "bg-orange-500", count: 28 },
  { name: "Sports", icon: Dumbbell, color: "bg-green-500", count: 41 },
  { name: "Tech", icon: Code, color: "bg-blue-500", count: 23 },
  { name: "Education", icon: GraduationCap, color: "bg-indigo-500", count: 19 },
  { name: "Business", icon: Briefcase, color: "bg-gray-500", count: 37 },
  { name: "Wellness", icon: Heart, color: "bg-red-500", count: 24 }
];

const ConsolidatedIndex = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('trending');
  const [isLoading, setIsLoading] = useState(true);

  // Enhanced data fetching with better error handling
  const { events, loading: eventsLoading } = useEvents();
  const { posts, loading: postsLoading } = usePosts();
  const { communities, loading: communitiesLoading } = useCommunities();

  // Enhanced loading state management
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Enhanced trending events with real data
  const trendingEvents = useMemo(() => {
    if (events.length > 0) {
      return events
        .filter(event => event.featured || event.attendees_count > 50)
        .slice(0, 6)
        .map(event => ({
          ...event,
          trending: true
        }));
    }
    return trendingContent.events;
  }, [events]);

  // Enhanced trending posts with real data
  const trendingPosts = useMemo(() => {
    if (posts.length > 0) {
      return posts
        .filter(post => post.likes_count > 10)
        .slice(0, 4)
        .map(post => ({
          ...post,
          trending: true
        }));
    }
    return trendingContent.posts;
  }, [posts]);

  // Enhanced trending communities with real data
  const trendingCommunities = useMemo(() => {
    if (communities.length > 0) {
      return communities
        .filter(community => community.member_count > 100)
        .slice(0, 4)
        .map(community => ({
          ...community,
          trending: true
        }));
    }
    return trendingContent.communities;
  }, [communities]);

  // Enhanced loading component
  if (isLoading) {
    return (
      <ResponsiveLayout>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h2 className="text-2xl font-bold">Loading TheGlocal</h2>
            <p className="text-muted-foreground">Connecting you to your community...</p>
          </motion.div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
        {/* Enhanced Hero Section */}
        <section className="relative overflow-hidden py-20 px-4">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
          <div className="relative max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center space-y-8"
            >
              <div className="space-y-4">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                >
                  Welcome to TheGlocal
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto"
                >
                  Connect with your local community, discover amazing events, and share your stories with the world.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <UnifiedButton
                  size="lg"
                  className="text-lg px-8 py-4"
                  onClick={() => navigate('/events')}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Explore Events
                </UnifiedButton>
                <UnifiedButton
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-4"
                  onClick={() => navigate('/create')}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Share Your Story
                </UnifiedButton>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Enhanced Hero Features */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Makes Us Special</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover the features that make TheGlocal the perfect platform for your community
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {heroFeatures.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <AnimatedCard className="h-full p-6 text-center hover:shadow-xl transition-all duration-300">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground mb-4">{feature.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        <span className="font-semibold text-primary">{feature.stats.value}</span>
                        <span className="ml-1">{feature.stats.label}</span>
                      </div>
                      <UnifiedButton
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(feature.href)}
                        className="group-hover:bg-primary group-hover:text-white transition-colors"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </UnifiedButton>
                    </div>
                  </AnimatedCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Trending Content */}
        <section className="py-16 px-4 bg-white/50 dark:bg-slate-900/50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Trending Now</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover what's popular in your community right now
              </p>
            </motion.div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <div className="flex justify-center">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger value="trending" className="flex items-center gap-2">
                    <Flame className="w-4 h-4" />
                    Trending
                  </TabsTrigger>
                  <TabsTrigger value="events" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Events
                  </TabsTrigger>
                  <TabsTrigger value="communities" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Communities
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="trending" className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Trending Events */}
                  <AnimatedCard className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                        <Flame className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">Trending Events</h3>
                        <p className="text-sm text-muted-foreground">Most popular events right now</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {trendingEvents.slice(0, 3).map((event, index) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="flex gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <img
                            src={event.image_url || event.image}
                            alt={event.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{event.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {event.event_date || event.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {event.location_name || event.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {event.attendees_count || event.attendees}
                              </span>
                            </div>
                          </div>
                          {event.trending && (
                            <Badge className="bg-orange-500 text-white">
                              <Flame className="w-3 h-3 mr-1" />
                              Trending
                            </Badge>
                          )}
                        </motion.div>
                      ))}
                    </div>
                    <div className="mt-6 pt-4 border-t">
                      <UnifiedButton
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate('/events')}
                      >
                        View All Events
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </UnifiedButton>
                    </div>
                  </AnimatedCard>

                  {/* Trending Posts */}
                  <AnimatedCard className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">Trending Posts</h3>
                        <p className="text-sm text-muted-foreground">Most engaging content</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {trendingPosts.slice(0, 3).map((post, index) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="flex gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={post.author?.avatar} />
                            <AvatarFallback>{post.author?.name?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-sm">{post.author?.name}</h4>
                              {post.author?.verified && (
                                <Badge variant="secondary" className="text-xs">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{post.content || post.title}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {post.likes_count || post.likes}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="w-3 h-3" />
                                {post.comments_count || post.comments}
                              </span>
                              <span className="flex items-center gap-1">
                                <Share2 className="w-3 h-3" />
                                {post.shares}
                              </span>
                            </div>
                          </div>
                          {post.trending && (
                            <Badge className="bg-blue-500 text-white">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Hot
                            </Badge>
                          )}
                        </motion.div>
                      ))}
                    </div>
                    <div className="mt-6 pt-4 border-t">
                      <UnifiedButton
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate('/feed')}
                      >
                        View All Posts
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </UnifiedButton>
                    </div>
                  </AnimatedCard>
                </div>
              </TabsContent>

              <TabsContent value="events" className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trendingEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                    >
                      <AnimatedCard className="overflow-hidden">
                        <div className="relative">
                          <img
                            src={event.image_url || event.image}
                            alt={event.title}
                            className="w-full h-48 object-cover"
                          />
                          {event.trending && (
                            <Badge className="absolute top-4 left-4 bg-orange-500 text-white">
                              <Flame className="w-3 h-3 mr-1" />
                              Trending
                            </Badge>
                          )}
                        </div>
                        <div className="p-6">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{event.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>{event.event_date || event.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location_name || event.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="w-4 h-4" />
                              <span>{event.attendees_count || event.attendees} attending</span>
                            </div>
                          </div>
                          <UnifiedButton
                            className="w-full"
                            onClick={() => navigate(`/events/${event.id}`)}
                          >
                            <Ticket className="w-4 h-4 mr-2" />
                            View Event
                          </UnifiedButton>
                        </div>
                      </AnimatedCard>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="communities" className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {trendingCommunities.map((community, index) => (
                    <motion.div
                      key={community.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                    >
                      <AnimatedCard className="overflow-hidden">
                        <div className="relative">
                          <img
                            src={community.image_url || community.image}
                            alt={community.name}
                            className="w-full h-32 object-cover"
                          />
                          {community.trending && (
                            <Badge className="absolute top-2 right-2 bg-blue-500 text-white">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Trending
                            </Badge>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold mb-2 line-clamp-2">{community.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{community.description}</p>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-muted-foreground">
                              {community.member_count || community.members} members
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {community.category}
                            </Badge>
                          </div>
                          <UnifiedButton
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => navigate(`/communities/${community.id}`)}
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Join Community
                          </UnifiedButton>
                        </div>
                      </AnimatedCard>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Enhanced Community Spotlight */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Community Spotlight</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Meet the amazing communities that make our platform special
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {communitySpotlight.map((community, index) => (
                <motion.div
                  key={community.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  whileHover={{ y: -5 }}
                >
                  <AnimatedCard className="overflow-hidden">
                    <div className="relative">
                      <img
                        src={community.image}
                        alt={community.name}
                        className="w-full h-48 object-cover"
                      />
                      {community.featured && (
                        <Badge className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{community.name}</h3>
                          <p className="text-muted-foreground mb-3">{community.description}</p>
                        </div>
                        <Badge variant="outline">{community.category}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{community.stats.events}</div>
                          <div className="text-sm text-muted-foreground">Events</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{community.stats.posts}</div>
                          <div className="text-sm text-muted-foreground">Posts</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{community.stats.growth}</div>
                          <div className="text-sm text-muted-foreground">Growth</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {community.members} members
                          </span>
                        </div>
                        <UnifiedButton
                          onClick={() => navigate(`/communities/${community.id}`)}
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Join Community
                        </UnifiedButton>
                      </div>
                    </div>
                  </AnimatedCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Categories */}
        <section className="py-16 px-4 bg-white/50 dark:bg-slate-900/50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore Categories</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Find your interests and connect with like-minded people
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {categories.map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <AnimatedCard className="p-6 text-center hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-xl ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <category.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
                    <p className="text-xs text-muted-foreground">{category.count} items</p>
                  </AnimatedCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
          <div className="max-w-4xl mx-auto text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Join Your Community?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Start connecting with your neighbors, discover local events, and share your stories with the world.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <UnifiedButton
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 py-4"
                  onClick={() => navigate('/signup')}
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Join TheGlocal
                </UnifiedButton>
                <UnifiedButton
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-black"
                  onClick={() => navigate('/about')}
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Learn More
                </UnifiedButton>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </ResponsiveLayout>
  );
};

export default ConsolidatedIndex;
