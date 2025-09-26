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
import { useToast } from '@/hooks/use-toast';
import { 
  AlertTriangle, 
  MapPin, 
  Calendar, 
  Users, 
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  X,
  Camera,
  FileText
} from 'lucide-react';

interface CommunityIssuesSystemProps {
  compact?: boolean;
}

interface CommunityIssue {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'reported' | 'acknowledged' | 'in_progress' | 'resolved' | 'closed';
  location: string;
  latitude?: number;
  longitude?: number;
  reported_by: string;
  reported_at: string;
  assigned_to?: string;
  resolution_notes?: string;
  images: string[];
  upvotes: number;
  tags: string[];
}

export const CommunityIssuesSystem: React.FC<CommunityIssuesSystemProps> = ({ 
  compact = false 
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  // Mock data - in real implementation, this would come from a service
  const [issues, setIssues] = useState<CommunityIssue[]>([
    {
      id: '1',
      title: 'Pothole on Main Street',
      description: 'Large pothole causing damage to vehicles. Located near the intersection with Oak Avenue.',
      category: 'infrastructure',
      priority: 'high',
      status: 'acknowledged',
      location: 'Main Street & Oak Avenue',
      reported_by: 'Anonymous User',
      reported_at: '2024-01-15T10:30:00Z',
      assigned_to: 'Public Works Department',
      images: [],
      upvotes: 12,
      tags: ['pothole', 'road', 'safety']
    },
    {
      id: '2',
      title: 'Broken Streetlight',
      description: 'Streetlight has been out for 3 days, making the area unsafe at night.',
      category: 'infrastructure',
      priority: 'medium',
      status: 'in_progress',
      location: '123 Elm Street',
      reported_by: 'Anonymous User',
      reported_at: '2024-01-14T18:45:00Z',
      assigned_to: 'Utilities Department',
      images: [],
      upvotes: 8,
      tags: ['streetlight', 'safety', 'night']
    },
    {
      id: '3',
      title: 'Graffiti on Community Center',
      description: 'Inappropriate graffiti has been painted on the side of the community center.',
      category: 'vandalism',
      priority: 'low',
      status: 'reported',
      location: 'Community Center, 456 Park Ave',
      reported_by: 'Anonymous User',
      reported_at: '2024-01-16T14:20:00Z',
      images: [],
      upvotes: 3,
      tags: ['graffiti', 'vandalism', 'community']
    }
  ]);

  // Create issue form state
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    location: '',
    latitude: '',
    longitude: '',
    images: [] as string[],
    tags: [] as string[]
  });

  const handleCreateIssue = async () => {
    try {
      if (!newIssue.title || !newIssue.description || !newIssue.category || !newIssue.location) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      const issue: CommunityIssue = {
        id: Date.now().toString(),
        title: newIssue.title,
        description: newIssue.description,
        category: newIssue.category,
        priority: newIssue.priority,
        status: 'reported',
        location: newIssue.location,
        latitude: newIssue.latitude ? parseFloat(newIssue.latitude) : undefined,
        longitude: newIssue.longitude ? parseFloat(newIssue.longitude) : undefined,
        reported_by: 'Anonymous User',
        reported_at: new Date().toISOString(),
        images: newIssue.images,
        upvotes: 0,
        tags: newIssue.tags
      };

      setIssues(prev => [issue, ...prev]);

      toast({
        title: "Success",
        description: "Community issue reported successfully!",
      });

      // Reset form
      setNewIssue({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        location: '',
        latitude: '',
        longitude: '',
        images: [],
        tags: []
      });

      setActiveTab('browse');
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to report issue. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpvote = (issueId: string) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId 
        ? { ...issue, upvotes: issue.upvotes + 1 }
        : issue
    ));
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !newIssue.tags.includes(tag.trim())) {
      setNewIssue(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewIssue(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = !searchTerm || 
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || issue.category === selectedCategory;
    const matchesStatus = !selectedStatus || issue.status === selectedStatus;
    const matchesPriority = !selectedPriority || issue.priority === selectedPriority;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'bg-gray-100 text-gray-800';
      case 'acknowledged': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Community Issues</h3>
          <Badge variant="outline">{issues.length} Reported</Badge>
        </div>
        
        <div className="space-y-2">
          {issues.slice(0, 3).map(issue => (
            <Card key={issue.id} className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm">{issue.title}</h4>
                  <p className="text-xs text-gray-500">{issue.upvotes} upvotes</p>
                </div>
                <Badge className={getStatusColor(issue.status)}>
                  {issue.status}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
        
        <Button variant="outline" className="w-full" onClick={() => setActiveTab('create')}>
          <Plus className="h-4 w-4 mr-2" />
          Report Issue
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Issues</TabsTrigger>
          <TabsTrigger value="create">Report Issue</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search issues..."
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
                <SelectItem value="safety">Safety</SelectItem>
                <SelectItem value="environment">Environment</SelectItem>
                <SelectItem value="vandalism">Vandalism</SelectItem>
                <SelectItem value="noise">Noise</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="reported">Reported</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6">
            {filteredIssues.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No issues found matching your criteria.
              </div>
            ) : (
              filteredIssues.map(issue => (
                <Card key={issue.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{issue.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {issue.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(issue.status)}>
                          {issue.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(issue.priority)}>
                          {issue.priority}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {issue.location}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(issue.reported_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {issue.upvotes} upvotes
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {issue.assigned_to && (
                        <div className="text-sm">
                          <span className="font-medium">Assigned to:</span> {issue.assigned_to}
                        </div>
                      )}
                      
                      {issue.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {issue.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUpvote(issue.id)}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Upvote ({issue.upvotes})
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-2" />
                          View Details
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
              <CardTitle>Report Community Issue</CardTitle>
              <CardDescription>
                Help improve your community by reporting issues that need attention
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Issue Title *</Label>
                  <Input
                    id="title"
                    value={newIssue.title}
                    onChange={(e) => setNewIssue(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief description of the issue"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={newIssue.category} onValueChange={(value) => setNewIssue(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="safety">Safety</SelectItem>
                      <SelectItem value="environment">Environment</SelectItem>
                      <SelectItem value="vandalism">Vandalism</SelectItem>
                      <SelectItem value="noise">Noise</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={newIssue.description}
                  onChange={(e) => setNewIssue(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide detailed information about the issue"
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={newIssue.location}
                    onChange={(e) => setNewIssue(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Street address or landmark"
                  />
                </div>
                
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newIssue.priority} onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => setNewIssue(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="tags">Tags</Label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {newIssue.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Add tags (press Enter to add)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              </div>
              
              <Button onClick={handleCreateIssue} className="w-full">
                Report Issue
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Issues</p>
                    <p className="text-2xl font-bold">{issues.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Resolved</p>
                    <p className="text-2xl font-bold">
                      {issues.filter(i => i.status === 'resolved').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold">
                      {issues.filter(i => i.status === 'in_progress').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Upvotes</p>
                    <p className="text-2xl font-bold">
                      {issues.reduce((sum, issue) => sum + issue.upvotes, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
