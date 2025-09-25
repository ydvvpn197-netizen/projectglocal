import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  UserCheck, 
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type PrivacyLevel = 'anonymous' | 'private' | 'public' | 'verified';
export type PrivacyStatus = 'protected' | 'exposed' | 'unknown';

interface PrivacyIndicatorProps {
  privacyLevel: PrivacyLevel;
  privacyStatus?: PrivacyStatus;
  isAnonymous?: boolean;
  isVerified?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  tooltip?: boolean;
}

const privacyConfig = {
  anonymous: {
    icon: Shield,
    label: 'Anonymous',
    description: 'Your identity is protected',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    iconColor: 'text-blue-600',
    status: 'protected' as PrivacyStatus
  },
  private: {
    icon: Lock,
    label: 'Private',
    description: 'Limited visibility',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    iconColor: 'text-gray-600',
    status: 'protected' as PrivacyStatus
  },
  public: {
    icon: User,
    label: 'Public',
    description: 'Visible to everyone',
    color: 'bg-green-100 text-green-800 border-green-200',
    iconColor: 'text-green-600',
    status: 'exposed' as PrivacyStatus
  },
  verified: {
    icon: UserCheck,
    label: 'Verified',
    description: 'Identity verified',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    iconColor: 'text-purple-600',
    status: 'protected' as PrivacyStatus
  }
};

const statusConfig = {
  protected: {
    icon: CheckCircle,
    color: 'text-green-600',
    label: 'Protected'
  },
  exposed: {
    icon: AlertTriangle,
    color: 'text-yellow-600',
    label: 'Exposed'
  },
  unknown: {
    icon: Info,
    color: 'text-gray-600',
    label: 'Unknown'
  }
};

export const PrivacyIndicator: React.FC<PrivacyIndicatorProps> = ({
  privacyLevel,
  privacyStatus,
  isAnonymous = false,
  isVerified = false,
  showLabel = true,
  size = 'md',
  className,
  tooltip = true
}) => {
  const config = privacyConfig[privacyLevel];
  const statusInfo = privacyStatus ? statusConfig[privacyStatus] : null;
  
  const Icon = config.icon;
  const StatusIcon = statusInfo?.icon;
  
  const sizeClasses = {
    sm: 'h-4 w-4 text-xs',
    md: 'h-5 w-5 text-sm',
    lg: 'h-6 w-6 text-base'
  };

  const indicator = (
    <div className={cn(
      'inline-flex items-center gap-1.5 px-2 py-1 rounded-full border transition-colors',
      config.color,
      sizeClasses[size],
      className
    )}>
      <Icon className={cn('h-3 w-3', config.iconColor)} />
      {showLabel && <span className="font-medium">{config.label}</span>}
      {isVerified && (
        <CheckCircle className="h-3 w-3 text-blue-600" />
      )}
      {statusInfo && (
        <StatusIcon className={cn('h-3 w-3', statusInfo.color)} />
      )}
    </div>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {indicator}
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">{config.label}</p>
              <p className="text-xs text-muted-foreground">{config.description}</p>
              {isAnonymous && (
                <p className="text-xs text-blue-600">Your identity is protected</p>
              )}
              {isVerified && (
                <p className="text-xs text-purple-600">Identity verified</p>
              )}
              {statusInfo && (
                <p className="text-xs text-muted-foreground">
                  Status: {statusInfo.label}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return indicator;
};

// Privacy level selector component
interface PrivacyLevelSelectorProps {
  currentLevel: PrivacyLevel;
  onLevelChange: (level: PrivacyLevel) => void;
  disabled?: boolean;
  className?: string;
}

export const PrivacyLevelSelector: React.FC<PrivacyLevelSelectorProps> = ({
  currentLevel,
  onLevelChange,
  disabled = false,
  className
}) => {
  const levels: PrivacyLevel[] = ['anonymous', 'private', 'public', 'verified'];

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium">Privacy Level</label>
      <div className="grid grid-cols-2 gap-2">
        {levels.map((level) => {
          const config = privacyConfig[level];
          const Icon = config.icon;
          const isSelected = currentLevel === level;
          
          return (
            <button
              key={level}
              onClick={() => onLevelChange(level)}
              disabled={disabled}
              className={cn(
                'flex items-center gap-2 p-3 rounded-lg border transition-all',
                'hover:bg-accent hover:text-accent-foreground',
                isSelected 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-background border-input',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Icon className="h-4 w-4" />
              <div className="text-left">
                <p className="text-sm font-medium">{config.label}</p>
                <p className="text-xs text-muted-foreground">{config.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Privacy status indicator for posts/comments
interface ContentPrivacyIndicatorProps {
  isAnonymous: boolean;
  authorName?: string;
  showAuthor?: boolean;
  className?: string;
}

export const ContentPrivacyIndicator: React.FC<ContentPrivacyIndicatorProps> = ({
  isAnonymous,
  authorName,
  showAuthor = true,
  className
}) => {
  if (!showAuthor) return null;

  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      {isAnonymous ? (
        <>
          <Shield className="h-4 w-4 text-blue-600" />
          <span className="text-muted-foreground">Anonymous User</span>
        </>
      ) : (
        <>
          <User className="h-4 w-4 text-gray-600" />
          <span>{authorName || 'User'}</span>
        </>
      )}
    </div>
  );
};

// Privacy warning component
interface PrivacyWarningProps {
  type: 'data-collection' | 'public-post' | 'identity-exposure' | 'location-sharing';
  className?: string;
}

export const PrivacyWarning: React.FC<PrivacyWarningProps> = ({
  type,
  className
}) => {
  const warnings = {
    'data-collection': {
      icon: AlertTriangle,
      title: 'Data Collection Notice',
      message: 'This action will collect personal data. Your privacy settings will be respected.',
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200'
    },
    'public-post': {
      icon: Eye,
      title: 'Public Post Warning',
      message: 'This post will be visible to everyone. Consider using anonymous mode.',
      color: 'text-orange-600 bg-orange-50 border-orange-200'
    },
    'identity-exposure': {
      icon: User,
      title: 'Identity Exposure',
      message: 'Your real identity may be exposed. Switch to anonymous mode for privacy.',
      color: 'text-red-600 bg-red-50 border-red-200'
    },
    'location-sharing': {
      icon: EyeOff,
      title: 'Location Sharing',
      message: 'Your location will be shared. This can reveal your identity.',
      color: 'text-purple-600 bg-purple-50 border-purple-200'
    }
  };

  const warning = warnings[type];
  const Icon = warning.icon;

  return (
    <div className={cn(
      'flex items-start gap-3 p-3 rounded-lg border',
      warning.color,
      className
    )}>
      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-medium text-sm">{warning.title}</p>
        <p className="text-xs text-muted-foreground mt-1">{warning.message}</p>
      </div>
    </div>
  );
};
