import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, Crown, Star, Check } from 'lucide-react';

interface UserBadgesProps {
  isVerified?: boolean;
  isPremium?: boolean;
  planType?: 'free' | 'verified' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

export function UserBadges({ 
  isVerified, 
  isPremium, 
  planType, 
  size = 'sm',
  showTooltip = true,
  className = ''
}: UserBadgesProps) {
  const badges = [];

  // Determine badge states
  const verified = isVerified || planType === 'verified' || planType === 'premium';
  const premium = isPremium || planType === 'premium';

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const badgeSizes = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-2.5 py-1'
  };

  if (premium) {
    badges.push(
      <TooltipProvider key="premium">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="secondary" 
              className={`bg-purple-100 text-purple-800 border-purple-200 ${badgeSizes[size]} ${className}`}
            >
              <Crown className={`${sizeClasses[size]} mr-1`} />
              Premium
            </Badge>
          </TooltipTrigger>
          {showTooltip && (
            <TooltipContent>
              <p>Premium user with full platform access</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  } else if (verified) {
    badges.push(
      <TooltipProvider key="verified">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="secondary" 
              className={`bg-blue-100 text-blue-800 border-blue-200 ${badgeSizes[size]} ${className}`}
            >
              <Shield className={`${sizeClasses[size]} mr-1`} />
              Verified
            </Badge>
          </TooltipTrigger>
          {showTooltip && (
            <TooltipContent>
              <p>Verified user with enhanced credibility</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      {badges}
    </div>
  );
}

interface FeaturedBadgeProps {
  isFeatured?: boolean;
  featuredUntil?: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

export function FeaturedBadge({ 
  isFeatured, 
  featuredUntil, 
  size = 'sm',
  showTooltip = true,
  className = ''
}: FeaturedBadgeProps) {
  // Check if currently featured
  const currentlyFeatured = isFeatured && featuredUntil && new Date(featuredUntil) > new Date();

  if (!currentlyFeatured) {
    return null;
  }

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const badgeSizes = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-2.5 py-1'
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="secondary" 
            className={`bg-yellow-100 text-yellow-800 border-yellow-200 ${badgeSizes[size]} ${className}`}
          >
            <Star className={`${sizeClasses[size]} mr-1`} />
            Featured
          </Badge>
        </TooltipTrigger>
        {showTooltip && (
          <TooltipContent>
            <p>Featured content with enhanced visibility</p>
            {featuredUntil && (
              <p className="text-xs text-muted-foreground">
                Until {new Date(featuredUntil).toLocaleDateString()}
              </p>
            )}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

interface PlanBadgeProps {
  planType?: 'free' | 'verified' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

export function PlanBadge({ 
  planType = 'free', 
  size = 'sm',
  showTooltip = true,
  className = ''
}: PlanBadgeProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const badgeSizes = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-2.5 py-1'
  };

  const getBadgeConfig = () => {
    switch (planType) {
      case 'premium':
        return {
          icon: Crown,
          text: 'Premium',
          className: 'bg-purple-100 text-purple-800 border-purple-200',
          tooltip: 'Premium user with full platform access'
        };
      case 'verified':
        return {
          icon: Shield,
          text: 'Verified',
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          tooltip: 'Verified user with enhanced credibility'
        };
      default:
        return {
          icon: Check,
          text: 'Free',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          tooltip: 'Free user'
        };
    }
  };

  const config = getBadgeConfig();
  const IconComponent = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="secondary" 
            className={`${config.className} ${badgeSizes[size]} ${className}`}
          >
            <IconComponent className={`${sizeClasses[size]} mr-1`} />
            {config.text}
          </Badge>
        </TooltipTrigger>
        {showTooltip && (
          <TooltipContent>
            <p>{config.tooltip}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusBadge({ status, size = 'sm', className = '' }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-2.5 py-1'
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          text: 'Active',
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'inactive':
        return {
          text: 'Inactive',
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
      case 'pending':
        return {
          text: 'Pending',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'completed':
        return {
          text: 'Completed',
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'cancelled':
        return {
          text: 'Cancelled',
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      default:
        return {
          text: status,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge 
      variant="secondary" 
      className={`${config.className} ${sizeClasses[size]} ${className}`}
    >
      {config.text}
    </Badge>
  );
}

// Combined component for user profile display
interface UserProfileBadgesProps {
  user: {
    is_verified?: boolean;
    is_premium?: boolean;
    plan_type?: 'free' | 'verified' | 'premium';
  };
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

export function UserProfileBadges({ 
  user, 
  size = 'sm',
  showTooltip = true,
  className = ''
}: UserProfileBadgesProps) {
  return (
    <UserBadges
      isVerified={user.is_verified}
      isPremium={user.is_premium}
      planType={user.plan_type}
      size={size}
      showTooltip={showTooltip}
      className={className}
    />
  );
}
