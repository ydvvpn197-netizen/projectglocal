import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  User, 
  Settings, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Lock,
  Globe,
  Users,
  AlertTriangle,
  Info,
  Sparkles,
  Heart,
  Star,
  Zap,
  Target,
  Award,
  Activity,
  BarChart3,
  MessageSquare,
  Calendar,
  Bell,
  Home,
  Navigation,
  Compass,
  Flag,
  Hash,
  AtSign,
  ExternalLink,
  BookOpen,
  Music,
  Camera,
  Mic,
  Coffee,
  Car,
  Building,
  Leaf,
  Mountain,
  Globe as GlobeIcon,
  UserPlus,
  Crown,
  Sparkles as SparklesIcon,
  TrendingUp,
  TrendingDown,
  Activity as ActivityIcon,
  MapPin,
  Clock,
  DollarSign,
  Tag,
  Edit3,
  MessageCircle,
  Users as UsersIcon,
  Building as BuildingIcon,
  Target as TargetIcon,
  Award as AwardIcon,
  Star as StarIcon,
  Heart as HeartIcon,
  Zap as ZapIcon,
  Activity as ActivityIcon2,
  BarChart3 as BarChart3Icon,
  MessageSquare as MessageSquareIcon,
  Navigation as NavigationIcon,
  Compass as CompassIcon,
  Flag as FlagIcon,
  Hash as HashIcon,
  AtSign as AtSignIcon,
  ExternalLink as ExternalLinkIcon,
  BookOpen as BookOpenIcon,
  Music as MusicIcon,
  Camera as CameraIcon,
  Mic as MicIcon,
  Coffee as CoffeeIcon,
  Car as CarIcon,
  Building as BuildingIcon2,
  Leaf as LeafIcon,
  Mountain as MountainIcon,
  Globe as GlobeIcon2,
  UserPlus as UserPlusIcon,
  Crown as CrownIcon,
  Sparkles as SparklesIcon2,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Activity as ActivityIcon3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { AnonymousUsernameGenerator } from '@/components/AnonymousUsernameGenerator';
import { IdentityRevealToggle } from '@/components/IdentityRevealToggle';
import { PrivacyAuditDashboard } from '@/components/PrivacyAuditDashboard';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: React.ReactNode;
}

interface Interest {
  id: string;
  label: string;
  icon: string;
  category: string;
}

const ConsolidatedOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [privacySettings, setPrivacySettings] = useState({
    anonymousMode: false,
    locationSharing: false,
    profileVisibility: 'public',
    dataCollection: false
  });
  const [location, setLocation] = useState({
    city: '',
    state: '',
    country: '',
    coordinates: { lat: 0, lng: 0 }
  });
  const [loading, setLoading] = useState(false);

  const interests: Interest[] = [
    { id: "music", label: "Music", icon: "🎵", category: "Entertainment" },
    { id: "art", label: "Art & Design", icon: "🎨", category: "Creative" },
    { id: "food", label: "Food & Dining", icon: "🍕", category: "Lifestyle" },
    { id: "sports", label: "Sports", icon: "⚽", category: "Fitness" },
    { id: "tech", label: "Technology", icon: "💻", category: "Professional" },
    { id: "photography", label: "Photography", icon: "📸", category: "Creative" },
    { id: "comedy", label: "Comedy", icon: "😄", category: "Entertainment" },
    { id: "dance", label: "Dance", icon: "💃", category: "Arts" },
    { id: "fitness", label: "Fitness", icon: "🏋️", category: "Health" },
    { id: "books", label: "Books & Literature", icon: "📚", category: "Education" },
    { id: "nature", label: "Nature & Outdoors", icon: "🌳", category: "Lifestyle" },
    { id: "business", label: "Business & Networking", icon: "💼", category: "Professional" },
    { id: "family", label: "Family & Kids", icon: "👨‍👩‍👧‍👦", category: "Community" },
    { id: "pets", label: "Pets & Animals", icon: "🐕", category: "Lifestyle" },
    { id: "fashion", label: "Fashion & Style", icon: "👗", category: "Lifestyle" },
    { id: "travel", label: "Travel & Culture", icon: "✈️", category: "Lifestyle" }
  ];

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to TheGlocal',
      description: 'Let\'s get you set up with your privacy-first community platform',
      completed: false,
      icon: <Shield className="w-6 h-6" />
    },
    {
      id: 'interests',
      title: 'Choose Your Interests',
      description: 'Help us personalize your experience',
      completed: false,
      icon: <Heart className="w-6 h-6" />
    },
    {
      id: 'privacy',
      title: 'Privacy Settings',
      description: 'Configure your privacy and anonymity preferences',
      completed: false,
      icon: <Lock className="w-6 h-6" />
    },
    {
      id: 'location',
      title: 'Location Setup',
      description: 'Set your location for local community features',
      completed: false,
      icon: <MapPin className="w-6 h-6" />
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'Welcome to your new community platform',
      completed: false,
      icon: <CheckCircle className="w-6 h-6" />
    }
  ];

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestId) 
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
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
    setLoading(true);
    try {
      // Simulate onboarding completion
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Welcome to TheGlocal!",
        description: "Your account has been set up successfully.",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-10 h-10 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to TheGlocal
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Your privacy-first community platform where you can connect with local communities 
                while maintaining complete control over your personal information.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="p-4 border rounded-lg">
                <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Privacy First</h3>
                <p className="text-sm text-gray-600">Your data stays yours</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Local Communities</h3>
                <p className="text-sm text-gray-600">Connect with neighbors</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Globe className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Global Reach</h3>
                <p className="text-sm text-gray-600">Worldwide connections</p>
              </div>
            </div>
          </div>
        );
      
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                What interests you?
              </h2>
              <p className="text-gray-600">
                Select your interests to help us personalize your experience
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {interests.map((interest) => (
                <button
                  key={interest.id}
                  onClick={() => handleInterestToggle(interest.id)}
                  className={`p-4 border rounded-lg text-center transition-all ${
                    selectedInterests.includes(interest.id)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{interest.icon}</div>
                  <div className="font-medium text-sm">{interest.label}</div>
                  <div className="text-xs text-gray-500">{interest.category}</div>
                </button>
              ))}
            </div>
            {selectedInterests.length > 0 && (
              <div className="text-center">
                <Badge variant="secondary" className="text-sm">
                  {selectedInterests.length} interests selected
                </Badge>
              </div>
            )}
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Privacy & Anonymity
              </h2>
              <p className="text-gray-600">
                Configure your privacy settings and anonymity preferences
              </p>
            </div>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Anonymous Mode</h3>
                    <p className="text-sm text-gray-600">
                      Participate anonymously in discussions
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.anonymousMode}
                    onChange={(e) => setPrivacySettings(prev => ({
                      ...prev,
                      anonymousMode: e.target.checked
                    }))}
                    className="w-4 h-4"
                  />
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Location Sharing</h3>
                    <p className="text-sm text-gray-600">
                      Share your location for local events
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.locationSharing}
                    onChange={(e) => setPrivacySettings(prev => ({
                      ...prev,
                      locationSharing: e.target.checked
                    }))}
                    className="w-4 h-4"
                  />
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold mb-2">Profile Visibility</h3>
                  <select
                    value={privacySettings.profileVisibility}
                    onChange={(e) => setPrivacySettings(prev => ({
                      ...prev,
                      profileVisibility: e.target.value
                    }))}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="public">Public</option>
                    <option value="friends">Friends Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Set Your Location
              </h2>
              <p className="text-gray-600">
                Help us connect you with local communities and events
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={location.city}
                  onChange={(e) => setLocation(prev => ({
                    ...prev,
                    city: e.target.value
                  }))}
                  placeholder="Enter your city"
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State/Province
                </label>
                <input
                  type="text"
                  value={location.state}
                  onChange={(e) => setLocation(prev => ({
                    ...prev,
                    state: e.target.value
                  }))}
                  placeholder="Enter your state or province"
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={location.country}
                  onChange={(e) => setLocation(prev => ({
                    ...prev,
                    country: e.target.value
                  }))}
                  placeholder="Enter your country"
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                You're All Set!
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Welcome to TheGlocal! Your account has been set up successfully. 
                You can now start exploring communities and connecting with people.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="p-4 border rounded-lg">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Join Communities</h3>
                <p className="text-sm text-gray-600">Connect with like-minded people</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Discover Events</h3>
                <p className="text-sm text-gray-600">Find local events and activities</p>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
              </span>
            </div>
            <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
          </div>

          {/* Main Content */}
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-xl">
                {steps[currentStep].icon}
                {steps[currentStep].title}
              </CardTitle>
              <CardDescription>
                {steps[currentStep].description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              {getStepContent()}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Completing...
                </>
              ) : currentStep === steps.length - 1 ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Setup
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default ConsolidatedOnboarding;
