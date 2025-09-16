import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { CalendarIcon, Clock, MapPin, Users, DollarSign, Tag } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { GovernmentAuthorityTagging } from "@/components/GovernmentAuthorityTagging";
import { useAuth } from "@/hooks/useAuth";

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createEvent } = useEvents();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    event_time: "",
    location_name: "",
    category: "",
    max_attendees: "",
    price: "",
    image_url: "",
    tags: "",
  });
  const [selectedAuthorities, setSelectedAuthorities] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/signin');
      return;
    }
    
    setLoading(true);
    
    const eventData = {
      title: formData.title,
      description: formData.description,
      event_date: formData.event_date,
      event_time: formData.event_time,
      location_name: formData.location_name,
      category: formData.category || undefined,
      max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : undefined,
      price: formData.price ? parseFloat(formData.price) : 0,
      image_url: formData.image_url || undefined,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : undefined,
      government_authority_id: selectedAuthorities.length > 0 ? selectedAuthorities[0] : undefined,
      target_authority: selectedAuthorities.length > 0 ? selectedAuthorities : undefined,
    };
    
    const success = await createEvent(eventData);
    
    if (success) {
      navigate('/events');
    }
    
    setLoading(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const categories = [
    "Art & Culture",
    "Music",
    "Food & Drink",
    "Sports & Fitness",
    "Technology",
    "Business",
    "Education",
    "Health & Wellness",
    "Community",
    "Entertainment",
    "Other"
  ];

  return (
    <ResponsiveLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Create Event</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Enter event title"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Describe your event"
                    rows={3}
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="event_date" className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Date *
                  </Label>
                  <Input
                    id="event_date"
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => handleChange('event_date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="event_time" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Time *
                  </Label>
                  <Input
                    id="event_time"
                    type="time"
                    value={formData.event_time}
                    onChange={(e) => handleChange('event_time', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="location_name" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location *
                </Label>
                <Input
                  id="location_name"
                  value={formData.location_name}
                  onChange={(e) => handleChange('location_name', e.target.value)}
                  placeholder="Event venue or address"
                  required
                />
              </div>

              {/* Category & Attendees */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="max_attendees" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Max Attendees
                  </Label>
                  <Input
                    id="max_attendees"
                    type="number"
                    value={formData.max_attendees}
                    onChange={(e) => handleChange('max_attendees', e.target.value)}
                    placeholder="Optional"
                    min="1"
                  />
                </div>
              </div>

              {/* Price & Image */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Price (USD)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    placeholder="0 for free events"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => handleChange('image_url', e.target.value)}
                    placeholder="Optional event image"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label htmlFor="tags" className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleChange('tags', e.target.value)}
                  placeholder="photography, outdoor, beginner (comma separated)"
                />
              </div>

              {/* Government Authority Tagging */}
              <GovernmentAuthorityTagging
                selectedAuthorities={selectedAuthorities}
                onAuthoritiesChange={setSelectedAuthorities}
                compact={true}
                showContactInfo={false}
              />

              {/* Actions */}
              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Creating..." : "Create Event"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/events')}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ResponsiveLayout>
  );
};

export default CreateEvent;
