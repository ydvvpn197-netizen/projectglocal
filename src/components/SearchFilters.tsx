import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Filter, X, MapPin, Calendar, Users, Star } from 'lucide-react';
import { SearchFilter } from '@/types/search';

interface SearchFiltersProps {
  filters: SearchFilter;
  onFiltersChange: (filters: SearchFilter) => void;
  onClearFilters: () => void;
}

const CATEGORIES = [
  'All',
  'Events',
  'Artists',
  'Posts',
  'Groups',
  'News',
  'Businesses'
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'date', label: 'Newest First' },
  { value: 'popularity', label: 'Most Popular' },
  { value: 'distance', label: 'Nearest First' },
  { value: 'rating', label: 'Highest Rated' }
];

const TIME_FILTERS = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' }
];

export const SearchFilters = ({ filters, onFiltersChange, onClearFilters }: SearchFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof SearchFilter, value: unknown) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && value !== '' && 
    (Array.isArray(value) ? value.length > 0 : true)
  );

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search Filters
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Category Filter */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={filters.category || 'all'}
              onValueChange={(value) => updateFilter('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.toLowerCase()} value={category.toLowerCase()}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort Options */}
          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select
              value={filters.sortBy || 'relevance'}
              onValueChange={(value) => updateFilter('sortBy', value)}
            >
              <SelectTrigger>
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

                     {/* Date Range Filter */}
           <div className="space-y-2">
             <Label>Date Range</Label>
             <div className="grid grid-cols-2 gap-2">
               <Input
                 type="date"
                 value={filters.dateRange?.start || ''}
                 onChange={(e) => updateFilter('dateRange', {
                   ...filters.dateRange,
                   start: e.target.value,
                   enabled: true
                 })}
                 className="text-sm"
               />
               <Input
                 type="date"
                 value={filters.dateRange?.end || ''}
                 onChange={(e) => updateFilter('dateRange', {
                   ...filters.dateRange,
                   end: e.target.value,
                   enabled: true
                 })}
                 className="text-sm"
               />
             </div>
           </div>

           {/* Location Filter */}
           <div className="space-y-2">
             <Label className="flex items-center gap-2">
               <MapPin className="h-4 w-4" />
               Location Radius (km)
             </Label>
             <div className="space-y-2">
               <Slider
                 value={[filters.location?.radius || 50]}
                 onValueChange={(value) => updateFilter('location', {
                   ...filters.location,
                   radius: value[0],
                   enabled: true
                 })}
                 max={100}
                 min={1}
                 step={1}
                 className="w-full"
               />
               <div className="flex justify-between text-sm text-muted-foreground">
                 <span>1 km</span>
                 <span>{filters.location?.radius || 50} km</span>
                 <span>100 km</span>
               </div>
             </div>
           </div>

           {/* Price Range */}
           <div className="space-y-2">
             <Label>Price Range</Label>
             <div className="grid grid-cols-2 gap-2">
               <Input
                 type="number"
                 placeholder="Min"
                 value={filters.priceRange?.min || ''}
                 onChange={(e) => updateFilter('priceRange', {
                   ...filters.priceRange,
                   min: e.target.value ? Number(e.target.value) : 0,
                   enabled: true
                 })}
                 className="text-sm"
               />
               <Input
                 type="number"
                 placeholder="Max"
                 value={filters.priceRange?.max || ''}
                 onChange={(e) => updateFilter('priceRange', {
                   ...filters.priceRange,
                   max: e.target.value ? Number(e.target.value) : 0,
                   enabled: true
                 })}
                 className="text-sm"
               />
             </div>
           </div>

           {/* Rating Filter */}
           <div className="space-y-2">
             <Label className="flex items-center gap-2">
               <Star className="h-4 w-4" />
               Minimum Rating
             </Label>
             <div className="space-y-2">
               <Slider
                 value={[filters.rating || 0]}
                 onValueChange={(value) => updateFilter('rating', value[0])}
                 max={5}
                 min={0}
                 step={0.5}
                 className="w-full"
               />
               <div className="flex justify-between text-sm text-muted-foreground">
                 <span>Any</span>
                 <span>{filters.rating || 0}+ stars</span>
                 <span>5 stars</span>
               </div>
             </div>
           </div>

          {/* Tags Filter */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <Input
              placeholder="Enter tags separated by commas"
              value={filters.tags?.join(', ') || ''}
              onChange={(e) => {
                const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                updateFilter('tags', tags.length > 0 ? tags : undefined);
              }}
              className="text-sm"
            />
          </div>

                     {/* Additional Filters */}
           <div className="space-y-3">
             <Label>Additional Filters</Label>
             <div className="space-y-2">
               <div className="flex items-center space-x-2">
                 <Checkbox
                   id="location-enabled"
                   checked={filters.location?.enabled || false}
                   onCheckedChange={(checked) => updateFilter('location', {
                     ...filters.location,
                     enabled: checked
                   })}
                 />
                 <Label htmlFor="location-enabled" className="text-sm">Enable location filtering</Label>
               </div>
               <div className="flex items-center space-x-2">
                 <Checkbox
                   id="date-enabled"
                   checked={filters.dateRange?.enabled || false}
                   onCheckedChange={(checked) => updateFilter('dateRange', {
                     ...filters.dateRange,
                     enabled: checked
                   })}
                 />
                 <Label htmlFor="date-enabled" className="text-sm">Enable date filtering</Label>
               </div>
               <div className="flex items-center space-x-2">
                 <Checkbox
                   id="price-enabled"
                   checked={filters.priceRange?.enabled || false}
                   onCheckedChange={(checked) => updateFilter('priceRange', {
                     ...filters.priceRange,
                     enabled: checked
                   })}
                 />
                 <Label htmlFor="price-enabled" className="text-sm">Enable price filtering</Label>
               </div>
             </div>
           </div>

                     {/* Active Filters Display */}
           {hasActiveFilters && (
             <div className="space-y-2">
               <Label className="text-sm font-medium">Active Filters:</Label>
               <div className="flex flex-wrap gap-2">
                 {filters.category && filters.category !== 'all' && (
                   <Badge variant="secondary" className="text-xs">
                     Category: {filters.category}
                   </Badge>
                 )}
                 {filters.location?.enabled && filters.location?.radius && (
                   <Badge variant="secondary" className="text-xs">
                     Within {filters.location.radius}km
                   </Badge>
                 )}
                 {filters.rating && filters.rating > 0 && (
                   <Badge variant="secondary" className="text-xs">
                     {filters.rating}+ stars
                   </Badge>
                 )}
                 {filters.tags && filters.tags.length > 0 && (
                   <Badge variant="secondary" className="text-xs">
                     Tags: {filters.tags.join(', ')}
                   </Badge>
                 )}
                 {filters.dateRange?.enabled && (
                   <Badge variant="secondary" className="text-xs">
                     Date range enabled
                   </Badge>
                 )}
                 {filters.priceRange?.enabled && (
                   <Badge variant="secondary" className="text-xs">
                     Price range enabled
                   </Badge>
                 )}
               </div>
             </div>
           )}
        </CardContent>
      )}
    </Card>
  );
};
