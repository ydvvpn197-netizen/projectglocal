import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { AnonymousUsernameGenerator } from './AnonymousUsernameGenerator';
import { IdentityRevealToggle } from './IdentityRevealToggle';
import { PrivacyControlsService, PrivacyControlsConfig } from '@/services/privacyControlsService';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  User, 
  Settings, 
  Lock, 
  Globe, 
  Activity,
  Download,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Info,
  Users,
  MapPin,
  MessageSquare,
  ThumbsUp
} from 'lucide-react';

interface PrivacyFirstIdentitySystemProps {
  compact?: boolean;
  showStats?: boolean;
  onSettingsChange?: (settings: PrivacyControlsConfig) => void;
}

export const PrivacyFirstIdentitySystem: React.FC<PrivacyFirstIdentitySystemProps> = ({
  compact = false,
  showStats = true,
  onSettingsChange
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [privacyControls, setPrivacyControls] = useState<PrivacyControlsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<unknown>(null);

  // Load privacy controls on mount
  useEffect(() => {
    loadPrivacyControls();
  }, [loadPrivacyControls]);

  const loadPrivacyControls = useCallback(async () => {
    try {
      setLoading(true);
      const [controls, anonymousStats] = await Promise.all([
        PrivacyControlsService.getPrivacyControls(),
        showStats ? PrivacyControlsService.getAnonymousInteractionStats() : null
      ]);
      
      setPrivacyControls(controls);
      setStats(anonymousStats);
      
      if (onSettingsChange && controls) {
        onSettingsChange(controls);
      }
    } catch (error) {
      console.error('Error loading privacy controls:', error);
      toast({
        title: "Error",
        description: "Failed to load privacy settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [showStats, onSettingsChange, toast]);

  const updatePrivacySetting = async (key: keyof PrivacyControlsConfig, value: unknown) => {
    if (!privacyControls) return;

    try {
      setSaving(true);
      const result = await PrivacyControlsService.updatePrivacyControls({
        [key]: value
      });

      if (result.success) {
        setPrivacyControls(prev => prev ? { ...prev, [key]: value } : null);
        toast({
          title: "Success",
          description: "Privacy setting updated",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update setting",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating privacy setting:', error);
      toast({
        title: "Error",
        description: "Failed to update privacy setting",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleAnonymousMode = async (enabled: boolean) => {
    await updatePrivacySetting('is_anonymous', enabled);
  };

  const exportPrivacyData = async () => {
    try {
      const data = await PrivacyControlsService.exportPrivacyData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `privacy-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: "Your privacy data has been downloaded",
      });
    } catch (error) {
      console.error('Error exporting privacy data:', error);
      toast({
        title: "Error",
        description: "Failed to export privacy data",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Loading privacy settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!privacyControls) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Unable to load privacy settings. Please try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Anonymous Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {privacyControls.is_anonymous ? (
              <EyeOff className="h-4 w-4 text-gray-600" />
            ) : (
              <Eye className="h-4 w-4 text-green-600" />
            )}
            <Label className="text-sm font-medium">
              {privacyControls.is_anonymous ? 'Anonymous Mode' : 'Public Mode'}
            </Label>
          </div>
          <Switch
            checked={privacyControls.is_anonymous}
            onCheckedChange={toggleAnonymousMode}
            disabled={saving}
          />
        </div>

        {/* Privacy Level */}
        <div className="space-y-2">
          <Label className="text-sm">Privacy Level</Label>
          <Select
            value={privacyControls.privacy_level}
            onValueChange={(value) => updatePrivacySetting('privacy_level', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="friends">Friends Only</SelectItem>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="anonymous">Anonymous</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quick Stats */}
        {showStats && stats && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 p-2 rounded">
              <div className="font-medium">{stats.total_anonymous_posts}</div>
              <div className="text-gray-500">Anonymous Posts</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="font-medium">{stats.identity_reveals}</div>
              <div className="text-gray-500">Identity Reveals</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Privacy-First Identity System</span>
          </CardTitle>
          <CardDescription>
            Control your identity visibility and privacy settings with granular controls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {privacyControls.is_anonymous ? (
                  <EyeOff className="h-5 w-5 text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-green-600" />
                )}
                <span className="font-medium">
                  {privacyControls.is_anonymous ? 'Anonymous Mode Active' : 'Public Mode Active'}
                </span>
              </div>
              <Badge variant={privacyControls.is_anonymous ? "secondary" : "default"}>
                {privacyControls.is_anonymous ? 'Hidden' : 'Visible'}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exportPrivacyData}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="identity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="identity">Identity</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          {showStats && <TabsTrigger value="stats">Statistics</TabsTrigger>}
        </TabsList>

        {/* Identity Tab */}
        <TabsContent value="identity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Identity Controls</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Anonymous Mode Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Anonymous Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Hide your real identity and appear as anonymous
                  </p>
                </div>
                <Switch
                  checked={privacyControls.is_anonymous}
                  onCheckedChange={toggleAnonymousMode}
                  disabled={saving}
                />
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label>Display Name</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={privacyControls.display_name || ''}
                    onChange={(e) => updatePrivacySetting('display_name', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md"
                    placeholder="Enter display name"
                  />
                </div>
              </div>

              {/* Real Name */}
              <div className="space-y-2">
                <Label>Real Name (for opt-in reveal)</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={privacyControls.real_name || ''}
                    onChange={(e) => updatePrivacySetting('real_name', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md"
                    placeholder="Enter real name"
                  />
                </div>
              </div>

              {/* Anonymous Username Generator */}
              <AnonymousUsernameGenerator 
                onUsernameGenerated={(username) => {
                  updatePrivacySetting('display_name', username);
                }}
                compact={false}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-4 w-4" />
                <span>Privacy Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Privacy Level */}
              <div className="space-y-2">
                <Label>Privacy Level</Label>
                <Select
                  value={privacyControls.privacy_level}
                  onValueChange={(value) => updatePrivacySetting('privacy_level', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Visible to everyone</SelectItem>
                    <SelectItem value="friends">Friends - Visible to friends only</SelectItem>
                    <SelectItem value="private">Private - Visible to you only</SelectItem>
                    <SelectItem value="anonymous">Anonymous - Completely hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location Sharing */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Location Sharing</Label>
                  <p className="text-sm text-muted-foreground">
                    Share your location with others
                  </p>
                </div>
                <Switch
                  checked={privacyControls.location_sharing}
                  onCheckedChange={(checked) => updatePrivacySetting('location_sharing', checked)}
                  disabled={saving}
                />
              </div>

              {/* Precise Location */}
              {privacyControls.location_sharing && (
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Precise Location</Label>
                    <p className="text-sm text-muted-foreground">
                      Share exact coordinates instead of just city
                    </p>
                  </div>
                  <Switch
                    checked={privacyControls.precise_location}
                    onCheckedChange={(checked) => updatePrivacySetting('precise_location', checked)}
                    disabled={saving}
                  />
                </div>
              )}

              {/* Analytics */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Analytics Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow analytics tracking for app improvement
                  </p>
                </div>
                <Switch
                  checked={privacyControls.analytics_enabled}
                  onCheckedChange={(checked) => updatePrivacySetting('analytics_enabled', checked)}
                  disabled={saving}
                />
              </div>

              {/* Marketing Emails */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive marketing and promotional emails
                  </p>
                </div>
                <Switch
                  checked={privacyControls.marketing_emails}
                  onCheckedChange={(checked) => updatePrivacySetting('marketing_emails', checked)}
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Activity Controls</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Anonymous Posts */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Anonymous Posts</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow posting anonymously by default
                  </p>
                </div>
                <Switch
                  checked={privacyControls.anonymous_posts}
                  onCheckedChange={(checked) => updatePrivacySetting('anonymous_posts', checked)}
                  disabled={saving}
                />
              </div>

              {/* Anonymous Comments */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Anonymous Comments</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow commenting anonymously by default
                  </p>
                </div>
                <Switch
                  checked={privacyControls.anonymous_comments}
                  onCheckedChange={(checked) => updatePrivacySetting('anonymous_comments', checked)}
                  disabled={saving}
                />
              </div>

              {/* Anonymous Votes */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Anonymous Votes</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow voting anonymously by default
                  </p>
                </div>
                <Switch
                  checked={privacyControls.anonymous_votes}
                  onCheckedChange={(checked) => updatePrivacySetting('anonymous_votes', checked)}
                  disabled={saving}
                />
              </div>

              {/* Show Posts */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Show Posts</Label>
                  <p className="text-sm text-muted-foreground">
                    Make your posts visible to others
                  </p>
                </div>
                <Switch
                  checked={privacyControls.show_posts}
                  onCheckedChange={(checked) => updatePrivacySetting('show_posts', checked)}
                  disabled={saving}
                />
              </div>

              {/* Show Events */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Show Events</Label>
                  <p className="text-sm text-muted-foreground">
                    Make your events visible to others
                  </p>
                </div>
                <Switch
                  checked={privacyControls.show_events}
                  onCheckedChange={(checked) => updatePrivacySetting('show_events', checked)}
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        {showStats && (
          <TabsContent value="stats" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Privacy Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <div className="text-2xl font-bold text-blue-600">
                        {stats.total_anonymous_posts}
                      </div>
                      <div className="text-sm text-blue-600">Anonymous Posts</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <div className="text-2xl font-bold text-green-600">
                        {stats.total_anonymous_comments}
                      </div>
                      <div className="text-sm text-green-600">Anonymous Comments</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <ThumbsUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <div className="text-2xl font-bold text-purple-600">
                        {stats.total_anonymous_votes}
                      </div>
                      <div className="text-sm text-purple-600">Anonymous Votes</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <Eye className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                      <div className="text-2xl font-bold text-orange-600">
                        {stats.identity_reveals}
                      </div>
                      <div className="text-sm text-orange-600">Identity Reveals</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No statistics available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Privacy Notice */}
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">Privacy-First Design</p>
            <p className="text-sm">
              This system is designed with privacy as the default. Your identity is protected by default,
              and you have full control over when and how you reveal it. All changes are logged for
              transparency and you can export your privacy data at any time.
            </p>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};
