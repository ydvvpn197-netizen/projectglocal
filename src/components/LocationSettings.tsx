import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Settings, Bell, Globe, Save, Loader2 } from 'lucide-react';
import { useLocationManager } from '../hooks/useLocationManager';
import { LocationSettings as LocationSettingsType } from '../types/location';

interface LocationSettingsProps {
  className?: string;
}

const LOCATION_CATEGORIES = [
  { id: 'events', label: 'Events & Activities', description: 'Local events, concerts, workshops' },
  { id: 'news', label: 'Local News', description: 'Community news and updates' },
  { id: 'artists', label: 'Artists & Services', description: 'Local artists and service providers' },
  { id: 'reviews', label: 'Reviews & Recommendations', description: 'Local business reviews' },
  { id: 'discussions', label: 'Community Discussions', description: 'Local community posts and polls' },
  { id: 'businesses', label: 'Local Businesses', description: 'Restaurants, shops, and services' },
];

export function LocationSettings({ className = '' }: LocationSettingsProps) {
  const {
    settings,
    updateSettings,
    loading,
    error,
  } = useLocationManager();

  const [localSettings, setLocalSettings] = useState<LocationSettingsType>(settings);
  const [isSaving, setIsSaving] = useState(false);

  // Update local settings when settings prop changes
  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleToggleCategory = (categoryId: string) => {
    setLocalSettings(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const handleRadiusChange = (value: number[]) => {
    setLocalSettings(prev => ({
      ...prev,
      radius_km: value[0]
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(localSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(settings);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Location Preferences
        </CardTitle>
        <CardDescription>
          Customize your location-based experience and content preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Location Services Toggle */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Location Services</Label>
              <p className="text-sm text-muted-foreground">
                Enable location-based content personalization
              </p>
            </div>
            <Switch
              checked={localSettings.enabled}
              onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, enabled: checked }))}
              disabled={loading}
            />
          </div>
        </div>

        {localSettings.enabled && (
          <>
            <Separator />

            {/* Auto-Detection Toggle */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Auto-Detect Location</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically update your location when you move
                  </p>
                </div>
                <Switch
                  checked={localSettings.auto_detect}
                  onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, auto_detect: checked }))}
                  disabled={loading}
                />
              </div>
            </div>

            <Separator />

            {/* Radius Setting */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-medium">Search Radius</Label>
                <p className="text-sm text-muted-foreground">
                  Show content within {localSettings.radius_km}km of your location
                </p>
              </div>
              <div className="space-y-4">
                <Slider
                  value={[localSettings.radius_km]}
                  onValueChange={handleRadiusChange}
                  max={100}
                  min={5}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>5km</span>
                  <span>50km</span>
                  <span>100km</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Content Categories */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-medium">Content Categories</Label>
                <p className="text-sm text-muted-foreground">
                  Choose which types of content to show based on your location
                </p>
              </div>
              <div className="grid gap-3">
                {LOCATION_CATEGORIES.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Label className="font-medium cursor-pointer">
                            {category.label}
                          </Label>
                          {localSettings.categories.includes(category.id) && (
                            <Badge variant="secondary" className="text-xs">
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={localSettings.categories.includes(category.id)}
                      onCheckedChange={() => handleToggleCategory(category.id)}
                      disabled={loading}
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Notifications */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Location Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about new content in your area
                  </p>
                </div>
                <Switch
                  checked={localSettings.notifications}
                  onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, notifications: checked }))}
                  disabled={loading}
                />
              </div>
            </div>
          </>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 border border-destructive/20 bg-destructive/5 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Save Button */}
        {hasChanges && (
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSaving || loading}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded-lg">
          <p className="font-medium mb-1">Privacy & Data Usage</p>
          <ul className="space-y-1">
            <li>• Your location is only used to personalize content</li>
            <li>• Location data is stored securely and not shared with third parties</li>
            <li>• You can disable location services at any time</li>
            <li>• Location data is automatically updated when you move (if auto-detect is enabled)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
