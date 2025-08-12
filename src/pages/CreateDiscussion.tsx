import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { MainLayout } from "@/components/MainLayout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const CreateDiscussion = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    groupId: "",
    category: "general"
  });

  useEffect(() => {
    const fetchUserGroups = async () => {
      if (!user) return;

      try {
        const { data: memberGroups, error } = await supabase
          .from('groups')
          .select(`
            id,
            name,
            description,
            category,
            group_members!inner (role)
          `)
          .eq('group_members.user_id', user.id);

        if (error) throw error;
        setUserGroups(memberGroups || []);
      } catch (error) {
        console.error('Error fetching user groups:', error);
      }
    };

    fetchUserGroups();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.title.trim() || !formData.content.trim() || !formData.groupId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Create the discussion as a group message
      const { error } = await supabase
        .from('group_messages')
        .insert({
          group_id: formData.groupId,
          user_id: user.id,
          content: `**${formData.title}**\n\n${formData.content}`
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your discussion has been started.",
      });

      navigate("/community");
    } catch (error) {
      console.error('Error creating discussion:', error);
      toast({
        title: "Error",
        description: "Failed to create discussion. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <MainLayout>
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
              <MessageCircle className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Start a Discussion</CardTitle>
            </div>
            <CardDescription>
              Share your thoughts and engage with your community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="group">Group *</Label>
                <Select value={formData.groupId} onValueChange={(value) => handleInputChange("groupId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a group to post in" />
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

              <div className="space-y-2">
                <Label htmlFor="title">Discussion Title *</Label>
                <Input
                  id="title"
                  placeholder="What would you like to discuss?"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Description *</Label>
                <Textarea
                  id="content"
                  placeholder="Provide more details about your discussion..."
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="question">Question</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="recommendation">Recommendation</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                  </SelectContent>
                </Select>
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
                  disabled={loading || !formData.title.trim() || !formData.content.trim() || !formData.groupId}
                  className="flex-1"
                >
                  {loading ? "Creating..." : "Start Discussion"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CreateDiscussion;