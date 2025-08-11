import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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
        const { data, error } = await supabase
          .from('profiles')
          .select('real_time_location_enabled, current_latitude, current_longitude, current_location_updated_at')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading location preferences:', error);
          return;
        }

        if (data) {
          setLocationState(prev => ({
            ...prev,
            isEnabled: data.real_time_location_enabled || false,
            currentLocation: data.current_latitude && data.current_longitude ? {
              latitude: data.current_latitude,
              longitude: data.current_longitude,
            } : null,
            lastUpdated: data.current_location_updated_at ? new Date(data.current_location_updated_at) : null,
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

  // Update location in database
  const updateLocationInDB = useCallback(async (location: LocationData) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          current_latitude: location.latitude,
          current_longitude: location.longitude,
          current_location_updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating location:', error);
        throw error;
      }
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
        
        // Update database with enabled state and current location
        const { error } = await supabase
          .from('profiles')
          .update({
            real_time_location_enabled: true,
            current_latitude: position.latitude,
            current_longitude: position.longitude,
            current_location_updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        if (error) throw error;

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
        const { error } = await supabase
          .from('profiles')
          .update({
            real_time_location_enabled: false,
            current_latitude: null,
            current_longitude: null,
            current_location_updated_at: null,
          })
          .eq('user_id', user.id);

        if (error) throw error;

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
  }, [user, locationState.isEnabled, getCurrentPosition, updateLocationInDB, toast]);

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