import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Settings,
  User,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { PrivacyIndicator, PrivacyLevel } from './PrivacyIndicator';
import { anonymousHandleService } from '@/services/anonymousHandleService';
import { supabase } from '@/integrations/supabase/client';

interface AnonymousUserDisplayProps {
  userId: string;
  showPrivacyControls?: boolean;
  showRegenerateButton?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onPrivacyChange?: (level: PrivacyLevel) => void;
}

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  is_anonymous: boolean;
  privacy_level: PrivacyLevel;
  avatar_url?: string;
  is_verified: boolean;
}

export const AnonymousUserDisplay: React.FC<AnonymousUserDisplayProps> = ({
  userId,
  showPrivacyControls = false,
  showRegenerateButton = false,
  size = 'md',
  className,
  onPrivacyChange
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, display_name, is_anonymous, privacy_level, avatar_url, is_verified')
          .eq('user_id', userId)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        setProfile(data);
      } catch (error) {
        console.error('Error in fetchProfile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const handleRegenerateHandle = async () => {
    try {
      setRegenerating(true);
      const result = await anonymousHandleService.regenerateAnonymousHandle(userId);
      
      if (result.success && result.handle) {
        // Update local state
        setProfile(prev => prev ? {
          ...prev,
          username: result.handle!.username,
          display_name: result.handle!.displayName
        } : null);
      }
    } catch (error) {
      console.error('Error regenerating handle:', error);
    } finally {
      setRegenerating(false);
    }
  };

  const handlePrivacyLevelChange = async (level: PrivacyLevel) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          privacy_level: level,
          is_anonymous: level === 'anonymous'
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating privacy level:', error);
        return;
      }

      setProfile(prev => prev ? { ...prev, privacy_level: level, is_anonymous: level === 'anonymous' } : null);
      onPrivacyChange?.(level);
    } catch (error) {
      console.error('Error in handlePrivacyLevelChange:', error);
    }
  };

  if (loading) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={cn('flex items-center gap-2 text-muted-foreground', className)}>
        <User className="h-4 w-4" />
        <span className="text-sm">User not found</span>
      </div>
    );
  }

  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base'
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Avatar */}
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={profile.avatar_url} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {getInitials(profile.display_name)}
          </AvatarFallback>
        </Avatar>
        
        {/* Privacy indicator overlay */}
        {profile.is_anonymous && (
          <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-0.5">
            <Shield className="h-3 w-3 text-white" />
          </div>
        )}
        
        {/* Verification badge */}
        {profile.is_verified && (
          <div className="absolute -top-1 -right-1 bg-green-600 rounded-full p-0.5">
            <UserCheck className="h-3 w-3 text-white" />
          </div>
        )}
      </div>

      {/* User info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            'font-medium truncate',
            size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
          )}>
            {profile.is_anonymous ? profile.display_name : profile.username}
          </span>
          
          {profile.is_verified && (
            <UserCheck className="h-4 w-4 text-green-600" />
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-1">
          <PrivacyIndicator 
            privacyLevel={profile.privacy_level}
            isAnonymous={profile.is_anonymous}
            isVerified={profile.is_verified}
            size="sm"
          />
          
          {profile.is_anonymous && (
            <Badge variant="secondary" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Anonymous
            </Badge>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {showRegenerateButton && profile.is_anonymous && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRegenerateHandle}
            disabled={regenerating}
            className="h-8 w-8 p-0"
          >
            {regenerating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        )}
        
        {showPrivacyControls && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

// Compact version for lists
export const AnonymousUserCompact: React.FC<{
  userId: string;
  className?: string;
}> = ({ userId, className }) => {
  return (
    <AnonymousUserDisplay
      userId={userId}
      size="sm"
      className={className}
    />
  );
};

// Privacy controls component
interface PrivacyControlsProps {
  userId: string;
  currentLevel: PrivacyLevel;
  onLevelChange: (level: PrivacyLevel) => void;
  className?: string;
}

export const PrivacyControls: React.FC<PrivacyControlsProps> = ({
  userId,
  currentLevel,
  onLevelChange,
  className
}) => {
  const [showControls, setShowControls] = useState(false);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Privacy Settings</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowControls(!showControls)}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
      
      {showControls && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            Choose how much information you want to share
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {(['anonymous', 'private', 'public'] as PrivacyLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => onLevelChange(level)}
                className={cn(
                  'flex items-center gap-2 p-2 rounded-lg border text-left transition-colors',
                  currentLevel === level
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-input hover:bg-accent'
                )}
              >
                <PrivacyIndicator 
                  privacyLevel={level}
                  size="sm"
                  showLabel={false}
                />
                <span className="text-sm capitalize">{level}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
