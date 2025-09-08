import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, Users, Star, Crown, Shield } from 'lucide-react';
import { useUserPlan } from '@/hooks/useUserPlan';
import { VerificationUpgrade, PremiumUpgrade } from './VerificationUpgrade';
import { ServiceMarketplace } from './ServiceMarketplace';
import { ServiceBrowser } from './ServiceBrowser';
import { UserProfileBadges } from './UserBadges';

interface MonetizationDashboardProps {
  activeTab?: 'overview' | 'services' | 'browse' | 'upgrade';
}

export function MonetizationDashboard({ activeTab = 'overview' }: MonetizationDashboardProps) {
  const { 
    planInfo, 
    isLoading, 
    isVerified, 
    isPremium, 
    planType,
    canCreateServices,
    canFeatureEvents 
  } = useUserPlan();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading monetization dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monetization Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your subscriptions, services, and earnings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <UserProfileBadges 
            user={{
              is_verified: isVerified,
              is_premium: isPremium,
              plan_type: planType
            }}
            size="md"
          />
        </div>
      </div>

      <Tabs defaultValue={activeTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">My Services</TabsTrigger>
          <TabsTrigger value="browse">Browse Services</TabsTrigger>
          <TabsTrigger value="upgrade">Upgrade</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewTab planInfo={planInfo} />
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <ServiceMarketplace userPlanInfo={planInfo} />
        </TabsContent>

        <TabsContent value="browse" className="space-y-4">
          <ServiceBrowser />
        </TabsContent>

        <TabsContent value="upgrade" className="space-y-4">
          <UpgradeTab planInfo={planInfo} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OverviewTab({ planInfo }: { planInfo: UserPlanInfo | null }) {
  return (
    <div className="space-y-6">
      {/* Plan Status Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{planInfo?.plan_type || 'Free'}</div>
            <p className="text-xs text-muted-foreground">
              {planInfo?.is_premium ? 'Full platform access' : 
               planInfo?.is_verified ? 'Enhanced credibility' : 
               'Basic features'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{planInfo?.max_services || 0}</div>
            <p className="text-xs text-muted-foreground">
              {planInfo?.can_create_services ? 'Can create services' : 'Upgrade to create services'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured Events</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{planInfo?.max_featured_events || 0}</div>
            <p className="text-xs text-muted-foreground">
              {planInfo?.can_feature_events ? 'Can feature events' : 'Upgrade to feature events'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Features Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Verification Benefits
            </CardTitle>
            <CardDescription>
              What you get with verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${planInfo?.is_verified ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm">Verified badge on profile</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${planInfo?.can_feature_events ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm">Feature events prominently</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${planInfo?.is_verified ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm">Enhanced credibility</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${planInfo?.is_verified ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm">Priority support</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-purple-600" />
              Premium Benefits
            </CardTitle>
            <CardDescription>
              What you get with premium
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${planInfo?.is_premium ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm">All verification benefits</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${planInfo?.can_create_services ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm">Create and sell services</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${planInfo?.is_premium ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm">Advanced analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${planInfo?.is_premium ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm">Custom branding</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {planInfo?.can_create_services && (
              <Button 
                onClick={() => window.location.href = '/monetization?tab=services'}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <DollarSign className="h-6 w-6" />
                <span>Manage Services</span>
              </Button>
            )}
            
            <Button 
              onClick={() => window.location.href = '/monetization?tab=browse'}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Users className="h-6 w-6" />
              <span>Browse Services</span>
            </Button>

            {!planInfo?.is_premium && (
              <Button 
                onClick={() => window.location.href = '/monetization?tab=upgrade'}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <TrendingUp className="h-6 w-6" />
                <span>Upgrade Plan</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UpgradeTab({ planInfo }: { planInfo: UserPlanInfo | null }) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Choose Your Plan</h2>
        <p className="text-muted-foreground">
          Unlock more features and grow your presence on the platform
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
        <VerificationUpgrade userPlanInfo={planInfo} />
        <PremiumUpgrade userPlanInfo={planInfo} />
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Comparison</CardTitle>
          <CardDescription>
            Compare features across all plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Features</th>
                  <th className="text-center p-2">Free</th>
                  <th className="text-center p-2">Verified</th>
                  <th className="text-center p-2">Premium</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b">
                  <td className="p-2">Basic platform access</td>
                  <td className="text-center p-2">✓</td>
                  <td className="text-center p-2">✓</td>
                  <td className="text-center p-2">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Verified badge</td>
                  <td className="text-center p-2">✗</td>
                  <td className="text-center p-2">✓</td>
                  <td className="text-center p-2">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Feature events</td>
                  <td className="text-center p-2">✗</td>
                  <td className="text-center p-2">✓</td>
                  <td className="text-center p-2">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Create services</td>
                  <td className="text-center p-2">✗</td>
                  <td className="text-center p-2">✗</td>
                  <td className="text-center p-2">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Advanced analytics</td>
                  <td className="text-center p-2">✗</td>
                  <td className="text-center p-2">✗</td>
                  <td className="text-center p-2">✓</td>
                </tr>
                <tr>
                  <td className="p-2">Priority support</td>
                  <td className="text-center p-2">✗</td>
                  <td className="text-center p-2">✓</td>
                  <td className="text-center p-2">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
