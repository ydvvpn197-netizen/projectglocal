import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAnonymousUsername } from '@/hooks/useAnonymousUsername';
import { 
  RefreshCw, 
  Shield, 
  Eye, 
  EyeOff, 
  User, 
  Settings, 
  AlertTriangle, 
  Copy,
  Check,
  Sparkles,
  Lock,
  Globe
} from 'lucide-react';

interface AnonymousUsernameGeneratorProps {
  onUsernameGenerated?: (username: string) => void;
  onPrivacyLevelChange?: (level: 'low' | 'medium' | 'high' | 'maximum') => void;
  compact?: boolean;
  showAdvanced?: boolean;
}

export const AnonymousUsernameGenerator: React.FC<AnonymousUsernameGeneratorProps> = ({
  onUsernameGenerated,
  onPrivacyLevelChange,
  compact = false,
  showAdvanced = true
}) => {
  const { toast } = useToast();
  const {
    anonymousUser,
    isLoading,
    error,
    createAnonymousUser,
    regenerateUsername,
    getPrivacyRecommendations,
    clearError
  } = useAnonymousUsername();

  const [selectedPrivacyLevel, setSelectedPrivacyLevel] = useState<'low' | 'medium' | 'high' | 'maximum'>('medium');
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSpecialChars, setIncludeSpecialChars] = useState(false);
  const [usernameLength, setUsernameLength] = useState(8);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewUsernames, setPreviewUsernames] = useState<string[]>([]);

  // Generate preview usernames
  useEffect(() => {
    const generatePreview = () => {
      const { anonymousUsernameService } = require('@/services/anonymousUsernameService');
      const previews = [];
      for (let i = 0; i < 3; i++) {
        previews.push(anonymousUsernameService.generateUsername({
          privacyLevel: selectedPrivacyLevel,
          includeNumbers,
          includeSpecialChars,
          length: usernameLength
        }));
      }
      setPreviewUsernames(previews);
    };

    generatePreview();
  }, [selectedPrivacyLevel, includeNumbers, includeSpecialChars, usernameLength]);

  const handleCreateUser = async () => {
    try {
      await createAnonymousUser({
        privacyLevel: selectedPrivacyLevel,
        includeNumbers,
        includeSpecialChars,
        length: usernameLength
      });
      
      toast({
        title: "Anonymous username created",
        description: "Your anonymous identity has been generated successfully.",
      });

      if (onUsernameGenerated && anonymousUser) {
        onUsernameGenerated(anonymousUser.generated_username);
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
        includeSpecialChars,
        length: usernameLength
      });
      
      toast({
        title: "Username regenerated",
        description: "Your anonymous username has been updated.",
      });

      if (onUsernameGenerated && anonymousUser) {
        onUsernameGenerated(anonymousUser.generated_username);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to regenerate username. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyUsername = async () => {
    if (anonymousUser?.generated_username) {
      try {
        await navigator.clipboard.writeText(anonymousUser.generated_username);
        setCopied(true);
        toast({
          title: "Copied!",
          description: "Username copied to clipboard.",
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to copy username.",
          variant: "destructive",
        });
      }
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
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <Eye className="h-4 w-4" />,
          risk: 'Low'
        };
      case 'medium':
        return {
          label: 'Medium Privacy',
          description: 'Balanced approach between privacy and usability',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <Shield className="h-4 w-4" />,
          risk: 'Medium'
        };
      case 'high':
        return {
          label: 'High Privacy',
          description: 'More random usernames, harder to trace',
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: <Shield className="h-4 w-4" />,
          risk: 'High'
        };
      case 'maximum':
        return {
          label: 'Maximum Privacy',
          description: 'Completely random usernames, maximum anonymity',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <EyeOff className="h-4 w-4" />,
          risk: 'Maximum'
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
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyUsername}
                disabled={isLoading}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerateUsername}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
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
          <Sparkles className="h-5 w-5" />
          <span>Anonymous Username Generator</span>
        </CardTitle>
        <CardDescription>
          Generate a unique anonymous identity for enhanced privacy
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

        {/* Preview Usernames */}
        {!anonymousUser && (
          <div className="space-y-3">
            <Label className="text-base font-medium">Preview Usernames</Label>
            <div className="grid grid-cols-3 gap-2">
              {previewUsernames.map((username, index) => (
                <div
                  key={index}
                  className="p-2 bg-gray-50 rounded-lg text-center font-mono text-sm border"
                >
                  {username}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              These are examples of what your username might look like
            </p>
          </div>
        )}

        {anonymousUser ? (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Your Anonymous Username</h3>
                <Badge className={privacyInfo.color}>
                  {privacyInfo.icon}
                  <span className="ml-1">{privacyInfo.label}</span>
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-gray-900 font-mono">
                  {anonymousUser.generated_username}
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyUsername}
                    disabled={isLoading}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerateUsername}
                    disabled={isLoading}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Created: {new Date(anonymousUser.created_at).toLocaleDateString()}
              </p>
            </div>

            {showAdvanced && (
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

                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-special-chars"
                    checked={includeSpecialChars}
                    onCheckedChange={setIncludeSpecialChars}
                  />
                  <Label htmlFor="include-special-chars">Include special characters</Label>
                </div>

                <div>
                  <Label htmlFor="username-length">Username Length</Label>
                  <Select
                    value={usernameLength.toString()}
                    onValueChange={(value) => setUsernameLength(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 characters</SelectItem>
                      <SelectItem value="8">8 characters</SelectItem>
                      <SelectItem value="10">10 characters</SelectItem>
                      <SelectItem value="12">12 characters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={handleRegenerateUsername}
                    disabled={isLoading}
                    variant="outline"
                    className="flex-1"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate Username
                  </Button>
                  
                  <Button
                    onClick={() => setShowRecommendations(!showRecommendations)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Privacy Tips
                  </Button>
                </div>
              </div>
            )}
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

            {showAdvanced && (
              <>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-numbers"
                    checked={includeNumbers}
                    onCheckedChange={setIncludeNumbers}
                  />
                  <Label htmlFor="include-numbers">Include numbers in username</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-special-chars"
                    checked={includeSpecialChars}
                    onCheckedChange={setIncludeSpecialChars}
                  />
                  <Label htmlFor="include-special-chars">Include special characters</Label>
                </div>

                <div>
                  <Label htmlFor="username-length">Username Length</Label>
                  <Select
                    value={usernameLength.toString()}
                    onValueChange={(value) => setUsernameLength(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 characters</SelectItem>
                      <SelectItem value="8">8 characters</SelectItem>
                      <SelectItem value="10">10 characters</SelectItem>
                      <SelectItem value="12">12 characters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <Button
              onClick={handleCreateUser}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Creating Anonymous Username...' : 'Generate Anonymous Username'}
            </Button>
          </div>
        )}

        {showRecommendations && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium mb-2 flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Privacy Recommendations
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Based on your activity patterns, here are our recommendations:
            </p>
            <div className="space-y-2">
              <div className="text-sm flex items-center">
                <Lock className="h-4 w-4 mr-2 text-green-600" />
                <strong>High posting frequency:</strong> Consider higher privacy levels
              </div>
              <div className="text-sm flex items-center">
                <Globe className="h-4 w-4 mr-2 text-orange-600" />
                <strong>Location sharing enabled:</strong> Maximum privacy recommended
              </div>
              <div className="text-sm flex items-center">
                <User className="h-4 w-4 mr-2 text-red-600" />
                <strong>Real name usage:</strong> Consider switching to anonymous mode
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
