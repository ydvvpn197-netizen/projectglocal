import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { PrivacyAuditService, PrivacyAuditLog } from '@/services/privacyAuditService';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Settings, 
  Download, 
  Trash2, 
  Clock, 
  MapPin, 
  User, 
  FileText,
  AlertTriangle,
  CheckCircle,
  X,
  RefreshCw,
  BarChart3,
  Calendar,
  Globe,
  Lock,
  Unlock
} from 'lucide-react';
import { format } from 'date-fns';

interface PrivacyAuditSummary {
  total_actions: number;
  identity_reveals: number;
  privacy_changes: number;
  anonymous_posts: number;
  data_accesses: number;
  recent_actions: PrivacyAuditLog[];
}

export const PrivacyAuditDashboard: React.FC = () => {
  const { toast } = useToast();
  const [summary, setSummary] = useState<PrivacyAuditSummary | null>(null);
  const [auditLogs, setAuditLogs] = useState<PrivacyAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadPrivacyData();
  }, [loadPrivacyData]);

  const loadPrivacyData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [summaryData, logsData] = await Promise.all([
        PrivacyAuditService.getPrivacyAuditSummary(),
        PrivacyAuditService.getUserAuditLogs(50, 0)
      ]);
      
      setSummary(summaryData);
      setAuditLogs(logsData);
    } catch (error) {
      console.error('Error loading privacy data:', error);
      toast({
        title: "Error",
        description: "Failed to load privacy audit data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const data = await PrivacyAuditService.exportPrivacyData();
      
      // Create and download JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `privacy-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data Exported",
        description: "Your privacy data has been exported successfully.",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Error",
        description: "Failed to export privacy data.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteData = async () => {
    if (!confirm('Are you sure you want to delete all your privacy data? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      await PrivacyAuditService.deletePrivacyData();
      
      toast({
        title: "Data Deleted",
        description: "All your privacy data has been deleted successfully.",
      });
      
      // Reload data
      await loadPrivacyData();
    } catch (error) {
      console.error('Error deleting data:', error);
      toast({
        title: "Error",
        description: "Failed to delete privacy data.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'identity_reveal':
        return <Eye className="h-4 w-4 text-green-600" />;
      case 'identity_hide':
        return <EyeOff className="h-4 w-4 text-red-600" />;
      case 'privacy_setting_change':
        return <Settings className="h-4 w-4 text-blue-600" />;
      case 'anonymous_post':
        return <User className="h-4 w-4 text-purple-600" />;
      case 'data_access':
        return <FileText className="h-4 w-4 text-orange-600" />;
      case 'data_deletion':
        return <Trash2 className="h-4 w-4 text-red-600" />;
      default:
        return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionLabel = (actionType: string) => {
    switch (actionType) {
      case 'identity_reveal':
        return 'Identity Revealed';
      case 'identity_hide':
        return 'Identity Hidden';
      case 'privacy_setting_change':
        return 'Privacy Setting Changed';
      case 'anonymous_post':
        return 'Anonymous Post';
      case 'data_access':
        return 'Data Accessed';
      case 'data_deletion':
        return 'Data Deleted';
      default:
        return 'Unknown Action';
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'identity_reveal':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'identity_hide':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'privacy_setting_change':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'anonymous_post':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'data_access':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'data_deletion':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Privacy Audit Dashboard</h2>
            <p className="text-muted-foreground">Your privacy activity and data transparency</p>
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
          <h2 className="text-2xl font-bold">Privacy Audit Dashboard</h2>
          <p className="text-muted-foreground">Your privacy activity and data transparency</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadPrivacyData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Actions</p>
                  <p className="text-2xl font-bold">{summary.total_actions}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Identity Reveals</p>
                  <p className="text-2xl font-bold text-green-600">{summary.identity_reveals}</p>
                </div>
                <Eye className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Privacy Changes</p>
                  <p className="text-2xl font-bold text-blue-600">{summary.privacy_changes}</p>
                </div>
                <Settings className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Anonymous Posts</p>
                  <p className="text-2xl font-bold text-purple-600">{summary.anonymous_posts}</p>
                </div>
                <User className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="export">Data Export</TabsTrigger>
          <TabsTrigger value="settings">Privacy Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Recent Privacy Activity
              </CardTitle>
              <CardDescription>
                Track all your privacy-related actions and data usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditLogs.length > 0 ? (
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getActionIcon(log.action_type)}
                        <div>
                          <div className="font-medium">{getActionLabel(log.action_type)}</div>
                          <div className="text-sm text-muted-foreground">
                            {log.resource_type} • {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}
                          </div>
                          {log.location && (
                            <div className="text-xs text-muted-foreground flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {log.location}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge className={getActionColor(log.action_type)}>
                        {log.action_type.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Activity Yet</h3>
                  <p className="text-muted-foreground">
                    Your privacy activity will appear here as you use the platform.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="h-5 w-5 mr-2" />
                Data Export & Deletion
              </CardTitle>
              <CardDescription>
                Export your privacy data or delete it completely
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You have the right to access, export, and delete your personal data at any time.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Export Your Data</CardTitle>
                    <CardDescription>
                      Download a complete copy of your privacy data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={handleExportData}
                      disabled={isExporting}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {isExporting ? 'Exporting...' : 'Export Data'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-red-600">Delete Your Data</CardTitle>
                    <CardDescription>
                      Permanently delete all your privacy data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteData}
                      disabled={isDeleting}
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isDeleting ? 'Deleting...' : 'Delete All Data'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Manage your privacy preferences and data sharing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert className="bg-blue-50 border-blue-200">
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Your Privacy Rights:</p>
                      <ul className="text-sm space-y-1 ml-4">
                        <li>• Right to access your personal data</li>
                        <li>• Right to rectify inaccurate data</li>
                        <li>• Right to erase your data</li>
                        <li>• Right to restrict processing</li>
                        <li>• Right to data portability</li>
                        <li>• Right to object to processing</li>
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Data Collection</h4>
                    <p className="text-sm text-muted-foreground">
                      Control what data we collect about you
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Data Sharing</h4>
                    <p className="text-sm text-muted-foreground">
                      Control how your data is shared with others
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
