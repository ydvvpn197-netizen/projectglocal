import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAnonymousUsername } from '@/hooks/useAnonymousUsername';
import { RefreshCw, Shield, Eye, EyeOff, User, Settings, AlertTriangle } from 'lucide-react';

interface AnonymousUsernameManagerProps {
  onUsernameChange?: (username: string) => void;
  onPrivacyLevelChange?: (level: 'low' | 'medium' | 'high' | 'maximum') => void;
  compact?: boolean;
}

export const AnonymousUsernameManager: React.FC<AnonymousUsernameManagerProps> = ({
  onUsernameChange,
  onPrivacyLevelChange,
  compact = false
}) => {
  const { toast } = useToast();
  const {
    anonymousUser,
    isLoading,
    error,
    createAnonymousUser,
    regenerateUsername,
    revealIdentity,
    getPrivacyRecommendations,
    clearError
  } = useAnonymousUsername();

  const [selectedPrivacyLevel, setSelectedPrivacyLevel] = useState<'low' | 'medium' | 'high' | 'maximum'>('medium');
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const handleCreateUser = async () => {
    try {
      await createAnonymousUser({
        privacyLevel: selectedPrivacyLevel,
        includeNumbers,
        includeSpecialChars: false
      });
      
      toast({
        title: "Anonymous username created",
        description: "Your anonymous identity has been generated successfully.",
      });

      if (onUsernameChange && anonymousUser) {
        onUsernameChange(anonymousUser.generated_username);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create anonymous username. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRegenerateUsername = async () => {
    try {
      await regenerateUsername({
        privacyLevel: selectedPrivacyLevel,
        includeNumbers,
        includeSpecialChars: false
      });
      
      toast({
        title: "Username regenerated",
        description: "Your anonymous username has been updated.",
      });

      if (onUsernameChange && anonymousUser) {
        onUsernameChange(anonymousUser.generated_username);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to regenerate username. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePrivacyLevelChange = (level: 'low' | 'medium' | 'high' | 'maximum') => {
    setSelectedPrivacyLevel(level);
    if (onPrivacyLevelChange) {
      onPrivacyLevelChange(level);
    }
  };

  const getPrivacyLevelInfo = (level: 'low' | 'medium' | 'high' | 'maximum') => {
    switch (level) {
      case 'low':
        return {
          label: 'Low Privacy',
          description: 'More memorable usernames, easier to trace',
          color: 'bg-yellow-100 text-yellow-800',
          icon: <Eye className="h-4 w-4" />
        };
      case 'medium':
        return {
          label: 'Medium Privacy',
          description: 'Balanced approach between privacy and usability',
          color: 'bg-blue-100 text-blue-800',
          icon: <Shield className="h-4 w-4" />
        };
      case 'high':
        return {
          label: 'High Privacy',
          description: 'More random usernames, harder to trace',
          color: 'bg-orange-100 text-orange-800',
          icon: <Shield className="h-4 w-4" />
        };
      case 'maximum':
        return {
          label: 'Maximum Privacy',
          description: 'Completely random usernames, maximum anonymity',
          color: 'bg-red-100 text-red-800',
          icon: <EyeOff className="h-4 w-4" />
        };
    }
  };

  const privacyInfo = getPrivacyLevelInfo(selectedPrivacyLevel);

  if (compact) {
    return (
      <div className="space-y-2">
        {anonymousUser ? (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{anonymousUser.generated_username}</span>
              <Badge className={privacyInfo.color}>
                {privacyInfo.icon}
                <span className="ml-1">{privacyInfo.label}</span>
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerateUsername}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button onClick={handleCreateUser} disabled={isLoading} className="w-full">
            {isLoading ? 'Creating...' : 'Create Anonymous Username'}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Anonymous Username Manager</span>
        </CardTitle>
        <CardDescription>
          Generate and manage your anonymous identity for enhanced privacy
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button
                variant="link"
                size="sm"
                onClick={clearError}
                className="ml-2 p-0 h-auto"
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {anonymousUser ? (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Current Anonymous Username</h3>
                <Badge className={privacyInfo.color}>
                  {privacyInfo.icon}
                  <span className="ml-1">{privacyInfo.label}</span>
                </Badge>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {anonymousUser.generated_username}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Created: {new Date(anonymousUser.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="privacy-level">Privacy Level</Label>
                <Select
                  value={selectedPrivacyLevel}
                  onValueChange={handlePrivacyLevelChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Privacy - More memorable</SelectItem>
                    <SelectItem value="medium">Medium Privacy - Balanced</SelectItem>
                    <SelectItem value="high">High Privacy - More random</SelectItem>
                    <SelectItem value="maximum">Maximum Privacy - Completely random</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  {privacyInfo.description}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="include-numbers"
                  checked={includeNumbers}
                  onCheckedChange={setIncludeNumbers}
                />
                <Label htmlFor="include-numbers">Include numbers in username</Label>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={handleRegenerateUsername}
                  disabled={isLoading}
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate Username
                </Button>
                
                <Button
                  onClick={() => setShowRecommendations(!showRecommendations)}
                  variant="outline"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Privacy Recommendations
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="privacy-level">Privacy Level</Label>
              <Select
                value={selectedPrivacyLevel}
                onValueChange={handlePrivacyLevelChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Privacy - More memorable</SelectItem>
                  <SelectItem value="medium">Medium Privacy - Balanced</SelectItem>
                  <SelectItem value="high">High Privacy - More random</SelectItem>
                  <SelectItem value="maximum">Maximum Privacy - Completely random</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-1">
                {privacyInfo.description}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="include-numbers"
                checked={includeNumbers}
                onCheckedChange={setIncludeNumbers}
              />
              <Label htmlFor="include-numbers">Include numbers in username</Label>
            </div>

            <Button
              onClick={handleCreateUser}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Creating Anonymous Username...' : 'Create Anonymous Username'}
            </Button>
          </div>
        )}

        {showRecommendations && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">Privacy Recommendations</h4>
            <p className="text-sm text-gray-600 mb-3">
              Based on your activity patterns, here are our recommendations:
            </p>
            <div className="space-y-2">
              <div className="text-sm">
                <strong>High posting frequency:</strong> Consider higher privacy levels
              </div>
              <div className="text-sm">
                <strong>Location sharing enabled:</strong> Maximum privacy recommended
              </div>
              <div className="text-sm">
                <strong>Real name usage:</strong> Consider switching to anonymous mode
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
