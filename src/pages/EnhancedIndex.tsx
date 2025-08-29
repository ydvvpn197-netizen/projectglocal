import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { EnhancedNavigation } from '@/components/ui/EnhancedNavigation';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { AdvancedButton } from '@/components/ui/AdvancedButton';
import { SmartInput } from '@/components/ui/SmartInput';
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
  Search,
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

  HeartHandshake,
  Lightbulb,
  Rocket,
  Target,
  CheckCircle,
  ArrowUpRight,
  ChevronRight,
  ChevronLeft,
  Info,
} from 'lucide-react';

// Enhanced sample data
const heroFeatures = [
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Connect Locally',
    description: 'Build meaningful relationships with your neighbors',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: <Calendar className="h-6 w-6" />,
    title: 'Discover Events',
    description: 'Find and create amazing local events',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: <Star className="h-6 w-6" />,
    title: 'Book Artists',
    description: 'Support local talent and book amazing performances',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: 'Explore Community',
    description: 'Join groups and discussions that matter to you',
    color: 'from-green-500 to-emerald-500',
  },
];

const trendingEvents = [
  {
    id: 1,
    title: 'Local Music Festival 2024',
    description: 'A three-day celebration of local music talent featuring over 50 artists across multiple stages.',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
    date: 'Dec 15-17, 2024',
    location: 'Central Park, Downtown',
    attendees: 1250,
    maxAttendees: 2000,
    category: 'Music',
    featured: true,
    price: '$25',
    organizer: {
      name: 'SoundWave Productions',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    }
  },
  {
    id: 2,
    title: 'Community Garden Workshop',
    description: 'Learn sustainable gardening techniques and help build our community garden.',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=400&fit=crop',
    date: 'Dec 20, 2024',
    location: 'Community Center',
    attendees: 45,
    maxAttendees: 60,
    category: 'Education',
    featured: false,
    price: 'Free',
    organizer: {
      name: 'Green Thumbs Collective',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    }
  },
  {
    id: 3,
    title: 'Tech Meetup: AI in Local Business',
    description: 'Discover how artificial intelligence is transforming local businesses and opportunities.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
    date: 'Dec 22, 2024',
    location: 'Innovation Hub',
    attendees: 89,
    maxAttendees: 120,
    category: 'Technology',
    featured: true,
    price: '$15',
    organizer: {
      name: 'Tech Enthusiasts',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face'
    }
  },
];

const trendingDiscussions = [
  {
    id: 1,
    title: 'Best local coffee shops in the area?',
    author: 'CoffeeLover',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    category: 'Food & Drink',
    replies: 47,
    views: 1234,
    trending: true,
    tags: ['coffee', 'local', 'recommendations'],
    lastActivity: '2 hours ago',
  },
  {
    id: 2,
    title: 'Weekend hiking trails near the city',
    author: 'NatureExplorer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    category: 'Outdoors',
    replies: 32,
    views: 856,
    trending: true,
    tags: ['hiking', 'outdoors', 'weekend'],
    lastActivity: '4 hours ago',
  },
  {
    id: 3,
    title: 'Local artist showcase this weekend',
    author: 'ArtCollector',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    category: 'Arts',
    replies: 18,
    views: 567,
    trending: false,
    tags: ['art', 'showcase', 'local'],
    lastActivity: '6 hours ago',
  },
];

const communitySpotlight = [
  {
    id: 1,
    name: 'Local Artists Collective',
    members: 234,
    description: 'Supporting and promoting local artists in our community',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=200&h=200&fit=crop',
    category: 'Arts',
    featured: true,
    recentActivity: 'New member joined',
  },
  {
    id: 2,
    name: 'Tech Enthusiasts',
    members: 189,
    description: 'Discussing the latest in technology and innovation',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=200&fit=crop',
    category: 'Technology',
    featured: false,
    recentActivity: 'New discussion posted',
  },
  {
    id: 3,
    name: 'Sustainable Living',
    members: 156,
    description: 'Sharing tips and ideas for eco-friendly living',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=200&fit=crop',
    category: 'Lifestyle',
    featured: true,
    recentActivity: 'Event created',
  },
];

// Stats are now handled by DynamicStats component

const categories = [
  { name: 'Music', icon: <Music className="h-4 w-4" />, color: 'bg-purple-500' },
  { name: 'Food', icon: <Coffee className="h-4 w-4" />, color: 'bg-orange-500' },
  { name: 'Technology', icon: <Code className="h-4 w-4" />, color: 'bg-blue-500' },
  { name: 'Arts', icon: <Palette className="h-4 w-4" />, color: 'bg-pink-500' },
  { name: 'Outdoors', icon: <Leaf className="h-4 w-4" />, color: 'bg-green-500' },
  { name: 'Business', icon: <Building className="h-4 w-4" />, color: 'bg-gray-500' },
];

export const EnhancedIndex: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('events');
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleGetStarted = () => {
    if (user) {
      navigate('/feed');
    } else {
      navigate('/signin');
    }
  };

  const handleNotificationClick = () => {
    if (user) {
      navigate('/notifications');
    } else {
      navigate('/signin');
    }
  };

  const nextEvent = () => {
    setCurrentEventIndex((prev) => (prev + 1) % trendingEvents.length);
  };

  const prevEvent = () => {
    setCurrentEventIndex((prev) => (prev - 1 + trendingEvents.length) % trendingEvents.length);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <EnhancedNavigation 
        variant="glass"
        showSearch={false}
        notifications={3}
        onNotificationClick={handleNotificationClick}
      />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        <div className="container mx-auto relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center max-w-4xl mx-auto"
          >
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent"
            >
              Connect Locally,
              <br />
              <span className="text-foreground">Grow Globally</span>
            </motion.h1>
            
            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Discover amazing events, connect with neighbors, and support local artists in your community.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <SmartInput
                placeholder="Search for events, people, or places..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onDebouncedChange={handleSearch}
                debounceMs={500}
                leftIcon={<Search className="h-4 w-4" />}
                className="max-w-md"
              />
              <AdvancedButton
                onClick={handleGetStarted}
                size="lg"
                variant="gradient"
                leftIcon={<Sparkles className="h-5 w-5" />}
                rightIcon={<ArrowRight className="h-5 w-5" />}
              >
                {user ? 'Go to Feed' : 'Get Started'}
              </AdvancedButton>
            </motion.div>

            {/* Hero Features */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16"
            >
              {heroFeatures.map((feature, index) => (
                <AnimatedCard
                  key={index}
                  variant="glass"
                  className="text-center p-6"
                  entranceAnimation="slide"
                  delay={index * 100}
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </AnimatedCard>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <DynamicStats refreshInterval={30000} />
          </motion.div>
        </div>
      </section>

      {/* Featured Content Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What's Happening</h2>
              <p className="text-lg text-muted-foreground">Discover trending events and discussions in your area</p>
            </motion.div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="events" className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Events</span>
                </TabsTrigger>
                <TabsTrigger value="discussions" className="flex items-center space-x-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>Discussions</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="events" className="space-y-8">
                {/* Featured Event Carousel */}
                <div className="relative">
                  <AnimatedCard
                    variant="elevated"
                    className="overflow-hidden"
                    image={{
                      src: trendingEvents[currentEventIndex].image,
                      alt: trendingEvents[currentEventIndex].title,
                      height: 300,
                    }}
                    overlay={
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    }
                  >
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="secondary" className="bg-white/20 text-white">
                          {trendingEvents[currentEventIndex].category}
                        </Badge>
                        {trendingEvents[currentEventIndex].featured && (
                          <Badge variant="destructive" className="bg-gradient-to-r from-yellow-400 to-orange-500">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold mb-2">
                        {trendingEvents[currentEventIndex].title}
                      </h3>
                      <p className="text-white/80 mb-4">
                        {trendingEvents[currentEventIndex].description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{trendingEvents[currentEventIndex].date}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{trendingEvents[currentEventIndex].location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{trendingEvents[currentEventIndex].attendees}/{trendingEvents[currentEventIndex].maxAttendees}</span>
                          </div>
                        </div>
                        <AdvancedButton
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/event/${trendingEvents[currentEventIndex].id}`)}
                        >
                          Learn More
                        </AdvancedButton>
                      </div>
                    </div>
                  </AnimatedCard>

                  {/* Carousel Controls */}
                  <div className="absolute top-1/2 transform -translate-y-1/2 left-4">
                    <AdvancedButton
                      variant="secondary"
                      size="icon"
                      onClick={prevEvent}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </AdvancedButton>
                  </div>
                  <div className="absolute top-1/2 transform -translate-y-1/2 right-4">
                    <AdvancedButton
                      variant="secondary"
                      size="icon"
                      onClick={nextEvent}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </AdvancedButton>
                  </div>

                  {/* Event Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    {trendingEvents.slice(1).map((event, index) => (
                      <AnimatedCard
                        key={event.id}
                        variant="default"
                        className="cursor-pointer"
                        hoverEffect="lift"
                        onClick={() => navigate(`/event/${event.id}`)}
                        entranceAnimation="slide"
                        delay={index * 100}
                        image={{
                          src: event.image,
                          alt: event.title,
                          height: 200,
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{event.category}</Badge>
                          <span className="text-sm font-semibold text-primary">{event.price}</span>
                        </div>
                        <h3 className="font-semibold mb-2 line-clamp-2">{event.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {event.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{event.date}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{event.attendees}</span>
                          </div>
                        </div>
                      </AnimatedCard>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="discussions" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trendingDiscussions.map((discussion, index) => (
                    <AnimatedCard
                      key={discussion.id}
                      variant="default"
                      className="cursor-pointer"
                      hoverEffect="scale"
                      onClick={() => navigate(`/community/discussion/${discussion.id}`)}
                      entranceAnimation="slide"
                      delay={index * 100}
                    >
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={discussion.avatar} />
                          <AvatarFallback>{discussion.author[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {discussion.category}
                            </Badge>
                            {discussion.trending && (
                              <Badge variant="destructive" className="text-xs">
                                <Flame className="h-3 w-3 mr-1" />
                                Trending
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold mb-2 line-clamp-2">{discussion.title}</h3>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>by {discussion.author}</span>
                            <span>{discussion.lastActivity}</span>
                          </div>
                          <div className="flex items-center space-x-4 mt-3 text-xs text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="h-3 w-3" />
                              <span>{discussion.replies}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>{discussion.views}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AnimatedCard>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </section>

      {/* Community Spotlight */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Community Spotlight</h2>
              <p className="text-lg text-muted-foreground">Join amazing communities and connect with like-minded people</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communitySpotlight.map((community, index) => (
                <AnimatedCard
                  key={community.id}
                  variant="default"
                  className="cursor-pointer"
                  hoverEffect="lift"
                  onClick={() => navigate(`/community/${community.id}`)}
                  entranceAnimation="slide"
                  delay={index * 100}
                  image={{
                    src: community.image,
                    alt: community.name,
                    height: 150,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{community.category}</Badge>
                    {community.featured && (
                      <Badge variant="destructive">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold mb-2">{community.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {community.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{community.members} members</span>
                    </div>
                    <span>{community.recentActivity}</span>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore Categories</h2>
              <p className="text-lg text-muted-foreground">Find events and communities that match your interests</p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category, index) => (
                <AnimatedCard
                  key={category.name}
                  variant="outline"
                  className="cursor-pointer text-center p-6"
                  hoverEffect="scale"
                  onClick={() => navigate(`/discover?category=${category.name.toLowerCase()}`)}
                  entranceAnimation="slide"
                  delay={index * 100}
                >
                  <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mx-auto mb-3`}>
                    {category.icon}
                  </div>
                  <span className="font-medium">{category.name}</span>
                </AnimatedCard>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2
              variants={itemVariants}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Ready to Connect?
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Join thousands of people who are already building stronger communities through The Glocal.
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <AdvancedButton
                onClick={handleGetStarted}
                size="lg"
                variant="gradient"
                leftIcon={<Sparkles className="h-5 w-5" />}
              >
                {user ? 'Explore Feed' : 'Join Now'}
              </AdvancedButton>
              <AdvancedButton
                onClick={() => navigate('/about')}
                size="lg"
                variant="outline"
                leftIcon={<Info className="h-5 w-5" />}
              >
                Learn More
              </AdvancedButton>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
