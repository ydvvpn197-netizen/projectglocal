import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Users, Calendar, Zap } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ArtistShowcase } from "@/components/ArtistShowcase";
import { UniformHeader } from "@/components/UniformHeader";

const Index = () => {
  const { user, loading } = useAuth();

  // If user is already authenticated, redirect to feed
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/feed" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <UniformHeader showAuthButtons={true} showLocationButton={false} />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Local Social Hub
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Connect with your local community, discover amazing events, and book talented artists in your area.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/signin">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Link to="/discover" className="block group">
            <div className="text-center space-y-4 p-6 rounded-lg bg-card border hover:bg-card/80 hover:shadow-md transition-all cursor-pointer">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Local Discovery</h3>
              <p className="text-muted-foreground">
                Find events, services, and people right in your neighborhood
              </p>
            </div>
          </Link>

          <Link to="/community" className="block group">
            <div className="text-center space-y-4 p-6 rounded-lg bg-card border hover:bg-card/80 hover:shadow-md transition-all cursor-pointer">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Community</h3>
              <p className="text-muted-foreground">
                Join local groups, discussions, and build meaningful connections
              </p>
            </div>
          </Link>

          <Link to="/events" className="block group">
            <div className="text-center space-y-4 p-6 rounded-lg bg-card border hover:bg-card/80 hover:shadow-md transition-all cursor-pointer">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Events</h3>
              <p className="text-muted-foreground">
                Create and join amazing events happening in your community
              </p>
            </div>
          </Link>

          <Link to="/book-artist" className="block group">
            <div className="text-center space-y-4 p-6 rounded-lg bg-card border hover:bg-card/80 hover:shadow-md transition-all cursor-pointer">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Book Artists</h3>
              <p className="text-muted-foreground">
                Hire talented local artists for your next event or project
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Artist Showcase */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-4">Featured Local Artists</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover talented creators in your area and book them for your next event
            </p>
          </div>
          <ArtistShowcase />
          <Button size="lg" variant="outline" asChild>
            <Link to="/book-artist">
              View All Artists
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-card rounded-lg p-8 text-center space-y-4">
          <h2 className="text-3xl font-bold">Ready to Join Your Local Community?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Start connecting with neighbors, discovering events, and supporting local artists today.
          </p>
          <Button size="lg" asChild>
            <Link to="/signin">Join Local Social Hub</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
