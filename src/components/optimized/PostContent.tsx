import React, { memo, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Calendar,
  MapPin,
  Clock,
  Users,
  DollarSign,
  CheckCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { OptimizedImage } from '../OptimizedImage';
import { SocialPost } from './SocialMediaPostOptimized';

interface PostContentProps {
  post: SocialPost;
  isExpanded: boolean;
  compact?: boolean;
}

export const PostContent: React.FC<PostContentProps> = memo(({
  post,
  isExpanded,
  compact = false
}) => {
  const [showAllImages, setShowAllImages] = useState(false);
  const [showAllOptions, setShowAllOptions] = useState(false);

  // Memoized content preview
  const contentPreview = useMemo(() => {
    if (compact || !isExpanded) {
      return post.content.length > 150 
        ? `${post.content.substring(0, 150)}...` 
        : post.content;
    }
    return post.content;
  }, [post.content, compact, isExpanded]);

  // Memoized event details
  const eventDetails = useMemo(() => {
    if (post.post_type !== 'event' || !post.event_date) return null;
    
    return {
      date: post.event_date,
      time: post.event_time,
      location: post.event_location,
      price: post.event_price,
      capacity: post.event_capacity,
      registrationRequired: post.event_registration_required
    };
  }, [post.post_type, post.event_date, post.event_time, post.event_location, post.event_price, post.event_capacity, post.event_registration_required]);

  // Memoized service details
  const serviceDetails = useMemo(() => {
    if (post.post_type !== 'service') return null;
    
    return {
      category: post.service_category,
      price: post.service_price,
      duration: post.service_duration,
      availability: post.service_availability
    };
  }, [post.post_type, post.service_category, post.service_price, post.service_duration, post.service_availability]);

  // Memoized poll details
  const pollDetails = useMemo(() => {
    if (post.post_type !== 'poll' || !post.poll_question) return null;
    
    return {
      question: post.poll_question,
      options: post.poll_options || [],
      endDate: post.poll_end_date,
      allowMultiple: post.poll_allow_multiple,
      results: post.poll_results
    };
  }, [post.post_type, post.poll_question, post.poll_options, post.poll_end_date, post.poll_allow_multiple, post.poll_results]);

  // Memoized images to display
  const imagesToShow = useMemo(() => {
    if (!post.images || post.images.length === 0) return [];
    
    if (showAllImages || post.images.length <= 3) {
      return post.images;
    }
    
    return post.images.slice(0, 3);
  }, [post.images, showAllImages]);

  // Memoized poll options to display
  const pollOptionsToShow = useMemo(() => {
    if (!pollDetails) return [];
    
    if (showAllOptions || pollDetails.options.length <= 3) {
      return pollDetails.options;
    }
    
    return pollDetails.options.slice(0, 3);
  }, [pollDetails, showAllOptions]);

  return (
    <div className={cn(
      "space-y-3",
      compact && "space-y-2"
    )}>
      {/* Post Title */}
      {post.title && (
        <h3 className={cn(
          "font-semibold text-gray-900",
          compact ? "text-base" : "text-lg"
        )}>
          {post.title}
        </h3>
      )}

      {/* Post Content */}
      <div className={cn(
        "text-gray-700 whitespace-pre-wrap",
        compact ? "text-sm" : "text-base"
      )}>
        {contentPreview}
      </div>

      {/* Event Details */}
      {eventDetails && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Event Details</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-3 w-3 text-green-600" />
                <span>{new Date(eventDetails.date).toLocaleDateString()}</span>
                {eventDetails.time && (
                  <>
                    <Clock className="h-3 w-3 text-green-600" />
                    <span>{eventDetails.time}</span>
                  </>
                )}
              </div>
              {eventDetails.location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-3 w-3 text-green-600" />
                  <span>{eventDetails.location}</span>
                </div>
              )}
              {eventDetails.price !== undefined && (
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-3 w-3 text-green-600" />
                  <span>₹{eventDetails.price}</span>
                </div>
              )}
              {eventDetails.capacity && (
                <div className="flex items-center space-x-2">
                  <Users className="h-3 w-3 text-green-600" />
                  <span>{eventDetails.capacity} spots available</span>
                </div>
              )}
              {eventDetails.registrationRequired && (
                <Badge variant="outline" className="text-xs">
                  Registration Required
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Details */}
      {serviceDetails && (
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-purple-800">Service Details</span>
            </div>
            <div className="space-y-1 text-sm">
              {serviceDetails.category && (
                <Badge variant="outline" className="text-xs">
                  {serviceDetails.category}
                </Badge>
              )}
              {serviceDetails.price !== undefined && (
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-3 w-3 text-purple-600" />
                  <span>₹{serviceDetails.price}</span>
                </div>
              )}
              {serviceDetails.duration && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-3 w-3 text-purple-600" />
                  <span>{serviceDetails.duration}</span>
                </div>
              )}
              {serviceDetails.availability && (
                <div className="text-purple-700">
                  {serviceDetails.availability}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Poll Details */}
      {pollDetails && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">Poll</span>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-sm">{pollDetails.question}</p>
              <div className="space-y-1">
                {pollOptionsToShow.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full" />
                    <span className="text-sm">{option}</span>
                    {pollDetails.results && (
                      <span className="text-xs text-yellow-600">
                        ({pollDetails.results.options[index]?.percentage || 0}%)
                      </span>
                    )}
                  </div>
                ))}
                {pollDetails.options.length > 3 && !showAllOptions && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllOptions(true)}
                    className="text-xs"
                  >
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Show {pollDetails.options.length - 3} more options
                  </Button>
                )}
              </div>
              {pollDetails.endDate && (
                <div className="text-xs text-yellow-600">
                  Ends: {new Date(pollDetails.endDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div className="space-y-2">
          <div className={cn(
            "grid gap-2",
            imagesToShow.length === 1 ? "grid-cols-1" : 
            imagesToShow.length === 2 ? "grid-cols-2" : 
            "grid-cols-2"
          )}>
            {imagesToShow.map((image, index) => (
              <div key={index} className="relative">
                <OptimizedImage
                  src={image}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                  lazy
                />
              </div>
            ))}
          </div>
          {post.images.length > 3 && !showAllImages && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllImages(true)}
              className="text-sm"
            >
              <ChevronDown className="h-4 w-4 mr-1" />
              Show {post.images.length - 3} more images
            </Button>
          )}
        </div>
      )}

      {/* Videos */}
      {post.videos && post.videos.length > 0 && (
        <div className="space-y-2">
          {post.videos.map((video, index) => (
            <video
              key={index}
              src={video}
              controls
              className="w-full rounded-lg"
              preload="metadata"
            />
          ))}
        </div>
      )}
    </div>
  );
});

PostContent.displayName = 'PostContent';
