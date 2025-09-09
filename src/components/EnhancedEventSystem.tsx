import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Plus,
  Edit,
  Trash2,
  Share2,
  MessageCircle,
  Heart,
  Star,
  Tag,
  Settings,
  CheckCircle,
  AlertCircle,
  UserPlus,
  UserMinus,
  MoreHorizontal
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
  start_time: string;
  end_time?: string;
  category: string;
  max_attendees?: number;
  current_attendees: number;
  is_public: boolean;
  is_featured: boolean;
  created_by: string;
  created_at: string;
  tags: string[];
  cover_image_url?: string;
  price: number;
  currency: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
}

interface EventDiscussion {
  id: string;
  event_id: string;
  user_id: string;
  content: string;
  created_at: string;
  is_anonymous: boolean;
  user?: {
    display_name: string;
    avatar_url?: string;
  };
  replies?: EventDiscussion[];
}

interface EventAttendee {
  id: string;
  user_id: string;
  event_id: string;
  status: 'attending' | 'maybe' | 'not_attending';
  joined_at: string;
  user: {
    display_name: string;
    avatar_url?: string;
  };
}

interface EnhancedEventSystemProps {
  eventId?: string;
  onEventCreated?: (event: Event) => void;
  onEventUpdated?: (event: Event) => void;
  className?: string;
}

export const EnhancedEventSystem: React.FC<EnhancedEventSystemProps> = ({
  eventId,
  onEventCreated,
  onEventUpdated,
  className = ''
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [discussions, setDiscussions] = useState<EventDiscussion[]>([]);
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  
  // Form state for creating/editing events
  const [isCreating, setIsCreating] = useState(!eventId);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    event_date: '',
    start_time: '',
    end_time: '',
    category: '',
    max_attendees: '',
    is_public: true,
    tags: [] as string[],
    price: 0,
    currency: 'INR'
  });

  // Discussion state
  const [newDiscussion, setNewDiscussion] = useState({
    content: '',
    is_anonymous: false
  });

  useEffect(() => {
    if (eventId) {
      loadEvent();
    }
  }, [eventId, loadEvent]);

  const loadEvent = useCallback(async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_attendees(
            id,
            user_id,
            status,
            joined_at,
            user:profiles!event_attendees_user_id_fkey(
              display_name,
              avatar_url
            )
          ),
          event_discussions(
            id,
            user_id,
            content,
            created_at,
            is_anonymous,
            user:profiles!event_discussions_user_id_fkey(
              display_name,
              avatar_url
            )
          )
        `)
        .eq('id', eventId)
        .single();

      if (error) throw error;

      if (data) {
        setEvent(data);
        setAttendees(data.event_attendees || []);
        setDiscussions(data.event_discussions || []);
      }
    } catch (error) {
      console.error('Error loading event:', error);
      toast({
        title: "Error",
        description: "Failed to load event data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [eventId, toast]);

  const handleCreateEvent = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Validate form data
      if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim()) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('events')
        .insert({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          event_date: formData.event_date,
          start_time: formData.start_time,
          end_time: formData.end_time || null,
          category: formData.category,
          max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
          is_public: formData.is_public,
          tags: formData.tags,
          price: formData.price,
          currency: formData.currency,
          created_by: user.id,
          status: 'published'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Event Created",
        description: "Your event has been created successfully",
      });

      setEvent(data);
      setIsCreating(false);
      onEventCreated?.(data);
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvent = async () => {
    if (!event || !user) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('events')
        .update({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          event_date: formData.event_date,
          start_time: formData.start_time,
          end_time: formData.end_time || null,
          category: formData.category,
          max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
          is_public: formData.is_public,
          tags: formData.tags,
          price: formData.price,
          currency: formData.currency
        })
        .eq('id', event.id);

      if (error) throw error;

      toast({
        title: "Event Updated",
        description: "Your event has been updated successfully",
      });

      setIsEditing(false);
      loadEvent();
      onEventUpdated?.(event);
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async (status: 'attending' | 'maybe' | 'not_attending') => {
    if (!event || !user) return;

    try {
      const { error } = await supabase
        .from('event_attendees')
        .upsert({
          event_id: event.id,
          user_id: user.id,
          status: status
        });

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `You are now marked as ${status}`,
      });

      loadEvent();
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast({
        title: "Error",
        description: "Failed to update attendance status",
        variant: "destructive",
      });
    }
  };

  const handleAddDiscussion = async () => {
    if (!event || !user || !newDiscussion.content.trim()) return;

    try {
      const { error } = await supabase
        .from('event_discussions')
        .insert({
          event_id: event.id,
          user_id: user.id,
          content: newDiscussion.content,
          is_anonymous: newDiscussion.is_anonymous
        });

      if (error) throw error;

      setNewDiscussion({ content: '', is_anonymous: false });
      loadEvent();
    } catch (error) {
      console.error('Error adding discussion:', error);
      toast({
        title: "Error",
        description: "Failed to add discussion",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'attending':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'maybe':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'not_attending':
        return <UserMinus className="h-4 w-4 text-red-500" />;
      default:
        return <UserPlus className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'attending':
        return 'Attending';
      case 'maybe':
        return 'Maybe';
      case 'not_attending':
        return 'Not Attending';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isCreating || isEditing) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {isCreating ? 'Create Event' : 'Edit Event'}
          </CardTitle>
          <CardDescription>
            {isCreating ? 'Create a new event for your community' : 'Update your event details'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="What's the event about?"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your event..."
                rows={4}
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Where is the event?"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="event_date">Date *</Label>
                <Input
                  id="event_date"
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="start_time">Start Time *</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Event Settings */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max_attendees">Max Attendees</Label>
                <Input
                  id="max_attendees"
                  type="number"
                  value={formData.max_attendees}
                  onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
                  placeholder="Leave empty for unlimited"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  placeholder="0 for free events"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_public"
                checked={formData.is_public}
                onCheckedChange={(checked) => setFormData({ ...formData, is_public: !!checked })}
                disabled={loading}
              />
              <Label htmlFor="is_public">Public event (visible to everyone)</Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={isCreating ? handleCreateEvent : handleUpdateEvent}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isCreating ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  {isCreating ? 'Create Event' : 'Update Event'}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreating(false);
                setIsEditing(false);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!event) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No event found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {event.title}
            </CardTitle>
            <CardDescription className="mt-2">
              {event.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {event.is_featured && (
              <Badge variant="default">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            <Badge variant={event.is_public ? "default" : "secondary"}>
              {event.is_public ? "Public" : "Private"}
            </Badge>
            {user?.id === event.created_by && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFormData({
                    title: event.title,
                    description: event.description,
                    location: event.location,
                    event_date: event.event_date,
                    start_time: event.start_time,
                    end_time: event.end_time || '',
                    category: event.category,
                    max_attendees: event.max_attendees?.toString() || '',
                    is_public: event.is_public,
                    tags: event.tags,
                    price: event.price,
                    currency: event.currency
                  });
                  setIsEditing(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="attendees">Attendees ({attendees.length})</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(event.event_date).toLocaleDateString()} at {event.start_time}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{event.current_attendees} attending</span>
                {event.max_attendees && <span>(max {event.max_attendees})</span>}
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span>{event.category}</span>
              </div>
            </div>

            {event.price > 0 && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Event Price</span>
                  <span className="text-lg font-bold">₹{event.price}</span>
                </div>
              </div>
            )}

            {event.tags.length > 0 && (
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Attendance Actions */}
            <div className="space-y-2">
              <Label>Your Attendance</Label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleJoinEvent('attending')}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Attending
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleJoinEvent('maybe')}
                  className="flex items-center gap-2"
                >
                  <AlertCircle className="h-4 w-4" />
                  Maybe
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleJoinEvent('not_attending')}
                  className="flex items-center gap-2"
                >
                  <UserMinus className="h-4 w-4" />
                  Not Attending
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="attendees" className="space-y-4">
            <div className="space-y-3">
              {attendees.map((attendee) => (
                <div key={attendee.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(attendee.status)}
                    <span className="text-sm font-medium">
                      {getStatusLabel(attendee.status)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{attendee.user.display_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(attendee.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {attendees.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No attendees yet</p>
                  <p className="text-sm">Be the first to join this event!</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="discussions" className="space-y-4">
            {/* Add Discussion */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Textarea
                    placeholder="Start a discussion about this event..."
                    value={newDiscussion.content}
                    onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                    rows={3}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="anonymous_discussion"
                        checked={newDiscussion.is_anonymous}
                        onCheckedChange={(checked) => setNewDiscussion({ ...newDiscussion, is_anonymous: !!checked })}
                      />
                      <Label htmlFor="anonymous_discussion" className="text-sm">
                        Post anonymously
                      </Label>
                    </div>
                    <Button onClick={handleAddDiscussion} size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Post
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Discussions */}
            <div className="space-y-4">
              {discussions.map((discussion) => (
                <Card key={discussion.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">
                            {discussion.is_anonymous ? 'Anonymous' : discussion.user?.display_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(discussion.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{discussion.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {discussions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No discussions yet</p>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnhancedEventSystem;
