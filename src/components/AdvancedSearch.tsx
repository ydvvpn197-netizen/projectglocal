import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Calendar, Users, Star, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

interface SearchResult {
  id: string;
  type: 'artist' | 'event' | 'post' | 'group';
  title: string;
  description?: string;
  image?: string;
  rating?: number;
  price?: number;
  location?: string;
  date?: string;
  distance?: number;
  tags?: string[];
}

export const AdvancedSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    priceRange: [0, 1000],
    rating: 0,
    distance: 50,
    dateRange: 'all',
    tags: [] as string[]
  });
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();
  const { currentLocation } = useLocation();

  const categories = {
    artist: ['Photographer', 'Musician', 'DJ', 'Chef', 'Designer', 'Writer', 'Performer'],
    event: ['Music', 'Food', 'Art', 'Sports', 'Business', 'Education', 'Entertainment'],
    post: ['News', 'Discussion', 'Question', 'Announcement', 'Review'],
    group: ['Hobby', 'Professional', 'Community', 'Interest', 'Location-based']
  };

  const searchAll = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const results: SearchResult[] = [];
      
      // Search artists
      if (filters.type === 'all' || filters.type === 'artist') {
        const { data: artists } = await supabase
          .from('artists')
          .select(`
            id,
            specialty,
            hourly_rate_min,
            hourly_rate_max,
            bio,
            profiles!inner (
              full_name,
              avatar_url,
              location_city,
              location_state,
              latitude,
              longitude
            )
          `)
          .or(`specialty.ilike.%${query}%,bio.ilike.%${query}%`)
          .eq('is_available', true);

        artists?.forEach(artist => {
          const distance = calculateDistance(
            currentLocation?.latitude,
            currentLocation?.longitude,
            artist.profiles.latitude,
            artist.profiles.longitude
          );
          
          if (distance <= filters.distance) {
            results.push({
              id: artist.id,
              type: 'artist',
              title: artist.profiles.full_name || 'Anonymous',
              description: artist.bio,
              image: artist.profiles.avatar_url,
              price: artist.hourly_rate_min,
              location: `${artist.profiles.location_city}, ${artist.profiles.location_state}`,
              distance,
              tags: artist.specialty
            });
          }
        });
      }

      // Search events
      if (filters.type === 'all' || filters.type === 'event') {
        const { data: events } = await supabase
          .from('events')
          .select(`
            id,
            title,
            description,
            event_date,
            event_time,
            location_name,
            location_city,
            category,
            price,
            image_url,
            tags
          `)
          .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
          .gte('event_date', new Date().toISOString().split('T')[0]);

        events?.forEach(event => {
          results.push({
            id: event.id,
            type: 'event',
            title: event.title,
            description: event.description,
            image: event.image_url,
            price: event.price,
            location: event.location_name,
            date: `${event.event_date} ${event.event_time}`,
            tags: event.tags
          });
        });
      }

      // Search posts
      if (filters.type === 'all' || filters.type === 'post') {
        const { data: posts } = await supabase
          .from('posts')
          .select(`
            id,
            title,
            content,
            type,
            created_at,
            profiles!inner (
              full_name,
              avatar_url
            )
          `)
          .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
          .eq('status', 'active');

        posts?.forEach(post => {
          results.push({
            id: post.id,
            type: 'post',
            title: post.title || 'Untitled Post',
            description: post.content.substring(0, 100) + '...',
            image: post.profiles.avatar_url,
            date: post.created_at,
            tags: post.type ? [post.type] : []
          });
        });
      }

      // Search groups
      if (filters.type === 'all' || filters.type === 'group') {
        const { data: groups } = await supabase
          .from('groups')
          .select(`
            id,
            name,
            description,
            category,
            created_at
          `)
          .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`);

        groups?.forEach(group => {
          results.push({
            id: group.id,
            type: 'group',
            title: group.name,
            description: group.description,
            date: group.created_at,
            tags: group.category ? [group.category] : []
          });
        });
      }

      // Apply filters
      let filteredResults = results.filter(result => {
        if (filters.category !== 'all' && result.tags) {
          return result.tags.some(tag => 
            tag.toLowerCase().includes(filters.category.toLowerCase())
          );
        }
        if (filters.priceRange && result.price) {
          return result.price >= filters.priceRange[0] && result.price <= filters.priceRange[1];
        }
        return true;
      });

      // Sort by relevance and distance
      filteredResults.sort((a, b) => {
        if (a.distance && b.distance) {
          return a.distance - b.distance;
        }
        return 0;
      });

      setResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        searchAll();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query, filters]);

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'artist': return <Star className="h-4 w-4" />;
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'post': return <Users className="h-4 w-4" />;
      case 'group': return <Users className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search artists, events, posts, groups..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Search Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="artist">Artists</SelectItem>
                    <SelectItem value="event">Events</SelectItem>
                    <SelectItem value="post">Posts</SelectItem>
                    <SelectItem value="group">Groups</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {filters.type !== 'all' && categories[filters.type as keyof typeof categories]?.map(cat => (
                      <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Max Distance: {filters.distance}km</label>
                <Slider
                  value={[filters.distance]}
                  onValueChange={([value]) => setFilters({...filters, distance: value})}
                  max={100}
                  min={1}
                  step={1}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}</label>
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => setFilters({...filters, priceRange: value as [number, number]})}
                  max={1000}
                  min={0}
                  step={10}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <div className="space-y-4">
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Searching...</p>
          </div>
        )}

        {!loading && results.length === 0 && query && (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No results found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms or filters</p>
          </div>
        )}

        {results.map((result) => (
          <Card key={`${result.type}-${result.id}`} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={result.image} />
                  <AvatarFallback>{result.title.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getResultIcon(result.type)}
                    <Badge variant="secondary" className="text-xs">
                      {result.type}
                    </Badge>
                    <h3 className="font-semibold truncate">{result.title}</h3>
                  </div>
                  
                  {result.description && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {result.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {result.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {result.location}
                      </div>
                    )}
                    {result.distance && (
                      <span>{result.distance.toFixed(1)}km away</span>
                    )}
                    {result.price && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        ${result.price}/hr
                      </div>
                    )}
                    {result.date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(result.date), 'MMM dd, yyyy')}
                      </div>
                    )}
                  </div>
                  
                  {result.tags && result.tags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {result.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
