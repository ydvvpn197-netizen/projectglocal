import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign, 
  Tag, 
  Image, 
  Building2, 
  AlertTriangle,
  CheckCircle,
  Plus,
  X,
  Shield,
  Megaphone
} from 'lucide-react';

interface GovernmentAuthority {
  id: string;
  name: string;
  department: string;
  level: 'local' | 'state' | 'national';
  contact_email: string;
  contact_phone?: string;
  jurisdiction: string;
}

interface EnhancedEventFormProps {
  onSubmit: (eventData: EnhancedEventData) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<EnhancedEventData>;
  isEditing?: boolean;
}

interface EnhancedEventData {
  title: string;
  description?: string;
  event_date: string;
  event_time: string;
  location_name: string;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  latitude?: number;
  longitude?: number;
  category?: string;
  max_attendees?: number;
  price?: number;
  image_url?: string;
  tags?: string[];
  requires_rsvp: boolean;
  rsvp_deadline?: string;
  allow_waitlist: boolean;
  waitlist_capacity?: number;
  government_authorities?: string[];
  is_public_event: boolean;
  requires_approval: boolean;
  contact_email?: string;
  contact_phone?: string;
  website_url?: string;
}

const eventCategories = [
  { value: 'community', label: 'Community', icon: '🏘️' },
  { value: 'music', label: 'Music', icon: '🎵' },
  { value: 'art', label: 'Art & Culture', icon: '🎨' },
  { value: 'sports', label: 'Sports', icon: '⚽' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'business', label: 'Business', icon: '💼' },
  { value: 'health', label: 'Health & Wellness', icon: '🏥' },
  { value: 'food', label: 'Food & Dining', icon: '🍕' },
  { value: 'technology', label: 'Technology', icon: '💻' },
  { value: 'environment', label: 'Environment', icon: '🌱' },
  { value: 'politics', label: 'Politics', icon: '🏛️' },
  { value: 'protest', label: 'Protest/Rally', icon: '📢' },
  { value: 'other', label: 'Other', icon: '📝' }
];

export const EnhancedEventForm: React.FC<EnhancedEventFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [governmentAuthorities, setGovernmentAuthorities] = useState<GovernmentAuthority[]>([]);
  const [selectedAuthorities, setSelectedAuthorities] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  
  const [formData, setFormData] = useState<EnhancedEventData>({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    location_name: '',
    location_city: '',
    location_state: '',
    location_country: '',
    latitude: undefined,
    longitude: undefined,
    category: 'community',
    max_attendees: undefined,
    price: 0,
    image_url: '',
    tags: [],
    requires_rsvp: false,
    rsvp_deadline: '',
    allow_waitlist: false,
    waitlist_capacity: undefined,
    government_authorities: [],
    is_public_event: true,
    requires_approval: false,
    contact_email: '',
    contact_phone: '',
    website_url: '',
    ...initialData
  });

  // Load government authorities
  useEffect(() => {
    loadGovernmentAuthorities();
  }, []);

  const loadGovernmentAuthorities = async () => {
    try {
      const { data, error } = await supabase
        .from('government_authorities')
        .select('*')
        .eq('is_active', true)
        .order('level', { ascending: true });

      if (error) throw error;
      setGovernmentAuthorities(data || []);
    } catch (error) {
      console.error('Error loading government authorities:', error);
    }
  };

  const handleInputChange = (field: keyof EnhancedEventData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      handleInputChange('tags', [...(formData.tags || []), newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags?.filter(tag => tag !== tagToRemove) || []);
  };

  const handleAuthorityToggle = (authorityId: string) => {
    const newAuthorities = selectedAuthorities.includes(authorityId)
      ? selectedAuthorities.filter(id => id !== authorityId)
      : [...selectedAuthorities, authorityId];
    
    setSelectedAuthorities(newAuthorities);
    handleInputChange('government_authorities', newAuthorities);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter an event title.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.event_date) {
      toast({
        title: "Date required",
        description: "Please select an event date.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.event_time) {
      toast({
        title: "Time required",
        description: "Please select an event time.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.location_name.trim()) {
      toast({
        title: "Location required",
        description: "Please enter an event location.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAuthorityLevelColor = (level: string) => {
    switch (level) {
      case 'local': return 'bg-blue-100 text-blue-800';
      case 'state': return 'bg-green-100 text-green-800';
      case 'national': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          {isEditing ? 'Edit Event' : 'Create Enhanced Event'}
        </CardTitle>
        <CardDescription>
          Create an event with RSVP system, government tagging, and advanced features
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div>
              <Label htmlFor="title" className="text-base font-medium">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter event title"
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-base font-medium">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your event..."
                className="mt-2 min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event_date" className="text-base font-medium">Date *</Label>
                <Input
                  id="event_date"
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => handleInputChange('event_date', e.target.value)}
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="event_time" className="text-base font-medium">Time *</Label>
                <Input
                  id="event_time"
                  type="time"
                  value={formData.event_time}
                  onChange={(e) => handleInputChange('event_time', e.target.value)}
                  className="mt-2"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location_name" className="text-base font-medium">Location *</Label>
              <Input
                id="location_name"
                value={formData.location_name}
                onChange={(e) => handleInputChange('location_name', e.target.value)}
                placeholder="Enter venue name or address"
                className="mt-2"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="location_city" className="text-base font-medium">City</Label>
                <Input
                  id="location_city"
                  value={formData.location_city}
                  onChange={(e) => handleInputChange('location_city', e.target.value)}
                  placeholder="City"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="location_state" className="text-base font-medium">State</Label>
                <Input
                  id="location_state"
                  value={formData.location_state}
                  onChange={(e) => handleInputChange('location_state', e.target.value)}
                  placeholder="State"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="location_country" className="text-base font-medium">Country</Label>
                <Input
                  id="location_country"
                  value={formData.location_country}
                  onChange={(e) => handleInputChange('location_country', e.target.value)}
                  placeholder="Country"
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Event Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="text-base font-medium">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventCategories.map((cat) => (
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

              <div>
                <Label htmlFor="price" className="text-base font-medium">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  placeholder="0 for free events"
                  className="mt-2"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max_attendees" className="text-base font-medium">Max Attendees</Label>
                <Input
                  id="max_attendees"
                  type="number"
                  value={formData.max_attendees}
                  onChange={(e) => handleInputChange('max_attendees', parseInt(e.target.value) || undefined)}
                  placeholder="Leave empty for unlimited"
                  className="mt-2"
                  min="1"
                />
              </div>

              <div>
                <Label htmlFor="image_url" className="text-base font-medium">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => handleInputChange('image_url', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="mt-2"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label className="text-base font-medium">Tags</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RSVP System */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">RSVP System</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Require RSVP</Label>
                <p className="text-sm text-muted-foreground">Attendees must RSVP to attend</p>
              </div>
              <Switch
                checked={formData.requires_rsvp}
                onCheckedChange={(checked) => handleInputChange('requires_rsvp', checked)}
              />
            </div>

            {formData.requires_rsvp && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <Label htmlFor="rsvp_deadline" className="text-base font-medium">RSVP Deadline</Label>
                  <Input
                    id="rsvp_deadline"
                    type="datetime-local"
                    value={formData.rsvp_deadline}
                    onChange={(e) => handleInputChange('rsvp_deadline', e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Allow Waitlist</Label>
                    <p className="text-sm text-muted-foreground">Allow people to join waitlist when full</p>
                  </div>
                  <Switch
                    checked={formData.allow_waitlist}
                    onCheckedChange={(checked) => handleInputChange('allow_waitlist', checked)}
                  />
                </div>

                {formData.allow_waitlist && (
                  <div>
                    <Label htmlFor="waitlist_capacity" className="text-base font-medium">Waitlist Capacity</Label>
                    <Input
                      id="waitlist_capacity"
                      type="number"
                      value={formData.waitlist_capacity}
                      onChange={(e) => handleInputChange('waitlist_capacity', parseInt(e.target.value) || undefined)}
                      placeholder="Maximum waitlist size"
                      className="mt-2"
                      min="1"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Government Tagging */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Government Authority Tagging
            </h3>
            <p className="text-sm text-muted-foreground">
              Tag relevant government authorities for civic events, protests, or community issues
            </p>

            {governmentAuthorities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {governmentAuthorities.map((authority) => (
                  <div
                    key={authority.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedAuthorities.includes(authority.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleAuthorityToggle(authority.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{authority.name}</h4>
                        <p className="text-sm text-muted-foreground">{authority.department}</p>
                        <p className="text-xs text-muted-foreground">{authority.jurisdiction}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getAuthorityLevelColor(authority.level)}>
                          {authority.level}
                        </Badge>
                        {selectedAuthorities.includes(authority.id) && (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No government authorities found. Contact support to add authorities for your region.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Event Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Event Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Public Event</Label>
                  <p className="text-sm text-muted-foreground">Event is visible to everyone</p>
                </div>
                <Switch
                  checked={formData.is_public_event}
                  onCheckedChange={(checked) => handleInputChange('is_public_event', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Require Approval</Label>
                  <p className="text-sm text-muted-foreground">Attendees need approval to join</p>
                </div>
                <Switch
                  checked={formData.requires_approval}
                  onCheckedChange={(checked) => handleInputChange('requires_approval', checked)}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_email" className="text-base font-medium">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  placeholder="contact@example.com"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="contact_phone" className="text-base font-medium">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  placeholder="+91 9876543210"
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="website_url" className="text-base font-medium">Website URL</Label>
              <Input
                id="website_url"
                value={formData.website_url}
                onChange={(e) => handleInputChange('website_url', e.target.value)}
                placeholder="https://example.com"
                className="mt-2"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Creating...' : isEditing ? 'Update Event' : 'Create Event'}
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
