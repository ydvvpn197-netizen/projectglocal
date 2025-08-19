import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Clock, Palette, Music, Camera } from "lucide-react";
import { Link } from "react-router-dom";

interface Artist {
  id: string;
  name: string;
  specialty: string[];
  location: string;
  rating: number;
  reviewCount: number;
  hourlyRate: string;
  avatar: string;
  portfolio: string[];
  bio: string;
}

// Mock data for demonstration
const featuredArtists: Artist[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    specialty: ["Portrait Photography", "Wedding Photography"],
    location: "Downtown, 2 miles away",
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: "$75-125/hr",
    avatar: "",
    portfolio: [],
    bio: "Professional photographer with 8+ years of experience capturing life's precious moments."
  },
  {
    id: "2", 
    name: "Marcus Rivera",
    specialty: ["Live Music", "DJ Services", "Sound Production"],
    location: "Midtown, 1.5 miles away",
    rating: 4.8,
    reviewCount: 89,
    hourlyRate: "$100-200/hr",
    avatar: "",
    portfolio: [],
    bio: "Multi-talented musician and sound engineer bringing energy to every event."
  },
  {
    id: "3",
    name: "Emma Chen",
    specialty: ["Digital Art", "Illustration", "Graphic Design"],
    location: "Arts District, 3 miles away", 
    rating: 5.0,
    reviewCount: 45,
    hourlyRate: "$50-90/hr",
    avatar: "",
    portfolio: [],
    bio: "Creative digital artist specializing in unique, modern designs for businesses and events."
  }
];

const getSpecialtyIcon = (specialty: string) => {
  if (specialty.toLowerCase().includes('music') || specialty.toLowerCase().includes('dj')) {
    return <Music className="h-4 w-4" />;
  }
  if (specialty.toLowerCase().includes('photo')) {
    return <Camera className="h-4 w-4" />;
  }
  return <Palette className="h-4 w-4" />;
};

export function ArtistShowcase() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured Local Artists</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover amazing talent in your community. Book directly or explore their work.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {featuredArtists.map((artist) => (
            <Card key={artist.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={artist.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                      {artist.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg mb-1">{artist.name}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{artist.rating}</span>
                        <span className="text-sm text-muted-foreground">({artist.reviewCount})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {artist.location}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{artist.bio}</p>
                
                <div className="flex flex-wrap gap-2">
                  {artist.specialty.slice(0, 2).map((spec) => (
                    <Badge key={spec} variant="secondary" className="text-xs">
                      {getSpecialtyIcon(spec)}
                      <span className="ml-1">{spec}</span>
                    </Badge>
                  ))}
                  {artist.specialty.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{artist.specialty.length - 2} more
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-primary">{artist.hourlyRate}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" asChild>
                      <Link to={`/artist/${artist.id}`}>View Profile</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link to="/book-artist">Book Now</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center">
          <Button variant="outline" size="lg" asChild>
            <Link to="/book-artist">View All Artists</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}