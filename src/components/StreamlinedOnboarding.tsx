/**
 * StreamlinedOnboarding Component
 * 
 * A simplified, single-page onboarding flow that reduces friction
 * and improves user experience by combining essential steps.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  MapPin, 
  Shield, 
  Palette, 
  CheckCircle, 
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Globe,
  Users,
  Calendar,
  Star
} from 'lucide-react';

interface OnboardingData {
  displayName: string;
  location: string;
  userType: 'user' | 'artist';
  privacyLevel: 'public' | 'private' | 'anonymous';
  interests: string[];
  notifications: boolean;
}

const INTEREST_OPTIONS = [
  'Music', 'Art', 'Technology', 'Sports', 'Food', 'Travel',
  'Business', 'Education', 'Health', 'Entertainment', 'Politics', 'Environment'
];

export const StreamlinedOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    displayName: '',
    location: '',
    userType: 'user',
    privacyLevel: 'private',
    interests: [],
    notifications: true
  });

  const steps = [
    { id: 'welcome', title: 'Welcome', icon: User },
    { id: 'profile', title: 'Profile', icon: User },
    { id: 'location', title: 'Location', icon: MapPin },
    { id: 'privacy', title: 'Privacy', icon: Shield },
    { id: 'interests', title: 'Interests', icon: Star },
    { id: 'complete', title: 'Complete', icon: CheckCircle }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      // Save onboarding data to user profile
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.displayName,
          location_city: formData.location,
          user_type: formData.userType,
          privacy_level: formData.privacyLevel,
          interests: formData.interests,
          email_notifications: formData.notifications,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Welcome to TheGlocal!",
        description: "Your profile has been set up successfully.",
      });

      // Navigate to main feed
      navigate('/feed');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        title: "Setup Error",
        description: "There was an error setting up your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto"
            >
              <Globe className="w-12 h-12 text-primary" />
            </motion.div>
            
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">Welcome to TheGlocal!</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Your privacy-first community platform where you can connect locally, 
                express yourself, and organize events while keeping your identity secure.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm">Privacy First</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm">Local Community</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="text-sm">Events & Polls</span>
              </div>
            </div>
          </div>
        );

      case 1: // Profile
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">Create Your Profile</h2>
              <p className="text-muted-foreground">
                Choose how you want to be known in the community
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="Choose your display name"
                />
              </div>

              <div className="space-y-2">
                <Label>User Type</Label>
                <Tabs 
                  value={formData.userType} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, userType: value as 'user' | 'artist' }))}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="user">Regular User</TabsTrigger>
                    <TabsTrigger value="artist">Artist/Creator</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                {formData.userType === 'artist' && (
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <div className="flex items-center space-x-2 text-primary">
                      <Palette className="w-4 h-4" />
                      <span className="text-sm font-medium">Artist Features</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Get access to booking requests, artist dashboard, and premium features
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 2: // Location
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">Your Location</h2>
              <p className="text-muted-foreground">
                Help us connect you with your local community
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">City</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter your city"
                />
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 text-blue-700">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">Why do we need this?</span>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  Your location helps us show you relevant local news, events, and connect you with nearby community members.
                </p>
              </div>
            </div>
          </div>
        );

      case 3: // Privacy
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">Privacy Settings</h2>
              <p className="text-muted-foreground">
                Choose your privacy level - you can always change this later
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                {[
                  { value: 'public', title: 'Public', description: 'Everyone can see your profile and posts', icon: Globe },
                  { value: 'private', title: 'Private', description: 'Only approved followers can see your content', icon: Lock },
                  { value: 'anonymous', title: 'Anonymous', description: 'Post anonymously, reveal identity when you choose', icon: Eye }
                ].map((option) => (
                  <div
                    key={option.value}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.privacyLevel === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, privacyLevel: option.value as 'public' | 'community' | 'private' }))}
                  >
                    <div className="flex items-center space-x-3">
                      <option.icon className="w-5 h-5 text-primary" />
                      <div>
                        <h3 className="font-medium">{option.title}</h3>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Email Notifications</span>
                </div>
                <Switch
                  checked={formData.notifications}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notifications: checked }))}
                />
              </div>
            </div>
          </div>
        );

      case 4: // Interests
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">Your Interests</h2>
              <p className="text-muted-foreground">
                Select topics you're interested in (optional)
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {INTEREST_OPTIONS.map((interest) => (
                <Badge
                  key={interest}
                  variant={formData.interests.includes(interest) ? "default" : "outline"}
                  className="cursor-pointer p-2 text-sm"
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>

            {formData.interests.length > 0 && (
              <div className="p-4 bg-primary/5 rounded-lg">
                <p className="text-sm text-primary">
                  Selected: {formData.interests.join(', ')}
                </p>
              </div>
            )}
          </div>
        );

      case 5: // Complete
        return (
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto"
            >
              <CheckCircle className="w-12 h-12 text-green-600" />
            </motion.div>

            <div className="space-y-4">
              <h1 className="text-3xl font-bold">You're All Set!</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Welcome to TheGlocal! You can now start exploring your local community, 
                creating events, and connecting with others.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
              <div className="p-4 bg-primary/5 rounded-lg">
                <h3 className="font-medium mb-2">Next Steps</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Explore the news feed</li>
                  <li>• Join local communities</li>
                  <li>• Create your first event</li>
                </ul>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg">
                <h3 className="font-medium mb-2">Quick Tips</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use privacy controls</li>
                  <li>• Book local artists</li>
                  <li>• Participate in polls</li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="space-y-4">
              <div className="flex justify-center">
                <Progress value={progress} className="w-64 h-2" />
              </div>
              <div className="flex justify-center space-x-2">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index <= currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <div>
                <CardTitle className="text-xl">
                  {steps[currentStep].title}
                </CardTitle>
                <CardDescription>
                  Step {currentStep + 1} of {steps.length}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0 || isLoading}
              >
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={isLoading || (currentStep === 1 && !formData.displayName.trim())}
                className="min-w-[100px]"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : currentStep === steps.length - 1 ? (
                  'Complete'
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
