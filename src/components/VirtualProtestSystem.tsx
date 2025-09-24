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
import { useVirtualProtests } from '@/hooks/useVirtualProtests';
import { useToast } from '@/hooks/use-toast';
import { 
  Megaphone, 
  Users, 
  Calendar, 
  MapPin, 
  Target, 
  TrendingUp, 
  Plus,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  BarChart3,
  Share2,
  Bell,
  Mail,
  Smartphone,
  Globe
} from 'lucide-react';

interface VirtualProtestSystemProps {
  compact?: boolean;
}

export const VirtualProtestSystem: React.FC<VirtualProtestSystemProps> = ({ 
  compact = false 
}) => {
  const { toast } = useToast();
  const {
    protests,
    analytics,
    isLoading,
    error,
    createProtest,
    joinProtest,
    leaveProtest,
    loadProtests,
    clearError
  } = useVirtualProtests();

  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCause, setSelectedCause] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Create protest form state
  const [newProtest, setNewProtest] = useState({
    title: '',
    description: '',
    cause: '',
    target_authority: '',
    location_city: '',
    location_state: '',
    start_date: '',
    end_date: '',
    is_virtual: true,
    is_physical: false,
    virtual_platform: '',
    virtual_link: '',
    expected_participants: 100,
    visibility: 'public' as 'public' | 'private' | 'invite_only',
    tags: [] as string[]
  });

  const handleCreateProtest = async () => {
    try {
      if (!newProtest.title || !newProtest.description || !newProtest.cause) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      await createProtest({
        title: newProtest.title,
        description: newProtest.description,
        cause: newProtest.cause,
        target_authority: newProtest.target_authority || undefined,
        location_city: newProtest.location_city || undefined,
        location_state: newProtest.location_state || undefined,
        start_date: newProtest.start_date,
        end_date: newProtest.end_date,
        is_virtual: newProtest.is_virtual,
        is_physical: newProtest.is_physical,
        virtual_platform: newProtest.virtual_platform || undefined,
        virtual_link: newProtest.virtual_link || undefined,
        expected_participants: newProtest.expected_participants,
        visibility: newProtest.visibility,
        tags: newProtest.tags
      });

      toast({
        title: "Success",
        description: "Virtual protest created successfully!",
      });

      // Reset form
      setNewProtest({
        title: '',
        description: '',
        cause: '',
        target_authority: '',
        location_city: '',
        location_state: '',
        start_date: '',
        end_date: '',
        is_virtual: true,
        is_physical: false,
        virtual_platform: '',
        virtual_link: '',
        expected_participants: 100,
        visibility: 'public',
        tags: []
      });

      setActiveTab('browse');
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create protest. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleJoinProtest = async (protestId: string) => {
    try {
      await joinProtest(protestId, 'virtual', 'medium');
      toast({
        title: "Joined Protest",
        description: "You have successfully joined the protest!",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to join protest. You may have already joined.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCauseIcon = (cause: string) => {
    switch (cause) {
      case 'environment': return '🌱';
      case 'housing': return '🏠';
      case 'education': return '📚';
      case 'healthcare': return '🏥';
      case 'labor': return '👷';
      case 'civil_rights': return '⚖️';
      case 'immigration': return '🌍';
      default: return '📢';
    }
  };

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Virtual Protests</h3>
          <Badge variant="outline">{protests.length} Active</Badge>
        </div>
        
        <div className="space-y-2">
          {protests.slice(0, 3).map(protest => (
            <Card key={protest.id} className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm">{protest.title}</h4>
                  <p className="text-xs text-gray-500">{protest.current_participants}/{protest.expected_participants} participants</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleJoinProtest(protest.id)}>
                  Join
                </Button>
              </div>
            </Card>
          ))}
        </div>
        
        <Button variant="outline" className="w-full" onClick={() => setActiveTab('create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Protest
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
          <TabsTrigger value="browse">Browse Protests</TabsTrigger>
          <TabsTrigger value="create">Create Protest</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search protests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCause} onValueChange={setSelectedCause}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Cause" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Causes</SelectItem>
                <SelectItem value="environment">Environment</SelectItem>
                <SelectItem value="housing">Housing</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="labor">Labor Rights</SelectItem>
                <SelectItem value="civil_rights">Civil Rights</SelectItem>
                <SelectItem value="immigration">Immigration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6">
            {isLoading ? (
              <div className="text-center py-8">Loading protests...</div>
            ) : protests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No protests found. Create the first one!
              </div>
            ) : (
              protests.map(protest => (
                <Card key={protest.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <span className="text-2xl">{getCauseIcon(protest.cause)}</span>
                          {protest.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {protest.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(protest.status)}>
                          {protest.status}
                        </Badge>
                        <Badge variant="outline">
                          <Users className="h-3 w-3 mr-1" />
                          {protest.current_participants}/{protest.expected_participants}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Participation Progress</span>
                        <span className="text-sm text-gray-500">
                          {Math.round((protest.current_participants / protest.expected_participants) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={(protest.current_participants / protest.expected_participants) * 100} 
                        className="h-2" 
                      />
                      
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => handleJoinProtest(protest.id)}>
                          <Users className="h-4 w-4 mr-2" />
                          Join Protest
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Virtual Protest</CardTitle>
              <CardDescription>
                Organize a virtual protest to mobilize support for your cause
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Protest Title *</Label>
                  <Input
                    id="title"
                    value={newProtest.title}
                    onChange={(e) => setNewProtest(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter protest title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cause">Cause *</Label>
                  <Select value={newProtest.cause} onValueChange={(value) => setNewProtest(prev => ({ ...prev, cause: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cause" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="environment">Environment</SelectItem>
                      <SelectItem value="housing">Housing</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="labor">Labor Rights</SelectItem>
                      <SelectItem value="civil_rights">Civil Rights</SelectItem>
                      <SelectItem value="immigration">Immigration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={newProtest.description}
                  onChange={(e) => setNewProtest(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the issue and what you're protesting for"
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={newProtest.start_date}
                    onChange={(e) => setNewProtest(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={newProtest.end_date}
                    onChange={(e) => setNewProtest(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>
              
              <Button onClick={handleCreateProtest} disabled={isLoading} className="w-full">
                {isLoading ? 'Creating Protest...' : 'Create Protest'}
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
                    <Megaphone className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Protests</p>
                      <p className="text-2xl font-bold">{analytics.total_protests}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Participants</p>
                      <p className="text-2xl font-bold">{analytics.total_participants}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Success Rate</p>
                      <p className="text-2xl font-bold">{analytics.success_rate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <BarChart3 className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Avg Participation</p>
                      <p className="text-2xl font-bold">{analytics.average_participation}</p>
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