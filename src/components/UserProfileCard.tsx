/**
 * UserProfileCard Component
 * 
 * A modern, responsive user profile card component that displays user information
 * with proper security validation, accessibility features, and enhanced functionality.
 * 
 * @component
 * @example
 * ```tsx
 * <UserProfileCard
 *   user={{
 *     id: 'user-123',
 *     name: 'John Doe',
 *     email: 'john@example.com',
 *     avatar: 'https://example.com/avatar.jpg',
 *     bio: 'Software Developer',
 *     location: 'San Francisco, CA',
 *     verified: true,
 *     followersCount: 1234,
 *     followingCount: 567
 *   }}
 *   variant="premium"
 *   animate={true}
 *   interactive={true}
 *   onFollow={() => console.log('Follow clicked')}
 *   onMessage={() => console.log('Message clicked')}
 *   onViewProfile={() => console.log('Profile clicked')}
 * />
 * ```
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  MapPin, 
  Mail, 
  Users, 
  UserPlus, 
  MessageCircle, 
  ExternalLink,
  Shield,
  CheckCircle,
  TrendingUp,
  Heart,
  Star,
  Award,
  Zap,
  Camera,
  Edit,
  Share2,
  Phone,
  Globe,
  Calendar
} from 'lucide-react';
import { validateInput } from '@/config/security';
import { cn } from '@/lib/utils';

/**
 * User profile data interface
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  verified?: boolean;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  isOnline?: boolean;
  lastSeen?: string;
  badges?: string[];
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
    phone?: string;
  };
  // Extended fields for enhanced variants
  rating?: number;
  reviewCount?: number;
  skills?: string[];
  interests?: string[];
  joinDate?: string;
  eventsCount?: number;
  projectsCount?: number;
  isPremium?: boolean;
  isFeatured?: boolean;
}

/**
 * Component props interface
 */
export interface UserProfileCardProps {
  user: UserProfile;
  onFollow?: (userId: string) => void | Promise<void>;
  onMessage?: (userId: string) => void | Promise<void>;
  onViewProfile?: (userId: string) => void | Promise<void>;
  onShare?: (userId: string) => void | Promise<void>;
  onEdit?: (userId: string) => void | Promise<void>;
  onContact?: (userId: string) => void | Promise<void>;
  showActions?: boolean;
  showStats?: boolean;
  showSocialLinks?: boolean;
  showSkills?: boolean;
  showInterests?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed' | 'premium' | 'featured' | 'minimal';
  loading?: boolean;
  error?: string | null;
  animate?: boolean;
  interactive?: boolean;
}

/**
 * UserProfileCard Component
 * 
 * Renders a user profile card with various display options and interaction handlers.
 * Includes security validation, accessibility features, and responsive design.
 */
export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  user,
  onFollow,
  onMessage,
  onViewProfile,
  onShare,
  onEdit,
  onContact,
  showActions = true,
  showStats = true,
  showSocialLinks = false,
  showSkills = false,
  showInterests = false,
  className,
  variant = 'default',
  loading = false,
  error = null,
  animate = true,
  interactive = true
}) => {
  // State management
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(error);
  const [isHovered, setIsHovered] = useState(false);

  // Memoized computed values - Privacy-first: Always use anonymous handle if available
  const displayName = useMemo(() => {
    // Priority: anonymous_handle > display_name > name > 'Anonymous User'
    if (user.anonymous_handle) {
      return user.anonymous_handle;
    }
    if (user.display_name && user.display_name.trim() !== '') {
      return user.display_name;
    }
    if (user.name && user.name.trim() !== '') {
      return user.name;
    }
    return 'Anonymous User';
  }, [user.anonymous_handle, user.display_name, user.name]);

  const displayBio = useMemo(() => {
    if (!user.bio) return null;
    const validation = validateInput(user.bio, 'userBio');
    return validation.success ? user.bio : null;
  }, [user.bio]);

  const displayLocation = useMemo(() => {
    if (!user.location) return null;
    const validation = validateInput(user.location, 'userLocation');
    return validation.success ? user.location : null;
  }, [user.location]);

  const avatarFallback = useMemo(() => {
    return displayName.charAt(0).toUpperCase();
  }, [displayName]);

  const isVerified = useMemo(() => {
    return user.verified === true;
  }, [user.verified]);

  const isOnline = useMemo(() => {
    return user.isOnline === true;
  }, [user.isOnline]);

  const isPremium = useMemo(() => {
    return user.isPremium === true;
  }, [user.isPremium]);

  const isFeatured = useMemo(() => {
    return user.isFeatured === true;
  }, [user.isFeatured]);

  // Event handlers with proper error handling
  const handleFollow = useCallback(async () => {
    if (!onFollow || isLoading) return;
    
    try {
      setIsLoading(true);
      setLocalError(null);
      await onFollow(user.id);
      setIsFollowing(!isFollowing);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to follow user');
    } finally {
      setIsLoading(false);
    }
  }, [onFollow, user.id, isFollowing, isLoading]);

  const handleMessage = useCallback(async () => {
    if (!onMessage || isLoading) return;
    
    try {
      setIsLoading(true);
      setLocalError(null);
      await onMessage(user.id);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, [onMessage, user.id, isLoading]);

  const handleViewProfile = useCallback(async () => {
    if (!onViewProfile || isLoading) return;
    
    try {
      setIsLoading(true);
      setLocalError(null);
      await onViewProfile(user.id);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to view profile');
    } finally {
      setIsLoading(false);
    }
  }, [onViewProfile, user.id, isLoading]);

  const handleShare = useCallback(async () => {
    if (!onShare || isLoading) return;
    
    try {
      setIsLoading(true);
      setLocalError(null);
      await onShare(user.id);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to share profile');
    } finally {
      setIsLoading(false);
    }
  }, [onShare, user.id, isLoading]);

  const handleEdit = useCallback(async () => {
    if (!onEdit || isLoading) return;
    
    try {
      setIsLoading(true);
      setLocalError(null);
      await onEdit(user.id);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to edit profile');
    } finally {
      setIsLoading(false);
    }
  }, [onEdit, user.id, isLoading]);

  const handleContact = useCallback(async () => {
    if (!onContact || isLoading) return;
    
    try {
      setIsLoading(true);
      setLocalError(null);
      await onContact(user.id);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to contact user');
    } finally {
      setIsLoading(false);
    }
  }, [onContact, user.id, isLoading]);

  // Loading state
  if (loading) {
    return (
      <Card className={cn('w-full animate-pulse', className)} data-testid="loading-skeleton">
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
    );
  }

  // Error state - show inline instead of replacing entire component
  const errorDisplay = localError && (
    <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
      <div className="flex items-center space-x-2 text-destructive">
        <Shield className="h-4 w-4" />
        <span className="text-sm font-medium">Error loading profile</span>
      </div>
      <p className="text-sm text-muted-foreground mt-1">{localError}</p>
    </div>
  );

  // Minimal variant
  if (variant === 'minimal') {
    return (
      <Card 
        className={cn(
          'w-full transition-all duration-200',
          interactive && 'hover:shadow-md cursor-pointer',
          animate && 'animate-in fade-in-0 slide-in-from-bottom-2',
          className
        )}
        onMouseEnter={() => interactive && setIsHovered(true)}
        onMouseLeave={() => interactive && setIsHovered(false)}
        data-testid="user-profile-card-minimal"
      >
        <CardContent className="p-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={displayName} />
              <AvatarFallback className="text-sm">{avatarFallback}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-sm truncate">{displayName}</h3>
                {isVerified && (
                  <CheckCircle className="h-3 w-3 text-blue-500 flex-shrink-0" data-testid="verified-badge" />
                )}
                {isOnline && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" data-testid="online-indicator" />
                )}
              </div>
              {displayLocation && (
                <p className="text-xs text-muted-foreground truncate flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {displayLocation}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <Card 
        className={cn(
          'w-full transition-all duration-200',
          interactive && 'hover:shadow-md',
          animate && 'animate-in fade-in-0 slide-in-from-bottom-2',
          className
        )}
        data-testid="user-profile-card-compact"
      >
        <CardContent className="p-4">
          {errorDisplay}
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar} alt={displayName} />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-sm truncate">{displayName}</h3>
                {isVerified && (
                  <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" data-testid="verified-badge" />
                )}
                {isOnline && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" data-testid="online-indicator" />
                )}
                {isPremium && (
                  <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" data-testid="premium-badge" />
                )}
              </div>
              {displayBio && (
                <p className="text-xs text-muted-foreground truncate">{displayBio}</p>
              )}
              {displayLocation && (
                <p className="text-xs text-muted-foreground truncate flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {displayLocation}
                </p>
              )}
            </div>
            {showActions && (
              <Button
                size="sm"
                variant={isFollowing ? "outline" : "default"}
                onClick={handleFollow}
                disabled={isLoading}
                className="flex-shrink-0"
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Premium variant
  if (variant === 'premium') {
    return (
      <Card 
        className={cn(
          'w-full relative overflow-hidden transition-all duration-300',
          interactive && 'hover:shadow-xl hover:scale-[1.02]',
          animate && 'animate-in fade-in-0 slide-in-from-bottom-4',
          'bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-200',
          className
        )}
        data-testid="user-profile-card-premium"
      >
        {/* Premium badge */}
        <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-3 py-1 rounded-bl-lg text-xs font-semibold">
          <Star className="h-3 w-3 inline mr-1" />
          Premium
        </div>
        
        {errorDisplay}
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-24 w-24 ring-4 ring-amber-200">
                  <AvatarImage src={user.avatar} alt={displayName} />
                  <AvatarFallback className="text-xl bg-amber-100">{avatarFallback}</AvatarFallback>
                </Avatar>
                {isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-amber-50" data-testid="online-indicator" />
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-bold text-amber-900">{displayName}</h2>
                  {isVerified && (
                    <CheckCircle className="h-6 w-6 text-blue-500" data-testid="verified-badge" />
                  )}
                  <Star className="h-6 w-6 text-amber-500" data-testid="premium-badge" />
                </div>
                {displayBio && (
                  <p className="text-amber-800 max-w-md">{displayBio}</p>
                )}
                <div className="flex items-center space-x-4 text-sm text-amber-700">
                  {displayLocation && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{displayLocation}</span>
                    </div>
                  )}
                  {user.joinDate && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {user.joinDate}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Skills and Interests */}
          {showSkills && user.skills && user.skills.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-amber-800">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-amber-200 text-amber-800 hover:bg-amber-300">
                    <Zap className="h-3 w-3 mr-1" />
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          {showStats && (
            <div className="grid grid-cols-3 gap-4 py-4 border-t border-amber-200">
              {user.followersCount !== undefined && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-900">{user.followersCount.toLocaleString()}</div>
                  <div className="text-sm text-amber-700">Followers</div>
                </div>
              )}
              {user.followingCount !== undefined && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-900">{user.followingCount.toLocaleString()}</div>
                  <div className="text-sm text-amber-700">Following</div>
                </div>
              )}
              {user.eventsCount !== undefined && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-900">{user.eventsCount}</div>
                  <div className="text-sm text-amber-700">Events</div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex items-center space-x-2 pt-4 border-t border-amber-200">
              <Button
                variant={isFollowing ? "outline" : "default"}
                onClick={handleFollow}
                disabled={isLoading}
                className="flex-1 bg-amber-600 hover:bg-amber-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
              <Button
                variant="outline"
                onClick={handleMessage}
                disabled={isLoading}
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Featured variant
  if (variant === 'featured') {
    return (
      <Card 
        className={cn(
          'w-full relative overflow-hidden transition-all duration-300',
          interactive && 'hover:shadow-2xl hover:scale-[1.03]',
          animate && 'animate-in fade-in-0 slide-in-from-bottom-6',
          'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 border-purple-200',
          className
        )}
        data-testid="user-profile-card-featured"
      >
        {/* Featured badge */}
        <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-bl-lg text-sm font-bold">
          <Award className="h-4 w-4 inline mr-2" />
          Featured
        </div>
        
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-500 transform rotate-12 scale-150"></div>
        </div>
        
        {errorDisplay}
        <CardHeader className="pb-4 relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-28 w-28 ring-4 ring-purple-200">
                  <AvatarImage src={user.avatar} alt={displayName} />
                  <AvatarFallback className="text-2xl bg-purple-100">{avatarFallback}</AvatarFallback>
                </Avatar>
                {isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-purple-50" data-testid="online-indicator" />
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <h2 className="text-3xl font-bold text-purple-900">{displayName}</h2>
                  {isVerified && (
                    <CheckCircle className="h-7 w-7 text-blue-500" data-testid="verified-badge" />
                  )}
                  <Award className="h-7 w-7 text-purple-500" data-testid="featured-badge" />
                </div>
                {displayBio && (
                  <p className="text-purple-800 max-w-lg text-lg">{displayBio}</p>
                )}
                <div className="flex items-center space-x-6 text-sm text-purple-700">
                  {displayLocation && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{displayLocation}</span>
                    </div>
                  )}
                  {user.rating && (
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{user.rating}/5 ({user.reviewCount} reviews)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 relative z-10">
          {/* Interests */}
          {showInterests && user.interests && user.interests.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-800 text-lg">Interests</h4>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest, index) => (
                  <Badge key={index} variant="secondary" className="bg-purple-200 text-purple-800 hover:bg-purple-300">
                    <Heart className="h-3 w-3 mr-1" />
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Stats */}
          {showStats && (
            <div className="grid grid-cols-4 gap-4 py-6 border-t border-purple-200">
              {user.followersCount !== undefined && (
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-900">{user.followersCount.toLocaleString()}</div>
                  <div className="text-sm text-purple-700">Followers</div>
                </div>
              )}
              {user.followingCount !== undefined && (
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-900">{user.followingCount.toLocaleString()}</div>
                  <div className="text-sm text-purple-700">Following</div>
                </div>
              )}
              {user.eventsCount !== undefined && (
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-900">{user.eventsCount}</div>
                  <div className="text-sm text-purple-700">Events</div>
                </div>
              )}
              {user.projectsCount !== undefined && (
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-900">{user.projectsCount}</div>
                  <div className="text-sm text-purple-700">Projects</div>
                </div>
              )}
            </div>
          )}

          {/* Enhanced Actions */}
          {showActions && (
            <div className="flex items-center space-x-3 pt-6 border-t border-purple-200">
              <Button
                variant={isFollowing ? "outline" : "default"}
                onClick={handleFollow}
                disabled={isLoading}
                className="flex-1 bg-purple-600 hover:bg-purple-700 h-12 text-lg"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
              <Button
                variant="outline"
                onClick={handleMessage}
                disabled={isLoading}
                className="border-purple-300 text-purple-700 hover:bg-purple-50 h-12 text-lg"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Message
              </Button>
              <Button
                variant="outline"
                onClick={handleContact}
                disabled={isLoading}
                className="border-purple-300 text-purple-700 hover:bg-purple-50 h-12 text-lg"
              >
                <Phone className="h-5 w-5 mr-2" />
                Contact
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default and detailed variants
  return (
    <Card 
      className={cn(
        'w-full transition-all duration-200',
        interactive && 'hover:shadow-md',
        animate && 'animate-in fade-in-0 slide-in-from-bottom-2',
        className
      )}
      data-testid="user-profile-card-default"
    >
      {errorDisplay}
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatar} alt={displayName} />
                <AvatarFallback className="text-lg">{avatarFallback}</AvatarFallback>
              </Avatar>
              {isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" data-testid="online-indicator" />
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold">{displayName}</h2>
                {isVerified && (
                  <CheckCircle className="h-5 w-5 text-blue-500" data-testid="verified-badge" />
                )}
                {user.badges?.includes('trending') && (
                  <TrendingUp className="h-5 w-5 text-orange-500" data-testid="trending-badge" />
                )}
                {isPremium && (
                  <Star className="h-5 w-5 text-yellow-500" data-testid="premium-badge" />
                )}
              </div>
              {displayBio && (
                <p className="text-muted-foreground">{displayBio}</p>
              )}
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                {displayLocation && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{displayLocation}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
              </div>
            </div>
          </div>
          {showActions && (
            <div className="flex items-center space-x-2">
              <Button
                variant={isFollowing ? "outline" : "default"}
                onClick={handleFollow}
                disabled={isLoading}
                className="flex-shrink-0"
                aria-label={`${isFollowing ? 'Unfollow' : 'Follow'} ${displayName}`}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {isFollowing ? 'Following' : 'Follow'}
                {isLoading && <span data-testid="loading-indicator" className="ml-2">...</span>}
              </Button>
              <Button
                variant="outline"
                onClick={handleMessage}
                disabled={isLoading}
                className="flex-shrink-0"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEdit}
                  disabled={isLoading}
                  className="flex-shrink-0"
                  aria-label="Edit profile"
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                disabled={isLoading}
                className="flex-shrink-0"
                aria-label="Share profile"
              >
                <Share2 className="h-4 w-4" />
                <span className="sr-only">Share</span>
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Skills */}
        {showSkills && user.skills && user.skills.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  <Zap className="h-3 w-3 mr-1" />
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        {showStats && (user.followersCount !== undefined || user.followingCount !== undefined) && (
          <div className="flex items-center space-x-6 py-4 border-t">
            {user.followersCount !== undefined && (
              <div className="text-center">
                <div className="text-2xl font-bold">{user.followersCount.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </div>
            )}
            {user.followingCount !== undefined && (
              <div className="text-center">
                <div className="text-2xl font-bold">{user.followingCount.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Following</div>
              </div>
            )}
            {user.eventsCount !== undefined && (
              <div className="text-center">
                <div className="text-2xl font-bold">{user.eventsCount}</div>
                <div className="text-sm text-muted-foreground">Events</div>
              </div>
            )}
          </div>
        )}

        {/* Social Links */}
        {showSocialLinks && user.socialLinks && (
          <div className="flex items-center space-x-2 pt-4 border-t">
            {user.socialLinks.twitter && (
              <Button variant="ghost" size="sm" asChild>
                <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <Users className="h-4 w-4" />
                  <span className="sr-only">Twitter</span>
                </a>
              </Button>
            )}
            {user.socialLinks.linkedin && (
              <Button variant="ghost" size="sm" asChild>
                <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <User className="h-4 w-4" />
                  <span className="sr-only">LinkedIn</span>
                </a>
              </Button>
            )}
            {user.socialLinks.github && (
              <Button variant="ghost" size="sm" asChild>
                <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <ExternalLink className="h-4 w-4" />
                  <span className="sr-only">GitHub</span>
                </a>
              </Button>
            )}
            {user.socialLinks.website && (
              <Button variant="ghost" size="sm" asChild>
                <a href={user.socialLinks.website} target="_blank" rel="noopener noreferrer" aria-label="Website">
                  <Globe className="h-4 w-4" />
                  <span className="sr-only">Website</span>
                </a>
              </Button>
            )}
            {user.socialLinks.phone && (
              <Button variant="ghost" size="sm" onClick={handleContact} aria-label="Phone">
                <Phone className="h-4 w-4" />
                <span className="sr-only">Phone</span>
              </Button>
            )}
          </div>
        )}

        {/* View Profile Button */}
        {onViewProfile && (
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleViewProfile}
              disabled={isLoading}
              className="w-full"
            >
              <User className="h-4 w-4 mr-2" />
              View Full Profile
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserProfileCard;
