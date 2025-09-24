import { Location, LocationSearchResult } from '../types/location';
import { GoogleMapsPlace, LocationCacheData } from '@/types/extended';

/**
 * Calculate distance between two points using Haversine formula
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 * @param distance Distance in kilometers
 * @returns Formatted distance string
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)}km`;
  } else {
    return `${Math.round(distance)}km`;
  }
}

/**
 * Validate coordinates
 * @param lat Latitude
 * @param lng Longitude
 * @returns True if coordinates are valid
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return (
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !isNaN(lat) &&
    !isNaN(lng)
  );
}

/**
 * Get location from browser geolocation
 * @returns Promise with location coordinates
 */
export function getCurrentLocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        resolve(location);
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}

/**
 * Reverse geocode coordinates to address using Google Geocoding API
 * @param lat Latitude
 * @param lng Longitude
 * @returns Promise with formatted address
 */
import { googleMaps } from '@/config/environment';

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const apiKey = googleMaps.apiKey;
    if (!apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch geocoding data');
    }

    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].formatted_address;
    } else {
      throw new Error('No results found for coordinates');
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
}

/**
 * Search for places using Google Places API
 * @param query Search query
 * @param location Optional location to bias search
 * @returns Promise with search results
 */
export async function searchPlaces(
  query: string,
  location?: Location
): Promise<LocationSearchResult[]> {
  try {
    const apiKey = googleMaps.apiKey;
    if (!apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      query
    )}&key=${apiKey}`;

    if (location) {
      url += `&location=${location.lat},${location.lng}&radius=50000`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch places data');
    }

    const data = await response.json();
    
    if (data.status === 'OK') {
      return data.results.map((place: GoogleMapsPlace) => ({
        id: place.place_id,
        name: place.name,
        address: place.formatted_address,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
      }));
    } else {
      throw new Error(`Places API error: ${data.status}`);
    }
  } catch (error) {
    console.error('Places search error:', error);
    return [];
  }
}

/**
 * Get location name from coordinates
 * @param lat Latitude
 * @param lng Longitude
 * @returns Promise with location name
 */
export async function getLocationName(lat: number, lng: number): Promise<string> {
  try {
    const address = await reverseGeocode(lat, lng);
    // Extract city name from address
    const parts = address.split(',');
    if (parts.length >= 2) {
      return parts[1].trim();
    }
    return address;
  } catch (error) {
    console.error('Error getting location name:', error);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

/**
 * Sort locations by distance from a reference point
 * @param locations Array of locations
 * @param refLat Reference latitude
 * @param refLng Reference longitude
 * @returns Sorted array of locations
 */
export function sortByDistance(
  locations: LocationSearchResult[],
  refLat: number,
  refLng: number
): LocationSearchResult[] {
  return locations
    .map((location) => ({
      ...location,
      distance: calculateDistance(refLat, refLng, location.lat, location.lng),
    }))
    .sort((a, b) => (a.distance || 0) - (b.distance || 0));
}

/**
 * Check if a location is within a specified radius
 * @param centerLat Center latitude
 * @param centerLng Center longitude
 * @param targetLat Target latitude
 * @param targetLng Target longitude
 * @param radiusKm Radius in kilometers
 * @returns True if location is within radius
 */
export function isWithinRadius(
  centerLat: number,
  centerLng: number,
  targetLat: number,
  targetLng: number,
  radiusKm: number
): boolean {
  const distance = calculateDistance(centerLat, centerLng, targetLat, targetLng);
  return distance <= radiusKm;
}

/**
 * Cache location data in localStorage
 * @param key Cache key
 * @param data Data to cache
 * @param ttl Time to live in milliseconds
 */
export function cacheLocationData(key: string, data: LocationCacheData, ttl: number = 300000): void {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    localStorage.setItem(`location_cache_${key}`, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error caching location data:', error);
  }
}

/**
 * Get cached location data
 * @param key Cache key
 * @returns Cached data or null if expired/not found
 */
export function getCachedLocationData(key: string): LocationCacheData | null {
  try {
    const cached = localStorage.getItem(`location_cache_${key}`);
    if (!cached) return null;

    const cacheData = JSON.parse(cached);
    const now = Date.now();
    
    if (now - cacheData.timestamp > cacheData.ttl) {
      localStorage.removeItem(`location_cache_${key}`);
      return null;
    }

    return cacheData.data;
  } catch (error) {
    console.error('Error getting cached location data:', error);
    return null;
  }
}

/**
 * Clear all location cache
 */
export function clearLocationCache(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith('location_cache_')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing location cache:', error);
  }
}
