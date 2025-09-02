import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  AlertTriangle,
  Shield,
  Users,
  Globe,
  Database,
  Mail,
  Bell,
  Lock,
  Palette,
  Zap,
  FileText
} from 'lucide-react';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminService } from '@/services/adminService';
import { SystemSetting } from '@/types/admin';

const SystemSettings: React.FC = () => {
  const { adminUser } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [settings, setSettings] = useState<Record<string, SystemSetting>>({});
  const adminService = new AdminService();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const settingsData = await adminService.getSystemSettings();
      const settingsMap: Record<string, SystemSetting> = {};
      
      settingsData.forEach(setting => {
        settingsMap[setting.setting_key] = setting;
      });
      
      setSettings(settingsMap);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        setting_value: value.toString()
      }
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      
      const updatedSettings = Object.values(settings).filter(setting => setting.is_public);
      await adminService.updateSystemSettings(updatedSettings);
      
      setSuccess('Settings saved successfully');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const getSettingValue = (key: string, defaultValue: string = '') => {
    return settings[key]?.setting_value || defaultValue;
  };

  const getSettingDescription = (key: string) => {
    return settings[key]?.description || '';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <AdminAuthGuard requiredPermission="settings:manage">
      <AdminLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600">Configure platform settings and system preferences</p>
          </div>

          {error && (
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Platform Information
                  </CardTitle>
                  <CardDescription>Basic platform configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="platform_name">Platform Name</Label>
                      <Input
                        id="platform_name"
                        value={getSettingValue('platform_name', 'Glocal')}
                        onChange={(e) => handleSettingChange('platform_name', e.target.value)}
                        placeholder="Enter platform name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="platform_description">Platform Description</Label>
                      <Input
                        id="platform_description"
                        value={getSettingValue('platform_description')}
                        onChange={(e) => handleSettingChange('platform_description', e.target.value)}
                        placeholder="Enter platform description"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact_email">Contact Email</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={getSettingValue('contact_email')}
                        onChange={(e) => handleSettingChange('contact_email', e.target.value)}
                        placeholder="admin@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="timezone">Default Timezone</Label>
                      <Select
                        value={getSettingValue('timezone', 'UTC')}
                        onValueChange={(value) => handleSettingChange('timezone', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Appearance
                  </CardTitle>
                  <CardDescription>Platform appearance settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="logo_url">Logo URL</Label>
                      <Input
                        id="logo_url"
                        value={getSettingValue('logo_url')}
                        onChange={(e) => handleSettingChange('logo_url', e.target.value)}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                    <div>
                      <Label htmlFor="favicon_url">Favicon URL</Label>
                      <Input
                        id="favicon_url"
                        value={getSettingValue('favicon_url')}
                        onChange={(e) => handleSettingChange('favicon_url', e.target.value)}
                        placeholder="https://example.com/favicon.ico"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>Platform security configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
                        <p className="text-sm text-gray-500">Enable maintenance mode to restrict access</p>
                      </div>
                      <Switch
                        id="maintenance_mode"
                        checked={getSettingValue('maintenance_mode') === 'true'}
                        onCheckedChange={(checked) => handleSettingChange('maintenance_mode', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="registration_enabled">User Registration</Label>
                        <p className="text-sm text-gray-500">Allow new users to register</p>
                      </div>
                      <Switch
                        id="registration_enabled"
                        checked={getSettingValue('registration_enabled', 'true') === 'true'}
                        onCheckedChange={(checked) => handleSettingChange('registration_enabled', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email_verification_required">Email Verification Required</Label>
                        <p className="text-sm text-gray-500">Require email verification for new accounts</p>
                      </div>
                      <Switch
                        id="email_verification_required"
                        checked={getSettingValue('email_verification_required', 'true') === 'true'}
                        onCheckedChange={(checked) => handleSettingChange('email_verification_required', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Authentication
                  </CardTitle>
                  <CardDescription>Authentication and session settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
                      <Input
                        id="session_timeout"
                        type="number"
                        value={getSettingValue('session_timeout', '60')}
                        onChange={(e) => handleSettingChange('session_timeout', e.target.value)}
                        min="15"
                        max="1440"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max_login_attempts">Max Login Attempts</Label>
                      <Input
                        id="max_login_attempts"
                        type="number"
                        value={getSettingValue('max_login_attempts', '5')}
                        onChange={(e) => handleSettingChange('max_login_attempts', e.target.value)}
                        min="3"
                        max="10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Management
                  </CardTitle>
                  <CardDescription>User account and profile settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="allow_profile_editing">Allow Profile Editing</Label>
                        <p className="text-sm text-gray-500">Users can edit their profiles</p>
                      </div>
                      <Switch
                        id="allow_profile_editing"
                        checked={getSettingValue('allow_profile_editing', 'true') === 'true'}
                        onCheckedChange={(checked) => handleSettingChange('allow_profile_editing', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="require_location">Require Location</Label>
                        <p className="text-sm text-gray-500">Users must provide location information</p>
                      </div>
                      <Switch
                        id="require_location"
                        checked={getSettingValue('require_location', 'false') === 'true'}
                        onCheckedChange={(checked) => handleSettingChange('require_location', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto_approve_users">Auto-approve New Users</Label>
                        <p className="text-sm text-gray-500">Automatically approve new user registrations</p>
                      </div>
                      <Switch
                        id="auto_approve_users"
                        checked={getSettingValue('auto_approve_users', 'true') === 'true'}
                        onCheckedChange={(checked) => handleSettingChange('auto_approve_users', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    User Limits
                  </CardTitle>
                  <CardDescription>User activity and content limits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="max_posts_per_day">Max Posts Per Day</Label>
                      <Input
                        id="max_posts_per_day"
                        type="number"
                        value={getSettingValue('max_posts_per_day', '10')}
                        onChange={(e) => handleSettingChange('max_posts_per_day', e.target.value)}
                        min="1"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max_events_per_month">Max Events Per Month</Label>
                      <Input
                        id="max_events_per_month"
                        type="number"
                        value={getSettingValue('max_events_per_month', '5')}
                        onChange={(e) => handleSettingChange('max_events_per_month', e.target.value)}
                        min="1"
                        max="50"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Content Moderation
                  </CardTitle>
                  <CardDescription>Content moderation and filtering settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto_moderate_content">Auto-moderate Content</Label>
                        <p className="text-sm text-gray-500">Automatically filter inappropriate content</p>
                      </div>
                      <Switch
                        id="auto_moderate_content"
                        checked={getSettingValue('auto_moderate_content', 'false') === 'true'}
                        onCheckedChange={(checked) => handleSettingChange('auto_moderate_content', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="require_content_approval">Require Content Approval</Label>
                        <p className="text-sm text-gray-500">All content must be approved before publishing</p>
                      </div>
                      <Switch
                        id="require_content_approval"
                        checked={getSettingValue('require_content_approval', 'false') === 'true'}
                        onCheckedChange={(checked) => handleSettingChange('require_content_approval', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="allow_anonymous_posts">Allow Anonymous Posts</Label>
                        <p className="text-sm text-gray-500">Users can post without revealing their identity</p>
                      </div>
                      <Switch
                        id="allow_anonymous_posts"
                        checked={getSettingValue('allow_anonymous_posts', 'false') === 'true'}
                        onCheckedChange={(checked) => handleSettingChange('allow_anonymous_posts', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Content Storage
                  </CardTitle>
                  <CardDescription>Content storage and retention settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="max_file_size_mb">Max File Size (MB)</Label>
                      <Input
                        id="max_file_size_mb"
                        type="number"
                        value={getSettingValue('max_file_size_mb', '10')}
                        onChange={(e) => handleSettingChange('max_file_size_mb', e.target.value)}
                        min="1"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="content_retention_days">Content Retention (days)</Label>
                      <Input
                        id="content_retention_days"
                        type="number"
                        value={getSettingValue('content_retention_days', '365')}
                        onChange={(e) => handleSettingChange('content_retention_days', e.target.value)}
                        min="30"
                        max="3650"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Settings
                  </CardTitle>
                  <CardDescription>Platform notification configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email_notifications_enabled">Email Notifications</Label>
                        <p className="text-sm text-gray-500">Enable email notifications for users</p>
                      </div>
                      <Switch
                        id="email_notifications_enabled"
                        checked={getSettingValue('email_notifications_enabled', 'true') === 'true'}
                        onCheckedChange={(checked) => handleSettingChange('email_notifications_enabled', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="push_notifications_enabled">Push Notifications</Label>
                        <p className="text-sm text-gray-500">Enable push notifications</p>
                      </div>
                      <Switch
                        id="push_notifications_enabled"
                        checked={getSettingValue('push_notifications_enabled', 'true') === 'true'}
                        onCheckedChange={(checked) => handleSettingChange('push_notifications_enabled', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="welcome_email_enabled">Welcome Email</Label>
                        <p className="text-sm text-gray-500">Send welcome email to new users</p>
                      </div>
                      <Switch
                        id="welcome_email_enabled"
                        checked={getSettingValue('welcome_email_enabled', 'true') === 'true'}
                        onCheckedChange={(checked) => handleSettingChange('welcome_email_enabled', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Configuration
                  </CardTitle>
                  <CardDescription>Email service configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="smtp_host">SMTP Host</Label>
                      <Input
                        id="smtp_host"
                        value={getSettingValue('smtp_host')}
                        onChange={(e) => handleSettingChange('smtp_host', e.target.value)}
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtp_port">SMTP Port</Label>
                      <Input
                        id="smtp_port"
                        type="number"
                        value={getSettingValue('smtp_port', '587')}
                        onChange={(e) => handleSettingChange('smtp_port', e.target.value)}
                        placeholder="587"
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtp_username">SMTP Username</Label>
                      <Input
                        id="smtp_username"
                        value={getSettingValue('smtp_username')}
                        onChange={(e) => handleSettingChange('smtp_username', e.target.value)}
                        placeholder="your-email@gmail.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtp_password">SMTP Password</Label>
                      <Input
                        id="smtp_password"
                        type="password"
                        value={getSettingValue('smtp_password')}
                        onChange={(e) => handleSettingChange('smtp_password', e.target.value)}
                        placeholder="Enter SMTP password"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Advanced Settings
                  </CardTitle>
                  <CardDescription>Advanced platform configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cache_ttl">Cache TTL (seconds)</Label>
                      <Input
                        id="cache_ttl"
                        type="number"
                        value={getSettingValue('cache_ttl', '3600')}
                        onChange={(e) => handleSettingChange('cache_ttl', e.target.value)}
                        min="60"
                        max="86400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rate_limit_requests">Rate Limit (requests/min)</Label>
                      <Input
                        id="rate_limit_requests"
                        type="number"
                        value={getSettingValue('rate_limit_requests', '100')}
                        onChange={(e) => handleSettingChange('rate_limit_requests', e.target.value)}
                        min="10"
                        max="1000"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="custom_css">Custom CSS</Label>
                    <Textarea
                      id="custom_css"
                      value={getSettingValue('custom_css')}
                      onChange={(e) => handleSettingChange('custom_css', e.target.value)}
                      placeholder="/* Custom CSS styles */"
                      rows={6}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="custom_js">Custom JavaScript</Label>
                    <Textarea
                      id="custom_js"
                      value={getSettingValue('custom_js')}
                      onChange={(e) => handleSettingChange('custom_js', e.target.value)}
                      placeholder="// Custom JavaScript code"
                      rows={6}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-between">
            <Button variant="outline" onClick={loadSettings}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset to Defaults
            </Button>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={loadSettings}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload
              </Button>
              <Button onClick={handleSaveSettings} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
};

export default SystemSettings;
