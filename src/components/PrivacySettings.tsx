import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Save, 
  X,
  Lock,
  Globe,
  UserCheck,
  UserX
} from "lucide-react";

interface PrivacySettingsProps {
  onClose?: () => void;
  compact?: boolean;
}

export const PrivacySettings = ({ onClose, compact = false }: PrivacySettingsProps) => {
  const { toast } = useToast();
  const {
    settings,
    saving,
    updateProfileSettings,
    handleSettingChange
  } = useUserSettings();

  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  // Update local settings when settings change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Check for changes
  useEffect(() => {
    const changed = JSON.stringify(localSettings) !== JSON.stringify(settings);
    setHasChanges(changed);
  }, [localSettings, settings]);

  const handleInputChange = (key: string, value: unknown) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      const result = await updateProfileSettings(localSettings);
      if (result.success) {
        toast({
          title: "Success",
          description: "Privacy settings updated successfully",
        });
        if (onClose) onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update privacy settings",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    if (onClose) onClose();
  };

  return (
    <Card className={compact ? "" : "w-full"}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy Controls
            </CardTitle>
            <CardDescription>
              Manage your privacy and data sharing preferences.
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Profile Privacy */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Profile Privacy
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Private Profile</Label>
              <p className="text-sm text-muted-foreground">
                Make your profile visible only to approved followers.
              </p>
            </div>
            <Switch
              checked={localSettings.privacy_profile || false}
              onCheckedChange={(checked) => handleInputChange('privacy_profile', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Who can send you messages</Label>
            <Select
              value={localSettings.allow_messages_from || 'followers'}
              onValueChange={(value) => handleInputChange('allow_messages_from', value)}
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
            <p className="text-sm text-muted-foreground">
              Control who can send you direct messages.
            </p>
          </div>
        </div>

        <Separator />

        {/* Information Visibility */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Information Visibility
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Location</Label>
              <p className="text-sm text-muted-foreground">
                Allow others to see your general location.
              </p>
            </div>
            <Switch
              checked={localSettings.show_location !== false}
              onCheckedChange={(checked) => handleInputChange('show_location', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Contact Info</Label>
              <p className="text-sm text-muted-foreground">
                Allow others to see your contact information.
              </p>
            </div>
            <Switch
              checked={localSettings.show_contact_info !== false}
              onCheckedChange={(checked) => handleInputChange('show_contact_info', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Phone Number</Label>
              <p className="text-sm text-muted-foreground">
                Display your phone number on your profile.
              </p>
            </div>
            <Switch
              checked={localSettings.show_phone_number !== false}
              onCheckedChange={(checked) => handleInputChange('show_phone_number', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Website</Label>
              <p className="text-sm text-muted-foreground">
                Display your website URL on your profile.
              </p>
            </div>
            <Switch
              checked={localSettings.show_website !== false}
              onCheckedChange={(checked) => handleInputChange('show_website', checked)}
            />
          </div>
        </div>

        <Separator />

        {/* Data Sharing */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Data Sharing
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Analytics & Improvement</Label>
              <p className="text-sm text-muted-foreground">
                Help improve the app by sharing anonymous usage data.
              </p>
            </div>
            <Switch
              checked={localSettings.analytics_enabled !== false}
              onCheckedChange={(checked) => handleInputChange('analytics_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Personalized Recommendations</Label>
              <p className="text-sm text-muted-foreground">
                Allow the app to provide personalized content and suggestions.
              </p>
            </div>
            <Switch
              checked={localSettings.personalization_enabled !== false}
              onCheckedChange={(checked) => handleInputChange('personalization_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Social Features</Label>
              <p className="text-sm text-muted-foreground">
                Enable social features like following, sharing, and community interactions.
              </p>
            </div>
            <Switch
              checked={localSettings.social_features_enabled !== false}
              onCheckedChange={(checked) => handleInputChange('social_features_enabled', checked)}
            />
          </div>
        </div>

        <Separator />

        {/* Search & Discovery */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Search & Discovery
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Appear in Search Results</Label>
              <p className="text-sm text-muted-foreground">
                Allow others to find you through search.
              </p>
            </div>
            <Switch
              checked={localSettings.searchable !== false}
              onCheckedChange={(checked) => handleInputChange('searchable', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show in Recommendations</Label>
              <p className="text-sm text-muted-foreground">
                Allow the app to suggest your profile to others.
              </p>
            </div>
            <Switch
              checked={localSettings.recommendable !== false}
              onCheckedChange={(checked) => handleInputChange('recommendable', checked)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          {onClose && (
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          )}
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
