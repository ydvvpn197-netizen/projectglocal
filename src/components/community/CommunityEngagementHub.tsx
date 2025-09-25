// Community Engagement Hub - Central hub for local community features
import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MapPin, 
  Users, 
  MessageCircle, 
  TrendingUp, 
  Calendar, 
  Vote, 
  Megaphone,
  Shield,
  Eye,
  EyeOff,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from '@/hooks/useLocation';
import { usePerformanceMonitor } from '@/hooks/usePerformance';
import { useSecurity } from '@/hooks/useSecurity';

interface CommunityEngagementHubProps {
  className?: string;
  onEngagement?: (type: string, data: Record<string, string | number | boolean>) => void;
}

interface LocalIssue {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  votes: number;
  userVoted: boolean;
  isAnonymous: boolean;
  createdAt: string;
  tags: string[];
}

interface VirtualProtest {
  id: string;
  title: string;
  description: string;
  cause: string;
  participants: number;
  maxParticipants: number;
  isAnonymous: boolean;
  createdAt: string;
  status: 'active' | 'completed' | 'cancelled';
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  attendees: number;
  maxAttendees: number;
  isAnonymous: boolean;
  createdAt: string;
}

export const CommunityEngagementHub: React.FC<CommunityEngagementHubProps> = React.memo(({ 
  className,
  onEngagement 
}) => {
  const auth = useAuth();
  const { user } = auth || { user: null };
  const toastHook = useToast();
  const { toast } = toastHook || { toast: () => {} };
  const locationHook = useLocation();
  const { location } = locationHook || { location: null };
  const securityHook = useSecurity();
  const { sanitizeText, validateInput } = securityHook || { sanitizeText: (text) => text, validateInput: () => true };
  
  // Performance monitoring
  usePerformanceMonitor('CommunityEngagementHub');
  
  const [activeTab, setActiveTab] = useState('issues');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createType, setCreateType] = useState<'issue' | 'protest' | 'event'>('issue');
  const [isAnonymous, setIsAnonymous] = useState(true);
  
  // Form states
  const [issueForm, setIssueForm] = useState({
    title: '',
    description: '',
    category: '',
    tags: [] as string[],
    location: location?.city || ''
  });
  
  const [protestForm, setProtestForm] = useState({
    title: '',
    description: '',
    cause: '',
    maxParticipants: 100
  });
  
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    category: '',
    maxAttendees: 50
  });

  // Mock data - in production, this would come from Supabase
  const [localIssues, setLocalIssues] = useState<LocalIssue[]>([
    {
      id: '1',
      title: 'Pothole on Main Street',
      description: 'Large pothole causing traffic issues and vehicle damage',
      category: 'Infrastructure',
      location: 'Delhi',
      votes: 45,
      userVoted: false,
      isAnonymous: true,
      createdAt: '2024-01-15',
      tags: ['infrastructure', 'traffic', 'safety']
    },
    {
      id: '2',
      title: 'Street Lighting Issue',
      description: 'Poor lighting in residential area affecting safety',
      category: 'Safety',
      location: 'Mumbai',
      votes: 32,
      userVoted: true,
      isAnonymous: true,
      createdAt: '2024-01-14',
      tags: ['safety', 'lighting', 'residential']
    }
  ]);

  const [virtualProtests, setVirtualProtests] = useState<VirtualProtest[]>([
    {
      id: '1',
      title: 'Climate Action Now',
      description: 'Virtual protest for immediate climate action',
      cause: 'Environment',
      participants: 150,
      maxParticipants: 500,
      isAnonymous: true,
      createdAt: '2024-01-15',
      status: 'active'
    }
  ]);

  const [communityEvents, setCommunityEvents] = useState<CommunityEvent[]>([
    {
      id: '1',
      title: 'Community Cleanup Drive',
      description: 'Join us for a neighborhood cleanup',
      date: '2024-01-20',
      location: 'Delhi',
      category: 'Environment',
      attendees: 25,
      maxAttendees: 50,
      isAnonymous: true,
      createdAt: '2024-01-10'
    }
  ]);

  // Filtered data based on search
  const filteredIssues = useMemo(() => {
    return localIssues.filter(issue => 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [localIssues, searchQuery]);

  const filteredProtests = useMemo(() => {
    return virtualProtests.filter(protest => 
      protest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      protest.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      protest.cause.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [virtualProtests, searchQuery]);

  const filteredEvents = useMemo(() => {
    return communityEvents.filter(event => 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [communityEvents, searchQuery]);

  // Handle voting on issues
  const handleVoteIssue = useCallback(async (issueId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to vote on issues",
        variant: "destructive"
      });
      return;
    }

    try {
      setLocalIssues(prev => prev.map(issue => 
        issue.id === issueId 
          ? { 
              ...issue, 
              votes: issue.userVoted ? issue.votes - 1 : issue.votes + 1,
              userVoted: !issue.userVoted 
            }
          : issue
      ));
      
      toast({
        title: "Vote Recorded",
        description: "Your vote has been recorded successfully"
      });
      
      onEngagement?.('issue_vote', { issueId, userId: user.id });
    } catch (error) {
      console.error('Error voting on issue:', error);
      toast({
        title: "Vote Failed",
        description: "Failed to record your vote. Please try again.",
        variant: "destructive"
      });
    }
  }, [user, toast, onEngagement]);

  // Handle joining protests
  const handleJoinProtest = useCallback(async (protestId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to join protests",
        variant: "destructive"
      });
      return;
    }

    try {
      setVirtualProtests(prev => prev.map(protest => 
        protest.id === protestId 
          ? { ...protest, participants: protest.participants + 1 }
          : protest
      ));
      
      toast({
        title: "Joined Protest",
        description: "You've successfully joined the virtual protest"
      });
      
      onEngagement?.('protest_join', { protestId, userId: user.id });
    } catch (error) {
      console.error('Error joining protest:', error);
      toast({
        title: "Join Failed",
        description: "Failed to join the protest. Please try again.",
        variant: "destructive"
      });
    }
  }, [user, toast, onEngagement]);

  // Handle event attendance
  const handleAttendEvent = useCallback(async (eventId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to attend events",
        variant: "destructive"
      });
      return;
    }

    try {
      setCommunityEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, attendees: event.attendees + 1 }
          : event
      ));
      
      toast({
        title: "Event Attendance",
        description: "You've successfully registered for the event"
      });
      
      onEngagement?.('event_attend', { eventId, userId: user.id });
    } catch (error) {
      console.error('Error attending event:', error);
      toast({
        title: "Attendance Failed",
        description: "Failed to register for the event. Please try again.",
        variant: "destructive"
      });
    }
  }, [user, toast, onEngagement]);

  // Handle form submissions
  const handleCreateIssue = useCallback(async () => {
    if (!validateInput(issueForm.title, 'text') || !validateInput(issueForm.description, 'text')) {
      toast({
        title: "Invalid Input",
        description: "Please check your input and try again",
        variant: "destructive"
      });
      return;
    }

    const newIssue: LocalIssue = {
      id: Date.now().toString(),
      title: sanitizeText(issueForm.title),
      description: sanitizeText(issueForm.description),
      category: issueForm.category,
      location: issueForm.location,
      votes: 0,
      userVoted: false,
      isAnonymous,
      createdAt: new Date().toISOString(),
      tags: issueForm.tags
    };

    setLocalIssues(prev => [newIssue, ...prev]);
    setIssueForm({ title: '', description: '', category: '', tags: [], location: location?.city || '' });
    setShowCreateDialog(false);
    
    toast({
      title: "Issue Created",
      description: "Your local issue has been posted successfully"
    });
    
    onEngagement?.('issue_create', { issueId: newIssue.id, userId: user?.id });
  }, [issueForm, validateInput, sanitizeText, isAnonymous, location, toast, onEngagement, user]);

  const handleCreateProtest = useCallback(async () => {
    if (!validateInput(protestForm.title, 'text') || !validateInput(protestForm.description, 'text')) {
      toast({
        title: "Invalid Input",
        description: "Please check your input and try again",
        variant: "destructive"
      });
      return;
    }

    const newProtest: VirtualProtest = {
      id: Date.now().toString(),
      title: sanitizeText(protestForm.title),
      description: sanitizeText(protestForm.description),
      cause: protestForm.cause,
      participants: 0,
      maxParticipants: protestForm.maxParticipants,
      isAnonymous,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    setVirtualProtests(prev => [newProtest, ...prev]);
    setProtestForm({ title: '', description: '', cause: '', maxParticipants: 100 });
    setShowCreateDialog(false);
    
    toast({
      title: "Protest Created",
      description: "Your virtual protest has been created successfully"
    });
    
    onEngagement?.('protest_create', { protestId: newProtest.id, userId: user?.id });
  }, [protestForm, validateInput, sanitizeText, isAnonymous, toast, onEngagement, user]);

  const handleCreateEvent = useCallback(async () => {
    if (!validateInput(eventForm.title, 'text') || !validateInput(eventForm.description, 'text')) {
      toast({
        title: "Invalid Input",
        description: "Please check your input and try again",
        variant: "destructive"
      });
      return;
    }

    const newEvent: CommunityEvent = {
      id: Date.now().toString(),
      title: sanitizeText(eventForm.title),
      description: sanitizeText(eventForm.description),
      date: eventForm.date,
      location: location?.city || 'Unknown',
      category: eventForm.category,
      attendees: 0,
      maxAttendees: eventForm.maxAttendees,
      isAnonymous,
      createdAt: new Date().toISOString()
    };

    setCommunityEvents(prev => [newEvent, ...prev]);
    setEventForm({ title: '', description: '', date: '', category: '', maxAttendees: 50 });
    setShowCreateDialog(false);
    
    toast({
      title: "Event Created",
      description: "Your community event has been created successfully"
    });
    
    onEngagement?.('event_create', { eventId: newEvent.id, userId: user?.id });
  }, [eventForm, validateInput, sanitizeText, isAnonymous, location, toast, onEngagement, user]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Community Engagement</h2>
          <p className="text-gray-600">Connect, discuss, and take action in your local community</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {createType === 'issue' ? 'Create Local Issue' : 
                 createType === 'protest' ? 'Create Virtual Protest' : 
                 createType === 'event' ? 'Create Community Event' : 
                 'Create New Content'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Content Type Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Content Type</label>
                <div className="flex gap-2">
                  <Button
                    variant={createType === 'issue' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCreateType('issue')}
                  >
                    Local Issue
                  </Button>
                  <Button
                    variant={createType === 'protest' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCreateType('protest')}
                  >
                    Virtual Protest
                  </Button>
                  <Button
                    variant={createType === 'event' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCreateType('event')}
                  >
                    Community Event
                  </Button>
                </div>
              </div>

              {/* Anonymous toggle */}
              <div className="flex items-center space-x-2">
                <Button
                  variant={isAnonymous ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className="flex items-center gap-2"
                >
                  {isAnonymous ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {isAnonymous ? 'Anonymous' : 'Public'}
                </Button>
                <span className="text-sm text-gray-500">
                  {isAnonymous ? 'Your identity will be hidden' : 'Your profile will be visible'}
                </span>
              </div>

              {/* Form content based on type */}
              {createType === 'issue' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Issue Title</label>
                    <Input
                      value={issueForm.title}
                      onChange={(e) => setIssueForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Brief description of the issue"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={issueForm.description}
                      onChange={(e) => setIssueForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Detailed description of the issue"
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <Input
                        value={issueForm.category}
                        onChange={(e) => setIssueForm(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="e.g., Infrastructure, Safety"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Location</label>
                      <Input
                        value={issueForm.location}
                        onChange={(e) => setIssueForm(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="City, State"
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateIssue} className="w-full">
                    Create Issue
                  </Button>
                </div>
              )}

              {createType === 'protest' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Protest Title</label>
                    <Input
                      value={protestForm.title}
                      onChange={(e) => setProtestForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Title of your virtual protest"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={protestForm.description}
                      onChange={(e) => setProtestForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="What are you protesting for?"
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Cause</label>
                      <Input
                        value={protestForm.cause}
                        onChange={(e) => setProtestForm(prev => ({ ...prev, cause: e.target.value }))}
                        placeholder="e.g., Climate Change, Social Justice"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Max Participants</label>
                      <Input
                        type="number"
                        value={protestForm.maxParticipants}
                        onChange={(e) => setProtestForm(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateProtest} className="w-full">
                    Create Protest
                  </Button>
                </div>
              )}

              {createType === 'event' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Event Title</label>
                    <Input
                      value={eventForm.title}
                      onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Title of your community event"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={eventForm.description}
                      onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="What is this event about?"
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Date</label>
                      <Input
                        type="date"
                        value={eventForm.date}
                        onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <Input
                        value={eventForm.category}
                        onChange={(e) => setEventForm(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="e.g., Environment, Social"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Max Attendees</label>
                      <Input
                        type="number"
                        value={eventForm.maxAttendees}
                        onChange={(e) => setEventForm(prev => ({ ...prev, maxAttendees: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateEvent} className="w-full">
                    Create Event
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search community content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            role="search"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="issues" className="flex items-center gap-2">
            <Vote className="h-4 w-4" />
            Local Issues ({filteredIssues.length})
          </TabsTrigger>
          <TabsTrigger value="protests" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Virtual Protests ({filteredProtests.length})
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Community Events ({filteredEvents.length})
          </TabsTrigger>
        </TabsList>

        {/* Local Issues Tab */}
        <TabsContent value="issues" className="space-y-4">
          <div className="grid gap-4">
            {filteredIssues.map((issue) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-lg">{issue.title}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{issue.location}</span>
                          <Badge variant="secondary">{issue.category}</Badge>
                          {issue.isAnonymous && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <EyeOff className="h-3 w-3" />
                              Anonymous
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant={issue.userVoted ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleVoteIssue(issue.id)}
                        >
                          <Vote className="h-4 w-4 mr-1" />
                          {issue.votes}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{issue.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {issue.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Virtual Protests Tab */}
        <TabsContent value="protests" className="space-y-4">
          <div className="grid gap-4">
            {filteredProtests.map((protest) => (
              <motion.div
                key={protest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-lg">{protest.title}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Badge variant="secondary">{protest.cause}</Badge>
                          <Badge variant={protest.status === 'active' ? 'default' : 'outline'}>
                            {protest.status}
                          </Badge>
                          {protest.isAnonymous && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <EyeOff className="h-3 w-3" />
                              Anonymous
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleJoinProtest(protest.id)}
                          disabled={protest.participants >= protest.maxParticipants}
                        >
                          <Users className="h-4 w-4 mr-1" />
                          {protest.participants}/{protest.maxParticipants}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{protest.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                          {protest.participants} participants
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(protest.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Community Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <div className="grid gap-4">
            {filteredEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                          <Badge variant="secondary">{event.category}</Badge>
                          {event.isAnonymous && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <EyeOff className="h-3 w-3" />
                              Anonymous
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAttendEvent(event.id)}
                          disabled={event.attendees >= event.maxAttendees}
                        >
                          <Users className="h-4 w-4 mr-1" />
                          {event.attendees}/{event.maxAttendees}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{event.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                          {event.attendees} attendees
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(event.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
});

CommunityEngagementHub.displayName = 'CommunityEngagementHub';
