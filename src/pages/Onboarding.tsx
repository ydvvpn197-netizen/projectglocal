import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";

const interests = [
  { id: "music", label: "Music", icon: "🎵" },
  { id: "art", label: "Art & Design", icon: "🎨" },
  { id: "food", label: "Food & Dining", icon: "🍕" },
  { id: "sports", label: "Sports", icon: "⚽" },
  { id: "tech", label: "Technology", icon: "💻" },
  { id: "photography", label: "Photography", icon: "📸" },
  { id: "comedy", label: "Comedy", icon: "😄" },
  { id: "dance", label: "Dance", icon: "💃" },
  { id: "fitness", label: "Fitness", icon: "🏋️" },
  { id: "books", label: "Books & Literature", icon: "📚" },
  { id: "nature", label: "Nature & Outdoors", icon: "🌳" },
  { id: "business", label: "Business & Networking", icon: "💼" },
  { id: "family", label: "Family & Kids", icon: "👨‍👩‍👧‍👦" },
  { id: "pets", label: "Pets & Animals", icon: "🐕" },
  { id: "fashion", label: "Fashion & Style", icon: "👗" },
  { id: "travel", label: "Travel & Culture", icon: "✈️" },
];

const Onboarding = () => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Customize Your Experience</h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Select your interests to personalize your feed and discover relevant content
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>What are you interested in?</CardTitle>
            <CardDescription>
              Choose at least 3 interests to get started. You can always change these later.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Interest Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {interests.map((interest) => (
                <button
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left hover:border-primary/50 ${
                    selectedInterests.includes(interest.id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{interest.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{interest.label}</p>
                    </div>
                    {selectedInterests.includes(interest.id) && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Count */}
            <div className="text-center">
              <Badge variant={selectedInterests.length >= 3 ? "default" : "secondary"}>
                {selectedInterests.length} selected {selectedInterests.length >= 3 ? "✓" : "(minimum 3)"}
              </Badge>
            </div>

            {/* Navigation */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" asChild>
                <Link to="/location">
                  Back
                </Link>
              </Button>
              <Button 
                className="flex-1" 
                disabled={selectedInterests.length < 3}
                asChild
              >
                <Link to="/feed">
                  Start Exploring
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="text-center space-y-4">
          <h3 className="font-semibold">What happens next?</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-primary font-bold">1</span>
              </div>
              <p className="text-muted-foreground">Personalized feed based on your interests</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-primary font-bold">2</span>
              </div>
              <p className="text-muted-foreground">Discover local events and artists</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-primary font-bold">3</span>
              </div>
              <p className="text-muted-foreground">Connect with like-minded people</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;