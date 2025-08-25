import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, X, MapPin, Calendar, Tag } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { SocialPostService, CreatePostRequest } from '@/services/socialPostService';
import { useLocation } from '@/hooks/useLocation';

interface CreatePostDialogProps {
  onPostCreated?: (post: any) => void;
  trigger?: React.ReactNode;
}

export const CreatePostDialog: React.FC<CreatePostDialogProps> = ({
  onPostCreated,
  trigger
}) => {
  const { user } = useAuth();
  const { location } = useLocation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'post' | 'event' | 'service' | 'discussion' | 'poll' | 'announcement'>('post');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  
  // Event specific fields
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;

    setLoading(true);
    try {
      const postData: CreatePostRequest = {
        title: title.trim() || undefined,
        content: content.trim(),
        post_type: postType,
        is_anonymous: isAnonymous,
        tags: tags.length > 0 ? tags : undefined,
        location_city: location?.city,
        location_state: location?.state,
        location_country: location?.country,
        latitude: location?.latitude,
        longitude: location?.longitude,
        event_date: postType === 'event' ? eventDate : undefined,
        event_location: postType === 'event' ? eventLocation : undefined,
        price_range: postType === 'event' ? priceRange : undefined,
        contact_info: postType === 'event' ? contactInfo : undefined,
      };

      const newPost = await SocialPostService.createPost(postData);
      
      // Reset form
      setTitle('');
      setContent('');
      setPostType('post');
      setIsAnonymous(false);
      setTags([]);
      setEventDate('');
      setEventLocation('');
      setPriceRange('');
      setContactInfo('');
      
      setOpen(false);
      onPostCreated?.(newPost);
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a New Post</DialogTitle>
          <DialogDescription>
            Share something with the community. Your post will be visible to all members.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Author Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user?.user_metadata?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {isAnonymous ? 'Anonymous' : user?.user_metadata?.full_name || 'User'}
              </p>
              {location?.city && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {location.city}, {location.state}
                </p>
              )}
            </div>
          </div>

          {/* Post Type */}
          <div className="space-y-2">
            <Label htmlFor="post-type">Post Type</Label>
            <Select value={postType} onValueChange={(value: any) => setPostType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="post">General Post</SelectItem>
                <SelectItem value="discussion">Discussion</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="poll">Poll</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title (Optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a title to your post..."
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="min-h-[120px]"
              required
            />
          </div>

          {/* Event Fields */}
          {postType === 'event' && (
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium text-gray-900">Event Details</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-date">Event Date</Label>
                  <Input
                    id="event-date"
                    type="datetime-local"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="event-location">Event Location</Label>
                  <Input
                    id="event-location"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="Venue or address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price-range">Price Range</Label>
                  <Input
                    id="price-range"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    placeholder="e.g., Free, $10-20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact-info">Contact Info</Label>
                  <Input
                    id="contact-info"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="Phone, email, or website"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add tags..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addTag}
                disabled={!newTag.trim()}
              >
                <Tag className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Anonymous Post */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
            />
            <Label htmlFor="anonymous" className="text-sm">
              Post anonymously
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !content.trim()}>
              {loading ? 'Creating...' : 'Create Post'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
