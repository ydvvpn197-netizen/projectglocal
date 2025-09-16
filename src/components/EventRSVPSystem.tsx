import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  X,
  Calendar,
  MessageSquare,
  Phone,
  Mail,
  ExternalLink
} from 'lucide-react';

interface RSVPAttendee {
  id: string;
  user_id: string;
  event_id: string;
  status: 'attending' | 'waitlist' | 'declined';
  rsvp_date: string;
  user_name: string;
  user_avatar?: string;
  user_email?: string;
  user_phone?: string;
  notes?: string;
  is_anonymous: boolean;
}

interface EventRSVPSystemProps {
  eventId: string;
  maxAttendees?: number;
  waitlistCapacity?: number;
  rsvpDeadline?: string;
  allowWaitlist: boolean;
  requiresApproval: boolean;
  onRSVPChange?: (status: 'attending' | 'declined') => void;
  compact?: boolean;
}

export const EventRSVPSystem: React.FC<EventRSVPSystemProps> = ({
  eventId,
  maxAttendees,
  waitlistCapacity,
  rsvpDeadline,
  allowWaitlist,
  requiresApproval,
  onRSVPChange,
  compact = false
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [attendees, setAttendees] = useState<RSVPAttendee[]>([]);
  const [userRSVPStatus, setUserRSVPStatus] = useState<'attending' | 'declined' | 'waitlist' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRSVPOpen, setIsRSVPOpen] = useState(true);

  // Check if RSVP is still open
  useEffect(() => {
    if (rsvpDeadline) {
      const deadline = new Date(rsvpDeadline);
      const now = new Date();
      setIsRSVPOpen(now < deadline);
    }
  }, [rsvpDeadline]);

  // Load attendees and user RSVP status
  useEffect(() => {
    loadRSVPData();
  }, [eventId, user]);

  const loadRSVPData = async () => {
    try {
      setIsLoading(true);
      
      // Load attendees
      const { data: attendeesData, error: attendeesError } = await supabase
        .from('event_attendees')
        .select(`
          id,
          user_id,
          event_id,
          status,
          rsvp_date,
          notes,
          profiles!inner(
            display_name,
            avatar_url,
            email,
            phone,
            is_anonymous
          )
        `)
        .eq('event_id', eventId)
        .order('rsvp_date', { ascending: true });

      if (attendeesError) throw attendeesError;

      const formattedAttendees = attendeesData?.map(attendee => ({
        id: attendee.id,
        user_id: attendee.user_id,
        event_id: attendee.event_id,
        status: attendee.status,
        rsvp_date: attendee.rsvp_date,
        user_name: attendee.profiles.display_name || 'Anonymous User',
        user_avatar: attendee.profiles.avatar_url,
        user_email: attendee.profiles.email,
        user_phone: attendee.profiles.phone,
        notes: attendee.notes,
        is_anonymous: attendee.profiles.is_anonymous
      })) || [];

      setAttendees(formattedAttendees);

      // Get current user's RSVP status
      if (user) {
        const userAttendee = formattedAttendees.find(a => a.user_id === user.id);
        setUserRSVPStatus(userAttendee?.status || null);
      }
    } catch (error) {
      console.error('Error loading RSVP data:', error);
      toast({
        title: "Error",
        description: "Failed to load RSVP information.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRSVP = async (status: 'attending' | 'declined') => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to RSVP for events.",
        variant: "destructive",
      });
      return;
    }

    if (!isRSVPOpen) {
      toast({
        title: "RSVP Closed",
        description: "The RSVP deadline has passed.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      if (userRSVPStatus) {
        // Update existing RSVP
        const { error } = await supabase
          .from('event_attendees')
          .update({ 
            status,
            rsvp_date: new Date().toISOString()
          })
          .eq('event_id', eventId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create new RSVP
        const { error } = await supabase
          .from('event_attendees')
          .insert({
            event_id: eventId,
            user_id: user.id,
            status,
            rsvp_date: new Date().toISOString()
          });

        if (error) throw error;
      }

      setUserRSVPStatus(status);
      
      toast({
        title: "RSVP Updated",
        description: `You are now ${status === 'attending' ? 'attending' : 'not attending'} this event.`,
      });

      if (onRSVPChange) {
        onRSVPChange(status);
      }

      // Reload data
      loadRSVPData();
    } catch (error) {
      console.error('Error updating RSVP:', error);
      toast({
        title: "Error",
        description: "Failed to update RSVP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAttendeeCounts = () => {
    const attending = attendees.filter(a => a.status === 'attending').length;
    const waitlist = attendees.filter(a => a.status === 'waitlist').length;
    const declined = attendees.filter(a => a.status === 'declined').length;
    
    return { attending, waitlist, declined };
  };

  const getRSVPStatus = () => {
    const { attending } = getAttendeeCounts();
    
    if (maxAttendees && attending >= maxAttendees) {
      return allowWaitlist ? 'waitlist' : 'full';
    }
    
    return 'open';
  };

  const counts = getAttendeeCounts();
  const rsvpStatus = getRSVPStatus();

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <UserCheck className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">{counts.attending}</span>
            </div>
            {allowWaitlist && counts.waitlist > 0 && (
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">{counts.waitlist}</span>
              </div>
            )}
          </div>
          
          {user && isRSVPOpen && (
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant={userRSVPStatus === 'attending' ? 'default' : 'outline'}
                onClick={() => handleRSVP('attending')}
                disabled={isLoading || (rsvpStatus === 'full' && !allowWaitlist)}
              >
                {userRSVPStatus === 'attending' ? 'Attending' : 'RSVP'}
              </Button>
              <Button
                size="sm"
                variant={userRSVPStatus === 'declined' ? 'default' : 'outline'}
                onClick={() => handleRSVP('declined')}
                disabled={isLoading}
              >
                {userRSVPStatus === 'declined' ? 'Declined' : 'Decline'}
              </Button>
            </div>
          )}
        </div>

        {!isRSVPOpen && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              RSVP deadline has passed
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          RSVP System
        </CardTitle>
        <CardDescription>
          {maxAttendees ? `Capacity: ${counts.attending}/${maxAttendees}` : 'Unlimited capacity'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* RSVP Status */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <UserCheck className="h-6 w-6 text-green-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-green-600">{counts.attending}</div>
            <div className="text-sm text-green-600">Attending</div>
          </div>
          
          {allowWaitlist && (
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-yellow-600">{counts.waitlist}</div>
              <div className="text-sm text-yellow-600">Waitlist</div>
            </div>
          )}
          
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <UserX className="h-6 w-6 text-red-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-red-600">{counts.declined}</div>
            <div className="text-sm text-red-600">Declined</div>
          </div>
        </div>

        {/* RSVP Deadline Warning */}
        {rsvpDeadline && (
          <Alert className={isRSVPOpen ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}>
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              {isRSVPOpen ? (
                <>RSVP deadline: {new Date(rsvpDeadline).toLocaleString()}</>
              ) : (
                <>RSVP deadline has passed</>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* RSVP Buttons */}
        {user && isRSVPOpen && (
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                onClick={() => handleRSVP('attending')}
                disabled={isLoading || (rsvpStatus === 'full' && !allowWaitlist)}
                className="flex-1"
                variant={userRSVPStatus === 'attending' ? 'default' : 'outline'}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                {userRSVPStatus === 'attending' ? 'Attending' : 'RSVP Yes'}
              </Button>
              
              <Button
                onClick={() => handleRSVP('declined')}
                disabled={isLoading}
                className="flex-1"
                variant={userRSVPStatus === 'declined' ? 'default' : 'outline'}
              >
                <UserX className="h-4 w-4 mr-2" />
                {userRSVPStatus === 'declined' ? 'Declined' : 'RSVP No'}
              </Button>
            </div>

            {rsvpStatus === 'full' && allowWaitlist && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Event is full. You can join the waitlist.
                </AlertDescription>
              </Alert>
            )}

            {rsvpStatus === 'full' && !allowWaitlist && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Event is full and waitlist is not available.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {!user && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please sign in to RSVP for this event.
            </AlertDescription>
          </Alert>
        )}

        {/* Attendees List */}
        {attendees.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Attendees ({counts.attending})</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {attendees
                .filter(attendee => attendee.status === 'attending')
                .map((attendee) => (
                  <div key={attendee.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={attendee.user_avatar} />
                        <AvatarFallback>
                          {attendee.is_anonymous ? 'A' : attendee.user_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">
                          {attendee.is_anonymous ? 'Anonymous User' : attendee.user_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          RSVP'd {new Date(attendee.rsvp_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Attending
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Waitlist */}
        {allowWaitlist && counts.waitlist > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Waitlist ({counts.waitlist})</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {attendees
                .filter(attendee => attendee.status === 'waitlist')
                .map((attendee) => (
                  <div key={attendee.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={attendee.user_avatar} />
                        <AvatarFallback>
                          {attendee.is_anonymous ? 'A' : attendee.user_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">
                          {attendee.is_anonymous ? 'Anonymous User' : attendee.user_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Waitlisted {new Date(attendee.rsvp_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Waitlist
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
