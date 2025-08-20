import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MainLayout } from '@/components/MainLayout';
import { LocationDetector } from '@/components/LocationDetector';
import { LocationSelector } from '@/components/LocationSelector';
import { LocationFilter } from '@/components/LocationFilter';
import { LocationTestPanel } from '@/components/LocationTestPanel';
import NewsFeedTest from '@/components/NewsFeedTest';
import { useLocationManager } from '@/hooks/useLocationManager';
import { formatDistance } from '@/utils/locationUtils';

export function LocationTest() {
  const {
    location,
    enabled,
    loading,
    error,
    settings,
    detectLocation,
    getNearbyContent,
    searchPlaces,
  } = useLocationManager();

  const [nearbyContent, setNearbyContent] = React.useState<any[]>([]);
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const results = await searchPlaces(searchQuery);
      setSearchResults(results);
    }
  };

  const handleGetNearbyContent = async () => {
    if (enabled && location) {
      const content = await getNearbyContent(settings.radius_km);
      setNearbyContent(content);
    }
  };

    return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Location Features Test</h1>
          <p className="text-muted-foreground">
            Test and verify location-based personalization features
          </p>
        </div>

        <Tabs defaultValue="components" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="tests">Test Suite</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="news-feed">News Feed</TabsTrigger>
          </TabsList>

          <TabsContent value="components" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Location Detection */}
              <LocationDetector 
                onLocationDetected={(location) => {
                  console.log('Location detected:', location);
                }}
              />

              {/* Location Selection */}
              <LocationSelector 
                onLocationSelected={(location) => {
                  console.log('Location selected:', location);
                }}
              />
            </div>

            {/* Location Filter */}
            <LocationFilter
              onFilterChange={(filter) => {
                console.log('Filter changed:', filter);
              }}
            />
          </TabsContent>

          <TabsContent value="tests">
            <LocationTestPanel />
          </TabsContent>

          <TabsContent value="status" className="space-y-6">
            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle>Current Location Status</CardTitle>
                <CardDescription>
                  Real-time status of your location services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Location Enabled</p>
                    <Badge variant={enabled ? "default" : "secondary"}>
                      {enabled ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Loading</p>
                    <Badge variant={loading ? "default" : "secondary"}>
                      {loading ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>

                {location && (
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Current Location</h4>
                    <p className="text-sm">Name: {location.name || 'Unknown'}</p>
                    <p className="text-sm">Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
                    {location.address && (
                      <p className="text-sm">Address: {location.address}</p>
                    )}
                  </div>
                )}

                {error && (
                  <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
                    <p className="text-sm text-destructive">Error: {error}</p>
                  </div>
                )}

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Settings</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p>Radius: {settings.radius_km}km</p>
                      <p>Auto-detect: {settings.auto_detect ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <p>Notifications: {settings.notifications ? 'Yes' : 'No'}</p>
                      <p>Categories: {settings.categories.length}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Manual Tests</CardTitle>
                <CardDescription>
                  Test various location-based features manually
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button
                    onClick={handleGetNearbyContent}
                    disabled={!enabled || !location}
                  >
                    Get Nearby Content
                  </Button>

                  <Button
                    onClick={handleSearch}
                    disabled={!searchQuery.trim()}
                  >
                    Search Places
                  </Button>
                </div>

                {/* Search Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search for places..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md"
                  />
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Search Results</h4>
                    {searchResults.map((result, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <p className="font-medium">{result.name}</p>
                        <p className="text-sm text-muted-foreground">{result.address}</p>
                        <p className="text-xs text-muted-foreground">
                          {result.lat.toFixed(6)}, {result.lng.toFixed(6)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Nearby Content */}
                {nearbyContent.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Nearby Content</h4>
                    {nearbyContent.map((content, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <p className="font-medium">{content.content_type}</p>
                        <p className="text-sm text-muted-foreground">
                          Distance: {formatDistance(content.distance_km)}
                        </p>
                        {content.location_name && (
                          <p className="text-sm text-muted-foreground">
                            Location: {content.location_name}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="news-feed" className="space-y-6">
            <NewsFeedTest />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
