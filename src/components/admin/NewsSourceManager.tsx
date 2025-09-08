import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  RefreshCw, 
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Rss,
  Database
} from 'lucide-react';
import { EnhancedNewsAggregationService, NewsSource } from '@/services/enhancedNewsAggregationService';

export const NewsSourceManager: React.FC = () => {
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSource, setEditingSource] = useState<NewsSource | null>(null);
  const [testingSource, setTestingSource] = useState<string | null>(null);
  const { toast } = useToast();

  const aggregationService = EnhancedNewsAggregationService.getInstance();

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    try {
      setLoading(true);
      const data = await aggregationService.getNewsSources();
      setSources(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load news sources',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSource = async (sourceData: Omit<NewsSource, 'id'>) => {
    try {
      await aggregationService.addNewsSource(sourceData);
      toast({
        title: 'Success',
        description: 'News source added successfully'
      });
      setShowAddDialog(false);
      loadSources();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add news source',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateSource = async (sourceId: string, updates: Partial<NewsSource>) => {
    try {
      await aggregationService.updateNewsSource(sourceId, updates);
      toast({
        title: 'Success',
        description: 'News source updated successfully'
      });
      setEditingSource(null);
      loadSources();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update news source',
        variant: 'destructive'
      });
    }
  };

  const handleTestSource = async (source: NewsSource) => {
    setTestingSource(source.id);
    try {
      const result = await aggregationService.testNewsSource(source);
      if (result.success) {
        toast({
          title: 'Test Successful',
          description: `Found ${result.articles} articles from ${source.name}`
        });
      } else {
        toast({
          title: 'Test Failed',
          description: result.error || 'Unknown error',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Test Failed',
        description: 'Failed to test news source',
        variant: 'destructive'
      });
    } finally {
      setTestingSource(null);
    }
  };

  const toggleSourceStatus = async (source: NewsSource) => {
    await handleUpdateSource(source.id, { is_active: !source.is_active });
  };

  const getSourceTypeIcon = (type: string) => {
    switch (type) {
      case 'rss':
        return <Rss className="h-4 w-4" />;
      case 'api':
        return <Database className="h-4 w-4" />;
      case 'external':
        return <Globe className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getSourceTypeColor = (type: string) => {
    switch (type) {
      case 'rss':
        return 'bg-orange-100 text-orange-800';
      case 'api':
        return 'bg-blue-100 text-blue-800';
      case 'external':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">News Sources</h2>
          <p className="text-gray-600">Manage news sources and RSS feeds</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Source
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Sources ({sources.filter(s => s.is_active).length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Interval</TableHead>
                <TableHead>Last Fetch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((source) => (
                <TableRow key={source.id}>
                  <TableCell className="font-medium">{source.name}</TableCell>
                  <TableCell>
                    <Badge className={getSourceTypeColor(source.source_type)}>
                      {getSourceTypeIcon(source.source_type)}
                      <span className="ml-1">{source.source_type.toUpperCase()}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="truncate max-w-xs">{source.url}</span>
                      <ExternalLink className="h-3 w-3 text-gray-400" />
                    </div>
                  </TableCell>
                  <TableCell>{source.fetch_interval_minutes}m</TableCell>
                  <TableCell>
                    {source.last_fetched_at ? (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-sm">
                          {new Date(source.last_fetched_at).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Never</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {source.is_active ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <Switch
                        checked={source.is_active}
                        onCheckedChange={() => toggleSourceStatus(source)}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestSource(source)}
                        disabled={testingSource === source.id}
                      >
                        {testingSource === source.id ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingSource(source)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Source Dialog */}
      <AddSourceDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddSource}
      />

      {/* Edit Source Dialog */}
      {editingSource && (
        <EditSourceDialog
          source={editingSource}
          open={!!editingSource}
          onOpenChange={() => setEditingSource(null)}
          onUpdate={handleUpdateSource}
        />
      )}
    </div>
  );
};

interface AddSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (source: Omit<NewsSource, 'id'>) => void;
}

const AddSourceDialog: React.FC<AddSourceDialogProps> = ({ open, onOpenChange, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    rss_url: '',
    api_endpoint: '',
    api_key: '',
    source_type: 'rss' as const,
    fetch_interval_minutes: 15,
    is_active: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({
      name: '',
      url: '',
      rss_url: '',
      api_endpoint: '',
      api_key: '',
      source_type: 'rss',
      fetch_interval_minutes: 15,
      is_active: true
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add News Source</DialogTitle>
          <DialogDescription>
            Add a new news source to aggregate articles from
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="source_type">Type</Label>
              <Select
                value={formData.source_type}
                onValueChange={(value: any) => setFormData({ ...formData, source_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rss">RSS Feed</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="external">External</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              required
            />
          </div>

          {formData.source_type === 'rss' && (
            <div>
              <Label htmlFor="rss_url">RSS Feed URL</Label>
              <Input
                id="rss_url"
                type="url"
                value={formData.rss_url}
                onChange={(e) => setFormData({ ...formData, rss_url: e.target.value })}
                required
              />
            </div>
          )}

          {formData.source_type === 'api' && (
            <>
              <div>
                <Label htmlFor="api_endpoint">API Endpoint</Label>
                <Input
                  id="api_endpoint"
                  type="url"
                  value={formData.api_endpoint}
                  onChange={(e) => setFormData({ ...formData, api_endpoint: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="api_key">API Key (Optional)</Label>
                <Input
                  id="api_key"
                  type="password"
                  value={formData.api_key}
                  onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="fetch_interval">Fetch Interval (minutes)</Label>
            <Input
              id="fetch_interval"
              type="number"
              min="5"
              max="1440"
              value={formData.fetch_interval_minutes}
              onChange={(e) => setFormData({ ...formData, fetch_interval_minutes: parseInt(e.target.value) })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Source</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface EditSourceDialogProps {
  source: NewsSource;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (sourceId: string, updates: Partial<NewsSource>) => void;
}

const EditSourceDialog: React.FC<EditSourceDialogProps> = ({ source, open, onOpenChange, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: source.name,
    url: source.url,
    rss_url: source.rss_url || '',
    api_endpoint: source.api_endpoint || '',
    api_key: source.api_key || '',
    source_type: source.source_type,
    fetch_interval_minutes: source.fetch_interval_minutes,
    is_active: source.is_active
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(source.id, formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit News Source</DialogTitle>
          <DialogDescription>
            Update the news source configuration
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="source_type">Type</Label>
              <Select
                value={formData.source_type}
                onValueChange={(value: any) => setFormData({ ...formData, source_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rss">RSS Feed</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="external">External</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              required
            />
          </div>

          {formData.source_type === 'rss' && (
            <div>
              <Label htmlFor="rss_url">RSS Feed URL</Label>
              <Input
                id="rss_url"
                type="url"
                value={formData.rss_url}
                onChange={(e) => setFormData({ ...formData, rss_url: e.target.value })}
                required
              />
            </div>
          )}

          {formData.source_type === 'api' && (
            <>
              <div>
                <Label htmlFor="api_endpoint">API Endpoint</Label>
                <Input
                  id="api_endpoint"
                  type="url"
                  value={formData.api_endpoint}
                  onChange={(e) => setFormData({ ...formData, api_endpoint: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="api_key">API Key (Optional)</Label>
                <Input
                  id="api_key"
                  type="password"
                  value={formData.api_key}
                  onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="fetch_interval">Fetch Interval (minutes)</Label>
            <Input
              id="fetch_interval"
              type="number"
              min="5"
              max="1440"
              value={formData.fetch_interval_minutes}
              onChange={(e) => setFormData({ ...formData, fetch_interval_minutes: parseInt(e.target.value) })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Source</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
