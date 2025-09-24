import React, { useState } from 'react';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProfileSettings } from '@/components/ProfileSettings';
import { 
  User, 
  Shield, 
  Bell, 
  CreditCard, 
  Globe, 
  Eye, 
  EyeOff,
  Settings as SettingsIcon,
  Crown,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useProPermissions } from '@/hooks/useProPermissions';

export const ConsolidatedSettings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isPro } = useProPermissions();
  const [activeTab, setActiveTab] = useState('profile');

  const settingsTabs = [
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      description: 'Personal information and profile details'
    },
    {
      id: 'privacy',
      label: 'Privacy',
      icon: Shield,
      description: 'Control your privacy and data settings'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      description: 'Manage your notification preferences'
    },
    {
      id: 'subscription',
      label: 'Subscription',
      icon: Crown,
      description: 'Manage your Pro subscription'
    },
    {
      id: 'account',
      label: 'Account',
      icon: SettingsIcon,
      description: 'Account security and preferences'
    }
  ];

  if (!user) {
    navigate('/signin');
    return null;
  }

  return (
    <ResponsiveLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground mt-2">
                Manage your account, privacy, and preferences
              </p>
            </div>
            {isPro && (
              <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <Crown className="w-3 h-3 mr-1" />
                Pro Member
              </Badge>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Settings
                </CardTitle>
                <CardDescription>
                  Update your personal information and profile details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileSettings compact />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Privacy Controls
                  </CardTitle>
                  <CardDescription>
                    Control who can see your information and activity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Anonymous Mode</p>
                      <p className="text-sm text-muted-foreground">
                        Browse and post anonymously
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Enable
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Profile Visibility</p>
                      <p className="text-sm text-muted-foreground">
                        Control who can see your profile
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Public
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Activity Tracking</p>
                      <p className="text-sm text-muted-foreground">
                        Allow platform to track your activity for recommendations
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Disabled
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Data & Privacy
                  </CardTitle>
                  <CardDescription>
                    Manage your data and privacy settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Download Your Data
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <EyeOff className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <SettingsIcon className="h-4 w-4 mr-2" />
                    Privacy Policy
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications on your device
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enabled
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enabled
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Community Updates</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified about community activities
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enabled
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Event Reminders</p>
                      <p className="text-sm text-muted-foreground">
                        Get reminded about upcoming events
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enabled
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Subscription Management
                </CardTitle>
                <CardDescription>
                  Manage your Pro subscription and billing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Crown className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">
                    {isPro ? 'Pro Subscription Active' : 'Upgrade to Pro'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {isPro 
                      ? 'You have access to all Pro features'
                      : 'Unlock premium features and support the platform'
                    }
                  </p>
                  <Button 
                    onClick={() => navigate('/subscription')}
                    className="bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    {isPro ? 'Manage Subscription' : 'Upgrade to Pro'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="h-5 w-5" />
                    Account Security
                  </CardTitle>
                  <CardDescription>
                    Manage your account security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <SettingsIcon className="h-4 w-4 mr-2" />
                    Two-Factor Authentication
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Payment Methods
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Account Information
                  </CardTitle>
                  <CardDescription>
                    View your account details and activity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Email Address</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Account Created</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Last Sign In</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(user.last_sign_in_at || user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveLayout>
  );
};

export default ConsolidatedSettings;
