import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Mail, Smartphone, Save, RotateCcw } from 'lucide-react';

interface NotificationSettings {
  id: string;
  user_id: string;
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
  created_at: string;
  updated_at: string;
}

const NotificationSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }

      if (data) {
        setSettings(data);
      } else {
        // Create default settings
        const defaultSettings = {
          user_id: user.id,
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

        const { data: newSettings, error: createError } = await supabase
          .from('user_notification_settings')
          .insert(defaultSettings)
          .select()
          .single();

        if (createError) throw createError;
        setSettings(newSettings);
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      toast({
        title: "Error",
        description: "Failed to load notification settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: any) => {
    if (!settings) return;
    setSettings(prev => prev ? { ...prev, [key]: value } : null);
  };

  const saveSettings = async () => {
    if (!user || !settings) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_notification_settings')
        .upsert({
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: "Your notification preferences have been updated",
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast({
        title: "Error",
        description: "Failed to save notification settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const defaultSettings = {
        user_id: user.id,
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
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_notification_settings')
        .upsert(defaultSettings);

      if (error) throw error;

      setSettings(prev => prev ? { ...prev, ...defaultSettings } : null);
      toast({
        title: "Settings Reset",
        description: "Notification settings have been reset to defaults",
      });
    } catch (error) {
      console.error('Error resetting notification settings:', error);
      toast({
        title: "Error",
        description: "Failed to reset notification settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!settings) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                Failed to load notification settings
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notification Settings</h1>
            <p className="text-muted-foreground">
              Manage how and when you receive notifications
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={resetToDefaults}
              disabled={saving}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Defaults
            </Button>
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>

        {/* Notification Channels */}
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
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                checked={settings.email_notifications}
                onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Push Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications in your browser
                </p>
              </div>
              <Switch
                checked={settings.push_notifications}
                onCheckedChange={(checked) => updateSetting('push_notifications', checked)}
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
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Booking Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    New booking requests, acceptances, and declines
                  </p>
                </div>
                <Switch
                  checked={settings.booking_notifications}
                  onCheckedChange={(checked) => updateSetting('booking_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Message Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    New messages and chat requests
                  </p>
                </div>
                <Switch
                  checked={settings.message_notifications}
                  onCheckedChange={(checked) => updateSetting('message_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Follower Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    New followers and follow activity
                  </p>
                </div>
                <Switch
                  checked={settings.follower_notifications}
                  onCheckedChange={(checked) => updateSetting('follower_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Event Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Event updates, reminders, and new events
                  </p>
                </div>
                <Switch
                  checked={settings.event_notifications}
                  onCheckedChange={(checked) => updateSetting('event_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Discussion Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Discussion requests and community activity
                  </p>
                </div>
                <Switch
                  checked={settings.discussion_notifications}
                  onCheckedChange={(checked) => updateSetting('discussion_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Payment Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Payment confirmations and transaction updates
                  </p>
                </div>
                <Switch
                  checked={settings.payment_notifications}
                  onCheckedChange={(checked) => updateSetting('payment_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>System Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Important system updates and announcements
                  </p>
                </div>
                <Switch
                  checked={settings.system_notifications}
                  onCheckedChange={(checked) => updateSetting('system_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Marketing Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Promotional content and special offers
                  </p>
                </div>
                <Switch
                  checked={settings.marketing_notifications}
                  onCheckedChange={(checked) => updateSetting('marketing_notifications', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Quiet Hours</CardTitle>
            <CardDescription>
              Set times when you don't want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Quiet Hours</Label>
                <p className="text-sm text-muted-foreground">
                  Pause notifications during specific hours
                </p>
              </div>
              <Switch
                checked={settings.quiet_hours_enabled}
                onCheckedChange={(checked) => updateSetting('quiet_hours_enabled', checked)}
              />
            </div>

            {settings.quiet_hours_enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <input
                    type="time"
                    value={settings.quiet_hours_start}
                    onChange={(e) => updateSetting('quiet_hours_start', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <input
                    type="time"
                    value={settings.quiet_hours_end}
                    onChange={(e) => updateSetting('quiet_hours_end', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Preview</CardTitle>
            <CardDescription>
              See how your notifications will appear
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 rounded-lg border bg-muted/30">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎯</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">New Booking Request</h4>
                      <Badge variant="outline" className="text-xs">booking_request</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      John Doe has requested to book you for a wedding event.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Just now
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg border bg-primary/5 border-l-4 border-l-primary">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">👥</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">New Follower</h4>
                      <Badge variant="outline" className="text-xs">new_follower</Badge>
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Jane Smith started following you.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      2 minutes ago
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default NotificationSettings;
