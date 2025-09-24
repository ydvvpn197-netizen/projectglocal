import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { communityService, ArtistPortfolio, LocalEvent } from '@/services/communityService';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  MapPin, 
  Calendar, 
  Star, 
  Users, 
  Heart, 
  Share2, 
  MessageSquare,
  Plus,
  Settings,
  ExternalLink,
  Phone,
  Mail,
  Globe,
  Camera,
  Music,
  Palette,
  Code,
  BookOpen,
  Briefcase
} from 'lucide-react';

interface ArtistProfileProps {
  artistId: string;
  artist: {
    id: string;
    display_name: string;
    bio?: string;
    avatar_url?: string;
    location_city?: string;
    location_state?: string;
    location_country?: string;
    artist_skills?: string[];
    hourly_rate_min?: number;
    hourly_rate_max?: number;
    website_url?: string;
    phone_number?: string;
    is_premium?: boolean;
    is_verified?: boolean;
  };
  isOwnProfile?: boolean;
  className?: string;
}

export function ArtistProfile({
  artistId,
  artist,
  isOwnProfile = false,
  className = ''
}: ArtistProfileProps) {
  const { toast } = useToast();
  const [portfolio, setPortfolio] = useState<ArtistPortfolio[]>([]);
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('portfolio');

  useEffect(() => {
    loadArtistData();
  }, [artistId, loadArtistData]);

  const loadArtistData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load portfolio
      const portfolioData = await loadPortfolio();
      setPortfolio(portfolioData);

      // Load events
      const eventsData = await loadEvents();
      setEvents(eventsData);

      // Check follow status
      const followStatus = await communityService.isFollowingArtist(artistId);
      setIsFollowing(followStatus);

      // Load follower count
      const followers = await communityService.getArtistFollowers(artistId);
      setFollowerCount(followers.length);
    } catch (error) {
      console.error('Error loading artist data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [artistId, loadEvents, loadPortfolio]);

  const loadPortfolio = useCallback(async (): Promise<ArtistPortfolio[]> => {
    try {
      const { data, error } = await supabase
        .from('artist_portfolio')
        .select('*')
        .eq('artist_id', artistId)
        .eq('is_public', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading portfolio:', error);
      return [];
    }
  }, [artistId]);

  const loadEvents = useCallback(async (): Promise<LocalEvent[]> => {
    try {
      const { data, error } = await supabase
        .from('local_events')
        .select('*')
        .eq('organizer_id', artistId)
        .eq('is_public', true)
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading events:', error);
      return [];
    }
  }, [artistId]);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await communityService.unfollowArtist(artistId);
        setIsFollowing(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
        toast({
          title: 'Unfollowed',
          description: `You've unfollowed ${artist.display_name}.`,
        });
      } else {
        await communityService.followArtist(artistId);
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
        toast({
          title: 'Following',
          description: `You're now following ${artist.display_name}.`,
        });
      }
    } catch (error) {
      console.error('Error following/unfollowing artist:', error);
      toast({
        title: 'Error',
        description: 'Failed to update follow status. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const getSkillIcon = (skill: string) => {
    const skillLower = skill.toLowerCase();
    if (skillLower.includes('photo') || skillLower.includes('camera')) return Camera;
    if (skillLower.includes('music') || skillLower.includes('audio')) return Music;
    if (skillLower.includes('art') || skillLower.includes('design') || skillLower.includes('paint')) return Palette;
    if (skillLower.includes('code') || skillLower.includes('programming') || skillLower.includes('development')) return Code;
    if (skillLower.includes('write') || skillLower.includes('content') || skillLower.includes('blog')) return BookOpen;
    if (skillLower.includes('business') || skillLower.includes('consulting')) return Briefcase;
    return User;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Profile Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                  {artist.avatar_url ? (
                    <img src={artist.avatar_url} alt={artist.display_name} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(artist.display_name)
                  )}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center md:text-left">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{artist.display_name}</h1>
                  {artist.is_verified && (
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Verified
                    </Badge>
                  )}
                  {artist.is_premium && (
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      Premium
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{followerCount} followers</span>
                  </div>
                  {artist.location_city && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{artist.location_city}, {artist.location_state}</span>
                    </div>
                  )}
                </div>

                {artist.bio && (
                  <p className="text-muted-foreground mb-4 max-w-md">
                    {artist.bio}
                  </p>
                )}

                {/* Skills */}
                {artist.artist_skills && artist.artist_skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {artist.artist_skills.map((skill, index) => {
                      const Icon = getSkillIcon(skill);
                      return (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          <Icon className="h-3 w-3" />
                          {skill}
                        </Badge>
                      );
                    })}
                  </div>
                )}

                {/* Pricing */}
                {artist.hourly_rate_min && artist.hourly_rate_max && (
                  <div className="text-sm text-muted-foreground mb-4">
                    <span className="font-medium">Hourly Rate:</span> ₹{artist.hourly_rate_min} - ₹{artist.hourly_rate_max}
                  </div>
                )}

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 text-sm">
                  {artist.website_url && (
                    <a
                      href={artist.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <Globe className="h-4 w-4" />
                      Website
                    </a>
                  )}
                  {artist.phone_number && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {artist.phone_number}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-end">
              <div className="flex gap-2 mb-4">
                {!isOwnProfile && (
                  <Button
                    onClick={handleFollow}
                    variant={isFollowing ? "outline" : "default"}
                    className="flex-1 md:flex-none"
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                {isOwnProfile && (
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{portfolio.length}</div>
                  <div className="text-sm text-muted-foreground">Portfolio Items</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{events.length}</div>
                  <div className="text-sm text-muted-foreground">Events</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{followerCount}</div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="mt-6">
          <div className="space-y-4">
            {isOwnProfile && (
              <Card>
                <CardContent className="p-6 text-center">
                  <Plus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Add to Portfolio</h3>
                  <p className="text-muted-foreground mb-4">
                    Showcase your work and attract more clients.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Portfolio Item
                  </Button>
                </CardContent>
              </Card>
            )}

            {portfolio.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No portfolio items yet</h3>
                  <p className="text-muted-foreground">
                    {isOwnProfile 
                      ? 'Start building your portfolio to showcase your work.'
                      : 'This artist hasn\'t added any portfolio items yet.'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {portfolio.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    {item.media_urls[0] && (
                      <div className="aspect-video bg-muted">
                        <img
                          src={item.media_urls[0]}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Heart className="h-4 w-4" />
                          <span>{item.like_count}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <div className="space-y-4">
            {isOwnProfile && (
              <Card>
                <CardContent className="p-6 text-center">
                  <Plus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Create Event</h3>
                  <p className="text-muted-foreground mb-4">
                    Organize events and connect with your community.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                </CardContent>
              </Card>
            )}

            {events.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No events yet</h3>
                  <p className="text-muted-foreground">
                    {isOwnProfile 
                      ? 'Create your first event to engage with your community.'
                      : 'This artist hasn\'t organized any events yet.'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <Card key={event.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{event.event_type}</Badge>
                            {event.is_featured && (
                              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                Featured
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{event.current_attendees}</span>
                            {event.max_attendees && <span>/ {event.max_attendees}</span>}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{event.description}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(event.start_date).toLocaleDateString()}</span>
                        </div>
                        {event.location_name && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location_name}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="flex gap-2">
                          {event.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Button size="sm">
                          {event.is_attending ? 'Attending' : 'Join Event'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="services" className="mt-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Services Coming Soon</h3>
              <p className="text-muted-foreground">
                {isOwnProfile 
                  ? 'You\'ll be able to offer services and get bookings from clients.'
                  : 'This artist will be able to offer services soon.'
                }
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
