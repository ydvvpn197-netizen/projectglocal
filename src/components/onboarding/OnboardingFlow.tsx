import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Heart, 
  Shield, 
  Users, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Star,
  Globe,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  required: boolean;
}

interface OnboardingFlowProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onSkip }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [onboardingData, setOnboardingData] = useState({
    location: '',
    interests: [] as string[],
    privacyLevel: 'public' as 'public' | 'friends' | 'private' | 'anonymous',
    notifications: true,
    dataCollection: false
  });

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to TheGlocal!',
      description: 'Connect with your local community and discover amazing events',
      icon: <Star className="h-8 w-8 text-yellow-500" />,
      required: true,
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
            <Users className="h-12 w-12 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome to TheGlocal!</h2>
            <p className="text-muted-foreground">
              Your local community platform where neighbors connect, events happen, and local artists thrive.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Local Events</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Artist Booking</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Anonymous Chat</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Privacy First</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'location',
      title: 'Set Your Location',
      description: 'Help us show you relevant local content and events',
      icon: <MapPin className="h-8 w-8 text-blue-500" />,
      required: true,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <MapPin className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              We'll use your location to show you nearby events, local news, and community discussions.
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">City</label>
              <input
                type="text"
                placeholder="Enter your city"
                value={onboardingData.location}
                onChange={(e) => setOnboardingData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Your location is private and only used for local content</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'interests',
      title: 'Choose Your Interests',
      description: 'Personalize your feed with topics you care about',
      icon: <Heart className="h-8 w-8 text-red-500" />,
      required: false,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <Heart className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <p className="text-muted-foreground">
              Select topics that interest you to get personalized content recommendations.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              'Music & Arts', 'Technology', 'Sports & Fitness', 'Food & Dining',
              'Business & Networking', 'Education', 'Environment', 'Health & Wellness',
              'Travel', 'Photography', 'Gaming', 'Books & Literature'
            ].map((interest) => (
              <button
                key={interest}
                onClick={() => {
                  const newInterests = onboardingData.interests.includes(interest)
                    ? onboardingData.interests.filter(i => i !== interest)
                    : [...onboardingData.interests, interest];
                  setOnboardingData(prev => ({ ...prev, interests: newInterests }));
                }}
                className={`p-3 rounded-lg border-2 transition-all ${
                  onboardingData.interests.includes(interest)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-center">
            You can always change these later in your settings
          </p>
        </div>
      )
    },
    {
      id: 'privacy',
      title: 'Privacy Settings',
      description: 'Control your visibility and data sharing',
      icon: <Shield className="h-8 w-8 text-green-500" />,
      required: true,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <Shield className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <p className="text-muted-foreground">
              Your privacy matters. Choose how visible you want to be in the community.
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-3">Profile Visibility</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'public', label: 'Public', icon: Globe, desc: 'Visible to everyone' },
                  { value: 'friends', label: 'Friends', icon: Users, desc: 'Visible to followers only' },
                  { value: 'private', label: 'Private', icon: Lock, desc: 'Only visible to you' },
                  { value: 'anonymous', label: 'Anonymous', icon: EyeOff, desc: 'Completely anonymous' }
                ].map(({ value, label, icon: Icon, desc }) => (
                  <button
                    key={value}
                    onClick={() => setOnboardingData(prev => ({ ...prev, privacyLevel: value as any }))}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      onboardingData.privacyLevel === value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Push Notifications</label>
                  <p className="text-sm text-muted-foreground">Get notified about local events and messages</p>
                </div>
                <button
                  onClick={() => setOnboardingData(prev => ({ ...prev, notifications: !prev.notifications }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    onboardingData.notifications ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    onboardingData.notifications ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Data Collection</label>
                  <p className="text-sm text-muted-foreground">Help improve the platform (anonymous analytics)</p>
                </div>
                <button
                  onClick={() => setOnboardingData(prev => ({ ...prev, dataCollection: !prev.dataCollection }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    onboardingData.dataCollection ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    onboardingData.dataCollection ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;
  const canProceed = steps[currentStep].required ? 
    (currentStep === 0 || (currentStep === 1 && onboardingData.location) || 
     (currentStep === 3 && onboardingData.privacyLevel)) : true;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Save onboarding data
      await saveOnboardingData(onboardingData);
      toast({
        title: "Welcome to TheGlocal!",
        description: "Your profile has been set up successfully.",
      });
      onComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive"
      });
    }
  };

  const saveOnboardingData = async (data: typeof onboardingData) => {
    // Implementation to save onboarding data
    console.log('Saving onboarding data:', data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="overflow-hidden">
          {/* Progress Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {steps[currentStep].icon}
                <div>
                  <h1 className="text-xl font-bold">{steps[currentStep].title}</h1>
                  <p className="text-blue-100">{steps[currentStep].description}</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white">
                {currentStep + 1} of {steps.length}
              </Badge>
            </div>
            <Progress value={progress} className="h-2 bg-white/20" />
          </div>

          {/* Step Content */}
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {steps[currentStep].content}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button variant="outline" onClick={handlePrevious}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                )}
                <Button variant="ghost" onClick={onSkip}>
                  Skip for now
                </Button>
              </div>
              
              <Button 
                onClick={handleNext}
                disabled={!canProceed}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default OnboardingFlow;
