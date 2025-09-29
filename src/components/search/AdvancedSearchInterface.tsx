import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, SortAsc, SortDesc, X, TrendingUp, Clock, MapPin, Tag, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnifiedButton } from '@/design-system';
import { advancedSearchService, SearchFilters, SearchSortOptions, SearchResult } from '@/services/AdvancedSearchService';
import { useToast } from '@/hooks/use-toast';

interface AdvancedSearchInterfaceProps {
  onResultsChange?: (results: SearchResult) => void;
  initialQuery?: string;
  className?: string;
}

export const AdvancedSearchInterface: React.FC<AdvancedSearchInterfaceProps> = ({
  onResultsChange,
  initialQuery = '',
  className = ''
}) => {
  const { toast } = useToast();
  
  // Search state
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  
  // Sort state
  const [sort, setSort] = useState<SearchSortOptions>({ field: 'relevance', order: 'desc' });
  
  // Pagination state
  const [pagination, setPagination] = useState({ page: 1, limit: 20 });
  
  // Filter options
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'community', label: 'Community' },
    { value: 'business', label: 'Business' },
    { value: 'events', label: 'Events' },
    { value: 'services', label: 'Services' },
    { value: 'news', label: 'News' },
    { value: 'arts', label: 'Arts & Culture' },
    { value: 'technology', label: 'Technology' },
  ];

  const locations = [
    { value: 'all', label: 'All Locations' },
    { value: 'delhi', label: 'Delhi' },
    { value: 'mumbai', label: 'Mumbai' },
    { value: 'bangalore', label: 'Bangalore' },
    { value: 'chennai', label: 'Chennai' },
    { value: 'kolkata', label: 'Kolkata' },
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'date', label: 'Date' },
    { value: 'rating', label: 'Rating' },
    { value: 'popularity', label: 'Popularity' },
    { value: 'price', label: 'Price' },
    { value: 'title', label: 'Title' },
  ];

  // Search function
  const performSearch = useCallback(async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const searchResults = await advancedSearchService.universalSearch(
        query,
        filters,
        sort,
        pagination
      );
      
      setResults(searchResults);
      onResultsChange?.(searchResults);
      
      toast({
        title: "Search Complete",
        description: `Found ${searchResults.data.length} results in ${searchResults.analytics.searchTime}ms`,
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to perform search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [query, filters, sort, pagination, onResultsChange, toast]);

  // Get search suggestions
  const getSuggestions = useCallback(async () => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const suggestions = await advancedSearchService.getSearchSuggestions(query);
      setSuggestions(suggestions);
    } catch (error) {
      console.error('Error getting suggestions:', error);
    }
  }, [query]);

  // Handle search input
  const handleSearchChange = (value: string) => {
    setQuery(value);
    setShowSuggestions(value.length >= 2);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    performSearch();
  };

  // Handle filter change
  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle sort change
  const handleSortChange = (field: string, order: 'asc' | 'desc') => {
    setSort({ field: field as any, order });
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
    setShowFilters(false);
  };

  // Apply filters
  const applyFilters = () => {
    setShowFilters(false);
    performSearch();
  };

  // Effects
  useEffect(() => {
    if (query.length >= 2) {
      getSuggestions();
    }
  }, [query, getSuggestions]);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch();
    }
  }, [initialQuery, performSearch]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search everything..."
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && performSearch()}
              className="pl-10 pr-20"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="h-8"
              >
                <Filter className="h-4 w-4 mr-1" />
                Filters
              </Button>
              <UnifiedButton
                variant="primary"
                size="sm"
                onClick={performSearch}
                loading={isLoading}
                className="h-8"
              >
                Search
              </UnifiedButton>
            </div>
          </div>

          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-accent text-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Advanced Filters</span>
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select
                  value={filters.category || 'all'}
                  onValueChange={(value) => handleFilterChange('category', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <Select
                  value={filters.location || 'all'}
                  onValueChange={(value) => handleFilterChange('location', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(location => (
                      <SelectItem key={location.value} value={location.value}>
                        {location.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
                <div className="flex items-center space-x-2">
                  <Slider
                    value={[filters.rating || 0]}
                    onValueChange={([value]) => handleFilterChange('rating', value)}
                    max={5}
                    step={0.5}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground min-w-[3rem]">
                    {filters.rating || 0}
                  </span>
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Price Range</label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange?.min || ''}
                    onChange={(e) => handleFilterChange('priceRange', {
                      ...filters.priceRange,
                      min: Number(e.target.value) || 0
                    })}
                    className="w-20"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange?.max || ''}
                    onChange={(e) => handleFilterChange('priceRange', {
                      ...filters.priceRange,
                      max: Number(e.target.value) || 10000
                    })}
                    className="w-20"
                  />
                </div>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="date"
                    value={filters.dateRange?.start || ''}
                    onChange={(e) => handleFilterChange('dateRange', {
                      ...filters.dateRange,
                      start: e.target.value
                    })}
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="date"
                    value={filters.dateRange?.end || ''}
                    onChange={(e) => handleFilterChange('dateRange', {
                      ...filters.dateRange,
                      end: e.target.value
                    })}
                  />
                </div>
              </div>

              {/* Visibility Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Visibility</label>
                <Select
                  value={filters.visibility || 'all'}
                  onValueChange={(value) => handleFilterChange('visibility', value === 'all' ? undefined : value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
              <UnifiedButton variant="primary" onClick={applyFilters}>
                Apply Filters
              </UnifiedButton>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sort Options */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">Sort by:</span>
              <Select
                value={sort.field}
                onValueChange={(value) => handleSortChange(value, sort.order)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSortChange(sort.field, sort.order === 'asc' ? 'desc' : 'asc')}
              >
                {sort.order === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
            
            {results && (
              <div className="text-sm text-muted-foreground">
                {results.pagination.total} results in {results.analytics.searchTime}ms
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Analytics */}
      {results && results.analytics && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm">Total Results: {results.analytics.totalResults}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm">Search Time: {results.analytics.searchTime}ms</span>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-primary" />
                <span className="text-sm">Filters Applied: {results.analytics.filtersApplied}</span>
              </div>
            </div>
            
            {results.analytics.popularSearches.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Popular Searches</h4>
                <div className="flex flex-wrap gap-2">
                  {results.analytics.popularSearches.map((search, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
