import React, { useState, useEffect } from 'react';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { AnonymousUsernameGenerator } from '@/components/AnonymousUsernameGenerator';
import { IdentityRevealToggle } from '@/components/IdentityRevealToggle';
import { PrivacyAuditDashboard } from '@/components/PrivacyAuditDashboard';
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
  Star
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

const PrivacyFirstOnboarding: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to TheGlocal',
      description: 'Your privacy-first community platform',
      icon: <Heart className="h-6 w-6" />,
      completed: completedSteps.includes('welcome')
    },
    {
      id: 'anonymous-username',
      title: 'Create Anonymous Identity',
      description: 'Generate a secure anonymous username for privacy',
      icon: <User className="h-6 w-6" />,
      completed: completedSteps.includes('anonymous-username')
    },
    {
      id: 'privacy-settings',
      title: 'Configure Privacy Settings',
      description: 'Set up your privacy preferences and controls',
      icon: <Settings className="h-6 w-6" />,
      completed: completedSteps.includes('privacy-settings')
    },
    {
      id: 'identity-control',
      title: 'Identity Control',
      description: 'Learn how to reveal or hide your identity',
      icon: <Eye className="h-6 w-6" />,
      completed: completedSteps.includes('identity-control')
    },
    {
      id: 'privacy-audit',
      title: 'Privacy Transparency',
      description: 'Understand your privacy audit and data rights',
      icon: <Shield className="h-6 w-6" />,
      completed: completedSteps.includes('privacy-audit')
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'Start exploring your privacy-first community',
      icon: <CheckCircle className="h-6 w-6" />,
      completed: completedSteps.includes('complete')
    }
  ];

  const progress = (completedSteps.length / steps.length) * 100;

  const handleStepComplete = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId]);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    try {
      setIsLoading(true);
      // Here you would typically save onboarding completion to the database
      toast({
        title: "Onboarding Complete!",
        description: "Welcome to TheGlocal! Your privacy-first community awaits.",
      });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case 'welcome':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Welcome to TheGlocal</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Your privacy-first digital public square for local communities
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                  <h3 className="font-semibold mb-2">Privacy First</h3>
                  <p className="text-sm text-muted-foreground">
                    Your identity is protected by default. Reveal it only when you choose.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 mx-auto mb-3 text-green-600" />
                  <h3 className="font-semibold mb-2">Local Community</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect with people in your area while maintaining your privacy.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Globe className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                  <h3 className="font-semibold mb-2">Digital Public Square</h3>
                  <p className="text-sm text-muted-foreground">
                    Engage in civic discussions, events, and community building.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Your Privacy Rights:</p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• Complete control over your identity</li>
                    <li>• Transparent data usage and logging</li>
                    <li>• Right to export and delete your data</li>
                    <li>• Anonymous participation by default</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'anonymous-username':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Create Your Anonymous Identity</h2>
              <p className="text-muted-foreground">
                Generate a secure anonymous username to protect your privacy while participating in the community.
              </p>
            </div>

            <AnonymousUsernameGenerator
              onUsernameGenerated={(username) => {
                handleStepComplete('anonymous-username');
                toast({
                  title: "Anonymous Username Created",
                  description: `Your anonymous identity "${username}" has been generated.`,
                });
              }}
              showAdvanced={true}
            />

            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Why Anonymous Usernames?</p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• Protect your real identity from surveillance</li>
                    <li>• Participate freely in discussions</li>
                    <li>• Build reputation without personal exposure</li>
                    <li>• Reveal your identity only when you choose</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'privacy-settings':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Configure Your Privacy Settings</h2>
              <p className="text-muted-foreground">
                Set up your privacy preferences to control how your data is used and shared.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lock className="h-5 w-5 mr-2" />
                    Data Collection
                  </CardTitle>
                  <CardDescription>
                    Control what data we collect about you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Anonymous Posting</Label>
                      <p className="text-sm text-muted-foreground">Post anonymously by default</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Location Sharing</Label>
                      <p className="text-sm text-muted-foreground">Share your city for local relevance</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Analytics Tracking</Label>
                      <p className="text-sm text-muted-foreground">Help improve the platform</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    Profile Visibility
                  </CardTitle>
                  <CardDescription>
                    Control who can see your profile information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-medium">Profile Visibility</Label>
                    <Select defaultValue="friends">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="friends">Friends Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Show Contact Info</Label>
                      <p className="text-sm text-muted-foreground">Display your contact information</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Allow Messages</Label>
                      <p className="text-sm text-muted-foreground">Let others send you messages</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button
              onClick={() => handleStepComplete('privacy-settings')}
              className="w-full"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Privacy Settings
            </Button>
          </div>
        );

      case 'identity-control':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Identity Control</h2>
              <p className="text-muted-foreground">
                Learn how to reveal or hide your identity for different interactions.
              </p>
            </div>

            <IdentityRevealToggle
              resourceType="profile"
              resourceId="onboarding-demo"
              currentState="anonymous"
              onStateChange={(newState) => {
                handleStepComplete('identity-control');
                toast({
                  title: "Identity Control Learned",
                  description: `You've learned how to ${newState === 'revealed' ? 'reveal' : 'hide'} your identity.`,
                });
              }}
              showWarning={true}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <EyeOff className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">Anonymous Mode</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your real identity is hidden. You appear as your anonymous username.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Eye className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Revealed Mode</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your real identity is visible. Others can see your real name and profile.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'privacy-audit':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Privacy Transparency</h2>
              <p className="text-muted-foreground">
                Understand how your privacy is protected and your data rights.
              </p>
            </div>

            <PrivacyAuditDashboard />

            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Your Data Rights:</p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• Right to access your personal data</li>
                    <li>• Right to rectify inaccurate data</li>
                    <li>• Right to erase your data</li>
                    <li>• Right to restrict processing</li>
                    <li>• Right to data portability</li>
                    <li>• Right to object to processing</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold mb-4">You're All Set!</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Welcome to TheGlocal! Your privacy-first community awaits.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Start Exploring</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Discover local news, events, and community discussions.
                  </p>
                  <Button className="w-full">
                    <Globe className="h-4 w-4 mr-2" />
                    Explore Community
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Create Content</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Share your thoughts, create events, or offer services.
                  </p>
                  <Button variant="outline" className="w-full">
                    <User className="h-4 w-4 mr-2" />
                    Start Creating
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ResponsiveLayout>
      <div className="space-y-8">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Privacy Setup Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedSteps.length} of {steps.length} completed
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center space-x-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`w-3 h-3 rounded-full ${
                  index === currentStep
                    ? 'bg-primary'
                    : step.completed
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleComplete}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Completing...' : 'Complete Setup'}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {steps[currentStep].icon}
              <span className="ml-2">{steps[currentStep].title}</span>
              {steps[currentStep].completed && (
                <Badge className="ml-2 bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {steps[currentStep].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>
      </div>
    </ResponsiveLayout>
  );
};

export default PrivacyFirstOnboarding;