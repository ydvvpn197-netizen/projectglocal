import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  User, 
  Users, 
  Globe, 
  Settings, 
  Bell, 
  BellOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Key,
  Database,
  Server,
  Cloud,
  Wifi,
  WifiOff,
  Signal,
  SignalZero,
  SignalLow,
  SignalMedium,
  SignalHigh,
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryHigh,
  BatteryFull,
  Plug,
  PlugZap,
  Zap,
  ZapOff,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  CloudHail,
  Wind,
  Thermometer,
  Droplets,
  Umbrella,
  Snowflake,
  TreePine,
  TreeDeciduous,
  Flower,
  Flower2,
  LeafIcon,
  LeafyGreen,
  Sprout
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PrivacyControlsProps {
  className?: string;
}

interface PrivacySettings {
  profile_visibility: 'public' | 'community' | 'private';
  show_real_name: boolean;
  show_location: boolean;
  show_contact_info: boolean;
  allow_messages: boolean;
  allow_follows: boolean;
  show_activity_status: boolean;
  data_collection: boolean;
  analytics_tracking: boolean;
  marketing_emails: boolean;
  push_notifications: boolean;
  location_tracking: boolean;
  search_visibility: boolean;
  government_tagging: boolean;
  community_discussions: boolean;
  event_attendance: boolean;
  poll_participation: boolean;
  protest_participation: boolean;
}

const PrivacyControls: React.FC<PrivacyControlsProps> = ({ className }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<PrivacySettings>({
    profile_visibility: 'community',
    show_real_name: false,
    show_location: false,
    show_contact_info: false,
    allow_messages: true,
    allow_follows: true,
    show_activity_status: false,
    data_collection: false,
    analytics_tracking: false,
    marketing_emails: false,
    push_notifications: true,
    location_tracking: false,
    search_visibility: true,
    government_tagging: true,
    community_discussions: true,
    event_attendance: true,
    poll_participation: true,
    protest_participation: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPrivacySettings();
  }, [user, loadPrivacySettings]);

  const loadPrivacySettings = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_privacy_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
      toast({
        title: "Error",
        description: "Failed to load privacy settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const savePrivacySettings = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_privacy_settings')
        .upsert({
          user_id: user.id,
          settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Privacy settings saved",
        description: "Your privacy preferences have been updated",
      });
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast({
        title: "Error",
        description: "Failed to save privacy settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof PrivacySettings, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return Globe;
      case 'community': return Users;
      case 'private': return Lock;
      default: return Eye;
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'text-green-600';
      case 'community': return 'text-blue-600';
      case 'private': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Privacy Controls
          </h1>
          <p className="text-muted-foreground mt-1">
            Control your privacy and data sharing preferences
          </p>
        </div>
        
        <Button onClick={savePrivacySettings} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="participation" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Participation
          </TabsTrigger>
        </TabsList>

        {/* Profile Privacy */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Profile Visibility
              </CardTitle>
              <CardDescription>
                Control who can see your profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Profile Visibility</label>
                  <p className="text-xs text-muted-foreground">
                    Who can see your profile
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getVisibilityColor(settings.profile_visibility)}>
                    {settings.profile_visibility}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const options = ['public', 'community', 'private'];
                      const currentIndex = options.indexOf(settings.profile_visibility);
                      const nextIndex = (currentIndex + 1) % options.length;
                      updateSetting('profile_visibility', options[nextIndex]);
                    }}
                  >
                    Change
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Show Real Name</label>
                    <p className="text-xs text-muted-foreground">
                      Display your real name instead of username
                    </p>
                  </div>
                  <Switch
                    checked={settings.show_real_name}
                    onCheckedChange={(checked) => updateSetting('show_real_name', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Show Location</label>
                    <p className="text-xs text-muted-foreground">
                      Display your city and state
                    </p>
                  </div>
                  <Switch
                    checked={settings.show_location}
                    onCheckedChange={(checked) => updateSetting('show_location', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Show Contact Info</label>
                    <p className="text-xs text-muted-foreground">
                      Display email and phone number
                    </p>
                  </div>
                  <Switch
                    checked={settings.show_contact_info}
                    onCheckedChange={(checked) => updateSetting('show_contact_info', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Allow Messages</label>
                    <p className="text-xs text-muted-foreground">
                      Let other users send you messages
                    </p>
                  </div>
                  <Switch
                    checked={settings.allow_messages}
                    onCheckedChange={(checked) => updateSetting('allow_messages', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Allow Follows</label>
                    <p className="text-xs text-muted-foreground">
                      Let other users follow you
                    </p>
                  </div>
                  <Switch
                    checked={settings.allow_follows}
                    onCheckedChange={(checked) => updateSetting('allow_follows', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Show Activity Status</label>
                    <p className="text-xs text-muted-foreground">
                      Display when you're online or offline
                    </p>
                  </div>
                  <Switch
                    checked={settings.show_activity_status}
                    onCheckedChange={(checked) => updateSetting('show_activity_status', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Privacy */}
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Collection & Usage
              </CardTitle>
              <CardDescription>
                Control how your data is collected and used
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Data Collection</label>
                    <p className="text-xs text-muted-foreground">
                      Allow collection of usage data for service improvement
                    </p>
                  </div>
                  <Switch
                    checked={settings.data_collection}
                    onCheckedChange={(checked) => updateSetting('data_collection', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Analytics Tracking</label>
                    <p className="text-xs text-muted-foreground">
                      Track your interactions for analytics
                    </p>
                  </div>
                  <Switch
                    checked={settings.analytics_tracking}
                    onCheckedChange={(checked) => updateSetting('analytics_tracking', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Location Tracking</label>
                    <p className="text-xs text-muted-foreground">
                      Allow location-based features and recommendations
                    </p>
                  </div>
                  <Switch
                    checked={settings.location_tracking}
                    onCheckedChange={(checked) => updateSetting('location_tracking', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Search Visibility</label>
                    <p className="text-xs text-muted-foreground">
                      Allow your profile to appear in search results
                    </p>
                  </div>
                  <Switch
                    checked={settings.search_visibility}
                    onCheckedChange={(checked) => updateSetting('search_visibility', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Control how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Push Notifications</label>
                    <p className="text-xs text-muted-foreground">
                      Receive push notifications for important updates
                    </p>
                  </div>
                  <Switch
                    checked={settings.push_notifications}
                    onCheckedChange={(checked) => updateSetting('push_notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Marketing Emails</label>
                    <p className="text-xs text-muted-foreground">
                      Receive promotional emails and updates
                    </p>
                  </div>
                  <Switch
                    checked={settings.marketing_emails}
                    onCheckedChange={(checked) => updateSetting('marketing_emails', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Community Participation */}
        <TabsContent value="participation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Community Participation
              </CardTitle>
              <CardDescription>
                Control your participation in community features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Government Tagging</label>
                    <p className="text-xs text-muted-foreground">
                      Allow others to tag you in government-related discussions
                    </p>
                  </div>
                  <Switch
                    checked={settings.government_tagging}
                    onCheckedChange={(checked) => updateSetting('government_tagging', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Community Discussions</label>
                    <p className="text-xs text-muted-foreground">
                      Participate in community discussions and forums
                    </p>
                  </div>
                  <Switch
                    checked={settings.community_discussions}
                    onCheckedChange={(checked) => updateSetting('community_discussions', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Event Attendance</label>
                    <p className="text-xs text-muted-foreground">
                      Show your attendance at community events
                    </p>
                  </div>
                  <Switch
                    checked={settings.event_attendance}
                    onCheckedChange={(checked) => updateSetting('event_attendance', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Poll Participation</label>
                    <p className="text-xs text-muted-foreground">
                      Participate in community polls and surveys
                    </p>
                  </div>
                  <Switch
                    checked={settings.poll_participation}
                    onCheckedChange={(checked) => updateSetting('poll_participation', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Protest Participation</label>
                    <p className="text-xs text-muted-foreground">
                      Participate in virtual protests and community actions
                    </p>
                  </div>
                  <Switch
                    checked={settings.protest_participation}
                    onCheckedChange={(checked) => updateSetting('protest_participation', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Privacy Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Privacy Summary
          </CardTitle>
          <CardDescription>
            Your current privacy settings overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {settings.profile_visibility === 'public' ? 'Public' : 
                 settings.profile_visibility === 'community' ? 'Community' : 'Private'}
              </div>
              <div className="text-sm text-muted-foreground">Profile Visibility</div>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(settings).filter(Boolean).length}
              </div>
              <div className="text-sm text-muted-foreground">Active Features</div>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Object.values(settings).filter(v => v === false).length}
              </div>
              <div className="text-sm text-muted-foreground">Disabled Features</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyControls;
