import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Users, Calendar, Zap } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ArtistShowcase } from "@/components/ArtistShowcase";

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
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            <Link to="/" className="text-xl font-bold hover:text-primary transition-colors">
              Local Social Hub
            </Link>
          </div>
          <Button asChild>
            <Link to="/signin">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Connect. Discover. Create.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your local community hub for discovering events, booking artists, joining discussions, 
            and connecting with people around you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/signin">
                Join Your Community
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
          <p className="text-lg text-muted-foreground">
            Discover, connect, and engage with your local community
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Link to="/discover" className="block group">
            <div className="text-center space-y-4 p-6 rounded-lg bg-card border hover:bg-card/80 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Local Discovery</h3>
              <p className="text-muted-foreground">
                Find events, services, and activities happening near you
              </p>
            </div>
          </Link>
          
          <Link to="/book-artist" className="block group">
            <div className="text-center space-y-4 p-6 rounded-lg bg-card border hover:bg-card/80 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Book Artists</h3>
              <p className="text-muted-foreground">
                Hire local talent for your events and special occasions
              </p>
            </div>
          </Link>
          
          <Link to="/community" className="block group">
            <div className="text-center space-y-4 p-6 rounded-lg bg-card border hover:bg-card/80 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Join Community</h3>
              <p className="text-muted-foreground">
                Connect with like-minded people in your area
              </p>
            </div>
          </Link>
          
          <Link to="/events" className="block group">
            <div className="text-center space-y-4 p-6 rounded-lg bg-card border hover:bg-card/80 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Create Events</h3>
              <p className="text-muted-foreground">
                Organize and promote your own local events
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Artist Showcase */}
      <ArtistShowcase />

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center space-y-8 bg-primary/5 p-12 rounded-2xl">
          <h2 className="text-3xl font-bold">Ready to Join?</h2>
          <p className="text-lg text-muted-foreground">
            Start connecting with your local community today
          </p>
          <Button size="lg" asChild>
            <Link to="/signin">
              Get Started Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/50 backdrop-blur">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 Local Social Hub. Made with ❤️ for communities.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
