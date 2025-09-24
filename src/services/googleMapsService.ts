/**
 * Google Maps Service for location-based features
 * Provides geocoding, places search, and map integration
 */

import { googleMapsConfig } from '@/config/environment';

export interface GeocodeResult {
  lat: number;
  lng: number;
  formatted_address: string;
  place_id: string;
  types: string[];
}

export interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
  rating?: number;
  price_level?: number;
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
}

export interface PlacesSearchResult {
  results: PlaceResult[];
  status: string;
  next_page_token?: string;
}

export interface DirectionsResult {
  routes: Array<{
    legs: Array<{
      distance: { text: string; value: number };
      duration: { text: string; value: number };
      start_address: string;
      end_address: string;
      steps: Array<{
        html_instructions: string;
        distance: { text: string; value: number };
        duration: { text: string; value: number };
      }>;
    }>;
    overview_polyline: { points: string };
  }>;
  status: string;
}

export class GoogleMapsService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api';

  constructor() {
    this.apiKey = googleMapsConfig.apiKey;
  }

  /**
   * Check if Google Maps API is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey !== '';
  }

  /**
   * Geocode an address to get coordinates
   */
  async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    if (!this.isConfigured()) {
      console.warn('Google Maps API key not configured');
      return null;
    }

    try {
      const url = `${this.baseUrl}/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        return {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          formatted_address: result.formatted_address,
          place_id: result.place_id,
          types: result.types
        };
      }

      return null;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  }

  /**
   * Reverse geocode coordinates to get address
   */
  async reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
    if (!this.isConfigured()) {
      console.warn('Google Maps API key not configured');
      return null;
    }

    try {
      const url = `${this.baseUrl}/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        return {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          formatted_address: result.formatted_address,
          place_id: result.place_id,
          types: result.types
        };
      }

      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  /**
   * Search for places near a location
   */
  async searchPlaces(
    query: string,
    location?: { lat: number; lng: number },
    radius: number = 5000,
    type?: string
  ): Promise<PlaceResult[]> {
    if (!this.isConfigured()) {
      console.warn('Google Maps API key not configured');
      return [];
    }

    try {
      let url = `${this.baseUrl}/place/textsearch/json?query=${encodeURIComponent(query)}&key=${this.apiKey}`;
      
      if (location) {
        url += `&location=${location.lat},${location.lng}&radius=${radius}`;
      }
      
      if (type) {
        url += `&type=${type}`;
      }

      const response = await fetch(url);
      const data: PlacesSearchResult = await response.json();

      if (data.status === 'OK') {
        return data.results;
      }

      return [];
    } catch (error) {
      console.error('Error searching places:', error);
      return [];
    }
  }

  /**
   * Get nearby places by type
   */
  async getNearbyPlaces(
    location: { lat: number; lng: number },
    type: string,
    radius: number = 5000
  ): Promise<PlaceResult[]> {
    if (!this.isConfigured()) {
      console.warn('Google Maps API key not configured');
      return [];
    }

    try {
      const url = `${this.baseUrl}/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius}&type=${type}&key=${this.apiKey}`;
      const response = await fetch(url);
      const data: PlacesSearchResult = await response.json();

      if (data.status === 'OK') {
        return data.results;
      }

      return [];
    } catch (error) {
      console.error('Error getting nearby places:', error);
      return [];
    }
  }

  /**
   * Get directions between two points
   */
  async getDirections(
    origin: string | { lat: number; lng: number },
    destination: string | { lat: number; lng: number },
    mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
  ): Promise<DirectionsResult | null> {
    if (!this.isConfigured()) {
      console.warn('Google Maps API key not configured');
      return null;
    }

    try {
      const originStr = typeof origin === 'string' ? origin : `${origin.lat},${origin.lng}`;
      const destinationStr = typeof destination === 'string' ? destination : `${destination.lat},${destination.lng}`;
      
      const url = `${this.baseUrl}/directions/json?origin=${encodeURIComponent(originStr)}&destination=${encodeURIComponent(destinationStr)}&mode=${mode}&key=${this.apiKey}`;
      const response = await fetch(url);
      const data: DirectionsResult = await response.json();

      if (data.status === 'OK') {
        return data;
      }

      return null;
    } catch (error) {
      console.error('Error getting directions:', error);
      return null;
    }
  }

  /**
   * Get place details by place ID
   */
  async getPlaceDetails(placeId: string): Promise<PlaceResult | null> {
    if (!this.isConfigured()) {
      console.warn('Google Maps API key not configured');
      return null;
    }

    try {
      const url = `${this.baseUrl}/place/details/json?place_id=${placeId}&fields=place_id,name,formatted_address,geometry,types,rating,price_level,photos&key=${this.apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK') {
        return data.result;
      }

      return null;
    } catch (error) {
      console.error('Error getting place details:', error);
      return null;
    }
  }

  /**
   * Calculate distance between two points
   */
  calculateDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(point2.lat - point1.lat);
    const dLon = this.deg2rad(point2.lng - point1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(point1.lat)) * Math.cos(this.deg2rad(point2.lat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  /**
   * Convert degrees to radians
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Get photo URL from photo reference
   */
  getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
    if (!this.isConfigured()) {
      return '';
    }
    return `${this.baseUrl}/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${this.apiKey}`;
  }

  /**
   * Generate static map URL
   */
  getStaticMapUrl(
    center: { lat: number; lng: number },
    zoom: number = 15,
    size: string = '400x400',
    markers?: Array<{ lat: number; lng: number; label?: string }>
  ): string {
    if (!this.isConfigured()) {
      return '';
    }

    let url = `${this.baseUrl}/staticmap?center=${center.lat},${center.lng}&zoom=${zoom}&size=${size}&key=${this.apiKey}`;
    
    if (markers && markers.length > 0) {
      const markersStr = markers.map(marker => 
        `${marker.lat},${marker.lng}${marker.label ? `|${marker.label}` : ''}`
      ).join('|');
      url += `&markers=${markersStr}`;
    }

    return url;
  }
}

// Export singleton instance
export const googleMapsService = new GoogleMapsService();
