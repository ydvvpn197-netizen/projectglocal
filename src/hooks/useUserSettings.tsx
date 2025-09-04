import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { 
  userSettingsService, 
  UserSettings, 
  PasswordChangeData, 
  EmailChangeData,
  SettingsUpdateResult 
} from '@/services/userSettingsService';

export const useUserSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<UserSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load user settings
  const loadSettings = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userSettings = await userSettingsService.getUserSettings(user.id);
      setSettings(userSettings);
    } catch (error) {
      console.error('Error loading user settings:', error);
      toast({
        title: "Error",
        description: "Failed to load user settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  // Update profile settings
  const updateProfileSettings = useCallback(async (updates: Partial<UserSettings>): Promise<SettingsUpdateResult> => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      setSaving(true);
      const result = await userSettingsService.updateProfileSettings(user.id, updates);
      
      if (result.success) {
        // Update local state
        setSettings(prev => ({ ...prev, ...updates }));
        setHasChanges(false);
        
        toast({
          title: "Success",
          description: "Profile settings updated successfully"
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update profile settings",
          variant: "destructive"
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error updating profile settings:', error);
      toast({
        title: "Error",
        description: "Failed to update profile settings",
        variant: "destructive"
      });
      return { success: false, error: "Unknown error" };
    } finally {
      setSaving(false);
    }
  }, [user?.id, toast]);

  // Update notification settings
  const updateNotificationSettings = useCallback(async (updates: Partial<UserSettings>): Promise<SettingsUpdateResult> => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      setSaving(true);
      const result = await userSettingsService.updateNotificationSettings(user.id, updates);
      
      if (result.success) {
        // Update local state
        setSettings(prev => ({ ...prev, ...updates }));
        setHasChanges(false);
        
        toast({
          title: "Success",
          description: "Notification settings updated successfully"
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update notification settings",
          variant: "destructive"
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive"
      });
      return { success: false, error: "Unknown error" };
    } finally {
      setSaving(false);
    }
  }, [user?.id, toast]);

  // Change password
  const changePassword = useCallback(async (passwordData: PasswordChangeData): Promise<SettingsUpdateResult> => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      setSaving(true);
      const result = await userSettingsService.changePassword(user.id, passwordData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Password changed successfully"
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to change password",
          variant: "destructive"
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "Error",
        description: "Failed to change password",
        variant: "destructive"
      });
      return { success: false, error: "Unknown error" };
    } finally {
      setSaving(false);
    }
  }, [user?.id, toast]);

  // Change email
  const changeEmail = useCallback(async (emailData: EmailChangeData): Promise<SettingsUpdateResult> => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      setSaving(true);
      const result = await userSettingsService.changeEmail(user.id, emailData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.data?.message || "Email change request sent successfully"
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to change email",
          variant: "destructive"
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error changing email:', error);
      toast({
        title: "Error",
        description: "Failed to change email",
        variant: "destructive"
      });
      return { success: false, error: "Unknown error" };
    } finally {
      setSaving(false);
    }
  }, [user?.id, toast]);

  // Reset settings to defaults
  const resetSettingsToDefaults = useCallback(async (): Promise<SettingsUpdateResult> => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      setSaving(true);
      const result = await userSettingsService.resetSettingsToDefaults(user.id);
      
      if (result.success) {
        // Reload settings to get the defaults
        await loadSettings();
        setHasChanges(false);
        
        toast({
          title: "Success",
          description: "Settings reset to defaults successfully"
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to reset settings",
          variant: "destructive"
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error resetting settings:', error);
      toast({
        title: "Error",
        description: "Failed to reset settings",
        variant: "destructive"
      });
      return { success: false, error: "Unknown error" };
    } finally {
      setSaving(false);
    }
  }, [user?.id, toast, loadSettings]);

  // Handle setting changes
  const handleSettingChange = useCallback((key: keyof UserSettings, value: unknown) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  // Save all changes
  const saveAllChanges = useCallback(async (): Promise<boolean> => {
    if (!user?.id || !hasChanges) {
      return true;
    }

    try {
      setSaving(true);
      
      // Separate profile and notification updates
      const profileUpdates: Partial<UserSettings> = {};
      const notificationUpdates: Partial<UserSettings> = {};
      
      // Categorize updates
      Object.entries(settings).forEach(([key, value]) => {
        if (key.startsWith('email_') || key.startsWith('push_') || key.startsWith('booking_') || 
            key.startsWith('message_') || key.startsWith('follower_') || key.startsWith('event_') ||
            key.startsWith('discussion_') || key.startsWith('payment_') || key.startsWith('system_') ||
            key.startsWith('marketing_') || key.startsWith('quiet_hours_')) {
          (notificationUpdates as Record<string, unknown>)[key] = value;
        } else {
          (profileUpdates as Record<string, unknown>)[key] = value;
        }
      });

      // Update both profile and notification settings
      const [profileResult, notificationResult] = await Promise.all([
        Object.keys(profileUpdates).length > 0 ? userSettingsService.updateProfileSettings(user.id, profileUpdates) : { success: true },
        Object.keys(notificationUpdates).length > 0 ? userSettingsService.updateNotificationSettings(user.id, notificationUpdates) : { success: true }
      ]);

      if (profileResult.success && notificationResult.success) {
        setHasChanges(false);
        toast({
          title: "Success",
          description: "All settings saved successfully"
        });
        return true;
      } else {
        const error = profileResult.error || notificationResult.error || "Failed to save some settings";
        toast({
          title: "Error",
          description: error,
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error saving all changes:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [user?.id, settings, hasChanges, toast]);

  // Initial load
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    saving,
    hasChanges,
    loadSettings,
    updateProfileSettings,
    updateNotificationSettings,
    changePassword,
    changeEmail,
    resetSettingsToDefaults,
    handleSettingChange,
    saveAllChanges,
    setSettings
  };
};
