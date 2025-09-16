import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Plus,
  X,
  MapPin,
  Calendar,
  Tag,
  DollarSign,
  Users,
  Clock,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { usePosts } from '@/hooks/usePosts';
import { useEvents } from '@/hooks/useEvents';
import { useNavigate } from 'react-router-dom';
import { sanitizeText, sanitizeTags } from '@/lib/sanitize';

interface SimplifiedPostCreatorProps {
  trigger?: React.ReactNode;
  onPostCreated?: (post: unknown) => void;
  className?: string;
}

export const SimplifiedPostCreator: React.FC<SimplifiedPostCreatorProps> = ({
  trigger,
  onPostCreated,
  className = '',
}) => {
  const { user } = useAuth();
  const { location } = useLocation();
  const { createPost } = usePosts();
  const { createEvent } = useEvents();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [postType, setPostType] = useState<'post' | 'event' | 'discussion'>('post');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    location: '',
    // Event fields
    eventDate: '',
    eventTime: '',
    eventLocation: '',
    price: '',
    maxAttendees: '',
    // Discussion fields
    category: '',
  });

  const [newTag, setNewTag] = useState('');

  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    const sanitizedTag = sanitizeText(newTag, 50);
    if (sanitizedTag && !formData.tags.includes(sanitizedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, sanitizedTag],
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.content.trim()) return;

    setLoading(true);
    try {
      const sanitizedData = {
        title: sanitizeText(formData.title, 200),
        content: sanitizeText(formData.content, 5000),
        tags: sanitizeTags(formData.tags),
        location: sanitizeText(formData.location, 500),
        location_city: location?.city,
        location_state: location?.state,
        location_country: location?.country,
        latitude: location?.latitude,
        longitude: location?.longitude,
      };

      let result;
      if (postType === 'event') {
        result = await createEvent({
          ...sanitizedData,
          event_date: formData.eventDate,
          event_time: formData.eventTime,
          event_location: formData.eventLocation,
          price: parseFloat(formData.price) || 0,
          max_attendees: parseInt(formData.maxAttendees) || undefined,
        });
      } else {
        result = await createPost({
          ...sanitizedData,
          type: postType,
          category: formData.category,
        });
      }

      if (result && !result.error) {
        // Reset form
        setFormData({
          title: '',
          content: '',
          tags: [],
          location: '',
          eventDate: '',
          eventTime: '',
          eventLocation: '',
          price: '',
          maxAttendees: '',
          category: '',
        });

        setIsOpen(false);
        onPostCreated?.(result);

        // Navigate based on post type
        if (postType === 'event') {
          navigate('/events');
        } else {
          navigate('/feed');
        }
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  const renderEventFields = () => (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
      <h4 className="font-medium flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        Event Details
      </h4>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="event-date">Date</Label>
          <Input
            id="event-date"
            type="date"
            value={formData.eventDate}
            onChange={(e) => handleInputChange('eventDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="event-time">Time</Label>
          <Input
            id="event-time"
            type="time"
            value={formData.eventTime}
            onChange={(e) => handleInputChange('eventTime', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="event-location">Location</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="event-location"
            value={formData.eventLocation}
            onChange={(e) => handleInputChange('eventLocation', e.target.value)}
            placeholder="Event venue or address"
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (USD)</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              placeholder="0 for free events"
              className="pl-10"
              min="0"
              step="0.01"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="max-attendees">Max Attendees</Label>
          <div className="relative">
            <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="max-attendees"
              type="number"
              value={formData.maxAttendees}
              onChange={(e) => handleInputChange('maxAttendees', e.target.value)}
              placeholder="Optional"
              className="pl-10"
              min="1"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderDiscussionFields = () => (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
      <h4 className="font-medium flex items-center gap-2">
        <MessageCircle className="h-4 w-4" />
        Discussion Details
      </h4>
      
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => handleInputChange('category', e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          <option value="">Select category</option>
          <option value="general">General Discussion</option>
          <option value="local-news">Local News</option>
          <option value="recommendations">Recommendations</option>
          <option value="events">Community Events</option>
          <option value="safety">Safety & Security</option>
          <option value="environment">Environment</option>
          <option value="business">Local Business</option>
        </select>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className={className}>
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
          {user && (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user.user_metadata?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  {user.user_metadata?.full_name || 'User'}
                </p>
                {location?.city && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {location.city}, {location.state}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Post Type Selection */}
          <div className="space-y-2">
            <Label>Post Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'post', label: 'Post', icon: '📝' },
                { id: 'event', label: 'Event', icon: '📅' },
                { id: 'discussion', label: 'Discussion', icon: '💬' },
              ].map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setPostType(type.id as 'post' | 'event' | 'discussion')}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    postType === type.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{type.icon}</span>
                    <span className="font-medium text-sm">{type.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder={`Add a title for your ${postType}...`}
              required
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder={`What would you like to share about your ${postType}?`}
              className="min-h-[120px]"
              required
            />
          </div>

          {/* Type-specific fields */}
          {postType === 'event' && renderEventFields()}
          {postType === 'discussion' && renderDiscussionFields()}

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, addTag)}
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
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
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

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location (Optional)</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Add a specific location..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.content.trim()}
              className="flex-1"
            >
              {loading ? 'Creating...' : `Create ${postType.charAt(0).toUpperCase() + postType.slice(1)}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SimplifiedPostCreator;
