import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchResult } from '@/types/search';
import { MapPin, Calendar, Star, Users, Heart, MessageCircle, Share2, ExternalLink, Filter } from 'lucide-react';
import { format } from 'date-fns';

interface SearchResultsProps {
  results: SearchResult[];
  loading?: boolean;
  onResultClick?: (result: SearchResult) => void;
  onLoadMore?: () => void;
}

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'date', label: 'Newest First' },
  { value: 'popularity', label: 'Most Popular' },
  { value: 'distance', label: 'Nearest First' },
  { value: 'rating', label: 'Highest Rated' }
];

const TYPE_ICONS = {
  artist: Users,
  event: Calendar,
  post: MessageCircle,
  group: Users,
  business: ExternalLink
};

const TYPE_COLORS = {
  artist: 'bg-blue-100 text-blue-800',
  event: 'bg-green-100 text-green-800',
  post: 'bg-purple-100 text-purple-800',
  group: 'bg-orange-100 text-orange-800',
  business: 'bg-red-100 text-red-800'
};

export const SearchResults = ({ results, loading = false, onResultClick, onLoadMore }: SearchResultsProps) => {
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedType, setSelectedType] = useState<string>('all');

  const sortedAndFilteredResults = useMemo(() => {
    let filtered = results;

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(result => result.type === selectedType);
    }

    // Sort results
    switch (sortBy) {
      case 'date':
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'popularity':
        return filtered.sort((a, b) => (b.engagement?.likes || 0) - (a.engagement?.likes || 0));
      case 'distance':
        return filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      case 'rating':
        return filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'relevance':
      default:
        return filtered.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    }
  }, [results, sortBy, selectedType]);

  const getTypeIcon = (type: string) => {
    const IconComponent = TYPE_ICONS[type as keyof typeof TYPE_ICONS] || ExternalLink;
    return <IconComponent className="h-4 w-4" />;
  };

  const getTypeColor = (type: string) => {
    return TYPE_COLORS[type as keyof typeof TYPE_COLORS] || 'bg-gray-100 text-gray-800';
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return '';
    if (distance < 1) return `${Math.round(distance * 1000)}m`;
    return `${distance.toFixed(1)}km`;
  };

  const formatEngagement = (engagement?: { likes: number; comments: number; shares: number; views: number }) => {
    if (!engagement) return '';
    const total = engagement.likes + engagement.comments + engagement.shares;
    if (total === 0) return '';
    return `${total} interactions`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-muted rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-muted rounded w-full mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (sortedAndFilteredResults.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="text-muted-foreground">
            <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p>Try adjusting your search terms or filters to find what you're looking for.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">
            {sortedAndFilteredResults.length} result{sortedAndFilteredResults.length !== 1 ? 's' : ''}
          </h2>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="artist">Artists</SelectItem>
              <SelectItem value="event">Events</SelectItem>
              <SelectItem value="post">Posts</SelectItem>
              <SelectItem value="group">Groups</SelectItem>
              <SelectItem value="business">Businesses</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {sortedAndFilteredResults.map((result) => (
          <Card 
            key={result.id} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onResultClick?.(result)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Image/Avatar */}
                <div className="flex-shrink-0">
                  {result.image ? (
                    <img 
                      src={result.image} 
                      alt={result.title}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  ) : (
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-lg">
                        {result.title.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(result.type)}>
                        {getTypeIcon(result.type)}
                        <span className="ml-1 capitalize">{result.type}</span>
                      </Badge>
                      {result.rating && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{result.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    {result.relevanceScore && (
                      <Badge variant="outline" className="text-xs">
                        {Math.round(result.relevanceScore * 100)}% match
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-semibold text-lg mb-1 line-clamp-1">{result.title}</h3>
                  
                  {result.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {result.description}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {result.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{result.location.name}</span>
                      </div>
                    )}
                    
                    {result.distance && (
                      <span>{formatDistance(result.distance)}</span>
                    )}

                    {result.date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(result.date), 'MMM dd, yyyy')}</span>
                      </div>
                    )}

                    {result.price && (
                      <span className="font-medium text-green-600">
                        ${result.price}
                      </span>
                    )}

                    {formatEngagement(result.engagement) && (
                      <span>{formatEngagement(result.engagement)}</span>
                    )}
                  </div>

                  {/* Tags */}
                  {result.tags && result.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {result.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {result.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{result.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      {onLoadMore && (
        <div className="text-center">
          <Button variant="outline" onClick={onLoadMore}>
            Load More Results
          </Button>
        </div>
      )}
    </div>
  );
};
