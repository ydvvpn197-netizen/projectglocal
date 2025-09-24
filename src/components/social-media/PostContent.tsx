/**
 * PostContent Component
 * Displays the main content of a social media post with proper sanitization
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { SecurityUtils } from '@/config/security';

export interface PostContentProps {
  /** Post title (optional) */
  title?: string;
  
  /** Main post content */
  content: string;
  
  /** Post tags */
  tags?: string[];
  
  /** Post images */
  imageUrls?: string[];
  
  /** Event-specific information */
  eventInfo?: {
    date?: string;
    location?: string;
    priceRange?: string;
    contactInfo?: string;
  };
  
  /** Whether the post is anonymous */
  isAnonymous: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

export const PostContent: React.FC<PostContentProps> = ({
  title,
  content,
  tags,
  imageUrls,
  eventInfo,
  isAnonymous,
  className
}) => {
  const renderEventInfo = () => {
    if (!eventInfo) return null;
    
    const { date, location, priceRange, contactInfo } = eventInfo;
    
    return (
      <div className="bg-muted/50 rounded-lg p-3 mt-3 space-y-2">
        {date && (
          <div className="flex items-center text-sm">
            <span className="font-medium text-muted-foreground mr-2">Date:</span>
            <span>{SecurityUtils.sanitizeHtml(date)}</span>
          </div>
        )}
        
        {location && (
          <div className="flex items-center text-sm">
            <span className="font-medium text-muted-foreground mr-2">Location:</span>
            <span>{SecurityUtils.sanitizeHtml(location)}</span>
          </div>
        )}
        
        {priceRange && (
          <div className="flex items-center text-sm">
            <span className="font-medium text-muted-foreground mr-2">Price:</span>
            <span>{SecurityUtils.sanitizeHtml(priceRange)}</span>
          </div>
        )}
        
        {contactInfo && (
          <div className="flex items-center text-sm">
            <span className="font-medium text-muted-foreground mr-2">Contact:</span>
            <span>{SecurityUtils.sanitizeHtml(contactInfo)}</span>
          </div>
        )}
      </div>
    );
  };

  const renderImages = () => {
    if (!imageUrls || imageUrls.length === 0) return null;
    
    if (imageUrls.length === 1) {
      return (
        <div className="mt-3">
          <img
            src={SecurityUtils.sanitizeHtml(imageUrls[0])}
            alt="Post content"
            className="w-full h-auto rounded-lg max-h-96 object-cover"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      );
    }
    
    if (imageUrls.length === 2) {
      return (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {imageUrls.map((url, index) => (
            <img
              key={index}
              src={SecurityUtils.sanitizeHtml(url)}
              alt={`Post content ${index + 1}`}
              className="w-full h-48 object-cover rounded-lg"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ))}
        </div>
      );
    }
    
    return (
      <div className="mt-3 grid grid-cols-3 gap-2">
        {imageUrls.slice(0, 6).map((url, index) => (
          <div key={index} className="relative">
            <img
              src={SecurityUtils.sanitizeHtml(url)}
              alt={`Post content ${index + 1}`}
              className={cn(
                "w-full h-32 object-cover rounded-lg",
                index === 5 && imageUrls.length > 6 && "brightness-50"
              )}
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            {index === 5 && imageUrls.length > 6 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  +{imageUrls.length - 6}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderTags = () => {
    if (!tags || tags.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {tags.map((tag, index) => (
          <Badge 
            key={index} 
            variant="secondary" 
            className="text-xs cursor-pointer hover:bg-secondary/80 transition-colors"
          >
            #{SecurityUtils.sanitizeHtml(tag)}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div className={cn('px-4 pb-4', className)}>
      {/* Anonymous indicator */}
      {isAnonymous && (
        <div className="mb-2">
          <Badge variant="outline" className="text-xs">
            Anonymous Post
          </Badge>
        </div>
      )}
      
      {/* Post title */}
      {title && (
        <h3 className="text-lg font-semibold mb-2 break-words">
          {SecurityUtils.sanitizeHtml(title)}
        </h3>
      )}
      
      {/* Post content */}
      <div 
        className="text-sm leading-relaxed break-words whitespace-pre-wrap"
        dangerouslySetInnerHTML={{
          __html: SecurityUtils.sanitizeHtml(content)
        }}
      />
      
      {/* Event information */}
      {renderEventInfo()}
      
      {/* Post images */}
      {renderImages()}
      
      {/* Post tags */}
      {renderTags()}
    </div>
  );
};
