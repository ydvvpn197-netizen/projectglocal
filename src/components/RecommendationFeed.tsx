import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RefreshCw, Sparkles, Calendar, Users, Star, Map, Clock, Heart, MessageCircle } from 'lucide-react';
import { useRecommendations } from '@/hooks/useRecommendations';
import { Recommendation } from '@/types/recommendations';
import { format } from 'date-fns';

const RecommendationCard = ({ recommendation }: { recommendation: Recommendation }) => {
  const getContentIcon = (type: string) => {
    const icons = {
      artist: <Star className="h-4 w-4" />,
      event: <Calendar className="h-4 w-4" />,
      post: <Users className="h-4 w-4" />,
      group: <Users className="h-4 w-4" />,
      business: <Map className="h-4 w-4" />,
    };
    return icons[type as keyof typeof icons] || <Sparkles className="h-4 w-4" />;
  };

  const formatScore = (score: number) => {
    return Math.round(score * 100);
  };

  return (
    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>{recommendation.contentType.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {getContentIcon(recommendation.contentType)}
              <Badge variant="secondary" className="text-xs">
                {recommendation.contentType}
              </Badge>
              <Badge variant="outline" className="text-xs text-blue-600">
                {formatScore(recommendation.score)}% match
              </Badge>
              <h3 className="font-semibold truncate">Recommended Content</h3>
            </div>

            <p className="text-sm text-muted-foreground mb-2">
              {recommendation.reason}
            </p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {recommendation.algorithm}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(new Date(recommendation.createdAt), 'MMM dd, yyyy')}
              </div>
            </div>

            {recommendation.metadata && (
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {recommendation.metadata.relevanceScore && (
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {Math.round(recommendation.metadata.relevanceScore * 100)}% relevant
                  </div>
                )}
                {recommendation.metadata.popularityScore && (
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    {Math.round(recommendation.metadata.popularityScore * 100)}% popular
                  </div>
                )}
                {recommendation.metadata.freshnessScore && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {Math.round(recommendation.metadata.freshnessScore * 100)}% fresh
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm">
              View
            </Button>
            <Button variant="ghost" size="sm">
              <Heart className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const RecommendationFeed = () => {
  const {
    recommendations,
    loading,
    error,
    refreshRecommendations
  } = useRecommendations();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recommended for You</h2>
          <p className="text-muted-foreground">
            Personalized content based on your interests and behavior
          </p>
        </div>
        <Button variant="outline" onClick={refreshRecommendations} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading recommendations...</p>
        </div>
      )}

      {!loading && recommendations.length === 0 && (
        <div className="text-center py-8">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No recommendations yet</h3>
          <p className="text-muted-foreground">
            Start exploring content to get personalized recommendations
          </p>
        </div>
      )}

      <div className="grid gap-4">
        {recommendations.map((recommendation) => (
          <RecommendationCard key={recommendation.id} recommendation={recommendation} />
        ))}
      </div>
    </div>
  );
};
