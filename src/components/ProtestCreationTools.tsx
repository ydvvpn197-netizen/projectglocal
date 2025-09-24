import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Megaphone, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Shield,
  AlertTriangle,
  CheckCircle,
  Globe,
  Eye,
  EyeOff,
  Share2,
  Heart,
  MessageSquare,
  Flag,
  Camera,
  FileText,
  Bell,
  Target,
  Activity,
  TrendingUp,
  Award,
  Star
} from 'lucide-react';
import { format } from 'date-fns';

interface ProtestEvent {
  id: string;
  title: string;
  description: string;
  cause: string;
  objectives: string[];
  event_date: string;
  event_time: string;
  location_name: string;
  location_city: string;
  location_state: string;
  latitude?: number;
  longitude?: number;
  expected_participants: number;
  actual_participants: number;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  visibility: 'public' | 'private' | 'invite_only';
  is_anonymous: boolean;
  requires_approval: boolean;
  safety_guidelines: string[];
  media_guidelines: string[];
  legal_requirements: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  supporters: number;
  user_supporting?: boolean;
  creator_name?: string;
}

interface DigitalActivismFeature {
  id: string;
  name: string;
  description: string;
  type: 'petition' | 'campaign' | 'awareness' | 'fundraising' | 'boycott';
  status: 'active' | 'completed' | 'paused';
  target_audience: string;
  goal: string;
  current_progress: number;
  created_by: string;
  created_at: string;
  supporters: number;
  user_supporting?: boolean;
}

interface SignatureCollection {
  id: string;
  petition_id: string;
  signer_name: string;
  signer_email: string;
  signer_location?: string;
  signed_at: string;
  is_anonymous: boolean;
  ip_address?: string;
  user_agent?: string;
}

export const ProtestCreationTools: React.FC = () => {
  const { toast } = useToast();
  const [protests, setProtests] = useState<ProtestEvent[]>([]);
  const [digitalCampaigns, setDigitalCampaigns] = useState<DigitalActivismFeature[]>([]);
  const [signatures, setSignatures] = useState<SignatureCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDigitalForm, setShowDigitalForm] = useState(false);
  const [supporting, setSupporting] = useState<string | null>(null);

  const [newProtest, setNewProtest] = useState({
    title: '',
    description: '',
    cause: '',
    objectives: [] as string[],
    event_date: '',
    event_time: '',
    location_name: '',
    location_city: '',
    location_state: '',
    expected_participants: 0,
    visibility: 'public' as const,
    is_anonymous: false,
    requires_approval: false,
    safety_guidelines: [] as string[],
    media_guidelines: [] as string[],
    legal_requirements: [] as string[],
    tags: [] as string[]
  });

  const [newDigitalCampaign, setNewDigitalCampaign] = useState({
    name: '',
    description: '',
    type: 'petition' as const,
    target_audience: '',
    goal: '',
    is_anonymous: false
  });

  useEffect(() => {
    loadProtestData();
  }, [loadProtestData]);

  const loadProtestData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load protests
      const { data: protestsData, error: protestsError } = await supabase
        .from('protest_events')
        .select(`
          *,
          protest_supporters(user_id),
          profiles!protest_events_created_by_fkey(display_name)
        `)
        .order('created_at', { ascending: false });

      if (protestsError) throw protestsError;
      setProtests(protestsData || []);

      // Load digital campaigns
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('digital_activism_campaigns')
        .select(`
          *,
          campaign_supporters(user_id),
          profiles!digital_activism_campaigns_created_by_fkey(display_name)
        `)
        .order('created_at', { ascending: false });

      if (campaignsError) throw campaignsError;
      setDigitalCampaigns(campaignsData || []);

      // Load signatures
      const { data: signaturesData, error: signaturesError } = await supabase
        .from('signature_collections')
        .select('*')
        .order('signed_at', { ascending: false })
        .limit(100);

      if (signaturesError) throw signaturesError;
      setSignatures(signaturesData || []);

    } catch (error) {
      console.error('Error loading protest data:', error);
      toast({
        title: "Error",
        description: "Failed to load protest and activism data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleCreateProtest = async () => {
    try {
      const { error } = await supabase
        .from('protest_events')
        .insert({
          title: newProtest.title,
          description: newProtest.description,
          cause: newProtest.cause,
          objectives: newProtest.objectives,
          event_date: newProtest.event_date,
          event_time: newProtest.event_time,
          location_name: newProtest.location_name,
          location_city: newProtest.location_city,
          location_state: newProtest.location_state,
          expected_participants: newProtest.expected_participants,
          visibility: newProtest.visibility,
          is_anonymous: newProtest.is_anonymous,
          requires_approval: newProtest.requires_approval,
          safety_guidelines: newProtest.safety_guidelines,
          media_guidelines: newProtest.media_guidelines,
          legal_requirements: newProtest.legal_requirements,
          tags: newProtest.tags
        });

      if (error) throw error;

      toast({
        title: "Protest Created",
        description: "Your protest event has been created successfully.",
      });

      setNewProtest({
        title: '',
        description: '',
        cause: '',
        objectives: [],
        event_date: '',
        event_time: '',
        location_name: '',
        location_city: '',
        location_state: '',
        expected_participants: 0,
        visibility: 'public',
        is_anonymous: false,
        requires_approval: false,
        safety_guidelines: [],
        media_guidelines: [],
        legal_requirements: [],
        tags: []
      });
      setShowCreateForm(false);
      loadProtestData();
    } catch (error) {
      console.error('Error creating protest:', error);
      toast({
        title: "Error",
        description: "Failed to create protest. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateDigitalCampaign = async () => {
    try {
      const { error } = await supabase
        .from('digital_activism_campaigns')
        .insert({
          name: newDigitalCampaign.name,
          description: newDigitalCampaign.description,
          type: newDigitalCampaign.type,
          target_audience: newDigitalCampaign.target_audience,
          goal: newDigitalCampaign.goal,
          is_anonymous: newDigitalCampaign.is_anonymous
        });

      if (error) throw error;

      toast({
        title: "Campaign Created",
        description: "Your digital activism campaign has been created successfully.",
      });

      setNewDigitalCampaign({
        name: '',
        description: '',
        type: 'petition',
        target_audience: '',
        goal: '',
        is_anonymous: false
      });
      setShowDigitalForm(false);
      loadProtestData();
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSupport = async (id: string, type: 'protest' | 'campaign') => {
    try {
      setSupporting(id);
      
      const tableName = type === 'protest' ? 'protest_supporters' : 'campaign_supporters';
      const idField = type === 'protest' ? 'protest_id' : 'campaign_id';
      
      const { error } = await supabase
        .from(tableName)
        .upsert({
          [idField]: id,
          supported_at: new Date().toISOString()
        }, { onConflict: `${idField},user_id` });

      if (error) throw error;

      toast({
        title: "Support Recorded",
        description: `You are now supporting this ${type}.`,
      });

      loadProtestData();
    } catch (error) {
      console.error('Error supporting:', error);
      toast({
        title: "Error",
        description: "Failed to record support. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSupporting(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="h-4 w-4" />;
      case 'private': return <EyeOff className="h-4 w-4" />;
      case 'invite_only': return <Users className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const getCampaignIcon = (type: string) => {
    switch (type) {
      case 'petition': return <FileText className="h-4 w-4" />;
      case 'campaign': return <Target className="h-4 w-4" />;
      case 'awareness': return <Megaphone className="h-4 w-4" />;
      case 'fundraising': return <Heart className="h-4 w-4" />;
      case 'boycott': return <Flag className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Protest Creation Tools</h2>
            <p className="text-muted-foreground">Organize protests and digital activism campaigns</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
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
          <h2 className="text-2xl font-bold">Protest Creation Tools</h2>
          <p className="text-muted-foreground">Organize protests and digital activism campaigns</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowDigitalForm(true)} variant="outline">
            <Target className="h-4 w-4 mr-2" />
            Digital Campaign
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Megaphone className="h-4 w-4 mr-2" />
            Create Protest
          </Button>
        </div>
      </div>

      {/* Create Protest Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Protest Event</CardTitle>
            <CardDescription>
              Organize a peaceful protest to raise awareness and demand change.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Protest Title *</Label>
                <Input
                  value={newProtest.title}
                  onChange={(e) => setNewProtest(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="What are you protesting?"
                />
              </div>
              
              <div>
                <Label>Cause *</Label>
                <Input
                  value={newProtest.cause}
                  onChange={(e) => setNewProtest(prev => ({ ...prev, cause: e.target.value }))}
                  placeholder="What is the cause you're fighting for?"
                />
              </div>
            </div>

            <div>
              <Label>Description *</Label>
              <Textarea
                value={newProtest.description}
                onChange={(e) => setNewProtest(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the protest, its goals, and what you hope to achieve..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Event Date *</Label>
                <Input
                  type="date"
                  value={newProtest.event_date}
                  onChange={(e) => setNewProtest(prev => ({ ...prev, event_date: e.target.value }))}
                />
              </div>
              
              <div>
                <Label>Event Time *</Label>
                <Input
                  type="time"
                  value={newProtest.event_time}
                  onChange={(e) => setNewProtest(prev => ({ ...prev, event_time: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Location Name *</Label>
                <Input
                  value={newProtest.location_name}
                  onChange={(e) => setNewProtest(prev => ({ ...prev, location_name: e.target.value }))}
                  placeholder="e.g., City Hall, Main Square"
                />
              </div>
              
              <div>
                <Label>City *</Label>
                <Input
                  value={newProtest.location_city}
                  onChange={(e) => setNewProtest(prev => ({ ...prev, location_city: e.target.value }))}
                  placeholder="City"
                />
              </div>
              
              <div>
                <Label>State *</Label>
                <Input
                  value={newProtest.location_state}
                  onChange={(e) => setNewProtest(prev => ({ ...prev, location_state: e.target.value }))}
                  placeholder="State"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Expected Participants</Label>
                <Input
                  type="number"
                  value={newProtest.expected_participants}
                  onChange={(e) => setNewProtest(prev => ({ ...prev, expected_participants: parseInt(e.target.value) || 0 }))}
                  placeholder="Estimated number of participants"
                />
              </div>
              
              <div>
                <Label>Visibility</Label>
                <Select
                  value={newProtest.visibility}
                  onValueChange={(value: 'public' | 'private' | 'anonymous') => setNewProtest(prev => ({ ...prev, visibility: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="invite_only">Invite Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="anonymous"
                  checked={newProtest.is_anonymous}
                  onCheckedChange={(checked) => setNewProtest(prev => ({ ...prev, is_anonymous: checked }))}
                />
                <Label htmlFor="anonymous">Create anonymously</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="approval"
                  checked={newProtest.requires_approval}
                  onCheckedChange={(checked) => setNewProtest(prev => ({ ...prev, requires_approval: checked }))}
                />
                <Label htmlFor="approval">Require approval for participants</Label>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Ensure your protest is peaceful and follows local laws. 
                Consider safety guidelines and legal requirements for your area.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProtest}>
                Create Protest
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Digital Campaign Form */}
      {showDigitalForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Digital Activism Campaign</CardTitle>
            <CardDescription>
              Start a digital campaign to raise awareness and gather support online.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Campaign Name *</Label>
                <Input
                  value={newDigitalCampaign.name}
                  onChange={(e) => setNewDigitalCampaign(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Campaign title"
                />
              </div>
              
              <div>
                <Label>Campaign Type *</Label>
                <Select
                  value={newDigitalCampaign.type}
                  onValueChange={(value: string) => setNewDigitalCampaign(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="petition">Petition</SelectItem>
                    <SelectItem value="campaign">Awareness Campaign</SelectItem>
                    <SelectItem value="fundraising">Fundraising</SelectItem>
                    <SelectItem value="boycott">Boycott</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Description *</Label>
              <Textarea
                value={newDigitalCampaign.description}
                onChange={(e) => setNewDigitalCampaign(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your campaign and its goals..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Target Audience</Label>
                <Input
                  value={newDigitalCampaign.target_audience}
                  onChange={(e) => setNewDigitalCampaign(prev => ({ ...prev, target_audience: e.target.value }))}
                  placeholder="Who do you want to reach?"
                />
              </div>
              
              <div>
                <Label>Goal</Label>
                <Input
                  value={newDigitalCampaign.goal}
                  onChange={(e) => setNewDigitalCampaign(prev => ({ ...prev, goal: e.target.value }))}
                  placeholder="What do you want to achieve?"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="campaign-anonymous"
                checked={newDigitalCampaign.is_anonymous}
                onCheckedChange={(checked) => setNewDigitalCampaign(prev => ({ ...prev, is_anonymous: checked }))}
              />
              <Label htmlFor="campaign-anonymous">Create anonymously</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDigitalForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateDigitalCampaign}>
                Create Campaign
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Protests */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Active Protests</h3>
        <div className="grid gap-4">
          {protests
            .filter(p => p.status === 'planning' || p.status === 'active')
            .map((protest) => (
              <Card key={protest.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Megaphone className="h-5 w-5" />
                        {protest.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {protest.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(protest.status)}>
                        {protest.status}
                      </Badge>
                      <Badge variant="outline">
                        {getVisibilityIcon(protest.visibility)}
                        {protest.visibility}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(protest.event_date), 'MMM dd, yyyy')} at {protest.event_time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{protest.location_name}, {protest.location_city}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{protest.actual_participants || 0}/{protest.expected_participants} participants</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={protest.user_supporting ? 'default' : 'outline'}
                      onClick={() => handleSupport(protest.id, 'protest')}
                      disabled={supporting === protest.id}
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      {protest.user_supporting ? 'Supporting' : 'Support'} ({protest.supporters})
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Discuss
                    </Button>
                  </div>

                  {protest.tags && protest.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {protest.tags.map((tag, index) => (
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
      </div>

      {/* Digital Campaigns */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Digital Activism Campaigns</h3>
        <div className="grid gap-4">
          {digitalCampaigns
            .filter(c => c.status === 'active')
            .map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getCampaignIcon(campaign.type)}
                        {campaign.name}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {campaign.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {campaign.type}
                      </Badge>
                      <Badge className="bg-green-100 text-green-800">
                        {campaign.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{campaign.current_progress}%</span>
                    </div>
                    <Progress value={campaign.current_progress} className="h-2" />
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      <span>Target: {campaign.target_audience}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{campaign.supporters} supporters</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(campaign.created_at), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={campaign.user_supporting ? 'default' : 'outline'}
                      onClick={() => handleSupport(campaign.id, 'campaign')}
                      disabled={supporting === campaign.id}
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      {campaign.user_supporting ? 'Supporting' : 'Support'}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Discuss
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Signature Collection Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Signature Collection Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{signatures.length}</div>
              <div className="text-sm text-muted-foreground">Total Signatures</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {new Set(signatures.map(s => s.petition_id)).size}
              </div>
              <div className="text-sm text-muted-foreground">Active Petitions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {signatures.filter(s => s.is_anonymous).length}
              </div>
              <div className="text-sm text-muted-foreground">Anonymous Signatures</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
