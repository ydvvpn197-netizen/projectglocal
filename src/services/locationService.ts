import { supabase } from '@/integrations/supabase/client';
import { checkTableExists, createUserPreferencesFallback } from '@/utils/databaseUtils';
import { 
  Location, 
  LocationPreferences, 
  ContentLocation, 
  NearbyContent,
  LocationSettings 
} from '../types/location';
import { 
  getCurrentLocation, 
  reverseGeocode, 
  getLocationName,
  searchPlaces,
  cacheLocationData,
  getCachedLocationData,
  clearLocationCache
} from '../utils/locationUtils';

export class LocationService {
  private static userPreferencesTableAvailable: boolean | null = null;

  /**
   * Check if user_preferences table is available
   */
  private static async checkUserPreferencesTable(): Promise<boolean> {
    if (this.userPreferencesTableAvailable !== null) {
      return this.userPreferencesTableAvailable;
    }

    try {
      const preferencesTable = await checkTableExists('user_preferences');
      this.userPreferencesTableAvailable = preferencesTable.exists;

      if (!this.userPreferencesTableAvailable) {
        console.warn('User preferences table not available. Using fallback preferences.');
      }

      return this.userPreferencesTableAvailable;
    } catch (error) {
      console.error('Error checking user preferences table:', error);
      this.userPreferencesTableAvailable = false;
      return false;
    }
  }

  /**
   * Get current user's location from browser or database
   */
  static async getCurrentUserLocation(): Promise<Location | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Check cache first
      const cached = getCachedLocationData(`user_${user.id}`);
      if (cached) return cached;

      // Get from database - use existing location columns
      const { data: profile } = await supabase
        .from('profiles')
        .select('latitude, longitude, real_time_location_enabled, location_city, location_state, location_country')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        // Use existing location columns
        if (profile.latitude && profile.longitude) {
          const location: Location = {
            lat: profile.latitude,
            lng: profile.longitude,
            name: profile.location_city ? `${profile.location_city}, ${profile.location_state || ''}`.trim() : undefined,
          };
          
          // Cache the result
          cacheLocationData(`user_${user.id}`, location);
          return location;
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting current user location:', error);
      return null;
    }
  }

  /**
   * Get user location preferences
   */
  static async getUserLocationPreferences(): Promise<LocationPreferences> {
    try {
      const tableAvailable = await this.checkUserPreferencesTable();
      
      if (!tableAvailable) {
        console.warn('User preferences table not available. Using fallback preferences.');
        return createUserPreferencesFallback();
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return createUserPreferencesFallback();

      const { data: preferences, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user preferences:', error);
        return createUserPreferencesFallback();
      }

      if (!preferences) {
        // Create default preferences
        const defaultPreferences = createUserPreferencesFallback();
        await this.saveUserLocationPreferences(defaultPreferences);
        return defaultPreferences;
      }

      return preferences;
    } catch (error) {
      console.error('Error getting user location preferences:', error);
      return createUserPreferencesFallback();
    }
  }

  /**
   * Save user location preferences
   */
  static async saveUserLocationPreferences(preferences: Partial<LocationPreferences>): Promise<boolean> {
    try {
      const tableAvailable = await this.checkUserPreferencesTable();
      
      if (!tableAvailable) {
        console.warn('User preferences table not available. Preferences not saved.');
        return false;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error saving user location preferences:', error);
      return false;
    }
  }

  /**
   * Detect and save user's current location
   */
  static async detectAndSaveLocation(): Promise<Location | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get current location from browser
      const location = await getCurrentLocation();
      
      // Get location name
      const locationName = await getLocationName(location.lat, location.lng);
      location.name = locationName;

      // Save to database
      const { error } = await supabase.rpc('update_user_location', {
        user_uuid: user.id,
        lat: location.lat,
        lng: location.lng,
        location_name: locationName
      });

      if (error) throw error;

      // Cache the result
      cacheLocationData(`user_${user.id}`, location);

      return location;
    } catch (error) {
      console.error('Error detecting and saving location:', error);
      return null;
    }
  }

  /**
   * Set manual location for user
   */
  static async setManualLocation(location: Location): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.rpc('update_user_location', {
        user_uuid: user.id,
        lat: location.lat,
        lng: location.lng,
        location_name: location.name || null
      });

      if (error) throw error;

      // Cache the result
      cacheLocationData(`user_${user.id}`, location);
    } catch (error) {
      console.error('Error setting manual location:', error);
      throw error;
    }
  }

  /**
   * Get user's location preferences
   */
  static async getUserPreferences(): Promise<LocationPreferences | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }

  /**
   * Update user's location preferences
   */
  static async updateUserPreferences(preferences: Partial<LocationPreferences>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  /**
   * Get location settings for current user
   */
  static async getLocationSettings(): Promise<LocationSettings> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const [profile, preferences] = await Promise.all([
        supabase
          .from('profiles')
          .select('real_time_location_enabled')
          .eq('user_id', user.id)
          .single(),
        this.getUserLocationPreferences()
      ]);

      // Use existing location settings
      const isEnabled = profile.data?.real_time_location_enabled ?? false;
      const autoDetect = true; // Default to true since we don't have this column

      return {
        enabled: isEnabled,
        auto_detect: autoDetect,
        radius_km: preferences?.location_radius_km || 50,
        categories: preferences?.location_categories || [],
        notifications: preferences?.location_notifications || true,
      };
    } catch (error) {
      console.error('Error getting location settings:', error);
      return {
        enabled: false,
        auto_detect: true,
        radius_km: 50,
        categories: [],
        notifications: true,
      };
    }
  }

  /**
   * Update location settings
   */
  static async updateLocationSettings(settings: Partial<LocationSettings>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Update profile - use existing column
      if (settings.enabled !== undefined) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            real_time_location_enabled: settings.enabled
          })
          .eq('user_id', user.id);

        if (profileError) throw profileError;
      }

      // Update preferences
      if (settings.radius_km !== undefined || settings.categories !== undefined || settings.notifications !== undefined) {
        await this.saveUserLocationPreferences({
          location_radius_km: settings.radius_km,
          location_categories: settings.categories,
          location_notifications: settings.notifications,
        });
      }

      // Clear cache to force refresh
      clearLocationCache();
    } catch (error) {
      console.error('Error updating location settings:', error);
      throw error;
    }
  }

  /**
   * Get nearby content based on user's location
   */
  static async getNearbyContent(
    radiusKm: number = 50,
    contentType?: string
  ): Promise<NearbyContent[]> {
    try {
      const userLocation = await this.getCurrentUserLocation();
      if (!userLocation) return [];

      const { data, error } = await supabase.rpc('get_nearby_content', {
        user_lat: userLocation.lat,
        user_lng: userLocation.lng,
        radius_km: radiusKm,
        content_type_filter: contentType || null
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting nearby content:', error);
      return [];
    }
  }

  /**
   * Add location to content
   */
  static async addContentLocation(contentLocation: Omit<ContentLocation, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('content_location')
        .insert(contentLocation);

      if (error) throw error;
    } catch (error) {
      console.error('Error adding content location:', error);
      throw error;
    }
  }

  /**
   * Update content location
   */
  static async updateContentLocation(
    contentType: string,
    contentId: string,
    location: Partial<Pick<ContentLocation, 'location_lat' | 'location_lng' | 'location_name' | 'location_address'>>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('content_location')
        .update(location)
        .eq('content_type', contentType)
        .eq('content_id', contentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating content location:', error);
      throw error;
    }
  }

  /**
   * Remove location from content
   */
  static async removeContentLocation(contentType: string, contentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('content_location')
        .delete()
        .eq('content_type', contentType)
        .eq('content_id', contentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing content location:', error);
      throw error;
    }
  }

  /**
   * Search for places
   */
  static async searchPlaces(query: string, location?: Location) {
    return searchPlaces(query, location);
  }

  /**
   * Get location name from coordinates
   */
  static async getLocationName(lat: number, lng: number): Promise<string> {
    return getLocationName(lat, lng);
  }

  /**
   * Enable/disable location services
   */
  static async toggleLocationServices(enabled: boolean): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Update both new and old columns for compatibility
      const { error } = await supabase
        .from('profiles')
        .update({ 
          location_enabled: enabled,
          real_time_location_enabled: enabled // Also update old column
        })
        .eq('id', user.id);

      if (error) throw error;

      if (!enabled) {
        // Clear cache when disabling
        clearLocationCache();
      }
    } catch (error) {
      console.error('Error toggling location services:', error);
      throw error;
    }
  }

  /**
   * Get location statistics for user
   */
  static async getLocationStats(): Promise<{
    total_content: number;
    nearby_content: number;
    user_radius_km: number;
  }> {
    try {
      const userLocation = await this.getCurrentUserLocation();
      const preferences = await this.getUserLocationPreferences();
      
      if (!userLocation) {
        return {
          total_content: 0,
          nearby_content: 0,
          user_radius_km: preferences?.location_radius_km || 50,
        };
      }

      const nearbyContent = await this.getNearbyContent(preferences?.location_radius_km || 50);
      
      // Get total content count
      const { count: totalContent } = await supabase
        .from('content_location')
        .select('*', { count: 'exact', head: true });

      return {
        total_content: totalContent || 0,
        nearby_content: nearbyContent.length,
        user_radius_km: preferences?.location_radius_km || 50,
      };
    } catch (error) {
      console.error('Error getting location stats:', error);
      return {
        total_content: 0,
        nearby_content: 0,
        user_radius_km: 50,
      };
    }
  }
}
