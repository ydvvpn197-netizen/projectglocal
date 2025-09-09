import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Settings, 
  MapPin, 
  Bell, 
  Filter, 
  Globe, 
  Clock, 
  Save,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface NewsPreferences {
  id?: string;
  user_id: string;
  preferred_categories: string[];
  excluded_categories: string[];
  preferred_sources: string[];
  location_radius_km: number;
  home_location: {
    city: string;
    state: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  };
  notification_settings: {
    email_notifications: boolean;
    push_notifications: boolean;
    breaking_news: boolean;
    daily_digest: boolean;
    weekly_summary: boolean;
  };
  display_preferences: {
    show_summaries: boolean;
    show_sentiment: boolean;
    show_reading_time: boolean;
    articles_per_page: number;
    auto_refresh_interval: number; // in minutes
  };
  created_at?: string;
  updated_at?: string;
}

interface NewsPreferencesProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewsPreferences: React.FC<NewsPreferencesProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NewsPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { value: 'community', label: 'Community', description: 'Local events and community news' },
    { value: 'infrastructure', label: 'Infrastructure', description: 'Transportation, utilities, and development' },
    { value: 'arts', label: 'Arts & Culture', description: 'Cultural events, exhibitions, and performances' },
    { value: 'environment', label: 'Environment', description: 'Environmental issues and sustainability' },
    { value: 'technology', label: 'Technology', description: 'Tech news and digital developments' },
    { value: 'business', label: 'Business', description: 'Local business and economic news' },
    { value: 'health', label: 'Health', description: 'Healthcare and wellness news' },
    { value: 'education', label: 'Education', description: 'Schools, universities, and educational news' },
    { value: 'sports', label: 'Sports', description: 'Local sports teams and events' },
    { value: 'politics', label: 'Politics', description: 'Government and political news' }
  ];

  const locations = [
    { value: 'delhi', label: 'Delhi', coordinates: { lat: 28.6139, lng: 77.2090 } },
    { value: 'mumbai', label: 'Mumbai', coordinates: { lat: 19.0760, lng: 72.8777 } },
    { value: 'bangalore', label: 'Bangalore', coordinates: { lat: 12.9716, lng: 77.5946 } },
    { value: 'chennai', label: 'Chennai', coordinates: { lat: 13.0827, lng: 80.2707 } },
    { value: 'kolkata', label: 'Kolkata', coordinates: { lat: 22.5726, lng: 88.3639 } }
  ];

  // Load user preferences
  const loadPreferences = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    // setError(null);

    try {
      const { data, error } = await supabase
        .from('user_news_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setPreferences(data);
      } else {
        // Create default preferences
        const defaultPreferences: NewsPreferences = {
          user_id: user.id,
          preferred_categories: ['community', 'infrastructure', 'business'],
          excluded_categories: [],
          preferred_sources: [],
          location_radius_km: 50,
          home_location: {
            city: 'Delhi',
            state: 'Delhi',
            country: 'India',
            coordinates: { lat: 28.6139, lng: 77.2090 }
          },
          notification_settings: {
            email_notifications: true,
            push_notifications: true,
            breaking_news: true,
            daily_digest: false,
            weekly_summary: true
          },
          display_preferences: {
            show_summaries: true,
            show_sentiment: true,
            show_reading_time: true,
            articles_per_page: 20,
            auto_refresh_interval: 5
          }
        };
        setPreferences(defaultPreferences);
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
      // Don't set error, just use defaults
      const defaultPreferences: NewsPreferences = {
        user_id: user.id,
        preferred_categories: ['community', 'infrastructure', 'business'],
        excluded_categories: [],
        preferred_sources: [],
        location_radius_km: 50,
        home_location: {
          city: 'Delhi',
          state: 'Delhi',
          country: 'India',
          coordinates: { lat: 28.6139, lng: 77.2090 }
        },
        notification_settings: {
          email_notifications: true,
          push_notifications: true,
          breaking_news: true,
          daily_digest: false,
          weekly_summary: true
        },
        display_preferences: {
          show_summaries: true,
          show_sentiment: true,
          show_reading_time: true,
          articles_per_page: 20,
          auto_refresh_interval: 5
        }
      };
      setPreferences(defaultPreferences);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Save preferences
  const savePreferences = useCallback(async () => {
    if (!user || !preferences) return;

    setSaving(true);
    // setError(null);

    try {
      const { error } = await supabase
        .from('user_news_preferences')
        .upsert({
          ...preferences,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;

      toast({
        title: "Preferences saved",
        description: "Your news preferences have been updated successfully.",
      });
    } catch (err) {
      console.error('Error saving preferences:', err);
      // setError('Failed to save preferences');
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [user, preferences, toast]);

  // Update preference field
  const updatePreference = useCallback((path: string, value: unknown) => {
    setPreferences(prev => {
      if (!prev) return prev;

      const newPrefs = { ...prev };
      const keys = path.split('.');
      let current = newPrefs as Record<string, unknown>;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newPrefs;
    });
  }, []);

  // Toggle category preference
  const toggleCategory = useCallback((category: string, isPreferred: boolean) => {
    if (!preferences) return;

    if (isPreferred) {
      const newPreferred = preferences.preferred_categories.includes(category)
        ? preferences.preferred_categories.filter(c => c !== category)
        : [...preferences.preferred_categories, category];
      
      const newExcluded = preferences.excluded_categories.filter(c => c !== category);
      
      updatePreference('preferred_categories', newPreferred);
      updatePreference('excluded_categories', newExcluded);
    } else {
      const newExcluded = preferences.excluded_categories.includes(category)
        ? preferences.excluded_categories.filter(c => c !== category)
        : [...preferences.excluded_categories, category];
      
      const newPreferred = preferences.preferred_categories.filter(c => c !== category);
      
      updatePreference('excluded_categories', newExcluded);
      updatePreference('preferred_categories', newPreferred);
    }
  }, [preferences, updatePreference]);

  // Load preferences on mount
  useEffect(() => {
    if (isOpen && user) {
      loadPreferences();
    }
  }, [isOpen, user, loadPreferences]);

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-2xl mx-4">
          <CardContent className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading your news preferences...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-2xl mx-4">
          <CardContent className="p-8 text-center">
            <XCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadPreferences} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!preferences) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-gradient">
              <Settings className="h-5 w-5" />
              News Preferences
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Location Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-gradient-community">
              <MapPin className="h-5 w-5" />
              Location Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="home-location">Home Location</Label>
                <Select
                  value={preferences.home_location.city.toLowerCase()}
                  onValueChange={(value) => {
                    const location = locations.find(l => l.value === value);
                    if (location) {
                      updatePreference('home_location', {
                        city: location.label,
                        state: location.label,
                        country: 'India',
                        coordinates: location.coordinates
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your city" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.value} value={location.value}>
                        {location.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="radius">Search Radius: {preferences.location_radius_km} km</Label>
                <Slider
                  value={[preferences.location_radius_km]}
                  onValueChange={([value]) => updatePreference('location_radius_km', value)}
                  max={200}
                  min={10}
                  step={10}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Category Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-gradient-community">
              <Filter className="h-5 w-5" />
              Category Preferences
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-green-600 font-medium">Preferred Categories</Label>
                <div className="space-y-2 mt-2">
                  {categories.map((category) => (
                    <div key={category.value} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium">{category.label}</div>
                        <div className="text-sm text-gray-500">{category.description}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {preferences.preferred_categories.includes(category.value) && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Preferred
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant={preferences.preferred_categories.includes(category.value) ? "default" : "outline"}
                          onClick={() => toggleCategory(category.value, true)}
                        >
                          {preferences.preferred_categories.includes(category.value) ? 'Remove' : 'Add'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-red-600 font-medium">Excluded Categories</Label>
                <div className="space-y-2 mt-2">
                  {categories.map((category) => (
                    <div key={category.value} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium">{category.label}</div>
                        <div className="text-sm text-gray-500">{category.description}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {preferences.excluded_categories.includes(category.value) && (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Excluded
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant={preferences.excluded_categories.includes(category.value) ? "destructive" : "outline"}
                          onClick={() => toggleCategory(category.value, false)}
                        >
                          {preferences.excluded_categories.includes(category.value) ? 'Remove' : 'Exclude'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-gradient-community">
              <Bell className="h-5 w-5" />
              Notification Settings
            </h3>
            
            <div className="space-y-4">
              {Object.entries(preferences.notification_settings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                    <p className="text-sm text-gray-500">
                      {key === 'email_notifications' && 'Receive news updates via email'}
                      {key === 'push_notifications' && 'Get push notifications for breaking news'}
                      {key === 'breaking_news' && 'Immediate alerts for breaking news'}
                      {key === 'daily_digest' && 'Daily summary of top stories'}
                      {key === 'weekly_summary' && 'Weekly roundup of important news'}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => updatePreference(`notification_settings.${key}`, checked)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Display Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-gradient-community">
              <Globe className="h-5 w-5" />
              Display Preferences
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                {Object.entries(preferences.display_preferences).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Label>
                      <p className="text-sm text-gray-500">
                        {key === 'show_summaries' && 'Display AI-generated summaries'}
                        {key === 'show_sentiment' && 'Show sentiment analysis'}
                        {key === 'show_reading_time' && 'Display estimated reading time'}
                        {key === 'articles_per_page' && 'Number of articles per page'}
                        {key === 'auto_refresh_interval' && 'Auto-refresh interval (minutes)'}
                      </p>
                    </div>
                    {typeof value === 'boolean' ? (
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => updatePreference(`display_preferences.${key}`, checked)}
                      />
                    ) : (
                      <Input
                        type="number"
                        value={value}
                        onChange={(e) => updatePreference(`display_preferences.${key}`, parseInt(e.target.value))}
                        className="w-20"
                        min={key === 'articles_per_page' ? 5 : 1}
                        max={key === 'articles_per_page' ? 100 : 60}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t">
            <Button onClick={savePreferences} disabled={saving} className="btn-community">
              {saving ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </div>
    </div>
  );
};
