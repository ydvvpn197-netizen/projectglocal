import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProfilePhotoDialog } from './ProfilePhotoDialog';
import { FollowListsDialog } from './FollowListsDialog';
import { useAuth } from '@/hooks/useAuth';
import { useFollows } from '@/hooks/useFollows';

export const FeatureTest = () => {
  const { user } = useAuth();
  const { followersCount, followingCount } = useFollows(user?.id);
  const [testAvatarUrl, setTestAvatarUrl] = useState<string | null>(null);

  const handlePhotoUpdated = (newUrl: string | null) => {
    setTestAvatarUrl(newUrl);
    console.log('Photo updated:', newUrl);
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feature Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please sign in to test the features.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Photo Feature Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Test the profile photo upload and management functionality.
          </p>
          
          <ProfilePhotoDialog
            currentAvatarUrl={testAvatarUrl}
            displayName="Test User"
            onPhotoUpdated={handlePhotoUpdated}
            trigger={
              <Button variant="outline">
                Test Photo Upload
              </Button>
            }
          />
          
          {testAvatarUrl && (
            <div className="mt-4">
              <p className="text-sm font-medium">Current Test Photo:</p>
              <img 
                src={testAvatarUrl} 
                alt="Test avatar" 
                className="w-16 h-16 rounded-full mt-2"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Followers/Following Feature Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Test the followers and following lists functionality.
          </p>
          
          <FollowListsDialog
            userId={user.id}
            followersCount={followersCount}
            followingCount={followingCount}
            trigger={
              <Button variant="outline">
                Test Followers/Following Lists
              </Button>
            }
          />
          
          <div className="text-sm text-muted-foreground">
            <p>Current counts: {followersCount} followers, {followingCount} following</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
