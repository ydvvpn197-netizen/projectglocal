import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  Star, 
  MapPin, 
  Clock, 
  Users, 
  Heart, 
  Share2, 
  MessageCircle,
  ExternalLink,
  Calendar,
  DollarSign,
  Shield,
  CheckCircle,
  AlertTriangle,
  Phone,
  Mail,
  Globe,
  Award,
  TrendingUp,
  BookOpen,
  Camera,
  Music,
  Palette,
  Mic,
  Video
} from 'lucide-react';

interface ServiceProvider {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  avatar_url?: string;
  location_city: string;
  location_state: string;
  is_verified: boolean;
  is_premium: boolean;
  rating: number;
  review_count: number;
  response_time: string;
  completion_rate: number;
}

interface ServiceListing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  subcategory?: string;
  duration: string;
  location_type: 'remote' | 'on-site' | 'both';
  availability_schedule: Record<string, any>;
  is_active: boolean;
  max_bookings_per_day: number;
  requires_approval: boolean;
  cancellation_policy: string;
  tags: string[];
  images: string[];
  created_at: string;
  updated_at: string;
  provider: ServiceProvider;
  booking_count: number;
  average_rating: number;
  is_featured: boolean;
}

interface ServiceListingCardProps {
  service: ServiceListing;
  onBook?: (serviceId: string) => void;
  onLike?: (serviceId: string) => void;
  onShare?: (serviceId: string) => void;
  onContact?: (serviceId: string, providerId: string) => void;
  compact?: boolean;
  showProvider?: boolean;
}

export const ServiceListingCard: React.FC<ServiceListingCardProps> = ({
  service,
  onBook,
  onLike,
  onShare,
  onContact,
  compact = false,
  showProvider = true
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (onLike) {
      onLike(service.id);
    }
    toast({
      title: isLiked ? "Removed from favorites" : "Added to favorites",
      description: isLiked ? "Service removed from your favorites" : "Service added to your favorites",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: service.title,
        text: service.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Service link copied to clipboard",
      });
    }
    if (onShare) {
      onShare(service.id);
    }
  };

  const handleBook = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to book services.",
        variant: "destructive",
      });
      return;
    }
    setIsBooked(true);
    if (onBook) {
      onBook(service.id);
    }
    toast({
      title: "Booking Request Sent",
      description: "Your booking request has been submitted to the provider.",
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'music': return <Music className="h-4 w-4" />;
      case 'photography': return <Camera className="h-4 w-4" />;
      case 'art': return <Palette className="h-4 w-4" />;
      case 'voice': return <Mic className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'education': return <BookOpen className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  const getLocationTypeColor = (locationType: string) => {
    switch (locationType) {
      case 'remote': return 'bg-blue-100 text-blue-800';
      case 'on-site': return 'bg-green-100 text-green-800';
      case 'both': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  if (compact) {
    return (
      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {service.images && service.images.length > 0 && (
              <img 
                src={service.images[0]} 
                alt={service.title}
                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
              />
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg truncate">{service.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryIcon(service.category)}
                      {service.category}
                    </Badge>
                    <Badge className={getLocationTypeColor(service.location_type)}>
                      {service.location_type}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {service.is_featured && (
                    <Badge className="bg-orange-500 text-white text-xs">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {service.provider.is_verified && (
                    <Badge className="bg-blue-500 text-white text-xs">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {service.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {service.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {service.booking_count} bookings
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {service.average_rating.toFixed(1)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">{formatPrice(service.price, service.currency)}</span>
                  <Button
                    size="sm"
                    onClick={handleBook}
                    disabled={isBooked}
                  >
                    {isBooked ? 'Booked' : 'Book Now'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Service Images */}
      {service.images && service.images.length > 0 && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={service.images[0]} 
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Overlay with badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {service.is_featured && (
              <Badge className="bg-orange-500 text-white">
                <TrendingUp className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
            {service.provider.is_verified && (
              <Badge className="bg-blue-500 text-white">
                <Shield className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
            <Badge className={getLocationTypeColor(service.location_type)}>
              {service.location_type}
            </Badge>
          </div>
          
          {/* Price badge */}
          <div className="absolute top-4 right-4">
            <Badge className="bg-black/70 text-white text-lg px-3 py-1">
              {formatPrice(service.price, service.currency)}
            </Badge>
          </div>
        </div>
      )}

      <CardContent className="p-6">
        {/* Service Title and Category */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2 line-clamp-2">{service.title}</h3>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-sm">
                {getCategoryIcon(service.category)}
                {service.category}
              </Badge>
              {service.subcategory && (
                <Badge variant="outline" className="text-xs">
                  {service.subcategory}
                </Badge>
              )}
              {service.tags && service.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {service.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{service.duration}</span>
          </div>
          
          <div className="flex items-center gap-3 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="capitalize">{service.location_type} service</span>
          </div>
          
          <div className="flex items-center gap-3 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{service.booking_count} bookings completed</span>
          </div>
          
          <div className="flex items-center gap-3 text-muted-foreground">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{service.average_rating.toFixed(1)} rating ({service.provider.review_count} reviews)</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {service.description}
        </p>

        {/* Provider Information */}
        {showProvider && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src={service.provider.avatar_url} />
              <AvatarFallback>{service.provider.display_name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{service.provider.display_name}</p>
                {service.provider.is_verified && (
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                )}
                {service.provider.is_premium && (
                  <Award className="h-4 w-4 text-yellow-500" />
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{service.provider.location_city}, {service.provider.location_state}</span>
                <span>{service.provider.response_time} response time</span>
                <span>{service.provider.completion_rate}% completion rate</span>
              </div>
            </div>
            {onContact && (
              <Button size="sm" variant="outline" onClick={() => onContact(service.id, service.provider.id)}>
                <MessageCircle className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        {/* Service Features */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Professional service</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-blue-500" />
            <span>Secure booking</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-orange-500" />
            <span>Quick response</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Star className="h-4 w-4 text-yellow-500" />
            <span>High rated</span>
          </div>
        </div>

        {/* Cancellation Policy */}
        {service.cancellation_policy && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Cancellation Policy:</strong> {service.cancellation_policy}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLike}
              className={isLiked ? 'text-red-500 border-red-500' : ''}
            >
              <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
              Like
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleBook}
              disabled={isBooked}
              className="bg-primary text-primary-foreground"
            >
              <Calendar className="w-4 h-4 mr-2" />
              {isBooked ? 'Booked' : 'Book Now'}
            </Button>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Contact Information</h4>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <span>{service.provider.display_name}@example.com</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span>+91 9876543210</span>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Portfolio
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
