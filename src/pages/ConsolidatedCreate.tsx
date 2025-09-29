import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { 
  X, 
  Plus, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock, 
  Tag, 
  ArrowLeft, 
  Edit3,
  MessageCircle,
  CalendarIcon,
  FileText,
  Image,
  Link,
  Hash,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Settings,
  Save,
  Send,
  Upload,
  Download,
  RefreshCw,
  Filter,
  Search,
  MoreHorizontal,
  CheckCircle,
  AlertTriangle,
  Info,
  Shield,
  Heart,
  Star,
  Zap,
  Target,
  Award,
  Activity,
  BarChart3,
  Bell,
  Home,
  Navigation,
  Compass,
  Flag,
  AtSign,
  Phone,
  Mail,
  ExternalLink,
  BookOpen,
  Music,
  Camera,
  Mic,
  Coffee,
  Car,
  Building,
  Leaf,
  Mountain,
  Globe as GlobeIcon,
  User,
  UserPlus,
  UserCheck,
  Crown,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Activity as ActivityIcon
} from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import { useEvents } from '@/hooks/useEvents';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { useDiscussions } from '@/hooks/useDiscussions';
import { communityService } from '@/services/communityService';
import { sanitizeText, sanitizeHtml, sanitizeTags } from '@/lib/sanitize';
import { GovernmentAuthorityTagging } from '@/components/GovernmentAuthorityTagging';
import { CreateGroupRequest } from '@/types/community';

interface CreateFormData {
  // Post fields
  title: string;
  content: string;
  tags: string[];
  isPrivate: boolean;
  allowComments: boolean;
  
  // Event fields
  eventDate: string;
  eventTime: string;
  locationName: string;
  locationAddress: string;
  category: string;
  maxAttendees: string;
  price: string;
  imageUrl: string;
  isRecurring: boolean;
  recurringPattern: string;
  
  // Group fields
  name: string;
  description: string;
  groupCategory: string;
  isPublic: boolean;
  allowAnonymousPosts: boolean;
  requireApproval: boolean;
  
  // Discussion fields
  discussionTitle: string;
  discussionContent: string;
  groupId: string;
  discussionCategory: string;
  isAnonymous: boolean;
}

const ConsolidatedCreate: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { currentLocation } = useLocation();
  const { createPost } = usePosts();
  const { createEvent } = useEvents();
  const { createDiscussion } = useDiscussions();
  
  const [activeTab, setActiveTab] = useState('post');
  const [loading, setLoading] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [userGroups, setUserGroups] = useState<{ id: string; name: string; description?: string; category?: string }[]>([]);
  
  const [formData, setFormData] = useState<CreateFormData>({
    title: '',
    content: '',
    tags: [],
    isPrivate: false,
    allowComments: true,
    eventDate: '',
    eventTime: '',
    locationName: '',
    locationAddress: '',
    category: '',
    maxAttendees: '',
    price: '',
    imageUrl: '',
    isRecurring: false,
    recurringPattern: 'weekly',
    name: '',
    description: '',
    groupCategory: 'General',
    isPublic: true,
    allowAnonymousPosts: false,
    requireApproval: false,
    discussionTitle: '',
    discussionContent: '',
    groupId: '',
    discussionCategory: 'general',
    isAnonymous: false
  });

  // Fetch user groups for discussions
  useEffect(() => {
    const fetchUserGroups = async () => {
      if (!user) return;
      
      try {
        const groups = await communityService.getUserGroups(user.id);
        setUserGroups(groups);
      } catch (error) {
        console.error('Error fetching user groups:', error);
      }
    };

    fetchUserGroups();
  }, [user]);

  const handleInputChange = (field: keyof CreateFormData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    const sanitizedTag = sanitizeText(newTag, 50);
    if (sanitizedTag && !formData.tags.includes(sanitizedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, sanitizedTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create content.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      switch (activeTab) {
        case 'post':
          await handleCreatePost();
          break;
        case 'event':
          await handleCreateEvent();
          break;
        case 'group':
          await handleCreateGroup();
          break;
        case 'discussion':
          await handleCreateDiscussion();
          break;
        default:
          throw new Error('Invalid content type');
      }
    } catch (error) {
      console.error('Error creating content:', error);
      toast({
        title: "Error",
        description: "Failed to create content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in title and content.",
        variant: "destructive",
      });
      return;
    }

    const postData = {
      title: sanitizeText(formData.title, 200),
      content: sanitizeHtml(formData.content),
      tags: sanitizeTags(formData.tags),
      is_private: formData.isPrivate,
      allow_comments: formData.allowComments,
      location: currentLocation ? {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        address: currentLocation.address
      } : undefined
    };

    await createPost(postData);
    
    toast({
      title: "Post Created",
      description: "Your post has been published successfully!",
    });
    
    navigate('/');
  };

  const handleCreateEvent = async () => {
    if (!formData.title.trim() || !formData.eventDate || !formData.locationName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const eventData = {
      title: sanitizeText(formData.title, 200),
      description: sanitizeHtml(formData.content),
      event_date: formData.eventDate,
      event_time: formData.eventTime,
      location_name: formData.locationName,
      location_address: formData.locationAddress,
      category: formData.category,
      max_attendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
      price: formData.price ? parseFloat(formData.price) : 0,
      image_url: formData.imageUrl,
      is_recurring: formData.isRecurring,
      recurring_pattern: formData.recurringPattern,
      location: currentLocation ? {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        address: currentLocation.address
      } : undefined
    };

    await createEvent(eventData);
    
    toast({
      title: "Event Created",
      description: "Your event has been published successfully!",
    });
    
    navigate('/events');
  };

  const handleCreateGroup = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in name and description.",
        variant: "destructive",
      });
      return;
    }

    const groupData: CreateGroupRequest = {
      name: sanitizeText(formData.name, 100),
      description: sanitizeText(formData.description, 500),
      category: formData.groupCategory,
      is_public: formData.isPublic,
      allow_anonymous_posts: formData.allowAnonymousPosts,
      require_approval: formData.requireApproval,
      location: currentLocation ? {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        address: currentLocation.address
      } : undefined
    };

    await communityService.createGroup(groupData);
    
    toast({
      title: "Group Created",
      description: "Your group has been created successfully!",
    });
    
    navigate('/communities');
  };

  const handleCreateDiscussion = async () => {
    if (!formData.discussionTitle.trim() || !formData.discussionContent.trim() || !formData.groupId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const discussionData = {
      title: sanitizeText(formData.discussionTitle, 200),
      content: sanitizeHtml(formData.discussionContent),
      group_id: formData.groupId,
      category: formData.discussionCategory,
      is_anonymous: formData.isAnonymous
    };

    await createDiscussion(discussionData);
    
    toast({
      title: "Discussion Created",
      description: "Your discussion has been posted successfully!",
    });
    
    navigate('/discussions');
  };

  const getSubmitButtonText = () => {
    switch (activeTab) {
      case 'post':
        return 'Publish Post';
      case 'event':
        return 'Create Event';
      case 'group':
        return 'Create Group';
      case 'discussion':
        return 'Post Discussion';
      default:
        return 'Create';
    }
  };

  const getSubmitIcon = () => {
    switch (activeTab) {
      case 'post':
        return <Edit3 className="w-4 h-4" />;
      case 'event':
        return <Calendar className="w-4 h-4" />;
      case 'group':
        return <Users className="w-4 h-4" />;
      case 'discussion':
        return <MessageCircle className="w-4 h-4" />;
      default:
        return <Plus className="w-4 h-4" />;
    }
  };

  return (
    <ResponsiveLayout>
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Plus className="w-8 h-8 text-blue-600" />
                Create Content
              </h1>
              <p className="text-gray-600 mt-2">
                Share your thoughts, organize events, create groups, or start discussions
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Card className="shadow-xl">
          <CardContent className="p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-gray-100">
                <TabsTrigger value="post" className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4" />
                  Post
                </TabsTrigger>
                <TabsTrigger value="event" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Event
                </TabsTrigger>
                <TabsTrigger value="group" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Group
                </TabsTrigger>
                <TabsTrigger value="discussion" className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Discussion
                </TabsTrigger>
              </TabsList>

              {/* Post Tab */}
              <TabsContent value="post" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="post-title">Title *</Label>
                    <Input
                      id="post-title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="What's on your mind?"
                      className="text-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="post-content">Content *</Label>
                    <Textarea
                      id="post-content"
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      placeholder="Share your thoughts..."
                      rows={6}
                      className="resize-none"
                    />
                  </div>

                  <div>
                    <Label>Tags</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag"
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      />
                      <Button type="button" onClick={addTag} variant="outline">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          {tag}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTag(tag)}
                            className="h-auto p-0 ml-1"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="private-post"
                        checked={formData.isPrivate}
                        onCheckedChange={(checked) => handleInputChange('isPrivate', checked)}
                      />
                      <Label htmlFor="private-post">Private Post</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="allow-comments"
                        checked={formData.allowComments}
                        onCheckedChange={(checked) => handleInputChange('allowComments', checked)}
                      />
                      <Label htmlFor="allow-comments">Allow Comments</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Event Tab */}
              <TabsContent value="event" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="event-title">Event Title *</Label>
                    <Input
                      id="event-title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="What's the event about?"
                    />
                  </div>

                  <div>
                    <Label htmlFor="event-description">Description *</Label>
                    <Textarea
                      id="event-description"
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      placeholder="Describe your event..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="event-date">Date *</Label>
                      <Input
                        id="event-date"
                        type="date"
                        value={formData.eventDate}
                        onChange={(e) => handleInputChange('eventDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="event-time">Time</Label>
                      <Input
                        id="event-time"
                        type="time"
                        value={formData.eventTime}
                        onChange={(e) => handleInputChange('eventTime', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location-name">Location Name *</Label>
                      <Input
                        id="location-name"
                        value={formData.locationName}
                        onChange={(e) => handleInputChange('locationName', e.target.value)}
                        placeholder="Venue name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location-address">Address</Label>
                      <Input
                        id="location-address"
                        value={formData.locationAddress}
                        onChange={(e) => handleInputChange('locationAddress', e.target.value)}
                        placeholder="Full address"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="event-category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="music">Music</SelectItem>
                          <SelectItem value="art">Art</SelectItem>
                          <SelectItem value="sports">Sports</SelectItem>
                          <SelectItem value="food">Food</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="max-attendees">Max Attendees</Label>
                      <Input
                        id="max-attendees"
                        type="number"
                        value={formData.maxAttendees}
                        onChange={(e) => handleInputChange('maxAttendees', e.target.value)}
                        placeholder="Unlimited"
                      />
                    </div>
                    <div>
                      <Label htmlFor="event-price">Price ($)</Label>
                      <Input
                        id="event-price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="recurring-event"
                      checked={formData.isRecurring}
                      onCheckedChange={(checked) => handleInputChange('isRecurring', checked)}
                    />
                    <Label htmlFor="recurring-event">Recurring Event</Label>
                  </div>

                  {formData.isRecurring && (
                    <div>
                      <Label htmlFor="recurring-pattern">Recurring Pattern</Label>
                      <Select value={formData.recurringPattern} onValueChange={(value) => handleInputChange('recurringPattern', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Group Tab */}
              <TabsContent value="group" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="group-name">Group Name *</Label>
                    <Input
                      id="group-name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="What should we call your group?"
                    />
                  </div>

                  <div>
                    <Label htmlFor="group-description">Description *</Label>
                    <Textarea
                      id="group-description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Tell people what your group is about..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="group-category">Category</Label>
                    <Select value={formData.groupCategory} onValueChange={(value) => handleInputChange('groupCategory', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Music">Music</SelectItem>
                        <SelectItem value="Art">Art</SelectItem>
                        <SelectItem value="Sports">Sports</SelectItem>
                        <SelectItem value="Food">Food</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="public-group"
                        checked={formData.isPublic}
                        onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                      />
                      <Label htmlFor="public-group">Public Group</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="allow-anonymous"
                        checked={formData.allowAnonymousPosts}
                        onCheckedChange={(checked) => handleInputChange('allowAnonymousPosts', checked)}
                      />
                      <Label htmlFor="allow-anonymous">Allow Anonymous Posts</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="require-approval"
                        checked={formData.requireApproval}
                        onCheckedChange={(checked) => handleInputChange('requireApproval', checked)}
                      />
                      <Label htmlFor="require-approval">Require Post Approval</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Discussion Tab */}
              <TabsContent value="discussion" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="discussion-title">Discussion Title *</Label>
                    <Input
                      id="discussion-title"
                      value={formData.discussionTitle}
                      onChange={(e) => handleInputChange('discussionTitle', e.target.value)}
                      placeholder="What do you want to discuss?"
                    />
                  </div>

                  <div>
                    <Label htmlFor="discussion-content">Content *</Label>
                    <Textarea
                      id="discussion-content"
                      value={formData.discussionContent}
                      onChange={(e) => handleInputChange('discussionContent', e.target.value)}
                      placeholder="Start the conversation..."
                      rows={6}
                    />
                  </div>

                  <div>
                    <Label htmlFor="discussion-group">Group *</Label>
                    <Select value={formData.groupId} onValueChange={(value) => handleInputChange('groupId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a group" />
                      </SelectTrigger>
                      <SelectContent>
                        {userGroups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="discussion-category">Category</Label>
                      <Select value={formData.discussionCategory} onValueChange={(value) => handleInputChange('discussionCategory', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="question">Question</SelectItem>
                          <SelectItem value="announcement">Announcement</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="anonymous-discussion"
                        checked={formData.isAnonymous}
                        onCheckedChange={(checked) => handleInputChange('isAnonymous', checked)}
                      />
                      <Label htmlFor="anonymous-discussion">Post Anonymously</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      {getSubmitIcon()}
                      {getSubmitButtonText()}
                    </>
                  )}
                </Button>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </ResponsiveLayout>
  );
};

export default ConsolidatedCreate;
