import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { 
  Vote, 
  Users, 
  MapPin, 
  Clock, 
  TrendingUp, 
  Building2,
  Megaphone,
  Tag,
  Send,
  Plus,
  ChevronDown,
  ChevronUp,
  Star,
  Award,
  Shield,
  UserCheck,
  Globe,
  Target,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Share2,
  Flag,
  Eye,
  Calendar,
  Timer,
  Lock,
  Unlock
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface CommunityPollsProps {
  className?: string;
}

interface Poll {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  options: PollOption[];
  created_by: string;
  creator_name: string;
  creator_avatar?: string;
  status: 'active' | 'closed' | 'draft';
  visibility: 'public' | 'community' | 'private';
  government_tagged: boolean;
  government_authority?: string;
  total_votes: number;
  user_vote?: number;
  created_at: string;
  expires_at?: string;
  tags: string[];
  community_impact_score: number;
  discussion_count: number;
  share_count: number;
}

interface PollOption {
  id: string;
  text: string;
  vote_count: number;
  percentage: number;
}

interface PollDiscussion {
  id: string;
  poll_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
  likes_count: number;
  is_liked?: boolean;
}

const CommunityPolls: React.FC<CommunityPollsProps> = ({ className }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { location } = useLocation();
  
  const [activeTab, setActiveTab] = useState<'active' | 'trending' | 'government' | 'my-polls'>('active');
  const [polls, setPolls] = useState<Poll[]>([]);
  const [discussions, setDiscussions] = useState<PollDiscussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState('');
  const [expandedPolls, setExpandedPolls] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Create poll form state
  const [newPoll, setNewPoll] = useState({
    title: '',
    description: '',
    category: '',
    visibility: 'public' as 'public' | 'community' | 'private',
    expires_at: '',
    options: ['', ''],
    tags: [] as string[],
    government_tagged: false,
    government_authority: ''
  });

  // Load polls
  const loadPolls = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('community_polls')
        .select(`
          *,
          profiles!left(
            full_name,
            avatar_url
          ),
          poll_options!left(
            id,
            text,
            vote_count
          ),
          poll_votes!left(
            user_id,
            option_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedPolls = data?.map(poll => {
        const totalVotes = poll.poll_options?.reduce((sum: number, option: any) => sum + option.vote_count, 0) || 0;
        const userVote = poll.poll_votes?.find((vote: any) => vote.user_id === user?.id);
        
        const options = poll.poll_options?.map((option: any) => ({
          ...option,
          percentage: totalVotes > 0 ? Math.round((option.vote_count / totalVotes) * 100) : 0
        })) || [];

        return {
          ...poll,
          creator_name: poll.profiles?.full_name || 'Anonymous',
          creator_avatar: poll.profiles?.avatar_url,
          options,
          total_votes: totalVotes,
          user_vote: userVote?.option_id,
        };
      }) || [];

      setPolls(processedPolls);
    } catch (error) {
      console.error('Error loading polls:', error);
      toast({
        title: "Error",
        description: "Failed to load polls",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Load poll discussions
  const loadDiscussions = useCallback(async (pollId: string) => {
    try {
      const { data, error } = await supabase
        .from('poll_discussions')
        .select(`
          *,
          profiles!left(
            full_name,
            avatar_url
          )
        `)
        .eq('poll_id', pollId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedDiscussions = data?.map(discussion => ({
        ...discussion,
        user_name: discussion.profiles?.full_name || 'Anonymous',
        user_avatar: discussion.profiles?.avatar_url,
      })) || [];

      setDiscussions(processedDiscussions);
    } catch (error) {
      console.error('Error loading discussions:', error);
    }
  }, []);

  useEffect(() => {
    loadPolls();
  }, [loadPolls]);

  const handleVote = async (pollId: string, optionId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to vote in polls",
        variant: "destructive",
      });
      return;
    }

    try {
      // Remove existing vote if any
      await supabase
        .from('poll_votes')
        .delete()
        .eq('poll_id', pollId)
        .eq('user_id', user.id);

      // Add new vote
      await supabase
        .from('poll_votes')
        .insert({
          poll_id: pollId,
          user_id: user.id,
          option_id: optionId
        });

      // Update poll options vote counts
      const poll = polls.find(p => p.id === pollId);
      if (poll) {
        const updatedOptions = poll.options.map(option => {
          if (option.id === optionId) {
            return { ...option, vote_count: option.vote_count + 1 };
          }
          return option;
        });

        const totalVotes = updatedOptions.reduce((sum, option) => sum + option.vote_count, 0);
        const optionsWithPercentages = updatedOptions.map(option => ({
          ...option,
          percentage: totalVotes > 0 ? Math.round((option.vote_count / totalVotes) * 100) : 0
        }));

        setPolls(prev => prev.map(p => 
          p.id === pollId 
            ? { 
                ...p, 
                options: optionsWithPercentages,
                total_votes: totalVotes,
                user_vote: optionId
              }
            : p
        ));
      }

      toast({
        title: "Vote recorded",
        description: "Your vote has been recorded",
      });
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Failed to record vote",
        variant: "destructive",
      });
    }
  };

  const handleCreatePoll = async () => {
    if (!user || !newPoll.title.trim() || newPoll.options.filter(opt => opt.trim()).length < 2) {
      toast({
        title: "Invalid poll",
        description: "Please provide a title and at least 2 options",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: pollData, error: pollError } = await supabase
        .from('community_polls')
        .insert({
          title: newPoll.title.trim(),
          description: newPoll.description.trim(),
          category: newPoll.category,
          location: location?.city || 'Unknown',
          created_by: user.id,
          status: 'active',
          visibility: newPoll.visibility,
          expires_at: newPoll.expires_at || null,
          government_tagged: newPoll.government_tagged,
          government_authority: newPoll.government_authority || null,
          tags: newPoll.tags
        })
        .select()
        .single();

      if (pollError) throw pollError;

      // Insert poll options
      const optionsToInsert = newPoll.options
        .filter(opt => opt.trim())
        .map(option => ({
          poll_id: pollData.id,
          text: option.trim(),
          vote_count: 0
        }));

      const { error: optionsError } = await supabase
        .from('poll_options')
        .insert(optionsToInsert);

      if (optionsError) throw optionsError;

      // Reset form
      setNewPoll({
        title: '',
        description: '',
        category: '',
        visibility: 'public',
        expires_at: '',
        options: ['', ''],
        tags: [],
        government_tagged: false,
        government_authority: ''
      });

      setShowCreatePoll(false);
      loadPolls();

      toast({
        title: "Poll created",
        description: "Your poll has been created successfully",
      });
    } catch (error) {
      console.error('Error creating poll:', error);
      toast({
        title: "Error",
        description: "Failed to create poll",
        variant: "destructive",
      });
    }
  };

  const handleStartDiscussion = async () => {
    if (!user || !selectedPoll || !newDiscussion.trim()) {
      return;
    }

    try {
      const { error } = await supabase
        .from('poll_discussions')
        .insert({
          poll_id: selectedPoll.id,
          user_id: user.id,
          content: newDiscussion.trim()
        });

      if (error) throw error;

      setNewDiscussion('');
      loadDiscussions(selectedPoll.id);
      toast({
        title: "Discussion started",
        description: "Your discussion has been posted",
      });
    } catch (error) {
      console.error('Error creating discussion:', error);
      toast({
        title: "Error",
        description: "Failed to start discussion",
        variant: "destructive",
      });
    }
  };

  const togglePollExpansion = (pollId: string) => {
    setExpandedPolls(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pollId)) {
        newSet.delete(pollId);
      } else {
        newSet.add(pollId);
      }
      return newSet;
    });
  };

  const addPollOption = () => {
    if (newPoll.options.length < 6) {
      setNewPoll(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const removePollOption = (index: number) => {
    if (newPoll.options.length > 2) {
      setNewPoll(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const updatePollOption = (index: number, value: string) => {
    setNewPoll(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const filteredPolls = polls.filter(poll => {
    const matchesSearch = poll.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         poll.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || poll.category === filterCategory;
    const matchesTab = 
      (activeTab === 'active' && poll.status === 'active') ||
      (activeTab === 'trending' && poll.total_votes > 10) ||
      (activeTab === 'government' && poll.government_tagged) ||
      (activeTab === 'my-polls' && poll.created_by === user?.id);
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'infrastructure': 'bg-orange-100 text-orange-800',
      'environment': 'bg-green-100 text-green-800',
      'health': 'bg-red-100 text-red-800',
      'education': 'bg-blue-100 text-blue-800',
      'transport': 'bg-purple-100 text-purple-800',
      'safety': 'bg-yellow-100 text-yellow-800',
      'culture': 'bg-pink-100 text-pink-800',
      'economy': 'bg-indigo-100 text-indigo-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'active': 'bg-green-100 text-green-800',
      'closed': 'bg-gray-100 text-gray-800',
      'draft': 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const isPollExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Community Polls
          </h1>
          <p className="text-muted-foreground mt-1">
            Voice your opinion on local issues and community decisions
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {location?.city || 'Your City'}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Vote className="h-3 w-3" />
            {polls.length} Polls
          </Badge>
          <Button onClick={() => setShowCreatePoll(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Poll
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search polls by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="infrastructure">Infrastructure</SelectItem>
            <SelectItem value="environment">Environment</SelectItem>
            <SelectItem value="health">Health</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="transport">Transport</SelectItem>
            <SelectItem value="safety">Safety</SelectItem>
            <SelectItem value="culture">Culture</SelectItem>
            <SelectItem value="economy">Economy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Active
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="government" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Government
          </TabsTrigger>
          <TabsTrigger value="my-polls" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            My Polls
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredPolls.map((poll) => (
                <motion.div
                  key={poll.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={getCategoryColor(poll.category)}>
                              {poll.category}
                            </Badge>
                            <Badge className={getStatusColor(poll.status)}>
                              {poll.status}
                            </Badge>
                            {poll.government_tagged && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                Government Tagged
                              </Badge>
                            )}
                            {isPollExpired(poll.expires_at) && (
                              <Badge variant="destructive">
                                <Timer className="h-3 w-3 mr-1" />
                                Expired
                              </Badge>
                            )}
                          </div>
                          
                          <CardTitle className="text-lg leading-tight">
                            {poll.title}
                          </CardTitle>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(poll.created_at), { addSuffix: true })}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {poll.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Vote className="h-3 w-3" />
                              {poll.total_votes} votes
                            </div>
                            {poll.expires_at && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Expires {format(new Date(poll.expires_at), 'MMM dd')}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={poll.creator_avatar} />
                            <AvatarFallback>
                              {poll.creator_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <CardDescription className="text-base">
                        {expandedPolls.has(poll.id) ? poll.description : poll.description.substring(0, 200) + '...'}
                      </CardDescription>
                      
                      {poll.description.length > 200 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePollExpansion(poll.id)}
                          className="p-0 h-auto text-blue-600 hover:text-blue-800"
                        >
                          {expandedPolls.has(poll.id) ? (
                            <>
                              <ChevronUp className="h-4 w-4 mr-1" />
                              Show less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-1" />
                              Read more
                            </>
                          )}
                        </Button>
                      )}
                      
                      {/* Poll Options */}
                      <div className="space-y-3">
                        {poll.options.map((option, index) => (
                          <div key={option.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{option.text}</span>
                              <span className="text-sm text-muted-foreground">
                                {option.vote_count} votes ({option.percentage}%)
                              </span>
                            </div>
                            <Progress value={option.percentage} className="h-2" />
                            {poll.status === 'active' && !isPollExpired(poll.expires_at) && (
                              <Button
                                variant={poll.user_vote === option.id ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleVote(poll.id, option.id)}
                                className="w-full"
                                disabled={poll.user_vote === option.id}
                              >
                                {poll.user_vote === option.id ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Your Vote
                                  </>
                                ) : (
                                  <>
                                    <Vote className="h-4 w-4 mr-2" />
                                    Vote
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPoll(poll);
                              setShowDiscussion(true);
                              loadDiscussions(poll.id);
                            }}
                            className="flex items-center gap-2 text-muted-foreground"
                          >
                            <MessageSquare className="h-4 w-4" />
                            {poll.discussion_count}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-2 text-muted-foreground"
                          >
                            <Share2 className="h-4 w-4" />
                            {poll.share_count}
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPoll(poll);
                              setShowDiscussion(true);
                              loadDiscussions(poll.id);
                            }}
                            className="flex items-center gap-2"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Discuss
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Poll Dialog */}
      <Dialog open={showCreatePoll} onOpenChange={setShowCreatePoll}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Create Community Poll</DialogTitle>
            <DialogDescription>
              Create a poll to gather community opinions on local issues
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Poll Title *</label>
                <Input
                  placeholder="What should we ask the community?"
                  value={newPoll.title}
                  onChange={(e) => setNewPoll(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Provide context and background information..."
                  value={newPoll.description}
                  onChange={(e) => setNewPoll(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category *</label>
                  <Select value={newPoll.category} onValueChange={(value) => setNewPoll(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="environment">Environment</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                      <SelectItem value="safety">Safety</SelectItem>
                      <SelectItem value="culture">Culture</SelectItem>
                      <SelectItem value="economy">Economy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Visibility</label>
                  <Select value={newPoll.visibility} onValueChange={(value) => setNewPoll(prev => ({ ...prev, visibility: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Public
                        </div>
                      </SelectItem>
                      <SelectItem value="community">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Community Only
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Private
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Expiration Date (Optional)</label>
                <Input
                  type="datetime-local"
                  value={newPoll.expires_at}
                  onChange={(e) => setNewPoll(prev => ({ ...prev, expires_at: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Poll Options *</label>
                <div className="space-y-2">
                  {newPoll.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => updatePollOption(index, e.target.value)}
                      />
                      {newPoll.options.length > 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePollOption(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {newPoll.options.length < 6 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addPollOption}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="government-tagged"
                  checked={newPoll.government_tagged}
                  onChange={(e) => setNewPoll(prev => ({ ...prev, government_tagged: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="government-tagged" className="text-sm font-medium">
                  Tag relevant government authority
                </label>
              </div>
              
              {newPoll.government_tagged && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Government Authority</label>
                  <Input
                    placeholder="e.g., Municipal Corporation, Health Department"
                    value={newPoll.government_authority}
                    onChange={(e) => setNewPoll(prev => ({ ...prev, government_authority: e.target.value }))}
                  />
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreatePoll(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePoll} disabled={!newPoll.title.trim() || newPoll.options.filter(opt => opt.trim()).length < 2}>
              <Plus className="h-4 w-4 mr-2" />
              Create Poll
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Discussion Dialog */}
      <Dialog open={showDiscussion} onOpenChange={setShowDiscussion}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Poll Discussion</DialogTitle>
            <DialogDescription>
              {selectedPoll?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* New Discussion Form */}
            <div className="space-y-2">
              <Textarea
                placeholder="Share your thoughts, ask questions, or discuss the poll..."
                value={newDiscussion}
                onChange={(e) => setNewDiscussion(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-end">
                <Button onClick={handleStartDiscussion} disabled={!newDiscussion.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Post Discussion
                </Button>
              </div>
            </div>
            
            <Separator />
            
            {/* Existing Discussions */}
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {discussions.map((discussion) => (
                  <Card key={discussion.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={discussion.user_avatar} />
                          <AvatarFallback>
                            {discussion.user_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {discussion.user_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          
                          <p className="text-sm">{discussion.content}</p>
                          
                          <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              {discussion.likes_count}
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunityPolls;
