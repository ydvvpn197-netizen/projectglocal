import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePrivacyControls } from "@/hooks/usePrivacyControls";
import { PrivacyDashboard } from "@/components/PrivacyDashboard";
import { 
  Shield, 
  Database, 
  Download, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Info,
  ArrowLeft
} from "lucide-react";

const Privacy = () => {
  const {
    privacySettings,
    consentRecords,
    dataExports,
    retentionPolicies,
    loading,
    getConsentSummary,
    loadAllData
  } = usePrivacyControls();

  const [showDashboard, setShowDashboard] = useState(false);
  const [consentSummary, setConsentSummary] = useState({
    totalCategories: 0,
    grantedCategories: 0,
    revokedCategories: 0,
    expiredCategories: 0,
    requiredCategories: 0,
    missingRequiredConsents: []
  });

  // Load consent summary on mount
  useState(() => {
    const loadSummary = async () => {
      const summary = await getConsentSummary();
      setConsentSummary(summary);
    };
    loadSummary();
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading privacy settings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (showDashboard) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setShowDashboard(false)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Privacy Overview
          </Button>
        </div>
        <PrivacyDashboard />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Privacy Center</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Take control of your data and privacy. Manage your consent preferences, 
            download your data, and understand how we protect your information.
          </p>
        </div>

        {/* Privacy Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Privacy Status
            </CardTitle>
            <CardDescription>
              Your current privacy and consent status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Consent Coverage</span>
                  <Badge variant={consentSummary.grantedCategories === consentSummary.totalCategories ? "default" : "secondary"}>
                    {consentSummary.grantedCategories}/{consentSummary.totalCategories}
                  </Badge>
                </div>
                <Progress 
                  value={(consentSummary.grantedCategories / Math.max(consentSummary.totalCategories, 1)) * 100} 
                  className="h-2"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Data Exports</span>
                  <Badge variant="outline">
                    {dataExports.length} requests
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {dataExports.filter(e => e.status === 'completed').length} completed
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Retention Policies</span>
                  <Badge variant="outline">
                    {retentionPolicies.length} active
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {retentionPolicies.filter(p => p.auto_delete).length} auto-delete
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Missing Required Consents Alert */}
        {consentSummary.missingRequiredConsents.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Required Consents Missing:</strong> You need to grant consent for: {consentSummary.missingRequiredConsents.join(', ')}
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowDashboard(true)}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5 text-blue-600" />
                Privacy Dashboard
              </CardTitle>
              <CardDescription>
                Comprehensive privacy management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage all your privacy settings, consent preferences, and data controls in one place.
              </p>
              <Button className="w-full">
                Open Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowDashboard(true)}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Download className="h-5 w-5 text-green-600" />
                Data Export
              </CardTitle>
              <CardDescription>
                Download your personal data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Request and download your personal data in various formats (JSON, CSV, PDF).
              </p>
              <Button variant="outline" className="w-full">
                Request Export
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowDashboard(true)}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Database className="h-5 w-5 text-purple-600" />
                Consent Management
              </CardTitle>
              <CardDescription>
                Control your data usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Grant or revoke consent for different types of data processing and usage.
              </p>
              <Button variant="outline" className="w-full">
                Manage Consent
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        {dataExports.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Data Export Requests
              </CardTitle>
              <CardDescription>
                Your recent data export activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dataExports.slice(0, 3).map((export_) => (
                  <div key={export_.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        export_.status === 'completed' ? 'bg-green-500' :
                        export_.status === 'processing' ? 'bg-yellow-500' :
                        export_.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                      }`} />
                      <div>
                        <div className="font-medium capitalize">
                          {export_.type} Export ({export_.format.toUpperCase()})
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(export_.requested_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Badge variant={
                      export_.status === 'completed' ? 'default' :
                      export_.status === 'processing' ? 'secondary' :
                      export_.status === 'failed' ? 'destructive' : 'outline'
                    }>
                      {export_.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Privacy Notice */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Your Privacy Rights:</strong> You have the right to access, correct, delete, or restrict the processing of your personal data. 
            You can also object to processing and request data portability. For any privacy-related questions or concerns, 
            please contact our privacy team at privacy@projectglocal.com.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default Privacy;
