import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Sparkles, Shield, Globe, Zap, Heart } from "lucide-react";

const About = () => {
  return (
    <MainLayout>
      <div className="container max-w-4xl mx-auto p-6 space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold">About Local Social Hub</h1>
          <p className="text-muted-foreground text-lg">
            Where local communities connect, discover, and create — together.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Local Social Hub is built to bring neighborhoods to life online. We help you discover nearby events,
              hire talented local artists, join meaningful conversations, and stay informed with location-based news — all in one place.
            </p>
            <p>
              We believe strong communities start with simple, authentic connections. Our platform is designed to be safe, delightful, and useful for everyone — from creators and organizers to everyday neighbors.
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Hyperlocal by Design</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Discover what truly matters around you — events, services, gigs, and updates tailored to your location.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Community-First</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Thoughtful features help you connect respectfully — follows, discussions, and request-based messaging.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Empowering Creators</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Artists can showcase skills, receive booking requests, and chat with clients after accepting.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Safety & Control</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Message requests must be accepted before conversations begin. Your data is protected with secure policies.
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-primary" /> What You Can Do</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid md:grid-cols-2 gap-3 text-muted-foreground">
              <li>• Explore a curated local feed of posts, events, and services</li>
              <li>• Book artists and manage requests in a dedicated dashboard</li>
              <li>• Follow creators and join artist-led discussions</li>
              <li>• Chat after approval with message requests</li>
              <li>• Get location-based news updates in your feed</li>
              <li>• Create posts and events to grow your local impact</li>
            </ul>
          </CardContent>
        </Card>

        <div className="text-center text-muted-foreground">
          <Badge variant="secondary" className="inline-flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4" /> Built for neighborhoods, powered by community <Heart className="h-4 w-4" />
          </Badge>
        </div>
      </div>
    </MainLayout>
  );
};

export default About;


