import React, { useState } from 'react';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CreatePollDialog } from '@/components/CreatePollDialog';
import { GovernmentTaggingPoll } from '@/components/GovernmentTaggingPoll';
import { usePolls } from '@/hooks/usePolls';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { CommunityPoll, PollOption } from '@/types/community';
import { 
  Plus, 
  Search, 
  Filter, 
  BarChart3, 
  Users, 
  Clock, 
  MapPin, 
  Tag,
  Vote,
  Share2,
  MoreHorizontal,
  Building2,
  Shield,
  MessageSquare,
  TrendingUp,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Polls = () => {
  const { user } = useAuth();
  const { currentLocation } = useLocation();
  const { toast } = useToast();
  const { 
    polls, 
    governmentPolls, 
    authorities, 
    loading, 
    creating, 
    voting,
    votePoll,
    voteGovernmentPoll,
    sharePoll,
    fetchPolls,
    fetchGovernmentPolls
  } = usePolls();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [activeTab, setActiveTab] = useState('community');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'environment', label: 'Environment' },
    { value: 'education', label: 'Education' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'safety', label: 'Safety & Security' },
    { value: 'economy', label: 'Economy' },
    { value: 'other', label: 'Other' }
  ];

  const locations = [
    { value: 'all', label: 'All Locations' },
    { value: 'Delhi', label: 'Delhi' },
    { value: 'Mumbai', label: 'Mumbai' },
    { value: 'Bangalore', label: 'Bangalore' },
    { value: 'Chennai', label: 'Chennai' },
    { value: 'Kolkata', label: 'Kolkata' }
  ];

  const filteredPolls = (polls || []).filter(poll => {
    if (!poll || !poll.title) return false;
    const matchesSearch = poll.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (poll.description && poll.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || poll.category === selectedCategory;
    const matchesLocation = selectedLocation === 'all' || poll.location_city === selectedLocation;
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const filteredGovernmentPolls = (governmentPolls || []).filter(poll => {
    if (!poll || !poll.title) return false;
    const matchesSearch = poll.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (poll.description && poll.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || poll.category === selectedCategory;
    const matchesLocation = selectedLocation === 'all' || poll.location === selectedLocation;
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const handleVote = async (pollId: string, optionIndex: number, isGovernmentPoll: boolean = false) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to vote on polls.",
        variant: "destructive",
      });
      return;
    }

    if (isGovernmentPoll) {
      await voteGovernmentPoll(pollId, optionIndex);
    } else {
      await votePoll(pollId, optionIndex);
    }
  };

  const handleShare = async (pollId: string) => {
    await sharePoll(pollId);
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return 'Less than 1h left';
  };

  const PollCard = ({ poll, isGovernmentPoll = false }: { poll: CommunityPoll; isGovernmentPoll?: boolean }) => (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              {poll.title}
            </CardTitle>
            <CardDescription className="mt-2">
              {poll.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {poll.is_anonymous && (
              <Badge variant="secondary">
                <EyeOff className="h-3 w-3 mr-1" />
                Anonymous
              </Badge>
            )}
            <Badge variant={poll.is_active ? "default" : "secondary"}>
              {poll.is_active ? "Active" : "Closed"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Poll Info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {poll.location_city && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{poll.location_city}</span>
            </div>
          )}
          {poll.expires_at && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{getTimeRemaining(poll.expires_at)}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{poll.total_votes} votes</span>
          </div>
        </div>

        {/* Author Info */}
        {!poll.is_anonymous && poll.author_name && (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={poll.author_avatar} />
              <AvatarFallback>{poll.author_name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{poll.author_name}</span>
          </div>
        )}

        {/* Poll Options */}
        <div className="space-y-3">
          {poll.options.map((option: PollOption, index: number) => (
            <div key={option.id || index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{option.text}</span>
                <span className="text-sm text-muted-foreground">
                  {option.votes} votes ({option.percentage || 0}%)
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${option.percentage || 0}%` }}
                />
              </div>
              {poll.is_active && !poll.has_voted && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleVote(poll.id, index, isGovernmentPoll)}
                  disabled={voting}
                  className="w-full"
                >
                  <Vote className="h-4 w-4 mr-2" />
                  Vote for this option
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {poll.category && (
              <Badge variant="outline">{poll.category}</Badge>
            )}
            {poll.tags && poll.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleShare(poll.id)}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ResponsiveLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Community Polls</h1>
            <p className="text-muted-foreground mt-2">
              Participate in community discussions and government polls
            </p>
          </div>
          <div className="flex gap-2">
            <CreatePollDialog>
              <Button className="btn-event">
                <Plus className="w-4 h-4 mr-2" />
                Create Poll
              </Button>
            </CreatePollDialog>
            <GovernmentTaggingPoll>
              <Button variant="outline">
                <Building2 className="w-4 h-4 mr-2" />
                Government Poll
              </Button>
            </GovernmentTaggingPoll>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search polls..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full lg:w-48">
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
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-full lg:w-48">
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
            </div>
          </CardContent>
        </Card>

        {/* Polls Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="community" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Community Polls ({filteredPolls.length})
            </TabsTrigger>
            <TabsTrigger value="government" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Government Polls ({filteredGovernmentPolls.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="community" className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-muted rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-full mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredPolls.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPolls.map((poll) => (
                  <PollCard key={poll.id} poll={poll} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Community Polls Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || selectedCategory !== 'all' || selectedLocation !== 'all'
                      ? "No polls match your search criteria."
                      : "There are no community polls available at the moment."}
                  </p>
                  <CreatePollDialog>
                    <Button className="btn-event">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Poll
                    </Button>
                  </CreatePollDialog>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="government" className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-muted rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-full mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredGovernmentPolls.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGovernmentPolls.map((poll) => (
                  <PollCard key={poll.id} poll={poll} isGovernmentPoll={true} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Government Polls Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || selectedCategory !== 'all' || selectedLocation !== 'all'
                      ? "No government polls match your search criteria."
                      : "There are no government polls available at the moment."}
                  </p>
                  <GovernmentTaggingPoll>
                    <Button className="btn-event">
                      <Building2 className="w-4 h-4 mr-2" />
                      Create Government Poll
                    </Button>
                  </GovernmentTaggingPoll>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Poll Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{polls?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Community Polls</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{governmentPolls?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Government Polls</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{authorities?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Government Authorities</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsiveLayout>
  );
};

export default Polls;
