import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainLayout } from "@/components/MainLayout";
import { useState } from "react";
import { X, Plus, MapPin, Calendar, DollarSign, Users } from "lucide-react";

const CreatePost = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <MainLayout>
      <div className="container max-w-3xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Create New Post</h1>
          <p className="text-muted-foreground">Share with your local community</p>
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
                <div className="space-y-2">
                  <Label htmlFor="post-title">Title</Label>
                  <Input id="post-title" placeholder="What's on your mind?" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="post-content">Content</Label>
                  <Textarea 
                    id="post-content" 
                    placeholder="Share your thoughts, experiences, or updates..."
                    className="min-h-32"
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

                <Button className="w-full" size="lg">
                  Share Post
                </Button>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-title">Event Title</Label>
                    <Input id="event-title" placeholder="Amazing Event Name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="art">Art & Culture</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="food">Food & Drink</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="community">Community</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-description">Description</Label>
                  <Textarea 
                    id="event-description" 
                    placeholder="Describe your event..."
                    className="min-h-24"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-date">Date & Time</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="event-date" 
                        type="datetime-local"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="event-location" 
                        placeholder="Event venue"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-price">Ticket Price (Optional)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="event-price" 
                        placeholder="0.00"
                        type="number"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-capacity">Max Attendees</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="event-capacity" 
                        placeholder="50"
                        type="number"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <Button className="w-full" size="lg">
                  Create Event
                </Button>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="service-title">Service Title</Label>
                    <Input id="service-title" placeholder="What service do you offer?" />
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
                    placeholder="Describe your service, experience, and what you offer..."
                    className="min-h-24"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="service-price">Price Range</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="service-price" 
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
                      placeholder="Within 15km of current location"
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button className="w-full" size="lg">
                  List Service
                </Button>
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
                <div className="space-y-2">
                  <Label htmlFor="discussion-title">Discussion Topic</Label>
                  <Input id="discussion-title" placeholder="What would you like to discuss?" />
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
                    placeholder="Share your thoughts, ask questions, or provide context for the discussion..."
                    className="min-h-32"
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

                <Button className="w-full" size="lg">
                  Start Discussion
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default CreatePost;