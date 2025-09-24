import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  Users, 
  TrendingUp, 
  Calendar, 
  MapPin,
  Shield,
  Eye,
  EyeOff,
  Share2,
  Download,
  CheckCircle,
  AlertTriangle,
  Target,
  BarChart3,
  Activity,
  Star,
  Heart,
  MessageSquare,
  Bell,
  Globe,
  Lock,
  Unlock
} from 'lucide-react';
import { format } from 'date-fns';

interface Petition {
  id: string;
  title: string;
  description: string;
  cause: string;
  target: string;
  goal_signatures: number;
  current_signatures: number;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  visibility: 'public' | 'private' | 'unlisted';
  is_anonymous: boolean;
  requires_verification: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  tags: string[];
  location_city?: string;
  location_state?: string;
  creator_name?: string;
  user_signed?: boolean;
  progress_percentage: number;
}

interface Signature {
  id: string;
  petition_id: string;
  signer_name: string;
  signer_email: string;
  signer_location?: string;
  signed_at: string;
  is_anonymous: boolean;
  is_verified: boolean;
  ip_address?: string;
  user_agent?: string;
  petition_title?: string;
}

interface SignatureAnalytics {
  total_signatures: number;
  unique_signers: number;
  verified_signatures: number;
  anonymous_signatures: number;
  signatures_by_location: Array<{
    location: string;
    count: number;
  }>;
  signatures_by_date: Array<{
    date: string;
    count: number;
  }>;
  top_petitions: Array<{
    petition_id: string;
    title: string;
    signatures: number;
  }>;
}

export const SignatureCollectionSystem: React.FC = () => {
  const { toast } = useToast();
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [analytics, setAnalytics] = useState<SignatureAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [signing, setSigning] = useState<string | null>(null);

  const [newPetition, setNewPetition] = useState({
    title: '',
    description: '',
    cause: '',
    target: '',
    goal_signatures: 100,
    visibility: 'public' as const,
    is_anonymous: false,
    requires_verification: false,
    expires_at: '',
    tags: [] as string[],
    location_city: '',
    location_state: ''
  });

  const [signatureForm, setSignatureForm] = useState({
    petition_id: '',
    signer_name: '',
    signer_email: '',
    signer_location: '',
    is_anonymous: false,
    comment: ''
  });

  useEffect(() => {
    loadSignatureData();
  }, [loadSignatureData]);

  const loadSignatureData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load petitions
      const { data: petitionsData, error: petitionsError } = await supabase
        .from('petitions')
        .select(`
          *,
          petition_signatures(id, is_anonymous, is_verified),
          profiles!petitions_created_by_fkey(display_name)
        `)
        .order('created_at', { ascending: false });

      if (petitionsError) throw petitionsError;

      const formattedPetitions = petitionsData?.map(petition => ({
        ...petition,
        creator_name: petition.profiles?.display_name || 'Anonymous',
        current_signatures: petition.petition_signatures?.length || 0,
        progress_percentage: Math.round(((petition.petition_signatures?.length || 0) / petition.goal_signatures) * 100),
        user_signed: petition.petition_signatures?.some((s: { user_id: string }) => s.user_id === petition.created_by) || false
      })) || [];

      setPetitions(formattedPetitions);

      // Load signatures
      const { data: signaturesData, error: signaturesError } = await supabase
        .from('petition_signatures')
        .select(`
          *,
          petitions(title)
        `)
        .order('signed_at', { ascending: false })
        .limit(100);

      if (signaturesError) throw signaturesError;
      setSignatures(signaturesData || []);

      // Load analytics
      const { data: analyticsData, error: analyticsError } = await supabase.rpc('get_signature_analytics');
      if (analyticsError) throw analyticsError;
      setAnalytics(analyticsData);

    } catch (error) {
      console.error('Error loading signature data:', error);
      toast({
        title: "Error",
        description: "Failed to load signature collection data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleCreatePetition = async () => {
    try {
      const { error } = await supabase
        .from('petitions')
        .insert({
          title: newPetition.title,
          description: newPetition.description,
          cause: newPetition.cause,
          target: newPetition.target,
          goal_signatures: newPetition.goal_signatures,
          visibility: newPetition.visibility,
          is_anonymous: newPetition.is_anonymous,
          requires_verification: newPetition.requires_verification,
          expires_at: newPetition.expires_at || null,
          tags: newPetition.tags,
          location_city: newPetition.location_city,
          location_state: newPetition.location_state
        });

      if (error) throw error;

      toast({
        title: "Petition Created",
        description: "Your petition has been created successfully.",
      });

      setNewPetition({
        title: '',
        description: '',
        cause: '',
        target: '',
        goal_signatures: 100,
        visibility: 'public',
        is_anonymous: false,
        requires_verification: false,
        expires_at: '',
        tags: [],
        location_city: '',
        location_state: ''
      });
      setShowCreateForm(false);
      loadSignatureData();
    } catch (error) {
      console.error('Error creating petition:', error);
      toast({
        title: "Error",
        description: "Failed to create petition. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSignPetition = async (petitionId: string) => {
    try {
      setSigning(petitionId);
      
      const { error } = await supabase
        .from('petition_signatures')
        .insert({
          petition_id: petitionId,
          signer_name: signatureForm.signer_name,
          signer_email: signatureForm.signer_email,
          signer_location: signatureForm.signer_location,
          is_anonymous: signatureForm.is_anonymous,
          comment: signatureForm.comment
        });

      if (error) throw error;

      toast({
        title: "Signature Added",
        description: "Thank you for signing the petition!",
      });

      setSignatureForm({
        petition_id: '',
        signer_name: '',
        signer_email: '',
        signer_location: '',
        is_anonymous: false,
        comment: ''
      });
      loadSignatureData();
    } catch (error) {
      console.error('Error signing petition:', error);
      toast({
        title: "Error",
        description: "Failed to sign petition. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSigning(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="h-4 w-4" />;
      case 'private': return <Lock className="h-4 w-4" />;
      case 'unlisted': return <EyeOff className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
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
            <h2 className="text-2xl font-bold">Signature Collection System</h2>
            <p className="text-muted-foreground">Create and manage petitions with signature collection</p>
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
          <h2 className="text-2xl font-bold">Signature Collection System</h2>
          <p className="text-muted-foreground">Create and manage petitions with signature collection</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <FileText className="h-4 w-4 mr-2" />
          Create Petition
        </Button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Signatures</p>
                  <p className="text-2xl font-bold">{analytics.total_signatures}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unique Signers</p>
                  <p className="text-2xl font-bold text-blue-600">{analytics.unique_signers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Verified</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.verified_signatures}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Anonymous</p>
                  <p className="text-2xl font-bold text-purple-600">{analytics.anonymous_signatures}</p>
                </div>
                <EyeOff className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Petition Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Petition</CardTitle>
            <CardDescription>
              Start a petition to gather signatures for your cause.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Petition Title *</Label>
                <Input
                  value={newPetition.title}
                  onChange={(e) => setNewPetition(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="What are you petitioning for?"
                />
              </div>
              
              <div>
                <Label>Target *</Label>
                <Input
                  value={newPetition.target}
                  onChange={(e) => setNewPetition(prev => ({ ...prev, target: e.target.value }))}
                  placeholder="Who are you petitioning?"
                />
              </div>
            </div>

            <div>
              <Label>Description *</Label>
              <Textarea
                value={newPetition.description}
                onChange={(e) => setNewPetition(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Explain your cause and why people should sign..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Cause</Label>
                <Input
                  value={newPetition.cause}
                  onChange={(e) => setNewPetition(prev => ({ ...prev, cause: e.target.value }))}
                  placeholder="What is the cause you're fighting for?"
                />
              </div>
              
              <div>
                <Label>Goal Signatures</Label>
                <Input
                  type="number"
                  value={newPetition.goal_signatures}
                  onChange={(e) => setNewPetition(prev => ({ ...prev, goal_signatures: parseInt(e.target.value) || 100 }))}
                  placeholder="How many signatures do you need?"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Expiry Date (Optional)</Label>
                <Input
                  type="date"
                  value={newPetition.expires_at}
                  onChange={(e) => setNewPetition(prev => ({ ...prev, expires_at: e.target.value }))}
                />
              </div>
              
              <div>
                <Label>Visibility</Label>
                <Select
                  value={newPetition.visibility}
                  onValueChange={(value: 'public' | 'private' | 'anonymous') => setNewPetition(prev => ({ ...prev, visibility: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="unlisted">Unlisted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="anonymous"
                  checked={newPetition.is_anonymous}
                  onCheckedChange={(checked) => setNewPetition(prev => ({ ...prev, is_anonymous: checked }))}
                />
                <Label htmlFor="anonymous">Create anonymously</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="verification"
                  checked={newPetition.requires_verification}
                  onCheckedChange={(checked) => setNewPetition(prev => ({ ...prev, requires_verification: checked }))}
                />
                <Label htmlFor="verification">Require email verification for signatures</Label>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Ensure your petition is legitimate and follows platform guidelines. 
                False or misleading petitions may be removed.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePetition}>
                Create Petition
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Petitions</TabsTrigger>
          <TabsTrigger value="signatures">Recent Signatures</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {petitions
              .filter(p => p.status === 'active')
              .map((petition) => (
                <Card key={petition.id} className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          {petition.title}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {petition.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(petition.status)}>
                          {petition.status}
                        </Badge>
                        <Badge variant="outline">
                          {getVisibilityIcon(petition.visibility)}
                          {petition.visibility}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{petition.current_signatures}/{petition.goal_signatures} signatures</span>
                      </div>
                      <Progress value={petition.progress_percentage} className="h-3" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{petition.progress_percentage}% complete</span>
                        <span>{petition.goal_signatures - petition.current_signatures} more needed</span>
                      </div>
                    </div>

                    {/* Petition Info */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Created: {format(new Date(petition.created_at), 'MMM dd, yyyy')}</span>
                      </div>
                      {petition.expires_at && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Expires: {getTimeRemaining(petition.expires_at)}</span>
                        </div>
                      )}
                      {petition.location_city && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{petition.location_city}, {petition.location_state}</span>
                        </div>
                      )}
                    </div>

                    {/* Target and Cause */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Target:</span> {petition.target}
                      </div>
                      {petition.cause && (
                        <div>
                          <span className="font-medium">Cause:</span> {petition.cause}
                        </div>
                      )}
                    </div>

                    {/* Sign Petition */}
                    {!petition.user_signed && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input
                            placeholder="Your name"
                            value={signatureForm.signer_name}
                            onChange={(e) => setSignatureForm(prev => ({ ...prev, signer_name: e.target.value }))}
                          />
                          <Input
                            placeholder="Your email"
                            type="email"
                            value={signatureForm.signer_email}
                            onChange={(e) => setSignatureForm(prev => ({ ...prev, signer_email: e.target.value }))}
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`anonymous-${petition.id}`}
                            checked={signatureForm.is_anonymous}
                            onCheckedChange={(checked) => setSignatureForm(prev => ({ ...prev, is_anonymous: checked }))}
                          />
                          <Label htmlFor={`anonymous-${petition.id}`}>Sign anonymously</Label>
                        </div>

                        <Button
                          onClick={() => handleSignPetition(petition.id)}
                          disabled={signing === petition.id || !signatureForm.signer_name || !signatureForm.signer_email}
                          className="w-full"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {signing === petition.id ? 'Signing...' : 'Sign Petition'}
                        </Button>
                      </div>
                    )}

                    {petition.user_signed && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>You have signed this petition</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Discuss
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                    </div>

                    {/* Tags */}
                    {petition.tags && petition.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {petition.tags.map((tag, index) => (
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

        <TabsContent value="signatures" className="space-y-4">
          <div className="grid gap-4">
            {signatures.slice(0, 20).map((signature) => (
              <Card key={signature.id} className="hover:shadow-lg transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {signature.is_anonymous ? 'Anonymous' : signature.signer_name}
                        </span>
                        {signature.is_verified && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {signature.is_anonymous && (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Signed: {format(new Date(signature.signed_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                      {signature.signer_location && (
                        <p className="text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {signature.signer_location}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{signature.petition_title}</p>
                      <Badge variant="outline" className="text-xs">
                        {signature.is_verified ? 'Verified' : 'Unverified'}
                      </Badge>
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
              {/* Top Petitions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Top Petitions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.top_petitions.map((petition, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{petition.title}</p>
                          <p className="text-sm text-muted-foreground">{petition.signatures} signatures</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">#{index + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Signatures by Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Signatures by Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.signatures_by_location.map((location, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span>{location.location}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={(location.count / analytics.total_signatures) * 100} className="w-24" />
                          <span className="text-sm text-muted-foreground">{location.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Signatures by Date */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Signatures Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.signatures_by_date.slice(-7).map((date, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{format(new Date(date.date), 'MMM dd')}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={(date.count / Math.max(...analytics.signatures_by_date.map(d => d.count))) * 100} className="w-20" />
                          <span>{date.count} signatures</span>
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
