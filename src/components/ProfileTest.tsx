import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { CheckCircle, XCircle, Loader2, User, Calendar, Users, Trophy, Crown } from 'lucide-react';

export const ProfileTest: React.FC = () => {
  const { user } = useAuth();
  const { profile, stats, loading, updating } = useUserProfile();

  const testResults = [
    {
      name: 'Authentication',
      status: !!user,
      description: 'User is authenticated'
    },
    {
      name: 'Profile Data',
      status: !!profile,
      description: 'Profile data loaded successfully'
    },
    {
      name: 'Stats Data',
      status: !!stats,
      description: 'User statistics loaded'
    },
    {
      name: 'Loading State',
      status: !loading,
      description: 'Data loading completed'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile System Test
          </CardTitle>
          <CardDescription>
            Testing profile functionality and data loading
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Test Results */}
            <div className="grid gap-3">
              {testResults.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{test.name}</h4>
                    <p className="text-sm text-muted-foreground">{test.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {test.status ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <Badge variant={test.status ? "default" : "destructive"}>
                      {test.status ? "PASS" : "FAIL"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Current State */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-3">Current State</h4>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Loading:</span>
                  <span className={loading ? "text-yellow-600" : "text-green-600"}>
                    {loading ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Updating:</span>
                  <span className={updating ? "text-yellow-600" : "text-green-600"}>
                    {updating ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>User ID:</span>
                  <span className="font-mono text-xs">{user?.id || 'Not available'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span>{user?.email || 'Not available'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Display Name:</span>
                  <span>{profile?.display_name || 'Not set'}</span>
                </div>
              </div>
            </div>

            {/* Profile Stats Preview */}
            {stats && (
              <div className="mt-6">
                <h4 className="font-medium mb-3">Profile Statistics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{stats.eventsCreated}</div>
                    <div className="text-xs text-muted-foreground">Events</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <User className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{stats.postsCreated}</div>
                    <div className="text-xs text-muted-foreground">Posts</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{stats.communitiesJoined}</div>
                    <div className="text-xs text-muted-foreground">Communities</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <Trophy className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{stats.totalPoints}</div>
                    <div className="text-xs text-muted-foreground">Points</div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading profile data...</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 mt-6">
              <Button asChild>
                <a href="/profile">View Full Profile</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/settings">Profile Settings</a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileTest;
