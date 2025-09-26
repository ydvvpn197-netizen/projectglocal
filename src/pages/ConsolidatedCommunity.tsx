import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CommunityLeaderboard } from '@/components/CommunityLeaderboard';
import { CommunityFeaturesTest } from '@/components/CommunityFeaturesTest';
import { useCommunityGroups } from '@/hooks/useCommunityGroups';
import { useLocation } from '@/hooks/useLocation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LocalCommunityService, LocalCommunity } from '@/services/localCommunityService';
import { 
  Search, 
  Plus, 
  Users, 
  MessageCircle, 
  Calendar, 
  MapPin, 
  Star, 
  Filter,
  Grid3X3,
  List,
  TrendingUp,
  Flame,
  Globe,
  Heart,
  Bookmark,
  Share2,
  MoreHorizontal,
  ArrowLeft,
  UserPlus,
  Hash,
  Settings,
  Crown,
  Shield,
  Eye,
  Lock,
  Globe as GlobeIcon,
  UserPlus as UserPlusIcon,
  Crown as CrownIcon,
  Sparkles,
  TrendingUp as TrendingUpIcon,
  TrendingDown,
  Activity,
  BarChart3,
  MessageSquare,
  Navigation,
  Compass,
  Flag,
  Hash as HashIcon,
  AtSign,
  ExternalLink,
  BookOpen,
  Music,
  Camera,
  Mic,
  Coffee,
  Car,
  Building,
  Leaf,
  Mountain,
  Globe as GlobeIcon2,
  UserPlus as UserPlusIcon2,
  Crown as CrownIcon2,
  Sparkles as SparklesIcon,
  TrendingUp as TrendingUpIcon2,
  TrendingDown as TrendingDownIcon,
  Activity as ActivityIcon,
  BarChart3 as BarChart3Icon,
  MessageSquare as MessageSquareIcon,
  Navigation as NavigationIcon,
  Compass as CompassIcon,
  Flag as FlagIcon,
  Hash as HashIcon2,
  AtSign as AtSignIcon,
  ExternalLink as ExternalLinkIcon,
  BookOpen as BookOpenIcon,
  Music as MusicIcon,
  Camera as CameraIcon,
  Mic as MicIcon,
  Coffee as CoffeeIcon,
  Car as CarIcon,
  Building as BuildingIcon,
  Leaf as LeafIcon,
  Mountain as MountainIcon,
  Globe as GlobeIcon3,
  UserPlus as UserPlusIcon3,
  Crown as CrownIcon3,
  Sparkles as SparklesIcon2,
  TrendingUp as TrendingUpIcon3,
  TrendingDown as TrendingDownIcon2,
  Activity as ActivityIcon2,
  BarChart3 as BarChart3Icon2,
  MessageSquare as MessageSquareIcon2,
  Navigation as NavigationIcon2,
  Compass as CompassIcon2,
  Flag as FlagIcon2,
  Hash as HashIcon3,
  AtSign as AtSignIcon2,
  ExternalLink as ExternalLinkIcon2,
  BookOpen as BookOpenIcon2,
  Music as MusicIcon2,
  Camera as CameraIcon2,
  Mic as MicIcon2,
  Coffee as CoffeeIcon2,
  Car as CarIcon2,
  Building as BuildingIcon2,
  Leaf as LeafIcon2,
  Mountain as MountainIcon2,
  Globe as GlobeIcon4,
  UserPlus as UserPlusIcon4,
  Crown as CrownIcon4,
  Sparkles as SparklesIcon3,
  TrendingUp as TrendingUpIcon4,
  TrendingDown as TrendingDownIcon3,
  Activity as ActivityIcon3
} from 'lucide-react';

interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  postCount: number;
  isPrivate: boolean;
  isJoined: boolean;
  avatar?: string;
  coverImage?: string;
  tags: string[];
  location?: {
    city: string;
    state: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
  moderators: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  recentPosts: Array<{
    id: string;
    title: string;
    content: string;
    author: {
      id: string;
      name: string;
      avatar?: string;
    };
    createdAt: string;
    likes: number;
    comments: number;
  }>;
}

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    isModerator: boolean;
  };
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: number;
  shares: number;
  tags: string[];
  isPinned: boolean;
  isLocked: boolean;
  attachments?: Array<{
    id: string;
    type: 'image' | 'video' | 'file';
    url: string;
    name: string;
  }>;
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: {
    id: string;
    name: string;
    avatar?: string;
  };
  attendees: number;
  maxAttendees?: number;
  isPublic: boolean;
  category: string;
  tags: string[];
}

const ConsolidatedCommunity: React.FC = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { location } = useLocation();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'events' | 'members' | 'settings'>('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load communities
  useEffect(() => {
    const loadCommunities = async () => {
      try {
        setLoading(true);
        
        // Load local communities
        const localCommunities = await LocalCommunityService.getCommunities();
        
        // Mock additional communities
        const mockCommunities: Community[] = [
          {
            id: '1',
            name: 'Local Artists Collective',
            description: 'A community for local artists to share their work and collaborate',
            category: 'Arts & Culture',
            memberCount: 245,
            postCount: 89,
            isPrivate: false,
            isJoined: true,
            avatar: '/api/placeholder/64/64',
            tags: ['art', 'music', 'collaboration'],
            location: {
              city: 'San Francisco',
              state: 'CA',
              country: 'USA'
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            moderators: [
              { id: '1', name: 'Sarah Johnson', avatar: '/api/placeholder/32/32' }
            ],
            recentPosts: []
          },
          {
            id: '2',
            name: 'Tech Enthusiasts SF',
            description: 'Technology discussions and networking for San Francisco tech professionals',
            category: 'Technology',
            memberCount: 1200,
            postCount: 456,
            isPrivate: false,
            isJoined: false,
            avatar: '/api/placeholder/64/64',
            tags: ['tech', 'startup', 'networking'],
            location: {
              city: 'San Francisco',
              state: 'CA',
              country: 'USA'
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            moderators: [
              { id: '2', name: 'Mike Chen', avatar: '/api/placeholder/32/32' }
            ],
            recentPosts: []
          }
        ];
        
        setCommunities([...localCommunities, ...mockCommunities]);
      } catch (err) {
        setError('Failed to load communities');
        console.error('Error loading communities:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCommunities();
  }, []);

  // Load community details if communityId is provided
  useEffect(() => {
    if (communityId) {
      const community = communities.find(c => c.id === communityId);
      if (community) {
        setSelectedCommunity(community);
        loadCommunityContent(community.id);
      }
    }
  }, [communityId, communities]);

  const loadCommunityContent = async (communityId: string) => {
    try {
      // Mock loading community posts and events
      const mockPosts: CommunityPost[] = [
        {
          id: '1',
          title: 'New Art Exhibition Opening',
          content: 'Join us for the opening of our new art exhibition featuring local artists...',
          author: {
            id: '1',
            name: 'Sarah Johnson',
            avatar: '/api/placeholder/32/32',
            isModerator: true
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          likes: 24,
          comments: 8,
          shares: 3,
          tags: ['art', 'exhibition', 'local'],
          isPinned: true,
          isLocked: false
        }
      ];
      
      const mockEvents: CommunityEvent[] = [
        {
          id: '1',
          title: 'Community Meetup',
          description: 'Monthly community meetup to discuss upcoming projects',
          date: '2024-01-15',
          time: '18:00',
          location: 'Community Center',
          organizer: {
            id: '1',
            name: 'Sarah Johnson',
            avatar: '/api/placeholder/32/32'
          },
          attendees: 45,
          maxAttendees: 100,
          isPublic: true,
          category: 'Social',
          tags: ['meetup', 'networking']
        }
      ];
      
      setPosts(mockPosts);
      setEvents(mockEvents);
    } catch (err) {
      console.error('Error loading community content:', err);
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    try {
      // Mock join community
      setCommunities(prev => 
        prev.map(c => 
          c.id === communityId 
            ? { ...c, isJoined: true, memberCount: c.memberCount + 1 }
            : c
        )
      );
      
      toast({
        title: "Joined Community",
        description: "You have successfully joined the community!",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to join community",
        variant: "destructive",
      });
    }
  };

  const handleLeaveCommunity = async (communityId: string) => {
    try {
      // Mock leave community
      setCommunities(prev => 
        prev.map(c => 
          c.id === communityId 
            ? { ...c, isJoined: false, memberCount: c.memberCount - 1 }
            : c
        )
      );
      
      toast({
        title: "Left Community",
        description: "You have left the community",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to leave community",
        variant: "destructive",
      });
    }
  };

  const handleCreatePost = async (postData: Partial<CommunityPost>) => {
    try {
      // Mock create post
      const newPost: CommunityPost = {
        id: Date.now().toString(),
        title: postData.title || '',
        content: postData.content || '',
        author: {
          id: user?.id || '',
          name: user?.user_metadata?.full_name || 'Anonymous',
          avatar: user?.user_metadata?.avatar_url,
          isModerator: false
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: 0,
        comments: 0,
        shares: 0,
        tags: postData.tags || [],
        isPinned: false,
        isLocked: false
      };
      
      setPosts(prev => [newPost, ...prev]);
      setShowCreateDialog(false);
      
      toast({
        title: "Post Created",
        description: "Your post has been published successfully!",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    }
  };

  // Filter communities based on search and filters
  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         community.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         community.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || community.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort communities
  const sortedCommunities = [...filteredCommunities].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.memberCount - a.memberCount;
      case 'trending':
        return b.postCount - a.postCount;
      case 'recent':
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });

  const renderCommunityCard = (community: Community) => (
    <Card key={community.id} className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={community.avatar} />
              <AvatarFallback>{community.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{community.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {community.memberCount} members
                {community.location && (
                  <>
                    <span>•</span>
                    <MapPin className="w-4 h-4" />
                    {community.location.city}
                  </>
                )}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {community.isPrivate && <Lock className="w-4 h-4 text-gray-500" />}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedCommunity(community)}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-3">{community.description}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {community.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <Badge variant="outline">{community.category}</Badge>
          <Button
            variant={community.isJoined ? "outline" : "default"}
            size="sm"
            onClick={() => 
              community.isJoined 
                ? handleLeaveCommunity(community.id)
                : handleJoinCommunity(community.id)
            }
          >
            {community.isJoined ? 'Leave' : 'Join'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderCommunityOverview = () => (
    <div className="space-y-6">
      {/* Community Header */}
      {selectedCommunity && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={selectedCommunity.avatar} />
                <AvatarFallback>{selectedCommunity.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl">{selectedCommunity.name}</CardTitle>
                <CardDescription className="text-base">
                  {selectedCommunity.description}
                </CardDescription>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{selectedCommunity.memberCount} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">{selectedCommunity.postCount} posts</span>
                  </div>
                  {selectedCommunity.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{selectedCommunity.location.city}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold">{selectedCommunity?.memberCount || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Posts</p>
                <p className="text-2xl font-bold">{selectedCommunity?.postCount || 0}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Events</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest posts and updates from the community</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {posts.slice(0, 3).map(post => (
              <div key={post.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={post.author.avatar} />
                  <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{post.author.name}</h4>
                    {post.author.isModerator && (
                      <Badge variant="secondary" className="text-xs">Moderator</Badge>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h5 className="font-medium text-sm mb-1">{post.title}</h5>
                  <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span className="text-xs">{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-xs">{post.comments}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 className="w-4 h-4" />
                      <span className="text-xs">{post.shares}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCommunityPosts = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Community Posts</h3>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Post
        </Button>
      </div>
      
      <div className="space-y-4">
        {posts.map(post => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{post.author.name}</h4>
                      {post.author.isModerator && (
                        <Badge variant="secondary" className="text-xs">Moderator</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {post.isPinned && <Badge variant="default">Pinned</Badge>}
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <h5 className="font-semibold text-lg mb-2">{post.title}</h5>
              <p className="text-gray-700 mb-4">{post.content}</p>
              <div className="flex flex-wrap gap-1 mb-4">
                {post.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm">
                    <Heart className="w-4 h-4 mr-1" />
                    {post.likes}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {post.comments}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4 mr-1" />
                    {post.shares}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Bookmark className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCommunityEvents = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Community Events</h3>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map(event => (
          <Card key={event.id}>
            <CardHeader>
              <CardTitle className="text-lg">{event.title}</CardTitle>
              <CardDescription>{event.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{event.date} at {event.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{event.attendees} attendees</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <Badge variant="outline">{event.category}</Badge>
                <Button size="sm">Join Event</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCommunityMembers = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Community Members</h3>
        <div className="flex items-center gap-2">
          <Input placeholder="Search members..." className="w-64" />
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedCommunity?.moderators.map(moderator => (
          <Card key={moderator.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={moderator.avatar} />
                  <AvatarFallback>{moderator.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{moderator.name}</h4>
                    <Badge variant="default" className="text-xs">Moderator</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Community Moderator</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (error) {
    return (
      <ResponsiveLayout>
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Communities</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedCommunity ? selectedCommunity.name : 'Communities'}
            </h1>
            <p className="text-gray-600">
              {selectedCommunity 
                ? 'Connect with community members and participate in discussions'
                : 'Discover and join local communities'
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Community
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search communities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Arts & Culture">Arts & Culture</SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Business">Business</SelectItem>
              <SelectItem value="Sports">Sports</SelectItem>
              <SelectItem value="Education">Education</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="trending">Trending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Community Content */}
        {selectedCommunity ? (
          <div className="space-y-6">
            {/* Back Button */}
            <Button
              variant="outline"
              onClick={() => setSelectedCommunity(null)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Communities
            </Button>

            {/* Community Tabs */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {renderCommunityOverview()}
              </TabsContent>

              <TabsContent value="posts" className="space-y-6">
                {renderCommunityPosts()}
              </TabsContent>

              <TabsContent value="events" className="space-y-6">
                {renderCommunityEvents()}
              </TabsContent>

              <TabsContent value="members" className="space-y-6">
                {renderCommunityMembers()}
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          /* Communities List */
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {sortedCommunities.map(renderCommunityCard)}
          </div>
        )}

        {/* Create Post Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
              <DialogDescription>
                Share something with the community
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Enter post title" />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea id="content" placeholder="What's on your mind?" rows={4} />
              </div>
              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input id="tags" placeholder="Enter tags separated by commas" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleCreatePost({})}>
                  Create Post
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ResponsiveLayout>
  );
};

export default ConsolidatedCommunity;