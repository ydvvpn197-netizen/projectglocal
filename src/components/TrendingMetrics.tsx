import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingContent } from '@/types/search';
import { TrendingUp, TrendingDown, Minus, Eye, Heart, MessageCircle, Share2, Clock, Users, Zap } from 'lucide-react';

interface TrendingMetricsProps {
  content: TrendingContent;
  showDetails?: boolean;
}

export const TrendingMetrics = ({ content, showDetails = false }: TrendingMetricsProps) => {
  const { engagement, trendingScore, trendingPeriod } = content;

  const totalEngagement = engagement.likes + engagement.comments + engagement.shares + engagement.views;
  const velocity = engagement.velocity;

  const getTrendingIcon = () => {
    if (velocity > 0.1) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (velocity < -0.1) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getTrendingColor = () => {
    if (trendingScore >= 80) return 'text-green-600';
    if (trendingScore >= 60) return 'text-blue-600';
    if (trendingScore >= 40) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getTrendingLabel = () => {
    if (trendingScore >= 80) return 'Viral';
    if (trendingScore >= 60) return 'Trending';
    if (trendingScore >= 40) return 'Popular';
    return 'Normal';
  };

  const getVelocityLabel = () => {
    if (velocity > 0.1) return 'Rising';
    if (velocity < -0.1) return 'Declining';
    return 'Stable';
  };

  const getVelocityColor = () => {
    if (velocity > 0.1) return 'text-green-600';
    if (velocity < -0.1) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercentage = (num: number) => {
    return `${Math.round(num * 100)}%`;
  };

  return (
    <div className="space-y-4">
      {/* Main Trending Score */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Trending Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getTrendingIcon()}
              <span className="font-semibold text-lg">{getTrendingLabel()}</span>
            </div>
            <Badge className={`${getTrendingColor()} bg-opacity-10`}>
              {trendingScore.toFixed(0)}/100
            </Badge>
          </div>
          
          <Progress value={trendingScore} className="h-2" />
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Velocity</div>
              <div className={`font-medium ${getVelocityColor()}`}>
                {getVelocityLabel()} ({formatPercentage(Math.abs(velocity))})
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Period</div>
              <div className="font-medium capitalize">{trendingPeriod}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Engagement Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Heart className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <div className="font-semibold">{formatNumber(engagement.likes)}</div>
                <div className="text-xs text-muted-foreground">Likes</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold">{formatNumber(engagement.comments)}</div>
                <div className="text-xs text-muted-foreground">Comments</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Share2 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="font-semibold">{formatNumber(engagement.shares)}</div>
                <div className="text-xs text-muted-foreground">Shares</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <div className="font-semibold">{formatNumber(engagement.views)}</div>
                <div className="text-xs text-muted-foreground">Views</div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Engagement</span>
              <span className="font-semibold">{formatNumber(totalEngagement)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      {showDetails && (
        <>
          {/* Engagement Breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Engagement Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Likes', value: engagement.likes, total: totalEngagement, color: 'bg-red-500' },
                { label: 'Comments', value: engagement.comments, total: totalEngagement, color: 'bg-blue-500' },
                { label: 'Shares', value: engagement.shares, total: totalEngagement, color: 'bg-green-500' },
                { label: 'Views', value: engagement.views, total: totalEngagement, color: 'bg-purple-500' }
              ].map((metric) => (
                <div key={metric.label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{metric.label}</span>
                    <span className="font-medium">{formatNumber(metric.value)}</span>
                  </div>
                  <Progress 
                    value={(metric.value / metric.total) * 100} 
                    className="h-1"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Performance Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Engagement Rate</div>
                  <div className="font-semibold">
                    {totalEngagement > 0 ? formatPercentage(engagement.likes / totalEngagement) : '0%'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Share Rate</div>
                  <div className="font-semibold">
                    {engagement.views > 0 ? formatPercentage(engagement.shares / engagement.views) : '0%'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Comment Rate</div>
                  <div className="font-semibold">
                    {engagement.views > 0 ? formatPercentage(engagement.comments / engagement.views) : '0%'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Velocity Score</div>
                  <div className={`font-semibold ${getVelocityColor()}`}>
                    {formatPercentage(Math.abs(velocity))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trending Analysis */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Trending Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Momentum</span>
                  <Badge variant={velocity > 0.1 ? 'default' : velocity < -0.1 ? 'destructive' : 'secondary'}>
                    {getVelocityLabel()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Category Performance</span>
                  <Badge variant="outline">{content.category}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Trending Period</span>
                  <Badge variant="outline" className="capitalize">{trendingPeriod}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
