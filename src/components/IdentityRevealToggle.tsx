import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { PrivacyAuditService } from '@/services/privacyAuditService';
import { 
  Eye, 
  EyeOff, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  User, 
  Lock, 
  Unlock,
  Info,
  Clock,
  Globe,
  Users
} from 'lucide-react';

interface IdentityRevealToggleProps {
  resourceType: 'profile' | 'post' | 'comment' | 'event' | 'service' | 'message';
  resourceId: string;
  currentState: 'anonymous' | 'revealed';
  onStateChange?: (newState: 'anonymous' | 'revealed') => void;
  compact?: boolean;
  showWarning?: boolean;
}

export const IdentityRevealToggle: React.FC<IdentityRevealToggleProps> = ({
  resourceType,
  resourceId,
  currentState,
  onStateChange,
  compact = false,
  showWarning = true
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isRevealed, setIsRevealed] = useState(currentState === 'revealed');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    setIsRevealed(currentState === 'revealed');
  }, [currentState]);

  const handleToggle = async (newState: boolean) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to change your identity visibility.",
        variant: "destructive",
      });
      return;
    }

    if (newState && !isRevealed) {
      // Show confirmation for revealing identity
      setShowConfirmation(true);
      return;
    }

    await updateIdentityState(newState);
  };

  const confirmReveal = async () => {
    setShowConfirmation(false);
    await updateIdentityState(true);
  };

  const updateIdentityState = async (revealed: boolean) => {
    try {
      setIsLoading(true);

      // Log the identity change
      await PrivacyAuditService.logIdentityReveal(
        resourceType,
        resourceId,
        revealed,
        {
          user_id: user?.id,
          timestamp: new Date().toISOString(),
          resource_type: resourceType,
          resource_id: resourceId
        }
      );

      setIsRevealed(revealed);
      
      if (onStateChange) {
        onStateChange(revealed ? 'revealed' : 'anonymous');
      }

      toast({
        title: revealed ? "Identity Revealed" : "Identity Hidden",
        description: revealed 
          ? "Your identity is now visible to others." 
          : "Your identity is now hidden from others.",
      });
    } catch (error) {
      console.error('Error updating identity state:', error);
      toast({
        title: "Error",
        description: "Failed to update identity visibility. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStateIcon = () => {
    return isRevealed ? (
      <Eye className="h-4 w-4 text-green-600" />
    ) : (
      <EyeOff className="h-4 w-4 text-gray-600" />
    );
  };

  const getStateLabel = () => {
    return isRevealed ? 'Identity Revealed' : 'Identity Hidden';
  };

  const getStateColor = () => {
    return isRevealed 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStateDescription = () => {
    return isRevealed 
      ? 'Your real identity is visible to others'
      : 'Your identity is hidden and you appear as anonymous';
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <Switch
          checked={isRevealed}
          onCheckedChange={handleToggle}
          disabled={isLoading}
        />
        <Label className="text-sm">
          {isRevealed ? 'Revealed' : 'Anonymous'}
        </Label>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          {getStateIcon()}
          <span className="ml-2">Identity Visibility</span>
        </CardTitle>
        <CardDescription>
          Control whether your real identity is visible to others
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current State */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {getStateIcon()}
            <div>
              <div className="font-medium">{getStateLabel()}</div>
              <div className="text-sm text-muted-foreground">
                {getStateDescription()}
              </div>
            </div>
          </div>
          <Badge className={getStateColor()}>
            {isRevealed ? 'Visible' : 'Hidden'}
          </Badge>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="identity-toggle" className="text-base font-medium">
              {isRevealed ? 'Hide Identity' : 'Reveal Identity'}
            </Label>
            <p className="text-sm text-muted-foreground">
              {isRevealed 
                ? 'Click to hide your identity and appear as anonymous'
                : 'Click to reveal your real identity to others'
              }
            </p>
          </div>
          <Switch
            id="identity-toggle"
            checked={isRevealed}
            onCheckedChange={handleToggle}
            disabled={isLoading}
          />
        </div>

        {/* Warning for Revealing Identity */}
        {showWarning && !isRevealed && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Before revealing your identity:</p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• Your real name and profile will be visible</li>
                  <li>• This action will be logged in your privacy audit</li>
                  <li>• You can hide your identity again at any time</li>
                  <li>• Consider your privacy and safety</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Benefits of Each State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <EyeOff className="h-4 w-4 text-gray-600" />
              <span className="font-medium">Anonymous Mode</span>
            </div>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Your identity is protected</li>
              <li>• Post and comment freely</li>
              <li>• No personal information exposed</li>
              <li>• Enhanced privacy and safety</li>
            </ul>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Eye className="h-4 w-4 text-green-600" />
              <span className="font-medium">Revealed Mode</span>
            </div>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Build your reputation</li>
              <li>• Connect with others personally</li>
              <li>• Access to verified features</li>
              <li>• Enhanced credibility</li>
            </ul>
          </div>
        </div>

        {/* Privacy Information */}
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Privacy Protection:</p>
              <ul className="text-sm space-y-1 ml-4">
                <li>• All identity changes are logged for transparency</li>
                <li>• You can export your privacy data anytime</li>
                <li>• Your data is encrypted and secure</li>
                <li>• You have full control over your identity</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        {/* Confirmation Dialog */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
                  Confirm Identity Reveal
                </CardTitle>
                <CardDescription>
                  Are you sure you want to reveal your identity?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Once revealed, your real identity will be visible to others. 
                    This action will be logged in your privacy audit.
                  </AlertDescription>
                </Alert>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={confirmReveal}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? 'Revealing...' : 'Yes, Reveal Identity'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmation(false)}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
