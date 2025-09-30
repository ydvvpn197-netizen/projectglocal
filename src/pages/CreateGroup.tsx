/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Please use ConsolidatedCreate.tsx instead.
 * Category: create
 * 
 * This page has been consolidated to provide a better, more consistent user experience.
 * All functionality from this page is available in the consolidated version.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Users } from "lucide-react";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "@/hooks/useLocation";
import { communityService } from "@/services/communityService";
import { CreateGroupRequest } from "@/types/community";

const CreateGroup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentLocation } = useLocation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateGroupRequest>({
    name: "",
    description: "",
    category: "General",
    is_public: true,
    allow_anonymous_posts: false,
    require_approval: false
  });

  const categories = [
    "Photography",
    "Food",
    "Outdoor",
    "Art",
    "Music",
    "Sports", 
    "Technology",
    "Business",
    "Health",
    "Education",
    "Gaming",
    "Travel",
    "Books",
    "Movies",
    "General"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.name.trim() || !formData.description.trim() || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Prepare group data with location information
      const groupData: CreateGroupRequest = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        latitude: currentLocation?.latitude,
        longitude: currentLocation?.longitude,
        location_city: (currentLocation as Record<string, unknown>)?.city || '',
        location_state: (currentLocation as Record<string, unknown>)?.state || '',
        location_country: (currentLocation as Record<string, unknown>)?.country || ''
      };

      // Create the group using CommunityService
      const newGroup = await communityService.createGroup(groupData);

      if (newGroup) {
        toast({
          title: "Success!",
          description: "Your community has been created successfully.",
        });

        // Navigate back to community page
        navigate("/community");
      } else {
        throw new Error("Failed to create community");
      }
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error",
        description: "Failed to create community. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateGroupRequest, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ResponsiveLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/community")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Community
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Create a Community</CardTitle>
            </div>
            <CardDescription>
              Start a new community group to connect with like-minded people in your area
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Community Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter community name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  maxLength={50}
                />
                <p className="text-sm text-muted-foreground">
                  {formData.name.length}/50 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what your community is about..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                  maxLength={500}
                />
                <p className="text-sm text-muted-foreground">
                  {formData.description.length}/500 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
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

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_public"
                    checked={formData.is_public}
                    onCheckedChange={(checked) => handleInputChange("is_public", checked)}
                  />
                  <Label htmlFor="is_public" className="text-sm">
                    Public Community
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  Public communities are visible to everyone and anyone can join
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allow_anonymous_posts"
                    checked={formData.allow_anonymous_posts}
                    onCheckedChange={(checked) => handleInputChange("allow_anonymous_posts", checked)}
                  />
                  <Label htmlFor="allow_anonymous_posts" className="text-sm">
                    Allow Anonymous Posts
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  Members can post anonymously in this community
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="require_approval"
                    checked={formData.require_approval}
                    onCheckedChange={(checked) => handleInputChange("require_approval", checked)}
                  />
                  <Label htmlFor="require_approval" className="text-sm">
                    Require Post Approval
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  Posts must be approved by moderators before appearing
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Community Visibility</h3>
                <p className="text-sm text-muted-foreground">
                  Your community will be visible to people in your local area based on their location settings. 
                  This helps create relevant local communities.
                </p>
                {currentLocation && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Location: {currentLocation.city}, {currentLocation.state}
                  </p>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/community")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || !formData.name.trim() || !formData.description.trim() || !formData.category}
                  className="flex-1"
                >
                  {loading ? "Creating..." : "Create Community"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ResponsiveLayout>
  );
};

export default CreateGroup;
