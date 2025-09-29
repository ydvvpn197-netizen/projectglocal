import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAnonymousUsername } from '@/hooks/useAnonymousUsername';
import { PrivacyFirstIdentitySystem } from './PrivacyFirstIdentitySystem';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  User, 
  Settings, 
  AlertTriangle, 
  Lock,
  Globe,
  MapPin,
  MessageSquare,
  Bell,
  Search,
  BarChart3,
  Mail,
  Smartphone,
  Wifi,
  WifiOff
} from 'lucide-react';
import { PRIVACY_LEVELS, LOCATION_SHARING_LEVELS } from '@/types/anonymous';

interface PrivacySettingsPanelProps {
  userId?: string;
  onSettingsChange?: (settings: PrivacySettings) => void;
  compact?: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  showWebsite: boolean;
  showBio: boolean;
  showAvatar: boolean;
  activityVisibility: 'public' | 'friends' | 'private';
  showPosts: boolean;
  showEvents: boolean;
  showServices: boolean;
  showFollowers: boolean;
  showFollowing: boolean;
  allowMessagesFrom: 'all' | 'followers' | 'none';
  allowFollowRequests: boolean;
  allowEventInvites: boolean;
  allowServiceRequests: boolean;
  searchable: boolean;
  showInSuggestions: boolean;
  showInLeaderboard: boolean;
  analyticsEnabled: boolean;
  personalizationEnabled: boolean;
  marketingEmails: boolean;
  anonymousMode: boolean;
  anonymousPosts: boolean;
  anonymousComments: boolean;
  anonymousVotes: boolean;
  locationSharing: 'none' | 'city' | 'precise';
  preciseLocation: boolean;
  locationHistory: boolean;
}

const defaultSettings: PrivacySettings = {
  profileVisibility: 'public',
  showEmail: false,
  showPhone: false,
  showLocation: true,
  showWebsite: true,
  showBio: true,
  showAvatar: true,
  activityVisibility: 'public',
  showPosts: true,
  showEvents: true,
  showServices: true,
  showFollowers: true,
  showFollowing: true,
  allowMessagesFrom: 'all',
  allowFollowRequests: true,
  allowEventInvites: true,
  allowServiceRequests: true,
  searchable: true,
  showInSuggestions: true,
  showInLeaderboard: true,
  analyticsEnabled: true,
  personalizationEnabled: true,
  marketingEmails: false,
  anonymousMode: false,
  anonymousPosts: false,
  anonymousComments: false,
  anonymousVotes: false,
  locationSharing: 'city',
  preciseLocation: false,
  locationHistory: false,
};

export const PrivacySettingsPanel: React.FC<PrivacySettingsPanelProps> = ({
  userId,
  onSettingsChange,
  compact = false
}) => {
  const { toast } = useToast();
  const { anonymousUser } = useAnonymousUsername();
  const [settings, setSettings] = useState<PrivacySettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [userId]);

  const loadSettings = async () => {
    try {
      // In a real app, this would load from the database
      const savedSettings = localStorage.getItem('privacy_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would save to the database
      localStorage.setItem('privacy_settings', JSON.stringify(settings));
      
      toast({
        title: "Settings saved",
        description: "Your privacy settings have been updated.",
      });

      setHasChanges(false);
      if (onSettingsChange) {
        onSettingsChange(settings);
      }
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
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

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  const getPrivacyLevel = () => {
    if (settings.anonymousMode) return 'Maximum';
    if (!settings.searchable && !settings.showInSuggestions) return 'High';
    if (settings.profileVisibility === 'private') return 'High';
    if (settings.profileVisibility === 'friends') return 'Medium';
    return 'Low';
  };

  const getPrivacyScore = () => {
    let score = 0;
    if (settings.anonymousMode) score += 40;
    if (settings.profileVisibility === 'private') score += 20;
    if (!settings.showEmail) score += 10;
    if (!settings.showPhone) score += 10;
    if (!settings.showLocation) score += 10;
    if (settings.locationSharing === 'none') score += 10;
    return Math.min(score, 100);
  };

  const privacyScore = getPrivacyScore();
  const privacyLevel = getPrivacyLevel();

  if (compact) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Privacy Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Anonymous Mode</Label>
              <p className="text-xs text-muted-foreground">Use anonymous usernames</p>
            </div>
            <Switch
              checked={settings.anonymousMode}
              onCheckedChange={(checked) => updateSetting('anonymousMode', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Profile Visibility</Label>
              <p className="text-xs text-muted-foreground">Who can see your profile</p>
            </div>
            <Select
              value={settings.profileVisibility}
              onValueChange={(value: string) => updateSetting('profileVisibility', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="friends">Friends</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Location Sharing</Label>
              <p className="text-xs text-muted-foreground">How much location to share</p>
            </div>
            <Select
              value={settings.locationSharing}
              onValueChange={(value: string) => updateSetting('locationSharing', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="city">City</SelectItem>
                <SelectItem value="precise">Precise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Privacy Score</span>
              <Badge variant={privacyScore >= 80 ? "default" : privacyScore >= 60 ? "secondary" : "destructive"}>
                {privacyScore}/100
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  privacyScore >= 80 ? 'bg-green-500' : 
                  privacyScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${privacyScore}%` }}
              />
            </div>
          </div>

          {hasChanges && (
            <Button onClick={saveSettings} disabled={isLoading} className="w-full">
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Privacy Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Privacy Overview
          </CardTitle>
          <CardDescription>
            Your current privacy level and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{privacyScore}</div>
              <div className="text-sm text-muted-foreground">Privacy Score</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{privacyLevel}</div>
              <div className="text-sm text-muted-foreground">Privacy Level</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {anonymousUser ? '🕵️' : '👤'}
              </div>
              <div className="text-sm text-muted-foreground">
                {anonymousUser ? 'Anonymous' : 'Identified'}
              </div>
            </div>
          </div>

          {privacyScore < 60 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your privacy score is low. Consider enabling anonymous mode or adjusting your visibility settings.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Profile Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Profile Privacy
          </CardTitle>
          <CardDescription>
            Control what information is visible on your profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base font-medium">Profile Visibility</Label>
            <Select
              value={settings.profileVisibility}
              onValueChange={(value: string) => updateSetting('profileVisibility', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Everyone can see your profile</SelectItem>
                <SelectItem value="friends">Friends - Only your connections can see</SelectItem>
                <SelectItem value="private">Private - Only you can see your profile</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Show Email</Label>
                <p className="text-xs text-muted-foreground">Display email on profile</p>
              </div>
              <Switch
                checked={settings.showEmail}
                onCheckedChange={(checked) => updateSetting('showEmail', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Show Phone</Label>
                <p className="text-xs text-muted-foreground">Display phone on profile</p>
              </div>
              <Switch
                checked={settings.showPhone}
                onCheckedChange={(checked) => updateSetting('showPhone', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Show Location</Label>
                <p className="text-xs text-muted-foreground">Display location on profile</p>
              </div>
              <Switch
                checked={settings.showLocation}
                onCheckedChange={(checked) => updateSetting('showLocation', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Show Website</Label>
                <p className="text-xs text-muted-foreground">Display website on profile</p>
              </div>
              <Switch
                checked={settings.showWebsite}
                onCheckedChange={(checked) => updateSetting('showWebsite', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anonymous Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <EyeOff className="h-5 w-5 mr-2" />
            Anonymous Mode
          </CardTitle>
          <CardDescription>
            Use anonymous usernames for enhanced privacy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Enable Anonymous Mode</Label>
              <p className="text-sm text-muted-foreground">
                Use auto-generated usernames instead of your real name
              </p>
            </div>
            <Switch
              checked={settings.anonymousMode}
              onCheckedChange={(checked) => updateSetting('anonymousMode', checked)}
            />
          </div>

          {settings.anonymousMode && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Anonymous Posts</Label>
                  <p className="text-xs text-muted-foreground">Post anonymously by default</p>
                </div>
                <Switch
                  checked={settings.anonymousPosts}
                  onCheckedChange={(checked) => updateSetting('anonymousPosts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Anonymous Comments</Label>
                  <p className="text-xs text-muted-foreground">Comment anonymously by default</p>
                </div>
                <Switch
                  checked={settings.anonymousComments}
                  onCheckedChange={(checked) => updateSetting('anonymousComments', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Anonymous Votes</Label>
                  <p className="text-xs text-muted-foreground">Vote anonymously by default</p>
                </div>
                <Switch
                  checked={settings.anonymousVotes}
                  onCheckedChange={(checked) => updateSetting('anonymousVotes', checked)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Location Privacy
          </CardTitle>
          <CardDescription>
            Control how much location information you share
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base font-medium">Location Sharing</Label>
            <Select
              value={settings.locationSharing}
              onValueChange={(value: string) => updateSetting('locationSharing', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None - Don't share location</SelectItem>
                <SelectItem value="city">City - Share city only</SelectItem>
                <SelectItem value="precise">Precise - Share exact location</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Precise Location</Label>
              <p className="text-xs text-muted-foreground">Share precise coordinates</p>
            </div>
            <Switch
              checked={settings.preciseLocation}
              onCheckedChange={(checked) => updateSetting('preciseLocation', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Location History</Label>
              <p className="text-xs text-muted-foreground">Store location history</p>
            </div>
            <Switch
              checked={settings.locationHistory}
              onCheckedChange={(checked) => updateSetting('locationHistory', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Activity Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Activity Privacy
          </CardTitle>
          <CardDescription>
            Control what activities are visible to others
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base font-medium">Activity Visibility</Label>
            <Select
              value={settings.activityVisibility}
              onValueChange={(value: string) => updateSetting('activityVisibility', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Everyone can see your activity</SelectItem>
                <SelectItem value="friends">Friends - Only your connections can see</SelectItem>
                <SelectItem value="private">Private - Only you can see your activity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Show Posts</Label>
                <p className="text-xs text-muted-foreground">Display your posts</p>
              </div>
              <Switch
                checked={settings.showPosts}
                onCheckedChange={(checked) => updateSetting('showPosts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Show Events</Label>
                <p className="text-xs text-muted-foreground">Display your events</p>
              </div>
              <Switch
                checked={settings.showEvents}
                onCheckedChange={(checked) => updateSetting('showEvents', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Show Followers</Label>
                <p className="text-xs text-muted-foreground">Display follower count</p>
              </div>
              <Switch
                checked={settings.showFollowers}
                onCheckedChange={(checked) => updateSetting('showFollowers', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Show Following</Label>
                <p className="text-xs text-muted-foreground">Display following count</p>
              </div>
              <Switch
                checked={settings.showFollowing}
                onCheckedChange={(checked) => updateSetting('showFollowing', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Communication Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Communication Privacy
          </CardTitle>
          <CardDescription>
            Control who can contact you and how
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base font-medium">Allow Messages From</Label>
            <Select
              value={settings.allowMessagesFrom}
              onValueChange={(value: string) => updateSetting('allowMessagesFrom', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Everyone</SelectItem>
                <SelectItem value="followers">Followers Only</SelectItem>
                <SelectItem value="none">No One</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Follow Requests</Label>
                <p className="text-xs text-muted-foreground">Allow follow requests</p>
              </div>
              <Switch
                checked={settings.allowFollowRequests}
                onCheckedChange={(checked) => updateSetting('allowFollowRequests', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Event Invites</Label>
                <p className="text-xs text-muted-foreground">Allow event invitations</p>
              </div>
              <Switch
                checked={settings.allowEventInvites}
                onCheckedChange={(checked) => updateSetting('allowEventInvites', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data & Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Data & Analytics
          </CardTitle>
          <CardDescription>
            Control data collection and personalization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Analytics</Label>
                <p className="text-xs text-muted-foreground">Allow usage analytics</p>
              </div>
              <Switch
                checked={settings.analyticsEnabled}
                onCheckedChange={(checked) => updateSetting('analyticsEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Personalization</Label>
                <p className="text-xs text-muted-foreground">Personalized content</p>
              </div>
              <Switch
                checked={settings.personalizationEnabled}
                onCheckedChange={(checked) => updateSetting('personalizationEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Marketing Emails</Label>
                <p className="text-xs text-muted-foreground">Receive promotional emails</p>
              </div>
              <Switch
                checked={settings.marketingEmails}
                onCheckedChange={(checked) => updateSetting('marketingEmails', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Searchable</Label>
                <p className="text-xs text-muted-foreground">Appear in search results</p>
              </div>
              <Switch
                checked={settings.searchable}
                onCheckedChange={(checked) => updateSetting('searchable', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy-First Identity System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Privacy-First Identity System</span>
          </CardTitle>
          <CardDescription>
            Advanced privacy controls with anonymous usernames and opt-in identity reveal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PrivacyFirstIdentitySystem 
            compact={compact}
            showStats={!compact}
            onSettingsChange={(settings) => {
              if (onSettingsChange) {
                // Convert PrivacyFirstIdentitySystem settings to PrivacySettings format
                const convertedSettings: PrivacySettings = {
                  profileVisibility: settings.profile_visibility,
                  showEmail: true, // Default values
                  showPhone: true,
                  showLocation: settings.location_sharing,
                  showWebsite: true,
                  showBio: true,
                  showAvatar: true,
                  activityVisibility: settings.activity_visibility,
                  showPosts: settings.show_posts,
                  showEvents: settings.show_events,
                  showServices: settings.show_services,
                  showFollowers: settings.show_followers,
                  showFollowing: settings.show_following,
                  allowMessagesFrom: 'all',
                  allowFollowRequests: true,
                  allowEventInvites: true,
                  allowServiceRequests: true,
                  searchable: true,
                  showInSuggestions: true,
                  showInLeaderboard: true,
                  analyticsEnabled: settings.analytics_enabled,
                  personalizationEnabled: settings.personalization_enabled,
                  marketingEmails: settings.marketing_emails,
                  anonymousMode: settings.is_anonymous,
                  anonymousPosts: settings.anonymous_posts,
                  anonymousComments: settings.anonymous_comments,
                  anonymousVotes: settings.anonymous_votes,
                  locationSharing: settings.location_sharing,
                  preciseLocation: settings.precise_location,
                  locationHistory: settings.location_history
                };
                onSettingsChange(convertedSettings);
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={saveSettings}
          disabled={!hasChanges || isLoading}
          className="flex-1"
        >
          {isLoading ? 'Saving...' : 'Save Settings'}
        </Button>
        <Button
          variant="outline"
          onClick={resetToDefaults}
          disabled={isLoading}
        >
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
};
