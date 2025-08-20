import React, {createContext, useContext, useEffect, ReactNode} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {RootState, AppDispatch} from '../store';
import {getCurrentLocation, requestLocationPermission, setCurrentLocation} from '../store/slices/locationSlice';
import {locationService} from '../services/locationService';
import {Location} from '../store/slices/locationSlice';

interface LocationContextType {
  currentLocation: Location | null;
  selectedLocation: Location | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
  isLocationEnabled: boolean;
  getLocation: () => Promise<void>;
  requestPermission: () => Promise<void>;
  watchLocation: (callback: (location: Location) => void) => Promise<void>;
  stopWatchingLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({children}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    currentLocation,
    selectedLocation,
    isLoading,
    error,
    hasPermission,
    isLocationEnabled,
  } = useSelector((state: RootState) => state.location);

  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    try {
      const permission = await locationService.requestPermission();
      if (permission) {
        await getLocation();
      }
    } catch (error) {
      console.error('Location initialization error:', error);
    }
  };

  const getLocation = async () => {
    try {
      await dispatch(getCurrentLocation()).unwrap();
    } catch (error: any) {
      console.error('Get location error:', error);
    }
  };

  const requestPermission = async () => {
    try {
      await dispatch(requestLocationPermission()).unwrap();
    } catch (error: any) {
      console.error('Request permission error:', error);
    }
  };

  const watchLocation = async (callback: (location: Location) => void) => {
    try {
      await locationService.watchLocation(
        (location) => {
          dispatch(setCurrentLocation(location));
          callback(location);
        },
        (error) => {
          console.error('Watch location error:', error);
        },
      );
    } catch (error) {
      console.error('Start watching location error:', error);
    }
  };

  const stopWatchingLocation = () => {
    locationService.stopWatchingLocation();
  };

  const value: LocationContextType = {
    currentLocation,
    selectedLocation,
    isLoading,
    error,
    hasPermission,
    isLocationEnabled,
    getLocation,
    requestPermission,
    watchLocation,
    stopWatchingLocation,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
