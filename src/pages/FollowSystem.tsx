import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  Search, 
  Filter,
  TrendingUp,
  MapPin,
  Heart,
  Star,
  Globe,
  Target,
  Lightbulb,
  RefreshCw
} from 'lucide-react';

// Import enhanced follow components
import { FollowSuggestions } from '@/components/follow/FollowSuggestions';
import { FollowLists } from '@/components/follow/FollowLists';
import { FollowDiscovery } from '@/components/follow/FollowDiscovery';
import { useFollowing } from '@/hooks/useFollowing';
import { useAuth } from '@/hooks/useAuth';

export const FollowSystem = () => {
  const { user } = useAuth();
  const { followStats, loading } = useFollowing();
  const [activeTab, setActiveTab] = useState('discover');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (!user) {
    return (
      <PageLayout layout="main" showSidebar={true} showHeader={true} showFooter={false}>
        <div className="container max-w-6xl mx-auto p-6">
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Sign in to access Follow System</h2>
            <p className="text-muted-foreground">Please sign in to discover and connect with people in your community.</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout layout="main" showSidebar={true} showHeader={true} showFooter={false}>
      <div className="container max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Users className="h-8 w-8" />
                Follow System
              </h1>
              <p className="text-muted-foreground mt-2">
                Discover, connect, and build your community network
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          {followStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Followers</p>
                      <p className="text-2xl font-bold">{followStats.totalFollowers}</p>
                    </div>
                    <UserCheck className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Following</p>
                      <p className="text-2xl font-bold">{followStats.totalFollowing}</p>
                    </div>
                    <UserPlus className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Growth Rate</p>
                      <p className="text-2xl font-bold">+{followStats.growthRate}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="discover" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Suggestions
            </TabsTrigger>
            <TabsTrigger value="lists" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Lists
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            <FollowDiscovery key={refreshKey} />
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-6">
            <FollowSuggestions key={refreshKey} />
          </TabsContent>

          <TabsContent value="lists" className="space-y-6">
            <FollowLists key={refreshKey} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Follow Analytics
                  </CardTitle>
                  <CardDescription>
                    Insights into your follow network and growth
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {followStats ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total Followers</span>
                        <span className="font-bold">{followStats.totalFollowers}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total Following</span>
                        <span className="font-bold">{followStats.totalFollowing}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Mutual Followers</span>
                        <span className="font-bold">{followStats.mutualFollowers}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Engagement Rate</span>
                        <span className="font-bold">{followStats.engagementRate}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Growth Rate</span>
                        <span className="font-bold text-green-600">+{followStats.growthRate}%</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No analytics data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Follow Tips
                  </CardTitle>
                  <CardDescription>
                    Tips to improve your follow network
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-1">Engage with Content</h4>
                    <p className="text-sm text-muted-foreground">
                      Like and comment on posts from people you follow to build stronger relationships.
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-1">Share Quality Content</h4>
                    <p className="text-sm text-muted-foreground">
                      Post regularly and share valuable content to attract more followers.
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-1">Connect with Locals</h4>
                    <p className="text-sm text-muted-foreground">
                      Follow people in your local area to build a strong community network.
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-1">Use Hashtags</h4>
                    <p className="text-sm text-muted-foreground">
                      Use relevant hashtags to make your content discoverable by more people.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default FollowSystem;
