import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MonetizationDashboard } from '@/components/monetization/MonetizationDashboard';
import { UserProfileBadges } from '@/components/monetization/UserBadges';
import { FeaturedEventButton } from '@/components/monetization/FeaturedEventButton';
import { useUserPlan } from '@/hooks/useUserPlan';
import { useAuth } from '@/hooks/useAuth';
import { DollarSign, Shield, Crown, Star, Check } from 'lucide-react';

export default function MonetizationTest() {
  const { user } = useAuth();
  const { planInfo, isLoading } = useUserPlan();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Monetization Features Test</h1>
        <p className="text-muted-foreground text-lg">
          Test the subscription, verification, premium plans, and Stripe integration
        </p>
      </div>

      {/* User Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current User Status</CardTitle>
          <CardDescription>
            Your current plan and verification status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">User:</span>
                <span>{user?.email || 'Not logged in'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Plan:</span>
                <UserProfileBadges 
                  user={{
                    is_verified: planInfo?.is_verified,
                    is_premium: planInfo?.is_premium,
                    plan_type: planInfo?.plan_type
                  }}
                  size="md"
                />
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="text-sm text-muted-foreground">
                Can create services: {planInfo?.can_create_services ? 'Yes' : 'No'}
              </div>
              <div className="text-sm text-muted-foreground">
                Can feature events: {planInfo?.can_feature_events ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Tests */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Verification Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Verification Test
            </CardTitle>
            <CardDescription>
              Test user verification upgrade flow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Verification Benefits</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Verified badge on profile</li>
                <li>• Feature events prominently</li>
                <li>• Enhanced credibility</li>
                <li>• Priority support</li>
              </ul>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="mb-2">
                Price: $9.99/month
              </Badge>
              <div className="text-sm text-muted-foreground">
                {planInfo?.is_verified ? 'Already verified' : 'Not verified'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Premium Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-purple-600" />
              Premium Test
            </CardTitle>
            <CardDescription>
              Test premium subscription upgrade flow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Premium Benefits</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• All verification benefits</li>
                <li>• Create and sell services</li>
                <li>• Advanced analytics</li>
                <li>• Custom branding</li>
              </ul>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="mb-2">
                Price: $29.99/month
              </Badge>
              <div className="text-sm text-muted-foreground">
                {planInfo?.is_premium ? 'Already premium' : 'Not premium'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Featured Event Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              Featured Event Test
            </CardTitle>
            <CardDescription>
              Test event featuring functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Featured Event Benefits</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Prominent placement in listings</li>
                <li>• Featured badge and highlighting</li>
                <li>• 30 days of featured status</li>
                <li>• Increased visibility</li>
              </ul>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="mb-2">
                Price: $19.99 one-time
              </Badge>
              <div className="text-sm text-muted-foreground mb-3">
                {planInfo?.can_feature_events ? 'Can feature events' : 'Need verification or premium'}
              </div>
              <FeaturedEventButton
                eventId="test-event-123"
                eventTitle="Test Event"
                userPlanInfo={planInfo}
              />
            </div>
          </CardContent>
        </Card>

        {/* Service Marketplace Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Service Marketplace Test
            </CardTitle>
            <CardDescription>
              Test service creation and booking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Service Features</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Create and manage services</li>
                <li>• Set custom pricing</li>
                <li>• Handle bookings</li>
                <li>• Receive payments</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-3">
                {planInfo?.can_create_services ? 'Can create services' : 'Need premium subscription'}
              </div>
              <Button 
                onClick={() => window.location.href = '/monetization?tab=services'}
                variant="outline"
                className="w-full"
              >
                {planInfo?.can_create_services ? 'Manage Services' : 'View Services'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Full Monetization Dashboard</CardTitle>
          <CardDescription>
            Complete dashboard with all monetization features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MonetizationDashboard />
        </CardContent>
      </Card>

      {/* Environment Check */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Configuration</CardTitle>
          <CardDescription>
            Check if all required environment variables are set
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm">Stripe Publishable Key: {import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'Set' : 'Missing'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm">Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm">Supabase Anon Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
