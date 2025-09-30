/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Please use ConsolidatedCommunity.tsx instead.
 * Category: community
 * 
 * This page has been consolidated to provide a better, more consistent user experience.
 * All functionality from this page is available in the consolidated version.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CommunityHub } from '@/components/community/CommunityHub';
import { EnhancedNewsCard } from '@/components/news/EnhancedNewsCard';
import { ArtistProfile } from '@/components/artist/ArtistProfile';
import { anonymousUserService } from '@/services/anonymousUserService';
import { aiSummarizationService, NewsArticle } from '@/services/aiSummarizationService';
import { 
  MessageSquare, 
  Newspaper, 
  Users, 
  Calendar, 
  BarChart3, 
  Building2,
  Sparkles,
  Shield,
  Heart,
  TrendingUp
} from 'lucide-react';

export function CommunityPlatform() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('community');
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initializePlatform();
  }, [initializePlatform]);

  const initializePlatform = useCallback(async () => {
    try {
      // Initialize anonymous session
      await anonymousUserService.getOrCreateAnonymousSession();
      
      // Load sample news articles
      await loadSampleNews();
      
      toast({
        title: 'Welcome to TheGlocal Community',
        description: 'Your privacy is protected. You can participate anonymously.',
      });
    } catch (error) {
      console.error('Error initializing platform:', error);
    }
  }, [toast]);

  const loadSampleNews = async () => {
    setIsLoading(true);
    try {
      // Sample news articles for demonstration
      const sampleArticles: NewsArticle[] = [
        {
          id: '1',
          title: 'Local Community Garden Initiative Gains Momentum',
          content: 'A new community garden project in the heart of the city has attracted over 200 volunteers in its first month. The initiative aims to promote sustainable living and provide fresh produce to local families. Organizers report that the garden has already produced over 500kg of vegetables, which have been distributed to community members and local food banks. The project has received support from the municipal corporation and several local businesses.',
          source: 'Local News Daily',
          url: 'https://example.com/news/1',
          published_at: new Date().toISOString(),
          category: 'Community',
          tags: ['sustainability', 'community', 'gardening', 'volunteers'],
          location: {
            city: 'Delhi',
            state: 'Delhi',
            country: 'India'
          },
          image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'
        },
        {
          id: '2',
          title: 'New Public Transport Routes to Connect Suburbs',
          content: 'The city transport authority has announced new bus routes that will connect previously underserved suburban areas with the city center. The routes will operate from 6 AM to 10 PM daily, with increased frequency during peak hours. This development is expected to reduce commute times by up to 30% for residents in these areas. The project is part of a larger initiative to improve public transportation infrastructure across the metropolitan region.',
          source: 'City Transport News',
          url: 'https://example.com/news/2',
          published_at: new Date(Date.now() - 86400000).toISOString(),
          category: 'Transportation',
          tags: ['transport', 'public transport', 'infrastructure', 'suburbs'],
          location: {
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India'
          },
          image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400'
        },
        {
          id: '3',
          title: 'Local Artists Collaborate on Street Art Festival',
          content: 'Over 50 local artists have come together to create a vibrant street art festival that will transform several neighborhoods. The festival, which runs for two weeks, features live painting sessions, workshops, and guided tours. Organizers hope the event will not only beautify the city but also provide a platform for emerging artists to showcase their work. The festival has received funding from the city council and several art foundations.',
          source: 'Arts & Culture Weekly',
          url: 'https://example.com/news/3',
          published_at: new Date(Date.now() - 172800000).toISOString(),
          category: 'Arts & Culture',
          tags: ['art', 'festival', 'street art', 'community', 'culture'],
          location: {
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India'
          },
          image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400'
        }
      ];

      setNewsArticles(sampleArticles);
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewsVote = async (article: NewsArticle, voteType: 1 | -1 | 0) => {
    try {
      // Record vote anonymously
      await anonymousUserService.voteOnAnonymousPost(article.id, voteType);
      
      toast({
        title: 'Vote Recorded',
        description: 'Your vote has been recorded anonymously.',
      });
    } catch (error) {
      console.error('Error voting on news:', error);
    }
  };

  const handleNewsComment = (article: NewsArticle) => {
    toast({
      title: 'Comment Feature',
      description: 'Comment functionality will be available soon.',
    });
  };

  const handleNewsShare = (article: NewsArticle) => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.content.substring(0, 200),
        url: article.url,
      });
    } else {
      navigator.clipboard.writeText(article.url);
      toast({
        title: 'Link Copied',
        description: 'Article link has been copied to clipboard.',
      });
    }
  };

  const handleNewsBookmark = (article: NewsArticle) => {
    toast({
      title: 'Bookmarked',
      description: 'Article has been saved to your bookmarks.',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">TheGlocal Community</h1>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Privacy Protected
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <Heart className="h-3 w-3 mr-1" />
                Anonymous Mode
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="community" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Community
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              News
            </TabsTrigger>
            <TabsTrigger value="artists" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Artists
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="community" className="mt-0">
            <CommunityHub />
          </TabsContent>

          <TabsContent value="news" className="mt-0">
            <div className="space-y-6">
              {/* News Header */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    AI-Powered News Summaries
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Get intelligent summaries of local news with key points, sentiment analysis, and reading time estimates.
                  </p>
                </CardHeader>
              </Card>

              {/* News Articles */}
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-6 w-3/4 bg-muted rounded" />
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="h-4 w-full bg-muted rounded" />
                          <div className="h-4 w-2/3 bg-muted rounded" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {newsArticles.map((article) => (
                    <EnhancedNewsCard
                      key={article.id}
                      article={article}
                      onVote={handleNewsVote}
                      onComment={handleNewsComment}
                      onShare={handleNewsShare}
                      onBookmark={handleNewsBookmark}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="artists" className="mt-0">
            <div className="space-y-6">
              {/* Artists Header */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    Local Artists & Creators
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Discover and connect with talented artists in your community. Follow, engage, and support local creators.
                  </p>
                </CardHeader>
              </Card>

              {/* Sample Artist Profile */}
              <ArtistProfile
                artistId="sample-artist-1"
                artist={{
                  id: "sample-artist-1",
                  display_name: "Priya Sharma",
                  bio: "Passionate photographer and digital artist with 5+ years of experience. Specializing in portrait photography and creative digital art. Available for events, portraits, and commercial projects.",
                  avatar_url: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
                  location_city: "Delhi",
                  location_state: "Delhi",
                  location_country: "India",
                  artist_skills: ["Photography", "Digital Art", "Portrait Photography", "Event Photography"],
                  hourly_rate_min: 2000,
                  hourly_rate_max: 5000,
                  website_url: "https://priyasharma.art",
                  phone_number: "+91 98765 43210",
                  is_premium: true,
                  is_verified: true
                }}
                isOwnProfile={false}
              />
            </div>
          </TabsContent>

          <TabsContent value="events" className="mt-0">
            <div className="space-y-6">
              {/* Events Header */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    Local Events & Activities
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Discover and participate in local events, community activities, and cultural programs happening around you.
                  </p>
                </CardHeader>
              </Card>

              {/* Sample Events */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    id: '1',
                    title: 'Community Garden Workshop',
                    description: 'Learn sustainable gardening techniques and help maintain our community garden.',
                    date: new Date(Date.now() + 86400000 * 3),
                    location: 'Central Park, Delhi',
                    attendees: 45,
                    maxAttendees: 50,
                    type: 'Community',
                    isFeatured: true
                  },
                  {
                    id: '2',
                    title: 'Street Art Festival',
                    description: 'Join local artists for a vibrant street art festival featuring live painting and workshops.',
                    date: new Date(Date.now() + 86400000 * 7),
                    location: 'Art District, Mumbai',
                    attendees: 120,
                    maxAttendees: 200,
                    type: 'Cultural',
                    isFeatured: false
                  },
                  {
                    id: '3',
                    title: 'Tech Meetup: AI & Machine Learning',
                    description: 'Network with fellow developers and learn about the latest trends in AI and ML.',
                    date: new Date(Date.now() + 86400000 * 10),
                    location: 'Tech Hub, Bangalore',
                    attendees: 80,
                    maxAttendees: 100,
                    type: 'Educational',
                    isFeatured: false
                  }
                ].map((event) => (
                  <Card key={event.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{event.type}</Badge>
                            {event.isFeatured && (
                              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                Featured
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{event.description}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{event.date.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{event.attendees}/{event.maxAttendees} attendees</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          {event.maxAttendees - event.attendees} spots left
                        </div>
                        <Button size="sm">
                          Join Event
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="border-t bg-muted/50 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-muted-foreground">
            <p className="mb-2">
              <strong>TheGlocal Community Platform</strong> - Connecting Local Communities
            </p>
            <p className="text-sm">
              Privacy Protected • Anonymous Participation • AI-Powered Features • Government Integration
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Privacy First
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                AI Enhanced
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                Government Connected
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
