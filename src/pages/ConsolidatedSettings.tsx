import { useState, useCallback } from "react";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { ProfileSettings } from "@/components/ProfileSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Eye, 
  Crown, 
  Mail, 
  Phone, 
  Lock, 
  Globe, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Monitor, 
  Palette, 
  Languages, 
  MapPin, 
  Calendar, 
  Clock, 
  Trash2, 
  Download, 
  Upload, 
  RefreshCw, 
  LogOut, 
  AlertTriangle, 
  CheckCircle,
  Info,
  HelpCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/useTheme";
import { motion } from "framer-motion";

interface SettingsCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const settingsCategories: SettingsCategory[] = [
  {
    id: 'profile',
    title: 'Profile Settings',
    description: 'Manage your personal information and profile',
    icon: User,
    color: 'bg-blue-500'
  },
  {
    id: 'privacy',
    title: 'Privacy & Security',
    description: 'Control your privacy and security settings',
    icon: Shield,
    color: 'bg-green-500'
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Customize your notification preferences',
    icon: Bell,
    color: 'bg-yellow-500'
  },
  {
    id: 'subscription',
    title: 'Subscription',
    description: 'Manage your subscription and billing',
    icon: Crown,
    color: 'bg-purple-500'
  },
  {
    id: 'account',
    title: 'Account Management',
    description: 'Advanced account settings and data management',
    icon: Settings,
    color: 'bg-gray-500'
  }
];

const ConsolidatedSettings = () => {
  const { user, logout } = useAuth();
  const { profile, updateProfile } = useUserProfile();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [activeCategory, setActiveCategory] = useState('profile');
  const [isProMember, setIsProMember] = useState(profile?.is_pro || false);

  // Enhanced notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false,
    events: true,
    posts: true,
    communities: true,
    messages: true,
    mentions: true
  });

  // Enhanced privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showLocation: true,
    allowMessages: true,
    allowFollows: true,
    analyticsOptOut: false,
    dataDownload: false
  });

  // Enhanced account settings
  const [accountSettings, setAccountSettings] = useState({
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    currency: 'USD'
  });

  // Enhanced handlers
  const handleNotificationChange = useCallback((key: string, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Notification Settings Updated",
      description: `${key} notifications ${value ? 'enabled' : 'disabled'}.`,
    });
  }, [toast]);

  const handlePrivacyChange = useCallback((key: string, value: boolean | string) => {
    setPrivacySettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Privacy Settings Updated",
      description: "Your privacy preferences have been saved.",
    });
  }, [toast]);

  const handleAccountChange = useCallback((key: string, value: string) => {
    setAccountSettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Account Settings Updated",
      description: "Your account preferences have been saved.",
    });
  }, [toast]);

  const handleDeleteAccount = useCallback(async () => {
    // Implement account deletion logic
    toast({
      title: "Account Deletion",
      description: "This feature is not yet implemented.",
      variant: "destructive"
    });
  }, [toast]);

  const handleDataExport = useCallback(async () => {
    // Implement data export logic
    toast({
      title: "Data Export",
      description: "Your data export has been started. You'll receive an email when it's ready.",
    });
  }, [toast]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "Unable to log out. Please try again.",
        variant: "destructive"
      });
    }
  }, [logout, toast]);

  return (
    <ResponsiveLayout>
      <div className="space-y-8">
        {/* Enhanced Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account, privacy, and preferences
            </p>
          </div>
          {isProMember && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
              <Crown className="w-4 h-4 mr-2" />
              Pro Member
            </Badge>
          )}
        </div>

        {/* Enhanced Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {settingsCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -2 }}
              className="group"
            >
              <Card 
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  activeCategory === category.id 
                    ? 'ring-2 ring-primary shadow-lg' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-xl ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{category.title}</h3>
                  <p className="text-xs text-muted-foreground">{category.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Settings Content */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {(() => {
                const category = settingsCategories.find(cat => cat.id === activeCategory);
                return category ? (
                  <>
                    <div className={`w-8 h-8 rounded-lg ${category.color} flex items-center justify-center`}>
                      <category.icon className="w-4 h-4 text-white" />
                    </div>
                    {category.title}
                  </>
                ) : null;
              })()}
            </CardTitle>
            <CardDescription>
              {settingsCategories.find(cat => cat.id === activeCategory)?.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Profile Settings */}
            {activeCategory === 'profile' && (
              <div className="space-y-6">
                <ProfileSettings />
              </div>
            )}

            {/* Privacy & Security Settings */}
            {activeCategory === 'privacy' && (
              <div className="space-y-6">
                <div className="grid gap-6">
                  {/* Profile Visibility */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Profile Visibility
                    </h3>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="show-email">Show Email</Label>
                          <p className="text-sm text-muted-foreground">Display your email on your public profile</p>
                        </div>
                        <Switch
                          id="show-email"
                          checked={privacySettings.showEmail}
                          onCheckedChange={(checked) => handlePrivacyChange('showEmail', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="show-phone">Show Phone</Label>
                          <p className="text-sm text-muted-foreground">Display your phone number on your profile</p>
                        </div>
                        <Switch
                          id="show-phone"
                          checked={privacySettings.showPhone}
                          onCheckedChange={(checked) => handlePrivacyChange('showPhone', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="show-location">Show Location</Label>
                          <p className="text-sm text-muted-foreground">Display your city and state on your profile</p>
                        </div>
                        <Switch
                          id="show-location"
                          checked={privacySettings.showLocation}
                          onCheckedChange={(checked) => handlePrivacyChange('showLocation', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Communication Preferences */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Communication
                    </h3>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="allow-messages">Allow Messages</Label>
                          <p className="text-sm text-muted-foreground">Let other users send you direct messages</p>
                        </div>
                        <Switch
                          id="allow-messages"
                          checked={privacySettings.allowMessages}
                          onCheckedChange={(checked) => handlePrivacyChange('allowMessages', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="allow-follows">Allow Follows</Label>
                          <p className="text-sm text-muted-foreground">Allow other users to follow you</p>
                        </div>
                        <Switch
                          id="allow-follows"
                          checked={privacySettings.allowFollows}
                          onCheckedChange={(checked) => handlePrivacyChange('allowFollows', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Data & Analytics */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Data & Analytics
                    </h3>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="analytics-opt-out">Opt out of Analytics</Label>
                          <p className="text-sm text-muted-foreground">Prevent collection of usage analytics</p>
                        </div>
                        <Switch
                          id="analytics-opt-out"
                          checked={privacySettings.analyticsOptOut}
                          onCheckedChange={(checked) => handlePrivacyChange('analyticsOptOut', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeCategory === 'notifications' && (
              <div className="space-y-6">
                <div className="grid gap-6">
                  {/* Delivery Methods */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Delivery Methods
                    </h3>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <Label htmlFor="email-notifications">Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                          </div>
                        </div>
                        <Switch
                          id="email-notifications"
                          checked={notificationSettings.email}
                          onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Smartphone className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <Label htmlFor="push-notifications">Push Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
                          </div>
                        </div>
                        <Switch
                          id="push-notifications"
                          checked={notificationSettings.push}
                          onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <Label htmlFor="sms-notifications">SMS Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive important alerts via SMS</p>
                          </div>
                        </div>
                        <Switch
                          id="sms-notifications"
                          checked={notificationSettings.sms}
                          onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Content Types */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Content Notifications</h3>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="events-notifications">Events</Label>
                          <p className="text-sm text-muted-foreground">New events and event updates</p>
                        </div>
                        <Switch
                          id="events-notifications"
                          checked={notificationSettings.events}
                          onCheckedChange={(checked) => handleNotificationChange('events', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="posts-notifications">Posts</Label>
                          <p className="text-sm text-muted-foreground">New posts from people you follow</p>
                        </div>
                        <Switch
                          id="posts-notifications"
                          checked={notificationSettings.posts}
                          onCheckedChange={(checked) => handleNotificationChange('posts', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="communities-notifications">Communities</Label>
                          <p className="text-sm text-muted-foreground">Activity in your communities</p>
                        </div>
                        <Switch
                          id="communities-notifications"
                          checked={notificationSettings.communities}
                          onCheckedChange={(checked) => handleNotificationChange('communities', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="messages-notifications">Messages</Label>
                          <p className="text-sm text-muted-foreground">Direct messages and mentions</p>
                        </div>
                        <Switch
                          id="messages-notifications"
                          checked={notificationSettings.messages}
                          onCheckedChange={(checked) => handleNotificationChange('messages', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subscription Settings */}
            {activeCategory === 'subscription' && (
              <div className="space-y-6">
                {isProMember ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Pro Member</h3>
                    <p className="text-muted-foreground mb-6">
                      You have access to all premium features and benefits.
                    </p>
                    <div className="grid gap-4 max-w-md mx-auto">
                      <Button variant="outline">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Manage Billing
                      </Button>
                      <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download Invoice
                      </Button>
                      <Button variant="outline" className="text-red-600 hover:text-red-700">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Cancel Subscription
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Crown className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Free Account</h3>
                    <p className="text-muted-foreground mb-6">
                      Upgrade to Pro to unlock premium features and benefits.
                    </p>
                    <Button className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600">
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Pro
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Account Management */}
            {activeCategory === 'account' && (
              <div className="space-y-6">
                <div className="grid gap-6">
                  {/* Data Management */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Download className="w-5 h-5" />
                      Data Management
                    </h3>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Export Your Data</h4>
                          <p className="text-sm text-muted-foreground">Download a copy of all your data</p>
                        </div>
                        <Button variant="outline" onClick={handleDataExport}>
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Account Actions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Account Actions
                    </h3>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Sign Out</h4>
                          <p className="text-sm text-muted-foreground">Sign out of your account on this device</p>
                        </div>
                        <Button variant="outline" onClick={handleLogout}>
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/10">
                        <div>
                          <h4 className="font-medium text-red-700 dark:text-red-400">Delete Account</h4>
                          <p className="text-sm text-red-600 dark:text-red-500">Permanently delete your account and all data</p>
                        </div>
                        <Button variant="destructive" onClick={handleDeleteAccount}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Help & Support */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <HelpCircle className="w-5 h-5" />
                      Help & Support
                    </h3>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Contact Support</h4>
                          <p className="text-sm text-muted-foreground">Get help with your account or technical issues</p>
                        </div>
                        <Button variant="outline">
                          <Mail className="w-4 h-4 mr-2" />
                          Contact
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Help Center</h4>
                          <p className="text-sm text-muted-foreground">Browse our knowledge base and FAQs</p>
                        </div>
                        <Button variant="outline">
                          <Globe className="w-4 h-4 mr-2" />
                          Visit
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ResponsiveLayout>
  );
};

export default ConsolidatedSettings;
