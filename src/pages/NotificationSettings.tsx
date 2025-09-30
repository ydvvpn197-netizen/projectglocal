/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Please use ConsolidatedSettings.tsx instead.
 * Category: settings
 * 
 * This page has been consolidated to provide a better, more consistent user experience.
 * All functionality from this page is available in the consolidated version.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, Smartphone, Clock, Save, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  booking_notifications: boolean;
  message_notifications: boolean;
  follower_notifications: boolean;
  event_notifications: boolean;
  discussion_notifications: boolean;
  payment_notifications: boolean;
  system_notifications: boolean;
  marketing_notifications: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

const defaultSettings: NotificationSettings = {
  email_notifications: true,
  push_notifications: true,
  booking_notifications: true,
  message_notifications: true,
  follower_notifications: true,
  event_notifications: true,
  discussion_notifications: true,
  payment_notifications: true,
  system_notifications: true,
  marketing_notifications: false,
  quiet_hours_enabled: false,
  quiet_hours_start: '22:00',
  quiet_hours_end: '08:00',
};

export default function NotificationSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load user's notification settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('user_notification_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error loading notification settings:', error);
          toast.error('Failed to load notification settings');
        }

        if (data) {
          setSettings({
            ...defaultSettings,
            ...data,
          });
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
        toast.error('Failed to load notification settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user?.id]);

  // Save settings to database
  const saveSettings = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_notification_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        throw error;
      }

      setHasChanges(false);
      toast.success('Notification settings saved successfully');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  // Handle setting changes
  const handleSettingChange = (key: keyof NotificationSettings, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  // Reset to defaults
  const resetToDefaults = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Sign in to manage notifications</h2>
            <p className="text-muted-foreground mb-4">
              You need to be signed in to customize your notification preferences.
            </p>
            <Button onClick={() => window.location.href = '/signin'}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading notification settings...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Notification Settings</h1>
        <p className="text-muted-foreground">
          Customize how and when you receive notifications from Glocal.
        </p>
      </div>

      <div className="space-y-6">
        {/* Channel Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Channels
            </CardTitle>
            <CardDescription>
              Choose how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="email-notifications" className="font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.email_notifications}
                onCheckedChange={(checked) => handleSettingChange('email_notifications', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="push-notifications" className="font-medium">
                    Push Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications in your browser
                  </p>
                </div>
              </div>
              <Switch
                id="push-notifications"
                checked={settings.push_notifications}
                onCheckedChange={(checked) => handleSettingChange('push_notifications', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Types */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Types</CardTitle>
            <CardDescription>
              Choose which types of notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="booking-notifications" className="font-medium">
                    Booking Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    New booking requests and updates
                  </p>
                </div>
                <Switch
                  id="booking-notifications"
                  checked={settings.booking_notifications}
                  onCheckedChange={(checked) => handleSettingChange('booking_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="message-notifications" className="font-medium">
                    Message Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    New messages and chat requests
                  </p>
                </div>
                <Switch
                  id="message-notifications"
                  checked={settings.message_notifications}
                  onCheckedChange={(checked) => handleSettingChange('message_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="follower-notifications" className="font-medium">
                    Follower Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    New followers and profile activity
                  </p>
                </div>
                <Switch
                  id="follower-notifications"
                  checked={settings.follower_notifications}
                  onCheckedChange={(checked) => handleSettingChange('follower_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="event-notifications" className="font-medium">
                    Event Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Event updates and reminders
                  </p>
                </div>
                <Switch
                  id="event-notifications"
                  checked={settings.event_notifications}
                  onCheckedChange={(checked) => handleSettingChange('event_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="discussion-notifications" className="font-medium">
                    Discussion Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Discussion requests and replies
                  </p>
                </div>
                <Switch
                  id="discussion-notifications"
                  checked={settings.discussion_notifications}
                  onCheckedChange={(checked) => handleSettingChange('discussion_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="payment-notifications" className="font-medium">
                    Payment Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Payment confirmations and issues
                  </p>
                </div>
                <Switch
                  id="payment-notifications"
                  checked={settings.payment_notifications}
                  onCheckedChange={(checked) => handleSettingChange('payment_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="system-notifications" className="font-medium">
                    System Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Important system updates
                  </p>
                </div>
                <Switch
                  id="system-notifications"
                  checked={settings.system_notifications}
                  onCheckedChange={(checked) => handleSettingChange('system_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="marketing-notifications" className="font-medium">
                    Marketing Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Promotional content and offers
                  </p>
                </div>
                <Switch
                  id="marketing-notifications"
                  checked={settings.marketing_notifications}
                  onCheckedChange={(checked) => handleSettingChange('marketing_notifications', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Quiet Hours
            </CardTitle>
            <CardDescription>
              Set times when you don't want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="quiet-hours-enabled" className="font-medium">
                  Enable Quiet Hours
                </Label>
                <p className="text-sm text-muted-foreground">
                  Pause notifications during specific hours
                </p>
              </div>
              <Switch
                id="quiet-hours-enabled"
                checked={settings.quiet_hours_enabled}
                onCheckedChange={(checked) => handleSettingChange('quiet_hours_enabled', checked)}
              />
            </div>

            {settings.quiet_hours_enabled && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label htmlFor="quiet-hours-start" className="text-sm font-medium">
                    Start Time
                  </Label>
                  <input
                    id="quiet-hours-start"
                    type="time"
                    value={settings.quiet_hours_start}
                    onChange={(e) => handleSettingChange('quiet_hours_start', e.target.value)}
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <Label htmlFor="quiet-hours-end" className="text-sm font-medium">
                    End Time
                  </Label>
                  <input
                    id="quiet-hours-end"
                    type="time"
                    value={settings.quiet_hours_end}
                    onChange={(e) => handleSettingChange('quiet_hours_end', e.target.value)}
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {hasChanges && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Unsaved Changes
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={resetToDefaults}
                  disabled={saving}
                >
                  Reset to Defaults
                </Button>
                <Button
                  onClick={saveSettings}
                  disabled={!hasChanges || saving}
                  className="flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
