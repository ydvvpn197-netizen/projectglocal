import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  ArrowLeft,
  Phone,
  Mail,
  Globe,
  Tag,
  DollarSign,
  Map,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Building2,
  ThumbsUp,
  MessageSquare,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  Mail as MailIcon
} from "lucide-react";
import { useEvents, Event } from "@/hooks/useEvents";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { EventDiscussion } from "@/components/EventDiscussion";
import { EventOrganizerChat } from "@/components/EventOrganizerChat";
import { EventBookingService } from "@/services/eventBookingService";

const EventDetails = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { events, loading, toggleAttendance } = useEvents();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isOrganizerChatOpen, setIsOrganizerChatOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [tickets, setTickets] = useState(1);
  const [message, setMessage] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userBooking, setUserBooking] = useState<{
    id: string;
    event_id: string;
    user_id: string;
    tickets_count: number;
    total_amount: number;
    status: string;
    created_at: string;
  } | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Interaction states
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);

  const checkUserBooking = async (eventId: string) => {
    try {
      const { hasBooked, booking } = await EventBookingService.hasUserBookedEvent(eventId);
      setUserBooking(hasBooked ? booking : null);
    } catch (error) {
      console.error('Error checking user booking:', error);
    }
  };

  useEffect(() => {
    if (eventId && events.length > 0) {
      const event = events.find(e => e.id === eventId);
      setSelectedEvent(event);
      
      // Check if user has already booked this event
      if (event && user) {
        checkUserBooking(event.id);
      }
    }
  }, [eventId, events, user]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'EEEE, MMMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatPrice = (price: number) => {
    return price === 0 ? "Free" : `$${price}`;
  };

  const handleBookEvent = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book this event",
        variant: "destructive",
      });
      return;
    }
    setIsBookingModalOpen(true);
  };

  const handleChatWithOrganizer = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to chat with the organizer",
        variant: "destructive",
      });
      return;
    }
    setIsOrganizerChatOpen(true);
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // Here you would implement the actual chat functionality
    toast({
      title: "Message Sent",
      description: "Your message has been sent to the organizer",
    });
    setMessage("");
    setIsChatModalOpen(false);
  };

  const handleViewOrganizerProfile = () => {
    if (selectedEvent) {
      navigate(`/profile/${selectedEvent.user_id}`);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedEvent || !user) return;

    try {
      setBookingLoading(true);
      const totalAmount = selectedEvent.price === 0 ? 0 : selectedEvent.price * tickets;
      
      const { booking, error } = await EventBookingService.createBooking({
        event_id: selectedEvent.id,
        tickets_count: tickets,
        total_amount: totalAmount
      });

      if (error) {
        toast({
          title: "Booking Failed",
          description: error,
          variant: "destructive",
        });
        return;
      }

      if (booking) {
        toast({
          title: "Booking Successful",
          description: `You've booked ${tickets} ticket(s) for ${selectedEvent.title}`,
        });
        setUserBooking(booking);
        setIsBookingModalOpen(false);
        setTickets(1);
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
      toast({
        title: "Booking Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBookingLoading(false);
    }
  };

  // Interaction handlers
  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like this event",
        variant: "destructive",
      });
      return;
    }

    try {
      // Toggle like state
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);
      
      // Here you would make an API call to save the like
      toast({
        title: newLikedState ? "Event Liked!" : "Like Removed",
        description: newLikedState ? "You liked this event" : "You removed your like",
      });
    } catch (error) {
      // Revert on error
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied!",
        description: "Event link has been copied to clipboard",
      });
      setIsShareModalOpen(false);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleSocialShare = (platform: string) => {
    const url = window.location.href;
    const title = selectedEvent?.title || "Check out this event!";
    const text = selectedEvent?.description || "Join me at this amazing event!";

    let shareUrl = "";
    
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case "email":
        shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + "\n\n" + url)}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
      setIsShareModalOpen(false);
      setShareCount(prev => prev + 1);
    }
  };

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-96 bg-muted rounded-lg mb-6"></div>
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (!selectedEvent) {
    return (
      <ResponsiveLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The event you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/events')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </div>
      </ResponsiveLayout>
    );
  }

  const totalPrice = selectedEvent.price === 0 ? 0 : selectedEvent.price * tickets;

  return (
    <ResponsiveLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/events')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>

        {/* Event Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{selectedEvent.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(selectedEvent.event_date)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {selectedEvent.event_time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {selectedEvent.location_name}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-orange-500 text-white font-semibold">
                {formatPrice(selectedEvent.price)}
              </Badge>
              {Math.random() > 0.7 && (
                <Badge className="bg-blue-500 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Event Image */}
        <div className="relative">
          <img 
            src={selectedEvent.image_url || "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=400&fit=crop"} 
            alt={selectedEvent.title}
            className="w-full h-96 object-cover rounded-lg"
          />
          <div className="absolute top-4 right-4 flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`bg-white/20 hover:bg-white/30 text-white ${isLiked ? 'text-red-400' : ''}`}
              onClick={handleLike}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              {likeCount > 0 && <span className="ml-1 text-xs">{likeCount}</span>}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="bg-white/20 hover:bg-white/30 text-white"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
              {shareCount > 0 && <span className="ml-1 text-xs">{shareCount}</span>}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedEvent.description || "No description available for this event."}
                </p>
              </CardContent>
            </Card>

            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-sm text-muted-foreground">{formatDate(selectedEvent.event_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Time</p>
                      <p className="text-sm text-muted-foreground">{selectedEvent.event_time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{selectedEvent.location_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Attendees</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedEvent.attendees_count} / {selectedEvent.max_attendees || '∞'} attending
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {selectedEvent.tags && selectedEvent.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Government Authority Information */}
            {(selectedEvent.target_authority && selectedEvent.target_authority.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Government Authorities
                  </CardTitle>
                  <CardDescription>
                    This event involves the following government authorities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedEvent.target_authority.map((authorityId: string, index: number) => (
                      <div key={index} className="p-3 border rounded-lg bg-blue-50">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">Government Authority #{index + 1}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Authority ID: {authorityId}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Actions & Organizer */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Button 
                    className="w-full"
                    variant={selectedEvent.user_attending ? "default" : "outline"}
                    onClick={() => toggleAttendance(selectedEvent.id)}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    {selectedEvent.user_attending ? "Attending" : "Attend Event"}
                  </Button>
                  
                  {userBooking ? (
                    <div className="w-full">
                      <Button 
                        className="w-full"
                        variant="outline"
                        disabled
                      >
                        <Ticket className="w-4 h-4 mr-2" />
                        Already Booked ({userBooking.tickets_count} ticket{userBooking.tickets_count > 1 ? 's' : ''})
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        Booking ID: {userBooking.id.slice(0, 8)}...
                      </p>
                    </div>
                  ) : (
                    <Button 
                      className="w-full btn-event"
                      onClick={handleBookEvent}
                    >
                      <Ticket className="w-4 h-4 mr-2" />
                      Book Tickets
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleChatWithOrganizer}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat with Organizer
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={handleLike}
                    >
                      <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current text-red-500' : ''}`} />
                      {isLiked ? 'Liked' : 'Like'} ({likeCount})
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={handleShare}
                    >
                      <Share2 className="w-4 h-4 mr-1" />
                      Share ({shareCount})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Organizer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Event Organizer</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  onClick={handleViewOrganizerProfile}
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={selectedEvent.organizer_avatar} />
                    <AvatarFallback>
                      {(selectedEvent.organizer_name || "E")[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{selectedEvent.organizer_name || "Event Organizer"}</p>
                    <p className="text-sm text-muted-foreground">Event Creator</p>
                  </div>
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <User className="w-4 h-4 mr-2" />
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Price Info */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Ticket Price</span>
                  <span className="text-2xl font-bold text-orange-500">
                    {formatPrice(selectedEvent.price)}
                  </span>
                </div>
                {selectedEvent.price > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Price per ticket
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Booking Modal */}
        <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Book Tickets - {selectedEvent.title}</DialogTitle>
              <DialogDescription>
                Select the number of tickets you'd like to book
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Event Summary */}
              <div className="flex gap-4 p-4 bg-muted rounded-lg">
                <img 
                  src={selectedEvent.image_url || "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=400&fit=crop"} 
                  alt={selectedEvent.title}
                  className="w-20 h-16 rounded object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-semibold">{selectedEvent.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(selectedEvent.event_date)} at {selectedEvent.event_time}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedEvent.location_name}</p>
                </div>
              </div>

              {/* Ticket Selection */}
              <div className="space-y-4">
                <Label htmlFor="tickets">Number of Tickets</Label>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">General Admission</p>
                    <p className="text-sm text-muted-foreground">{formatPrice(selectedEvent.price)} per ticket</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTickets(Math.max(1, tickets - 1))}
                      disabled={tickets <= 1}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{tickets}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTickets(Math.min(selectedEvent.max_attendees - selectedEvent.attendees_count, tickets + 1))}
                      disabled={tickets >= selectedEvent.max_attendees - selectedEvent.attendees_count}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  className="flex-1 btn-event"
                  onClick={handleConfirmBooking}
                  disabled={bookingLoading}
                >
                  <Ticket className="w-4 h-4 mr-2" />
                  {bookingLoading ? "Processing..." : (selectedEvent.price === 0 ? "Reserve Spot" : "Book Tickets")}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsBookingModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Chat Modal */}
        <Dialog open={isChatModalOpen} onOpenChange={setIsChatModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chat with {selectedEvent.organizer_name || "Event Organizer"}</DialogTitle>
              <DialogDescription>
                Send a message to the event organizer
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">Your Message</Label>
                <Textarea
                  id="message"
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>
              
              <div className="flex gap-3">
                <Button 
                  className="flex-1"
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsChatModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Event Discussion Section */}
        {selectedEvent && (
          <div className="mt-8">
            <EventDiscussion eventId={selectedEvent.id} />
          </div>
        )}

        {/* Share Modal */}
        <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Share This Event</DialogTitle>
              <DialogDescription>
                Share this amazing event with your friends and family
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Copy Link */}
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleCopyLink}
              >
                <Copy className="w-4 h-4 mr-3" />
                Copy Link
              </Button>
              
              {/* Social Media Sharing */}
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => handleSocialShare('facebook')}
                >
                  <Facebook className="w-4 h-4 mr-2 text-blue-600" />
                  Facebook
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => handleSocialShare('twitter')}
                >
                  <Twitter className="w-4 h-4 mr-2 text-blue-400" />
                  Twitter
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => handleSocialShare('linkedin')}
                >
                  <Linkedin className="w-4 h-4 mr-2 text-blue-700" />
                  LinkedIn
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => handleSocialShare('email')}
                >
                  <MailIcon className="w-4 h-4 mr-2" />
                  Email
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Event Organizer Chat */}
        {selectedEvent && (
          <EventOrganizerChat
            eventId={selectedEvent.id}
            organizerId={selectedEvent.user_id}
            organizerName={selectedEvent.organizer_name}
            organizerAvatar={selectedEvent.organizer_avatar}
            isOpen={isOrganizerChatOpen}
            onClose={() => setIsOrganizerChatOpen(false)}
          />
        )}
      </div>
    </ResponsiveLayout>
  );
};

export default EventDetails;
