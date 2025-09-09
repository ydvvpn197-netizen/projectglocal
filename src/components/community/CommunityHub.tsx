import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { AnonymousPostForm } from '@/components/anonymous/AnonymousPostForm';
import { AnonymousPostCard } from '@/components/anonymous/AnonymousPostCard';
import { GovernmentTaggingModal } from '@/components/government/GovernmentTaggingModal';
import { anonymousUserService, AnonymousPost } from '@/services/anonymousUserService';
import { communityService, CommunityPoll, LocalEvent } from '@/services/communityService';
import { 
  MessageSquare, 
  Calendar, 
  BarChart3, 
  Building2, 
  Plus, 
  Search, 
  Filter,
  MapPin,
  Users,
  TrendingUp,
  Eye,
  Heart,
  Share2,
  MessageCircle
} from 'lucide-react';

interface CommunityHubProps {
  className?: string;
}

export function CommunityHub({ className = '' }: CommunityHubProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('discussions');
  const [posts, setPosts] = useState<AnonymousPost[]>([]);
  const [polls, setPolls] = useState<CommunityPoll[]>([]);
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'discussion', label: 'Discussions' },
    { value: 'question', label: 'Questions' },
    { value: 'announcement', label: 'Announcements' },
    { value: 'event', label: 'Events' },
    { value: 'poll', label: 'Polls' },
    { value: 'news_comment', label: 'News Comments' }
  ];

  const locations = [
    { value: 'all', label: 'All Locations' },
    { value: 'delhi', label: 'Delhi' },
    { value: 'mumbai', label: 'Mumbai' },
    { value: 'bangalore', label: 'Bangalore' },
    { value: 'chennai', label: 'Chennai' },
    { value: 'kolkata', label: 'Kolkata' },
    { value: 'hyderabad', label: 'Hyderabad' },
    { value: 'pune', label: 'Pune' },
    { value: 'ahmedabad', label: 'Ahmedabad' }
  ];

  useEffect(() => {
    initializeAnonymousSession();
    loadContent();
  }, [loadContent]);

  useEffect(() => {
    loadContent();
  }, [activeTab, searchQuery, selectedLocation, selectedCategory, loadContent]);

  const initializeAnonymousSession = async () => {
    try {
      await anonymousUserService.getOrCreateAnonymousSession();
    } catch (error) {
      console.error('Error initializing anonymous session:', error);
    }
  };

  const loadContent = useCallback(async () => {
    setIsLoading(true);
    try {
      switch (activeTab) {
        case 'discussions':
          await loadPosts();
          break;
        case 'polls':
          await loadPolls();
          break;
        case 'events':
          await loadEvents();
          break;
      }
    } catch (error) {
      console.error('Error loading content:', error);
      toast({
        title: 'Error',
        description: 'Failed to load content. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, loadEvents, loadPosts, toast]);

  const loadPosts = useCallback(async () => {
    try {
      const data = await anonymousUserService.getAnonymousPosts({
        postType: selectedCategory === 'all' ? undefined : (selectedCategory as 'discussion' | 'poll' | 'event' | 'announcement'),
        location: selectedLocation === 'all' ? undefined : {
          city: selectedLocation
        },
        limit: 20
      });
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  }, [selectedCategory, selectedLocation]);

  const loadPolls = async () => {
    try {
      const data = await communityService.getPolls({
        isActive: true,
        limit: 20
      });
      setPolls(data);
    } catch (error) {
      console.error('Error loading polls:', error);
    }
  };

  const loadEvents = useCallback(async () => {
    try {
      const data = await communityService.getEvents({
        city: selectedLocation === 'all' ? undefined : selectedLocation,
        isPublic: true,
        isActive: true,
        limit: 20
      });
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  }, [selectedLocation]);

  const handlePostCreated = (post: AnonymousPost) => {
    setPosts(prev => [post, ...prev]);
    setShowPostForm(false);
  };

  const handleVote = async (postId: string, voteType: 1 | -1 | 0) => {
    try {
      await anonymousUserService.voteOnAnonymousPost(postId, voteType);
      // Update local state
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? {
              ...post,
              upvotes: voteType === 1 ? post.upvotes + 1 : (voteType === 0 && post.upvotes > 0 ? post.upvotes - 1 : post.upvotes),
              downvotes: voteType === -1 ? post.downvotes + 1 : (voteType === 0 && post.downvotes > 0 ? post.downvotes - 1 : post.downvotes)
            }
          : post
      ));
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleComment = (post: AnonymousPost) => {
    // TODO: Implement comment modal
    console.log('Comment on post:', post.id);
  };

  const handleShare = (post: AnonymousPost) => {
    // TODO: Implement share functionality
    console.log('Share post:', post.id);
  };

  const handleReport = (post: AnonymousPost) => {
    // TODO: Implement report functionality
    console.log('Report post:', post.id);
  };

  const handleGovernmentTag = (tag: { authority?: { name: string } } | null) => {
    toast({
      title: 'Government Tagged',
      description: `Your issue has been tagged to ${tag.authority?.name}.`,
    });
  };

  const renderPosts = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted rounded-full" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="h-3 w-24 bg-muted rounded" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted rounded" />
                  <div className="h-4 w-3/4 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (posts.length === 0) {
      return (
        <Card>
          <CardContent className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No discussions yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to start a conversation in your community.
            </p>
            <Button onClick={() => setShowPostForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Start Discussion
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {posts.map((post) => (
          <AnonymousPostCard
            key={post.id}
            post={post}
            onVote={handleVote}
            onComment={handleComment}
            onShare={handleShare}
            onReport={handleReport}
          />
        ))}
      </div>
    );
  };

  const renderPolls = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-3/4 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-4 w-full bg-muted rounded" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (polls.length === 0) {
      return (
        <Card>
          <CardContent className="text-center py-8">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No polls yet</h3>
            <p className="text-muted-foreground mb-4">
              Create a poll to get community opinions on important topics.
            </p>
            <Button onClick={() => setShowPostForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Poll
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {polls.map((poll) => (
          <Card key={poll.id}>
            <CardHeader>
              <CardTitle className="text-lg">{poll.question}</CardTitle>
              {poll.description && (
                <p className="text-muted-foreground">{poll.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {poll.options.map((option) => (
                  <div key={option.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{option.text}</span>
                      <span className="text-sm text-muted-foreground">
                        {poll.total_votes > 0 
                          ? `${Math.round((option.votes / poll.total_votes) * 100)}%`
                          : '0%'
                        }
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: poll.total_votes > 0 
                            ? `${(option.votes / poll.total_votes) * 100}%`
                            : '0%',
                          backgroundColor: option.color || '#3b82f6'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <span className="text-sm text-muted-foreground">
                  {poll.total_votes} votes
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Comment
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderEvents = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-3/4 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted rounded" />
                  <div className="h-4 w-2/3 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (events.length === 0) {
      return (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No events yet</h3>
            <p className="text-muted-foreground mb-4">
              Organize or discover local events in your community.
            </p>
            <Button onClick={() => setShowPostForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {events.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{event.event_type}</Badge>
                    {event.is_featured && (
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{event.current_attendees}</span>
                    {event.max_attendees && <span>/ {event.max_attendees}</span>}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{event.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(event.start_date).toLocaleDateString()}</span>
                </div>
                {event.location_name && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location_name}</span>
                  </div>
                )}
                {event.city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{event.city}, {event.state}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex gap-2">
                  {event.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Discuss
                  </Button>
                  <Button size="sm">
                    {event.is_attending ? 'Attending' : 'Join Event'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className={`w-full max-w-6xl mx-auto ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Community Hub</h1>
            <p className="text-muted-foreground">
              Connect, discuss, and engage with your local community
            </p>
          </div>
          <div className="flex gap-2">
            <GovernmentTaggingModal
              onTagCreated={handleGovernmentTag}
              trigger={
                <Button variant="outline">
                  <Building2 className="h-4 w-4 mr-2" />
                  Tag Government
                </Button>
              }
            />
            <Button onClick={() => setShowPostForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search discussions, polls, and events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.value} value={location.value}>
                    {location.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discussions" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Discussions
          </TabsTrigger>
          <TabsTrigger value="polls" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Polls
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Events
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discussions" className="mt-6">
          {renderPosts()}
        </TabsContent>

        <TabsContent value="polls" className="mt-6">
          {renderPolls()}
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          {renderEvents()}
        </TabsContent>
      </Tabs>

      {/* Post Creation Modal */}
      {showPostForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <AnonymousPostForm
              onPostCreated={handlePostCreated}
              onCancel={() => setShowPostForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
