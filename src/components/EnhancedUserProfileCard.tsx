/**
 * EnhancedUserProfileCard Component
 * 
 * An enhanced version of UserProfileCard with additional variants, animations,
 * and interactive features for better user experience.
 * 
 * @component
 * @example
 * ```tsx
 * <EnhancedUserProfileCard
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
  Calendar,
  MessageSquare
} from 'lucide-react';
import { SecurityUtils } from '@/config/security';
import { cn } from '@/lib/utils';

/**
 * Enhanced user profile data interface
 */
export interface EnhancedUserProfile {
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
export interface EnhancedUserProfileCardProps {
  user: EnhancedUserProfile;
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
  variant?: 'default' | 'compact' | 'detailed' | 'premium' | 'featured' | 'minimal' | 'enterprise' | 'dark';
  loading?: boolean;
  error?: string | null;
  animate?: boolean;
  interactive?: boolean;
}

/**
 * EnhancedUserProfileCard Component
 * 
 * Renders an enhanced user profile card with various display options and interaction handlers.
 * Includes security validation, accessibility features, responsive design, and animations.
 */
export const EnhancedUserProfileCard: React.FC<EnhancedUserProfileCardProps> = ({
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
  // Enhanced interactive features
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const handleLike = useCallback(() => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  }, [isLiked]);

  const handleCardHover = useCallback((hovered: boolean) => {
    setIsHovered(hovered);
  }, []);

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
    return user.bio;
  }, [user.bio]);

  const displayLocation = useMemo(() => {
    if (!user.location) return null;
    return user.location;
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
        data-testid="enhanced-user-profile-card-minimal"
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
        data-testid="enhanced-user-profile-card-compact"
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

  // Default variant
  if (variant === 'default') {
    return (
      <Card 
        className={cn(
          'w-full transition-all duration-200',
          interactive && 'hover:shadow-md hover:scale-[1.02]',
          animate && 'animate-in fade-in-0 slide-in-from-bottom-2',
          isHovered && 'shadow-lg ring-2 ring-primary/20',
          className
        )}
        data-testid="enhanced-user-profile-card-default"
        onMouseEnter={() => handleCardHover(true)}
        onMouseLeave={() => handleCardHover(false)}
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

          {/* Like Button */}
          <div className="pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={cn(
                "w-full transition-all duration-200",
                isLiked && "text-red-500 hover:text-red-600"
              )}
            >
              <Heart className={cn(
                "h-4 w-4 mr-2 transition-all duration-200",
                isLiked && "fill-current"
              )} />
              {isLiked ? 'Liked' : 'Like'} {likeCount > 0 && `(${likeCount})`}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Enterprise variant
  if (variant === 'enterprise') {
    return (
      <Card className={cn(
        'relative overflow-hidden border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 shadow-xl',
        'hover:shadow-2xl hover:border-slate-300 transition-all duration-300',
        className
      )}>
        {/* Enterprise Badge */}
        <div className="absolute top-0 right-0 bg-slate-800 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
          ENTERPRISE
        </div>
        
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            {/* Avatar Section */}
            <div className="relative">
              <Avatar className="h-20 w-20 border-4 border-slate-200">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-lg font-bold bg-slate-700 text-white">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {user.isOnline && (
                <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 border-4 border-white rounded-full" />
              )}
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-xl font-bold text-slate-800 truncate">{user.name}</h3>
                {user.verified && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              
              {user.bio && (
                <p className="text-slate-600 text-sm mb-3 line-clamp-2">{user.bio}</p>
              )}

              {/* Enterprise Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-800">{user.eventsCount || 0}</div>
                  <div className="text-xs text-slate-500">Events</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-800">{user.projectsCount || 0}</div>
                  <div className="text-xs text-slate-500">Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-800">{user.followersCount || 0}</div>
                  <div className="text-xs text-slate-500">Followers</div>
                </div>
              </div>

              {/* Skills */}
              {showSkills && user.skills && user.skills.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Key Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {user.skills.slice(0, 4).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-slate-100 border-slate-300">
                        {skill}
                      </Badge>
                    ))}
                    {user.skills.length > 4 && (
                      <Badge variant="outline" className="text-xs bg-slate-100 border-slate-300">
                        +{user.skills.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex space-x-2 mt-4 pt-4 border-t border-slate-200">
              <Button size="sm" className="flex-1 bg-slate-800 hover:bg-slate-900">
                <User className="h-4 w-4 mr-2" />
                View Profile
              </Button>
              <Button size="sm" variant="outline" className="border-slate-300">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Dark variant
  if (variant === 'dark') {
    return (
      <Card className={cn(
        'relative overflow-hidden border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl',
        'hover:shadow-slate-900/50 hover:border-slate-600 transition-all duration-300',
        className
      )}>
        {/* Dark Theme Badge */}
        <div className="absolute top-0 right-0 bg-slate-600 text-slate-200 px-3 py-1 text-xs font-bold rounded-bl-lg">
          DARK
        </div>
        
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            {/* Avatar Section */}
            <div className="relative">
              <Avatar className="h-20 w-20 border-4 border-slate-600 ring-2 ring-slate-500">
                <AvatarImage src={user.avatar} alt={displayName} />
                <AvatarFallback className="bg-slate-700 text-slate-200 text-xl font-bold">
                  {displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {user.isOnline && (
                <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 border-2 border-slate-800 rounded-full" />
              )}
            </div>
            
            {/* Content Section */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-white truncate">{displayName}</h3>
                    {user.verified && (
                      <Badge className="bg-blue-600 text-white text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {user.isPremium && (
                      <Badge className="bg-amber-600 text-white text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  
                  {displayBio && (
                    <p className="text-slate-300 text-sm mb-3 line-clamp-2">{displayBio}</p>
                  )}
                  
                  {displayLocation && (
                    <div className="flex items-center text-slate-400 text-sm mb-3">
                      <MapPin className="h-4 w-4 mr-2" />
                      {displayLocation}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Stats Row */}
              {showStats && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{user.followersCount || 0}</div>
                    <div className="text-xs text-slate-400">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{user.followingCount || 0}</div>
                    <div className="text-xs text-slate-400">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{user.eventsCount || 0}</div>
                    <div className="text-xs text-slate-400">Events</div>
                  </div>
                </div>
              )}
              
              {/* Skills */}
              {showSkills && user.skills && user.skills.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-slate-300 mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-slate-700 text-slate-200 border-slate-600">
                        {skill}
                      </Badge>
                    ))}
                    {user.skills.length > 3 && (
                      <Badge variant="secondary" className="bg-slate-700 text-slate-200 border-slate-600">
                        +{user.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              {showActions && (
                <div className="flex gap-2">
                  {onFollow && (
                    <Button
                      variant={user.isFollowing ? "default" : "outline"}
                      size="sm"
                      onClick={handleFollow}
                      disabled={isLoading}
                      className={cn(
                        "flex-1",
                        user.isFollowing 
                          ? "bg-slate-600 hover:bg-slate-700 text-white" 
                          : "border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                      )}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      {user.isFollowing ? 'Following' : 'Follow'}
                    </Button>
                  )}
                  
                  {onMessage && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleMessage}
                      disabled={isLoading}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null; // Should not happen for valid variants
};

export default EnhancedUserProfileCard;
