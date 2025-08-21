import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainLayout } from "@/components/MainLayout";
import { EngagementFeatures } from "@/components/EngagementFeatures";
import { ReferralProgram } from "@/components/marketing/ReferralProgram";
import { sanitizeText } from "@/lib/sanitize";
import { useAuth } from "@/hooks/useAuth";
import { useFollows } from "@/hooks/useFollows";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, MapPin, Calendar, Edit, Camera, MessageCircle, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url?: string;
  location_city: string;
  location_state: string;
  location_country: string;
  is_verified: boolean;
  created_at: string;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    display_name: "",
    username: "",
    bio: "",
    location_city: "",
    location_state: "",
    location_country: "",
    avatar_url: ""
  });

  // Get followers and following counts
  const { followersCount, followingCount } = useFollows(user?.id);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setProfile(data);
        setFormData({
          display_name: data.display_name || "",
          username: data.username || "",
          bio: data.bio || "",
          location_city: data.location_city || "",
          location_state: data.location_state || "",
          location_country: data.location_country || "",
          avatar_url: data.avatar_url || ""
        });
      } else {
        // No profile exists, set empty form data
        setProfile(null);
        setFormData({
          display_name: "",
          username: "",
          bio: "",
          location_city: "",
          location_state: "",
          location_country: "",
          avatar_url: ""
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      // Sanitize form data before saving
      const sanitizedData = {
        display_name: sanitizeText(formData.display_name || '', 100),
        username: sanitizeText(formData.username || '', 50),
        bio: sanitizeText(formData.bio || '', 1000),
        location_city: sanitizeText(formData.location_city || '', 100),
        location_state: sanitizeText(formData.location_state || '', 100),
        location_country: sanitizeText(formData.location_country || '', 100),
        avatar_url: formData.avatar_url
      };

      // Use upsert with proper conflict resolution
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          ...sanitizedData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });

      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    }
  };

  const handleMessageUser = async () => {
    if (!user || !profile) return;

    try {
      // Find existing conversation between these two users (not closed)
      const { data: existing1 } = await supabase
        .from('chat_conversations')
        .select('id, status, client_id, artist_id')
        .eq('client_id', user.id)
        .eq('artist_id', profile.user_id)
        .not('status', 'eq', 'closed')
        .maybeSingle();

      const { data: existing2 } = await supabase
        .from('chat_conversations')
        .select('id, status, client_id, artist_id')
        .eq('client_id', profile.user_id)
        .eq('artist_id', user.id)
        .not('status', 'eq', 'closed')
        .maybeSingle();

      const existing = existing1 || existing2;

      let conversationId = existing?.id;

      if (!conversationId) {
        const { data: created, error: createErr } = await supabase
          .from('chat_conversations')
          .insert({
            booking_id: null,
            client_id: user.id,
            artist_id: profile.user_id,
            status: 'pending'
          })
          .select()
          .single();
        if (createErr) throw createErr;
        conversationId = created.id;
      }

      navigate(`/chat/${conversationId}`);
    } catch (err) {
      console.error('Error starting chat:', err);
      toast({
        title: "Error",
        description: "Failed to start chat.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Profile</h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="referrals">Referrals</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Profile Information</CardTitle>
                      <div className="flex items-center gap-2">
                        {user && profile && user.id !== profile.user_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleMessageUser}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditing(!editing)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {editing ? "Cancel" : "Edit"}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Profile Picture */}
                    <div className="flex items-center gap-4">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback>
                          {profile?.display_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">
                            {profile?.display_name || "Set your display name"}
                          </h3>
                          {profile?.is_verified && (
                            <Badge variant="secondary">Verified</Badge>
                          )}
                        </div>
                        <Button variant="outline" size="sm">
                          <Camera className="h-4 w-4 mr-2" />
                          Change Photo
                        </Button>
                      </div>
                    </div>

                    {editing ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="display_name">Display Name</Label>
                          <Input
                            id="display_name"
                            value={formData.display_name}
                            onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                            placeholder="Your display name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            value={formData.bio}
                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                            placeholder="Tell us about yourself..."
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="location_city">City</Label>
                            <Input
                              id="location_city"
                              value={formData.location_city}
                              onChange={(e) => setFormData({...formData, location_city: e.target.value})}
                              placeholder="City"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="location_state">State</Label>
                            <Input
                              id="location_state"
                              value={formData.location_state}
                              onChange={(e) => setFormData({...formData, location_state: e.target.value})}
                              placeholder="State"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="location_country">Country</Label>
                            <Input
                              id="location_country"
                              value={formData.location_country}
                              onChange={(e) => setFormData({...formData, location_country: e.target.value})}
                              placeholder="Country"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={handleUpdateProfile}>
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={() => setEditing(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm text-muted-foreground">Bio</Label>
                          <p className="mt-1">
                            {profile?.bio || "No bio added yet."}
                          </p>
                        </div>

                        <div>
                          <Label className="text-sm text-muted-foreground">Location</Label>
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {profile?.location_city && profile?.location_state
                                ? `${profile.location_city}, ${profile.location_state}`
                                : "Location not set"}
                            </span>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm text-muted-foreground">Member Since</Label>
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {profile?.created_at 
                                ? new Date(profile.created_at).toLocaleDateString()
                                : "Unknown"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">{followersCount}</span> followers
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">{followingCount}</span> following
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="referrals" className="space-y-6">
                <ReferralProgram />
              </TabsContent>
            </Tabs>
          </div>

          {/* Engagement Features Sidebar */}
          <div className="space-y-6">
            <EngagementFeatures />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;