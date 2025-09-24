import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Lock, 
  Globe, 
  Users, 
  UserCheck, 
  Bell, 
  BellOff,
  Camera,
  MapPin,
  Search,
  Database,
  AlertTriangle,
  CheckCircle,
  Settings,
  Info
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PrivacySettings {
  profile_visibility: 'public' | 'friends' | 'private' | 'anonymous';
  show_online_status: boolean;
  show_last_seen: boolean;
  allow_friend_requests: boolean;
  allow_messages: 'everyone' | 'friends' | 'none';
  show_location: boolean;
  location_precision: 'exact' | 'city' | 'region' | 'none';
  data_collection: boolean;
  analytics_tracking: boolean;
  marketing_emails: boolean;
  push_notifications: boolean;
  email_notifications: boolean;
  search_visibility: boolean;
  profile_picture_visibility: boolean;
  contact_info_visibility: boolean;
  activity_status: boolean;
  read_receipts: boolean;
  typing_indicators: boolean;
  last_seen_precision: 'exact' | 'approximate' | 'hidden';
}

interface PrivacySettingsProps {
  className?: string;
  onSave?: (settings: PrivacySettings) => void;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({ 
  className,
  onSave 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<PrivacySettings>({
    profile_visibility: 'public',
    show_online_status: true,
    show_last_seen: true,
    allow_friend_requests: true,
    allow_messages: 'friends',
    show_location: false,
    location_precision: 'city',
    data_collection: false,
    analytics_tracking: false,
    marketing_emails: false,
    push_notifications: true,
    email_notifications: true,
    search_visibility: true,
    profile_picture_visibility: true,
    contact_info_visibility: false,
    activity_status: true,
    read_receipts: true,
    typing_indicators: true,
    last_seen_precision: 'approximate'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'communication' | 'data' | 'notifications'>('profile');

  // Load user privacy settings
  useEffect(() => {
    if (user) {
      loadPrivacySettings();
    }
  }, [user, loadPrivacySettings]);

  const loadPrivacySettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_privacy_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (data && !error) {
        setSettings(data.settings as PrivacySettings);
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    }
  }, [user]);

  const savePrivacySettings = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_privacy_settings')
        .upsert({
          user_id: user.id,
          settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setHasChanges(false);
      toast({
        title: "Privacy settings saved",
        description: "Your privacy preferences have been updated",
      });

      if (onSave) {
        onSave(settings);
      }
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast({
        title: "Error",
        description: "Failed to save privacy settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = <K extends keyof PrivacySettings>(
    key: K,
    value: PrivacySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="h-4 w-4 text-green-500" />;
      case 'friends': return <Users className="h-4 w-4 text-blue-500" />;
      case 'private': return <Lock className="h-4 w-4 text-orange-500" />;
      case 'anonymous': return <EyeOff className="h-4 w-4 text-red-500" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getVisibilityDescription = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'Visible to everyone on the platform';
      case 'friends': return 'Only visible to people you follow';
      case 'private': return 'Only visible to you';
      case 'anonymous': return 'Completely anonymous, no profile visible';
      default: return '';
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserCheck },
    { id: 'communication', label: 'Communication', icon: Bell },
    { id: 'data', label: 'Data & Analytics', icon: Database },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ] as const;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-500" />
            Privacy Settings
          </h2>
          <p className="text-muted-foreground">
            Control your privacy and data sharing preferences
          </p>
        </div>
        {hasChanges && (
          <Button onClick={savePrivacySettings} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Visibility */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Profile Visibility
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'public', label: 'Public', icon: Globe, color: 'green' },
                      { value: 'friends', label: 'Friends Only', icon: Users, color: 'blue' },
                      { value: 'private', label: 'Private', icon: Lock, color: 'orange' },
                      { value: 'anonymous', label: 'Anonymous', icon: EyeOff, color: 'red' }
                    ].map(({ value, label, icon: Icon, color }) => (
                      <button
                        key={value}
                        onClick={() => updateSetting('profile_visibility', value as 'public' | 'friends' | 'private' | 'anonymous')}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          settings.profile_visibility === value
                            ? `border-${color}-500 bg-${color}-50`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Icon className={`h-5 w-5 text-${color}-500`} />
                          <span className="font-medium">{label}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {getVisibilityDescription(value)}
                        </p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Location Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location Privacy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Show location in posts</label>
                      <p className="text-sm text-muted-foreground">
                        Allow others to see your general location
                      </p>
                    </div>
                    <Switch
                      checked={settings.show_location}
                      onCheckedChange={(checked) => updateSetting('show_location', checked)}
                    />
                  </div>
                  
                  {settings.show_location && (
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Location precision</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'exact', label: 'Exact', desc: 'Street level' },
                          { value: 'city', label: 'City', desc: 'City only' },
                          { value: 'region', label: 'Region', desc: 'State/Province' },
                          { value: 'none', label: 'Hidden', desc: 'No location' }
                        ].map(({ value, label, desc }: { value: string; label: string; desc: string }) => (
                          <button
                            key={value}
                            onClick={() => updateSetting('location_precision', value as 'exact' | 'city' | 'region' | 'none')}
                            className={`p-3 rounded-lg border text-left transition-all ${
                              settings.location_precision === value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-medium">{label}</div>
                            <div className="text-xs text-muted-foreground">{desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Search Visibility */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Search & Discovery
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Appear in search results</label>
                      <p className="text-sm text-muted-foreground">
                        Allow others to find you through search
                      </p>
                    </div>
                    <Switch
                      checked={settings.search_visibility}
                      onCheckedChange={(checked) => updateSetting('search_visibility', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'communication' && (
            <div className="space-y-6">
              {/* Message Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Communication Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Who can message you</label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { value: 'everyone', label: 'Everyone', desc: 'Anyone can send you messages' },
                        { value: 'friends', label: 'Friends Only', desc: 'Only people you follow' },
                        { value: 'none', label: 'No One', desc: 'Disable all messages' }
                      ].map(({ value, label, desc }: { value: string; label: string; desc: string }) => (
                        <button
                          key={value}
                          onClick={() => updateSetting('allow_messages', value as 'everyone' | 'friends' | 'none')}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            settings.allow_messages === value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium">{label}</div>
                          <div className="text-xs text-muted-foreground">{desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Allow friend requests</label>
                      <p className="text-sm text-muted-foreground">
                        Let others send you follow requests
                      </p>
                    </div>
                    <Switch
                      checked={settings.allow_friend_requests}
                      onCheckedChange={(checked) => updateSetting('allow_friend_requests', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Activity Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Activity Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Show online status</label>
                      <p className="text-sm text-muted-foreground">
                        Let others see when you're online
                      </p>
                    </div>
                    <Switch
                      checked={settings.show_online_status}
                      onCheckedChange={(checked) => updateSetting('show_online_status', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Show last seen</label>
                      <p className="text-sm text-muted-foreground">
                        Show when you were last active
                      </p>
                    </div>
                    <Switch
                      checked={settings.show_last_seen}
                      onCheckedChange={(checked) => updateSetting('show_last_seen', checked)}
                    />
                  </div>

                  {settings.show_last_seen && (
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Last seen precision</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'exact', label: 'Exact', desc: 'Show exact time' },
                          { value: 'approximate', label: 'Approximate', desc: 'Show relative time' },
                          { value: 'hidden', label: 'Hidden', desc: 'Don\'t show time' }
                        ].map(({ value, label, desc }: { value: string; label: string; desc: string }) => (
                          <button
                            key={value}
                            onClick={() => updateSetting('last_seen_precision', value as 'exact' | 'approximate' | 'hidden')}
                            className={`p-3 rounded-lg border text-left transition-all ${
                              settings.last_seen_precision === value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-medium">{label}</div>
                            <div className="text-xs text-muted-foreground">{desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              {/* Data Collection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Data Collection & Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Allow data collection</label>
                      <p className="text-sm text-muted-foreground">
                        Help improve the platform with anonymous usage data
                      </p>
                    </div>
                    <Switch
                      checked={settings.data_collection}
                      onCheckedChange={(checked) => updateSetting('data_collection', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Analytics tracking</label>
                      <p className="text-sm text-muted-foreground">
                        Allow performance and usage analytics
                      </p>
                    </div>
                    <Switch
                      checked={settings.analytics_tracking}
                      onCheckedChange={(checked) => updateSetting('analytics_tracking', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Marketing emails</label>
                      <p className="text-sm text-muted-foreground">
                        Receive promotional emails and updates
                      </p>
                    </div>
                    <Switch
                      checked={settings.marketing_emails}
                      onCheckedChange={(checked) => updateSetting('marketing_emails', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Data Export */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Data Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Export your data</label>
                      <p className="text-sm text-muted-foreground">
                        Download a copy of your data
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Export Data
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Delete account</label>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and data
                      </p>
                    </div>
                    <Button variant="destructive" size="sm">
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              {/* Notification Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Push notifications</label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications on your device
                      </p>
                    </div>
                    <Switch
                      checked={settings.push_notifications}
                      onCheckedChange={(checked) => updateSetting('push_notifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Email notifications</label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={settings.email_notifications}
                      onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Privacy Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Privacy Summary</h4>
              <p className="text-sm text-blue-700">
                Your profile is currently set to <strong>{settings.profile_visibility}</strong> visibility. 
                {settings.show_location && ` Location sharing is ${settings.location_precision}.`}
                {!settings.data_collection && ' Data collection is disabled.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacySettings;
