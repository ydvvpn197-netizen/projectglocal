import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MapPin, 
  Heart, 
  UserPlus, 
  UserCheck, 
  TrendingUp, 
  Star,
  Filter,
  Search,
  RefreshCw,
  X
} from 'lucide-react';
import { useFollowing } from '@/hooks/useFollowing';
import { useAuth } from '@/hooks/useAuth';
import { FollowSuggestion } from '@/types/following';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FollowSuggestionsProps {
  className?: string;
}

export const FollowSuggestions = ({ className }: FollowSuggestionsProps) => {
  const { user } = useAuth();
  const { 
    suggestions, 
    loading, 
    error, 
    fetchSuggestions, 
    followUser, 
    unfollowUser 
  } = useFollowing();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('score');
  const [filteredSuggestions, setFilteredSuggestions] = useState<FollowSuggestion[]>([]);

  useEffect(() => {
    if (user) {
      fetchSuggestions();
    }
  }, [user, fetchSuggestions]);

  useEffect(() => {
    let filtered = suggestions;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(suggestion => 
        suggestion.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        suggestion.bio.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(suggestion => {
        switch (filterType) {
          case 'mutual':
            return suggestion.mutualFollowers > 0;
          case 'location':
            return suggestion.location !== null;
          case 'interests':
            return suggestion.commonInterests.length > 0;
          default:
            return true;
        }
      });
    }

    // Sort suggestions
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score;
        case 'mutual':
          return b.mutualFollowers - a.mutualFollowers;
        case 'name':
          return a.displayName.localeCompare(b.displayName);
        default:
          return 0;
      }
    });

    setFilteredSuggestions(filtered);
  }, [suggestions, searchQuery, filterType, sortBy]);

  const handleFollow = async (userId: string) => {
    try {
      await followUser(userId);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      await unfollowUser(userId);
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Follow Suggestions
          </CardTitle>
          <CardDescription>
            Discover people you might want to follow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading suggestions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Follow Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => fetchSuggestions()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Follow Suggestions
        </CardTitle>
        <CardDescription>
          Discover people you might want to follow based on your interests and connections
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search suggestions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSearchQuery('')}
              disabled={!searchQuery}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="mutual">Mutual</SelectItem>
                <SelectItem value="location">Nearby</SelectItem>
                <SelectItem value="interests">Interests</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Score</SelectItem>
                <SelectItem value="mutual">Mutual</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => fetchSuggestions()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Suggestions List */}
        <div className="space-y-4">
          {filteredSuggestions.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No suggestions match your search' : 'No suggestions available'}
              </p>
            </div>
          ) : (
            filteredSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={suggestion.avatarUrl} />
                    <AvatarFallback>
                      {suggestion.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold truncate">{suggestion.displayName}</h4>
                      {suggestion.score > 0.8 && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Top Match
                        </Badge>
                      )}
                    </div>
                    
                    {suggestion.bio && (
                      <p className="text-sm text-muted-foreground truncate mb-2">
                        {suggestion.bio}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {suggestion.mutualFollowers > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {suggestion.mutualFollowers} mutual
                        </span>
                      )}
                      
                      {suggestion.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {suggestion.location.city}
                          {suggestion.location.state && `, ${suggestion.location.state}`}
                        </span>
                      )}
                      
                      {suggestion.commonInterests.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {suggestion.commonInterests.length} shared interests
                        </span>
                      )}
                    </div>

                    {suggestion.reason && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {suggestion.reason}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleFollow(suggestion.userId)}
                    className="flex items-center gap-1"
                  >
                    <UserPlus className="h-4 w-4" />
                    Follow
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredSuggestions.length > 0 && (
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={() => fetchSuggestions()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Load More Suggestions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FollowSuggestions;
