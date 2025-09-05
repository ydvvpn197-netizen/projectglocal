import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
  ExternalLink
} from "lucide-react";
import { Event } from "@/hooks/useEvents";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface EventCardProps {
  event: Event;
  onAttend?: (eventId: string) => void;
  onBook?: (eventId: string) => void;
  onLike?: (eventId: string) => void;
  onChat?: (eventId: string, organizerId: string) => void;
  showOrganizer?: boolean;
  verified?: boolean;
}

export const EventCard = ({ 
  event, 
  onAttend, 
  onBook,
  onLike, 
  onChat,
  showOrganizer = true,
  verified = false 
}: EventCardProps) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatPrice = (price: number) => {
    return price === 0 ? "Free" : `$${price}`;
  };

  const getOrganizerName = () => {
    return event.organizer_name || "Event Organizer";
  };

  const getOrganizerAvatar = () => {
    return event.organizer_avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face";
  };

  const handleEventClick = () => {
    // Navigate to event details in the same window
    navigate(`/event/${event.id}`);
  };

  const handleOrganizerClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event card click
    // Navigate to organizer profile
    navigate(`/profile/${event.user_id}`);
  };

  const handleAttendClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event card click
    onAttend?.(event.id);
  };

  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event card click
    onBook?.(event.id);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event card click
    onLike?.(event.id);
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event card click
    onChat?.(event.id, event.user_id);
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
      onClick={handleEventClick}
    >
      <div className="relative">
        {/* Event Image */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={event.image_url || "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=400&fit=crop"} 
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Price Badge */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-orange-500 hover:bg-orange-600 text-white font-semibold">
              {formatPrice(event.price)}
            </Badge>
          </div>
          
          {/* Verified Badge */}
          {verified && (
            <div className="absolute top-3 left-20">
              <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
                <Star className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30 text-white"
              onClick={handleLikeClick}
            >
              <Heart className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30 text-white"
              onClick={(e) => {
                e.stopPropagation();
                onChat?.(event.id, event.user_id);
              }}
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Event Title */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {event.title}
        </h3>
        
        {/* Event Description */}
        {event.description && (
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Event Details */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(event.event_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{event.event_time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{event.location_name}</span>
          </div>
        </div>

        {/* Category Tag */}
        {event.category && (
          <div className="mb-3">
            <Badge variant="secondary" className="text-xs">
              {event.category}
            </Badge>
          </div>
        )}

        {/* Attendee Count */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Users className="w-4 h-4" />
          <span>
            {event.attendees_count} / {event.max_attendees || '∞'} attending
          </span>
        </div>

        {/* Organizer Info */}
        {showOrganizer && (
          <div 
            className="flex items-center gap-2 mb-4 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            onClick={handleOrganizerClick}
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={getOrganizerAvatar()} />
              <AvatarFallback className="text-xs">
                {getOrganizerName().charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <span className="text-sm font-medium text-foreground">
                {getOrganizerName()}
              </span>
              <div className="text-xs text-muted-foreground">
                Event Organizer
              </div>
            </div>
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
        )}

        {/* Three Action Buttons */}
        <div className="flex gap-2">
          {/* Attendance Button */}
          <Button 
            variant={event.user_attending ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={handleAttendClick}
          >
            <Users className="w-4 h-4 mr-1" />
            {event.user_attending ? "Attending" : "Attend"}
          </Button>

          {/* Booking Button */}
          <Button 
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleBookClick}
          >
            <Ticket className="w-4 h-4 mr-1" />
            Book
          </Button>

          {/* Like Button */}
          <Button 
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleLikeClick}
          >
            <Heart className="w-4 h-4 mr-1" />
            Like
          </Button>
        </div>

        {/* View Details Link */}
        <div className="mt-3 text-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-muted-foreground hover:text-primary"
            onClick={handleEventClick}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
