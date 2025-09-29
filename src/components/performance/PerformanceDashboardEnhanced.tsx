import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Memory,
  Wifi,
  Download,
  Zap,
  BarChart3,
  Settings,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { 
  performanceMonitoringEnhanced, 
  AdvancedPerformanceMetrics, 
  PerformanceAlert, 
  PerformanceReport,
  PerformanceConfig 
} from '@/services/performanceMonitoringEnhanced';

interface PerformanceDashboardEnhancedProps {
  className?: string;
}

export const PerformanceDashboardEnhanced: React.FC<PerformanceDashboardEnhancedProps> = ({ className }) => {
  const [metrics, setMetrics] = useState<AdvancedPerformanceMetrics>(performanceMonitoringEnhanced.getMetrics());
  const [alerts, setAlerts] = useState<PerformanceAlert[]>(performanceMonitoringEnhanced.getAlerts());
  const [reports, setReports] = useState<PerformanceReport[]>(performanceMonitoringEnhanced.getReports());
  const [score, setScore] = useState<number>(performanceMonitoringEnhanced.getPerformanceScore());
  const [isGood, setIsGood] = useState<boolean>(performanceMonitoringEnhanced.isPerformanceGood());
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<PerformanceConfig>({
    enableRealTimeMonitoring: true,
    enableAlerts: true,
    enableReporting: true,
    sampleRate: 0.1,
    alertThresholds: {
      lcp: 2500,
      fid: 100,
      cls: 0.1,
      fcp: 1800,
      ttfb: 800,
      bundleSize: 500,
      memoryUsage: 100,
      apiResponseTime: 1000
    },
    reportInterval: 30000,
    maxReportsPerSession: 10
  });

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(performanceMonitoringEnhanced.getMetrics());
      setAlerts(performanceMonitoringEnhanced.getAlerts());
      setReports(performanceMonitoringEnhanced.getReports());
      setScore(performanceMonitoringEnhanced.getPerformanceScore());
      setIsGood(performanceMonitoringEnhanced.isPerformanceGood());
    };

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Force update metrics
      setMetrics(performanceMonitoringEnhanced.getMetrics());
      setAlerts(performanceMonitoringEnhanced.getAlerts());
      setReports(performanceMonitoringEnhanced.getReports());
      setScore(performanceMonitoringEnhanced.getPerformanceScore());
      setIsGood(performanceMonitoringEnhanced.isPerformanceGood());
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAlerts = () => {
    performanceMonitoringEnhanced.clearAlerts();
    setAlerts([]);
  };

  const handleClearReports = () => {
    performanceMonitoringEnhanced.clearReports();
    setReports([]);
  };

  const handleConfigUpdate = (updates: Partial<PerformanceConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    performanceMonitoringEnhanced.updateConfig(newConfig);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  const formatMetricValue = (value: number | null, unit: string = 'ms') => {
    if (value === null) return 'N/A';
    return `${value.toFixed(2)}${unit}`;
  };

  const getMetricStatus = (value: number | null, threshold: number) => {
    if (value === null) return 'unknown';
    return value <= threshold ? 'good' : 'poor';
  };

  const renderMetricCard = (
    title: string,
    value: number | null,
    threshold: number,
    unit: string = 'ms',
    icon: React.ReactNode,
    description: string
  ) => {
    const status = getMetricStatus(value, threshold);
    
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon}
              <CardTitle className="text-sm">{title}</CardTitle>
            </div>
            <Badge variant={status === 'good' ? 'default' : 'destructive'}>
              {status === 'good' ? 'Good' : 'Poor'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-1">
            {formatMetricValue(value, unit)}
          </div>
          <div className="text-xs text-muted-foreground">
            {description}
          </div>
          <div className="mt-2">
            <Progress 
              value={value ? Math.min((value / threshold) * 100, 100) : 0} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAlert = (alert: PerformanceAlert) => (
    <Alert key={alert.id} variant={alert.type === 'critical' ? 'destructive' : 'default'}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <div>
            <strong>{alert.metric}:</strong> {alert.message}
            <div className="text-xs text-muted-foreground mt-1">
              {alert.timestamp.toLocaleString()}
            </div>
          </div>
          <Badge variant={alert.type === 'critical' ? 'destructive' : 'secondary'}>
            {alert.type}
          </Badge>
        </div>
      </AlertDescription>
    </Alert>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Monitoring</h2>
          <p className="text-muted-foreground">
            Real-time performance metrics and optimization insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleRefresh} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Badge variant={getScoreBadgeVariant(score)}>
            Score: {score}/100
          </Badge>
        </div>
      </div>

      {/* Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Overall Performance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
              {score}/100
            </div>
            <div className="flex items-center gap-2">
              {isGood ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              <span className="text-sm font-medium">
                {isGood ? 'Good Performance' : 'Needs Improvement'}
              </span>
            </div>
          </div>
          <Progress value={score} className="h-3" />
        </CardContent>
      </Card>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderMetricCard(
              'Largest Contentful Paint',
              metrics.lcp,
              config.alertThresholds.lcp,
              'ms',
              <Clock className="h-4 w-4" />,
              'Time to render the largest content element'
            )}
            
            {renderMetricCard(
              'First Input Delay',
              metrics.fid,
              config.alertThresholds.fid,
              'ms',
              <Zap className="h-4 w-4" />,
              'Time from first user interaction to browser response'
            )}
            
            {renderMetricCard(
              'Cumulative Layout Shift',
              metrics.cls,
              config.alertThresholds.cls,
              '',
              <BarChart3 className="h-4 w-4" />,
              'Visual stability of the page'
            )}
            
            {renderMetricCard(
              'First Contentful Paint',
              metrics.fcp,
              config.alertThresholds.fcp,
              'ms',
              <TrendingUp className="h-4 w-4" />,
              'Time to render the first content'
            )}
            
            {renderMetricCard(
              'Time to First Byte',
              metrics.ttfb,
              config.alertThresholds.ttfb,
              'ms',
              <Download className="h-4 w-4" />,
              'Server response time'
            )}
            
            {renderMetricCard(
              'Bundle Size',
              metrics.bundleSize,
              config.alertThresholds.bundleSize,
              'KB',
              <Download className="h-4 w-4" />,
              'Total JavaScript bundle size'
            )}
            
            {renderMetricCard(
              'Memory Usage',
              metrics.memoryUsage,
              config.alertThresholds.memoryUsage,
              'MB',
              <Memory className="h-4 w-4" />,
              'Current memory consumption'
            )}
            
            {renderMetricCard(
              'API Response Time',
              metrics.apiResponseTime,
              config.alertThresholds.apiResponseTime,
              'ms',
              <Wifi className="h-4 w-4" />,
              'Average API response time'
            )}
          </div>

          {/* Additional Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Load Time</div>
                  <div className="font-medium">{formatMetricValue(metrics.loadTime)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Render Time</div>
                  <div className="font-medium">{formatMetricValue(metrics.renderTime)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Network Latency</div>
                  <div className="font-medium">{formatMetricValue(metrics.networkLatency)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Error Count</div>
                  <div className="font-medium">{metrics.errorCount}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Performance Alerts</h3>
            <Button 
              onClick={handleClearAlerts}
              variant="outline"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
          
          {alerts.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                No performance alerts. Your application is performing well!
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              {alerts.map(renderAlert)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Performance Reports</h3>
            <Button 
              onClick={handleClearReports}
              variant="outline"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
          
          {reports.length === 0 ? (
            <Alert>
              <Activity className="h-4 w-4" />
              <AlertDescription>
                No performance reports available yet. Reports are generated automatically.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              {reports.map(report => (
                <Card key={report.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">
                        Report #{report.id.split('_')[1]}
                      </CardTitle>
                      <Badge variant={report.score >= 90 ? 'default' : 'secondary'}>
                        Score: {report.score}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground mb-2">
                      {report.timestamp.toLocaleString()}
                    </div>
                    <div className="text-sm">
                      <div>URL: {report.url}</div>
                      <div>Alerts: {report.alerts.length}</div>
                      <div>Recommendations: {report.recommendations.length}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Performance Monitoring Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Real-time Monitoring</div>
                    <div className="text-sm text-muted-foreground">
                      Enable real-time performance monitoring
                    </div>
                  </div>
                  <Button
                    variant={config.enableRealTimeMonitoring ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleConfigUpdate({ enableRealTimeMonitoring: !config.enableRealTimeMonitoring })}
                  >
                    {config.enableRealTimeMonitoring ? "Enabled" : "Disabled"}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Alerts</div>
                    <div className="text-sm text-muted-foreground">
                      Enable performance alerts
                    </div>
                  </div>
                  <Button
                    variant={config.enableAlerts ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleConfigUpdate({ enableAlerts: !config.enableAlerts })}
                  >
                    {config.enableAlerts ? "Enabled" : "Disabled"}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Reporting</div>
                    <div className="text-sm text-muted-foreground">
                      Enable performance reporting to server
                    </div>
                  </div>
                  <Button
                    variant={config.enableReporting ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleConfigUpdate({ enableReporting: !config.enableReporting })}
                  >
                    {config.enableReporting ? "Enabled" : "Disabled"}
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="font-medium">Sample Rate</div>
                  <div className="text-sm text-muted-foreground">
                    Percentage of users to include in reporting
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={config.sampleRate}
                      onChange={(e) => handleConfigUpdate({ sampleRate: parseFloat(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium">
                      {Math.round(config.sampleRate * 100)}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-medium">Report Interval</div>
                  <div className="text-sm text-muted-foreground">
                    How often to generate performance reports
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="10000"
                      max="300000"
                      step="10000"
                      value={config.reportInterval}
                      onChange={(e) => handleConfigUpdate({ reportInterval: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium">
                      {Math.round(config.reportInterval / 1000)}s
                    </span>
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

export default PerformanceDashboardEnhanced;
