import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Users, Calendar, Star } from "lucide-react";
import { MainLayout } from "@/components/MainLayout";

const Discover = () => {
  const featuredEvents = [
    {
      id: 1,
      title: "Local Art Exhibition",
      location: "Downtown Gallery",
      date: "Tomorrow, 7:00 PM",
      attendees: 24,
      image: "🎨"
    },
    {
      id: 2,
      title: "Community Food Festival",
      location: "Central Park",
      date: "This Weekend",
      attendees: 156,
      image: "🍕"
    },
    {
      id: 3,
      title: "Live Jazz Night",
      location: "Blue Note Cafe",
      date: "Friday, 8:30 PM",
      attendees: 42,
      image: "🎷"
    }
  ];

  const localArtists = [
    {
      id: 1,
      name: "Sarah Chen",
      type: "Photographer",
      rating: 4.9,
      image: "📸"
    },
    {
      id: 2,
      name: "Mike Johnson",
      type: "Musician",
      rating: 4.8,
      image: "🎸"
    },
    {
      id: 3,
      name: "Emma Davis",
      type: "Painter",
      rating: 4.7,
      image: "🎨"
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Local Discovery</h1>
          </div>
          <p className="text-muted-foreground">
            Discover amazing events, artists, and experiences in your area.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search for events, artists, or venues..." 
            className="pl-10"
          />
        </div>

        {/* Featured Events */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Featured Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="text-4xl mb-2">{event.image}</div>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {event.attendees}
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Local Artists */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Local Artists</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {localArtists.map((artist) => (
              <Card key={artist.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">{artist.image}</div>
                  <CardTitle className="text-lg">{artist.name}</CardTitle>
                  <CardDescription>{artist.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center gap-1 mb-4">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{artist.rating}</span>
                  </div>
                  <Button className="w-full" variant="outline">
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Discover;