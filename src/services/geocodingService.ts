// Geocoding service for reverse geocoding and location detection
import type { LocationData } from '@/types/news';

export interface GeocodingResult {
  city: string;
  country: string;
  state?: string;
  countryCode: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
}

export class GeocodingService {
  private static instance: GeocodingService;
  private cache = new Map<string, GeocodingResult>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  static getInstance(): GeocodingService {
    if (!GeocodingService.instance) {
      GeocodingService.instance = new GeocodingService();
    }
    return GeocodingService.instance;
  }

  // Reverse geocoding using OpenStreetMap Nominatim (free)
  async reverseGeocode(latitude: number, longitude: number): Promise<GeocodingResult> {
    const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      return cached;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`,
        {
          headers: {
            'User-Agent': 'TheGlocal-News/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data = await response.json();
      
      const result: GeocodingResult = {
        city: this.extractCity(data),
        country: this.extractCountry(data),
        state: this.extractState(data),
        countryCode: data.address?.country_code?.toUpperCase() || 'IN',
        formattedAddress: data.display_name || '',
        latitude,
        longitude
      };

      // Cache the result
      this.cache.set(cacheKey, result);

      return result;
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
      
      // Fallback to Delhi, India
      return {
        city: 'Delhi',
        country: 'India',
        state: 'Delhi',
        countryCode: 'IN',
        formattedAddress: 'Delhi, India',
        latitude: 28.6139,
        longitude: 77.2090
      };
    }
  }

  // Forward geocoding to get coordinates from address
  async forwardGeocode(address: string): Promise<GeocodingResult | null> {
    const cacheKey = `forward:${address.toLowerCase()}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&addressdetails=1&limit=1&accept-language=en`,
        {
          headers: {
            'User-Agent': 'TheGlocal-News/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.length === 0) {
        return null;
      }

      const result: GeocodingResult = {
        city: this.extractCity(data[0]),
        country: this.extractCountry(data[0]),
        state: this.extractState(data[0]),
        countryCode: data[0].address?.country_code?.toUpperCase() || 'IN',
        formattedAddress: data[0].display_name || '',
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };

      // Cache the result
      this.cache.set(cacheKey, result);

      return result;
    } catch (error) {
      console.error('Error in forward geocoding:', error);
      return null;
    }
  }

  // Get current location with reverse geocoding
  async getCurrentLocationWithGeocoding(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        // Fallback to Delhi, India
        resolve({
          city: 'Delhi',
          country: 'India',
          latitude: 28.6139,
          longitude: 77.2090
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const geocodingResult = await this.reverseGeocode(latitude, longitude);
            
            resolve({
              city: geocodingResult.city,
              country: geocodingResult.country,
              latitude,
              longitude
            });
          } catch (error) {
            console.error('Error in geocoding:', error);
            // Fallback to coordinates without geocoding
            resolve({
              city: 'Unknown',
              country: 'Unknown',
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Fallback to Delhi, India
          resolve({
            city: 'Delhi',
            country: 'India',
            latitude: 28.6139,
            longitude: 77.2090
          });
        },
        {
          timeout: 10000,
          enableHighAccuracy: false,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Search for cities by name
  async searchCities(query: string): Promise<GeocodingResult[]> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=10&accept-language=en&featuretype=city`,
        {
          headers: {
            'User-Agent': 'TheGlocal-News/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.map((item: Record<string, unknown>) => {
        const address = item.address as Record<string, unknown> | undefined;
        return {
          city: this.extractCity(item),
          country: this.extractCountry(item),
          state: this.extractState(item),
          countryCode: (address?.country_code as string)?.toUpperCase() || 'IN',
          formattedAddress: (item.display_name as string) || '',
          latitude: parseFloat(item.lat as string),
          longitude: parseFloat(item.lon as string)
        };
      });
    } catch (error) {
      console.error('Error searching cities:', error);
      return [];
    }
  }

  // Helper methods to extract location components
  private extractCity(data: Record<string, unknown>): string {
    const address = data.address as Record<string, unknown> | undefined;
    return (address?.city as string) || 
           (address?.town as string) || 
           (address?.village as string) || 
           (address?.municipality as string) ||
           (address?.county as string) ||
           'Unknown';
  }

  private extractCountry(data: Record<string, unknown>): string {
    const address = data.address as Record<string, unknown> | undefined;
    return (address?.country as string) || 'Unknown';
  }

  private extractState(data: Record<string, unknown>): string | undefined {
    const address = data.address as Record<string, unknown> | undefined;
    return (address?.state as string) || 
           (address?.province as string) || 
           (address?.region as string);
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache size
  getCacheSize(): number {
    return this.cache.size;
  }
}

// Export singleton instance
export const geocodingService = GeocodingService.getInstance();
