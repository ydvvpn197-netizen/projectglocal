import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { anonymousUserService, AnonymousPost } from '@/services/anonymousUserService';
import { Eye, EyeOff, MapPin, User, MessageSquare, Calendar, BarChart3, Newspaper } from 'lucide-react';

interface AnonymousPostFormProps {
  onPostCreated?: (post: AnonymousPost) => void;
  onCancel?: () => void;
  initialContent?: string;
  postType?: AnonymousPost['post_type'];
  className?: string;
}

export function AnonymousPostForm({
  onPostCreated,
  onCancel,
  initialContent = '',
  postType = 'discussion',
  className = ''
}: AnonymousPostFormProps) {
  const { toast } = useToast();
  const [content, setContent] = useState(initialContent);
  const [selectedPostType, setSelectedPostType] = useState<AnonymousPost['post_type']>(postType);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState({
    city: '',
    state: '',
    country: ''
  });
  const [showLocation, setShowLocation] = useState(false);

  const postTypeOptions = [
    { value: 'discussion', label: 'Discussion', icon: MessageSquare, description: 'Start a conversation' },
    { value: 'question', label: 'Question', icon: MessageSquare, description: 'Ask for help or information' },
    { value: 'announcement', label: 'Announcement', icon: Calendar, description: 'Share important news' },
    { value: 'event', label: 'Event', icon: Calendar, description: 'Organize a local event' },
    { value: 'poll', label: 'Poll', icon: BarChart3, description: 'Create a community poll' },
    { value: 'news_comment', label: 'News Comment', icon: Newspaper, description: 'Comment on news articles' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: 'Content Required',
        description: 'Please enter some content for your post.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      const post = await anonymousUserService.createAnonymousPost(
        content,
        selectedPostType,
        {
          location: showLocation ? {
            city: location.city || undefined,
            state: location.state || undefined,
            country: location.country || undefined
          } : undefined
        }
      );

      toast({
        title: 'Post Created',
        description: 'Your anonymous post has been created successfully.',
      });

      onPostCreated?.(post);
      setContent('');
    } catch (error) {
      console.error('Error creating anonymous post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create post. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedType = postTypeOptions.find(option => option.value === selectedPostType);
  const Icon = selectedType?.icon || MessageSquare;

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          Create Anonymous Post
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>Your identity will be protected</span>
          <Badge variant="secondary" className="ml-auto">
            Anonymous
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Post Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="post-type">Post Type</Label>
            <Select value={selectedPostType} onValueChange={(value: AnonymousPost['post_type']) => setSelectedPostType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select post type" />
              </SelectTrigger>
              <SelectContent>
                {postTypeOptions.map((option) => {
                  const OptionIcon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <OptionIcon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`What's on your mind? Share your thoughts about ${selectedType?.label.toLowerCase()}...`}
              className="min-h-[120px]"
              required
            />
            <div className="text-xs text-muted-foreground">
              {content.length} characters
            </div>
          </div>

          {/* Location Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Include Location
              </Label>
              <Switch
                id="show-location"
                checked={showLocation}
                onCheckedChange={setShowLocation}
              />
            </div>
            
            {showLocation && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={location.city}
                    onChange={(e) => setLocation(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Enter city"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={location.state}
                    onChange={(e) => setLocation(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="Enter state"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={location.country}
                    onChange={(e) => setLocation(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="Enter country"
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Privacy Notice */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium">Privacy Protected</p>
              <p>Your post will be anonymous. Your real identity will not be revealed unless you choose to do so.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading || !content.trim()}
              className="flex-1"
            >
              {isLoading ? 'Creating...' : 'Create Anonymous Post'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
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
