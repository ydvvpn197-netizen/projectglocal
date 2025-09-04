/**
 * UserList Component
 * 
 * A component that displays a list of users using EnhancedUserProfileCard
 * with different variants and layouts for various use cases.
 * 
 * @component
 * @example
 * ```tsx
 * <UserList
 *   users={userList}
 *   variant="compact"
 *   layout="grid"
 *   onUserAction={(userId, action) => console.log(action, userId)}
 * />
 * ```
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Users, 
  UserPlus, 
  Star,
  TrendingUp,
  Award,
  Zap,
  CheckCircle
} from 'lucide-react';
import { EnhancedUserProfileCard, EnhancedUserProfile } from './EnhancedUserProfileCard';
import { cn } from '@/lib/utils';

/**
 * User list props interface
 */
export interface UserListProps {
  users: EnhancedUserProfile[];
  variant?: 'default' | 'compact' | 'minimal' | 'premium' | 'featured' | 'enterprise' | 'dark';
  layout?: 'grid' | 'list' | 'cards';
  showSearch?: boolean;
  showFilters?: boolean;
  showTabs?: boolean;
  className?: string;
  loading?: boolean;
  error?: string | null;
  onUserAction?: (userId: string, action: string, data?: any) => void | Promise<void>;
  onFollow?: (userId: string) => void | Promise<void>;
  onMessage?: (userId: string) => void | Promise<void>;
  onViewProfile?: (userId: string) => void | Promise<void>;
  onShare?: (userId: string) => void | Promise<void>;
  onEdit?: (userId: string) => void | Promise<void>;
  onContact?: (userId: string) => void | Promise<void>;
}

/**
 * UserList Component
 * 
 * Renders a list of users with search, filtering, and different layout options.
 * Integrates with EnhancedUserProfileCard for consistent user display.
 */
export const UserList: React.FC<UserListProps> = ({
  users,
  variant = 'default',
  layout = 'grid',
  showSearch = true,
  showFilters = true,
  showTabs = true,
  className,
  loading = false,
  error = null,
  onUserAction,
  onFollow,
  onMessage,
  onViewProfile,
  onShare,
  onEdit,
  onContact
}) => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'followers' | 'rating' | 'recent'>('name');
  const [filterVerified, setFilterVerified] = useState(false);
  const [filterOnline, setFilterOnline] = useState(false);
  const [filterPremium, setFilterPremium] = useState(false);

  // Memoized filtered and sorted users
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply tab filters
    switch (activeTab) {
      case 'verified':
        filtered = filtered.filter(user => user.verified);
        break;
      case 'online':
        filtered = filtered.filter(user => user.isOnline);
        break;
      case 'premium':
        filtered = filtered.filter(user => user.isPremium);
        break;
      case 'trending':
        filtered = filtered.filter(user => user.badges?.includes('trending'));
        break;
      case 'featured':
        filtered = filtered.filter(user => user.isFeatured);
        break;
      default:
        break;
    }

    // Apply additional filters
    if (filterVerified) {
      filtered = filtered.filter(user => user.verified);
    }
    if (filterOnline) {
      filtered = filtered.filter(user => user.isOnline);
    }
    if (filterPremium) {
      filtered = filtered.filter(user => user.isPremium);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'followers':
          return (b.followersCount || 0) - (a.followersCount || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'recent':
          return new Date(b.joinDate || '').getTime() - new Date(a.joinDate || '').getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [users, searchQuery, activeTab, sortBy, filterVerified, filterOnline, filterPremium]);

  // Event handlers
  const handleUserAction = useCallback(async (userId: string, action: string, data?: any) => {
    if (onUserAction) {
      try {
        await onUserAction(userId, action, data);
      } catch (err) {
        console.error(`Failed to perform action ${action}:`, err);
      }
    }
  }, [onUserAction]);

  const handleFollow = useCallback(async (userId: string) => {
    if (onFollow) {
      await onFollow(userId);
    }
    await handleUserAction(userId, 'follow');
  }, [onFollow, handleUserAction]);

  const handleMessage = useCallback(async (userId: string) => {
    if (onMessage) {
      await onMessage(userId);
    }
    await handleUserAction(userId, 'message');
  }, [onMessage, handleUserAction]);

  const handleViewProfile = useCallback(async (userId: string) => {
    if (onViewProfile) {
      await onViewProfile(userId);
    }
    await handleUserAction(userId, 'view_profile');
  }, [onViewProfile, handleUserAction]);

  const handleShare = useCallback(async (userId: string) => {
    if (onShare) {
      await onShare(userId);
    }
    await handleUserAction(userId, 'share');
  }, [onShare, handleUserAction]);

  const handleEdit = useCallback(async (userId: string) => {
    if (onEdit) {
      await onEdit(userId);
    }
    await handleUserAction(userId, 'edit');
  }, [onEdit, handleUserAction]);

  const handleContact = useCallback(async (userId: string) => {
    if (onContact) {
      await onContact(userId);
    }
    await handleUserAction(userId, 'contact');
  }, [onContact, handleUserAction]);

  // Loading state
  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-muted rounded-full" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-32" />
                    <div className="h-3 bg-muted rounded w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-6 text-center">
          <div className="text-destructive">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Users</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (filteredUsers.length === 0) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
            <p className="mb-4">
              {searchQuery ? `No users match "${searchQuery}"` : 'No users available'}
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render user list based on layout
  const renderUserList = () => {
    const userCards = filteredUsers.map((user) => (
      <EnhancedUserProfileCard
        key={user.id}
        user={user}
        variant={variant}
        onFollow={handleFollow}
        onMessage={handleMessage}
        onViewProfile={handleViewProfile}
        onShare={handleShare}
        onEdit={handleEdit}
        onContact={handleContact}
        showActions={true}
        showStats={variant !== 'minimal'}
        showSocialLinks={variant === 'detailed' || variant === 'premium' || variant === 'featured'}
        showSkills={variant === 'detailed' || variant === 'premium' || variant === 'featured'}
        showInterests={variant === 'featured'}
        animate={true}
        interactive={true}
      />
    ));

    switch (layout) {
      case 'grid':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {userCards}
          </div>
        );
      case 'list':
        return (
          <div className="space-y-3">
            {userCards}
          </div>
        );
      case 'cards':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userCards}
          </div>
        );
      case 'enterprise':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {users.map((user) => (
              <EnhancedUserProfileCard
                key={user.id}
                user={user}
                variant="enterprise"
                showActions={true}
                showStats={true}
                showSkills={true}
                onFollow={onFollow}
                onMessage={onMessage}
                onViewProfile={onViewProfile}
                onShare={onShare}
                onEdit={onEdit}
                onContact={onContact}
                className="h-full"
              />
            ))}
          </div>
        );
      case 'dark':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {users.map((user) => (
              <EnhancedUserProfileCard
                key={user.id}
                user={user}
                variant="dark"
                showActions={true}
                showStats={true}
                showSkills={true}
                onFollow={onFollow}
                onMessage={onMessage}
                onViewProfile={onViewProfile}
                onShare={onShare}
                onEdit={onEdit}
                onContact={onContact}
                className="h-full"
              />
            ))}
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userCards}
          </div>
        );
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Users</h2>
          <p className="text-muted-foreground">
            {filteredUsers.length} of {users.length} users
          </p>
        </div>
        
        {/* Layout Toggle */}
        <div className="flex items-center space-x-2">
          <Button
            variant={layout === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('name')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={layout === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('name')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search & Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name, bio, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {/* Filters */}
            {showFilters && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterVerified ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterVerified(!filterVerified)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verified
                </Button>
                <Button
                  variant={filterOnline ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterOnline(!filterOnline)}
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  Online
                </Button>
                <Button
                  variant={filterPremium ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterPremium(!filterPremium)}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Premium
                </Button>
              </div>
            )}

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="name">Name</option>
                <option value="followers">Followers</option>
                <option value="rating">Rating</option>
                <option value="recent">Recently Joined</option>
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      {showTabs && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="verified">
              <CheckCircle className="h-4 w-4 mr-2" />
              Verified
            </TabsTrigger>
            <TabsTrigger value="online">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              Online
            </TabsTrigger>
            <TabsTrigger value="premium">
              <Star className="h-4 w-4 mr-2" />
              Premium
            </TabsTrigger>
            <TabsTrigger value="trending">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="featured">
              <Award className="h-4 w-4 mr-2" />
              Featured
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            {renderUserList()}
          </TabsContent>
          
          <TabsContent value="verified" className="mt-6">
            {renderUserList()}
          </TabsContent>
          
          <TabsContent value="online" className="mt-6">
            {renderUserList()}
          </TabsContent>
          
          <TabsContent value="premium" className="mt-6">
            {renderUserList()}
          </TabsContent>
          
          <TabsContent value="trending" className="mt-6">
            {renderUserList()}
          </TabsContent>
          
          <TabsContent value="featured" className="mt-6">
            {renderUserList()}
          </TabsContent>
        </Tabs>
      )}

      {/* User List */}
      {!showTabs && renderUserList()}
    </div>
  );
};

export default UserList;
