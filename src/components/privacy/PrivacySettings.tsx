/**
 * Privacy Settings Component
 * Manages user privacy and anonymity controls
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAnonymousHandle } from '@/hooks/useAnonymousHandle';
import { useToast } from '@/hooks/use-toast';
import { Shield, Eye, EyeOff, User, AlertTriangle } from 'lucide-react';

export const PrivacySettings: React.FC = () => {
  const { 
    anonymousHandle, 
    isLoading, 
    error, 
    toggleAnonymity, 
    updateDisplayName, 
    revealIdentity 
  } = useAnonymousHandle();
  
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState('');
  const [isRevealing, setIsRevealing] = useState(false);

  const handleToggleAnonymity = async (isAnonymous: boolean) => {
    try {
      await toggleAnonymity(isAnonymous);
      toast({
        title: isAnonymous ? "Identity Hidden" : "Identity Revealed",
        description: isAnonymous 
          ? "Your real identity is now hidden from other users." 
          : "Your real identity is now visible to other users.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update privacy settings.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateDisplayName = async () => {
    if (!displayName.trim()) return;
    
    try {
      await updateDisplayName(displayName.trim());
      setDisplayName('');
      toast({
        title: "Display Name Updated",
        description: "Your anonymous display name has been updated.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update display name.",
        variant: "destructive"
      });
    }
  };

  const handleRevealIdentity = async () => {
    setIsRevealing(true);
    try {
      await revealIdentity();
      toast({
        title: "Identity Revealed",
        description: "Your real identity is now visible. This action cannot be undone.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to reveal identity.",
        variant: "destructive"
      });
    } finally {
      setIsRevealing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load privacy settings: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!anonymousHandle) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          No anonymous handle found. Please contact support.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
          <CardDescription>
            Control your visibility and anonymity on the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Anonymous Status */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Anonymous Mode</Label>
              <p className="text-sm text-muted-foreground">
                {anonymousHandle.isAnonymous 
                  ? "Your identity is hidden from other users" 
                  : "Your real identity is visible to other users"
                }
              </p>
            </div>
            <Switch
              checked={anonymousHandle.isAnonymous}
              onCheckedChange={handleToggleAnonymity}
              disabled={anonymousHandle.canRevealIdentity}
            />
          </div>

          {/* Current Handle */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Current Handle</Label>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-sm">{anonymousHandle.handle}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              This is your anonymous identifier on the platform
            </p>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Display Name</Label>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <span className="text-sm">{anonymousHandle.displayName}</span>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="New display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleUpdateDisplayName}
                disabled={!displayName.trim()}
                size="sm"
              >
                Update
              </Button>
            </div>
          </div>

          {/* Identity Reveal Warning */}
          {!anonymousHandle.canRevealIdentity && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> Revealing your identity is a permanent action. 
                Once revealed, you cannot return to full anonymity.
              </AlertDescription>
            </Alert>
          )}

          {/* Reveal Identity Button */}
          {!anonymousHandle.canRevealIdentity && (
            <div className="space-y-2">
              <Button
                onClick={handleRevealIdentity}
                disabled={isRevealing}
                variant="outline"
                className="w-full"
              >
                {isRevealing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    Revealing Identity...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Reveal My Identity
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                This action cannot be undone
              </p>
            </div>
          )}

          {/* Privacy Information */}
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Privacy Information</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Your anonymous handle is automatically generated and unique</li>
              <li>• You can change your display name at any time</li>
              <li>• Anonymous mode hides your real identity from other users</li>
              <li>• Revealing your identity is a permanent action</li>
              <li>• Your privacy settings are respected across all platform features</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};