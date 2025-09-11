import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  MessageCircle, 
  Search, 
  BarChart3, 
  UserX, 
  MapPin,
  Save,
  RefreshCw,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { PrivacyService, PrivacySettings } from '@/services/privacyService';

interface PrivacySettingsPanelProps {
  onClose?: () => void;
  compact?: boolean;
}

export const PrivacySettingsPanel: React.FC<PrivacySettingsPanelProps> = ({ 
  onClose, 
  compact = false 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (user) {
      loadPrivacySettings();
    }
  }, [user]);

  const loadPrivacySettings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const privacySettings = await PrivacyService.getPrivacySettings(user.id);
      setSettings(privacySettings);
    } catch (error) {
      console.error('Error loading privacy settings:', error);
      toast({
        title: "Error",
        description: "Failed to load privacy settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: keyof PrivacySettings, value: boolean | string) => {
    if (!settings) return;
    
    setSettings(prev => ({
      ...prev!,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!user || !settings) return;
    
    setSaving(true);
    try {
      const success = await PrivacyService.updatePrivacySettings(user.id, settings);
      if (success) {
        toast({
          title: "Success",
          description: "Privacy settings updated successfully"
        });
        setHasChanges(false);
        onClose?.();
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast({
        title: "Error",
        description: "Failed to save privacy settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (user) {
      const defaultSettings = PrivacyService.getDefaultPrivacySettings(user.id);
      setSettings(defaultSettings);
      setHasChanges(true);
    }
  };

  if (loading) {
    return (
      <Card className={compact ? "w-full" : "w-full max-w-4xl mx-auto"}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading privacy settings...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card className={compact ? "w-full" : "w-full max-w-4xl mx-auto"}>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground">Failed to load privacy settings</p>
            <Button onClick={loadPrivacySettings} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const SettingRow: React.FC<{
    title: string;
    description: string;
    value: boolean;
    onChange: (value: boolean) => void;
    icon?: React.ReactNode;
  }> = ({ title, description, value, onChange, icon }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-start space-x-3 flex-1">
        {icon && <div className="mt-1">{icon}</div>}
        <div className="space-y-1">
          <Label className="text-sm font-medium">{title}</Label>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );

  const SelectRow: React.FC<{
    title: string;
    description: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    icon?: React.ReactNode;
  }> = ({ title, description, value, onChange, options, icon }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-start space-x-3 flex-1">
        {icon && <div className="mt-1">{icon}</div>}
        <div className="space-y-1">
          <Label className="text-sm font-medium">{title}</Label>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <Card className={compact ? "w-full" : "w-full max-w-4xl mx-auto"}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy Settings
            </CardTitle>
            <CardDescription>
              Control your privacy and data sharing preferences
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="outline" className="text-orange-600">
                Unsaved Changes
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={saving}
            >
              Reset to Defaults
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              size="sm"
            >
              {saving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Profile Visibility */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <h3 className="text-lg font-medium">Profile Visibility</h3>
          </div>
          
          <SelectRow
            title="Profile Visibility"
            description="Who can see your profile information"
            value={settings.profile_visibility}
            onChange={(value) => handleSettingChange('profile_visibility', value)}
            options={[
              { value: 'public', label: 'Public' },
              { value: 'friends', label: 'Friends Only' },
              { value: 'private', label: 'Private' }
            ]}
            icon={<Eye className="h-4 w-4" />}
          />

          <div className="space-y-2 pl-7">
            <SettingRow
              title="Show Email Address"
              description="Display your email on your profile"
              value={settings.show_email}
              onChange={(value) => handleSettingChange('show_email', value)}
            />
            <SettingRow
              title="Show Phone Number"
              description="Display your phone number on your profile"
              value={settings.show_phone}
              onChange={(value) => handleSettingChange('show_phone', value)}
            />
            <SettingRow
              title="Show Location"
              description="Display your location information"
              value={settings.show_location}
              onChange={(value) => handleSettingChange('show_location', value)}
            />
            <SettingRow
              title="Show Website"
              description="Display your website URL"
              value={settings.show_website}
              onChange={(value) => handleSettingChange('show_website', value)}
            />
            <SettingRow
              title="Show Bio"
              description="Display your bio and description"
              value={settings.show_bio}
              onChange={(value) => handleSettingChange('show_bio', value)}
            />
            <SettingRow
              title="Show Avatar"
              description="Display your profile picture"
              value={settings.show_avatar}
              onChange={(value) => handleSettingChange('show_avatar', value)}
            />
          </div>
        </div>

        <Separator />

        {/* Activity Visibility */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <h3 className="text-lg font-medium">Activity Visibility</h3>
          </div>
          
          <SelectRow
            title="Activity Visibility"
            description="Who can see your posts and activities"
            value={settings.activity_visibility}
            onChange={(value) => handleSettingChange('activity_visibility', value)}
            options={[
              { value: 'public', label: 'Public' },
              { value: 'friends', label: 'Friends Only' },
              { value: 'private', label: 'Private' }
            ]}
            icon={<BarChart3 className="h-4 w-4" />}
          />

          <div className="space-y-2 pl-7">
            <SettingRow
              title="Show Posts"
              description="Make your posts visible to others"
              value={settings.show_posts}
              onChange={(value) => handleSettingChange('show_posts', value)}
            />
            <SettingRow
              title="Show Events"
              description="Make your events visible to others"
              value={settings.show_events}
              onChange={(value) => handleSettingChange('show_events', value)}
            />
            <SettingRow
              title="Show Services"
              description="Make your services visible to others"
              value={settings.show_services}
              onChange={(value) => handleSettingChange('show_services', value)}
            />
            <SettingRow
              title="Show Followers"
              description="Display your follower count and list"
              value={settings.show_followers}
              onChange={(value) => handleSettingChange('show_followers', value)}
            />
            <SettingRow
              title="Show Following"
              description="Display who you're following"
              value={settings.show_following}
              onChange={(value) => handleSettingChange('show_following', value)}
            />
          </div>
        </div>

        <Separator />

        {/* Messages and Interactions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <h3 className="text-lg font-medium">Messages & Interactions</h3>
          </div>
          
          <SelectRow
            title="Allow Messages From"
            description="Who can send you direct messages"
            value={settings.allow_messages_from}
            onChange={(value) => handleSettingChange('allow_messages_from', value)}
            options={[
              { value: 'all', label: 'Everyone' },
              { value: 'followers', label: 'Followers Only' },
              { value: 'none', label: 'No One' }
            ]}
            icon={<MessageCircle className="h-4 w-4" />}
          />

          <div className="space-y-2 pl-7">
            <SettingRow
              title="Allow Follow Requests"
              description="Let others send you follow requests"
              value={settings.allow_follow_requests}
              onChange={(value) => handleSettingChange('allow_follow_requests', value)}
            />
            <SettingRow
              title="Allow Event Invites"
              description="Let others invite you to events"
              value={settings.allow_event_invites}
              onChange={(value) => handleSettingChange('allow_event_invites', value)}
            />
            <SettingRow
              title="Allow Service Requests"
              description="Let others request your services"
              value={settings.allow_service_requests}
              onChange={(value) => handleSettingChange('allow_service_requests', value)}
            />
          </div>
        </div>

        <Separator />

        {/* Search and Discovery */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <h3 className="text-lg font-medium">Search & Discovery</h3>
          </div>
          
          <div className="space-y-2">
            <SettingRow
              title="Searchable Profile"
              description="Allow others to find you through search"
              value={settings.searchable}
              onChange={(value) => handleSettingChange('searchable', value)}
              icon={<Search className="h-4 w-4" />}
            />
            <SettingRow
              title="Show in Suggestions"
              description="Appear in friend and connection suggestions"
              value={settings.show_in_suggestions}
              onChange={(value) => handleSettingChange('show_in_suggestions', value)}
            />
            <SettingRow
              title="Show in Leaderboard"
              description="Include your activity in community leaderboards"
              value={settings.show_in_leaderboard}
              onChange={(value) => handleSettingChange('show_in_leaderboard', value)}
            />
          </div>
        </div>

        <Separator />

        {/* Data Sharing */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <h3 className="text-lg font-medium">Data Sharing</h3>
          </div>
          
          <div className="space-y-2">
            <SettingRow
              title="Analytics & Improvement"
              description="Help improve the app by sharing anonymous usage data"
              value={settings.analytics_enabled}
              onChange={(value) => handleSettingChange('analytics_enabled', value)}
              icon={<BarChart3 className="h-4 w-4" />}
            />
            <SettingRow
              title="Personalized Recommendations"
              description="Allow personalized content and suggestions"
              value={settings.personalization_enabled}
              onChange={(value) => handleSettingChange('personalization_enabled', value)}
            />
            <SettingRow
              title="Marketing Emails"
              description="Receive promotional emails and updates"
              value={settings.marketing_emails}
              onChange={(value) => handleSettingChange('marketing_emails', value)}
            />
          </div>
        </div>

        <Separator />

        {/* Anonymous Mode */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <UserX className="h-4 w-4" />
            <h3 className="text-lg font-medium">Anonymous Mode</h3>
            <Badge variant="secondary" className="text-xs">Beta</Badge>
          </div>
          
          <div className="space-y-2">
            <SettingRow
              title="Enable Anonymous Mode"
              description="Allow posting and interacting anonymously"
              value={settings.anonymous_mode}
              onChange={(value) => handleSettingChange('anonymous_mode', value)}
              icon={<UserX className="h-4 w-4" />}
            />
            <SettingRow
              title="Anonymous Posts"
              description="Allow creating posts without revealing identity"
              value={settings.anonymous_posts}
              onChange={(value) => handleSettingChange('anonymous_posts', value)}
            />
            <SettingRow
              title="Anonymous Comments"
              description="Allow commenting without revealing identity"
              value={settings.anonymous_comments}
              onChange={(value) => handleSettingChange('anonymous_comments', value)}
            />
            <SettingRow
              title="Anonymous Votes"
              description="Allow voting without revealing identity"
              value={settings.anonymous_votes}
              onChange={(value) => handleSettingChange('anonymous_votes', value)}
            />
          </div>
        </div>

        <Separator />

        {/* Location Privacy */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <h3 className="text-lg font-medium">Location Privacy</h3>
          </div>
          
          <div className="space-y-2">
            <SettingRow
              title="Location Sharing"
              description="Share your location for local features"
              value={settings.location_sharing}
              onChange={(value) => handleSettingChange('location_sharing', value)}
              icon={<MapPin className="h-4 w-4" />}
            />
            <SettingRow
              title="Precise Location"
              description="Share exact coordinates (not just city/state)"
              value={settings.precise_location}
              onChange={(value) => handleSettingChange('precise_location', value)}
            />
            <SettingRow
              title="Location History"
              description="Store your location history for better recommendations"
              value={settings.location_history}
              onChange={(value) => handleSettingChange('location_history', value)}
            />
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Privacy Notice
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Your privacy settings control how your information is shared within the platform. 
                These settings do not affect data shared with third-party services or required for 
                platform functionality. Anonymous mode allows you to participate without revealing 
                your identity, but all content is still subject to our community guidelines.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
