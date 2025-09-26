/**
 * Privacy Settings Component
 * Allows users to control their privacy settings and anonymous handle display
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  MapPin, 
  Camera,
  RefreshCw,
  Info,
  Lock,
  Unlock,
  Users
} from 'lucide-react';
import { useAnonymousHandle, PrivacySettings } from '@/hooks/useAnonymousHandle';
import { useToast } from '@/hooks/use-toast';

interface PrivacySettingsProps {
  className?: string;
}

export const PrivacySettingsComponent: React.FC<PrivacySettingsProps> = ({ className }) => {
  const {
    privacySettings,
    loading,
    error,
    updatePrivacySettings,
    generateNewHandle
  } = useAnonymousHandle();
  
  const { toast } = useToast();
  
  const [localSettings, setLocalSettings] = useState<Partial<PrivacySettings>>({});

  // Initialize local settings when privacy settings load
  React.useEffect(() => {
    if (privacySettings) {
      setLocalSettings({
        show_real_name: privacySettings.show_real_name,
        show_real_avatar: privacySettings.show_real_avatar,
        show_real_email: privacySettings.show_real_email,
        show_real_location: privacySettings.show_real_location,
        privacy_level: privacySettings.privacy_level
      });
    }
  }, [privacySettings]);

  const handleSettingChange = (key: keyof PrivacySettings, value: boolean | string) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    if (!localSettings) return;

    const success = await updatePrivacySettings(localSettings);
    if (success) {
      toast({
        title: "Privacy Settings Updated",
        description: "Your privacy preferences have been saved successfully",
      });
    }
  };

  const handleGenerateNewHandle = async () => {
    const newHandle = await generateNewHandle();
    if (newHandle) {
      toast({
        title: "New Handle Generated",
        description: `Your new anonymous handle is: ${newHandle}`,
      });
    }
  };

  const getPrivacyLevelDescription = (level: string) => {
    switch (level) {
      case 'anonymous':
        return 'Maximum privacy - only anonymous handle visible';
      case 'pseudonymous':
        return 'Balanced privacy - some real information may be shown';
      case 'public':
        return 'Minimum privacy - real information may be visible';
      default:
        return 'Privacy level not set';
    }
  };

  const getPrivacyLevelIcon = (level: string) => {
    switch (level) {
      case 'anonymous':
        return <Lock className="h-4 w-4" />;
      case 'pseudonymous':
        return <Shield className="h-4 w-4" />;
      case 'public':
        return <Unlock className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  if (loading && !privacySettings) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading privacy settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Privacy Settings
        </CardTitle>
        <CardDescription>
          Control how your information is displayed to other users. Default is maximum privacy.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Current Anonymous Handle */}
        {privacySettings?.anonymous_handle && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Current Anonymous Handle</Label>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono">
                {privacySettings.anonymous_handle}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateNewHandle}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate New
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              This is how you appear to other users by default
            </p>
          </div>
        )}

        <Separator />

        {/* Privacy Level */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Privacy Level</Label>
          <Select
            value={localSettings.privacy_level || 'anonymous'}
            onValueChange={(value) => handleSettingChange('privacy_level', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select privacy level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="anonymous">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Anonymous</div>
                    <div className="text-xs text-muted-foreground">
                      Maximum privacy
                    </div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="pseudonymous">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Pseudonymous</div>
                    <div className="text-xs text-muted-foreground">
                      Balanced privacy
                    </div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="public">
                <div className="flex items-center gap-2">
                  <Unlock className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Public</div>
                    <div className="text-xs text-muted-foreground">
                      Minimum privacy
                    </div>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {getPrivacyLevelDescription(localSettings.privacy_level || 'anonymous')}
          </p>
        </div>

        <Separator />

        {/* Individual Privacy Controls */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">What Others Can See</Label>
          
          {/* Real Name */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4" />
              <div>
                <Label htmlFor="show-real-name" className="text-sm">
                  Show Real Name
                </Label>
                <p className="text-xs text-muted-foreground">
                  Display your real name instead of anonymous handle
                </p>
              </div>
            </div>
            <Switch
              id="show-real-name"
              checked={localSettings.show_real_name || false}
              onCheckedChange={(checked) => handleSettingChange('show_real_name', checked)}
            />
          </div>

          {/* Real Avatar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Camera className="h-4 w-4" />
              <div>
                <Label htmlFor="show-real-avatar" className="text-sm">
                  Show Real Avatar
                </Label>
                <p className="text-xs text-muted-foreground">
                  Display your real profile picture
                </p>
              </div>
            </div>
            <Switch
              id="show-real-avatar"
              checked={localSettings.show_real_avatar || false}
              onCheckedChange={(checked) => handleSettingChange('show_real_avatar', checked)}
            />
          </div>

          {/* Real Email */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4" />
              <div>
                <Label htmlFor="show-real-email" className="text-sm">
                  Show Real Email
                </Label>
                <p className="text-xs text-muted-foreground">
                  Allow others to see your email address
                </p>
              </div>
            </div>
            <Switch
              id="show-real-email"
              checked={localSettings.show_real_email || false}
              onCheckedChange={(checked) => handleSettingChange('show_real_email', checked)}
            />
          </div>

          {/* Real Location */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4" />
              <div>
                <Label htmlFor="show-real-location" className="text-sm">
                  Show Real Location
                </Label>
                <p className="text-xs text-muted-foreground">
                  Display your location information
                </p>
              </div>
            </div>
            <Switch
              id="show-real-location"
              checked={localSettings.show_real_location || false}
              onCheckedChange={(checked) => handleSettingChange('show_real_location', checked)}
            />
          </div>
        </div>

        <Separator />

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSaveSettings}
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </div>

        {/* Privacy Notice */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Privacy First:</strong> Your information is private by default. 
            Only enable these options if you want to share more information with other users.
            You can change these settings at any time.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
