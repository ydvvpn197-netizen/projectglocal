import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Heart, 
  Star, 
  TrendingUp, 
  Zap, 
  Target, 
  Award, 
  Crown,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  Bookmark,
  BookmarkCheck,
  Plus,
  Minus,
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Settings,
  Filter,
  Search,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Key,
  Activity,
  TrendingDown,
  BarChart3,
  Trophy,
  Medal,
  Gem,
  Flame,
  Snowflake,
  Leaf,
  TreePine,
  Flower
} from 'lucide-react';

interface CommunityRecommendation {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  activityLevel: number;
  matchScore: number;
  image?: string;
  tags: string[];
  isJoined: boolean;
  isRecommended: boolean;
  lastActivity: string;
  location: string;
  type: 'public' | 'private' | 'invite_only';
}

interface RecommendationFilters {
  categories: string[];
  minMembers: number;
  maxMembers: number;
  activityLevel: 'low' | 'medium' | 'high' | 'all';
  location: string;
  type: 'all' | 'public' | 'private' | 'invite_only';
}

interface CommunityRecommendationSystemProps {
  className?: string;
}

export const CommunityRecommendationSystem: React.FC<CommunityRecommendationSystemProps> = ({ 
  className 
}) => {
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<CommunityRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recommended');
  const [filters, setFilters] = useState<RecommendationFilters>({
    categories: [],
    minMembers: 0,
    maxMembers: 10000,
    activityLevel: 'all',
    location: '',
    type: 'all'
  });

  // Mock data for recommendations
  const mockRecommendations: CommunityRecommendation[] = [
    {
      id: '1',
      name: 'Local Food Enthusiasts',
      description: 'Discovering the best local restaurants and food spots in our area',
      category: 'Food & Dining',
      memberCount: 1250,
      activityLevel: 85,
      matchScore: 92,
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=200&fit=crop',
      tags: ['food', 'restaurants', 'local', 'dining'],
      isJoined: false,
      isRecommended: true,
      lastActivity: '2 hours ago',
      location: 'Downtown',
      type: 'public'
    },
    {
      id: '2',
      name: 'Tech Entrepreneurs',
      description: 'Connecting local tech professionals and entrepreneurs',
      memberCount: 890,
      activityLevel: 78,
      matchScore: 88,
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop',
      tags: ['tech', 'entrepreneurship', 'startups', 'networking'],
      isJoined: false,
      isRecommended: true,
      lastActivity: '1 hour ago',
      location: 'Tech District',
      type: 'public'
    },
    {
      id: '3',
      name: 'Art & Culture Lovers',
      description: 'Exploring local art galleries, museums, and cultural events',
      memberCount: 650,
      activityLevel: 72,
      matchScore: 85,
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=200&fit=crop',
      tags: ['art', 'culture', 'museums', 'galleries'],
      isJoined: true,
      isRecommended: false,
      lastActivity: '30 minutes ago',
      location: 'Arts Quarter',
      type: 'public'
    }
  ];

  useEffect(() => {
    const loadRecommendations = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRecommendations(mockRecommendations);
      } catch (error) {
        console.error('Error loading recommendations:', error);
        toast({
          title: "Error",
          description: "Failed to load community recommendations",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [toast]);

  const handleJoinCommunity = useCallback(async (communityId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRecommendations(prev => 
        prev.map(community => 
          community.id === communityId 
            ? { ...community, isJoined: true }
            : community
        )
      );

      toast({
        title: "Success",
        description: "You've joined the community!",
      });
    } catch (error) {
      console.error('Error joining community:', error);
      toast({
        title: "Error",
        description: "Failed to join community",
        variant: "destructive"
      });
    }
  }, [toast]);

  const handleLeaveCommunity = useCallback(async (communityId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRecommendations(prev => 
        prev.map(community => 
          community.id === communityId 
            ? { ...community, isJoined: false }
            : community
        )
      );

      toast({
        title: "Success",
        description: "You've left the community",
      });
    } catch (error) {
      console.error('Error leaving community:', error);
      toast({
        title: "Error",
        description: "Failed to leave community",
        variant: "destructive"
      });
    }
  }, [toast]);

  const filteredRecommendations = recommendations.filter(community => {
    if (filters.categories.length > 0 && !filters.categories.includes(community.category)) {
      return false;
    }
    if (community.memberCount < filters.minMembers || community.memberCount > filters.maxMembers) {
      return false;
    }
    if (filters.activityLevel !== 'all') {
      const activityThreshold = filters.activityLevel === 'low' ? 30 : 
                               filters.activityLevel === 'medium' ? 60 : 80;
      if (community.activityLevel < activityThreshold) {
        return false;
      }
    }
    if (filters.type !== 'all' && community.type !== filters.type) {
      return false;
    }
    return true;
  });

  const recommendedCommunities = filteredRecommendations.filter(c => c.isRecommended);
  const joinedCommunities = filteredRecommendations.filter(c => c.isJoined);
  const allCommunities = filteredRecommendations;

  const renderCommunityCard = (community: CommunityRecommendation) => (
    <Card key={community.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={community.image || '/placeholder.svg'}
              alt={community.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg truncate">{community.name}</h3>
                <p className="text-sm text-muted-foreground truncate">{community.description}</p>
              </div>
              <Badge variant={community.isRecommended ? "default" : "secondary"}>
                {community.isRecommended ? "Recommended" : "Joined"}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{community.memberCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Activity className="w-4 h-4" />
                <span>{community.activityLevel}%</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Target className="w-4 h-4" />
                <span>{community.matchScore}% match</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className="text-xs">
                {community.category}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {community.location}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {community.type}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={community.isJoined ? "outline" : "default"}
                  size="sm"
                  onClick={() => community.isJoined ? handleLeaveCommunity(community.id) : handleJoinCommunity(community.id)}
                >
                  {community.isJoined ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Leave
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Join
                    </>
                  )}
                </Button>
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                {community.lastActivity}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Community Recommendations</h2>
          <p className="text-muted-foreground">
            Discover communities that match your interests
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          <TabsTrigger value="joined">Joined</TabsTrigger>
          <TabsTrigger value="all">All Communities</TabsTrigger>
        </TabsList>

        <TabsContent value="recommended" className="space-y-4">
          <div className="grid gap-4">
            {recommendedCommunities.map(renderCommunityCard)}
          </div>
        </TabsContent>

        <TabsContent value="joined" className="space-y-4">
          <div className="grid gap-4">
            {joinedCommunities.map(renderCommunityCard)}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {allCommunities.map(renderCommunityCard)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};