import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  Clock, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  BarChart3,
  Calendar,
  MapPin,
  Vote,
  Target,
  Award,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';

interface CommunityDecision {
  id: string;
  title: string;
  description: string;
  category: 'policy' | 'budget' | 'infrastructure' | 'community' | 'environment';
  status: 'proposed' | 'voting' | 'approved' | 'rejected' | 'implemented';
  priority: 'low' | 'medium' | 'high' | 'critical';
  total_votes: number;
  yes_votes: number;
  no_votes: number;
  abstain_votes: number;
  voting_deadline: string;
  implementation_deadline?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  location_city?: string;
  location_state?: string;
  tags: string[];
  user_vote?: 'yes' | 'no' | 'abstain';
  is_anonymous: boolean;
}

interface DecisionAnalytics {
  total_decisions: number;
  active_voting: number;
  recently_approved: number;
  implementation_rate: number;
  community_participation: number;
  top_categories: Array<{ category: string; count: number }>;
  voting_trends: Array<{ date: string; votes: number }>;
}

export const CommunityDecisionTracker: React.FC = () => {
  const { toast } = useToast();
  const [decisions, setDecisions] = useState<CommunityDecision[]>([]);
  const [analytics, setAnalytics] = useState<DecisionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);

  useEffect(() => {
    loadDecisions();
    loadAnalytics();
  }, [loadDecisions]);

  const loadDecisions = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('community_decisions')
        .select(`
          *,
          decision_votes(vote_type, user_id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedDecisions = data?.map(decision => ({
        ...decision,
        user_vote: decision.decision_votes?.[0]?.vote_type || undefined
      })) || [];

      setDecisions(formattedDecisions);
    } catch (error) {
      console.error('Error loading decisions:', error);
      toast({
        title: "Error",
        description: "Failed to load community decisions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadAnalytics = async () => {
    try {
      const { data, error } = await supabase.rpc('get_decision_analytics');
      if (error) throw error;
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const handleVote = async (decisionId: string, voteType: 'yes' | 'no' | 'abstain') => {
    try {
      setVoting(decisionId);
      
      const { error } = await supabase
        .from('decision_votes')
        .upsert({
          decision_id: decisionId,
          vote_type: voteType
        }, { onConflict: 'decision_id,user_id' });

      if (error) throw error;

      toast({
        title: "Vote Recorded",
        description: `Your ${voteType} vote has been recorded.`,
      });

      loadDecisions();
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Failed to record vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setVoting(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'proposed': return 'bg-blue-100 text-blue-800';
      case 'voting': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'implemented': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getVotingProgress = (decision: CommunityDecision) => {
    const total = decision.total_votes;
    if (total === 0) return 0;
    return Math.round((decision.yes_votes / total) * 100);
  };

  const getTimeRemaining = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Community Decision Tracker</h2>
            <p className="text-muted-foreground">Track and participate in community decisions</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Community Decision Tracker</h2>
          <p className="text-muted-foreground">Track and participate in community decisions</p>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Decisions</p>
                  <p className="text-2xl font-bold">{analytics.total_decisions}</p>
                </div>
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Voting</p>
                  <p className="text-2xl font-bold text-yellow-600">{analytics.active_voting}</p>
                </div>
                <Vote className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Implementation Rate</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.implementation_rate}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Participation</p>
                  <p className="text-2xl font-bold text-blue-600">{analytics.community_participation}%</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Decisions</TabsTrigger>
          <TabsTrigger value="voting">Voting Open</TabsTrigger>
          <TabsTrigger value="recent">Recently Decided</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {decisions
              .filter(d => d.status === 'proposed' || d.status === 'voting')
              .map((decision) => (
                <Card key={decision.id} className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{decision.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {decision.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(decision.status)}>
                          {decision.status}
                        </Badge>
                        <Badge className={getPriorityColor(decision.priority)}>
                          {decision.priority}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Voting Progress */}
                    {decision.status === 'voting' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Voting Progress</span>
                          <span>{getVotingProgress(decision)}% Yes</span>
                        </div>
                        <Progress value={getVotingProgress(decision)} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Yes: {decision.yes_votes}</span>
                          <span>No: {decision.no_votes}</span>
                          <span>Abstain: {decision.abstain_votes}</span>
                          <span>Total: {decision.total_votes}</span>
                        </div>
                      </div>
                    )}

                    {/* Voting Actions */}
                    {decision.status === 'voting' && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={decision.user_vote === 'yes' ? 'default' : 'outline'}
                          onClick={() => handleVote(decision.id, 'yes')}
                          disabled={voting === decision.id}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Yes
                        </Button>
                        <Button
                          size="sm"
                          variant={decision.user_vote === 'no' ? 'default' : 'outline'}
                          onClick={() => handleVote(decision.id, 'no')}
                          disabled={voting === decision.id}
                        >
                          <X className="h-4 w-4 mr-1" />
                          No
                        </Button>
                        <Button
                          size="sm"
                          variant={decision.user_vote === 'abstain' ? 'default' : 'outline'}
                          onClick={() => handleVote(decision.id, 'abstain')}
                          disabled={voting === decision.id}
                        >
                          <Minus className="h-4 w-4 mr-1" />
                          Abstain
                        </Button>
                      </div>
                    )}

                    {/* Decision Info */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Created: {format(new Date(decision.created_at), 'MMM dd, yyyy')}</span>
                      </div>
                      {decision.voting_deadline && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Voting ends: {getTimeRemaining(decision.voting_deadline)}</span>
                        </div>
                      )}
                      {decision.location_city && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{decision.location_city}, {decision.location_state}</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {decision.tags && decision.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {decision.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="voting" className="space-y-4">
          <div className="grid gap-4">
            {decisions
              .filter(d => d.status === 'voting')
              .map((decision) => (
                <Card key={decision.id} className="border-yellow-200 bg-yellow-50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Vote className="h-5 w-5 text-yellow-600" />
                          {decision.title}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {decision.description}
                        </CardDescription>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        Voting Open
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Voting ends in {getTimeRemaining(decision.voting_deadline)}. 
                        Make your voice heard!
                      </AlertDescription>
                    </Alert>

                    {/* Voting Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Current Results</span>
                        <span>{getVotingProgress(decision)}% Yes</span>
                      </div>
                      <Progress value={getVotingProgress(decision)} className="h-3" />
                    </div>

                    {/* Voting Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={decision.user_vote === 'yes' ? 'default' : 'outline'}
                        onClick={() => handleVote(decision.id, 'yes')}
                        disabled={voting === decision.id}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Vote Yes
                      </Button>
                      <Button
                        size="sm"
                        variant={decision.user_vote === 'no' ? 'default' : 'outline'}
                        onClick={() => handleVote(decision.id, 'no')}
                        disabled={voting === decision.id}
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Vote No
                      </Button>
                      <Button
                        size="sm"
                        variant={decision.user_vote === 'abstain' ? 'default' : 'outline'}
                        onClick={() => handleVote(decision.id, 'abstain')}
                        disabled={voting === decision.id}
                        className="flex-1"
                      >
                        <Minus className="h-4 w-4 mr-1" />
                        Abstain
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div className="grid gap-4">
            {decisions
              .filter(d => d.status === 'approved' || d.status === 'rejected' || d.status === 'implemented')
              .map((decision) => (
                <Card key={decision.id} className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{decision.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {decision.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(decision.status)}>
                          {decision.status}
                        </Badge>
                        {decision.status === 'implemented' && (
                          <Badge className="bg-green-100 text-green-800">
                            <Award className="h-3 w-3 mr-1" />
                            Implemented
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Decided: {format(new Date(decision.updated_at), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{decision.total_votes} votes</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {analytics && (
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Decision Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.top_categories.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="capitalize">{category.category}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={(category.count / analytics.total_decisions) * 100} className="w-24" />
                          <span className="text-sm text-muted-foreground">{category.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Voting Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.voting_trends.slice(-7).map((trend, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{format(new Date(trend.date), 'MMM dd')}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={(trend.votes / Math.max(...analytics.voting_trends.map(t => t.votes))) * 100} className="w-20" />
                          <span>{trend.votes} votes</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
