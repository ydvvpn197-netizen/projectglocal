import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Search, Filter, MapPin, Calendar, Users, Star, DollarSign, X, TrendingUp, Clock, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { SearchResult, SearchFilter } from '@/types/search';



// Memoized search result item
const SearchResultItem = memo(({ result }: { result: SearchResult }) => {
  const getResultIcon = useCallback((type: string) => {
    const icons = {
      artist: <Star className="h-4 w-4" />,
      event: <Calendar className="h-4 w-4" />,
      post: <Users className="h-4 w-4" />,
      group: <Users className="h-4 w-4" />,
      business: <Map className="h-4 w-4" />,
    };
    return icons[type as keyof typeof icons] || <Search className="h-4 w-4" />;
  }, []);

  return (
    <Card className="hover:shadow-md transition-shadow">
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
              {result.relevanceScore && (
                <Badge variant="outline" className="text-xs">
                  {Math.round(result.relevanceScore)}% match
                </Badge>
              )}
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
                  {result.location.name || `${result.location.city}, ${result.location.state}`}
                </div>
              )}
              {result.distance && (
                <span>{result.distance.toFixed(1)}km away</span>
              )}
              {result.price && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  ${result.price}
                </div>
              )}
              {result.date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(result.date), 'MMM dd, yyyy')}
                </div>
              )}
              {result.engagement && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {result.engagement.likes + result.engagement.comments}
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
  );
});

SearchResultItem.displayName = 'SearchResultItem';

// Memoized search filters component
const SearchFilters = memo(({ 
  filters, 
  updateFilters, 
  resetFilters,
  categories 
}: {
  filters: SearchFilter;
  updateFilters: (filters: Partial<SearchFilter>) => void;
  resetFilters: () => void;
  categories: any;
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Search Filters</CardTitle>
          <Button variant="outline" size="sm" onClick={resetFilters}>
            <X className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-medium">Content Type</Label>
            <Select value={filters.type} onValueChange={(value) => updateFilters({ type: value })}>
              <SelectTrigger>
                <SelectValue />
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

          <div>
            <Label className="text-sm font-medium">Category</Label>
            <Select value={filters.category} onValueChange={(value) => updateFilters({ category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {filters.type !== 'all' && categories[filters.type as keyof typeof categories]?.map((cat: string) => (
                  <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Sort By</Label>
            <Select value={filters.sortBy} onValueChange={(value) => updateFilters({ sortBy: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="popularity">Popularity</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="location-filter" 
              checked={filters.location.enabled}
              onCheckedChange={(checked) => updateFilters({ 
                location: { ...filters.location, enabled: checked as boolean }
              })}
            />
            <Label htmlFor="location-filter">Filter by location</Label>
          </div>
          
          {filters.location.enabled && (
            <div>
              <Label className="text-sm font-medium">Max Distance: {filters.location.radius}km</Label>
              <Slider
                value={[filters.location.radius]}
                onValueChange={([value]) => updateFilters({ 
                  location: { ...filters.location, radius: value }
                })}
                max={100}
                min={1}
                step={1}
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="date-filter" 
              checked={filters.dateRange.enabled}
              onCheckedChange={(checked) => updateFilters({ 
                dateRange: { ...filters.dateRange, enabled: checked as boolean }
              })}
            />
            <Label htmlFor="date-filter">Filter by date range</Label>
          </div>
          
          {filters.dateRange.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Start Date</Label>
                <Input 
                  type="date" 
                  value={filters.dateRange.start}
                  onChange={(e) => updateFilters({ 
                    dateRange: { ...filters.dateRange, start: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">End Date</Label>
                <Input 
                  type="date" 
                  value={filters.dateRange.end}
                  onChange={(e) => updateFilters({ 
                    dateRange: { ...filters.dateRange, end: e.target.value }
                  })}
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="price-filter" 
              checked={filters.priceRange.enabled}
              onCheckedChange={(checked) => updateFilters({ 
                priceRange: { ...filters.priceRange, enabled: checked as boolean }
              })}
            />
            <Label htmlFor="price-filter">Filter by price range</Label>
          </div>
          
          {filters.priceRange.enabled && (
            <div>
              <Label className="text-sm font-medium">Price Range: ${filters.priceRange.min} - ${filters.priceRange.max}</Label>
              <Slider
                value={[filters.priceRange.min, filters.priceRange.max]}
                onValueChange={(value) => updateFilters({ 
                  priceRange: { 
                    ...filters.priceRange, 
                    min: value[0], 
                    max: value[1] 
                  }
                })}
                max={1000}
                min={0}
                step={10}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

SearchFilters.displayName = 'SearchFilters';

export const AdvancedSearch = () => {
  const {
    query,
    setQuery,
    results,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    suggestions,
    hasMore,
    loadMore
  } = useAdvancedSearch();

  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const categories = useMemo(() => ({
    artist: ['Photographer', 'Musician', 'DJ', 'Chef', 'Designer', 'Writer', 'Performer'],
    event: ['Music', 'Food', 'Art', 'Sports', 'Business', 'Education', 'Entertainment'],
    post: ['News', 'Discussion', 'Question', 'Announcement', 'Review'],
    group: ['Hobby', 'Professional', 'Community', 'Interest', 'Location-based'],
    business: ['Restaurant', 'Shop', 'Service', 'Entertainment', 'Health', 'Education']
  }), []);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search artists, events, posts, groups, businesses..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              onFocus={() => setShowSuggestions(query.length > 0)}
              className="pl-10"
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => {
                  setQuery('');
                  setShowSuggestions(false);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-background border rounded-md shadow-lg z-10 mt-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="w-full text-left px-4 py-2 hover:bg-muted flex items-center gap-2"
                onClick={() => {
                  setQuery(suggestion);
                  setShowSuggestions(false);
                }}
              >
                <Search className="h-3 w-3 text-muted-foreground" />
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <SearchFilters 
          filters={filters} 
          updateFilters={updateFilters}
          resetFilters={resetFilters}
          categories={categories} 
        />
      )}

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
          <p className="text-destructive text-sm">{error}</p>
        </div>
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
          <SearchResultItem key={`${result.type}-${result.id}`} result={result} />
        ))}

        {/* Load More */}
        {hasMore && results.length > 0 && (
          <div className="text-center pt-4">
            <Button
              variant="outline"
              onClick={loadMore}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
