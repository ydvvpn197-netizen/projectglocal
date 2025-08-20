import { NewsArticle } from '@/types/news';

export interface LocationInfo {
  lat: number;
  lng: number;
  name: string;
  confidence: number;
}

export class NewsLocationExtractor {
  /**
   * Extract location information from news article
   */
  async extractLocation(article: NewsArticle): Promise<LocationInfo | null> {
    try {
      // Combine all text content for location extraction
      const text = `${article.title} ${article.description} ${article.content}`.toLowerCase();
      
      // Try multiple extraction methods
      const locationInfo = 
        this.extractFromText(text) ||
        this.extractFromLocationName(article.location_name) ||
        this.extractFromTags(article.tags);
      
      return locationInfo;
    } catch (error) {
      console.error('Error extracting location from article:', error);
      return null;
    }
  }

  /**
   * Extract location from text content
   */
  private extractFromText(text: string): LocationInfo | null {
    // Common city patterns
    const cityPatterns = [
      /in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
      /at\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
      /from\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g
    ];

    for (const pattern of cityPatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        const cityName = matches[0].replace(/^(in|at|from)\s+/i, '').trim();
        const coordinates = this.getCityCoordinates(cityName);
        if (coordinates) {
          return {
            lat: coordinates.lat,
            lng: coordinates.lng,
            name: cityName,
            confidence: 0.7
          };
        }
      }
    }

    return null;
  }

  /**
   * Extract location from existing location name
   */
  private extractFromLocationName(locationName?: string): LocationInfo | null {
    if (!locationName) return null;

    const coordinates = this.getCityCoordinates(locationName);
    if (coordinates) {
      return {
        lat: coordinates.lat,
        lng: coordinates.lng,
        name: locationName,
        confidence: 0.9
      };
    }

    return null;
  }

  /**
   * Extract location from tags
   */
  private extractFromTags(tags: string[]): LocationInfo | null {
    for (const tag of tags) {
      const coordinates = this.getCityCoordinates(tag);
      if (coordinates) {
        return {
          lat: coordinates.lat,
          lng: coordinates.lng,
          name: tag,
          confidence: 0.8
        };
      }
    }

    return null;
  }

  /**
   * Get coordinates for a city name
   */
  private getCityCoordinates(cityName: string): { lat: number; lng: number } | null {
    // Simple city coordinates database
    const cityCoordinates: Record<string, { lat: number; lng: number }> = {
      'new york': { lat: 40.7128, lng: -74.0060 },
      'los angeles': { lat: 34.0522, lng: -118.2437 },
      'chicago': { lat: 41.8781, lng: -87.6298 },
      'houston': { lat: 29.7604, lng: -95.3698 },
      'phoenix': { lat: 33.4484, lng: -112.0740 },
      'philadelphia': { lat: 39.9526, lng: -75.1652 },
      'san antonio': { lat: 29.4241, lng: -98.4936 },
      'san diego': { lat: 32.7157, lng: -117.1611 },
      'dallas': { lat: 32.7767, lng: -96.7970 },
      'san jose': { lat: 37.3382, lng: -121.8863 },
      'austin': { lat: 30.2672, lng: -97.7431 },
      'jacksonville': { lat: 30.3322, lng: -81.6557 },
      'fort worth': { lat: 32.7555, lng: -97.3308 },
      'columbus': { lat: 39.9612, lng: -82.9988 },
      'charlotte': { lat: 35.2271, lng: -80.8431 },
      'san francisco': { lat: 37.7749, lng: -122.4194 },
      'indianapolis': { lat: 39.7684, lng: -86.1581 },
      'seattle': { lat: 47.6062, lng: -122.3321 },
      'denver': { lat: 39.7392, lng: -104.9903 },
      'washington': { lat: 38.9072, lng: -77.0369 },
      'boston': { lat: 42.3601, lng: -71.0589 },
      'el paso': { lat: 31.7619, lng: -106.4850 },
      'nashville': { lat: 36.1627, lng: -86.7816 },
      'detroit': { lat: 42.3314, lng: -83.0458 },
      'oklahoma city': { lat: 35.4676, lng: -97.5164 },
      'portland': { lat: 45.5152, lng: -122.6784 },
      'las vegas': { lat: 36.1699, lng: -115.1398 },
      'memphis': { lat: 35.1495, lng: -90.0490 },
      'louisville': { lat: 38.2527, lng: -85.7585 },
      'baltimore': { lat: 39.2904, lng: -76.6122 },
      'milwaukee': { lat: 43.0389, lng: -87.9065 },
      'albuquerque': { lat: 35.0844, lng: -106.6504 },
      'tucson': { lat: 32.2226, lng: -110.9747 },
      'fresno': { lat: 36.7378, lng: -119.7871 },
      'sacramento': { lat: 38.5816, lng: -121.4944 },
      'atlanta': { lat: 33.7490, lng: -84.3880 },
      'kansas city': { lat: 39.0997, lng: -94.5786 },
      'miami': { lat: 25.7617, lng: -80.1918 },
      'raleigh': { lat: 35.7796, lng: -78.6382 },
      'omaha': { lat: 41.2565, lng: -95.9345 },
      'minneapolis': { lat: 44.9778, lng: -93.2650 },
      'tulsa': { lat: 36.1540, lng: -95.9928 },
      'cleveland': { lat: 41.4993, lng: -81.6944 },
      'wichita': { lat: 37.6872, lng: -97.3301 },
      'arlington': { lat: 32.7357, lng: -97.1081 },
      'new orleans': { lat: 29.9511, lng: -90.0715 },
      'bakersfield': { lat: 35.3733, lng: -119.0187 },
      'tampa': { lat: 27.9506, lng: -82.4572 },
      'honolulu': { lat: 21.3099, lng: -157.8581 },
      'aurora': { lat: 39.7294, lng: -104.8319 },
      'anaheim': { lat: 33.8366, lng: -117.9143 },
      'santa ana': { lat: 33.7455, lng: -117.8677 },
      'corpus christi': { lat: 27.8006, lng: -97.3964 },
      'riverside': { lat: 33.9533, lng: -117.3962 },
      'lexington': { lat: 38.0406, lng: -84.5037 },
      'stockton': { lat: 37.9577, lng: -121.2908 },
      'henderson': { lat: 36.0395, lng: -114.9817 },
      'saint paul': { lat: 44.9537, lng: -93.0900 },
      'st. louis': { lat: 38.6270, lng: -90.1994 },
      'cincinnati': { lat: 39.1031, lng: -84.5120 },
      'pittsburgh': { lat: 40.4406, lng: -79.9959 },
      'anchorage': { lat: 61.2181, lng: -149.9003 },
      'greensboro': { lat: 36.0726, lng: -79.7920 },
      'plano': { lat: 33.0198, lng: -96.6989 },
      'newark': { lat: 40.7357, lng: -74.1724 },
      'lincoln': { lat: 40.8136, lng: -96.7026 },
      'orlando': { lat: 28.5383, lng: -81.3792 },
      'irvine': { lat: 33.6846, lng: -117.8265 },
      'durham': { lat: 35.9940, lng: -78.8986 },
      'chula vista': { lat: 32.6401, lng: -117.0842 },
      'toledo': { lat: 41.6528, lng: -83.5379 },
      'fort wayne': { lat: 41.0793, lng: -85.1394 },
      'st. petersburg': { lat: 27.7731, lng: -82.6400 },
      'laredo': { lat: 27.5064, lng: -99.5075 },
      'jersey city': { lat: 40.7178, lng: -74.0431 },
      'chandler': { lat: 33.3062, lng: -111.8413 },
      'madison': { lat: 43.0731, lng: -89.4012 },
      'lubbock': { lat: 33.5779, lng: -101.8552 },
      'scottsdale': { lat: 33.4942, lng: -111.9261 },
      'reno': { lat: 39.5296, lng: -119.8138 },
      'buffalo': { lat: 42.8864, lng: -78.8784 },
      'gilbert': { lat: 33.3528, lng: -111.7890 },
      'glendale': { lat: 33.5387, lng: -112.1860 },
      'north las vegas': { lat: 36.1989, lng: -115.1175 },
      'winston-salem': { lat: 36.0999, lng: -80.2442 },
      'chesapeake': { lat: 36.7682, lng: -76.2875 },
      'norfolk': { lat: 36.8508, lng: -76.2859 },
      'fremont': { lat: 37.5485, lng: -121.9886 },
      'garland': { lat: 32.9126, lng: -96.6389 },
      'irving': { lat: 32.8140, lng: -96.9489 },
      'hialeah': { lat: 25.8576, lng: -80.2781 },
      'richmond': { lat: 37.5407, lng: -77.4360 },
      'boise': { lat: 43.6150, lng: -116.2023 },
      'spokane': { lat: 47.6588, lng: -117.4260 }
    };

    const normalizedCityName = cityName.toLowerCase().trim();
    return cityCoordinates[normalizedCityName] || null;
  }

  /**
   * Extract location from URL
   */
  private extractFromUrl(url?: string): LocationInfo | null {
    if (!url) return null;

    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      
      // Extract location from domain patterns
      const locationPatterns = [
        /^([a-z]+)\.example\.com$/,
        /^news\.([a-z]+)\.com$/,
        /^([a-z]+)news\.com$/
      ];

      for (const pattern of locationPatterns) {
        const match = hostname.match(pattern);
        if (match) {
          const cityName = match[1];
          const coordinates = this.getCityCoordinates(cityName);
          if (coordinates) {
            return {
              lat: coordinates.lat,
              lng: coordinates.lng,
              name: cityName,
              confidence: 0.6
            };
          }
        }
      }
    } catch (error) {
      // Invalid URL, ignore
    }

    return null;
  }

  /**
   * Batch extract locations from multiple articles
   */
  async extractLocationsBatch(articles: NewsArticle[]): Promise<Map<string, LocationInfo>> {
    const locationMap = new Map<string, LocationInfo>();
    
    for (const article of articles) {
      const locationInfo = await this.extractLocation(article);
      if (locationInfo) {
        locationMap.set(article.id, locationInfo);
      }
    }
    
    return locationMap;
  }

  /**
   * Validate location coordinates
   */
  validateCoordinates(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  /**
   * Calculate distance between two locations
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
