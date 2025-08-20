import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Filter, X, RefreshCw } from 'lucide-react';
import { useLocationManager } from '../hooks/useLocationManager';
import { LocationFilter as LocationFilterType } from '../types/location';
import { formatDistance } from '../utils/locationUtils';

interface LocationFilterProps {
  onFilterChange?: (filter: LocationFilterType) => void;
  className?: string;
  showCategories?: boolean;
  showSort?: boolean;
}

const CONTENT_CATEGORIES = [
  { id: 'events', label: 'Events', icon: '🎉' },
  { id: 'news', label: 'News', icon: '📰' },
  { id: 'artists', label: 'Artists', icon: '🎨' },
  { id: 'reviews', label: 'Reviews', icon: '⭐' },
  { id: 'discussions', label: 'Discussions', icon: '💬' },
  { id: 'polls', label: 'Polls', icon: '📊' },
];

const SORT_OPTIONS = [
  { value: 'distance', label: 'Distance' },
  { value: 'relevance', label: 'Relevance' },
  { value: 'date', label: 'Date' },
];

export function LocationFilter({ 
  onFilterChange, 
  className = '',
  showCategories = true,
  showSort = true
}: LocationFilterProps) {
  const { location, enabled, settings } = useLocationManager();
  
  const [filter, setFilter] = useState<LocationFilterType>({
    enabled: enabled,
    radius_km: settings.radius_km,
    categories: settings.categories,
    sort_by: 'distance',
  });

  const [isExpanded, setIsExpanded] = useState(false);

  // Update filter when location or settings change
  useEffect(() => {
    setFilter(prev => ({
      ...prev,
      enabled,
      radius_km: settings.radius_km,
      categories: settings.categories,
    }));
  }, [enabled, settings.radius_km, settings.categories]);

  // Notify parent of filter changes
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filter);
    }
  }, [filter, onFilterChange]);

  const handleRadiusChange = (value: number[]) => {
    const newRadius = value[0];
    setFilter(prev => ({ ...prev, radius_km: newRadius }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFilter(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const handleSortChange = (value: string) => {
    setFilter(prev => ({ ...prev, sort_by: value as 'distance' | 'relevance' | 'date' }));
  };

  const handleToggleFilter = () => {
    setFilter(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  const handleReset = () => {
    setFilter({
      enabled: true,
      radius_km: 50,
      categories: [],
      sort_by: 'distance',
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filter.enabled) count++;
    if (filter.radius_km !== 50) count++;
    if (filter.categories.length > 0) count++;
    if (filter.sort_by !== 'distance') count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  if (!enabled && !location) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Enable location services to filter content</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle className="text-lg">Location Filter</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-8 px-2"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 px-2"
            >
              {isExpanded ? (
                <X className="h-3 w-3" />
              ) : (
                <Filter className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
        <CardDescription>
          {location ? (
            <span>
              Filtering content near <strong>{location.name || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}</strong>
            </span>
          ) : (
            'Configure location-based content filtering'
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {filter.enabled ? 'Location filtering active' : 'Location filtering disabled'}
              </p>
              {filter.enabled && (
                <p className="text-xs text-muted-foreground">
                  Within {formatDistance(filter.radius_km)} • {filter.categories.length} categories
                </p>
              )}
            </div>
          </div>
          <Button
            variant={filter.enabled ? "default" : "outline"}
            size="sm"
            onClick={handleToggleFilter}
          >
            {filter.enabled ? 'Active' : 'Inactive'}
          </Button>
        </div>

        {/* Expanded Settings */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            {/* Radius Setting */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Search Radius</Label>
                <span className="text-sm text-muted-foreground">
                  {formatDistance(filter.radius_km)}
                </span>
              </div>
              <Slider
                value={[filter.radius_km]}
                onValueChange={handleRadiusChange}
                max={100}
                min={5}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5km</span>
                <span>50km</span>
                <span>100km</span>
              </div>
            </div>

            {/* Content Categories */}
            {showCategories && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Content Types</Label>
                <div className="grid grid-cols-2 gap-2">
                  {CONTENT_CATEGORIES.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={category.id}
                        checked={filter.categories.includes(category.id)}
                        onCheckedChange={() => handleCategoryToggle(category.id)}
                      />
                      <Label
                        htmlFor={category.id}
                        className="text-sm cursor-pointer flex items-center gap-1"
                      >
                        <span>{category.icon}</span>
                        {category.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sort Options */}
            {showSort && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Sort By</Label>
                <Select value={filter.sort_by} onValueChange={handleSortChange}>
                  <SelectTrigger>
                    <SelectValue />
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
            )}
          </div>
        )}

        {/* Active Filters Summary */}
        {activeFiltersCount > 0 && !isExpanded && (
          <div className="pt-2 border-t">
            <div className="flex flex-wrap gap-1">
              {filter.radius_km !== 50 && (
                <Badge variant="outline" className="text-xs">
                  {formatDistance(filter.radius_km)} radius
                </Badge>
              )}
              {filter.categories.map((categoryId) => {
                const category = CONTENT_CATEGORIES.find(c => c.id === categoryId);
                return category ? (
                  <Badge key={categoryId} variant="outline" className="text-xs">
                    {category.icon} {category.label}
                  </Badge>
                ) : null;
              })}
              {filter.sort_by !== 'distance' && (
                <Badge variant="outline" className="text-xs">
                  Sort: {SORT_OPTIONS.find(o => o.value === filter.sort_by)?.label}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
