import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  UserX, 
  Eye, 
  EyeOff, 
  MessageCircle, 
  Send, 
  ThumbsUp, 
  ThumbsDown,
  MapPin,
  Calendar,
  Tag,
  Image as ImageIcon,
  Plus,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { PrivacyService, AnonymousUser, AnonymousPost, AnonymousComment } from '@/services/privacyService';

interface AnonymousModeProps {
  onToggle?: (isAnonymous: boolean) => void;
  compact?: boolean;
}

export const AnonymousMode: React.FC<AnonymousModeProps> = ({ 
  onToggle, 
  compact = false 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [anonymousUser, setAnonymousUser] = useState<AnonymousUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Anonymous post creation state
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    post_type: 'post' as const,
    category: '',
    tags: [] as string[],
    location_city: '',
    location_state: '',
    location_country: ''
  });
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (isAnonymous && !anonymousUser) {
      initializeAnonymousUser();
    }
  }, [isAnonymous, anonymousUser, initializeAnonymousUser]);

  const initializeAnonymousUser = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const sessionId = PrivacyService.getSessionId();
      const anonUser = await PrivacyService.getOrCreateAnonymousUser(sessionId);
      
      if (anonUser) {
        setAnonymousUser(anonUser);
        onToggle?.(true);
      }
    } catch (error) {
      console.error('Error initializing anonymous user:', error);
      toast({
        title: "Error",
        description: "Failed to initialize anonymous mode",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, onToggle, toast]);

  const toggleAnonymousMode = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use anonymous mode",
        variant: "destructive"
      });
      return;
    }

    if (isAnonymous) {
      setIsAnonymous(false);
      setAnonymousUser(null);
      onToggle?.(false);
    } else {
      setIsAnonymous(true);
    }
  };

  const updateAnonymousProfile = async (updates: Partial<AnonymousUser>) => {
    if (!anonymousUser) return;
    
    try {
      const success = await PrivacyService.updateAnonymousUser(anonymousUser.id, updates);
      if (success) {
        setAnonymousUser(prev => prev ? { ...prev, ...updates } : null);
        toast({
          title: "Success",
          description: "Anonymous profile updated"
        });
      }
    } catch (error) {
      console.error('Error updating anonymous profile:', error);
      toast({
        title: "Error",
        description: "Failed to update anonymous profile",
        variant: "destructive"
      });
    }
  };

  const createAnonymousPost = async () => {
    if (!anonymousUser || !newPost.title.trim() || !newPost.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in title and content",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const postData = {
        anonymous_user_id: anonymousUser.id,
        ...newPost,
        tags: newPost.tags.length > 0 ? newPost.tags : undefined
      };

      const createdPost = await PrivacyService.createAnonymousPost(postData);
      if (createdPost) {
        toast({
          title: "Success",
          description: "Anonymous post created successfully"
        });
        setNewPost({
          title: '',
          content: '',
          post_type: 'post',
          category: '',
          tags: [],
          location_city: '',
          location_state: '',
          location_country: ''
        });
      }
    } catch (error) {
      console.error('Error creating anonymous post:', error);
      toast({
        title: "Error",
        description: "Failed to create anonymous post",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !newPost.tags.includes(newTag.trim())) {
      setNewPost(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewPost(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (compact) {
    return (
      <Button
        variant={isAnonymous ? "default" : "outline"}
        size="sm"
        onClick={toggleAnonymousMode}
        disabled={loading}
        className="flex items-center gap-2"
      >
        {isAnonymous ? (
          <>
            <Eye className="h-4 w-4" />
            Exit Anonymous
          </>
        ) : (
          <>
            <UserX className="h-4 w-4" />
            Go Anonymous
          </>
        )}
      </Button>
    );
  }

  return (
    <div className="space-y-6">
      {/* Anonymous Mode Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserX className="h-5 w-5" />
            Anonymous Mode
            <Badge variant="secondary" className="text-xs">Beta</Badge>
          </CardTitle>
          <CardDescription>
            Participate in discussions and create content without revealing your identity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {isAnonymous ? "Currently in Anonymous Mode" : "Anonymous Mode Disabled"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isAnonymous 
                  ? "Your identity is hidden from other users" 
                  : "Enable to participate anonymously"
                }
              </p>
            </div>
            <Button
              variant={isAnonymous ? "default" : "outline"}
              onClick={toggleAnonymousMode}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {isAnonymous ? (
                <>
                  <Eye className="h-4 w-4" />
                  Exit Anonymous
                </>
              ) : (
                <>
                  <UserX className="h-4 w-4" />
                  Go Anonymous
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Anonymous Profile Settings */}
      {isAnonymous && anonymousUser && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={anonymousUser.avatar_url} />
                <AvatarFallback>
                  {anonymousUser.display_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              Anonymous Profile
            </CardTitle>
            <CardDescription>
              Customize your anonymous identity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="anon-display-name">Display Name</Label>
                <Input
                  id="anon-display-name"
                  value={anonymousUser.display_name}
                  onChange={(e) => updateAnonymousProfile({ display_name: e.target.value })}
                  placeholder="Anonymous User"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="anon-avatar">Avatar URL</Label>
                <Input
                  id="anon-avatar"
                  value={anonymousUser.avatar_url || ''}
                  onChange={(e) => updateAnonymousProfile({ avatar_url: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="anon-city">City</Label>
                <Input
                  id="anon-city"
                  value={anonymousUser.location_city || ''}
                  onChange={(e) => updateAnonymousProfile({ location_city: e.target.value })}
                  placeholder="Your city"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="anon-state">State</Label>
                <Input
                  id="anon-state"
                  value={anonymousUser.location_state || ''}
                  onChange={(e) => updateAnonymousProfile({ location_state: e.target.value })}
                  placeholder="Your state"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="anon-country">Country</Label>
                <Input
                  id="anon-country"
                  value={anonymousUser.location_country || ''}
                  onChange={(e) => updateAnonymousProfile({ location_country: e.target.value })}
                  placeholder="Your country"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Anonymous Post Creation */}
      {isAnonymous && anonymousUser && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Create Anonymous Post
            </CardTitle>
            <CardDescription>
              Share your thoughts without revealing your identity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="post-title">Title</Label>
              <Input
                id="post-title"
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter post title..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-content">Content</Label>
              <Textarea
                id="post-content"
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Share your thoughts..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="post-type">Post Type</Label>
                <Select
                  value={newPost.post_type}
                  onValueChange={(value: string) => setNewPost(prev => ({ ...prev, post_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="post">General Post</SelectItem>
                    <SelectItem value="discussion">Discussion</SelectItem>
                    <SelectItem value="news">News</SelectItem>
                    <SelectItem value="poll">Poll</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="post-category">Category</Label>
                <Input
                  id="post-category"
                  value={newPost.category}
                  onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Technology, Local News"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button onClick={addTag} size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {newPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newPost.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="post-city">City</Label>
                <Input
                  id="post-city"
                  value={newPost.location_city}
                  onChange={(e) => setNewPost(prev => ({ ...prev, location_city: e.target.value }))}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="post-state">State</Label>
                <Input
                  id="post-state"
                  value={newPost.location_state}
                  onChange={(e) => setNewPost(prev => ({ ...prev, location_state: e.target.value }))}
                  placeholder="State"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="post-country">Country</Label>
                <Input
                  id="post-country"
                  value={newPost.location_country}
                  onChange={(e) => setNewPost(prev => ({ ...prev, location_country: e.target.value }))}
                  placeholder="Country"
                />
              </div>
            </div>

            <Button
              onClick={createAnonymousPost}
              disabled={loading || !newPost.title.trim() || !newPost.content.trim()}
              className="w-full"
            >
              {loading ? (
                "Creating Post..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Create Anonymous Post
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Anonymous Mode Info */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
              About Anonymous Mode
            </h4>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Your real identity is completely hidden from other users</li>
              <li>• You can participate in discussions and create content anonymously</li>
              <li>• All anonymous content is still subject to community guidelines</li>
              <li>• You can switch between anonymous and regular mode at any time</li>
              <li>• Anonymous posts and comments are marked as such</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
