import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, MapPin, Heart, UserPlus, RefreshCw } from 'lucide-react';
import { useFollowing } from '@/hooks/useFollowing';
import { FollowSuggestion } from '@/types/following';

const FollowSuggestionCard = ({ suggestion }: { suggestion: FollowSuggestion }) => {
  const { followUser, loading } = useFollowing();

  const handleFollow = async () => {
    await followUser(suggestion.userId);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={suggestion.avatarUrl} />
            <AvatarFallback>{suggestion.displayName.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{suggestion.displayName}</h3>
              <Badge variant="outline" className="text-xs">
                {Math.round(suggestion.score)}% match
              </Badge>
            </div>

            {suggestion.bio && (
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {suggestion.bio}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
              {suggestion.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {suggestion.location.city}, {suggestion.location.state}
                </div>
              )}
              {suggestion.mutualFollowers > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {suggestion.mutualFollowers} mutual
                </div>
              )}
            </div>

            {suggestion.commonInterests.length > 0 && (
              <div className="flex gap-1 mb-2">
                {suggestion.commonInterests.slice(0, 3).map((interest, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {suggestion.reason}
            </p>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleFollow}
            disabled={loading}
          >
            <UserPlus className="h-3 w-3 mr-1" />
            Follow
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const FollowSuggestions = () => {
  const {
    suggestions,
    loading,
    error,
    fetchSuggestions
  } = useFollowing();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">People to Follow</h2>
          <p className="text-muted-foreground">
            Discover people with similar interests
          </p>
        </div>
        <Button variant="outline" onClick={fetchSuggestions} disabled={loading}>
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
          <p className="mt-2 text-muted-foreground">Loading suggestions...</p>
        </div>
      )}

      {!loading && suggestions.length === 0 && (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No suggestions yet</h3>
          <p className="text-muted-foreground">
            Start following people to get personalized suggestions
          </p>
        </div>
      )}

      <div className="grid gap-4">
        {suggestions.map((suggestion) => (
          <FollowSuggestionCard key={suggestion.userId} suggestion={suggestion} />
        ))}
      </div>
    </div>
  );
};
