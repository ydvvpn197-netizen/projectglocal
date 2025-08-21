import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserMinus, UserCheck, UserPlus } from 'lucide-react';
import { useFollowLists, FollowUser } from '@/hooks/useFollowLists';
import { useAuth } from '@/hooks/useAuth';
import { useFollows } from '@/hooks/useFollows';
import { useNavigate } from 'react-router-dom';

interface FollowListsDialogProps {
  userId: string;
  followersCount: number;
  followingCount: number;
  trigger?: React.ReactNode;
}

export const FollowListsDialog = ({ 
  userId, 
  followersCount, 
  followingCount,
  trigger 
}: FollowListsDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { followers, following, followersLoading, followingLoading, removeFromFollowers, unfollowUser } = useFollowLists(userId);
  const [open, setOpen] = useState(false);

  const isOwnProfile = user?.id === userId;

  const handleUserClick = (userProfile: FollowUser) => {
    setOpen(false);
    navigate(`/profile/${userProfile.username || userProfile.user_id}`);
  };

  const handleFollowAction = async (targetUserId: string, action: 'follow' | 'unfollow') => {
    // This would need to be implemented with the existing follow functionality
    // For now, we'll just close the dialog and let the user navigate to the profile
    setOpen(false);
    navigate(`/profile/${targetUserId}`);
  };

  const FollowUserItem = ({ userProfile, showActions = false }: { userProfile: FollowUser; showActions?: boolean }) => {
    const { isFollowing, toggleFollow } = useFollows(userProfile.user_id);
    const isCurrentUser = user?.id === userProfile.user_id;

    return (
      <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
        <div 
          className="flex items-center gap-3 flex-1 cursor-pointer"
          onClick={() => handleUserClick(userProfile)}
        >
          <Avatar className="w-10 h-10">
            <AvatarImage src={userProfile.avatar_url} />
            <AvatarFallback>
              {userProfile.display_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">{userProfile.display_name}</p>
              {userProfile.username && (
                <span className="text-sm text-muted-foreground">@{userProfile.username}</span>
              )}
            </div>
            {userProfile.bio && (
              <p className="text-sm text-muted-foreground truncate">{userProfile.bio}</p>
            )}
          </div>
        </div>
        
        {showActions && !isCurrentUser && (
          <div className="flex items-center gap-2">
            {isFollowing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFollow();
                }}
              >
                <UserCheck className="h-4 w-4 mr-1" />
                Following
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFollow();
                }}
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Follow
              </Button>
            )}
          </div>
        )}
        
        {showActions && isOwnProfile && !isCurrentUser && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                removeFromFollowers(userProfile.user_id);
              }}
              className="text-destructive hover:text-destructive"
            >
              <UserMinus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <div className="flex items-center gap-6">
            <Button variant="ghost" className="p-0 h-auto">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{followersCount}</span> followers
                </span>
              </div>
            </Button>
            <Button variant="ghost" className="p-0 h-auto">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{followingCount}</span> following
                </span>
              </div>
            </Button>
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Followers & Following</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="followers" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers">
              Followers ({followersCount})
            </TabsTrigger>
            <TabsTrigger value="following">
              Following ({followingCount})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="followers" className="flex-1 overflow-y-auto">
            {followersLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : followers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No followers yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {followers.map((follower) => (
                  <FollowUserItem 
                    key={follower.id} 
                    userProfile={follower} 
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="following" className="flex-1 overflow-y-auto">
            {followingLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : following.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Not following anyone yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {following.map((followingUser) => (
                  <FollowUserItem 
                    key={followingUser.id} 
                    userProfile={followingUser} 
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
