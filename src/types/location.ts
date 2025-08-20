export interface Location {
  lat: number;
  lng: number;
  name?: string;
  address?: string;
  formatted_address?: string;
}

export interface LocationPreferences {
  id?: string;
  user_id: string;
  location_radius_km: number;
  location_categories: string[];
  location_notifications: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LocationSettings {
  enabled: boolean;
  auto_detect: boolean;
  radius_km: number;
  categories: string[];
  notifications: boolean;
}

export interface ContentLocation {
  id?: string;
  content_type: 'post' | 'event' | 'review' | 'poll' | 'artist';
  content_id: string;
  location_lat?: number;
  location_lng?: number;
  location_name?: string;
  location_address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface NearbyContent {
  content_type: string;
  content_id: string;
  distance_km: number;
  location_name?: string;
}

export interface LocationState {
  current: Location | null;
  enabled: boolean;
  auto_detect: boolean;
  loading: boolean;
  error: string | null;
}

export interface LocationFilter {
  enabled: boolean;
  radius_km: number;
  categories: string[];
  sort_by: 'distance' | 'relevance' | 'date';
}

export interface GeocodingResult {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
}

export interface LocationSearchResult {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance?: number;
}

export interface LocationStats {
  total_content: number;
  nearby_content: number;
  popular_locations: Array<{
    name: string;
    content_count: number;
  }>;
  user_radius_km: number;
}
