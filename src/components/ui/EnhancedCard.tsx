import React, { forwardRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Star, Bookmark, Share2 } from 'lucide-react';

interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  actions?: React.ReactNode;
  showActions?: boolean;
  loading?: boolean;
  hover?: boolean;
  clickable?: boolean;
  onAction?: (action: string) => void;
}

export const EnhancedCard = forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({
    title,
    description,
    badge,
    badgeVariant = 'default',
    actions,
    showActions = false,
    loading = false,
    hover = true,
    clickable = false,
    onAction,
    className,
    children,
    ...props
  }, ref) => {
    const handleAction = (action: string) => {
      onAction?.(action);
    };

    return (
      <Card
        ref={ref}
        className={cn(
          'transition-all duration-200',
          hover && 'hover:shadow-md hover:scale-[1.02]',
          clickable && 'cursor-pointer',
          loading && 'opacity-50 pointer-events-none',
          className
        )}
        {...props}
      >
        {(title || description || badge) && (
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                {title && (
                  <CardTitle className="text-lg font-semibold">
                    {title}
                  </CardTitle>
                )}
                {description && (
                  <CardDescription className="text-sm text-gray-600">
                    {description}
                  </CardDescription>
                )}
              </div>
              {badge && (
                <Badge variant={badgeVariant} className="ml-2">
                  {badge}
                </Badge>
              )}
            </div>
          </CardHeader>
        )}
        
        <CardContent className="space-y-4">
          {children}
          
          {showActions && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAction('like')}
                  className="flex items-center space-x-1"
                >
                  <Star className="h-4 w-4" />
                  <span>Like</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAction('bookmark')}
                  className="flex items-center space-x-1"
                >
                  <Bookmark className="h-4 w-4" />
                  <span>Save</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAction('share')}
                  className="flex items-center space-x-1"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction('more')}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {actions && (
            <div className="flex items-center justify-end space-x-2">
              {actions}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);

EnhancedCard.displayName = 'EnhancedCard';
