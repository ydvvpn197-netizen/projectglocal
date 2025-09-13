import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EnhancedPrivacySettings } from "./EnhancedPrivacySettings";
import { VirtualProtestSystem } from "./VirtualProtestSystem";
import { EnhancedPollSystem } from "./EnhancedPollSystem";
import { CommunityIssuesSystem } from "./CommunityIssuesSystem";
import { CivicEngagementAnalytics } from "./CivicEngagementAnalytics";
import { 
  Shield, 
  Megaphone, 
  Vote, 
  AlertTriangle, 
  BarChart3, 
  Building, 
  Users, 
  Target,
  TrendingUp,
  Activity,
  X,
  Settings
} from "lucide-react";

interface CivicEngagementDashboardProps {
  onClose?: () => void;
}

export const CivicEngagementDashboard: React.FC<CivicEngagementDashboardProps> = ({ 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);

  const getCivicEngagementStats = () => {
    // This would come from actual data in a real implementation
    return {
      totalPolls: 24,
      activeProtests: 8,
      reportedIssues: 15,
      authoritiesTargeted: 12,
      communityScore: 85,
      engagementLevel: "Leader"
    };
  };

  const stats = getCivicEngagementStats();

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Civic Engagement Dashboard</h1>
          <p className="text-muted-foreground">
            Enhanced privacy controls and government authority integration for civic participation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPrivacySettings(true)}
          >
            <Shield className="h-4 w-4 mr-2" />
            Privacy Settings
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Vote className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Government Polls</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalPolls}</div>
            <div className="text-xs text-muted-foreground">Authority-tagged polls</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Megaphone className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Active Protests</span>
            </div>
            <div className="text-2xl font-bold">{stats.activeProtests}</div>
            <div className="text-xs text-muted-foreground">Virtual protests running</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Community Issues</span>
            </div>
            <div className="text-2xl font-bold">{stats.reportedIssues}</div>
            <div className="text-xs text-muted-foreground">Issues reported</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Engagement Score</span>
            </div>
            <div className="text-2xl font-bold">{stats.communityScore}</div>
            <div className="text-xs text-muted-foreground">
              <Badge variant="default">{stats.engagementLevel}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Highlights */}
      <Alert>
        <Target className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <h4 className="font-medium">New Features Implemented</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span>Enhanced Privacy & Anonymity System</span>
              </div>
              <div className="flex items-center gap-2">
                <Vote className="h-4 w-4 text-green-600" />
                <span>Government Authority Tagged Polls</span>
              </div>
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-purple-600" />
                <span>Virtual Protest System</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-orange-600" />
                <span>Civic Engagement Analytics</span>
              </div>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="polls">Government Polls</TabsTrigger>
          <TabsTrigger value="protests">Virtual Protests</TabsTrigger>
          <TabsTrigger value="issues">Community Issues</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Civic Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Vote className="h-4 w-4 text-blue-600" />
                    <div className="flex-1">
                      <div className="font-medium">Voted on City Budget Poll</div>
                      <div className="text-sm text-muted-foreground">2 hours ago</div>
                    </div>
                    <Badge variant="outline">Poll</Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Megaphone className="h-4 w-4 text-purple-600" />
                    <div className="flex-1">
                      <div className="font-medium">Joined Climate Action Protest</div>
                      <div className="text-sm text-muted-foreground">1 day ago</div>
                    </div>
                    <Badge variant="outline">Protest</Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <div className="flex-1">
                      <div className="font-medium">Reported Pothole Issue</div>
                      <div className="text-sm text-muted-foreground">3 days ago</div>
                    </div>
                    <Badge variant="outline">Issue</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Start engaging with your community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab("polls")}
                  >
                    <Vote className="h-4 w-4 mr-2" />
                    Create Government Poll
                  </Button>
                  
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab("protests")}
                  >
                    <Megaphone className="h-4 w-4 mr-2" />
                    Start Virtual Protest
                  </Button>
                  
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab("issues")}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Report Community Issue
                  </Button>
                  
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab("analytics")}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Privacy & Anonymity Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Anonymity Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Anonymous Mode: Active</div>
                  <div className="text-sm text-muted-foreground">
                    Using anonymous username: User_ABC123
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">Maximum Privacy</Badge>
                  <Button variant="outline" size="sm" onClick={() => setShowPrivacySettings(true)}>
                    <Settings className="h-4 w-4 mr-1" />
                    Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="polls">
          <EnhancedPollSystem compact={false} />
        </TabsContent>
        
        <TabsContent value="protests">
          <VirtualProtestSystem compact={false} />
        </TabsContent>
        
        <TabsContent value="issues">
          <CommunityIssuesSystem compact={false} />
        </TabsContent>
        
        <TabsContent value="analytics">
          <CivicEngagementAnalytics compact={false} />
        </TabsContent>
      </Tabs>

      {/* Privacy Settings Modal */}
      {showPrivacySettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <EnhancedPrivacySettings 
              onClose={() => setShowPrivacySettings(false)}
              compact={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};