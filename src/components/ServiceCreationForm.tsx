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
  Plus, 
  X, 
  Upload, 
  DollarSign, 
  Clock, 
  MapPin, 
  Users, 
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  Camera,
  Music,
  Palette,
  Mic,
  Video,
  BookOpen,
  Award,
  Globe,
  Home,
  Building
} from 'lucide-react';

interface ServiceCreationFormProps {
  onSubmit: (serviceData: ServiceData) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<ServiceData>;
  isEditing?: boolean;
}

interface ServiceData {
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  subcategory?: string;
  duration: string;
  location_type: 'remote' | 'on-site' | 'both';
  availability_schedule: Record<string, unknown>;
  max_bookings_per_day: number;
  requires_approval: boolean;
  cancellation_policy: string;
  tags: string[];
  images: string[];
  is_active: boolean;
}

const serviceCategories = [
  { 
    value: 'music', 
    label: 'Music & Audio', 
    icon: <Music className="h-4 w-4" />,
    subcategories: ['Live Performance', 'Recording', 'Music Production', 'DJ Services', 'Sound Engineering']
  },
  { 
    value: 'photography', 
    label: 'Photography', 
    icon: <Camera className="h-4 w-4" />,
    subcategories: ['Event Photography', 'Portrait', 'Wedding', 'Commercial', 'Fashion']
  },
  { 
    value: 'art', 
    label: 'Art & Design', 
    icon: <Palette className="h-4 w-4" />,
    subcategories: ['Digital Art', 'Traditional Art', 'Graphic Design', 'Illustration', 'Mural']
  },
  { 
    value: 'voice', 
    label: 'Voice & Audio', 
    icon: <Mic className="h-4 w-4" />,
    subcategories: ['Voice Over', 'Podcast Production', 'Audio Editing', 'Narration', 'Singing']
  },
  { 
    value: 'video', 
    label: 'Video Production', 
    icon: <Video className="h-4 w-4" />,
    subcategories: ['Video Editing', 'Filming', 'Animation', 'Motion Graphics', 'Live Streaming']
  },
  { 
    value: 'education', 
    label: 'Education & Training', 
    icon: <BookOpen className="h-4 w-4" />,
    subcategories: ['Music Lessons', 'Art Classes', 'Workshops', 'Online Courses', 'Tutoring']
  },
  { 
    value: 'other', 
    label: 'Other Services', 
    icon: <Award className="h-4 w-4" />,
    subcategories: ['Consulting', 'Coaching', 'Writing', 'Translation', 'Other']
  }
];

const durationOptions = [
  { value: '30min', label: '30 minutes' },
  { value: '1hour', label: '1 hour' },
  { value: '2hours', label: '2 hours' },
  { value: '4hours', label: '4 hours' },
  { value: '8hours', label: '8 hours (Full day)' },
  { value: 'custom', label: 'Custom duration' }
];

const cancellationPolicies = [
  'Free cancellation up to 24 hours before service',
  'Free cancellation up to 48 hours before service',
  'Free cancellation up to 1 week before service',
  '50% refund for cancellations within 24 hours',
  'No refund for cancellations within 24 hours',
  'Custom policy'
];

export const ServiceCreationForm: React.FC<ServiceCreationFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newImage, setNewImage] = useState('');
  const [customDuration, setCustomDuration] = useState('');
  const [customCancellation, setCustomCancellation] = useState('');
  
  const [formData, setFormData] = useState<ServiceData>({
    title: '',
    description: '',
    price: 0,
    currency: 'INR',
    category: 'music',
    subcategory: '',
    duration: '1hour',
    location_type: 'both',
    availability_schedule: {},
    max_bookings_per_day: 5,
    requires_approval: false,
    cancellation_policy: cancellationPolicies[0],
    tags: [],
    images: [],
    is_active: true,
    ...initialData
  });

  const handleInputChange = (field: keyof ServiceData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddImage = () => {
    if (newImage.trim() && !formData.images.includes(newImage.trim())) {
      handleInputChange('images', [...formData.images, newImage.trim()]);
      setNewImage('');
    }
  };

  const handleRemoveImage = (imageToRemove: string) => {
    handleInputChange('images', formData.images.filter(image => image !== imageToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a service title.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Description required",
        description: "Please enter a service description.",
        variant: "destructive",
      });
      return;
    }

    if (formData.price <= 0) {
      toast({
        title: "Price required",
        description: "Please enter a valid price for your service.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.duration) {
      toast({
        title: "Duration required",
        description: "Please select a service duration.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting service:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedCategory = () => {
    return serviceCategories.find(cat => cat.value === formData.category);
  };

  const getSelectedCategorySubcategories = () => {
    const category = getSelectedCategory();
    return category?.subcategories || [];
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="h-5 w-5 mr-2" />
          {isEditing ? 'Edit Service' : 'Create Service Listing'}
        </CardTitle>
        <CardDescription>
          Create a professional service listing to attract clients and grow your business
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div>
              <Label htmlFor="title" className="text-base font-medium">Service Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Professional Wedding Photography"
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-base font-medium">Service Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your service in detail. What do you offer? What makes you unique?"
                className="mt-2 min-h-[120px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="text-base font-medium">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center space-x-2">
                          {cat.icon}
                          <span>{cat.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {getSelectedCategorySubcategories().length > 0 && (
                <div>
                  <Label htmlFor="subcategory" className="text-base font-medium">Subcategory</Label>
                  <Select
                    value={formData.subcategory}
                    onValueChange={(value) => handleInputChange('subcategory', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {getSelectedCategorySubcategories().map((sub) => (
                        <SelectItem key={sub} value={sub}>
                          {sub}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Duration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pricing & Duration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price" className="text-base font-medium">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="mt-2"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <Label htmlFor="currency" className="text-base font-medium">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => handleInputChange('currency', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">₹ INR</SelectItem>
                    <SelectItem value="USD">$ USD</SelectItem>
                    <SelectItem value="EUR">€ EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration" className="text-base font-medium">Duration *</Label>
                <Select
                  value={formData.duration}
                  onValueChange={(value) => handleInputChange('duration', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.duration === 'custom' && (
              <div>
                <Label htmlFor="custom_duration" className="text-base font-medium">Custom Duration</Label>
                <Input
                  id="custom_duration"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  placeholder="e.g., 3 hours, 2 days, etc."
                  className="mt-2"
                />
              </div>
            )}
          </div>

          {/* Location & Availability */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Location & Availability</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-base font-medium">Service Location</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <Button
                    type="button"
                    variant={formData.location_type === 'remote' ? 'default' : 'outline'}
                    onClick={() => handleInputChange('location_type', 'remote')}
                    className="flex items-center gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    Remote
                  </Button>
                  <Button
                    type="button"
                    variant={formData.location_type === 'on-site' ? 'default' : 'outline'}
                    onClick={() => handleInputChange('location_type', 'on-site')}
                    className="flex items-center gap-2"
                  >
                    <MapPin className="h-4 w-4" />
                    On-site
                  </Button>
                  <Button
                    type="button"
                    variant={formData.location_type === 'both' ? 'default' : 'outline'}
                    onClick={() => handleInputChange('location_type', 'both')}
                    className="flex items-center gap-2"
                  >
                    <Building className="h-4 w-4" />
                    Both
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="max_bookings" className="text-base font-medium">Max Bookings Per Day</Label>
                <Input
                  id="max_bookings"
                  type="number"
                  value={formData.max_bookings_per_day}
                  onChange={(e) => handleInputChange('max_bookings_per_day', parseInt(e.target.value) || 1)}
                  placeholder="5"
                  className="mt-2"
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Service Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Service Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Require Approval</Label>
                  <p className="text-sm text-muted-foreground">Manually approve booking requests</p>
                </div>
                <Switch
                  checked={formData.requires_approval}
                  onCheckedChange={(checked) => handleInputChange('requires_approval', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Active Service</Label>
                  <p className="text-sm text-muted-foreground">Service is available for booking</p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
              </div>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Cancellation Policy</h3>
            
            <div>
              <Label className="text-base font-medium">Select Policy</Label>
              <Select
                value={formData.cancellation_policy}
                onValueChange={(value) => handleInputChange('cancellation_policy', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cancellationPolicies.map((policy) => (
                    <SelectItem key={policy} value={policy}>
                      {policy}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.cancellation_policy === 'Custom policy' && (
              <div>
                <Label htmlFor="custom_policy" className="text-base font-medium">Custom Policy</Label>
                <Textarea
                  id="custom_policy"
                  value={customCancellation}
                  onChange={(e) => setCustomCancellation(e.target.value)}
                  placeholder="Describe your cancellation policy..."
                  className="mt-2"
                />
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tags</h3>
            
            <div>
              <Label className="text-base font-medium">Add Tags</Label>
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
              {formData.tags.length > 0 && (
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

          {/* Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Service Images</h3>
            
            <div>
              <Label className="text-base font-medium">Add Image URLs</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                />
                <Button type="button" onClick={handleAddImage} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={image} 
                        alt={`Service image ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(image)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Creating...' : isEditing ? 'Update Service' : 'Create Service'}
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
