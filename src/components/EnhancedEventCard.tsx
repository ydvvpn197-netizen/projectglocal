import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { EventRSVPSystem } from '@/components/EventRSVPSystem';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Heart, 
  Share2, 
  Star,
  Ticket,
  User,
  MessageCircle,
  ExternalLink,
  Building2,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock3,
  UserCheck,
  UserX
} from 'lucide-react';
import { format } from 'date-fns';

interface GovernmentAuthority {
  id: string;
  name: string;
  department: string;
  level: 'local' | 'state' | 'national';
  contact_email: string;
  contact_phone?: string;
  jurisdiction: string;
}

interface EnhancedEvent {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  event_time: string;
  location_name: string;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  latitude?: number;
  longitude?: number;
  category?: string;
  max_attendees?: number;
  price: number;
  image_url?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  attendees_count: number;
  user_attending: boolean;
  organizer_name?: string;
  organizer_avatar?: string;
  requires_rsvp: boolean;
  rsvp_deadline?: string;
  allow_waitlist: boolean;
  waitlist_capacity?: number;
  government_authorities?: GovernmentAuthority[];
  is_public_event: boolean;
  requires_approval: boolean;
  contact_email?: string;
  contact_phone?: string;
  website_url?: string;
}

interface EnhancedEventCardProps {
  event: EnhancedEvent;
  onAttend?: (eventId: string) => void;
  onBook?: (eventId: string) => void;
  onLike?: (eventId: string) => void;
  onChat?: (eventId: string, organizerId: string) => void;
  onShare?: (eventId: string) => void;
  showOrganizer?: boolean;
  verified?: boolean;
  compact?: boolean;
}

export const EnhancedEventCard: React.FC<EnhancedEventCardProps> = ({
  event,
  onAttend,
  onBook,
  onLike,
  onChat,
  onShare,
  showOrganizer = true,
  verified = false,
  compact = false
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showRSVP, setShowRSVP] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleRSVPChange = (status: 'attending' | 'declined') => {
    if (onAttend) {
      onAttend(event.id);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (onLike) {
      onLike(event.id);
    }
    toast({
      title: isLiked ? "Removed from favorites" : "Added to favorites",
      description: isLiked ? "Event removed from your favorites" : "Event added to your favorites",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Event link copied to clipboard",
      });
    }
    if (onShare) {
      onShare(event.id);
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'music': return '🎵';
      case 'art': return '🎨';
      case 'community': return '🏘️';
      case 'sports': return '⚽';
      case 'education': return '📚';
      case 'business': return '💼';
      case 'health': return '🏥';
      case 'food': return '🍕';
      case 'technology': return '💻';
      case 'environment': return '🌱';
      case 'politics': return '🏛️';
      case 'protest': return '📢';
      default: return '📅';
    }
  };

  const getPriceDisplay = () => {
    if (event.price === 0) return 'Free';
    return `₹${event.price}`;
  };

  const getRSVPStatus = () => {
    if (!event.requires_rsvp) return null;
    
    const now = new Date();
    const deadline = event.rsvp_deadline ? new Date(event.rsvp_deadline) : null;
    
    if (deadline && now > deadline) {
      return { status: 'closed', message: 'RSVP deadline passed' };
    }
    
    if (event.max_attendees && event.attendees_count >= event.max_attendees) {
      return event.allow_waitlist 
        ? { status: 'waitlist', message: 'Event full - waitlist available' }
        : { status: 'full', message: 'Event full' };
    }
    
    return { status: 'open', message: 'RSVP open' };
  };

  const rsvpStatus = getRSVPStatus();

  if (compact) {
    return (
      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <img 
              src={event.image_url || "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=400&fit=crop"} 
              alt={event.title}
              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg truncate">{event.title}</h3>
                <div className="flex items-center space-x-1">
                  {verified && (
                    <Badge className="bg-blue-500 text-white text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {event.government_authorities && event.government_authorities.length > 0 && (
                    <Badge className="bg-purple-500 text-white text-xs">
                      <Building2 className="w-3 h-3 mr-1" />
                      Tagged
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(event.event_date), 'MMM dd, yyyy')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {event.event_time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {event.location_name}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-sm">
                    <Users className="w-3 h-3" />
                    {event.attendees_count} attending
                  </span>
                  <Badge variant="secondary">
                    {getCategoryIcon(event.category)} {event.category}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">{getPriceDisplay()}</span>
                  {event.requires_rsvp && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowRSVP(!showRSVP)}
                    >
                      RSVP
                    </Button>
                  )}
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
      {/* Event Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={event.image_url || "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=400&fit=crop"} 
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Overlay with badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {verified && (
            <Badge className="bg-blue-500 text-white">
              <Star className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
          {event.government_authorities && event.government_authorities.length > 0 && (
            <Badge className="bg-purple-500 text-white">
              <Building2 className="w-3 h-3 mr-1" />
              Government Tagged
            </Badge>
          )}
          {rsvpStatus && (
            <Badge className={
              rsvpStatus.status === 'open' ? 'bg-green-500 text-white' :
              rsvpStatus.status === 'waitlist' ? 'bg-yellow-500 text-white' :
              'bg-red-500 text-white'
            }>
              {rsvpStatus.status === 'open' ? <CheckCircle className="w-3 h-3 mr-1" /> :
               rsvpStatus.status === 'waitlist' ? <Clock3 className="w-3 h-3 mr-1" /> :
               <X className="w-3 h-3 mr-1" />}
              {rsvpStatus.message}
            </Badge>
          )}
        </div>
        
        {/* Price badge */}
        <div className="absolute top-4 right-4">
          <Badge className="bg-black/70 text-white text-lg px-3 py-1">
            {getPriceDisplay()}
          </Badge>
        </div>
      </div>

      <CardContent className="p-6">
        {/* Event Title and Category */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2 line-clamp-2">{event.title}</h3>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-sm">
                {getCategoryIcon(event.category)} {event.category}
              </Badge>
              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {event.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(event.event_date), 'EEEE, MMMM dd, yyyy')}</span>
          </div>
          
          <div className="flex items-center gap-3 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{event.event_time}</span>
          </div>
          
          <div className="flex items-center gap-3 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{event.location_name}</span>
            {event.location_city && (
              <span className="text-sm">• {event.location_city}</span>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>
              {event.attendees_count} attending
              {event.max_attendees && ` / ${event.max_attendees} max`}
            </span>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-muted-foreground mb-4 line-clamp-3">
            {event.description}
          </p>
        )}

        {/* Government Authorities */}
        {event.government_authorities && event.government_authorities.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Building2 className="w-4 h-4 mr-1" />
              Tagged Authorities
            </h4>
            <div className="flex flex-wrap gap-2">
              {event.government_authorities.map((authority) => (
                <Badge key={authority.id} variant="outline" className="text-xs">
                  {authority.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Organizer */}
        {showOrganizer && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
            <Avatar className="h-8 w-8">
              <AvatarImage src={event.organizer_avatar} />
              <AvatarFallback>{event.organizer_name?.[0] || 'E'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">{event.organizer_name || 'Event Organizer'}</p>
              <p className="text-xs text-muted-foreground">Organizer</p>
            </div>
            {onChat && (
              <Button size="sm" variant="outline" onClick={() => onChat(event.id, event.id)}>
                <MessageCircle className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        {/* RSVP System */}
        {event.requires_rsvp && (
          <div className="mb-4">
            <EventRSVPSystem
              eventId={event.id}
              maxAttendees={event.max_attendees}
              waitlistCapacity={event.waitlist_capacity}
              rsvpDeadline={event.rsvp_deadline}
              allowWaitlist={event.allow_waitlist}
              requiresApproval={event.requires_approval}
              onRSVPChange={handleRSVPChange}
              compact={true}
            />
          </div>
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
            {event.requires_rsvp ? (
              <Button
                onClick={() => setShowRSVP(!showRSVP)}
                className="bg-primary text-primary-foreground"
              >
                <Ticket className="w-4 h-4 mr-2" />
                {showRSVP ? 'Hide RSVP' : 'RSVP'}
              </Button>
            ) : (
              <Button
                onClick={() => onAttend?.(event.id)}
                className="bg-primary text-primary-foreground"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Attend
              </Button>
            )}
            
            {event.price > 0 && onBook && (
              <Button
                onClick={() => onBook(event.id)}
                variant="outline"
              >
                <Ticket className="w-4 h-4 mr-2" />
                Book
              </Button>
            )}
          </div>
        </div>

        {/* Contact Information */}
        {(event.contact_email || event.contact_phone || event.website_url) && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Contact Information</h4>
            <div className="flex flex-wrap gap-4 text-sm">
              {event.contact_email && (
                <div className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  <span>{event.contact_email}</span>
                </div>
              )}
              {event.contact_phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>{event.contact_phone}</span>
                </div>
              )}
              {event.website_url && (
                <div className="flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  <a href={event.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Website
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
