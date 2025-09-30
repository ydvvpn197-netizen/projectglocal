/**
 * @internal Test/Demo page
 * This page is for testing and demonstration purposes.
 * Should be moved to /dev route behind feature flag.
 * Not for production use.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AnonymousUsernameGenerator } from '@/components/AnonymousUsernameGenerator';
import { VirtualProtestSystem } from '@/components/VirtualProtestSystem';
import { 
  Shield, 
  Megaphone, 
  Users, 
  Eye, 
  EyeOff, 
  Lock, 
  Globe,
  CheckCircle,
  Star,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const FeatureShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState('anonymous');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Critical Features Showcase</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience our privacy-first anonymous username system and powerful virtual protest platform
          </p>
        </div>

        {/* Feature Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Anonymous Username System</CardTitle>
                  <CardDescription>Reddit-style anonymous identities with privacy controls</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Random username generation (User_12345)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Optional identity revelation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Privacy level controls</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Anonymous posting & commenting</span>
                </div>
              </div>
              <Button 
                className="w-full mt-4" 
                onClick={() => setActiveTab('anonymous')}
              >
                Try Anonymous System
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 hover:border-purple-300 transition-colors">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Megaphone className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Virtual Protests Feature</CardTitle>
                  <CardDescription>Organize and participate in virtual protests</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Virtual protest creation & organization</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Protest tracking & participation system</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Mobilization campaigns</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Impact metrics & analytics</span>
                </div>
              </div>
              <Button 
                className="w-full mt-4" 
                variant="outline"
                onClick={() => setActiveTab('protests')}
              >
                Explore Protests
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Privacy Benefits Alert */}
        <Alert className="mb-8 border-green-200 bg-green-50">
          <Shield className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Privacy-First Design:</strong> Both features prioritize user anonymity and privacy, 
            allowing you to engage in civic discourse without compromising your identity. 
            You can always choose to reveal your identity when desired.
          </AlertDescription>
        </Alert>

        {/* Main Feature Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="anonymous" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Anonymous Username System</span>
            </TabsTrigger>
            <TabsTrigger value="protests" className="flex items-center space-x-2">
              <Megaphone className="h-4 w-4" />
              <span>Virtual Protests</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="anonymous" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Anonymous Username System</h2>
              <p className="text-gray-600">
                Generate secure, anonymous usernames for enhanced privacy. Choose your privacy level 
                and participate in discussions without revealing your identity.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnonymousUsernameGenerator 
                showAdvanced={true}
                onUsernameGenerated={(username) => {
                  console.log('Generated username:', username);
                }}
                onPrivacyLevelChange={(level) => {
                  console.log('Privacy level changed:', level);
                }}
              />

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lock className="h-5 w-5" />
                    <span>Privacy Levels</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium">Low Privacy</span>
                      </div>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        More memorable
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Medium Privacy</span>
                      </div>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        Balanced
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-orange-600" />
                        <span className="font-medium">High Privacy</span>
                      </div>
                      <Badge variant="outline" className="bg-orange-100 text-orange-800">
                        More random
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <EyeOff className="h-4 w-4 text-red-600" />
                        <span className="font-medium">Maximum Privacy</span>
                      </div>
                      <Badge variant="outline" className="bg-red-100 text-red-800">
                        Completely random
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="protests" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Virtual Protests Platform</h2>
              <p className="text-gray-600">
                Create, organize, and participate in virtual protests. Mobilize support for causes 
                that matter to you and track the impact of your activism.
              </p>
            </div>

            <VirtualProtestSystem />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <Card className="text-center p-6">
                <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Easy Participation</h3>
                <p className="text-sm text-gray-600">
                  Join protests with a single click. Choose your participation level and commitment.
                </p>
              </Card>

              <Card className="text-center p-6">
                <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Global Reach</h3>
                <p className="text-sm text-gray-600">
                  Connect with activists worldwide. Virtual protests transcend geographical boundaries.
                </p>
              </Card>

              <Card className="text-center p-6">
                <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-4">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Track Impact</h3>
                <p className="text-sm text-gray-600">
                  Monitor participation, engagement, and real-world impact of your protests.
                </p>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <div className="text-center mt-12 p-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white">
          <h3 className="text-2xl font-bold mb-4">Ready to Make a Difference?</h3>
          <p className="text-lg mb-6 opacity-90">
            Join our privacy-first community and start engaging in civic discourse today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => setActiveTab('anonymous')}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <Shield className="h-5 w-5 mr-2" />
              Create Anonymous Identity
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setActiveTab('protests')}
              className="border-white text-white hover:bg-white hover:text-blue-600"
            >
              <Megaphone className="h-5 w-5 mr-2" />
              Start a Protest
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureShowcase;
