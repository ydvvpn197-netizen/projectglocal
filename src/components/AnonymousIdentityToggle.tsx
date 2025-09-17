/**
 * AnonymousIdentityToggle Component
 * 
 * Provides a toggle interface for users to reveal/hide their identity
 * and manage their anonymous username display.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAnonymousUsername } from '@/hooks/useAnonymousUsername';
import { useToast } from '@/hooks/use-toast';
import { 
  Eye, 
  EyeOff, 
  User, 
  Shield, 
  RefreshCw, 
  CheckCircle,
  AlertCircle,
  Info,
  Crown,
  Lock,
  Globe
} from 'lucide-react';

interface AnonymousIdentityToggleProps {
  compact?: boolean;
  showStats?: boolean;
  onIdentityChange?: (isAnonymous: boolean) => void;
}

export const AnonymousIdentityToggle: React.FC<AnonymousIdentityToggleProps> = ({
  compact = false,
  showStats = true,
  onIdentityChange
}) => {
  const { currentUser, revealIdentity, hideIdentity, updateDisplayName, generateUsername, isLoading } = useAnonymousUsername();
  const { toast } = useToast();
  const [isRevealing, setIsRevealing] = useState(false);
  const [isHiding, setIsHiding] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [showNameDialog, setShowNameDialog] = useState(false);

  const handleRevealIdentity = async () => {
    setIsRevealing(true);
    try {
      const success = await revealIdentity();
      if (success) {
        toast({
          title: "Identity Revealed",
          description: "Your real identity is now visible to other users.",
        });
        onIdentityChange?.(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reveal identity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRevealing(false);
    }
  };

  const handleHideIdentity = async () => {
    setIsHiding(true);
    try {
      const success = await hideIdentity();
      if (success) {
        toast({
          title: "Identity Hidden",
          description: "You are now posting anonymously.",
        });
        onIdentityChange?.(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to hide identity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsHiding(false);
    }
  };

  const handleUpdateDisplayName = async () => {
    if (!newDisplayName.trim()) return;

    try {
      const success = await updateDisplayName(newDisplayName);
      if (success) {
        toast({
          title: "Display Name Updated",
          description: "Your display name has been updated successfully.",
        });
        setShowNameDialog(false);
        setNewDisplayName('');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update display name. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateNewUsername = () => {
    const newUsername = generateUsername();
    setNewDisplayName(newUsername);
  };

  if (isLoading || !currentUser) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <Switch
          checked={!currentUser.is_anonymous}
          onCheckedChange={(checked) => {
            if (checked) {
              handleRevealIdentity();
            } else {
              handleHideIdentity();
            }
          }}
          disabled={isRevealing || isHiding}
        />
        <Label className="text-sm">
          {currentUser.is_anonymous ? 'Anonymous' : 'Public'}
        </Label>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>Identity & Privacy</span>
        </CardTitle>
        <CardDescription>
          Control how your identity appears to other users
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-3">
            {currentUser.is_anonymous ? (
              <EyeOff className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Eye className="w-5 h-5 text-green-600" />
            )}
            <div>
              <p className="font-medium">
                {currentUser.display_name || currentUser.username}
              </p>
              <p className="text-sm text-muted-foreground">
                {currentUser.is_anonymous ? 'Anonymous Mode' : 'Public Identity'}
              </p>
            </div>
          </div>
          <Badge variant={currentUser.is_anonymous ? "secondary" : "default"}>
            {currentUser.is_anonymous ? (
              <>
                <Lock className="w-3 h-3 mr-1" />
                Anonymous
              </>
            ) : (
              <>
                <Globe className="w-3 h-3 mr-1" />
                Public
              </>
            )}
          </Badge>
        </div>

        {/* Identity Toggle */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Identity Visibility</Label>
              <p className="text-sm text-muted-foreground">
                {currentUser.is_anonymous 
                  ? "Your real identity is hidden. You appear as an anonymous user."
                  : "Your real identity is visible to other users."
                }
              </p>
            </div>
            <Switch
              checked={!currentUser.is_anonymous}
              onCheckedChange={(checked) => {
                if (checked) {
                  handleRevealIdentity();
                } else {
                  handleHideIdentity();
                }
              }}
              disabled={isRevealing || isHiding}
            />
          </div>

          {isRevealing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-center space-x-2 text-sm text-blue-600"
            >
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
              <span>Revealing identity...</span>
            </motion.div>
          )}

          {isHiding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-center space-x-2 text-sm text-orange-600"
            >
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600" />
              <span>Hiding identity...</span>
            </motion.div>
          )}
        </div>

        {/* Display Name Management */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Display Name</Label>
              <p className="text-sm text-muted-foreground">
                {currentUser.is_anonymous 
                  ? "Your anonymous username that others see."
                  : "Your public display name."
                }
              </p>
            </div>
            <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Change Name
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Display Name</DialogTitle>
                  <DialogDescription>
                    Choose how you want to be known in the community.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newDisplayName">New Display Name</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="newDisplayName"
                        value={newDisplayName}
                        onChange={(e) => setNewDisplayName(e.target.value)}
                        placeholder="Enter new display name"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={generateNewUsername}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowNameDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateDisplayName}
                      disabled={!newDisplayName.trim()}
                    >
                      Update Name
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        {showStats && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {currentUser.reveal_count || 0}
              </p>
              <p className="text-sm text-muted-foreground">Identity Reveals</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {currentUser.is_anonymous ? 'Hidden' : 'Public'}
              </p>
              <p className="text-sm text-muted-foreground">Current Status</p>
            </div>
          </div>
        )}

        {/* Privacy Tips */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-blue-900">Privacy Tips</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• You can change your identity visibility at any time</li>
                <li>• Anonymous mode protects your privacy while participating</li>
                <li>• Revealing your identity builds trust and credibility</li>
                <li>• Your reveal count helps others understand your transparency</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
