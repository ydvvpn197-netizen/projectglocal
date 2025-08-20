import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useLocationManager } from '@/hooks/useLocationManager';
import { LocationService } from '@/services/locationService';
import { formatDistance } from '@/utils/locationUtils';
import { 
  MapPin, 
  Navigation, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Loader2,
  RefreshCw,
  Settings,
  Search,
  Globe
} from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export function LocationTestPanel() {
  const {
    location,
    enabled,
    loading,
    error,
    settings,
    detectLocation,
    setManualLocation,
    updateSettings,
    toggleLocationServices,
    clearLocation,
    refreshLocation,
    getNearbyContent,
    searchPlaces,
  } = useLocationManager();

  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [nearbyContent, setNearbyContent] = useState<any[]>([]);

  const addTestResult = (name: string, status: 'pending' | 'success' | 'error', message: string, details?: any) => {
    setTestResults(prev => [...prev, { name, status, message, details }]);
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    clearTestResults();

    try {
      // Test 1: Check if user is authenticated
      addTestResult('Authentication', 'pending', 'Checking user authentication...');
      const { data: { user } } = await import('@/integrations/supabase/client').then(m => m.supabase.auth.getUser());
      if (user) {
        addTestResult('Authentication', 'success', `User authenticated: ${user.email}`);
      } else {
        addTestResult('Authentication', 'error', 'User not authenticated');
        return;
      }

      // Test 2: Check database connection
      addTestResult('Database Connection', 'pending', 'Testing database connection...');
      const { data: profile, error: profileError } = await import('@/integrations/supabase/client').then(m => 
        m.supabase.from('profiles').select('id, location_enabled, location_lat, location_lng, latitude, longitude, real_time_location_enabled').eq('id', user.id).single()
      );
      
      if (profileError) {
        addTestResult('Database Connection', 'error', `Database error: ${profileError.message}`);
      } else {
        addTestResult('Database Connection', 'success', 'Database connection successful', profile);
      }

      // Test 3: Test location detection
      addTestResult('Location Detection', 'pending', 'Testing location detection...');
      try {
        const detectedLocation = await detectLocation();
        if (detectedLocation) {
          addTestResult('Location Detection', 'success', `Location detected: ${detectedLocation.lat.toFixed(6)}, ${detectedLocation.lng.toFixed(6)}`, detectedLocation);
        } else {
          addTestResult('Location Detection', 'error', 'Location detection failed');
        }
      } catch (error: any) {
        addTestResult('Location Detection', 'error', `Location detection error: ${error.message}`);
      }

      // Test 4: Test location settings
      addTestResult('Location Settings', 'pending', 'Testing location settings...');
      try {
        const currentSettings = await LocationService.getLocationSettings();
        addTestResult('Location Settings', 'success', 'Location settings retrieved successfully', currentSettings);
      } catch (error: any) {
        addTestResult('Location Settings', 'error', `Settings error: ${error.message}`);
      }

      // Test 5: Test nearby content
      addTestResult('Nearby Content', 'pending', 'Testing nearby content retrieval...');
      try {
        const content = await getNearbyContent(50);
        addTestResult('Nearby Content', 'success', `Found ${content.length} nearby content items`, content);
      } catch (error: any) {
        addTestResult('Nearby Content', 'error', `Nearby content error: ${error.message}`);
      }

      // Test 6: Test place search
      addTestResult('Place Search', 'pending', 'Testing place search...');
      try {
        const places = await searchPlaces('Mumbai');
        addTestResult('Place Search', 'success', `Found ${places.length} places for "Mumbai"`, places);
      } catch (error: any) {
        addTestResult('Place Search', 'error', `Place search error: ${error.message}`);
      }

      // Test 7: Test location utilities
      addTestResult('Location Utilities', 'pending', 'Testing location utilities...');
      try {
        const distance = formatDistance(5.5);
        addTestResult('Location Utilities', 'success', `Distance formatting works: 5.5km = ${distance}`);
      } catch (error: any) {
        addTestResult('Location Utilities', 'error', `Utilities error: ${error.message}`);
      }

    } catch (error: any) {
      addTestResult('Test Suite', 'error', `Test suite error: ${error.message}`);
    } finally {
      setIsRunningTests(false);
    }
  };

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'pending':
        return 'text-blue-600';
      default:
        return 'text-yellow-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Location Feature Tests
          </CardTitle>
          <CardDescription>
            Comprehensive test suite for location-based personalization features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={runAllTests}
              disabled={isRunningTests}
              className="flex items-center gap-2"
            >
              {isRunningTests ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Run All Tests
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={clearTestResults}
              disabled={isRunningTests}
            >
              Clear Results
            </Button>
          </div>

          {/* Current Status */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 border rounded-lg">
              <p className="text-sm font-medium">Location Enabled</p>
              <Badge variant={enabled ? "default" : "secondary"}>
                {enabled ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="text-sm font-medium">Loading</p>
              <Badge variant={loading ? "default" : "secondary"}>
                {loading ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="text-sm font-medium">Radius</p>
              <span className="text-sm">{settings.radius_km}km</span>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="text-sm font-medium">Auto Detect</p>
              <Badge variant={settings.auto_detect ? "default" : "secondary"}>
                {settings.auto_detect ? "Yes" : "No"}
              </Badge>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Results from the latest test run
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <p className={`font-medium ${getStatusColor(result.status)}`}>
                        {result.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {result.message}
                      </p>
                      {result.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-muted-foreground cursor-pointer">
                            View Details
                          </summary>
                          <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interactive Tests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Search Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Place Search Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search for places..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md"
              />
              <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
                Search
              </Button>
            </div>
            {searchResults.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Search Results:</p>
                {searchResults.map((result, index) => (
                  <div key={index} className="p-2 border rounded text-sm">
                    <p className="font-medium">{result.name}</p>
                    <p className="text-muted-foreground">{result.address}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Nearby Content Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Nearby Content Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGetNearbyContent}
              disabled={!enabled || !location}
              className="w-full"
            >
              Get Nearby Content
            </Button>
            {nearbyContent.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Nearby Content:</p>
                {nearbyContent.map((content, index) => (
                  <div key={index} className="p-2 border rounded text-sm">
                    <p className="font-medium">{content.content_type}</p>
                    <p className="text-muted-foreground">
                      Distance: {formatDistance(content.distance_km)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Current Location Display */}
      {location && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Current Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Coordinates:</strong> {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
              {location.name && <p><strong>Name:</strong> {location.name}</p>}
              {location.address && <p><strong>Address:</strong> {location.address}</p>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
