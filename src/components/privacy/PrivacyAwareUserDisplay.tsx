/**
 * Privacy-Aware User Display Component
 * 
 * This component ensures consistent anonymous-by-default display throughout the app.
 * It respects user privacy settings and provides appropriate display names.
 */

import React, { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, UserCheck, Settings, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserDisplayInfo } from '@/utils/anonymousDisplay';
import { useAuth } from '@/hooks/useAuth';

export interface PrivacyAwareUserDisplayProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'detailed' | 'card';
  showAvatar?: boolean;
  showBadges?: boolean;
  showPrivacyControls?: boolean;
  showIdentityToggle?: boolean;
  forceAnonymous?: boolean;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export const PrivacyAwareUserDisplay: React.FC<PrivacyAwareUserDisplayProps> = ({
  userId,
  size = 'md',
  variant = 'default',
  showAvatar = true,
  showBadges = true,
  showPrivacyControls = false,
  showIdentityToggle = false,
  forceAnonymous = false,
  className,
  onClick,
  interactive = true
}) => {
  const { user: currentUser } = useAuth();
  const { displayInfo, loading } = useUserDisplayInfo(
    userId, 
    currentUser?.id, 
    forceAnonymous
  );

  const sizeClasses = useMemo(() => {
    switch (size) {
      case 'sm':
        return {
          avatar: 'h-6 w-6',
          text: 'text-sm',
          icon: 'h-3 w-3'
        };
      case 'lg':
        return {
          avatar: 'h-12 w-12',
          text: 'text-lg',
          icon: 'h-5 w-5'
        };
      default:
        return {
          avatar: 'h-8 w-8',
          text: 'text-base',
          icon: 'h-4 w-4'
        };
    }
  }, [size]);

  if (loading) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        {showAvatar && (
          <div className={cn('rounded-full bg-gray-200 animate-pulse', sizeClasses.avatar)} />
        )}
        <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
      </div>
    );
  }

  if (!displayInfo) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        {showAvatar && (
          <Avatar className={sizeClasses.avatar}>
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
        )}
        <span className={cn('text-gray-500', sizeClasses.text)}>
          Anonymous User
        </span>
      </div>
    );
  }

  const handleClick = () => {
    if (interactive && onClick) {
      onClick();
    }
  };

  const isOwnProfile = currentUser?.id === userId;

  const renderAvatar = () => {
    if (!showAvatar) return null;

    return (
      <Avatar className={sizeClasses.avatar}>
        <AvatarImage 
          src={displayInfo.avatarUrl} 
          alt={displayInfo.displayName}
          className={displayInfo.isAnonymous ? 'opacity-50' : ''}
        />
        <AvatarFallback className={displayInfo.isAnonymous ? 'bg-gray-100' : ''}>
          {displayInfo.fallbackInitial}
        </AvatarFallback>
      </Avatar>
    );
  };

  const renderBadges = () => {
    if (!showBadges) return null;

    return (
      <div className="flex items-center space-x-1">
        {displayInfo.isAnonymous && (
          <Badge variant="secondary" className="text-xs">
            <Shield className={cn('mr-1', sizeClasses.icon)} />
            Anonymous
          </Badge>
        )}
        
        {!displayInfo.isAnonymous && displayInfo.canRevealIdentity && (
          <Badge variant="default" className="text-xs">
            <UserCheck className={cn('mr-1', sizeClasses.icon)} />
            Verified
          </Badge>
        )}
      </div>
    );
  };

  const renderPrivacyControls = () => {
    if (!showPrivacyControls || !isOwnProfile) return null;

    return (
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          title="Privacy Settings"
        >
          <Settings className={sizeClasses.icon} />
        </Button>
        
        {showIdentityToggle && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            title={displayInfo.isAnonymous ? "Reveal Identity" : "Hide Identity"}
          >
            {displayInfo.isAnonymous ? (
              <Eye className={sizeClasses.icon} />
            ) : (
              <EyeOff className={sizeClasses.icon} />
            )}
          </Button>
        )}
      </div>
    );
  };

  if (variant === 'compact') {
    return (
      <div 
        className={cn(
          'flex items-center space-x-2',
          interactive && 'cursor-pointer hover:bg-gray-50 rounded-md p-1',
          className
        )}
        onClick={handleClick}
      >
        {renderAvatar()}
        <span className={cn(
          'font-medium truncate',
          displayInfo.isAnonymous && 'text-gray-600',
          sizeClasses.text
        )}>
          {displayInfo.displayName}
        </span>
        {renderBadges()}
        {renderPrivacyControls()}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div 
        className={cn(
          'flex items-start space-x-3 p-3 rounded-lg border',
          interactive && 'cursor-pointer hover:bg-gray-50',
          className
        )}
        onClick={handleClick}
      >
        {renderAvatar()}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className={cn(
              'font-semibold truncate',
              displayInfo.isAnonymous && 'text-gray-600',
              sizeClasses.text
            )}>
              {displayInfo.displayName}
            </span>
            {renderBadges()}
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>
              {displayInfo.isAnonymous ? 'Anonymous User' : 'Verified User'}
            </span>
            {isOwnProfile && (
              <span className="text-blue-600">• You</span>
            )}
          </div>
          
          {renderPrivacyControls()}
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div 
        className={cn(
          'p-4 rounded-lg border bg-white shadow-sm',
          interactive && 'cursor-pointer hover:shadow-md transition-shadow',
          className
        )}
        onClick={handleClick}
      >
        <div className="flex items-center space-x-3 mb-3">
          {renderAvatar()}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className={cn(
                'font-semibold truncate',
                displayInfo.isAnonymous && 'text-gray-600'
              )}>
                {displayInfo.displayName}
              </span>
              {renderBadges()}
            </div>
            
            <div className="text-sm text-gray-500">
              {displayInfo.isAnonymous ? 'Anonymous User' : 'Verified User'}
              {isOwnProfile && ' • You'}
            </div>
          </div>
          
          {renderPrivacyControls()}
        </div>
        
        {displayInfo.isAnonymous && (
          <div className="text-xs text-gray-400 bg-gray-50 rounded p-2">
            <Shield className="inline h-3 w-3 mr-1" />
            This user has chosen to remain anonymous
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div 
      className={cn(
        'flex items-center space-x-2',
        interactive && 'cursor-pointer hover:bg-gray-50 rounded-md p-1',
        className
      )}
      onClick={handleClick}
    >
      {renderAvatar()}
      <div className="flex-1 min-w-0">
        <span className={cn(
          'font-medium truncate',
          displayInfo.isAnonymous && 'text-gray-600',
          sizeClasses.text
        )}>
          {displayInfo.displayName}
        </span>
        {renderBadges()}
      </div>
      {renderPrivacyControls()}
    </div>
  );
};

// Export convenience components for common use cases
export const AnonymousUserDisplay = React.memo<Omit<PrivacyAwareUserDisplayProps, 'forceAnonymous'>>((props) => (
  <PrivacyAwareUserDisplay {...props} forceAnonymous={true} />
));

export const CompactUserDisplay = React.memo<Omit<PrivacyAwareUserDisplayProps, 'variant'>>((props) => (
  <PrivacyAwareUserDisplay {...props} variant="compact" />
));

export const DetailedUserDisplay = React.memo<Omit<PrivacyAwareUserDisplayProps, 'variant'>>((props) => (
  <PrivacyAwareUserDisplay {...props} variant="detailed" />
));

export const UserCardDisplay = React.memo<Omit<PrivacyAwareUserDisplayProps, 'variant'>>((props) => (
  <PrivacyAwareUserDisplay {...props} variant="card" />
));
