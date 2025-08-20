import Geolocation from 'react-native-geolocation-service';
import {PermissionsAndroid, Platform} from 'react-native';
import {Location} from '../store/slices/locationSlice';

const API_BASE_URL = 'https://your-api-url.com/api';

class LocationService {
  private watchId: number | null = null;

  async requestPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        return auth === 'granted';
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to provide local content.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (error) {
      console.error('Location permission request error:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        async (position) => {
          try {
            const {latitude, longitude} = position.coords;
            const locationData = await this.reverseGeocode(latitude, longitude);
            resolve(locationData);
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          console.error('Get current location error:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    });
  }

  async watchLocation(
    onLocationUpdate: (location: Location) => void,
    onError?: (error: any) => void,
  ): Promise<void> {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        throw new Error('Location permission denied');
      }

      this.watchId = Geolocation.watchPosition(
        async (position) => {
          try {
            const {latitude, longitude} = position.coords;
            const locationData = await this.reverseGeocode(latitude, longitude);
            onLocationUpdate(locationData);
          } catch (error) {
            if (onError) onError(error);
          }
        },
        (error) => {
          console.error('Watch location error:', error);
          if (onError) onError(error);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 100, // Update every 100 meters
          interval: 10000, // Update every 10 seconds
          fastestInterval: 5000, // Fastest update every 5 seconds
        },
      );
    } catch (error) {
      console.error('Start watching location error:', error);
      throw error;
    }
  }

  stopWatchingLocation(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  private async reverseGeocode(latitude: number, longitude: number): Promise<Location> {
    try {
      // Using a reverse geocoding service (you can use Google Maps API, OpenStreetMap, etc.)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
      );

      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }

      const data = await response.json();
      const address = data.address;

      return {
        latitude,
        longitude,
        city: address.city || address.town || address.village || 'Unknown City',
        country: address.country || 'Unknown Country',
        region: address.state || address.region,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      // Fallback to basic location data
      return {
        latitude,
        longitude,
        city: 'Unknown City',
        country: 'Unknown Country',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    }
  }

  async updateLocation(location: Location): Promise<void> {
    try {
      const token = await this.getStoredToken();
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/user/location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(location),
      });

      if (!response.ok) {
        throw new Error('Failed to update location');
      }
    } catch (error) {
      console.error('Update location error:', error);
      throw error;
    }
  }

  async getNearbyEvents(location: Location, radius: number = 10): Promise<any[]> {
    try {
      const token = await this.getStoredToken();
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(
        `${API_BASE_URL}/events/nearby?lat=${location.latitude}&lng=${location.longitude}&radius=${radius}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch nearby events');
      }

      const data = await response.json();
      return data.events || [];
    } catch (error) {
      console.error('Get nearby events error:', error);
      throw error;
    }
  }

  async getLocalNews(location: Location): Promise<any[]> {
    try {
      const token = await this.getStoredToken();
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(
        `${API_BASE_URL}/news/local?city=${encodeURIComponent(location.city)}&country=${encodeURIComponent(location.country)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch local news');
      }

      const data = await response.json();
      return data.news || [];
    } catch (error) {
      console.error('Get local news error:', error);
      throw error;
    }
  }

  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private async getStoredToken(): Promise<string | null> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Get stored token error:', error);
      return null;
    }
  }
}

export const locationService = new LocationService();
