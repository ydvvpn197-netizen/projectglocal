import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useGovernmentPolls } from '@/hooks/useGovernmentPolls';
import { useToast } from '@/hooks/use-toast';
import { 
  Vote, 
  Users, 
  Calendar, 
  MapPin, 
  Building, 
  TrendingUp, 
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  BarChart3,
  Target
} from 'lucide-react';

interface EnhancedPollSystemProps {
  compact?: boolean;
}

export const EnhancedPollSystem: React.FC<EnhancedPollSystemProps> = ({ 
  compact = false 
}) => {
  const { toast } = useToast();
  const {
    polls,
    authorities,
    analytics,
    isLoading,
    error,
    createPoll,
    voteOnPoll,
    loadPolls,
    clearError
  } = useGovernmentPolls();

  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Create poll form state
  const [newPoll, setNewPoll] = useState({
    title: '',
    description: '',
    location: '',
    category: '',
    expires_at: '',
    is_anonymous: false,
    tagged_authorities: [] as string[],
    options: ['', '']
  });

  const handleCreatePoll = async () => {
    try {
      if (!newPoll.title || !newPoll.description || newPoll.options.filter(opt => opt.trim()).length < 2) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields and provide at least 2 options.",
          variant: "destructive",
        });
        return;
      }

      await createPoll({
        title: newPoll.title,
        description: newPoll.description,
        location: newPoll.location || undefined,
        category: newPoll.category || undefined,
        expires_at: newPoll.expires_at,
        is_anonymous: newPoll.is_anonymous,
        tagged_authorities: newPoll.tagged_authorities,
        options: newPoll.options.filter(opt => opt.trim())
      });

      toast({
        title: "Success",
        description: "Government poll created successfully!",
      });

      // Reset form
      setNewPoll({
        title: '',
        description: '',
        location: '',
        category: '',
        expires_at: '',
        is_anonymous: false,
        tagged_authorities: [],
        options: ['', '']
      });

      setActiveTab('browse');
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create poll. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVote = async (pollId: string, optionIndex: number) => {
    try {
      await voteOnPoll(pollId, optionIndex, false);
      toast({
        title: "Vote Cast",
        description: "Your vote has been recorded successfully!",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to cast vote. You may have already voted on this poll.",
        variant: "destructive",
      });
    }
  };

  const addPollOption = () => {
    setNewPoll(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const updatePollOption = (index: number, value: string) => {
    setNewPoll(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const removePollOption = (index: number) => {
    if (newPoll.options.length > 2) {
      setNewPoll(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const toggleAuthority = (authorityId: string) => {
    setNewPoll(prev => ({
      ...prev,
      tagged_authorities: prev.tagged_authorities.includes(authorityId)
        ? prev.tagged_authorities.filter(id => id !== authorityId)
        : [...prev.tagged_authorities, authorityId]
    }));
  };

  const filteredPolls = polls.filter(poll => {
    const matchesSearch = !searchTerm || 
      poll.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poll.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || poll.category === selectedCategory;
    const matchesLocation = !selectedLocation || poll.location === selectedLocation;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const getAuthorityName = (authorityId: string) => {
    const authority = authorities.find(a => a.id === authorityId);
    return authority?.name || 'Unknown Authority';
  };

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Government Polls</h3>
          <Badge variant="outline">{polls.length} Active</Badge>
        </div>
        
        <div className="space-y-2">
          {polls.slice(0, 3).map(poll => (
            <Card key={poll.id} className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm">{poll.title}</h4>
                  <p className="text-xs text-gray-500">{poll.total_votes} votes</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleVote(poll.id, 0)}>
                  Vote
                </Button>
              </div>
            </Card>
          ))}
        </div>
        
        <Button variant="outline" className="w-full" onClick={() => setActiveTab('create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Poll
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="link"
              size="sm"
              onClick={clearError}
              className="ml-2 p-0 h-auto"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Polls</TabsTrigger>
          <TabsTrigger value="create">Create Poll</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search polls..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="infrastructure">Infrastructure</SelectItem>
                <SelectItem value="environment">Environment</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="transportation">Transportation</SelectItem>
                <SelectItem value="housing">Housing</SelectItem>
                <SelectItem value="safety">Public Safety</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6">
            {isLoading ? (
              <div className="text-center py-8">Loading polls...</div>
            ) : filteredPolls.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No polls found matching your criteria.
              </div>
            ) : (
              filteredPolls.map(poll => (
                <Card key={poll.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{poll.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {poll.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          <Vote className="h-3 w-3 mr-1" />
                          {poll.total_votes} votes
                        </Badge>
                        {poll.is_anonymous && (
                          <Badge variant="secondary">Anonymous</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {poll.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {poll.location}
                        </div>
                      )}
                      {poll.category && (
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-1" />
                          {poll.category}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Expires: {new Date(poll.expires_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      {poll.options?.map((option, index) => {
                        const percentage = poll.total_votes > 0 
                          ? (option.votes / poll.total_votes) * 100 
                          : 0;
                        
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{option.text}</span>
                              <span className="text-sm text-gray-500">
                                {option.votes} votes ({Math.round(percentage)}%)
                              </span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                    
                    {poll.tagged_authorities.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="text-sm font-medium mb-2">Tagged Authorities:</h4>
                        <div className="flex flex-wrap gap-2">
                          {poll.tagged_authorities.map(authorityId => (
                            <Badge key={authorityId} variant="outline">
                              {getAuthorityName(authorityId)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Government Poll</CardTitle>
              <CardDescription>
                Create a poll to gather community input on government matters
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Poll Title *</Label>
                  <Input
                    id="title"
                    value={newPoll.title}
                    onChange={(e) => setNewPoll(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter poll title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newPoll.category} onValueChange={(value) => setNewPoll(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="environment">Environment</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="transportation">Transportation</SelectItem>
                      <SelectItem value="housing">Housing</SelectItem>
                      <SelectItem value="safety">Public Safety</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={newPoll.description}
                  onChange={(e) => setNewPoll(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the issue or topic for this poll"
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newPoll.location}
                    onChange={(e) => setNewPoll(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, State, or Region"
                  />
                </div>
                
                <div>
                  <Label htmlFor="expires_at">Expiration Date *</Label>
                  <Input
                    id="expires_at"
                    type="datetime-local"
                    value={newPoll.expires_at}
                    onChange={(e) => setNewPoll(prev => ({ ...prev, expires_at: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <Label>Poll Options *</Label>
                <div className="space-y-2">
                  {newPoll.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={option}
                        onChange={(e) => updatePollOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      {newPoll.options.length > 2 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removePollOption(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" onClick={addPollOption}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>
              </div>
              
              <div>
                <Label>Tag Government Authorities</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {authorities.map(authority => (
                    <div key={authority.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={authority.id}
                        checked={newPoll.tagged_authorities.includes(authority.id)}
                        onCheckedChange={() => toggleAuthority(authority.id)}
                      />
                      <Label htmlFor={authority.id} className="text-sm">
                        {authority.name} ({authority.level})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_anonymous"
                  checked={newPoll.is_anonymous}
                  onCheckedChange={(checked) => setNewPoll(prev => ({ ...prev, is_anonymous: !!checked }))}
                />
                <Label htmlFor="is_anonymous">Allow anonymous voting</Label>
              </div>
              
              <Button onClick={handleCreatePoll} disabled={isLoading} className="w-full">
                {isLoading ? 'Creating Poll...' : 'Create Poll'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {analytics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Vote className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Polls</p>
                      <p className="text-2xl font-bold">{analytics.total_polls}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Votes</p>
                      <p className="text-2xl font-bold">{analytics.total_votes}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Avg Participation</p>
                      <p className="text-2xl font-bold">{analytics.average_participation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p6">
                  <div className="flex items-center">
                    <MessageSquare className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Authority Responses</p>
                      <p className="text-2xl font-bold">{analytics.authority_responses}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">Loading analytics...</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
