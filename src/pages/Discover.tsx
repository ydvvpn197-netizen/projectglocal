/**
 * Discover Page - Updated with UnifiedPageTemplate
 * Explore communities, events, and trending content
 */

import { useState } from "react";
import { UnifiedPageTemplate } from "@/components/layout/UnifiedPageTemplate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Compass, 
  TrendingUp, 
  Users, 
  Calendar, 
  MapPin,
  Search,
  Filter,
  Star,
  Heart,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Flame
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Discover = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("trending");
  const [searchQuery, setSearchQuery] = useState("");

  const trendingCommunities = [
    {
      id: '1',
      name: 'Local Foodies',
      description: 'Share and discover the best local restaurants',
      members: 1234,
      category: 'Food',
      image: 'https://api.dicebear.com/7.x/shapes/svg?seed=food',
      trending: true
    },
    {
      id: '2',
      name: 'Tech Enthusiasts',
      description: 'Discuss latest tech trends and innovations',
      members: 987,
      category: 'Technology',
      image: 'https://api.dicebear.com/7.x/shapes/svg?seed=tech',
      trending: true
    },
    {
      id: '3',
      name: 'Fitness Together',
      description: 'Stay fit and healthy with your community',
      members: 756,
      category: 'Health',
      image: 'https://api.dicebear.com/7.x/shapes/svg?seed=fitness'
    }
  ];

  const upcomingEvents = [
    {
      id: '1',
      title: 'Community BBQ',
      date: '2025-10-15',
      location: 'Central Park',
      attendees: 45,
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&h=200&fit=crop'
    },
    {
      id: '2',
      title: 'Tech Meetup',
      date: '2025-10-18',
      location: 'Innovation Hub',
      attendees: 78,
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop'
    }
  ];

  const tabs = (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="trending" className="gap-2">
          <Flame className="h-4 w-4" />
          Trending
        </TabsTrigger>
        <TabsTrigger value="communities" className="gap-2">
          <Users className="h-4 w-4" />
          Communities
        </TabsTrigger>
        <TabsTrigger value="events" className="gap-2">
          <Calendar className="h-4 w-4" />
          Events
        </TabsTrigger>
        <TabsTrigger value="people" className="gap-2">
          <Sparkles className="h-4 w-4" />
          People
        </TabsTrigger>
      </TabsList>

      <TabsContent value="trending" className="space-y-6 mt-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trendingCommunities.map(community => (
            <Card key={community.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/communities/${community.id}`)}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={community.image} />
                    <AvatarFallback>{community.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{community.name}</CardTitle>
                      {community.trending && (
                        <Badge variant="default" className="gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Hot
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="mt-1">{community.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {community.members.toLocaleString()}
                    </span>
                    <Badge variant="secondary">{community.category}</Badge>
                  </div>
                  <Button size="sm" variant="outline">Join</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="communities" className="space-y-6 mt-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trendingCommunities.map(community => (
            <Card key={community.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Avatar className="h-16 w-16 mb-2">
                  <AvatarImage src={community.image} />
                  <AvatarFallback>{community.name[0]}</AvatarFallback>
                </Avatar>
                <CardTitle>{community.name}</CardTitle>
                <CardDescription>{community.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Members</span>
                    <span className="font-semibold">{community.members.toLocaleString()}</span>
                  </div>
                  <Button className="w-full" onClick={() => navigate(`/communities/${community.id}`)}>
                    View Community
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="events" className="space-y-6 mt-6">
        <div className="grid gap-6 md:grid-cols-2">
          {upcomingEvents.map(event => (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/events/${event.id}`)}>
              {event.image && (
                <div className="h-48 overflow-hidden">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                </div>
              )}
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
                <CardDescription className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {event.attendees} attending
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  View Event
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="people" className="space-y-6 mt-6">
        <Card>
          <CardContent className="py-12 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Discover People</h3>
            <p className="text-muted-foreground mb-4">
              Find and connect with interesting people in your community
            </p>
            <Button>Browse Profiles</Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );

  return (
    <UnifiedPageTemplate
      title="Discover"
      subtitle="Explore your community"
      description="Find communities, events, and people near you"
      icon={Compass}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Discover" }
      ]}
      secondaryActions={[
        {
          icon: Filter,
          onClick: () => toast({ title: "Filters coming soon" }),
          variant: "ghost"
        }
      ]}
      showRightSidebar={true}
      tabs={tabs}
    >
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search communities, events, people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
    </UnifiedPageTemplate>
  );
};

export default Discover;