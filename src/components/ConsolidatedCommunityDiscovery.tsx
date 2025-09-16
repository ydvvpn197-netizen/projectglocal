import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Plus, 
  Users, 
  MessageCircle, 
  Calendar, 
  MapPin, 
  Star, 
  TrendingUp,
  Flame,
  Building2,
  Store,
  Heart,
  Share2,
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  member_count: number;
  post_count: number;
  location_city?: string;
  created_at: string;
  featured?: boolean;
  image?: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  maxAttendees: number;
  price: string;
  category: string;
  featured?: boolean;
  image?: string;
}

interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  rating: number;
  reviews: number;
  featured?: boolean;
  image?: string;
}

interface ConsolidatedCommunityDiscoveryProps {
  className?: string;
}

export const ConsolidatedCommunityDiscovery: React.FC<ConsolidatedCommunityDiscoveryProps> = ({
  className = '',
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('communities');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock data - replace with real data from hooks
  const communities: Community[] = [
    {
      id: '1',
      name: 'Local Artists Collective',
      description: 'Supporting and promoting local artists in our community',
      category: 'Arts',
      member_count: 234,
      post_count: 45,
      location_city: 'Downtown',
      created_at: '2024-01-15',
      featured: true,
    },
    {
      id: '2',
      name: 'Tech Enthusiasts',
      description: 'Discussing the latest in technology and innovation',
      category: 'Technology',
      member_count: 189,
      post_count: 32,
      location_city: 'Tech Hub',
      created_at: '2024-02-01',
      featured: false,
    },
    {
      id: '3',
      name: 'Sustainable Living',
      description: 'Sharing tips and ideas for eco-friendly living',
      category: 'Lifestyle',
      member_count: 156,
      post_count: 28,
      location_city: 'Green District',
      created_at: '2024-01-20',
      featured: true,
    },
  ];

  const events: Event[] = [
    {
      id: '1',
      title: 'Local Music Festival 2024',
      description: 'A three-day celebration of local music talent',
      date: 'Dec 15-17, 2024',
      time: '12:00 PM - 11:00 PM',
      location: 'Central Park',
      attendees: 1250,
      maxAttendees: 2000,
      price: '$45',
      category: 'Music',
      featured: true,
    },
    {
      id: '2',
      title: 'Community Garden Workshop',
      description: 'Learn sustainable gardening techniques',
      date: 'Dec 20, 2024',
      time: '2:00 PM - 5:00 PM',
      location: 'Community Center',
      attendees: 45,
      maxAttendees: 60,
      price: 'Free',
      category: 'Education',
      featured: false,
    },
  ];

  const businesses: Business[] = [
    {
      id: '1',
      name: 'Downtown Brew',
      description: 'Artisanal coffee and pastries in the heart of downtown',
      category: 'Food & Drink',
      location: '123 Main St',
      rating: 4.8,
      reviews: 156,
      featured: true,
    },
    {
      id: '2',
      name: 'Tech Solutions Inc',
      description: 'Local IT services and computer repair',
      category: 'Technology',
      location: '456 Tech Ave',
      rating: 4.6,
      reviews: 89,
      featured: false,
    },
  ];

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBusinesses = businesses.filter(business =>
    business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    business.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCommunityCard = (community: Community) => (
    <Card key={community.id} className="group cursor-pointer hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{community.name}</h3>
              {community.featured && (
                <Badge className="bg-yellow-500 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {community.description}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {community.member_count} members
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            {community.post_count} posts
          </span>
          {community.location_city && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {community.location_city}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            #{community.category}
          </Badge>
          <Button 
            className="btn-community"
            onClick={() => navigate(`/community/${community.id}`)}
          >
            <Users className="w-4 h-4 mr-2" />
            Join Community
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderEventCard = (event: Event) => (
    <Card key={event.id} className="group cursor-pointer hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{event.title}</h3>
              {event.featured && (
                <Badge className="bg-orange-500 text-white">
                  <Flame className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {event.description}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {event.date}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {event.location}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {event.attendees}/{event.maxAttendees}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            #{event.category}
          </Badge>
          <Button 
            className="btn-event"
            onClick={() => navigate(`/event/${event.id}`)}
          >
            <Calendar className="w-4 h-4 mr-2" />
            {event.price === 'Free' ? 'Free' : `$${event.price}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderBusinessCard = (business: Business) => (
    <Card key={business.id} className="group cursor-pointer hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{business.name}</h3>
              {business.featured && (
                <Badge className="bg-green-500 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {business.description}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {business.location}
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            {business.rating} ({business.reviews} reviews)
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            #{business.category}
          </Badge>
          <Button 
            className="btn-business"
            onClick={() => navigate(`/business/${business.id}`)}
          >
            <Store className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Discover</h1>
          <p className="text-muted-foreground mt-2">
            Find communities, events, and businesses in your area
          </p>
        </div>
        <Button className="btn-community" asChild>
          <Link to="/create">
            <Plus className="w-4 h-4 mr-2" />
            Create
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search communities, events, businesses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="communities" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Communities
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="businesses" className="flex items-center gap-2">
            <Store className="w-4 h-4" />
            Businesses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="communities" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Communities</h2>
            <span className="text-sm text-muted-foreground">
              {filteredCommunities.length} communities found
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.map(renderCommunityCard)}
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Events</h2>
            <span className="text-sm text-muted-foreground">
              {filteredEvents.length} events found
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(renderEventCard)}
          </div>
        </TabsContent>

        <TabsContent value="businesses" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Businesses</h2>
            <span className="text-sm text-muted-foreground">
              {filteredBusinesses.length} businesses found
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map(renderBusinessCard)}
          </div>
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {searchQuery && filteredCommunities.length === 0 && filteredEvents.length === 0 && filteredBusinesses.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or create something new
            </p>
            <Button className="btn-community" asChild>
              <Link to="/create">
                <Plus className="w-4 h-4 mr-2" />
                Create New
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConsolidatedCommunityDiscovery;
