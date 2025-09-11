import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useAccountDeletion } from "@/hooks/useAccountDeletion";
import { useUserSettings } from "@/hooks/useUserSettings";
import { LocationSettings } from "@/components/LocationSettings";
import { ProfileSettings } from "@/components/ProfileSettings";
import { NotificationSettings } from "@/components/NotificationSettings";
import { PrivacySettingsPanel } from "@/components/PrivacySettingsPanel";
import { AnonymousMode } from "@/components/AnonymousMode";
import { SecuritySettings } from "@/components/SecuritySettings";
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  LogOut,
  Trash2,
  Mail,
  AlertTriangle,
  Save,
  RefreshCw
} from "lucide-react";
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
} from "@/components/ui/alert-dialog";

const Settings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { deleteAccount, testEdgeFunction, isDeleting } = useAccountDeletion();
  const {
    settings,
    loading,
    saving,
    hasChanges,
    handleSettingChange,
    saveAllChanges,
    changePassword,
    changeEmail,
    resetSettingsToDefaults
  } = useUserSettings();

  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [emailData, setEmailData] = useState({
    newEmail: "",
    currentPassword: "",
  });

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



  const handleEmailChange = async () => {
    if (!emailData.newEmail || !emailData.currentPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    const result = await changeEmail(emailData);
    if (result.success) {
      setEmailData({
        newEmail: "",
        currentPassword: "",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      toast({
        title: "Invalid Confirmation",
        description: "Please type 'DELETE' to confirm account deletion.",
        variant: "destructive",
      });
      return;
    }

    const result = await deleteAccount();
    if (result.success) {
      setDeleteConfirmation("");
    }
  };

  const handleSaveAll = async () => {
    const success = await saveAllChanges();
    if (success) {
      toast({
        title: "Success",
        description: "All settings have been saved successfully.",
      });
    }
  };

  const handleResetToDefaults = async () => {
    const result = await resetSettingsToDefaults();
    if (result.success) {
      toast({
        title: "Success",
        description: "Settings have been reset to defaults.",
      });
    }
  };

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
          
          {/* Save/Reset Actions */}
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleSaveAll} 
              disabled={!hasChanges || saving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save All Changes"}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleResetToDefaults}
              disabled={saving}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reset to Defaults
            </Button>
            
            {hasChanges && (
              <span className="text-sm text-amber-600 font-medium">
                You have unsaved changes
              </span>
            )}
          </div>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="anonymous">Anonymous</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            {/* Profile Information */}
            <ProfileSettings showAvatar={true} compact={false} />

            {/* Email Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Settings
                </CardTitle>
                <CardDescription>
                  Change your email address or manage email preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentEmail">Current Email</Label>
                  <Input
                    id="currentEmail"
                    type="email"
                    value={user?.email || ""}
                    disabled
                  />
                  <p className="text-sm text-muted-foreground">
                    Your current email address.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newEmail">New Email Address</Label>
                  <Input
                    id="newEmail"
                    type="email"
                    value={emailData.newEmail}
                    onChange={(e) => setEmailData(prev => ({ ...prev, newEmail: e.target.value }))}
                    placeholder="Enter new email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailPassword">Current Password</Label>
                  <Input
                    id="emailPassword"
                    type="password"
                    value={emailData.currentPassword}
                    onChange={(e) => setEmailData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter your current password"
                  />
                </div>

                <Button 
                  onClick={handleEmailChange} 
                  disabled={!emailData.newEmail || !emailData.currentPassword || saving}
                  className="w-full"
                >
                  Change Email Address
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location" className="space-y-6">
            <LocationSettings />
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <PrivacySettingsPanel />
          </TabsContent>

          <TabsContent value="anonymous" className="space-y-6">
            <AnonymousMode />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SecuritySettings />

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
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={testEdgeFunction}
                      className="text-xs"
                    >
                      Test Function
                    </Button>
                    
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
                            This action cannot be undone. This will permanently delete your account and remove all your data from our servers including:
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <ul className="list-disc list-inside space-y-1">
                            <li>Your profile and personal information</li>
                            <li>All your posts and comments</li>
                            <li>Chat conversations and messages</li>
                            <li>Event bookings and artist profiles</li>
                            <li>Follow relationships and notifications</li>
                            <li>All other account data</li>
                          </ul>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="deleteConfirmation" className="text-sm font-medium">
                            Type "DELETE" to confirm
                          </Label>
                          <Input
                            id="deleteConfirmation"
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            placeholder="DELETE"
                            className="border-destructive/50 focus:border-destructive"
                          />
                        </div>

                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setDeleteConfirmation("")}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAccount}
                            disabled={deleteConfirmation !== "DELETE" || isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isDeleting ? "Deleting..." : "Delete Account"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveLayout>
  );
};

export default Settings;
