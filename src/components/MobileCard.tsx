import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

interface MobileCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileCardContentProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

interface MobileCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileCard({
  children,
  className,
  interactive = false,
  onClick,
  disabled = false,
  loading = false,
  variant = 'default',
  size = 'md'
}: MobileCardProps) {
  const baseClasses = cn(
    'mobile-card mobile-transition',
    {
      'mobile-card-interactive cursor-pointer': interactive && !disabled,
      'mobile-disabled': disabled,
      'mobile-loading': loading,
      'mobile-active': interactive && !disabled,
      'border-0 bg-transparent': variant === 'ghost',
      'shadow-lg': variant === 'elevated',
      'border-2': variant === 'outlined',
      'p-3': size === 'sm',
      'p-4': size === 'md',
      'p-6': size === 'lg',
    },
    className
  );

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <Card
      className={baseClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={interactive && !disabled ? 0 : undefined}
      role={interactive ? 'button' : undefined}
    >
      {children}
    </Card>
  );
}

export function MobileCardHeader({ children, className }: MobileCardHeaderProps) {
  return (
    <CardHeader className={cn('mobile-p-4 pb-2', className)}>
      {children}
    </CardHeader>
  );
}

export function MobileCardContent({ 
  children, 
  className, 
  padding = 'md' 
}: MobileCardContentProps) {
  const paddingClasses = {
    none: 'p-0',
    sm: 'mobile-p-2',
    md: 'mobile-p-4',
    lg: 'mobile-p-6'
  };

  return (
    <CardContent className={cn(paddingClasses[padding], className)}>
      {children}
    </CardContent>
  );
}

export function MobileCardFooter({ children, className }: MobileCardFooterProps) {
  return (
    <CardFooter className={cn('mobile-p-4 pt-2', className)}>
      {children}
    </CardFooter>
  );
}

// Mobile-specific card variants
export function MobileEventCard({ 
  title, 
  description, 
  image, 
  date, 
  location, 
  price, 
  onClick,
  className 
}: {
  title: string;
  description: string;
  image?: string;
  date: string;
  location: string;
  price?: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <MobileCard 
      interactive 
      onClick={onClick}
      className={cn('mobile-aspect-photo overflow-hidden', className)}
    >
      <div className="relative h-full">
        {image && (
          <div className="absolute inset-0">
            <img 
              src={image} 
              alt={title}
              className="mobile-img-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}
        
        <div className="relative h-full flex flex-col justify-end p-4 text-white">
          <div className="space-y-2">
            <h3 className="mobile-text-lg font-semibold line-clamp-2">{title}</h3>
            <p className="mobile-text-sm opacity-90 line-clamp-2">{description}</p>
            
            <div className="flex items-center justify-between mobile-text-xs">
              <div className="flex items-center gap-2">
                <span>{date}</span>
                <span>•</span>
                <span>{location}</span>
              </div>
              {price && (
                <span className="font-semibold">{price}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </MobileCard>
  );
}

export function MobileCommunityCard({
  title,
  description,
  memberCount,
  image,
  isPrivate,
  onClick,
  className
}: {
  title: string;
  description: string;
  memberCount: number;
  image?: string;
  isPrivate?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <MobileCard 
      interactive 
      onClick={onClick}
      className={cn('h-full', className)}
    >
      <MobileCardContent>
        <div className="flex items-start gap-3">
          {image && (
            <div className="flex-shrink-0">
              <img 
                src={image} 
                alt={title}
                className="w-12 h-12 rounded-lg mobile-img-cover"
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="mobile-text-base font-semibold truncate">{title}</h3>
              {isPrivate && (
                <span className="text-xs bg-muted px-2 py-1 rounded">Private</span>
              )}
            </div>
            
            <p className="mobile-text-sm text-muted-foreground line-clamp-2 mb-2">
              {description}
            </p>
            
            <div className="flex items-center gap-4 mobile-text-xs text-muted-foreground">
              <span>{memberCount} members</span>
            </div>
          </div>
        </div>
      </MobileCardContent>
    </MobileCard>
  );
}

export function MobilePostCard({
  author,
  content,
  images,
  likes,
  comments,
  timestamp,
  onClick,
  className
}: {
  author: {
    name: string;
    avatar?: string;
    verified?: boolean;
  };
  content: string;
  images?: string[];
  likes: number;
  comments: number;
  timestamp: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <MobileCard 
      interactive 
      onClick={onClick}
      className={cn('w-full', className)}
    >
      <MobileCardContent>
        <div className="space-y-3">
          {/* Author */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              {author.avatar ? (
                <img 
                  src={author.avatar} 
                  alt={author.name}
                  className="w-full h-full rounded-full mobile-img-cover"
                />
              ) : (
                <span className="mobile-text-sm font-semibold">
                  {author.name[0]}
                </span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="mobile-text-sm font-semibold truncate">{author.name}</h4>
                {author.verified && (
                  <span className="text-xs bg-blue-500 text-white px-1 rounded">✓</span>
                )}
              </div>
              <p className="mobile-text-xs text-muted-foreground">{timestamp}</p>
            </div>
          </div>
          
          {/* Content */}
          <p className="mobile-text-sm leading-relaxed">{content}</p>
          
          {/* Images */}
          {images && images.length > 0 && (
            <div className="grid grid-cols-1 gap-2">
              {images.map((image, index) => (
                <img 
                  key={index}
                  src={image} 
                  alt=""
                  className="w-full rounded-lg mobile-img-cover"
                />
              ))}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-4 mobile-text-xs text-muted-foreground">
              <span>{likes} likes</span>
              <span>{comments} comments</span>
            </div>
          </div>
        </div>
      </MobileCardContent>
    </MobileCard>
  );
}
