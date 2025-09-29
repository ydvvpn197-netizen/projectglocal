import React, { useState, useEffect } from 'react';
import { usePerformanceMonitoring, analyzeBundleSize, getOptimizationRecommendations } from '../utils/performance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { RefreshCw, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

export const PerformanceDashboard: React.FC = () => {
  const { metrics, alerts, score, report } = usePerformanceMonitoring();
  const [bundleAnalysis, setBundleAnalysis] = useState<Record<string, unknown> | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    // Analyze bundle size
    const analysis = analyzeBundleSize();
    setBundleAnalysis(analysis);

    // Get optimization recommendations
    if (metrics) {
      const recs = getOptimizationRecommendations(metrics);
      setRecommendations(recs);
    }
  }, [metrics]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 70) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
  };

  const formatMetric = (value: number, unit: string = 'ms') => {
    if (unit === 'ms') return `${value.toFixed(0)}ms`;
    if (unit === 'score') return value.toFixed(1);
    return value.toString();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Dashboard</h1>
          <p className="text-gray-600">Monitor and optimize your application performance</p>
        </div>
        <Button onClick={report} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Generate Report
        </Button>
      </div>

      {/* Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
              {score}
            </div>
            {getScoreBadge(score)}
          </div>
        </CardContent>
      </Card>

      {/* Core Web Vitals */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Core Web Vitals</CardTitle>
            <CardDescription>Key performance metrics that affect user experience</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">LCP</span>
                  <Badge variant={metrics.lcp > 2500 ? 'destructive' : metrics.lcp > 1800 ? 'secondary' : 'default'}>
                    {formatMetric(metrics.lcp)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">Largest Contentful Paint</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">FCP</span>
                  <Badge variant={metrics.fcp > 1800 ? 'destructive' : metrics.fcp > 1000 ? 'secondary' : 'default'}>
                    {formatMetric(metrics.fcp)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">First Contentful Paint</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">CLS</span>
                  <Badge variant={metrics.cls > 0.25 ? 'destructive' : metrics.cls > 0.1 ? 'secondary' : 'default'}>
                    {formatMetric(metrics.cls, 'score')}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">Cumulative Layout Shift</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">FID</span>
                  <Badge variant={metrics.fid > 300 ? 'destructive' : metrics.fid > 100 ? 'secondary' : 'default'}>
                    {formatMetric(metrics.fid)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">First Input Delay</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">TTFB</span>
                  <Badge variant={metrics.ttfb > 1800 ? 'destructive' : metrics.ttfb > 800 ? 'secondary' : 'default'}>
                    {formatMetric(metrics.ttfb)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">Time to First Byte</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Performance Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <Alert key={index} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <span>
                        <strong>{alert.metric.toUpperCase()}</strong>: {formatMetric(alert.value)} 
                        (threshold: {formatMetric(alert.threshold)})
                      </span>
                      <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                        {alert.severity}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bundle Analysis */}
      {bundleAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Bundle Analysis</CardTitle>
            <CardDescription>Current bundle composition and loading performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Scripts ({bundleAnalysis.totalScripts})</h4>
                <div className="space-y-1">
                  {bundleAnalysis.scripts.slice(0, 5).map((script: Record<string, unknown>, index: number) => (
                    <div key={index} className="text-sm text-gray-600 truncate">
                      {script.src?.split('/').pop() || 'Unknown'}
                    </div>
                  ))}
                  {bundleAnalysis.scripts.length > 5 && (
                    <div className="text-sm text-gray-500">
                      +{bundleAnalysis.scripts.length - 5} more
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Stylesheets ({bundleAnalysis.totalStylesheets})</h4>
                <div className="space-y-1">
                  {bundleAnalysis.stylesheets.map((stylesheet: Record<string, unknown>, index: number) => (
                    <div key={index} className="text-sm text-gray-600 truncate">
                      {stylesheet.href?.split('/').pop() || 'Unknown'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimization Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Optimization Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
