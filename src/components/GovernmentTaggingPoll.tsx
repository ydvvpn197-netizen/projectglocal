import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Building2, 
  Users, 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Tag,
  Send,
  Plus,
  X,
  Shield,
  MessageSquare
} from 'lucide-react';

interface GovernmentAuthority {
  id: string;
  name: string;
  department: string;
  level: 'local' | 'state' | 'national';
  contact_email?: string;
  contact_phone?: string;
  jurisdiction: string;
  is_active: boolean;
}

interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

interface GovernmentPoll {
  id: string;
  title: string;
  description: string;
  options: PollOption[];
  total_votes: number;
  expires_at: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  location: string;
  category: string;
  tagged_authorities: GovernmentAuthority[];
  user_vote?: number;
  is_anonymous: boolean;
}

interface GovernmentTaggingPollProps {
  pollId?: string;
  onPollCreated?: (poll: GovernmentPoll) => void;
  onPollUpdated?: (poll: GovernmentPoll) => void;
  className?: string;
}

export const GovernmentTaggingPoll: React.FC<GovernmentTaggingPollProps> = ({
  pollId,
  onPollCreated,
  onPollUpdated,
  className = ''
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [poll, setPoll] = useState<GovernmentPoll | null>(null);
  const [authorities, setAuthorities] = useState<GovernmentAuthority[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [voting, setVoting] = useState(false);
  
  // Form state for creating new polls
  const [isCreating, setIsCreating] = useState(!pollId);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: '',
    options: ['', ''],
    expires_in_days: 7,
    tagged_authorities: [] as string[],
    is_anonymous: false
  });

  // Load poll data if pollId is provided
  useEffect(() => {
    if (pollId) {
      loadPoll();
    }
    loadAuthorities();
  }, [pollId, loadPoll]);

  const loadPoll = useCallback(async () => {
    if (!pollId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('government_polls')
        .select(`
          *,
          poll_options(*),
          poll_votes(*),
          tagged_authorities:government_authorities(*)
        `)
        .eq('id', pollId)
        .single();

      if (error) throw error;

      if (data) {
        const pollData: GovernmentPoll = {
          id: data.id,
          title: data.title,
          description: data.description,
          options: data.poll_options?.map((option: { id: string; text: string; votes: number }) => ({
            id: option.id,
            text: option.text,
            votes: option.votes || 0,
            percentage: 0
          })) || [],
          total_votes: data.total_votes || 0,
          expires_at: data.expires_at,
          is_active: data.is_active,
          created_by: data.created_by,
          created_at: data.created_at,
          location: data.location,
          category: data.category,
          tagged_authorities: data.tagged_authorities || [],
          is_anonymous: data.is_anonymous
        };

        // Calculate percentages
        if (pollData.total_votes > 0) {
          pollData.options.forEach(option => {
            option.percentage = Math.round((option.votes / pollData.total_votes) * 100);
          });
        }

        setPoll(pollData);
      }
    } catch (error) {
      console.error('Error loading poll:', error);
      toast({
        title: "Error",
        description: "Failed to load poll data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [pollId, toast]);

  const loadAuthorities = async () => {
    try {
      const { data, error } = await supabase
        .from('government_authorities')
        .select('*')
        .eq('is_active', true)
        .order('level', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setAuthorities(data || []);
    } catch (error) {
      console.error('Error loading authorities:', error);
    }
  };

  const handleVote = async (optionIndex: number) => {
    if (!poll || !user) return;

    try {
      setVoting(true);
      
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('poll_id', poll.id)
        .eq('user_id', user.id)
        .single();

      if (existingVote) {
        toast({
          title: "Already Voted",
          description: "You have already voted on this poll",
          variant: "destructive",
        });
        return;
      }

      // Record the vote
      const { error: voteError } = await supabase
        .from('poll_votes')
        .insert({
          poll_id: poll.id,
          user_id: user.id,
          option_index: optionIndex,
          is_anonymous: poll.is_anonymous
        });

      if (voteError) throw voteError;

      // Update poll options vote count
      const { error: updateError } = await supabase
        .from('poll_options')
        .update({ votes: poll.options[optionIndex].votes + 1 })
        .eq('poll_id', poll.id)
        .eq('option_index', optionIndex);

      if (updateError) throw updateError;

      // Reload poll data
      await loadPoll();
      
      toast({
        title: "Vote Recorded",
        description: "Your vote has been recorded successfully",
      });

      onPollUpdated?.(poll);
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Failed to record your vote",
        variant: "destructive",
      });
    } finally {
      setVoting(false);
    }
  };

  const handleCreatePoll = async () => {
    if (!user) return;

    try {
      setSaving(true);

      // Validate form data
      if (!formData.title.trim() || !formData.description.trim()) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const validOptions = formData.options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        toast({
          title: "Validation Error",
          description: "Please provide at least 2 poll options",
          variant: "destructive",
        });
        return;
      }

      // Create poll
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + formData.expires_in_days);

      const { data: pollData, error: pollError } = await supabase
        .from('government_polls')
        .insert({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          category: formData.category,
          expires_at: expiresAt.toISOString(),
          created_by: user.id,
          is_anonymous: formData.is_anonymous,
          tagged_authorities: formData.tagged_authorities
        })
        .select()
        .single();

      if (pollError) throw pollError;

      // Create poll options
      const optionsData = validOptions.map((text, index) => ({
        poll_id: pollData.id,
        text: text.trim(),
        option_index: index,
        votes: 0
      }));

      const { error: optionsError } = await supabase
        .from('poll_options')
        .insert(optionsData);

      if (optionsError) throw optionsError;

      toast({
        title: "Poll Created",
        description: "Your poll has been created successfully",
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        location: '',
        category: '',
        options: ['', ''],
        expires_in_days: 7,
        tagged_authorities: [],
        is_anonymous: false
      });

      setIsCreating(false);
      onPollCreated?.(pollData);
    } catch (error) {
      console.error('Error creating poll:', error);
      toast({
        title: "Error",
        description: "Failed to create poll",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData({
        ...formData,
        options: [...formData.options, '']
      });
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData({
        ...formData,
        options: formData.options.filter((_, i) => i !== index)
      });
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({
      ...formData,
      options: newOptions
    });
  };

  const toggleAuthority = (authorityId: string) => {
    const isSelected = formData.tagged_authorities.includes(authorityId);
    setFormData({
      ...formData,
      tagged_authorities: isSelected
        ? formData.tagged_authorities.filter(id => id !== authorityId)
        : [...formData.tagged_authorities, authorityId]
    });
  };

  const getAuthorityLevelIcon = (level: string) => {
    switch (level) {
      case 'local':
        return <Building2 className="h-4 w-4 text-blue-500" />;
      case 'state':
        return <MapPin className="h-4 w-4 text-green-500" />;
      case 'national':
        return <Shield className="h-4 w-4 text-red-500" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  const getAuthorityLevelLabel = (level: string) => {
    switch (level) {
      case 'local':
        return 'Local';
      case 'state':
        return 'State';
      case 'national':
        return 'National';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isCreating) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Create Government Poll
          </CardTitle>
          <CardDescription>
            Create a poll to discuss local issues and tag relevant government authorities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Poll Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="What should we discuss?"
                disabled={saving}
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the issue or topic..."
                rows={3}
                disabled={saving}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, State"
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="environment">Environment</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="transportation">Transportation</SelectItem>
                    <SelectItem value="safety">Safety & Security</SelectItem>
                    <SelectItem value="economy">Economy</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Poll Options */}
          <div className="space-y-4">
            <Label>Poll Options *</Label>
            {formData.options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  disabled={saving}
                />
                {formData.options.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeOption(index)}
                    disabled={saving}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {formData.options.length < 6 && (
              <Button
                type="button"
                variant="outline"
                onClick={addOption}
                disabled={saving}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            )}
          </div>

          {/* Government Authorities */}
          <div className="space-y-4">
            <Label>Tag Government Authorities</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {authorities.map((authority) => (
                <div key={authority.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={authority.id}
                    checked={formData.tagged_authorities.includes(authority.id)}
                    onCheckedChange={() => toggleAuthority(authority.id)}
                    disabled={saving}
                  />
                  <Label
                    htmlFor={authority.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    {getAuthorityLevelIcon(authority.level)}
                    <span className="font-medium">{authority.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {getAuthorityLevelLabel(authority.level)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {authority.department}
                    </span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Poll Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_anonymous"
                checked={formData.is_anonymous}
                onCheckedChange={(checked) => setFormData({ ...formData, is_anonymous: !!checked })}
                disabled={saving}
              />
              <Label htmlFor="is_anonymous">Allow anonymous voting</Label>
            </div>

            <div>
              <Label htmlFor="expires_in_days">Poll Duration (days)</Label>
              <Select
                value={formData.expires_in_days.toString()}
                onValueChange={(value) => setFormData({ ...formData, expires_in_days: parseInt(value) })}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">1 week</SelectItem>
                  <SelectItem value="14">2 weeks</SelectItem>
                  <SelectItem value="30">1 month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleCreatePoll}
              disabled={saving}
              className="flex-1"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Create Poll
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsCreating(false)}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!poll) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No poll found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {poll.title}
            </CardTitle>
            <CardDescription className="mt-2">
              {poll.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {poll.is_anonymous && (
              <Badge variant="secondary">
                <Eye className="h-3 w-3 mr-1" />
                Anonymous
              </Badge>
            )}
            <Badge variant={poll.is_active ? "default" : "secondary"}>
              {poll.is_active ? "Active" : "Closed"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Poll Information */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{poll.location || 'Not specified'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Expires: {new Date(poll.expires_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Tagged Authorities */}
        {poll.tagged_authorities.length > 0 && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tagged Authorities
            </Label>
            <div className="flex flex-wrap gap-2">
              {poll.tagged_authorities.map((authority) => (
                <Badge key={authority.id} variant="outline" className="flex items-center gap-1">
                  {getAuthorityLevelIcon(authority.level)}
                  {authority.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Poll Options */}
        <div className="space-y-3">
          <Label>Vote Options</Label>
          {poll.options.map((option, index) => (
            <div key={option.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{option.text}</span>
                <span className="text-sm text-muted-foreground">
                  {option.votes} votes ({option.percentage}%)
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${option.percentage}%` }}
                />
              </div>
              {poll.is_active && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleVote(index)}
                  disabled={voting}
                  className="w-full"
                >
                  {voting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                      Voting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Vote for this option
                    </>
                  )}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Poll Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Total votes: {poll.total_votes}</span>
          <span>Created: {new Date(poll.created_at).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default GovernmentTaggingPoll;
