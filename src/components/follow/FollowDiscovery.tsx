import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MapPin, 
  Heart, 
  TrendingUp,
  Star,
  UserPlus,
  Search,
  Filter,
  RefreshCw,
  Globe,
  Building,
  Calendar,
  MessageCircle
} from 'lucide-react';
import { useFollowing } from '@/hooks/useFollowing';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FollowDiscoveryProps {
  className?: string;
}

interface DiscoveryUser {
  id: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  location?: {
    city: string;
    state: string;
    country: string;
  };
  interests: string[];
  followersCount: number;
  isVerified: boolean;
  lastActivity: string;
  mutualConnections: number;
  commonInterests: string[];
  reason: string;
}

export const FollowDiscovery = ({ className }: FollowDiscoveryProps) => {
  const { user } = useAuth();
  const { followUser } = useFollowing();
  
  const [activeTab, setActiveTab] = useState('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [interestFilter, setInterestFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [discoveryUsers, setDiscoveryUsers] = useState<DiscoveryUser[]>([]);

  const mockDiscoveryUsers: DiscoveryUser[] = [
    {
      id: '1',
      displayName: 'Sarah Johnson',
      username: 'sarahj',
      avatarUrl: undefined,
      bio: 'Local artist and community organizer',
      location: { city: 'San Francisco', state: 'CA', country: 'USA' },
      interests: ['Art', 'Community', 'Events'],
      followersCount: 1250,
      isVerified: true,
      lastActivity: new Date().toISOString(),
      mutualConnections: 3,
      commonInterests: ['Art', 'Community'],
      reason: 'Active in your area with similar interests'
    },
    {
      id: '2',
      displayName: 'Mike Chen',
      username: 'mikechen',
      avatarUrl: undefined,
      bio: 'Tech entrepreneur and startup founder',
      location: { city: 'San Francisco', state: 'CA', country: 'USA' },
      interests: ['Technology', 'Startups', 'Innovation'],
      followersCount: 890,
      isVerified: false,
      lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      mutualConnections: 1,
      commonInterests: ['Technology'],
      reason: 'Popular in your network'
    },
    {
      id: '3',
      displayName: 'Emma Rodriguez',
      username: 'emmar',
      avatarUrl: undefined,
      bio: 'Environmental activist and sustainability advocate',
      location: { city: 'Oakland', state: 'CA', country: 'USA' },
      interests: ['Environment', 'Sustainability', 'Community'],
      followersCount: 2100,
      isVerified: true,
      lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      mutualConnections: 5,
      commonInterests: ['Community', 'Environment'],
      reason: 'Highly active with shared interests'
    },
    {
      id: '4',
      displayName: 'David Park',
      username: 'davidpark',
      avatarUrl: undefined,
      bio: 'Local business owner and community leader',
      location: { city: 'Berkeley', state: 'CA', country: 'USA' },
      interests: ['Business', 'Community', 'Leadership'],
      followersCount: 450,
      isVerified: false,
      lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      mutualConnections: 2,
      commonInterests: ['Community', 'Business'],
      reason: 'Local business leader'
    }
  ];

  useEffect(() => {
    setDiscoveryUsers(mockDiscoveryUsers);
  }, []);

  const handleFollow = async (userId: string) => {
    try {
      setLoading(true);
      await followUser(userId);
      // Remove from discovery list after following
      setDiscoveryUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = discoveryUsers.filter(user => {
    const matchesSearch = !searchQuery || 
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.interests.some(interest => 
        interest.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesLocation = locationFilter === 'all' || 
      (user.location && user.location.city.toLowerCase().includes(locationFilter.toLowerCase()));

    const matchesInterest = interestFilter === 'all' || 
      user.interests.some(interest => 
        interest.toLowerCase().includes(interestFilter.toLowerCase())
      );

    return matchesSearch && matchesLocation && matchesInterest;
  });

  const renderUserCard = (discoveryUser: DiscoveryUser) => (
    <div
      key={discoveryUser.id}
      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-3 flex-1">
        <Avatar className="h-12 w-12">
          <AvatarImage src={discoveryUser.avatarUrl} />
          <AvatarFallback>
            {discoveryUser.displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold truncate">{discoveryUser.displayName}</h4>
            <span className="text-sm text-muted-foreground">@{discoveryUser.username}</span>
            {discoveryUser.isVerified && (
              <Badge variant="secondary" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
          
          {discoveryUser.bio && (
            <p className="text-sm text-muted-foreground truncate mb-2">
              {discoveryUser.bio}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
            {discoveryUser.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {discoveryUser.location.city}, {discoveryUser.location.state}
              </span>
            )}
            
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {discoveryUser.followersCount.toLocaleString()} followers
            </span>
            
            {discoveryUser.mutualConnections > 0 && (
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {discoveryUser.mutualConnections} mutual
              </span>
            )}
          </div>

          {discoveryUser.commonInterests.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {discoveryUser.commonInterests.slice(0, 3).map(interest => (
                <Badge key={interest} variant="outline" className="text-xs">
                  {interest}
                </Badge>
              ))}
              {discoveryUser.commonInterests.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{discoveryUser.commonInterests.length - 3} more
                </Badge>
              )}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            {discoveryUser.reason}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => handleFollow(discoveryUser.id)}
          disabled={loading}
          className="flex items-center gap-1"
        >
          <UserPlus className="h-4 w-4" />
          Follow
        </Button>
      </div>
    </div>
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Discover People
        </CardTitle>
        <CardDescription>
          Find interesting people in your community and beyond
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, bio, or interests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="san francisco">San Francisco</SelectItem>
                <SelectItem value="oakland">Oakland</SelectItem>
                <SelectItem value="berkeley">Berkeley</SelectItem>
              </SelectContent>
            </Select>

            <Select value={interestFilter} onValueChange={setInterestFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Interest" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Interests</SelectItem>
                <SelectItem value="art">Art</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="community">Community</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="environment">Environment</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => setDiscoveryUsers(mockDiscoveryUsers)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Discovery Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="nearby" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Nearby
            </TabsTrigger>
            <TabsTrigger value="interests" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Interests
            </TabsTrigger>
            <TabsTrigger value="verified" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Verified
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trending" className="space-y-4">
            {filteredUsers
              .sort((a, b) => b.followersCount - a.followersCount)
              .map(renderUserCard)
            }
          </TabsContent>

          <TabsContent value="nearby" className="space-y-4">
            {filteredUsers
              .filter(user => user.location?.city === 'San Francisco' || user.location?.city === 'Oakland')
              .map(renderUserCard)
            }
          </TabsContent>

          <TabsContent value="interests" className="space-y-4">
            {filteredUsers
              .filter(user => user.commonInterests.length > 0)
              .sort((a, b) => b.commonInterests.length - a.commonInterests.length)
              .map(renderUserCard)
            }
          </TabsContent>

          <TabsContent value="verified" className="space-y-4">
            {filteredUsers
              .filter(user => user.isVerified)
              .map(renderUserCard)
            }
          </TabsContent>
        </Tabs>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? 'No users match your search' : 'No users found'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FollowDiscovery;
