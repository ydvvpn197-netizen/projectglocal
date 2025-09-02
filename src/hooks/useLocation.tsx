import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LocationService } from '../services/locationService';
import { Location } from '../types/location';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface LocationState {
  currentLocation: LocationData | null;
  isEnabled: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export const useLocation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [locationState, setLocationState] = useState<LocationState>({
    currentLocation: null,
    isEnabled: false,
    isLoading: false,
    error: null,
    lastUpdated: null,
  });

  // Load location preferences from database
  useEffect(() => {
    const loadLocationPreferences = async () => {
      if (!user) return;

      try {
        // Use the new location service
        const location = await LocationService.getCurrentUserLocation();
        const settings = await LocationService.getLocationSettings();

        if (location) {
          setLocationState(prev => ({
            ...prev,
            isEnabled: settings.enabled,
            currentLocation: {
              latitude: location.lat,
              longitude: location.lng,
            },
            lastUpdated: new Date(), // We'll need to add this to the new system
          }));
        } else {
          setLocationState(prev => ({
            ...prev,
            isEnabled: settings.enabled,
            currentLocation: null,
          }));
        }
      } catch (error) {
        console.error('Error loading location preferences:', error);
      }
    };

    loadLocationPreferences();
  }, [user]);

  // Get current position
  const getCurrentPosition = useCallback((): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          reject(new Error(`Location error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }, []);

  // Update location in database using new service
  const updateLocationInDB = useCallback(async (location: LocationData) => {
    if (!user) return;

    try {
      const locationData: Location = {
        lat: location.latitude,
        lng: location.longitude,
      };
      
      await LocationService.setManualLocation(locationData);
    } catch (error) {
      console.error('Error updating location in database:', error);
      throw error;
    }
  }, [user]);

  // Toggle location sharing
  const toggleLocationSharing = useCallback(async () => {
    if (!user) return;

    setLocationState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const newEnabledState = !locationState.isEnabled;

      if (newEnabledState) {
        // Enable location sharing - get current position
        const position = await getCurrentPosition();
        
        // Use new location service
        const locationData: Location = {
          lat: position.latitude,
          lng: position.longitude,
        };
        
        await LocationService.detectAndSaveLocation();

        setLocationState(prev => ({
          ...prev,
          isEnabled: true,
          currentLocation: position,
          lastUpdated: new Date(),
          isLoading: false,
        }));

        toast({
          title: "Location sharing enabled",
          description: "Your location will be used to show relevant local content.",
        });
      } else {
        // Disable location sharing
        await LocationService.toggleLocationServices(false);

        setLocationState(prev => ({
          ...prev,
          isEnabled: false,
          currentLocation: null,
          lastUpdated: null,
          isLoading: false,
        }));

        toast({
          title: "Location sharing disabled",
          description: "Location data has been cleared.",
        });
      }
    } catch (error: any) {
      setLocationState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false,
      }));

      toast({
        title: "Location error",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [user, locationState.isEnabled, getCurrentPosition, toast]);

  // Update current location (when enabled)
  const updateCurrentLocation = useCallback(async () => {
    if (!user || !locationState.isEnabled) return;

    setLocationState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const position = await getCurrentPosition();
      await updateLocationInDB(position);

      setLocationState(prev => ({
        ...prev,
        currentLocation: position,
        lastUpdated: new Date(),
        isLoading: false,
      }));

      toast({
        title: "Location updated",
        description: "Your current location has been refreshed.",
      });
    } catch (error: any) {
      setLocationState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false,
      }));

      toast({
        title: "Location update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [user, locationState.isEnabled, getCurrentPosition, updateLocationInDB, toast]);

  // Auto-update location every 15 minutes when enabled
  useEffect(() => {
    if (!locationState.isEnabled) return;

    const interval = setInterval(() => {
      updateCurrentLocation();
    }, 15 * 60 * 1000); // 15 minutes

    return () => clearInterval(interval);
  }, [locationState.isEnabled, updateCurrentLocation]);

  return {
    ...locationState,
    toggleLocationSharing,
    updateCurrentLocation,
  };
};
