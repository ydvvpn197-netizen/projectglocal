import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Eye, 
  EyeOff, 
  Shield, 
  User, 
  MessageCircle, 
  Heart, 
  ThumbsUp,
  Settings,
  Lock,
  Globe,
  Users
} from 'lucide-react';

interface AnonymousSettings {
  allow_anonymous_posts: boolean;
  allow_anonymous_comments: boolean;
  allow_anonymous_votes: boolean;
  show_username_in_posts: boolean;
  show_username_in_comments: boolean;
  show_username_in_votes: boolean;
  allow_anonymous_messaging: boolean;
  profile_visibility: 'public' | 'friends' | 'private';
  location_sharing: 'public' | 'friends' | 'private';
  activity_status: 'public' | 'friends' | 'private';
}

interface AnonymousEngagementProps {
  onSettingsChange?: (settings: AnonymousSettings) => void;
  className?: string;
}

export const AnonymousEngagement: React.FC<AnonymousEngagementProps> = ({
  onSettingsChange,
  className = ''
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<AnonymousSettings>({
    allow_anonymous_posts: true,
    allow_anonymous_comments: true,
    allow_anonymous_votes: true,
    show_username_in_posts: true,
    show_username_in_comments: true,
    show_username_in_votes: true,
    allow_anonymous_messaging: false,
    profile_visibility: 'public',
    location_sharing: 'friends',
    activity_status: 'public'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load user's anonymous engagement settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_privacy_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setSettings({
            allow_anonymous_posts: data.allow_anonymous_posts ?? true,
            allow_anonymous_comments: data.allow_anonymous_comments ?? true,
            allow_anonymous_votes: data.allow_anonymous_votes ?? true,
            show_username_in_posts: data.show_username_in_posts ?? true,
            show_username_in_comments: data.show_username_in_comments ?? true,
            show_username_in_votes: data.show_username_in_votes ?? true,
            allow_anonymous_messaging: data.allow_anonymous_messaging ?? false,
            profile_visibility: data.profile_visibility ?? 'public',
            location_sharing: data.location_sharing ?? 'friends',
            activity_status: data.activity_status ?? 'public'
          });
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
    };

    loadSettings();
  }, [user, toast]);

  // Save settings to database
  const saveSettings = async (newSettings: AnonymousSettings) => {
    if (!user) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('user_privacy_settings')
        .upsert({
          user_id: user.id,
          ...newSettings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setSettings(newSettings);
      onSettingsChange?.(newSettings);

      toast({
        title: "Settings Updated",
        description: "Your privacy settings have been saved successfully.",
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

  const handleSettingChange = (key: keyof AnonymousSettings, value: boolean | string) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const getVisibilityIcon = (level: string) => {
    switch (level) {
      case 'public':
        return <Globe className="h-4 w-4 text-green-500" />;
      case 'friends':
        return <Users className="h-4 w-4 text-yellow-500" />;
      case 'private':
        return <Lock className="h-4 w-4 text-red-500" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getVisibilityLabel = (level: string) => {
    switch (level) {
      case 'public':
        return 'Public';
      case 'friends':
        return 'Friends Only';
      case 'private':
        return 'Private';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Anonymous Engagement
          </CardTitle>
          <CardDescription>
            Loading your privacy settings...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Privacy & Anonymous Engagement
        </CardTitle>
        <CardDescription>
          Control how you engage with the community and protect your identity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Anonymous Engagement Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <h3 className="text-lg font-medium">Anonymous Engagement</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Anonymous Posts</Label>
                <p className="text-sm text-muted-foreground">
                  Post content without revealing your identity
                </p>
              </div>
              <Switch
                checked={settings.allow_anonymous_posts}
                onCheckedChange={(checked) => handleSettingChange('allow_anonymous_posts', checked)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Anonymous Comments</Label>
                <p className="text-sm text-muted-foreground">
                  Comment on posts without showing your username
                </p>
              </div>
              <Switch
                checked={settings.allow_anonymous_comments}
                onCheckedChange={(checked) => handleSettingChange('allow_anonymous_comments', checked)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Anonymous Votes</Label>
                <p className="text-sm text-muted-foreground">
                  Vote on polls and posts anonymously
                </p>
              </div>
              <Switch
                checked={settings.allow_anonymous_votes}
                onCheckedChange={(checked) => handleSettingChange('allow_anonymous_votes', checked)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Anonymous Messaging</Label>
                <p className="text-sm text-muted-foreground">
                  Receive messages from anonymous users
                </p>
              </div>
              <Switch
                checked={settings.allow_anonymous_messaging}
                onCheckedChange={(checked) => handleSettingChange('allow_anonymous_messaging', checked)}
                disabled={saving}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Username Visibility Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <h3 className="text-lg font-medium">Username Visibility</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Username in Posts</Label>
                <p className="text-sm text-muted-foreground">
                  Display your username when you create posts
                </p>
              </div>
              <Switch
                checked={settings.show_username_in_posts}
                onCheckedChange={(checked) => handleSettingChange('show_username_in_posts', checked)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Username in Comments</Label>
                <p className="text-sm text-muted-foreground">
                  Display your username when you comment
                </p>
              </div>
              <Switch
                checked={settings.show_username_in_comments}
                onCheckedChange={(checked) => handleSettingChange('show_username_in_comments', checked)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Username in Votes</Label>
                <p className="text-sm text-muted-foreground">
                  Display your username when you vote
                </p>
              </div>
              <Switch
                checked={settings.show_username_in_votes}
                onCheckedChange={(checked) => handleSettingChange('show_username_in_votes', checked)}
                disabled={saving}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Profile Visibility Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <h3 className="text-lg font-medium">Profile Visibility</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Profile Visibility</Label>
              <div className="flex gap-2">
                {(['public', 'friends', 'private'] as const).map((level) => (
                  <Button
                    key={level}
                    variant={settings.profile_visibility === level ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSettingChange('profile_visibility', level)}
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    {getVisibilityIcon(level)}
                    {getVisibilityLabel(level)}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Control who can see your profile information
              </p>
            </div>

            <div className="space-y-2">
              <Label>Location Sharing</Label>
              <div className="flex gap-2">
                {(['public', 'friends', 'private'] as const).map((level) => (
                  <Button
                    key={level}
                    variant={settings.location_sharing === level ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSettingChange('location_sharing', level)}
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    {getVisibilityIcon(level)}
                    {getVisibilityLabel(level)}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Control who can see your location information
              </p>
            </div>

            <div className="space-y-2">
              <Label>Activity Status</Label>
              <div className="flex gap-2">
                {(['public', 'friends', 'private'] as const).map((level) => (
                  <Button
                    key={level}
                    variant={settings.activity_status === level ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSettingChange('activity_status', level)}
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    {getVisibilityIcon(level)}
                    {getVisibilityLabel(level)}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Control who can see your online status and activity
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Tips */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy Tips
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Anonymous engagement helps protect your identity while participating in discussions</li>
            <li>• You can always change these settings later</li>
            <li>• Private settings ensure only your connections can see your information</li>
            <li>• Anonymous posts and comments are still moderated for quality and safety</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnonymousEngagement;
