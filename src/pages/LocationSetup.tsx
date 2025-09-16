import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { MapPin, Navigation, Search, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";

const LocationSetup = () => {
  const [radius, setRadius] = useState([15]);
  const [manualLocation, setManualLocation] = useState("");

  const handleLocationAccess = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Location accessed:", position.coords);
          // Handle location success
        },
        (error) => {
          console.error("Location error:", error);
          // Handle location error
        }
      );
    }
  };

  return (
    <ResponsiveLayout showNewsFeed={false}>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-8">
          {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Enable Location Access</h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Help us show you local events, artists, and communities in your area
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Set Your Location</CardTitle>
            <CardDescription>
              We'll use this to personalize your feed with nearby content
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Automatic Location */}
            <div className="space-y-4">
              <Button 
                onClick={handleLocationAccess}
                className="w-full" 
                size="lg"
              >
                <Navigation className="mr-2 h-4 w-4" />
                Use My Current Location
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or enter manually</span>
                </div>
              </div>
            </div>

            {/* Manual Location */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">Enter Your Location</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="City, State or ZIP code"
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Radius Selector */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Discovery Radius: {radius[0]} km</Label>
                  <p className="text-sm text-muted-foreground">
                    How far should we look for events and artists?
                  </p>
                </div>
                
                <div className="px-4">
                  <Slider
                    value={radius}
                    onValueChange={setRadius}
                    max={50}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>5 km</span>
                    <span>25 km</span>
                    <span>50 km</span>
                  </div>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-sm">Privacy & Location</h4>
                <p className="text-xs text-muted-foreground">
                  Your location is used only to show relevant local content. We never share your exact location with other users.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" asChild>
                <Link to="/signin">
                  Back
                </Link>
              </Button>
              <Button className="flex-1" asChild>
                <Link to="/onboarding">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-medium">Local Events</h3>
            <p className="text-xs text-muted-foreground">Discover what's happening nearby</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Navigation className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-medium">Nearby Artists</h3>
            <p className="text-xs text-muted-foreground">Find and book local talent</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Search className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-medium">Community</h3>
            <p className="text-xs text-muted-foreground">Connect with neighbors</p>
          </div>
        </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default LocationSetup;
