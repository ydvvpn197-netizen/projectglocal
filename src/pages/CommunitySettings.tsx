import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { 
  Settings, 
  Shield, 
  Users, 
  Bell, 
  CreditCard, 
  User,
  MessageCircle,
  Calendar,
  Star,
  Globe,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

// Import our enhanced components
import AnonymousEngagement from '@/components/AnonymousEngagement';
import { PrivacySettings } from '@/components/PrivacySettings';
import { NotificationSettings } from '@/components/NotificationSettings';
import { ProfileSettings } from '@/components/ProfileSettings';
import { SecuritySettings } from '@/components/SecuritySettings';

export const CommunitySettings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('privacy');

  const tabs = [
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="h-4 w-4" />,
      description: 'Manage your profile information and visibility'
    },
    {
      id: 'privacy',
      label: 'Privacy & Anonymous',
      icon: <Shield className="h-4 w-4" />,
      description: 'Control your privacy and anonymous engagement settings'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="h-4 w-4" />,
      description: 'Configure your notification preferences'
    },
    {
      id: 'security',
      label: 'Security',
      icon: <Lock className="h-4 w-4" />,
      description: 'Manage your account security settings'
    },
    {
      id: 'subscription',
      label: 'Subscription',
      icon: <CreditCard className="h-4 w-4" />,
      description: 'Manage your subscription and billing'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Community Settings</h1>
        <p className="text-muted-foreground">
          Customize your experience and control how you interact with the community
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-8">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Settings
              </CardTitle>
              <CardDescription>
                Manage your profile information, avatar, and public visibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Anonymous Engagement
              </CardTitle>
              <CardDescription>
                Control your privacy settings and how you engage anonymously with the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnonymousEngagement />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Privacy Controls
              </CardTitle>
              <CardDescription>
                Additional privacy settings for your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PrivacySettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SecuritySettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription & Billing
              </CardTitle>
              <CardDescription>
                Manage your subscription plan and billing information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Current Plan Display */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium">Current Plan</h3>
                      <p className="text-sm text-muted-foreground">
                        You're currently on the Free plan
                      </p>
                    </div>
                    <Badge variant="outline">Free</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Available Features</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li className="flex items-center gap-2">
                          <MessageCircle className="h-3 w-3" />
                          Basic messaging
                        </li>
                        <li className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          View events
                        </li>
                        <li className="flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          Basic community access
                        </li>
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Pro Features</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li className="flex items-center gap-2">
                          <Star className="h-3 w-3" />
                          Comment on news
                        </li>
                        <li className="flex items-center gap-2">
                          <Eye className="h-3 w-3" />
                          Anonymous engagement
                        </li>
                        <li className="flex items-center gap-2">
                          <Globe className="h-3 w-3" />
                          Priority support
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Subscription Plans */}
                <div className="space-y-4">
                  <h3 className="font-medium">Upgrade Your Plan</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Normal User Plan */}
                    <Card className="border-2">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Normal User Pro</CardTitle>
                        <CardDescription>
                          Perfect for regular community members
                        </CardDescription>
                        <div className="text-2xl font-bold">₹20<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <ul className="text-sm space-y-2">
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            Comment on news articles
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            Anonymous engagement
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            Priority support
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            Enhanced visibility
                          </li>
                        </ul>
                        <Button className="w-full">
                          Upgrade to Pro
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Artist Plan */}
                    <Card className="border-2 border-primary">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Artist Pro</CardTitle>
                          <Badge>Popular</Badge>
                        </div>
                        <CardDescription>
                          For artists and service providers
                        </CardDescription>
                        <div className="text-2xl font-bold">₹100<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <ul className="text-sm space-y-2">
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            All Normal User features
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            Service marketplace
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            Follower engagement tools
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            Advanced analytics
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            Custom branding
                          </li>
                        </ul>
                        <Button className="w-full">
                          Upgrade to Artist Pro
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Billing Information */}
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-4">Billing Information</h3>
                  <div className="text-sm text-muted-foreground">
                    <p>No active subscription</p>
                    <p>Upgrade to a paid plan to access premium features</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunitySettings;
