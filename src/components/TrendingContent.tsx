import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Calendar, Users, Star, Map, Clock, Heart, MessageCircle, Share2, Eye } from 'lucide-react';
import { useTrendingContent } from '@/hooks/useTrendingContent';
import { TrendingContent as TrendingContentType } from '@/types/search';
import { format } from 'date-fns';

const TrendingContentItem = ({ content }: { content: TrendingContentType }) => {
  const getContentIcon = (type: string) => {
    const icons = {
      artist: <Star className="h-4 w-4" />,
      event: <Calendar className="h-4 w-4" />,
      post: <Users className="h-4 w-4" />,
      group: <Users className="h-4 w-4" />,
      business: <Map className="h-4 w-4" />,
    };
    return icons[type as keyof typeof icons] || <TrendingUp className="h-4 w-4" />;
  };

  const formatTrendingScore = (score: number) => {
    if (score >= 1000) return `${(score / 1000).toFixed(1)}k`;
    return Math.round(score).toString();
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={content.image} />
            <AvatarFallback>{content.title.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {getContentIcon(content.type)}
              <Badge variant="secondary" className="text-xs">
                {content.type}
              </Badge>
              <Badge variant="outline" className="text-xs text-green-600">
                {formatTrendingScore(content.trendingScore)} trending
              </Badge>
              <h3 className="font-semibold truncate">{content.title}</h3>
            </div>

            {content.description && (
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {content.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
              {content.location && (
                <div className="flex items-center gap-1">
                  <Map className="h-3 w-3" />
                  {content.location.name || `${content.location.city}, ${content.location.state}`}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(new Date(content.createdAt), 'MMM dd, yyyy')}
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {content.engagement.likes}
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {content.engagement.comments}
              </div>
              <div className="flex items-center gap-1">
                <Share2 className="h-3 w-3" />
                {content.engagement.shares}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {content.engagement.views}
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {content.engagement.velocity}/hr
              </div>
            </div>

          {content.metadata?.tags && Array.isArray(content.metadata.tags) && (
            <div className="flex gap-1 mt-2">
              {content.metadata.tags.slice(0, 3).map((tag: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button variant="outline" size="sm">
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const TrendingContent = () => {
  const {
    trendingContent,
    loading,
    error,
    period,
    changePeriod,
    refreshTrendingContent
  } = useTrendingContent();

  const periods = [
    { value: 'hour', label: 'Hour' },
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' }
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Trending Content</h2>
          <p className="text-muted-foreground">
            Discover what's popular in your area
          </p>
        </div>
        <Button variant="outline" onClick={refreshTrendingContent} disabled={loading}>
          Refresh
        </Button>
      </div>

      <Tabs value={period} onValueChange={(value) => changePeriod(value as any)}>
        <TabsList>
          {periods.map((p) => (
            <TabsTrigger key={p.value} value={p.value}>
              {p.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={period} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading trending content...</p>
            </div>
          )}

          {!loading && trendingContent.length === 0 && (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No trending content</h3>
              <p className="text-muted-foreground">
                Check back later for trending content in your area
              </p>
            </div>
          )}

          <div className="grid gap-4">
            {trendingContent.map((content) => (
              <TrendingContentItem key={`${content.type}-${content.id}`} content={content} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
