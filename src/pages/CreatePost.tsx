import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { useState } from "react";
import { X, Plus, MapPin, Calendar, DollarSign, Users, Clock, Tag, ArrowLeft, Edit3 } from "lucide-react";
import { usePosts } from "@/hooks/usePosts";
import { useEvents } from "@/hooks/useEvents";
import { useNavigate } from "react-router-dom";
import { sanitizeText, sanitizeHtml, sanitizeTags } from "@/lib/sanitize";

const CreatePost = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { createPost } = usePosts();
  const { createEvent } = useEvents();
  const navigate = useNavigate();

  const addTag = () => {
    const sanitizedTag = sanitizeText(newTag, 50);
    if (sanitizedTag && !tags.includes(sanitizedTag)) {
      setTags([...tags, sanitizedTag]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleCreatePost = async (e: React.FormEvent, type: 'post' | 'event' | 'service' | 'discussion') => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    setLoading(true);
    try {
      if (type === 'event') {
        // Handle event creation separately using the events hook
        const eventData = {
          title: sanitizeText(formData.get('title') as string || '', 200),
          description: sanitizeText(formData.get('content') as string || '', 5000),
          event_date: formData.get('event_date') as string,
          event_time: formData.get('event_time') as string,
          location_name: sanitizeText(formData.get('location_name') as string || '', 500),
          category: formData.get('category') as string || undefined,
          max_attendees: formData.get('max_attendees') ? parseInt(formData.get('max_attendees') as string) : undefined,
          price: formData.get('price') ? parseFloat(formData.get('price') as string) : 0,
          image_url: formData.get('image_url') as string || undefined,
          tags: formData.get('tags') ? (formData.get('tags') as string).split(',').map(tag => tag.trim()) : undefined,
        };
        
        const success = await createEvent(eventData);
        if (success) {
          navigate('/events');
        }
      } else {
        // Handle other post types
        const postData = {
          type,
          title: sanitizeText(formData.get('title') as string || '', 200),
          content: sanitizeText(formData.get('content') as string || '', 5000),
          event_date: formData.get('eventDate') ? new Date(formData.get('eventDate') as string).toISOString() : undefined,
          event_location: sanitizeText((formData.get('eventLocation') as string || formData.get('serviceArea') as string) || '', 500),
          price_range: sanitizeText((formData.get('eventPrice') as string || formData.get('servicePrice') as string) || '', 100),
          tags: tags.length > 0 ? sanitizeTags(tags) : undefined
        };

        const { error } = await createPost(postData);
        if (!error) {
          navigate('/feed');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResponsiveLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <Edit3 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Create New Post</h1>
          </div>
          <p className="text-gray-600">
            Share with your local community
          </p>
        </div>

        <Tabs defaultValue="post" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="post">Post</TabsTrigger>
            <TabsTrigger value="event">Event</TabsTrigger>
            <TabsTrigger value="service">Service</TabsTrigger>
            <TabsTrigger value="discussion">Discussion</TabsTrigger>
          </TabsList>

          {/* Regular Post */}
          <TabsContent value="post">
            <Card>
              <CardHeader>
                <CardTitle>Share Your Thoughts</CardTitle>
                <CardDescription>
                  Post updates, photos, or thoughts with your local community
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={(e) => handleCreatePost(e, 'post')} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="post-title">Title</Label>
                    <Input 
                      id="post-title" 
                      name="title"
                      placeholder="What's on your mind?" 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="post-content">Content</Label>
                    <Textarea 
                      id="post-content" 
                      name="content"
                      placeholder="Share your thoughts, experiences, or updates..."
                      className="min-h-32"
                      required
                    />
                  </div>

                <div className="space-y-2">
                  <Label htmlFor="post-location">Location (Optional)</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="post-location" 
                      placeholder="Add a location"
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-4">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    />
                    <Button onClick={addTag} size="icon" variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button onClick={() => removeTag(tag)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Privacy */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-1">
                    <Label>Privacy Setting</Label>
                    <p className="text-sm text-muted-foreground">
                      {isPrivate ? "Only followers can see this post" : "Public to local community"}
                    </p>
                  </div>
                  <Switch
                    checked={isPrivate}
                    onCheckedChange={setIsPrivate}
                  />
                </div>

                  <Button 
                    className="w-full" 
                    size="lg" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Share Post"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Event */}
          <TabsContent value="event">
            <Card>
              <CardHeader>
                <CardTitle>Create Event</CardTitle>
                <CardDescription>
                  Organize local events and gatherings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={(e) => handleCreatePost(e, 'event')} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-title">Event Title *</Label>
                      <Input 
                        id="event-title" 
                        name="title"
                        placeholder="Enter event title" 
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event-category">Category</Label>
                      <Select name="category">
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Art & Culture">Art & Culture</SelectItem>
                          <SelectItem value="Music">Music</SelectItem>
                          <SelectItem value="Food & Drink">Food & Drink</SelectItem>
                          <SelectItem value="Sports & Fitness">Sports & Fitness</SelectItem>
                          <SelectItem value="Technology">Technology</SelectItem>
                          <SelectItem value="Business">Business</SelectItem>
                          <SelectItem value="Education">Education</SelectItem>
                          <SelectItem value="Health & Wellness">Health & Wellness</SelectItem>
                          <SelectItem value="Community">Community</SelectItem>
                          <SelectItem value="Entertainment">Entertainment</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-description">Description</Label>
                    <Textarea 
                      id="event-description"
                      name="content"
                      placeholder="Describe your event..."
                      className="min-h-24"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-date" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Date *
                      </Label>
                      <Input 
                        id="event-date"
                        name="event_date"
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event-time" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Time *
                      </Label>
                      <Input 
                        id="event-time"
                        name="event_time"
                        type="time"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-location" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location *
                    </Label>
                    <Input 
                      id="event-location"
                      name="location_name"
                      placeholder="Event venue or address"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-price" className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Price (USD)
                      </Label>
                      <Input 
                        id="event-price"
                        name="price"
                        placeholder="0 for free events"
                        type="number"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event-capacity" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Max Attendees
                      </Label>
                      <Input 
                        id="event-capacity" 
                        name="max_attendees"
                        placeholder="Optional"
                        type="number"
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-image">Image URL</Label>
                      <Input 
                        id="event-image"
                        name="image_url"
                        type="url"
                        placeholder="Optional event image"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event-tags" className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Tags
                      </Label>
                      <Input 
                        id="event-tags"
                        name="tags"
                        placeholder="photography, outdoor, beginner (comma separated)"
                      />
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Event"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Service */}
          <TabsContent value="service">
            <Card>
              <CardHeader>
                <CardTitle>Offer a Service</CardTitle>
                <CardDescription>
                  Share your skills and services with the local community
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={(e) => handleCreatePost(e, 'service')} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="service-title">Service Title</Label>
                      <Input 
                        id="service-title" 
                        name="title"
                        placeholder="What service do you offer?" 
                        required
                      />
                    </div>
                  <div className="space-y-2">
                    <Label htmlFor="service-category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="photography">Photography</SelectItem>
                        <SelectItem value="music">Music & Performance</SelectItem>
                        <SelectItem value="design">Design & Art</SelectItem>
                        <SelectItem value="fitness">Fitness & Wellness</SelectItem>
                        <SelectItem value="education">Education & Tutoring</SelectItem>
                        <SelectItem value="handyman">Home & Repair</SelectItem>
                        <SelectItem value="beauty">Beauty & Style</SelectItem>
                        <SelectItem value="tech">Technology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="service-description">Description</Label>
                    <Textarea 
                      id="service-description"
                      name="content"
                      placeholder="Describe your service, experience, and what you offer..."
                      className="min-h-24"
                      required
                    />
                  </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="service-price">Price Range</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="service-price"
                        name="servicePrice"
                        placeholder="50 - 150"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service-availability">Availability</Label>
                    <Select>
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
                      name="serviceArea"
                      placeholder="Within 15km of current location"
                      className="pl-10"
                    />
                  </div>
                </div>

                  <Button 
                    className="w-full" 
                    size="lg" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "List Service"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Discussion */}
          <TabsContent value="discussion">
            <Card>
              <CardHeader>
                <CardTitle>Start a Discussion</CardTitle>
                <CardDescription>
                  Create a topic for community discussion and engagement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={(e) => handleCreatePost(e, 'discussion')} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="discussion-title">Discussion Topic</Label>
                    <Input 
                      id="discussion-title" 
                      name="title"
                      placeholder="What would you like to discuss?" 
                      required
                    />
                  </div>

                <div className="space-y-2">
                  <Label htmlFor="discussion-category">Category</Label>
                  <Select>
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
                    <Label htmlFor="discussion-content">Discussion Starter</Label>
                    <Textarea 
                      id="discussion-content"
                      name="content"
                      placeholder="Share your thoughts, ask questions, or provide context for the discussion..."
                      className="min-h-32"
                      required
                    />
                  </div>

                <div className="space-y-2">
                  <Label htmlFor="discussion-rules">Discussion Guidelines (Optional)</Label>
                  <Textarea 
                    id="discussion-rules" 
                    placeholder="Set any specific guidelines or rules for this discussion..."
                    className="min-h-20"
                  />
                </div>

                  <Button 
                    className="w-full" 
                    size="lg" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Start Discussion"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveLayout>
  );
};

export default CreatePost;
