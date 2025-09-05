/**
 * Integration Status Dashboard Component
 * Displays comprehensive integration health monitoring
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink,
  Settings,
  Info
} from 'lucide-react';
import { useIntegrationStatus } from '@/hooks/useIntegrationStatus';
import { IntegrationStatus } from '@/services/integrationStatusService';

interface IntegrationStatusDashboardProps {
  className?: string;
  showConfigurationGuide?: boolean;
  compact?: boolean;
}

export function IntegrationStatusDashboard({ 
  className = '',
  showConfigurationGuide = true,
  compact = false 
}: IntegrationStatusDashboardProps) {
  const { health, loading, error, refresh } = useIntegrationStatus({
    autoRefresh: true,
    refreshInterval: 30000
  });
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusIcon = (integration: IntegrationStatus) => {
    if (!integration.configured) {
      return <XCircle className="h-4 w-4 text-gray-400" />;
    }
    if (integration.connected) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusBadge = (integration: IntegrationStatus) => {
    if (!integration.configured) {
      return <Badge variant="secondary">Not Configured</Badge>;
    }
    if (integration.connected) {
      return <Badge variant="default" className="bg-green-500">Connected</Badge>;
    }
    return <Badge variant="destructive">Error</Badge>;
  };

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'unhealthy': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (loading && !health) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading integration status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load integration status: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!health) return null;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Integration Status
            </CardTitle>
            <CardDescription>
              Monitor the health of all external integrations
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            {showConfigurationGuide && (
              <TabsTrigger value="setup">Setup Guide</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Overall Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold">Overall Status</h3>
                <p className="text-sm text-gray-600">
                  {health.summary.connected} of {health.summary.total} integrations connected
                </p>
              </div>
              <div className={`text-2xl font-bold ${getOverallStatusColor(health.overall)}`}>
                {health.overall.toUpperCase()}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {health.summary.configured}
                </div>
                <div className="text-sm text-blue-600">Configured</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {health.summary.connected}
                </div>
                <div className="text-sm text-green-600">Connected</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {health.summary.required}
                </div>
                <div className="text-sm text-orange-600">Required</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {health.summary.optional}
                </div>
                <div className="text-sm text-purple-600">Optional</div>
              </div>
            </div>

            {/* Integration List */}
            <div className="space-y-3">
              <h3 className="font-semibold">Integrations</h3>
              {health.integrations.map((integration) => (
                <div
                  key={integration.name}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(integration)}
                    <div>
                      <div className="font-medium">{integration.name}</div>
                      {integration.error && (
                        <div className="text-sm text-red-600">{integration.error}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {integration.required && (
                      <Badge variant="outline" className="text-xs">Required</Badge>
                    )}
                    {getStatusBadge(integration)}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            {health.integrations.map((integration) => (
              <Card key={integration.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(integration)}
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                    </div>
                    {getStatusBadge(integration)}
                  </div>
                  {integration.error && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{integration.error}</AlertDescription>
                    </Alert>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Features</h4>
                      <div className="flex flex-wrap gap-2">
                        {integration.features.map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Last checked: {integration.lastChecked.toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {showConfigurationGuide && (
            <TabsContent value="setup" className="space-y-4">
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Configure environment variables in your .env file to enable integrations.
                  </AlertDescription>
                </Alert>
                
                {Object.entries(integrationStatusService.getConfigurationGuide()).map(([name, guide]) => (
                  <Card key={name}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{name}</CardTitle>
                        {guide.setupUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={guide.setupUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Setup Guide
                            </a>
                          </Button>
                        )}
                      </div>
                      <CardDescription>{guide.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <h4 className="font-medium mb-2">Environment Variables</h4>
                        <div className="space-y-1">
                          {guide.envVars.map((envVar) => (
                            <code key={envVar} className="block p-2 bg-gray-100 rounded text-sm">
                              {envVar}
                            </code>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default IntegrationStatusDashboard;
