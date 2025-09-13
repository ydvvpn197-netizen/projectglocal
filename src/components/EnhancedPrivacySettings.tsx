import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useAnonymousUsername } from '@/hooks/useAnonymousUsername';
import { useToast } from '@/hooks/use-toast';
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
  UserX,
  Settings,
  AlertTriangle,
  Info,
  User,
  Map,
  MessageSquare,
  Activity
} from 'lucide-react';

interface EnhancedPrivacySettingsProps {
  onClose?: () => void;
  compact?: boolean;
}

export const EnhancedPrivacySettings: React.FC<EnhancedPrivacySettingsProps> = ({ 
  onClose, 
  compact = false 
}) => {
  const { toast } = useToast();
  const {
    settings,
    saving,
    updateProfileSettings,
    handleSettingChange
  } = useUserSettings();

  const {
    anonymousUser,
    createAnonymousUser,
    regenerateUsername,
    getPrivacyRecommendations
  } = useAnonymousUsername();

  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [privacyScore, setPrivacyScore] = useState(0);

  // Update local settings when settings change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Check for changes
  useEffect(() => {
    const changed = JSON.stringify(localSettings) !== JSON.stringify(settings);
    setHasChanges(changed);
  }, [localSettings, settings]);

  // Calculate privacy score
  useEffect(() => {
    let score = 0;
    
    // Profile visibility
    if (localSettings.privacy_profile === false) score += 2;
    else if (localSettings.privacy_profile === true) score += 1;
    
    // Location sharing
    if (localSettings.show_location === false) score += 2;
    else if (localSettings.show_location === true) score += 1;
    
    // Contact info
    if (localSettings.show_contact_info === false) score += 2;
    else if (localSettings.show_contact_info === true) score += 1;
    
    // Anonymous mode
    if (localSettings.anonymous_mode === true) score += 3;
    
    // Location precision
    if (localSettings.precise_location === false) score += 1;
    
    setPrivacyScore(score);
  }, [localSettings]);

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

  const getPrivacyLevel = (score: number) => {
    if (score >= 8) return { level: 'Maximum', color: 'bg-green-100 text-green-800', icon: <Shield className="h-4 w-4" /> };
    if (score >= 6) return { level: 'High', color: 'bg-blue-100 text-blue-800', icon: <Lock className="h-4 w-4" /> };
    if (score >= 4) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800', icon: <Eye className="h-4 w-4" /> };
    return { level: 'Low', color: 'bg-red-100 text-red-800', icon: <EyeOff className="h-4 w-4" /> };
  };

  const privacyLevel = getPrivacyLevel(privacyScore);

  const getRecommendations = () => {
    const userBehavior = {
      postFrequency: 5, // This would come from actual user data
      commentFrequency: 10,
      locationSharing: localSettings.show_location || false,
      realNameUsage: !localSettings.anonymous_mode
    };
    
    return getPrivacyRecommendations(userBehavior);
  };

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span className="font-medium">Privacy Level</span>
          </div>
          <Badge className={privacyLevel.color}>
            {privacyLevel.icon}
            <span className="ml-1">{privacyLevel.level}</span>
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="anonymous-mode" className="text-sm">Anonymous Mode</Label>
            <Switch
              id="anonymous-mode"
              checked={localSettings.anonymous_mode || false}
              onCheckedChange={(checked) => handleInputChange('anonymous_mode', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="show-location" className="text-sm">Show Location</Label>
            <Switch
              id="show-location"
              checked={localSettings.show_location || false}
              onCheckedChange={(checked) => handleInputChange('show_location', checked)}
            />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button onClick={handleSave} disabled={!hasChanges || saving} size="sm">
            {saving ? 'Saving...' : 'Save'}
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose} size="sm">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Enhanced Privacy Controls
            </CardTitle>
            <CardDescription>
              Comprehensive privacy and anonymity management for maximum protection
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Privacy Score:</span>
            <Badge className={privacyLevel.color}>
              {privacyLevel.icon}
              <span className="ml-1">{privacyLevel.level} ({privacyScore}/10)</span>
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRecommendations(!showRecommendations)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Recommendations
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="anonymous">Anonymous</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Visibility
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="privacy-profile">Private Profile</Label>
                    <p className="text-sm text-gray-500">Hide your profile from public view</p>
                  </div>
                  <Switch
                    id="privacy-profile"
                    checked={localSettings.privacy_profile || false}
                    onCheckedChange={(checked) => handleInputChange('privacy_profile', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-email">Show Email</Label>
                    <p className="text-sm text-gray-500">Display email address on profile</p>
                  </div>
                  <Switch
                    id="show-email"
                    checked={localSettings.show_email || false}
                    onCheckedChange={(checked) => handleInputChange('show_email', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-phone">Show Phone</Label>
                    <p className="text-sm text-gray-500">Display phone number on profile</p>
                  </div>
                  <Switch
                    id="show-phone"
                    checked={localSettings.show_phone || false}
                    onCheckedChange={(checked) => handleInputChange('show_phone', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-bio">Show Bio</Label>
                    <p className="text-sm text-gray-500">Display bio information</p>
                  </div>
                  <Switch
                    id="show-bio"
                    checked={localSettings.show_bio || false}
                    onCheckedChange={(checked) => handleInputChange('show_bio', checked)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="location" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Map className="h-5 w-5" />
                Location Privacy
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-location">Show Location</Label>
                    <p className="text-sm text-gray-500">Display your location on profile and posts</p>
                  </div>
                  <Switch
                    id="show-location"
                    checked={localSettings.show_location || false}
                    onCheckedChange={(checked) => handleInputChange('show_location', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="precise-location">Precise Location</Label>
                    <p className="text-sm text-gray-500">Share exact coordinates vs. city-level location</p>
                  </div>
                  <Switch
                    id="precise-location"
                    checked={localSettings.precise_location || false}
                    onCheckedChange={(checked) => handleInputChange('precise_location', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="location-history">Location History</Label>
                    <p className="text-sm text-gray-500">Allow tracking of location history</p>
                  </div>
                  <Switch
                    id="location-history"
                    checked={localSettings.location_history || false}
                    onCheckedChange={(checked) => handleInputChange('location_history', checked)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="activity" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activity Visibility
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-posts">Show Posts</Label>
                    <p className="text-sm text-gray-500">Display your posts publicly</p>
                  </div>
                  <Switch
                    id="show-posts"
                    checked={localSettings.show_posts || false}
                    onCheckedChange={(checked) => handleInputChange('show_posts', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-events">Show Events</Label>
                    <p className="text-sm text-gray-500">Display your events publicly</p>
                  </div>
                  <Switch
                    id="show-events"
                    checked={localSettings.show_events || false}
                    onCheckedChange={(checked) => handleInputChange('show_events', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-followers">Show Followers</Label>
                    <p className="text-sm text-gray-500">Display follower count and list</p>
                  </div>
                  <Switch
                    id="show-followers"
                    checked={localSettings.show_followers || false}
                    onCheckedChange={(checked) => handleInputChange('show_followers', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="searchable">Searchable</Label>
                    <p className="text-sm text-gray-500">Allow others to find you in search</p>
                  </div>
                  <Switch
                    id="searchable"
                    checked={localSettings.searchable || false}
                    onCheckedChange={(checked) => handleInputChange('searchable', checked)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="anonymous" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <UserX className="h-5 w-5" />
                Anonymous Mode
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="anonymous-mode">Enable Anonymous Mode</Label>
                    <p className="text-sm text-gray-500">Use anonymous usernames for posts and comments</p>
                  </div>
                  <Switch
                    id="anonymous-mode"
                    checked={localSettings.anonymous_mode || false}
                    onCheckedChange={(checked) => handleInputChange('anonymous_mode', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="anonymous-posts">Anonymous Posts</Label>
                    <p className="text-sm text-gray-500">Post anonymously by default</p>
                  </div>
                  <Switch
                    id="anonymous-posts"
                    checked={localSettings.anonymous_posts || false}
                    onCheckedChange={(checked) => handleInputChange('anonymous_posts', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="anonymous-comments">Anonymous Comments</Label>
                    <p className="text-sm text-gray-500">Comment anonymously by default</p>
                  </div>
                  <Switch
                    id="anonymous-comments"
                    checked={localSettings.anonymous_comments || false}
                    onCheckedChange={(checked) => handleInputChange('anonymous_comments', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="anonymous-votes">Anonymous Votes</Label>
                    <p className="text-sm text-gray-500">Vote anonymously in polls</p>
                  </div>
                  <Switch
                    id="anonymous-votes"
                    checked={localSettings.anonymous_votes || false}
                    onCheckedChange={(checked) => handleInputChange('anonymous_votes', checked)}
                  />
                </div>
              </div>
              
              {localSettings.anonymous_mode && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Anonymous Username</h4>
                  {anonymousUser ? (
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm">{anonymousUser.generated_username}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => regenerateUsername()}
                      >
                        Regenerate
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => createAnonymousUser()}
                    >
                      Generate Username
                    </Button>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        {showRecommendations && (
          <Alert className="mt-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <h4 className="font-medium">Privacy Recommendations</h4>
                <p className="text-sm">
                  Based on your current settings, we recommend:
                </p>
                <ul className="text-sm list-disc list-inside space-y-1">
                  {privacyScore < 6 && (
                    <li>Enable anonymous mode for better privacy protection</li>
                  )}
                  {localSettings.show_location && (
                    <li>Consider disabling location sharing for maximum privacy</li>
                  )}
                  {localSettings.show_contact_info && (
                    <li>Hide contact information to prevent unwanted contact</li>
                  )}
                  {!localSettings.anonymous_mode && (
                    <li>Use anonymous usernames for sensitive discussions</li>
                  )}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <Separator className="my-6" />
        
        <div className="flex justify-between">
          <div className="text-sm text-gray-500">
            {hasChanges && "You have unsaved changes"}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};