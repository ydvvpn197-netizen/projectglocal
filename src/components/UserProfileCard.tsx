/**
 * UserProfileCard Component
 * 
 * A modern, responsive user profile card component that displays user information
 * with proper security validation and accessibility features.
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
  TrendingUp
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
  };
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
  showActions?: boolean;
  showStats?: boolean;
  showSocialLinks?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  loading?: boolean;
  error?: string | null;
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
  showActions = true,
  showStats = true,
  showSocialLinks = false,
  className,
  variant = 'default',
  loading = false,
  error = null
}) => {
  // State management
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(error);

  // Memoized computed values
  const displayName = useMemo(() => {
    if (!user.name || user.name.trim() === '') {
      return 'Anonymous User';
    }
    const validation = validateInput(user.name, 'userName');
    return validation.success ? user.name : 'Anonymous User';
  }, [user.name]);

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

  // Compact variant
  if (variant === 'compact') {
    return (
      <Card className={cn('w-full hover:shadow-md transition-shadow', className)}>
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
              </div>
              {displayBio && (
                <p className="text-xs text-muted-foreground truncate">{displayBio}</p>
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

  // Default and detailed variants
  return (
    <Card className={cn('w-full hover:shadow-md transition-shadow', className)}>
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
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                disabled={isLoading}
                className="flex-shrink-0"
                aria-label="Share profile"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">Share</span>
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
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
                  <ExternalLink className="h-4 w-4" />
                  <span className="sr-only">Website</span>
                </a>
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
