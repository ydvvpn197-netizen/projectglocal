import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Camera, 
  Save, 
  X,
  Phone,
  Globe,
  MapPin,
  Mail,
  Calendar,
  Award,
  Languages,
  Briefcase
} from "lucide-react";

interface ProfileSettingsProps {
  onClose?: () => void;
  showAvatar?: boolean;
  compact?: boolean;
}

export const ProfileSettings = ({ onClose, showAvatar = true, compact = false }: ProfileSettingsProps) => {
  const { toast } = useToast();
  const {
    settings,
    saving,
    updateProfileSettings,
    handleSettingChange
  } = useUserSettings();

  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

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
      const result = await updateProfileSettings(localSettings);
      if (result.success) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        if (onClose) onClose();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    setAvatarFile(null);
    setAvatarPreview(null);
    if (onClose) onClose();
  };

  return (
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
                  src={avatarPreview || settings.avatar_url || undefined} 
                  alt="Profile avatar" 
                />
                <AvatarFallback className="text-lg">
                  {settings.display_name?.charAt(0) || settings.first_name?.charAt(0) || "U"}
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

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={localSettings.first_name || ""}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="Enter your first name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={localSettings.last_name || ""}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              value={localSettings.display_name || ""}
              onChange={(e) => handleInputChange('display_name', e.target.value)}
              placeholder="Enter your display name"
            />
            <p className="text-sm text-muted-foreground">
              This is the name that will be shown to other users.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={localSettings.bio || ""}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself, your interests, and what you do..."
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              Share a bit about yourself with the community.
            </p>
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
                  value={localSettings.phone_number || ""}
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
                  value={localSettings.website_url || ""}
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
                value={localSettings.email || ""}
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
                  value={localSettings.location_city || ""}
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
                value={localSettings.location_state || ""}
                onChange={(e) => handleInputChange('location_state', e.target.value)}
                placeholder="Enter your state"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location_country">Country</Label>
              <Input
                id="location_country"
                value={localSettings.location_country || ""}
                onChange={(e) => handleInputChange('location_country', e.target.value)}
                placeholder="Enter your country"
              />
            </div>
          </div>
        </div>

        {/* Professional Information (for artists) */}
        {settings.user_type === 'artist' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Professional Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experience_years">Years of Experience</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="experience_years"
                    type="number"
                    min="0"
                    value={localSettings.experience_years || ""}
                    onChange={(e) => handleInputChange('experience_years', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <div className="relative">
                  <Award className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="education"
                    value={localSettings.education || ""}
                    onChange={(e) => handleInputChange('education', e.target.value)}
                    placeholder="e.g., Bachelor's in Fine Arts"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="artist_skills">Skills & Specialties</Label>
              <Textarea
                id="artist_skills"
                value={Array.isArray(localSettings.artist_skills) ? localSettings.artist_skills.join(', ') : ""}
                onChange={(e) => handleInputChange('artist_skills', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                placeholder="Enter your skills and specialties, separated by commas"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hourly_rate_min">Minimum Hourly Rate ($)</Label>
                <Input
                  id="hourly_rate_min"
                  type="number"
                  min="0"
                  step="0.01"
                  value={localSettings.hourly_rate_min || ""}
                  onChange={(e) => handleInputChange('hourly_rate_min', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hourly_rate_max">Maximum Hourly Rate ($)</Label>
                <Input
                  id="hourly_rate_max"
                  type="number"
                  min="0"
                  step="0.01"
                  value={localSettings.hourly_rate_max || ""}
                  onChange={(e) => handleInputChange('hourly_rate_max', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolio_urls">Portfolio URLs</Label>
              <Textarea
                id="portfolio_urls"
                value={Array.isArray(localSettings.portfolio_urls) ? localSettings.portfolio_urls.join('\n') : ""}
                onChange={(e) => handleInputChange('portfolio_urls', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
                placeholder="Enter your portfolio URLs, one per line"
                rows={3}
              />
            </div>
          </div>
        )}

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
