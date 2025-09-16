import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
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
import {
  Plus,
  X,
  MapPin,
  Calendar,
  Tag,
  DollarSign,
  Users,
  Clock,
  Image,
  Video,
  FileText,
  MessageCircle,
  Megaphone,
  Star,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { usePosts } from '@/hooks/usePosts';
import { useEvents } from '@/hooks/useEvents';
import { useNavigate } from 'react-router-dom';
import { sanitizeText, sanitizeTags } from '@/lib/sanitize';

interface PostType {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  requiresAuth: boolean;
  fields: string[];
}

const postTypes: PostType[] = [
  {
    id: 'post',
    label: 'Post',
    icon: FileText,
    description: 'Share thoughts, updates, or photos',
    requiresAuth: true,
    fields: ['title', 'content', 'tags', 'location'],
  },
  {
    id: 'event',
    label: 'Event',
    icon: Calendar,
    description: 'Create a local event or gathering',
    requiresAuth: true,
    fields: ['title', 'content', 'date', 'time', 'location', 'price', 'capacity'],
  },
  {
    id: 'discussion',
    label: 'Discussion',
    icon: MessageCircle,
    description: 'Start a community discussion',
    requiresAuth: true,
    fields: ['title', 'content', 'category'],
  },
];

interface UnifiedPostCreatorProps {
  trigger?: React.ReactNode;
  defaultType?: string;
  onPostCreated?: (post: any) => void;
  className?: string;
}

export const UnifiedPostCreator: React.FC<UnifiedPostCreatorProps> = ({
  trigger,
  defaultType = 'post',
  onPostCreated,
  className = '',
}) => {
  const { user } = useAuth();
  const { location } = useLocation();
  const { createPost } = usePosts();
  const { createEvent } = useEvents();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isFullPage, setIsFullPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState(defaultType);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    isAnonymous: false,
    isPrivate: false,
    location: '',
    // Event fields
    eventDate: '',
    eventTime: '',
    eventLocation: '',
    price: '',
    maxAttendees: '',
    // Service fields
    servicePrice: '',
    serviceArea: '',
    availability: '',
    // Discussion fields
    category: '',
    guidelines: '',
    // Poll fields
    pollOptions: [] as string[],
    pollDuration: '',
  });

  const [newTag, setNewTag] = useState('');
  const [newPollOption, setNewPollOption] = useState('');

  const currentPostType = postTypes.find(type => type.id === selectedType);

  const handleInputChange = (field: string, value: any) => {
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

  const addPollOption = () => {
    if (newPollOption.trim() && !formData.pollOptions.includes(newPollOption.trim())) {
      setFormData(prev => ({
        ...prev,
        pollOptions: [...prev.pollOptions, newPollOption.trim()],
      }));
      setNewPollOption('');
    }
  };

  const removePollOption = (optionToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      pollOptions: prev.pollOptions.filter(option => option !== optionToRemove),
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
        isAnonymous: formData.isAnonymous,
        isPrivate: formData.isPrivate,
        location: sanitizeText(formData.location, 500),
        location_city: location?.city,
        location_state: location?.state,
        location_country: location?.country,
        latitude: location?.latitude,
        longitude: location?.longitude,
      };

      let result;
      if (selectedType === 'event') {
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
          type: selectedType,
        });
      }

      if (result && !result.error) {
        // Reset form
        setFormData({
          title: '',
          content: '',
          tags: [],
          isAnonymous: false,
          isPrivate: false,
          location: '',
          eventDate: '',
          eventTime: '',
          eventLocation: '',
          price: '',
          maxAttendees: '',
          servicePrice: '',
          serviceArea: '',
          availability: '',
          category: '',
          guidelines: '',
          pollOptions: [],
          pollDuration: '',
        });

        setIsOpen(false);
        onPostCreated?.(result);

        // Navigate based on post type
        if (selectedType === 'event') {
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

  const renderServiceFields = () => (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
      <h4 className="font-medium flex items-center gap-2">
        <Star className="h-4 w-4" />
        Service Details
      </h4>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="service-price">Price Range</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="service-price"
              value={formData.servicePrice}
              onChange={(e) => handleInputChange('servicePrice', e.target.value)}
              placeholder="50 - 150"
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="availability">Availability</Label>
          <Select value={formData.availability} onValueChange={(value) => handleInputChange('availability', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Available Now</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="flexible">Flexible</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="service-area">Service Area</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="service-area"
            value={formData.serviceArea}
            onChange={(e) => handleInputChange('serviceArea', e.target.value)}
            placeholder="Within 15km of current location"
            className="pl-10"
          />
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
        <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General Discussion</SelectItem>
            <SelectItem value="local-news">Local News</SelectItem>
            <SelectItem value="recommendations">Recommendations</SelectItem>
            <SelectItem value="events">Community Events</SelectItem>
            <SelectItem value="safety">Safety & Security</SelectItem>
            <SelectItem value="environment">Environment</SelectItem>
            <SelectItem value="business">Local Business</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="guidelines">Discussion Guidelines (Optional)</Label>
        <Textarea
          id="guidelines"
          value={formData.guidelines}
          onChange={(e) => handleInputChange('guidelines', e.target.value)}
          placeholder="Set any specific guidelines or rules for this discussion..."
          rows={3}
        />
      </div>
    </div>
  );

  const renderPollFields = () => (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
      <h4 className="font-medium flex items-center gap-2">
        <Megaphone className="h-4 w-4" />
        Poll Options
      </h4>
      
      <div className="space-y-2">
        <Label htmlFor="poll-options">Poll Options</Label>
        <div className="flex gap-2">
          <Input
            id="poll-options"
            value={newPollOption}
            onChange={(e) => setNewPollOption(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, addPollOption)}
            placeholder="Add poll option..."
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={addPollOption}
            disabled={!newPollOption.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {formData.pollOptions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.pollOptions.map((option) => (
              <Badge key={option} variant="secondary" className="flex items-center gap-1">
                {option}
                <button
                  type="button"
                  onClick={() => removePollOption(option)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="poll-duration">Poll Duration</Label>
        <Select value={formData.pollDuration} onValueChange={(value) => handleInputChange('pollDuration', value)}>
          <SelectTrigger>
            <SelectValue placeholder="How long should the poll run?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1-day">1 Day</SelectItem>
            <SelectItem value="3-days">3 Days</SelectItem>
            <SelectItem value="1-week">1 Week</SelectItem>
            <SelectItem value="2-weeks">2 Weeks</SelectItem>
            <SelectItem value="1-month">1 Month</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderForm = () => (
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
              {formData.isAnonymous ? 'Anonymous' : user.user_metadata?.full_name || 'User'}
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
        <div className="grid grid-cols-2 gap-2">
          {postTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setSelectedType(type.id)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                selectedType === type.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <type.icon className="h-4 w-4" />
                <span className="font-medium text-sm">{type.label}</span>
              </div>
              <p className="text-xs text-muted-foreground">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title {currentPostType?.fields.includes('title') ? '*' : '(Optional)'}</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder={`Add a title for your ${currentPostType?.label.toLowerCase()}...`}
          required={currentPostType?.fields.includes('title')}
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label htmlFor="content">Content *</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => handleInputChange('content', e.target.value)}
          placeholder={`What would you like to share about your ${currentPostType?.label.toLowerCase()}?`}
          className="min-h-[120px]"
          required
        />
      </div>

      {/* Type-specific fields */}
      {selectedType === 'event' && renderEventFields()}
      {selectedType === 'service' && renderServiceFields()}
      {selectedType === 'discussion' && renderDiscussionFields()}
      {selectedType === 'poll' && renderPollFields()}

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

      {/* Privacy Options */}
      <div className="space-y-4 p-4 border rounded-lg">
        <h4 className="font-medium">Privacy Options</h4>
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="anonymous">Post anonymously</Label>
            <p className="text-sm text-muted-foreground">
              Hide your identity from other users
            </p>
          </div>
          <Switch
            id="anonymous"
            checked={formData.isAnonymous}
            onCheckedChange={(checked) => handleInputChange('isAnonymous', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="private">Private post</Label>
            <p className="text-sm text-muted-foreground">
              Only your followers can see this post
            </p>
          </div>
          <Switch
            id="private"
            checked={formData.isPrivate}
            onCheckedChange={(checked) => handleInputChange('isPrivate', checked)}
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
          type="button"
          variant="outline"
          onClick={() => setIsFullPage(!isFullPage)}
          disabled={loading}
        >
          {isFullPage ? 'Quick Mode' : 'Full Editor'}
        </Button>
        <Button
          type="submit"
          disabled={loading || !formData.content.trim()}
          className="flex-1"
        >
          {loading ? 'Creating...' : `Create ${currentPostType?.label}`}
        </Button>
      </div>
    </form>
  );

  if (isFullPage) {
    return (
      <div className={`min-h-screen bg-background ${className}`}>
        <div className="container max-w-4xl mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Create {currentPostType?.label}</h1>
            <p className="text-muted-foreground">
              {currentPostType?.description}
            </p>
          </div>
          {renderForm()}
        </div>
      </div>
    );
  }

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

        {renderForm()}
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedPostCreator;
