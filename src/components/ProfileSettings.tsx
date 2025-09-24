import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { 
  User, 
  Camera, 
  Save, 
  X,
  Phone,
  Globe,
  MapPin,
  Mail,
  Award
} from "lucide-react";

interface ProfileSettingsProps {
  onClose?: () => void;
  showAvatar?: boolean;
  compact?: boolean;
}

export const ProfileSettings = ({ onClose, showAvatar = true, compact = false }: ProfileSettingsProps) => {
  const { toast } = useToast();
  const { role } = useUserRole();
  const {
    profile,
    loading: profileLoading,
    updating,
    updateProfile,
    uploadAvatar
  } = useUserProfile();
  
  const {
    settings,
    loading: settingsLoading,
    updateProfileSettings,
    updateNotificationSettings
  } = useUserSettings();

  const [localProfile, setLocalProfile] = useState(profile);
  const [localSettings, setLocalSettings] = useState(settings || {});
  const [hasChanges, setHasChanges] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  const loading = profileLoading || settingsLoading;

  // Update local state when data changes
  useEffect(() => {
    setLocalProfile(profile);
    setLocalSettings(settings || {});
  }, [profile, settings]);

  // Check for changes
  useEffect(() => {
    const profileChanged = JSON.stringify(localProfile) !== JSON.stringify(profile);
    const settingsChanged = JSON.stringify(localSettings) !== JSON.stringify(settings);
    setHasChanges(profileChanged || settingsChanged);
  }, [localProfile, localSettings, profile, settings]);

  const handleInputChange = (key: string, value: unknown) => {
    setLocalSettings(prev => ({ ...(prev || {}), [key]: value }));
  };

  const handleProfileChange = (key: string, value: unknown) => {
    setLocalProfile(prev => prev ? { ...prev, [key]: value } : null);
  };


  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Update profile
      if (localProfile) {
        const profileResult = await updateProfile(localProfile);
        if (!profileResult.success) {
          toast({
            title: "Error",
            description: profileResult.error || "Failed to update profile",
            variant: "destructive",
          });
          return;
        }
      }

      // Update settings
      if (localSettings) {
        const settingsResult = await updateProfileSettings(localSettings);
        if (!settingsResult.success) {
          toast({
            title: "Error",
            description: settingsResult.error || "Failed to update settings",
            variant: "destructive",
          });
          return;
        }
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      if (onClose) onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setLocalProfile(profile);
    setLocalSettings(settings || {});
    setAvatarFile(null);
    setAvatarPreview(null);
    if (onClose) onClose();
  };

  if (loading) {
    return (
      <Card className={compact ? "" : "w-full max-w-4xl"}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-sm text-muted-foreground">Loading profile...</span>
        </CardContent>
      </Card>
    );
  }


  return (
    <ErrorBoundary>
      <Card className={compact ? "" : "w-full max-w-4xl"}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Settings
              </CardTitle>
              <CardDescription>
                Update your personal information and profile details.
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
        {/* Avatar Section */}
        {showAvatar && (
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage 
                  src={avatarPreview || profile?.avatar_url || undefined} 
                  alt="Profile avatar" 
                />
                <AvatarFallback className="text-lg">
                  {profile?.display_name?.charAt(0) || profile?.first_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:bg-primary/90">
                <Camera className="h-3 w-3" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Profile Photo</p>
              <p className="text-sm text-muted-foreground">
                Upload a new profile photo. Recommended size: 400x400 pixels.
              </p>
            </div>
          </div>
        )}

        {/* Profile Completion Progress */}
        {localProfile && (
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Profile Completion</span>
              <span className="text-sm text-muted-foreground">
                {Math.round((Object.values(localProfile).filter(v => v && v.toString().trim()).length / 5) * 100)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(Object.values(localProfile).filter(v => v && v.toString().trim()).length / 5) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Complete your profile to help others connect with you
            </p>
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={localProfile?.first_name || ""}
                onChange={(e) => handleProfileChange('first_name', e.target.value)}
                placeholder="Enter your first name"
                className={!localProfile?.first_name ? 'border-orange-200' : ''}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={localProfile?.last_name || ""}
                onChange={(e) => handleProfileChange('last_name', e.target.value)}
                placeholder="Enter your last name"
                className={!localProfile?.last_name ? 'border-orange-200' : ''}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              value={localProfile?.display_name || ""}
              onChange={(e) => handleProfileChange('display_name', e.target.value)}
              placeholder="Enter your display name"
            />
            <p className="text-sm text-muted-foreground">
              This is the name that will be shown to other users. Leave empty to use your first and last name.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={localProfile?.bio || ""}
              onChange={(e) => handleProfileChange('bio', e.target.value)}
              placeholder="Tell us about yourself, your interests, and what you do..."
              rows={4}
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Share a bit about yourself with the community.
              </p>
              <span className="text-xs text-muted-foreground">
                {localProfile?.bio?.length || 0}/500
              </span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Contact Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone_number"
                  value={localSettings?.phone_number || ""}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  placeholder="Enter your phone number"
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website_url">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="website_url"
                  value={localSettings?.website_url || ""}
                  onChange={(e) => handleInputChange('website_url', e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={localSettings?.email || ""}
                disabled
                className="pl-10"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Email address cannot be changed here. Go to Settings → Security to change your email.
            </p>
          </div>
        </div>

        {/* Location Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Location</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location_city">City</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location_city"
                  value={localSettings?.location_city || ""}
                  onChange={(e) => handleInputChange('location_city', e.target.value)}
                  placeholder="Enter your city"
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location_state">State/Province</Label>
              <Input
                id="location_state"
                value={localSettings?.location_state || ""}
                onChange={(e) => handleInputChange('location_state', e.target.value)}
                placeholder="Enter your state"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location_country">Country</Label>
              <Input
                id="location_country"
                value={localSettings?.location_country || ""}
                onChange={(e) => handleInputChange('location_country', e.target.value)}
                placeholder="Enter your country"
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Additional Information</h3>
          
          <div className="space-y-2">
            <Label htmlFor="education">Education</Label>
            <div className="relative">
              <Award className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="education"
                value={localSettings?.education || ""}
                onChange={(e) => handleInputChange('education', e.target.value)}
                placeholder="e.g., Bachelor's in Fine Arts"
                className="pl-10"
              />
            </div>
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
    </ErrorBoundary>
  );
};
