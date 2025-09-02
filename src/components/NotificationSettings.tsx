import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useToast } from "@/hooks/use-toast";
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Clock, 
  Save, 
  RefreshCw,
  MessageSquare,
  Users,
  Calendar,
  MessageCircle,
  CreditCard,
  Settings,
  Megaphone,
  X
} from "lucide-react";

interface NotificationSettingsProps {
  onClose?: () => void;
  compact?: boolean;
}

export const NotificationSettings = ({ onClose, compact = false }: NotificationSettingsProps) => {
  const { toast } = useToast();
  const {
    settings,
    saving,
    updateNotificationSettings,
    handleSettingChange
  } = useUserSettings();

  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  // Update local settings when settings change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Check for changes
  useEffect(() => {
    const changed = JSON.stringify(localSettings) !== JSON.stringify(settings);
    setHasChanges(changed);
  }, [localSettings, settings]);

  const handleInputChange = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      const result = await updateNotificationSettings(localSettings);
      if (result.success) {
        toast({
          title: "Success",
          description: "Notification settings updated successfully",
        });
        if (onClose) onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    if (onClose) onClose();
  };

  const handleResetToDefaults = () => {
    const defaultSettings = {
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
    setLocalSettings(prev => ({ ...prev, ...defaultSettings }));
  };

  return (
    <Card className={compact ? "" : "w-full"}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose what notifications you want to receive and when.
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
        {/* General Notifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General Notifications
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates and announcements via email.
              </p>
            </div>
            <Switch
              checked={localSettings.email_notifications !== false}
              onCheckedChange={(checked) => handleInputChange('email_notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about new messages and activity.
              </p>
            </div>
            <Switch
              checked={localSettings.push_notifications !== false}
              onCheckedChange={(checked) => handleInputChange('push_notifications', checked)}
            />
          </div>
        </div>

        <Separator />

        {/* Specific Notifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Specific Notifications
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Booking Updates
                </Label>
              </div>
              <Switch
                checked={localSettings.booking_notifications !== false}
                onCheckedChange={(checked) => handleInputChange('booking_notifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm flex items-center gap-2">
                  <MessageSquare className="h-3 w-3" />
                  New Messages
                </Label>
              </div>
              <Switch
                checked={localSettings.message_notifications !== false}
                onCheckedChange={(checked) => handleInputChange('message_notifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  New Followers
                </Label>
              </div>
              <Switch
                checked={localSettings.follower_notifications !== false}
                onCheckedChange={(checked) => handleInputChange('follower_notifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Event Updates
                </Label>
              </div>
              <Switch
                checked={localSettings.event_notifications !== false}
                onCheckedChange={(checked) => handleInputChange('event_notifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm flex items-center gap-2">
                  <MessageCircle className="h-3 w-3" />
                  Discussion Activity
                </Label>
              </div>
              <Switch
                checked={localSettings.discussion_notifications !== false}
                onCheckedChange={(checked) => handleInputChange('discussion_notifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm flex items-center gap-2">
                  <CreditCard className="h-3 w-3" />
                  Payment Updates
                </Label>
              </div>
              <Switch
                checked={localSettings.payment_notifications !== false}
                onCheckedChange={(checked) => handleInputChange('payment_notifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm flex items-center gap-2">
                  <Settings className="h-3 w-3" />
                  System Messages
                </Label>
              </div>
              <Switch
                checked={localSettings.system_notifications !== false}
                onCheckedChange={(checked) => handleInputChange('system_notifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm flex items-center gap-2">
                  <Megaphone className="h-3 w-3" />
                  Marketing
                </Label>
              </div>
              <Switch
                checked={localSettings.marketing_notifications || false}
                onCheckedChange={(checked) => handleInputChange('marketing_notifications', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Quiet Hours */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Quiet Hours
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Quiet Hours</Label>
              <p className="text-sm text-muted-foreground">
                Pause notifications during specific hours.
              </p>
            </div>
            <Switch
              checked={localSettings.quiet_hours_enabled || false}
              onCheckedChange={(checked) => handleInputChange('quiet_hours_enabled', checked)}
            />
          </div>

          {localSettings.quiet_hours_enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={localSettings.quiet_hours_start || "22:00"}
                  onChange={(e) => handleInputChange('quiet_hours_start', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={localSettings.quiet_hours_end || "08:00"}
                  onChange={(e) => handleInputChange('quiet_hours_end', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleResetToDefaults}
              disabled={saving}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reset to Defaults
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
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
        </div>
      </CardContent>
    </Card>
  );
};
