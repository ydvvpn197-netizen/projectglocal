import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Download, 
  Trash2, 
  Eye, 
  EyeOff, 
  Clock, 
  Database,
  FileText,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info
} from "lucide-react";

interface PrivacyDashboardProps {
  onClose?: () => void;
  compact?: boolean;
}

interface DataExportRequest {
  id: string;
  type: 'full' | 'profile' | 'activity' | 'analytics';
  format: 'json' | 'csv' | 'pdf';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: string;
  completedAt?: string;
  downloadUrl?: string;
  fileSize?: number;
}

interface ConsentRecord {
  id: string;
  category: string;
  purpose: string;
  granted: boolean;
  grantedAt?: string;
  revokedAt?: string;
  expiresAt?: string;
}

interface DataRetentionPolicy {
  category: string;
  retentionPeriod: number; // in days
  autoDelete: boolean;
  description: string;
}

export const PrivacyDashboard = ({ onClose, compact = false }: PrivacyDashboardProps) => {
  const { toast } = useToast();
  
  const [dataExports, setDataExports] = useState<DataExportRequest[]>([]);
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([]);
  const [retentionPolicies, setRetentionPolicies] = useState<DataRetentionPolicy[]>([
    {
      category: 'Profile Data',
      retentionPeriod: 365,
      autoDelete: false,
      description: 'Basic profile information and preferences'
    },
    {
      category: 'Activity Data',
      retentionPeriod: 90,
      autoDelete: true,
      description: 'Posts, comments, likes, and other activity data'
    },
    {
      category: 'Analytics Data',
      retentionPeriod: 30,
      autoDelete: true,
      description: 'Usage analytics and behavioral data'
    },
    {
      category: 'Location Data',
      retentionPeriod: 7,
      autoDelete: true,
      description: 'Location tracking and geolocation data'
    }
  ]);
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'full' | 'profile' | 'activity' | 'analytics'>('full');
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf'>('json');

  // Mock data - replace with actual API calls
  useEffect(() => {
    setDataExports([
      {
        id: '1',
        type: 'full',
        format: 'json',
        status: 'completed',
        requestedAt: '2024-01-15T10:30:00Z',
        completedAt: '2024-01-15T10:35:00Z',
        downloadUrl: '/downloads/user-data-2024-01-15.json',
        fileSize: 2048576
      },
      {
        id: '2',
        type: 'profile',
        format: 'csv',
        status: 'processing',
        requestedAt: '2024-01-20T14:20:00Z'
      }
    ]);

    setConsentRecords([
      {
        id: '1',
        category: 'Analytics',
        purpose: 'Improve app performance and user experience',
        granted: true,
        grantedAt: '2024-01-01T00:00:00Z',
        expiresAt: '2025-01-01T00:00:00Z'
      },
      {
        id: '2',
        category: 'Marketing',
        purpose: 'Send promotional content and updates',
        granted: false,
        revokedAt: '2024-01-10T12:00:00Z'
      },
      {
        id: '3',
        category: 'Location',
        purpose: 'Provide location-based services and recommendations',
        granted: true,
        grantedAt: '2024-01-01T00:00:00Z'
      }
    ]);
  }, []);

  const handleDataExport = async () => {
    try {
      setIsExporting(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newExport: DataExportRequest = {
        id: Date.now().toString(),
        type: exportType,
        format: exportFormat,
        status: 'processing',
        requestedAt: new Date().toISOString()
      };
      
      setDataExports(prev => [newExport, ...prev]);
      
      toast({
        title: "Export Requested",
        description: "Your data export has been queued. You'll receive an email when it's ready.",
      });
      
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to request data export. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleConsentToggle = async (consentId: string, granted: boolean) => {
    try {
      setConsentRecords(prev => 
        prev.map(consent => 
          consent.id === consentId 
            ? { 
                ...consent, 
                granted,
                grantedAt: granted ? new Date().toISOString() : consent.grantedAt,
                revokedAt: granted ? undefined : new Date().toISOString()
              }
            : consent
        )
      );
      
      toast({
        title: granted ? "Consent Granted" : "Consent Revoked",
        description: `Your consent has been ${granted ? 'granted' : 'revoked'} successfully.`,
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update consent. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-6 ${compact ? 'p-4' : 'p-6'}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Privacy Dashboard
          </h2>
          <p className="text-muted-foreground">
            Manage your data, privacy settings, and consent preferences
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XCircle className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Data Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Export
          </CardTitle>
          <CardDescription>
            Download your personal data in various formats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Export Type</Label>
              <Select value={exportType} onValueChange={(value: any) => setExportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Complete Data</SelectItem>
                  <SelectItem value="profile">Profile Only</SelectItem>
                  <SelectItem value="activity">Activity Data</SelectItem>
                  <SelectItem value="analytics">Analytics Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={handleDataExport} 
            disabled={isExporting}
            className="w-full"
          >
            {isExporting ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Requesting Export...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Request Data Export
              </>
            )}
          </Button>

          {/* Export History */}
          {dataExports.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Export History</h4>
              <div className="space-y-2">
                {dataExports.map((export_) => (
                  <div key={export_.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(export_.status)}
                      <div>
                        <div className="font-medium capitalize">
                          {export_.type} Export ({export_.format.toUpperCase()})
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Requested: {new Date(export_.requestedAt).toLocaleDateString()}
                          {export_.fileSize && ` • ${formatFileSize(export_.fileSize)}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(export_.status)}>
                        {export_.status}
                      </Badge>
                      {export_.downloadUrl && (
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Consent Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Consent Management
          </CardTitle>
          <CardDescription>
            Control how your data is used and processed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {consentRecords.map((consent) => (
            <div key={consent.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="font-medium">{consent.category}</div>
                <div className="text-sm text-muted-foreground">{consent.purpose}</div>
                {consent.expiresAt && (
                  <div className="text-xs text-muted-foreground">
                    Expires: {new Date(consent.expiresAt).toLocaleDateString()}
                  </div>
                )}
              </div>
              <Switch
                checked={consent.granted}
                onCheckedChange={(checked) => handleConsentToggle(consent.id, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Data Retention Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Data Retention Policies
          </CardTitle>
          <CardDescription>
            How long we keep your different types of data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {retentionPolicies.map((policy, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="font-medium">{policy.category}</div>
                <div className="text-sm text-muted-foreground">{policy.description}</div>
                <div className="text-xs text-muted-foreground">
                  Retention: {policy.retentionPeriod} days
                  {policy.autoDelete && ' • Auto-delete enabled'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {policy.autoDelete ? (
                  <Badge variant="destructive">Auto-Delete</Badge>
                ) : (
                  <Badge variant="secondary">Manual</Badge>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Your Privacy Rights:</strong> You have the right to access, correct, delete, or restrict the processing of your personal data. 
          You can also object to processing and request data portability. Contact our privacy team if you have any questions.
        </AlertDescription>
      </Alert>
    </div>
  );
};
