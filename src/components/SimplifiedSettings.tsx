import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  MapPin,
  Eye,
  EyeOff,
  Save,
  LogOut,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SimplifiedSettingsProps {
  className?: string;
}

export const SimplifiedSettings: React.FC<SimplifiedSettingsProps> = ({
  className = '',
}) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    // Profile settings
    displayName: user?.user_metadata?.full_name || '',
    bio: '',
    location: '',
    website: '',
    
    // Privacy settings
    profileVisibility: 'public',
    showEmail: false,
    showLocation: true,
    allowMessages: true,
    
    // Notification settings
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    eventReminders: true,
    
    // Location settings
    shareLocation: false,
    locationAccuracy: 'city',
  });

  const handleSettingChange = (key: string, value: unknown) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Simulate account deletion
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your profile information and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="text-lg">
                    {user?.user_metadata?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    Change Avatar
                  </Button>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click to upload a new profile picture
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={settings.displayName}
                    onChange={(e) => handleSettingChange('displayName', e.target.value)}
                    placeholder="Enter your display name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={settings.location}
                    onChange={(e) => handleSettingChange('location', e.target.value)}
                    placeholder="City, State"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  value={settings.bio}
                  onChange={(e) => handleSettingChange('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  className="w-full p-3 border rounded-md min-h-[100px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={settings.website}
                  onChange={(e) => handleSettingChange('website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Control your privacy and visibility on the platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Profile Visibility</Label>
                  <p className="text-sm text-muted-foreground">
                    Make your profile visible to other users
                  </p>
                </div>
                <Switch
                  checked={settings.profileVisibility === 'public'}
                  onCheckedChange={(checked) => 
                    handleSettingChange('profileVisibility', checked ? 'public' : 'private')
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Show Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Display your email on your profile
                  </p>
                </div>
                <Switch
                  checked={settings.showEmail}
                  onCheckedChange={(checked) => handleSettingChange('showEmail', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Show Location</Label>
                  <p className="text-sm text-muted-foreground">
                    Display your location on your profile
                  </p>
                </div>
                <Switch
                  checked={settings.showLocation}
                  onCheckedChange={(checked) => handleSettingChange('showLocation', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Allow Messages</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow other users to send you messages
                  </p>
                </div>
                <Switch
                  checked={settings.allowMessages}
                  onCheckedChange={(checked) => handleSettingChange('allowMessages', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Manage your notification preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified in real-time
                  </p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive promotional content
                  </p>
                </div>
                <Switch
                  checked={settings.marketingEmails}
                  onCheckedChange={(checked) => handleSettingChange('marketingEmails', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Event Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminded about upcoming events
                  </p>
                </div>
                <Switch
                  checked={settings.eventReminders}
                  onCheckedChange={(checked) => handleSettingChange('eventReminders', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                Manage your account settings and data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input value={user?.email || ''} disabled />
                <p className="text-sm text-muted-foreground">
                  Contact support to change your email address
                </p>
              </div>

              <div className="space-y-2">
                <Label>Password</Label>
                <Button variant="outline" className="w-full justify-start">
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                <div className="space-y-0.5">
                  <Label>Sign Out</Label>
                  <p className="text-sm text-muted-foreground">
                    Sign out of your account on this device.
                  </p>
                </div>
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-destructive">Delete Account</Label>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data.
                  </p>
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Delete Account
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default SimplifiedSettings;
