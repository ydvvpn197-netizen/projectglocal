/**
 * Anonymity Settings Component
 * Allows users to manage their privacy and anonymity settings
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAnonymousHandle } from '@/hooks/useAnonymousHandle';
import { 
  Eye, 
  EyeOff, 
  Shield, 
  User, 
  RefreshCw, 
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AnonymitySettingsProps {
  className?: string;
}

export function AnonymitySettings({ className }: AnonymitySettingsProps) {
  const {
    handleData,
    isLoading,
    error,
    updateAnonymitySettings,
    regenerateHandle,
    isAnonymous,
    anonymousHandle,
    realNameVisibility
  } = useAnonymousHandle();

  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleAnonymity = async (checked: boolean) => {
    setIsUpdating(true);
    try {
      await updateAnonymitySettings(checked, realNameVisibility);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleRealNameVisibility = async (checked: boolean) => {
    setIsUpdating(true);
    try {
      await updateAnonymitySettings(isAnonymous, checked);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRegenerateHandle = async () => {
    setIsRegenerating(true);
    try {
      await regenerateHandle();
    } finally {
      setIsRegenerating(false);
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
          <CardDescription>Loading your privacy settings...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Error loading privacy settings: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Privacy & Anonymity Settings
        </CardTitle>
        <CardDescription>
          Control how your identity appears to other users on the platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Anonymous Handle Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Your Anonymous Handle</label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerateHandle}
              disabled={isRegenerating}
            >
              {isRegenerating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Regenerate
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono">
              {anonymousHandle || 'Loading...'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Generated {handleData?.handle_generated_at ? 
                new Date(handleData.handle_generated_at).toLocaleDateString() : 
                'Unknown'
              }
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Anonymity Toggle */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <EyeOff className="h-4 w-4" />
                <label className="text-sm font-medium">Anonymous Mode</label>
              </div>
              <p className="text-xs text-muted-foreground">
                When enabled, others will only see your anonymous handle
              </p>
            </div>
            <Switch
              checked={isAnonymous}
              onCheckedChange={handleToggleAnonymity}
              disabled={isUpdating}
            />
          </div>
          
          {isAnonymous && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Anonymous mode is active. Your real name and personal details are hidden from other users.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Separator />

        {/* Real Name Visibility */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <label className="text-sm font-medium">Show Real Name</label>
              </div>
              <p className="text-xs text-muted-foreground">
                Allow others to see your real name (only works when anonymous mode is off)
              </p>
            </div>
            <Switch
              checked={realNameVisibility}
              onCheckedChange={handleToggleRealNameVisibility}
              disabled={isUpdating || isAnonymous}
            />
          </div>
          
          {isAnonymous && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Real name visibility is disabled while anonymous mode is active.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Separator />

        {/* Privacy Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Privacy Information</span>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Your anonymous handle is unique and randomly generated</p>
            <p>• Anonymous mode protects your identity while maintaining community interaction</p>
            <p>• You can change these settings at any time</p>
            <p>• Moderators may see additional information for platform safety</p>
          </div>
        </div>

        {/* Current Status */}
        <div className="pt-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Current status:</span>
            {isAnonymous ? (
              <Badge variant="secondary" className="flex items-center gap-1">
                <EyeOff className="h-3 w-3" />
                Anonymous
              </Badge>
            ) : realNameVisibility ? (
              <Badge variant="default" className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                Real Name Visible
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1">
                <User className="h-3 w-3" />
                Handle Only
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
