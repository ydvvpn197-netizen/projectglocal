import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Loader2, CheckCircle, X } from 'lucide-react';
import { useLocationManager } from '../hooks/useLocationManager';
import { Location, LocationSearchResult } from '../types/location';
import { cn } from '@/lib/utils';

interface LocationSelectorProps {
  onLocationSelected?: (location: Location) => void;
  className?: string;
  placeholder?: string;
}

export function LocationSelector({ 
  onLocationSelected, 
  className = '',
  placeholder = "Search for a city, place, or address..."
}: LocationSelectorProps) {
  const { searchPlaces, setManualLocation } = useLocationManager();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchPlaces(searchQuery);
        setSearchResults(results);
        setShowResults(true);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchPlaces]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationSelect = async (result: LocationSearchResult) => {
    const location: Location = {
      lat: result.lat,
      lng: result.lng,
      name: result.name,
      address: result.address,
    };

    setSelectedLocation(location);
    setSearchQuery(result.name);
    setShowResults(false);

    try {
      await setManualLocation(location);
      if (onLocationSelected) {
        onLocationSelected(location);
      }
    } catch (error) {
      console.error('Failed to set location:', error);
    }
  };

  const handleClearSelection = () => {
    setSelectedLocation(null);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handleInputFocus = () => {
    if (searchResults.length > 0) {
      setShowResults(true);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Select Location
        </CardTitle>
        <CardDescription>
          Search and select your preferred location for personalized content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleInputFocus}
              className="pl-10 pr-10"
            />
            {selectedLocation && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Search Results */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Searching...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleLocationSelect(result)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{result.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{result.address}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchQuery.trim().length >= 2 ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">No results found</p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Selected Location Display */}
        {selectedLocation && (
          <div className="p-3 border border-green-200 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">{selectedLocation.name}</p>
                  {selectedLocation.address && (
                    <p className="text-sm text-green-700">{selectedLocation.address}</p>
                  )}
                  <p className="text-xs text-green-600">
                    {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-green-700 border-green-300">
                Selected
              </Badge>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground">
          <p>
            Start typing to search for cities, places, or addresses. 
            Your selected location will be used to personalize your experience.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
