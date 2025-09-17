import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX,
  MapPin, 
  Calendar,
  MessageCircle,
  MoreHorizontal,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useFollowing } from '@/hooks/useFollowing';
import { useAuth } from '@/hooks/useAuth';
import { FollowRelationship } from '@/types/following';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface FollowListsProps {
  userId?: string;
  className?: string;
}

export const FollowLists = ({ userId, className }: FollowListsProps) => {
  const { user } = useAuth();
  const { 
    followers, 
    following, 
    loading, 
    error, 
    fetchFollowers, 
    fetchFollowing,
    followUser,
    unfollowUser
  } = useFollowing();
  
  const [activeTab, setActiveTab] = useState('followers');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filteredFollowers, setFilteredFollowers] = useState<FollowRelationship[]>([]);
  const [filteredFollowing, setFilteredFollowing] = useState<FollowRelationship[]>([]);

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (targetUserId) {
      fetchFollowers(targetUserId);
      fetchFollowing(targetUserId);
    }
  }, [targetUserId, fetchFollowers, fetchFollowing]);

  useEffect(() => {
    // Filter and sort followers
    let filtered = followers;
    
    if (searchQuery) {
      filtered = filtered.filter(follower => 
        follower.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        follower.username?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'name':
          return (a.displayName || '').localeCompare(b.displayName || '');
        case 'activity':
          return (b.activityLevel || 0) - (a.activityLevel || 0);
        default:
          return 0;
      }
    });

    setFilteredFollowers(filtered);
  }, [followers, searchQuery, sortBy]);

  useEffect(() => {
    // Filter and sort following
    let filtered = following;
    
    if (searchQuery) {
      filtered = filtered.filter(followingUser => 
        followingUser.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        followingUser.username?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'name':
          return (a.displayName || '').localeCompare(b.displayName || '');
        case 'activity':
          return (b.activityLevel || 0) - (a.activityLevel || 0);
        default:
          return 0;
      }
    });

    setFilteredFollowing(filtered);
  }, [following, searchQuery, sortBy]);

  const handleFollow = async (userId: string) => {
    try {
      await followUser(userId);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      await unfollowUser(userId);
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  const renderUserCard = (user: FollowRelationship, isFollowing: boolean = false) => (
    <div
      key={user.id}
      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-3 flex-1">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user.avatarUrl} />
          <AvatarFallback>
            {user.displayName?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold truncate">{user.displayName || 'Anonymous'}</h4>
            {user.username && (
              <span className="text-sm text-muted-foreground">@{user.username}</span>
            )}
            {user.isVerified && (
              <Badge variant="secondary" className="text-xs">
                Verified
              </Badge>
            )}
          </div>
          
          {user.bio && (
            <p className="text-sm text-muted-foreground truncate mb-2">
              {user.bio}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {user.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {user.location.city}
                {user.location.state && `, ${user.location.state}`}
              </span>
            )}
            
            {user.lastActivity && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Active {new Date(user.lastActivity).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {user.id !== targetUserId && (
          <>
            {isFollowing ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUnfollow(user.id)}
                className="flex items-center gap-1"
              >
                <UserCheck className="h-4 w-4" />
                Following
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => handleFollow(user.id)}
                className="flex items-center gap-1"
              >
                <UserPlus className="h-4 w-4" />
                Follow
              </Button>
            )}
          </>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </DropdownMenuItem>
            <DropdownMenuItem>
              View Profile
            </DropdownMenuItem>
            {isFollowing && (
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => handleUnfollow(user.id)}
              >
                <UserX className="h-4 w-4 mr-2" />
                Unfollow
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Follow Lists
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Follow Lists
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => {
              fetchFollowers(targetUserId);
              fetchFollowing(targetUserId);
            }} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Follow Lists
        </CardTitle>
        <CardDescription>
          Manage your followers and following
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="activity">Activity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Followers ({followers.length})
            </TabsTrigger>
            <TabsTrigger value="following" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Following ({following.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="followers" className="space-y-4">
            {filteredFollowers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'No followers match your search' : 'No followers yet'}
                </p>
              </div>
            ) : (
              filteredFollowers.map(follower => renderUserCard(follower, false))
            )}
          </TabsContent>

          <TabsContent value="following" className="space-y-4">
            {filteredFollowing.length === 0 ? (
              <div className="text-center py-8">
                <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'No following match your search' : 'Not following anyone yet'}
                </p>
              </div>
            ) : (
              filteredFollowing.map(followingUser => renderUserCard(followingUser, true))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FollowLists;
