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
  Lock, 
  Shield, 
  Eye, 
  EyeOff, 
  Save, 
  X,
  Key,
  Smartphone,
  Bell,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";

interface SecuritySettingsProps {
  onClose?: () => void;
  compact?: boolean;
}

export const SecuritySettings = ({ onClose, compact = false }: SecuritySettingsProps) => {
  const { toast } = useToast();
  const {
    settings,
    saving,
    changePassword,
    updateProfileSettings,
    handleSettingChange
  } = useUserSettings();

  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: "",
    color: "text-gray-400"
  });

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

  const checkPasswordStrength = (password: string) => {
    let score = 0;
    let feedback = "";
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) {
      feedback = "Weak";
      setPasswordStrength({ score, feedback, color: "text-red-500" });
    } else if (score <= 4) {
      feedback = "Fair";
      setPasswordStrength({ score, feedback, color: "text-yellow-500" });
    } else if (score <= 5) {
      feedback = "Good";
      setPasswordStrength({ score, feedback, color: "text-blue-500" });
    } else {
      feedback = "Strong";
      setPasswordStrength({ score, feedback, color: "text-green-500" });
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New password and confirmation password do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    const result = await changePassword(passwordData);
    if (result.success) {
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast({
        title: "Success",
        description: "Password changed successfully",
      });
    }
  };

  const handleSave = async () => {
    try {
      const result = await updateProfileSettings(localSettings);
      if (result.success) {
        toast({
          title: "Success",
          description: "Security settings updated successfully",
        });
        if (onClose) onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update security settings",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    if (onClose) onClose();
  };

  return (
    <div className="space-y-6">
      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your account password for enhanced security.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Enter current password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPasswords(!showPasswords)}
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) => {
                  setPasswordData(prev => ({ ...prev, newPassword: e.target.value }));
                  checkPasswordStrength(e.target.value);
                }}
                placeholder="Enter new password"
              />
            </div>
            {passwordData.newPassword && (
              <div className="flex items-center gap-2">
                <span className={`text-sm ${passwordStrength.color}`}>
                  {passwordStrength.feedback}
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-2 w-8 rounded ${
                        level <= passwordStrength.score
                          ? passwordStrength.color.replace('text-', 'bg-')
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Password must be at least 8 characters long.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
              />
            </div>
            {passwordData.confirmPassword && (
              <div className="flex items-center gap-2">
                {passwordData.newPassword === passwordData.confirmPassword ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ${
                  passwordData.newPassword === passwordData.confirmPassword 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {passwordData.newPassword === passwordData.confirmPassword 
                    ? 'Passwords match' 
                    : 'Passwords do not match'}
                </span>
              </div>
            )}
          </div>

          <Button 
            onClick={handlePasswordChange} 
            disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || saving}
            className="w-full"
          >
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Features
          </CardTitle>
          <CardDescription>
            Additional security features for your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account.
              </p>
            </div>
            <Switch
              checked={localSettings.two_factor_enabled || false}
              onCheckedChange={(checked) => handleInputChange('two_factor_enabled', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Login Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone logs into your account.
              </p>
            </div>
            <Switch
              checked={localSettings.login_notifications !== false}
              onCheckedChange={(checked) => handleInputChange('login_notifications', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Session Management</Label>
              <p className="text-sm text-muted-foreground">
                Allow you to manage active sessions across devices.
              </p>
            </div>
            <Switch
              checked={localSettings.session_management_enabled !== false}
              onCheckedChange={(checked) => handleInputChange('session_management_enabled', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Account Recovery</Label>
              <p className="text-sm text-muted-foreground">
                Enable account recovery options for lost access.
              </p>
            </div>
            <Switch
              checked={localSettings.account_recovery_enabled !== false}
              onCheckedChange={(checked) => handleInputChange('account_recovery_enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Security Alerts
          </CardTitle>
          <CardDescription>
            Configure security alerts and notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Suspicious Activity Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about unusual account activity.
              </p>
            </div>
            <Switch
              checked={localSettings.suspicious_activity_alerts !== false}
              onCheckedChange={(checked) => handleInputChange('suspicious_activity_alerts', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Password Change Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications when your password is changed.
              </p>
            </div>
            <Switch
              checked={localSettings.password_change_alerts !== false}
              onCheckedChange={(checked) => handleInputChange('password_change_alerts', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>New Device Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when your account is accessed from a new device.
              </p>
            </div>
            <Switch
              checked={localSettings.new_device_alerts !== false}
              onCheckedChange={(checked) => handleInputChange('new_device_alerts', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
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
  );
};
