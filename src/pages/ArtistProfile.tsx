import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Calendar, MessageCircle, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useFollows } from "@/hooks/useFollows";
import { sanitizeText } from "@/lib/sanitize";

type Profile = {
  user_id: string;
  display_name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  location_city: string | null;
  location_state: string | null;
  location_country: string | null;
  artist_skills: string[] | null;
  hourly_rate_min: number | null;
  hourly_rate_max: number | null;
  portfolio_urls: string[] | null;
};

const ArtistProfile = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const artistUserId = useMemo(() => (params as any)?.id as string, [params]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [discussionOpen, setDiscussionOpen] = useState(false);
  const [booking, setBooking] = useState({ title: "", details: "", date: "", location: "" });
  const [discussion, setDiscussion] = useState({ title: "", content: "" });
  const { isFollowing, follow, unfollow, loading: followLoading } = useFollows(artistUserId);

  useEffect(() => {
    const load = async () => {
      if (!artistUserId) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', artistUserId)
          .maybeSingle();
        if (error) throw error;
        setProfile(data as any);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [artistUserId]);

  const requestBooking = async () => {
    if (!user) {
      navigate('/signin');
      return;
    }
    if (!artistUserId || !booking.title || !booking.date) {
      toast({ title: 'Missing info', description: 'Please add a title and date.' });
      return;
    }
    try {
      const sanitizedTitle = sanitizeText(booking.title, 120);
      const sanitizedDetails = sanitizeText(booking.details, 3000);
      const sanitizedLocation = sanitizeText(booking.location, 200);
      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        type: 'post',
        title: sanitizedTitle,
        content: sanitizedDetails,
        event_date: new Date(booking.date).toISOString(),
        event_location: sanitizedLocation,
        tags: ['booking', 'artist']
      });
      if (error) throw error;
      await supabase.from('notifications').insert({
        user_id: artistUserId,
        type: 'booking_request',
        title: 'New booking request',
        message: `${profile?.display_name || 'You'} received a booking request: ${sanitizedTitle}`,
        data: { from_user_id: user.id }
      });
      toast({ title: 'Request sent', description: 'The artist has been notified.' });
      setBookingOpen(false);
      setBooking({ title: '', details: '', date: '', location: '' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const submitDiscussionRequest = async () => {
    if (!user) {
      navigate('/signin');
      return;
    }
    if (!artistUserId || !discussion.title || !discussion.content) {
      toast({ title: 'Missing info', description: 'Please add a title and content.' });
      return;
    }
    try {
      const sanitizedTitle = sanitizeText(discussion.title, 120);
      const sanitizedContent = sanitizeText(discussion.content, 5000);
      const { error } = await (supabase as any).from('artist_discussion_requests').insert({
        artist_user_id: artistUserId,
        requester_user_id: user.id,
        title: sanitizedTitle,
        content: sanitizedContent,
      });
      if (error) throw error;
      await supabase.from('notifications').insert({
        user_id: artistUserId,
        type: 'discussion_request',
        title: 'New discussion request',
        message: `A user requested to start a discussion: ${sanitizedTitle}`,
        data: { requester_user_id: user.id }
      });
      toast({ title: 'Request sent', description: 'Awaiting artist approval.' });
      setDiscussionOpen(false);
      setDiscussion({ title: '', content: '' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="text-center text-muted-foreground py-20">Artist not found.</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback>{(profile.display_name || profile.username || 'U').substring(0,1).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-semibold">{profile.display_name || profile.username}</h1>
              <div className="flex flex-wrap gap-2 mt-1">
                {profile.artist_skills?.slice(0, 5).map((s) => (
                  <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={followLoading} onClick={isFollowing ? unfollow : follow}>
              {isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
            <Button onClick={() => setBookingOpen(true)}>Book</Button>
            <Button variant="secondary" onClick={() => setDiscussionOpen(true)}>Start Discussion</Button>
          </div>
        </div>

        <Tabs defaultValue="about">
          <TabsList>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          </TabsList>
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{profile.bio}</p>
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Users className="h-4 w-4" />{profile.location_city}, {profile.location_state}</div>
                  <div className="flex items-center gap-2"><Calendar className="h-4 w-4" />Hourly: {profile.hourly_rate_min ?? '-'} - {profile.hourly_rate_max ?? '-'}</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="portfolio">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(profile.portfolio_urls || []).map((url) => (
                    <a key={url} href={url} target="_blank" rel="noreferrer" className="block p-3 border rounded hover:bg-muted/50 truncate">{url}</a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {bookingOpen && (
          <Card>
            <CardHeader>
              <CardTitle>Book {profile.display_name || profile.username}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Title" value={booking.title} onChange={(e) => setBooking({ ...booking, title: e.target.value })} />
              <Input type="date" value={booking.date} onChange={(e) => setBooking({ ...booking, date: e.target.value })} />
              <Input placeholder="Location" value={booking.location} onChange={(e) => setBooking({ ...booking, location: e.target.value })} />
              <Textarea placeholder="Details" value={booking.details} onChange={(e) => setBooking({ ...booking, details: e.target.value })} />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setBookingOpen(false)}><X className="h-4 w-4 mr-1"/>Cancel</Button>
                <Button onClick={requestBooking}><Check className="h-4 w-4 mr-1"/>Send booking request</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {discussionOpen && (
          <Card>
            <CardHeader>
              <CardTitle>Request to start a discussion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Title" value={discussion.title} onChange={(e) => setDiscussion({ ...discussion, title: e.target.value })} />
              <Textarea placeholder="What would you like to discuss?" value={discussion.content} onChange={(e) => setDiscussion({ ...discussion, content: e.target.value })} />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setDiscussionOpen(false)}><X className="h-4 w-4 mr-1"/>Cancel</Button>
                <Button onClick={submitDiscussionRequest}><MessageCircle className="h-4 w-4 mr-1"/>Submit request</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default ArtistProfile;

