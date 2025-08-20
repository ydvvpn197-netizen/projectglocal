import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useLocationManager } from '../hooks/useLocationManager';
import { Location } from '../types/location';
import { formatDistance } from '../utils/locationUtils';

interface LocationDetectorProps {
  onLocationDetected?: (location: Location) => void;
  showSettings?: boolean;
  className?: string;
}

export function LocationDetector({ 
  onLocationDetected, 
  showSettings = false, 
  className = '' 
}: LocationDetectorProps) {
  const {
    location,
    enabled,
    loading,
    error,
    detectLocation,
    toggleLocationServices,
    clearLocation,
  } = useLocationManager();

  const [isDetecting, setIsDetecting] = useState(false);

  const handleDetectLocation = async () => {
    setIsDetecting(true);
    try {
      const detectedLocation = await detectLocation();
      if (detectedLocation && onLocationDetected) {
        onLocationDetected(detectedLocation);
      }
    } catch (error) {
      console.error('Location detection failed:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleToggleLocation = async () => {
    if (enabled) {
      await clearLocation();
    } else {
      await handleDetectLocation();
    }
  };

  const getStatusIcon = () => {
    if (loading || isDetecting) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    if (error) {
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
    if (enabled && location) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return <MapPin className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusText = () => {
    if (loading || isDetecting) {
      return 'Detecting location...';
    }
    if (error) {
      return 'Location detection failed';
    }
    if (enabled && location) {
      return location.name || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
    }
    return 'Location not detected';
  };

  const getStatusColor = () => {
    if (loading || isDetecting) {
      return 'text-muted-foreground';
    }
    if (error) {
      return 'text-destructive';
    }
    if (enabled && location) {
      return 'text-green-600';
    }
    return 'text-muted-foreground';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          Location Services
        </CardTitle>
        <CardDescription>
          Enable location services to get personalized content based on your area
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <p className={`font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </p>
              {enabled && location && (
                <p className="text-sm text-muted-foreground">
                  Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              )}
            </div>
          </div>
          <Badge variant={enabled ? "default" : "secondary"}>
            {enabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 border border-destructive/20 bg-destructive/5 rounded-lg">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Error</span>
            </div>
            <p className="text-sm text-destructive mt-1">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleToggleLocation}
            disabled={loading || isDetecting}
            className="flex-1"
          >
            {loading || isDetecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Detecting...
              </>
            ) : enabled ? (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Disable Location
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4 mr-2" />
                Enable Location
              </>
            )}
          </Button>

          {enabled && location && (
            <Button
              variant="outline"
              onClick={handleDetectLocation}
              disabled={loading || isDetecting}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>

        {/* Location Benefits */}
        {!enabled && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Benefits of enabling location:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• See local events and activities near you</li>
              <li>• Get personalized news and updates</li>
              <li>• Find nearby artists and services</li>
              <li>• Discover local community discussions</li>
            </ul>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="text-xs text-muted-foreground">
          <p>
            Your location is only used to provide personalized content and is not shared with third parties. 
            You can disable location services at any time.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
