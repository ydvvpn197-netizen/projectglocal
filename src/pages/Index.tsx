import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Users, Calendar, Zap } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
// import { ArtistShowcase } from "@/components/ArtistShowcase";
// import { UniformHeader } from "@/components/UniformHeader";

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
      {/* Temporarily disabled UniformHeader to test basic loading */}
      {/* <UniformHeader showAuthButtons={true} showLocationButton={false} /> */}

      {/* Simple header for testing */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">L</span>
              </div>
              <span className="text-xl font-bold">Local Social Hub</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/signin">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signin">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

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

      {/* Temporarily disabled ArtistShowcase to test basic loading */}
      {/* <ArtistShowcase /> */}
    </div>
  );
};

export default Index;
