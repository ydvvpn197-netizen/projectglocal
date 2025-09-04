import { useState, useEffect, useCallback, useRef } from 'react';
import { LocationService } from '../services/locationService';
import { Location, LocationSettings, LocationState } from '../types/location';
import { useAuth } from './useAuth';

export function useLocationManager() {
  const { user } = useAuth();
  const [state, setState] = useState<LocationState>({
    current: null,
    enabled: false,
    auto_detect: true,
    loading: false,
    error: null,
  });

  const [settings, setSettings] = useState<LocationSettings>({
    enabled: false,
    auto_detect: true,
    radius_km: 50,
    categories: [],
    notifications: true,
  });

  // Use refs for internal state values that don't trigger re-renders
  const stateRef = useRef(state);
  const settingsRef = useRef(settings);

  // Keep refs in sync with state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Load initial location and settings
  useEffect(() => {
    if (user) {
      loadLocationAndSettings();
    }
  }, [user, loadLocationAndSettings]);

  const loadLocationAndSettings = useCallback(async () => {
    if (!user) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const [location, locationSettings] = await Promise.all([
        LocationService.getCurrentUserLocation(),
        LocationService.getLocationSettings(),
      ]);

      setState(prev => ({
        ...prev,
        current: location,
        enabled: locationSettings.enabled,
        auto_detect: locationSettings.auto_detect,
        loading: false,
      }));

      setSettings(locationSettings);
    } catch (error) {
      console.error('Error loading location and settings:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load location',
      }));
    }
  }, [user]);

  const detectLocation = useCallback(async () => {
    if (!user) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const location = await LocationService.detectAndSaveLocation();
      
      setState(prev => ({
        ...prev,
        current: location,
        enabled: true,
        auto_detect: true,
        loading: false,
      }));

      // Reload settings to get updated values
      const locationSettings = await LocationService.getLocationSettings();
      setSettings(locationSettings);

      return location;
    } catch (error) {
      console.error('Error detecting location:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to detect location',
      }));
      throw error;
    }
  }, [user]);

  const setManualLocation = useCallback(async (location: Location) => {
    if (!user) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await LocationService.setManualLocation(location);
      
      setState(prev => ({
        ...prev,
        current: location,
        enabled: true,
        auto_detect: false,
        loading: false,
      }));

      // Reload settings to get updated values
      const locationSettings = await LocationService.getLocationSettings();
      setSettings(locationSettings);
    } catch (error) {
      console.error('Error setting manual location:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to set location',
      }));
      throw error;
    }
  }, [user]);

  const updateSettings = useCallback(async (newSettings: Partial<LocationSettings>) => {
    if (!user) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await LocationService.updateLocationSettings(newSettings);
      
      const updatedSettings = await LocationService.getLocationSettings();
      setSettings(updatedSettings);

      // Update state if location enabled/disabled changed
      if (newSettings.enabled !== undefined) {
        setState(prev => ({
          ...prev,
          enabled: newSettings.enabled,
          loading: false,
        }));
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error updating location settings:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to update settings',
      }));
      throw error;
    }
  }, [user]);

  const toggleLocationServices = useCallback(async (enabled: boolean) => {
    if (!user) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await LocationService.toggleLocationServices(enabled);
      
      setState(prev => ({
        ...prev,
        enabled,
        loading: false,
      }));

      setSettings(prev => ({ ...prev, enabled }));
    } catch (error) {
      console.error('Error toggling location services:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to toggle location services',
      }));
      throw error;
    }
  }, [user]);

  const clearLocation = useCallback(async () => {
    if (!user) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await LocationService.toggleLocationServices(false);
      
      setState(prev => ({
        ...prev,
        current: null,
        enabled: false,
        loading: false,
      }));

      setSettings(prev => ({ ...prev, enabled: false }));
    } catch (error) {
      console.error('Error clearing location:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to clear location',
      }));
      throw error;
    }
  }, [user]);

  const refreshLocation = useCallback(async () => {
    if (!user || !stateRef.current.enabled) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      if (stateRef.current.auto_detect) {
        await detectLocation();
      } else {
        await loadLocationAndSettings();
      }
    } catch (error) {
      console.error('Error refreshing location:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh location',
      }));
    }
  }, [user, detectLocation, loadLocationAndSettings]);

  const getNearbyContent = useCallback(async (radiusKm?: number, contentType?: string) => {
    if (!user || !stateRef.current.enabled || !stateRef.current.current) return [];

    try {
      return await LocationService.getNearbyContent(radiusKm, contentType);
    } catch (error) {
      console.error('Error getting nearby content:', error);
      return [];
    }
  }, [user]);

  const searchPlaces = useCallback(async (query: string) => {
    if (!user) return [];

    try {
      return await LocationService.searchPlaces(query, stateRef.current.current || undefined);
    } catch (error) {
      console.error('Error searching places:', error);
      return [];
    }
  }, [user]);

  return {
    // State
    location: state.current,
    enabled: state.enabled,
    auto_detect: state.auto_detect,
    loading: state.loading,
    error: state.error,
    settings,

    // Actions
    detectLocation,
    setManualLocation,
    updateSettings,
    toggleLocationServices,
    clearLocation,
    refreshLocation,
    getNearbyContent,
    searchPlaces,
    loadLocationAndSettings,
  };
}
