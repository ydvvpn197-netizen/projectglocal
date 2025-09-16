import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAnonymousUsername } from '@/hooks/useAnonymousUsername';
import { 
  EyeOff, 
  Shield, 
  MapPin, 
  MessageSquare, 
  Send, 
  AlertTriangle,
  User,
  Lock,
  Globe,
  Eye
} from 'lucide-react';
import { PRIVACY_LEVELS, LOCATION_SHARING_LEVELS } from '@/types/anonymous';

interface AnonymousPostFormProps {
  onSubmit: (postData: AnonymousPostData) => Promise<void>;
  onCancel?: () => void;
  compact?: boolean;
}

interface AnonymousPostData {
  content: string;
  privacyLevel: 'anonymous' | 'pseudonymous' | 'public';
  locationSharing: 'none' | 'city' | 'precise';
  category: string;
  tags: string[];
  isAnonymous: boolean;
}

const postCategories = [
  { value: 'general', label: 'General Discussion', icon: '💬' },
  { value: 'local-news', label: 'Local News', icon: '📰' },
  { value: 'events', label: 'Events', icon: '📅' },
  { value: 'community', label: 'Community', icon: '🏘️' },
  { value: 'politics', label: 'Politics', icon: '🏛️' },
  { value: 'environment', label: 'Environment', icon: '🌱' },
  { value: 'safety', label: 'Safety', icon: '🛡️' },
  { value: 'business', label: 'Business', icon: '💼' },
  { value: 'art', label: 'Art & Culture', icon: '🎨' },
  { value: 'sports', label: 'Sports', icon: '⚽' },
  { value: 'other', label: 'Other', icon: '📝' }
];

export const AnonymousPostForm: React.FC<AnonymousPostFormProps> = ({
  onSubmit,
  onCancel,
  compact = false
}) => {
  const { toast } = useToast();
  const { anonymousUser, isLoading: anonymousLoading } = useAnonymousUsername();
  
  const [content, setContent] = useState('');
  const [privacyLevel, setPrivacyLevel] = useState<'anonymous' | 'pseudonymous' | 'public'>('anonymous');
  const [locationSharing, setLocationSharing] = useState<'none' | 'city' | 'precise'>('city');
  const [category, setCategory] = useState('general');
  const [tags, setTags] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter some content for your post.",
        variant: "destructive",
      });
      return;
    }

    if (isAnonymous && !anonymousUser) {
      toast({
        title: "Anonymous identity required",
        description: "Please create an anonymous identity first.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const postData: AnonymousPostData = {
        content: content.trim(),
        privacyLevel,
        locationSharing,
        category,
        tags,
        isAnonymous
      };

      await onSubmit(postData);
      
      toast({
        title: "Post created",
        description: "Your post has been published successfully.",
      });

      // Reset form
      setContent('');
      setTags([]);
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPrivacyInfo = (level: 'anonymous' | 'pseudonymous' | 'public') => {
    return PRIVACY_LEVELS[level];
  };

  const getLocationInfo = (level: 'none' | 'city' | 'precise') => {
    return LOCATION_SHARING_LEVELS[level];
  };

  const privacyInfo = getPrivacyInfo(privacyLevel);
  const locationInfo = getLocationInfo(locationSharing);

  if (compact) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Textarea
                placeholder="Share your thoughts anonymously..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px]"
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-muted-foreground">
                  {content.length}/500 characters
                </span>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={isAnonymous}
                    onCheckedChange={setIsAnonymous}
                    size="sm"
                  />
                  <Label className="text-xs">Anonymous</Label>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="flex-1"
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center">
          <EyeOff className="h-5 w-5 mr-2" />
          Create Anonymous Post
        </CardTitle>
        <CardDescription>
          Share your thoughts while maintaining your privacy
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Anonymous Identity Display */}
          {isAnonymous && anonymousUser && (
            <Alert className="bg-blue-50 border-blue-200">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>Posting as: <strong>{anonymousUser.generated_username}</strong></span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Anonymous
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Content */}
          <div>
            <Label htmlFor="content" className="text-base font-medium">
              What's on your mind?
            </Label>
            <Textarea
              id="content"
              placeholder="Share your thoughts, concerns, or ideas with the community..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-2 min-h-[120px]"
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-muted-foreground">
                {content.length}/1000 characters
              </span>
              <div className="flex items-center space-x-2">
                <Switch
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
                <Label htmlFor="anonymous">Post anonymously</Label>
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category" className="text-base font-medium">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {postCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center space-x-2">
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Settings */}
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
            </Button>
          </div>

          {showAdvanced && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              {/* Privacy Level */}
              <div>
                <Label className="text-base font-medium">Privacy Level</Label>
                <Select
                  value={privacyLevel}
                  onValueChange={(value: 'anonymous' | 'pseudonymous' | 'public') => setPrivacyLevel(value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anonymous">
                      <div className="flex items-center space-x-2">
                        <span>{PRIVACY_LEVELS.anonymous.icon}</span>
                        <div>
                          <div className="font-medium">{PRIVACY_LEVELS.anonymous.label}</div>
                          <div className="text-xs text-muted-foreground">{PRIVACY_LEVELS.anonymous.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="pseudonymous">
                      <div className="flex items-center space-x-2">
                        <span>{PRIVACY_LEVELS.pseudonymous.icon}</span>
                        <div>
                          <div className="font-medium">{PRIVACY_LEVELS.pseudonymous.label}</div>
                          <div className="text-xs text-muted-foreground">{PRIVACY_LEVELS.pseudonymous.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="public">
                      <div className="flex items-center space-x-2">
                        <span>{PRIVACY_LEVELS.public.icon}</span>
                        <div>
                          <div className="font-medium">{PRIVACY_LEVELS.public.label}</div>
                          <div className="text-xs text-muted-foreground">{PRIVACY_LEVELS.public.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  {privacyInfo.description}
                </p>
              </div>

              {/* Location Sharing */}
              <div>
                <Label className="text-base font-medium">Location Sharing</Label>
                <Select
                  value={locationSharing}
                  onValueChange={(value: 'none' | 'city' | 'district' | 'precise') => setLocationSharing(value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <div className="flex items-center space-x-2">
                        <span>{LOCATION_SHARING_LEVELS.none.icon}</span>
                        <div>
                          <div className="font-medium">{LOCATION_SHARING_LEVELS.none.label}</div>
                          <div className="text-xs text-muted-foreground">{LOCATION_SHARING_LEVELS.none.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="city">
                      <div className="flex items-center space-x-2">
                        <span>{LOCATION_SHARING_LEVELS.city.icon}</span>
                        <div>
                          <div className="font-medium">{LOCATION_SHARING_LEVELS.city.label}</div>
                          <div className="text-xs text-muted-foreground">{LOCATION_SHARING_LEVELS.city.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="precise">
                      <div className="flex items-center space-x-2">
                        <span>{LOCATION_SHARING_LEVELS.precise.icon}</span>
                        <div>
                          <div className="font-medium">{LOCATION_SHARING_LEVELS.precise.label}</div>
                          <div className="text-xs text-muted-foreground">{LOCATION_SHARING_LEVELS.precise.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  {locationInfo.description}
                </p>
              </div>
            </div>
          )}

          {/* Privacy Warning */}
          {isAnonymous && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Anonymous Posting Guidelines:</p>
                  <ul className="text-sm space-y-1">
                    <li>• Your real identity will be hidden</li>
                    <li>• Posts are still subject to community guidelines</li>
                    <li>• You can reveal your identity later if desired</li>
                    <li>• Anonymous posts may have limited engagement features</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isSubmitting || !content.trim() || (isAnonymous && !anonymousUser)}
              className="flex-1"
            >
              {isSubmitting ? (
                'Posting...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {isAnonymous ? 'Post Anonymously' : 'Post'}
                </>
              )}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
