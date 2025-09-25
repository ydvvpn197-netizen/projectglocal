// Privacy-First Identity System for Project Glocal
import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  User, 
  Lock, 
  Globe, 
  MapPin, 
  Settings,
  CheckCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  Key,
  Fingerprint
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useSecurity } from '@/hooks/useSecurity';

interface PrivacyFirstIdentityProps {
  className?: string;
  onPrivacyChange?: (settings: PrivacySettings) => void;
}

interface PrivacySettings {
  isAnonymous: boolean;
  showLocation: boolean;
  showRealName: boolean;
  showContactInfo: boolean;
  allowDirectMessages: boolean;
  showOnlineStatus: boolean;
  dataRetention: 'minimal' | 'standard' | 'extended';
  analyticsOptIn: boolean;
  marketingOptIn: boolean;
}

interface IdentityProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  location: {
    city: string;
    state: string;
    country: string;
    isPublic: boolean;
  };
  contact: {
    email: string;
    phone: string;
    isPublic: boolean;
  };
  social: {
    website: string;
    twitter: string;
    instagram: string;
    isPublic: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
  };
  privacy: PrivacySettings;
  createdAt: string;
  lastActive: string;
}

export const PrivacyFirstIdentity: React.FC<PrivacyFirstIdentityProps> = React.memo(({ 
  className,
  onPrivacyChange 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { sanitizeText, validateInput, generateSecureToken } = useSecurity();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingUsername, setIsGeneratingUsername] = useState(false);
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    username: '',
    displayName: '',
    bio: '',
    location: {
      city: '',
      state: '',
      country: ''
    },
    contact: {
      email: '',
      phone: ''
    },
    social: {
      website: '',
      twitter: '',
      instagram: ''
    }
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    isAnonymous: true,
    showLocation: false,
    showRealName: false,
    showContactInfo: false,
    allowDirectMessages: true,
    showOnlineStatus: false,
    dataRetention: 'minimal',
    analyticsOptIn: false,
    marketingOptIn: false
  });

  // Mock profile data - in production, this would come from Supabase
  const [profile, setProfile] = useState<IdentityProfile>({
    id: user?.id || 'anonymous',
    username: 'user_' + Math.random().toString(36).substr(2, 9),
    displayName: 'Anonymous User',
    bio: 'Privacy-first community member',
    avatar: '',
    location: {
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      isPublic: false
    },
    contact: {
      email: '',
      phone: '',
      isPublic: false
    },
    social: {
      website: '',
      twitter: '',
      instagram: '',
      isPublic: false
    },
    preferences: {
      theme: 'auto',
      language: 'en',
      timezone: 'Asia/Kolkata'
    },
    privacy: privacySettings,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString()
  });

  // Generate anonymous username
  const generateAnonymousUsername = useCallback(async () => {
    setIsGeneratingUsername(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const adjectives = ['Swift', 'Bright', 'Calm', 'Bold', 'Wise', 'Kind', 'Brave', 'Gentle'];
      const nouns = ['Explorer', 'Thinker', 'Creator', 'Dreamer', 'Builder', 'Helper', 'Guide', 'Friend'];
      const numbers = Math.floor(Math.random() * 9999);
      
      const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      const newUsername = `${adjective}${noun}${numbers}`;
      
      setProfileForm(prev => ({ ...prev, username: newUsername }));
      
      toast({
        title: "Username Generated",
        description: "Your anonymous username has been generated"
      });
    } catch (error) {
      console.error('Error generating username:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate username. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingUsername(false);
    }
  }, [toast]);

  // Update privacy settings
  const handlePrivacyChange = useCallback((key: keyof PrivacySettings, value: boolean | string) => {
    const newSettings = { ...privacySettings, [key]: value };
    setPrivacySettings(newSettings);
    setProfile(prev => ({ ...prev, privacy: newSettings }));
    onPrivacyChange?.(newSettings);
    
    toast({
      title: "Privacy Updated",
      description: "Your privacy settings have been updated"
    });
  }, [privacySettings, onPrivacyChange, toast]);

  // Save profile changes
  const handleSaveProfile = useCallback(async () => {
    if (!validateInput(profileForm.username, 'username') || 
        !validateInput(profileForm.displayName, 'text')) {
      toast({
        title: "Invalid Input",
        description: "Please check your input and try again",
        variant: "destructive"
      });
      return;
    }

    try {
      const updatedProfile: IdentityProfile = {
        ...profile,
        username: sanitizeText(profileForm.username),
        displayName: sanitizeText(profileForm.displayName),
        bio: sanitizeText(profileForm.bio),
        location: {
          ...profile.location,
          ...profileForm.location
        },
        contact: {
          ...profile.contact,
          ...profileForm.contact
        },
        social: {
          ...profile.social,
          ...profileForm.social
        },
        lastActive: new Date().toISOString()
      };

      setProfile(updatedProfile);
      setIsEditing(false);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  }, [profile, profileForm, validateInput, sanitizeText, toast]);

  // Reset to anonymous mode
  const handleResetToAnonymous = useCallback(async () => {
    try {
      const newUsername = 'user_' + Math.random().toString(36).substr(2, 9);
      const updatedProfile: IdentityProfile = {
        ...profile,
        username: newUsername,
        displayName: 'Anonymous User',
        bio: 'Privacy-first community member',
        location: {
          ...profile.location,
          isPublic: false
        },
        contact: {
          ...profile.contact,
          isPublic: false
        },
        social: {
          ...profile.social,
          isPublic: false
        },
        privacy: {
          ...privacySettings,
          isAnonymous: true,
          showLocation: false,
          showRealName: false,
          showContactInfo: false
        }
      };

      setProfile(updatedProfile);
      setPrivacySettings(updatedProfile.privacy);
      
      toast({
        title: "Anonymous Mode",
        description: "Your profile has been reset to anonymous mode"
      });
    } catch (error) {
      console.error('Error resetting to anonymous:', error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset profile. Please try again.",
        variant: "destructive"
      });
    }
  }, [profile, privacySettings, toast]);

  // Privacy level indicator
  const privacyLevel = useMemo(() => {
    const settings = privacySettings;
    let score = 0;
    
    if (settings.isAnonymous) score += 3;
    if (!settings.showLocation) score += 2;
    if (!settings.showRealName) score += 2;
    if (!settings.showContactInfo) score += 2;
    if (!settings.showOnlineStatus) score += 1;
    if (settings.dataRetention === 'minimal') score += 2;
    if (!settings.analyticsOptIn) score += 1;
    if (!settings.marketingOptIn) score += 1;
    
    if (score >= 12) return { level: 'Maximum', color: 'text-green-600', icon: Shield };
    if (score >= 8) return { level: 'High', color: 'text-blue-600', icon: Lock };
    if (score >= 4) return { level: 'Medium', color: 'text-yellow-600', icon: Eye };
    return { level: 'Low', color: 'text-red-600', icon: AlertTriangle };
  }, [privacySettings]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Privacy-First Identity</h2>
          <p className="text-gray-600">Control your privacy and identity on the platform</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge 
            variant={privacySettings.isAnonymous ? "default" : "outline"}
            className={`flex items-center gap-1 ${privacySettings.isAnonymous ? 'bg-green-100 text-green-800' : ''}`}
          >
            {privacySettings.isAnonymous ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {privacySettings.isAnonymous ? 'Anonymous' : 'Public'}
          </Badge>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPrivacyDialog(true)}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Privacy Settings
          </Button>
        </div>
      </div>

      {/* Privacy Level Indicator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <privacyLevel.icon className={`h-5 w-5 ${privacyLevel.color}`} />
            Privacy Level: {privacyLevel.level}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Anonymous Mode</span>
              <Badge variant={privacySettings.isAnonymous ? "default" : "outline"}>
                {privacySettings.isAnonymous ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Location Sharing</span>
              <Badge variant={privacySettings.showLocation ? "destructive" : "default"}>
                {privacySettings.showLocation ? 'Public' : 'Private'}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Real Name</span>
              <Badge variant={privacySettings.showRealName ? "destructive" : "default"}>
                {privacySettings.showRealName ? 'Visible' : 'Hidden'}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Contact Info</span>
              <Badge variant={privacySettings.showContactInfo ? "destructive" : "default"}>
                {privacySettings.showContactInfo ? 'Public' : 'Private'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Identity Profile</CardTitle>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Save' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <div className="flex gap-2">
                        <Input
                          id="username"
                          value={profileForm.username}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                          placeholder="Choose a username"
                        />
                        <Button
                          variant="outline"
                          onClick={generateAnonymousUsername}
                          disabled={isGeneratingUsername}
                        >
                          {isGeneratingUsername ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={profileForm.displayName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, displayName: e.target.value }))}
                        placeholder="How you want to be known"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={profileForm.location.city}
                        onChange={(e) => setProfileForm(prev => ({ 
                          ...prev, 
                          location: { ...prev.location, city: e.target.value }
                        }))}
                        placeholder="Your city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={profileForm.location.state}
                        onChange={(e) => setProfileForm(prev => ({ 
                          ...prev, 
                          location: { ...prev.location, state: e.target.value }
                        }))}
                        placeholder="Your state"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={profileForm.location.country}
                        onChange={(e) => setProfileForm(prev => ({ 
                          ...prev, 
                          location: { ...prev.location, country: e.target.value }
                        }))}
                        placeholder="Your country"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile}>
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{profile.displayName}</h3>
                      <p className="text-gray-600">@{profile.username}</p>
                      <p className="text-sm text-gray-500">{profile.bio}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Location:</span>
                      <span className="ml-2">
                        {privacySettings.showLocation 
                          ? `${profile.location.city}, ${profile.location.state}, ${profile.location.country}`
                          : 'Hidden'
                        }
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Member Since:</span>
                      <span className="ml-2">
                        {new Date(profile.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="anonymous">Anonymous Mode</Label>
                    <p className="text-sm text-gray-600">
                      Hide your identity from other users
                    </p>
                  </div>
                  <Switch
                    id="anonymous"
                    checked={privacySettings.isAnonymous}
                    onCheckedChange={(checked) => handlePrivacyChange('isAnonymous', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="location">Show Location</Label>
                    <p className="text-sm text-gray-600">
                      Allow others to see your location
                    </p>
                  </div>
                  <Switch
                    id="location"
                    checked={privacySettings.showLocation}
                    onCheckedChange={(checked) => handlePrivacyChange('showLocation', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="realName">Show Real Name</Label>
                    <p className="text-sm text-gray-600">
                      Display your real name instead of username
                    </p>
                  </div>
                  <Switch
                    id="realName"
                    checked={privacySettings.showRealName}
                    onCheckedChange={(checked) => handlePrivacyChange('showRealName', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="contactInfo">Show Contact Info</Label>
                    <p className="text-sm text-gray-600">
                      Allow others to see your contact information
                    </p>
                  </div>
                  <Switch
                    id="contactInfo"
                    checked={privacySettings.showContactInfo}
                    onCheckedChange={(checked) => handlePrivacyChange('showContactInfo', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="onlineStatus">Show Online Status</Label>
                    <p className="text-sm text-gray-600">
                      Let others know when you're online
                    </p>
                  </div>
                  <Switch
                    id="onlineStatus"
                    checked={privacySettings.showOnlineStatus}
                    onCheckedChange={(checked) => handlePrivacyChange('showOnlineStatus', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data & Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="analytics">Analytics Opt-in</Label>
                    <p className="text-sm text-gray-600">
                      Help improve the platform with anonymous usage data
                    </p>
                  </div>
                  <Switch
                    id="analytics"
                    checked={privacySettings.analyticsOptIn}
                    onCheckedChange={(checked) => handlePrivacyChange('analyticsOptIn', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="marketing">Marketing Communications</Label>
                    <p className="text-sm text-gray-600">
                      Receive updates about new features and community events
                    </p>
                  </div>
                  <Switch
                    id="marketing"
                    checked={privacySettings.marketingOptIn}
                    onCheckedChange={(checked) => handlePrivacyChange('marketingOptIn', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="directMessages">Allow Direct Messages</Label>
                    <p className="text-sm text-gray-600">
                      Let other users send you direct messages
                    </p>
                  </div>
                  <Switch
                    id="directMessages"
                    checked={privacySettings.allowDirectMessages}
                    onCheckedChange={(checked) => handlePrivacyChange('allowDirectMessages', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="dataRetention">Data Retention</Label>
                    <p className="text-sm text-gray-600">
                      How long to keep your data
                    </p>
                  </div>
                  <select
                    value={privacySettings.dataRetention}
                    onChange={(e) => handlePrivacyChange('dataRetention', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="minimal">Minimal (30 days)</option>
                    <option value="standard">Standard (1 year)</option>
                    <option value="extended">Extended (3 years)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={handleResetToAnonymous}
                  className="flex items-center gap-2"
                >
                  <EyeOff className="h-4 w-4" />
                  Reset to Anonymous
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowPrivacyDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Advanced Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Privacy Settings Dialog */}
      <Dialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Advanced Privacy Settings</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Identity Controls</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Anonymous Mode</span>
                  <Switch
                    checked={privacySettings.isAnonymous}
                    onCheckedChange={(checked) => handlePrivacyChange('isAnonymous', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Show Location</span>
                  <Switch
                    checked={privacySettings.showLocation}
                    onCheckedChange={(checked) => handlePrivacyChange('showLocation', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Show Real Name</span>
                  <Switch
                    checked={privacySettings.showRealName}
                    onCheckedChange={(checked) => handlePrivacyChange('showRealName', checked)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Communication</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Allow Direct Messages</span>
                  <Switch
                    checked={privacySettings.allowDirectMessages}
                    onCheckedChange={(checked) => handlePrivacyChange('allowDirectMessages', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Show Online Status</span>
                  <Switch
                    checked={privacySettings.showOnlineStatus}
                    onCheckedChange={(checked) => handlePrivacyChange('showOnlineStatus', checked)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Data & Privacy</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Analytics Opt-in</span>
                  <Switch
                    checked={privacySettings.analyticsOptIn}
                    onCheckedChange={(checked) => handlePrivacyChange('analyticsOptIn', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Marketing Communications</span>
                  <Switch
                    checked={privacySettings.marketingOptIn}
                    onCheckedChange={(checked) => handlePrivacyChange('marketingOptIn', checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

PrivacyFirstIdentity.displayName = 'PrivacyFirstIdentity';
