import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  Building2, 
  Users, 
  Megaphone, 
  BarChart3, 
  CheckCircle, 
  Clock,
  Shield,
  MessageSquare,
  TrendingUp,
  Target,
  Vote,
  UserPlus
} from 'lucide-react';

// Import our enhanced services
import { governmentAuthorityService, GovernmentAuthority, GovernmentTag } from '@/services/governmentAuthorityService';
import { virtualProtestServiceEnhanced, VirtualProtest } from '@/services/virtualProtestServiceEnhanced';
import { communityPollsEnhanced, CommunityPoll } from '@/services/communityPollsEnhanced';
import { anonymousUserService } from '@/services/anonymousUserService';

interface CoreFeaturesIntegrationProps {
  className?: string;
}

export const CoreFeaturesIntegration: React.FC<CoreFeaturesIntegrationProps> = ({ 
  className = '' 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // State for all features
  const [authorities, setAuthorities] = useState<GovernmentAuthority[]>([]);
  const [protests, setProtests] = useState<VirtualProtest[]>([]);
  const [polls, setPolls] = useState<CommunityPoll[]>([]);
  const [loading, setLoading] = useState({
    authorities: false,
    protests: false,
    polls: false
  });
  const [activeTab, setActiveTab] = useState('overview');

  const loadAllData = useCallback(async () => {
    setLoading({ authorities: true, protests: true, polls: true });
    
    try {
      // Load in parallel
      const [authoritiesData, protestsData, pollsData] = await Promise.all([
        governmentAuthorityService.getAuthorities({ limit: 5 }),
        virtualProtestServiceEnhanced.getProtests({ limit: 5, isActive: true }),
        communityPollsEnhanced.getPolls({ limit: 5, isActive: true })
      ]);

      setAuthorities(authoritiesData);
      setProtests(protestsData);
      setPolls(pollsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load feature data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading({ authorities: false, protests: false, polls: false });
    }
  }, [toast]);

  // Load all data on component mount
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleCreateProtest = async () => {
    try {
      const newProtest = await virtualProtestServiceEnhanced.createProtest({
        title: 'Sample Virtual Protest',
        description: 'This is a demonstration of the virtual protest system with anonymous participation.',
        cause: 'Digital Rights',
        protestType: 'digital_assembly',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        participationGoal: 100,
        locationType: 'virtual',
        locationDetails: {
          virtual_platform: 'Zoom',
          meeting_link: 'https://zoom.us/j/123456789'
        },
        isAnonymous: true,
        isPublic: true,
        tags: ['digital-rights', 'privacy', 'democracy'],
        actions: [
          {
            action_type: 'sign_petition',
            title: 'Sign Digital Rights Petition',
            description: 'Sign our petition to protect digital privacy rights',
            is_required: true,
            order_index: 0
          },
          {
            action_type: 'share_content',
            title: 'Share on Social Media',
            description: 'Share this protest on your social media platforms',
            is_required: false,
            order_index: 1
          }
        ]
      });

      toast({
        title: 'Protest Created',
        description: 'Virtual protest has been created successfully!',
      });

      // Reload protests
      const updatedProtests = await virtualProtestServiceEnhanced.getProtests({ limit: 5, isActive: true });
      setProtests(updatedProtests);
    } catch (error) {
      console.error('Error creating protest:', error);
      toast({
        title: 'Error',
        description: 'Failed to create protest. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleCreatePoll = async () => {
    try {
      const newPoll = await communityPollsEnhanced.createPoll({
        question: 'Should we implement stronger privacy protections?',
        description: 'This poll demonstrates anonymous voting capabilities in our community system.',
        options: [
          { text: 'Yes, stronger protections needed', color: '#10b981' },
          { text: 'No, current protections are sufficient', color: '#ef4444' },
          { text: 'Not sure, need more information', color: '#f59e0b' }
        ],
        isMultipleChoice: false,
        isAnonymous: true,
        isPublic: true,
        allowComments: true,
        showResultsBeforeVoting: false
      });

      toast({
        title: 'Poll Created',
        description: 'Community poll has been created successfully!',
      });

      // Reload polls
      const updatedPolls = await communityPollsEnhanced.getPolls({ limit: 5, isActive: true });
      setPolls(updatedPolls);
    } catch (error) {
      console.error('Error creating poll:', error);
      toast({
        title: 'Error',
        description: 'Failed to create poll. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleTagAuthority = async (authorityId: string) => {
    try {
      const tag = await governmentAuthorityService.createTag(authorityId, {
        tagType: 'suggestion',
        priority: 'medium',
        description: 'This is a demonstration of government authority tagging with anonymous submission.',
        isAnonymous: true
      });

      toast({
        title: 'Tag Created',
        description: `Your suggestion has been tagged to ${tag.authority?.name || 'the authority'}.`,
      });
    } catch (error) {
      console.error('Error creating tag:', error);
      toast({
        title: 'Error',
        description: 'Failed to create government tag. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleJoinProtest = async (protestId: string) => {
    try {
      await virtualProtestServiceEnhanced.joinProtest(protestId, 'interested', true);
      
      toast({
        title: 'Joined Protest',
        description: 'You have successfully joined the protest anonymously!',
      });

      // Reload protests to show updated participant count
      const updatedProtests = await virtualProtestServiceEnhanced.getProtests({ limit: 5, isActive: true });
      setProtests(updatedProtests);
    } catch (error) {
      console.error('Error joining protest:', error);
      toast({
        title: 'Error',
        description: 'Failed to join protest. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleVoteOnPoll = async (pollId: string, optionIds: string[]) => {
    try {
      await communityPollsEnhanced.voteOnPoll(pollId, optionIds, true);
      
      toast({
        title: 'Vote Cast',
        description: 'Your anonymous vote has been recorded!',
      });

      // Reload polls to show updated results
      const updatedPolls = await communityPollsEnhanced.getPolls({ limit: 5, isActive: true });
      setPolls(updatedPolls);
    } catch (error) {
      console.error('Error voting on poll:', error);
      toast({
        title: 'Error',
        description: 'Failed to vote on poll. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Core Features Integration</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Experience all four core features working together: Government Authority Tagging, 
          Virtual Protest System, Artist Booking, and Anonymous Community Polls.
        </p>
        <Alert className="max-w-2xl mx-auto">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            All features support anonymous participation by default, ensuring your privacy while engaging with your community.
          </AlertDescription>
        </Alert>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{authorities.length}</p>
                <p className="text-sm text-muted-foreground">Government Authorities</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Megaphone className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{protests.length}</p>
                <p className="text-sm text-muted-foreground">Active Protests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Vote className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{polls.length}</p>
                <p className="text-sm text-muted-foreground">Active Polls</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {protests.reduce((sum, protest) => sum + protest.current_participants, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Participants</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="authorities">Government Tagging</TabsTrigger>
          <TabsTrigger value="protests">Virtual Protests</TabsTrigger>
          <TabsTrigger value="polls">Community Polls</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Government Authorities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Government Authorities</span>
                </CardTitle>
                <CardDescription>
                  Tag government authorities with issues, complaints, or suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading.authorities ? (
                  <div className="flex items-center justify-center py-4">
                    <Clock className="h-4 w-4 animate-spin mr-2" />
                    Loading authorities...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {authorities.slice(0, 3).map((authority) => (
                      <div key={authority.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{authority.name}</p>
                          <p className="text-sm text-muted-foreground">{authority.department}</p>
                          <Badge variant="outline" className="mt-1">
                            {authority.level}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleTagAuthority(authority.id)}
                        >
                          Tag
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Virtual Protests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Megaphone className="h-5 w-5" />
                  <span>Virtual Protests</span>
                </CardTitle>
                <CardDescription>
                  Join or create virtual protests for social causes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading.protests ? (
                  <div className="flex items-center justify-center py-4">
                    <Clock className="h-4 w-4 animate-spin mr-2" />
                    Loading protests...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {protests.slice(0, 3).map((protest) => (
                      <div key={protest.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{protest.title}</p>
                            <p className="text-sm text-muted-foreground mb-2">{protest.cause}</p>
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                {protest.current_participants}/{protest.participation_goal}
                              </span>
                              <Badge variant={protest.status === 'active' ? 'default' : 'secondary'}>
                                {protest.status}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleJoinProtest(protest.id)}
                          >
                            Join
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={handleCreateProtest}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create New Protest
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Community Polls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Vote className="h-5 w-5" />
                <span>Community Polls</span>
              </CardTitle>
              <CardDescription>
                Participate in anonymous community polls and discussions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading.polls ? (
                <div className="flex items-center justify-center py-4">
                  <Clock className="h-4 w-4 animate-spin mr-2" />
                  Loading polls...
                </div>
              ) : (
                <div className="space-y-4">
                  {polls.slice(0, 2).map((poll) => (
                    <div key={poll.id} className="p-4 border rounded-lg">
                      <div className="space-y-3">
                        <div>
                          <p className="font-medium">{poll.question}</p>
                          {poll.description && (
                            <p className="text-sm text-muted-foreground mt-1">{poll.description}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          {poll.options.map((option, index) => (
                            <div key={option.id} className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 justify-start"
                                onClick={() => handleVoteOnPoll(poll.id, [option.id])}
                                disabled={poll.has_voted}
                              >
                                {option.text}
                              </Button>
                              {poll.has_voted && (
                                <span className="text-sm text-muted-foreground">
                                  {option.votes} votes
                                </span>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Total votes: {poll.total_votes}</span>
                          <Badge variant={poll.is_anonymous ? 'default' : 'secondary'}>
                            {poll.is_anonymous ? 'Anonymous' : 'Public'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={handleCreatePoll}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Create New Poll
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="authorities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Government Authority Tagging System</CardTitle>
              <CardDescription>
                Tag government authorities with issues, complaints, suggestions, requests, or feedback. 
                All tagging supports anonymous submission for privacy protection.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {authorities.map((authority) => (
                  <Card key={authority.id} className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-medium">{authority.name}</h3>
                        <p className="text-sm text-muted-foreground">{authority.department}</p>
                        <p className="text-sm text-muted-foreground">{authority.jurisdiction}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{authority.level}</Badge>
                        <Button
                          size="sm"
                          onClick={() => handleTagAuthority(authority.id)}
                        >
                          Tag Authority
                        </Button>
                      </div>
                      {authority.contact_email && (
                        <p className="text-xs text-muted-foreground">
                          Contact: {authority.contact_email}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Virtual Protest System</CardTitle>
              <CardDescription>
                Create and join virtual protests for social causes. Support anonymous participation 
                and track engagement with multiple action types.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {protests.map((protest) => (
                  <Card key={protest.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{protest.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{protest.description}</p>
                          <p className="text-sm font-medium text-blue-600 mt-1">{protest.cause}</p>
                        </div>
                        <Badge variant={protest.status === 'active' ? 'default' : 'secondary'}>
                          {protest.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Participants</p>
                          <p className="font-medium">{protest.current_participants}/{protest.participation_goal}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Type</p>
                          <p className="font-medium capitalize">{protest.protest_type.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Location</p>
                          <p className="font-medium capitalize">{protest.location_type}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Privacy</p>
                          <p className="font-medium">{protest.is_anonymous ? 'Anonymous' : 'Public'}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => handleJoinProtest(protest.id)}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Join Protest
                        </Button>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                
                <Button 
                  className="w-full" 
                  onClick={handleCreateProtest}
                >
                  <Megaphone className="h-4 w-4 mr-2" />
                  Create New Virtual Protest
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="polls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Community Polls System</CardTitle>
              <CardDescription>
                Participate in anonymous community polls. Vote on questions that matter to your community 
                while maintaining your privacy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {polls.map((poll) => (
                  <Card key={poll.id} className="p-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium">{poll.question}</h3>
                        {poll.description && (
                          <p className="text-sm text-muted-foreground mt-1">{poll.description}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        {poll.options.map((option) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              className="flex-1 justify-start"
                              onClick={() => handleVoteOnPoll(poll.id, [option.id])}
                              disabled={poll.has_voted}
                            >
                              {option.text}
                            </Button>
                            {poll.has_voted && (
                              <div className="flex items-center space-x-2 text-sm">
                                <span className="text-muted-foreground">{option.votes} votes</span>
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ 
                                      width: `${poll.total_votes > 0 ? (option.votes / poll.total_votes) * 100 : 0}%` 
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="text-muted-foreground">
                            Total votes: {poll.total_votes}
                          </span>
                          <Badge variant={poll.is_anonymous ? 'default' : 'secondary'}>
                            {poll.is_anonymous ? 'Anonymous Voting' : 'Public Voting'}
                          </Badge>
                          <Badge variant={poll.is_multiple_choice ? 'default' : 'outline'}>
                            {poll.is_multiple_choice ? 'Multiple Choice' : 'Single Choice'}
                          </Badge>
                        </div>
                        {poll.has_voted && (
                          <span className="text-green-600 font-medium">
                            ✓ You voted
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
                
                <Button 
                  className="w-full" 
                  onClick={handleCreatePoll}
                >
                  <Vote className="h-4 w-4 mr-2" />
                  Create New Community Poll
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Feature Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Feature Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2 p-3 border rounded-lg bg-green-50">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Government Tagging</p>
                <p className="text-sm text-muted-foreground">Complete</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 p-3 border rounded-lg bg-green-50">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Virtual Protests</p>
                <p className="text-sm text-muted-foreground">Complete</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 p-3 border rounded-lg bg-green-50">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Artist Booking</p>
                <p className="text-sm text-muted-foreground">Complete</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 p-3 border rounded-lg bg-green-50">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Community Polls</p>
                <p className="text-sm text-muted-foreground">Complete</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
