import React, { useState, useEffect, useCallback } from 'react';
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
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { useToast } from '@/hooks/use-toast';
import { LocalCommunityService, LocalCommunity } from '@/services/localCommunityService';
import { 
  MapPin, 
  Users, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  Building2,
  Heart,
  MessageSquare,
  Calendar,
  BarChart3,
  Globe,
  Star,
  Eye,
  EyeOff
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const LocalCommunities = () => {
  const { user } = useAuth();
  const { currentLocation } = useLocation();
  const { toast } = useToast();
  const [communities, setCommunities] = useState<LocalCommunity[]>([]);
  const [trendingCommunities, setTrendingCommunities] = useState<LocalCommunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [activeTab, setActiveTab] = useState('nearby');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    location_city: '',
    location_state: '',
    location_country: 'India'
  });

  const cities = [
    { value: 'all', label: 'All Cities' },
    { value: 'Delhi', label: 'Delhi' },
    { value: 'Mumbai', label: 'Mumbai' },
    { value: 'Bangalore', label: 'Bangalore' },
    { value: 'Chennai', label: 'Chennai' },
    { value: 'Kolkata', label: 'Kolkata' },
    { value: 'Hyderabad', label: 'Hyderabad' },
    { value: 'Pune', label: 'Pune' }
  ];

  const loadCommunities = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading communities...', { activeTab, selectedCity, currentLocation });
      let result;

      if (activeTab === 'nearby' && currentLocation) {
        result = await LocalCommunityService.getNearbyCommunities(
          currentLocation.latitude,
          currentLocation.longitude,
          50,
          20
        );
      } else if (selectedCity !== 'all') {
        result = await LocalCommunityService.getCommunitiesByCity(selectedCity, undefined, 20);
      } else {
        result = await LocalCommunityService.getCommunitiesByCity('Delhi', undefined, 20);
      }

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      setCommunities(result.communities);
      console.log('Communities loaded successfully:', result.communities.length);
    } catch (error) {
      console.error('Error loading communities:', error);
      toast({
        title: "Error",
        description: "Failed to load communities.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedCity, currentLocation]);

  const loadTrendingCommunities = useCallback(async () => {
    try {
      const result = await LocalCommunityService.getTrendingCommunities(10);
      if (!result.error) {
        setTrendingCommunities(result.communities);
      }
    } catch (error) {
      console.error('Error loading trending communities:', error);
    }
  }, []);

  useEffect(() => {
    console.log('LocalCommunities useEffect triggered', { activeTab, selectedCity, currentLocation });
    loadCommunities();
    loadTrendingCommunities();
  }, [activeTab, selectedCity, currentLocation, loadCommunities, loadTrendingCommunities]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadCommunities();
      return;
    }

    try {
      setLoading(true);
      const result = await LocalCommunityService.searchCommunities(searchQuery.trim(), 20);
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      setCommunities(result.communities);
    } catch (error) {
      console.error('Error searching communities:', error);
      toast({
        title: "Error",
        description: "Failed to search communities.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to join communities.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await LocalCommunityService.joinCommunity(communityId);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "You've joined the community!",
        });
        loadCommunities(); // Refresh communities
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to join community.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error joining community:', error);
      toast({
        title: "Error",
        description: "Failed to join community.",
        variant: "destructive",
      });
    }
  };

  const handleLeaveCommunity = async (communityId: string) => {
    if (!user) {
      return;
    }

    try {
      const result = await LocalCommunityService.leaveCommunity(communityId);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "You've left the community.",
        });
        loadCommunities(); // Refresh communities
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to leave community.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error leaving community:', error);
      toast({
        title: "Error",
        description: "Failed to leave community.",
        variant: "destructive",
      });
    }
  };

  const handleCreateCommunity = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to create communities.",
        variant: "destructive",
      });
      return;
    }

    if (!newCommunity.name.trim() || !newCommunity.location_city.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);
      const result = await LocalCommunityService.createCommunity({
        name: newCommunity.name.trim(),
        description: newCommunity.description.trim() || undefined,
        location_city: newCommunity.location_city.trim(),
        location_state: newCommunity.location_state.trim() || undefined,
        location_country: newCommunity.location_country
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Community created successfully!",
        });
        setIsCreateDialogOpen(false);
        setNewCommunity({
          name: '',
          description: '',
          location_city: '',
          location_state: '',
          location_country: 'India'
        });
        loadCommunities(); // Refresh communities
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create community.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating community:', error);
      toast({
        title: "Error",
        description: "Failed to create community.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const CommunityCard = ({ community }: { community: LocalCommunity }) => (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {community.name}
            </CardTitle>
            <CardDescription className="mt-2">
              {community.description || 'No description available'}
            </CardDescription>
          </div>
          <Badge variant={community.is_active ? "default" : "secondary"}>
            {community.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Community Info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{community.location_city}, {community.location_state}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{community.member_count} members</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatDistanceToNow(new Date(community.created_at), { addSuffix: true })}</span>
          </div>
        </div>

        {/* Creator Info */}
        {community.creator_name && (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={community.creator_avatar} />
              <AvatarFallback>{community.creator_name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">Created by {community.creator_name}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {community.location_country}
            </Badge>
          </div>
          {user ? (
            community.user_is_member ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLeaveCommunity(community.id)}
              >
                Leave
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => handleJoinCommunity(community.id)}
                className="btn-event"
              >
                Join Community
              </Button>
            )
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled
            >
              Sign in to join
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ResponsiveLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Local Communities</h1>
            <p className="text-muted-foreground mt-2">
              Discover and join local communities in your area
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-event">
                <Plus className="w-4 h-4 mr-2" />
                Create Community
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Community</DialogTitle>
                <DialogDescription>
                  Create a new local community to connect with people in your area.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Community Name *</Label>
                  <Input
                    id="name"
                    value={newCommunity.name}
                    onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                    placeholder="Enter community name"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newCommunity.description}
                    onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                    placeholder="Describe your community..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={newCommunity.location_city}
                      onChange={(e) => setNewCommunity({ ...newCommunity, location_city: e.target.value })}
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={newCommunity.location_state}
                      onChange={(e) => setNewCommunity({ ...newCommunity, location_state: e.target.value })}
                      placeholder="Enter state"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateCommunity}
                    disabled={creating}
                    className="flex-1"
                  >
                    {creating ? 'Creating...' : 'Create Community'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search communities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.value} value={city.value}>
                      {city.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} className="btn-event">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Communities Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="nearby" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Nearby ({communities.length})
            </TabsTrigger>
            <TabsTrigger value="city" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              By City
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trending
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nearby" className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-muted rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-full mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : communities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {communities.map((community) => (
                  <CommunityCard key={community.id} community={community} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Nearby Communities Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {currentLocation 
                      ? "No communities found in your area. Be the first to create one!"
                      : "Enable location access to find nearby communities."}
                  </p>
                  <Button className="btn-event" onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Community
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="city" className="space-y-6">
            <div className="flex justify-center mb-6">
              <Button onClick={loadCommunities} className="btn-event">
                Load Communities
              </Button>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-muted rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-full mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : communities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {communities.map((community) => (
                  <CommunityCard key={community.id} community={community} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Communities Found</h3>
                  <p className="text-muted-foreground mb-4">
                    No communities found in the selected city.
                  </p>
                  <Button className="btn-event" onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Community
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            {trendingCommunities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingCommunities.map((community) => (
                  <CommunityCard key={community.id} community={community} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Trending Communities</h3>
                  <p className="text-muted-foreground mb-4">
                    No trending communities available at the moment.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Community Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{communities.length}</div>
                <div className="text-sm text-muted-foreground">Total Communities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {communities.reduce((sum, c) => sum + c.member_count, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{trendingCommunities.length}</div>
                <div className="text-sm text-muted-foreground">Trending Communities</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsiveLayout>
  );
};

export default LocalCommunities;
