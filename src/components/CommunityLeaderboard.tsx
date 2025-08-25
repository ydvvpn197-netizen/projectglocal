import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Trophy, 
  Medal, 
  Star, 
  TrendingUp, 
  Users, 
  Zap,
  Crown,
  Award,
  Flame,
  Target
} from 'lucide-react';
import { usePoints } from '@/hooks/usePoints';
import { CommunityLeaderboardEntry } from '@/types/community';

interface CommunityLeaderboardProps {
  className?: string;
  showTitle?: boolean;
  defaultLimit?: number;
  showFilters?: boolean;
  showUserPosition?: boolean;
}

const LEADERBOARD_LIMITS = [
  { value: '5', label: 'Top 5' },
  { value: '20', label: 'Top 20' },
  { value: '50', label: 'Top 50' },
  { value: '100', label: 'Top 100' },
  { value: '1000', label: 'Top 1000' }
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="w-5 h-5 text-yellow-500" />;
    case 2:
      return <Medal className="w-5 h-5 text-gray-400" />;
    case 3:
      return <Medal className="w-5 h-5 text-amber-600" />;
    default:
      return <Star className="w-4 h-4 text-blue-500" />;
  }
};

const getRankBadgeColor = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    case 2:
      return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
    case 3:
      return 'bg-gradient-to-r from-amber-500 to-amber-700 text-white';
    default:
      return 'bg-blue-100 text-blue-800';
  }
};

const formatPoints = (points: number): string => {
  if (points >= 1000000) {
    return `${(points / 1000000).toFixed(1)}M`;
  } else if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}K`;
  }
  return points.toString();
};

export const CommunityLeaderboard = ({
  className = '',
  showTitle = true,
  defaultLimit = 5,
  showFilters = true,
  showUserPosition = true
}: CommunityLeaderboardProps) => {
  const { 
    leaderboard, 
    leaderboardLoading, 
    leaderboardError, 
    userPoints,
    refreshLeaderboard 
  } = usePoints();
  
  const [selectedLimit, setSelectedLimit] = useState(defaultLimit.toString());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    refreshLeaderboard(parseInt(selectedLimit));
  }, [selectedLimit, refreshLeaderboard]);

  const handleLimitChange = (value: string) => {
    setSelectedLimit(value);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const displayedEntries = isExpanded ? leaderboard : leaderboard.slice(0, 5);

  if (leaderboardError) {
    return (
      <Card className={`community-leaderboard ${className}`}>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <TrendingUp className="w-8 h-8 mx-auto mb-2" />
            <p>Failed to load leaderboard</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refreshLeaderboard(parseInt(selectedLimit))}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`community-leaderboard ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Community Leaderboard</CardTitle>
              <CardDescription>Top contributors this month</CardDescription>
            </div>
          </div>
          {showFilters && (
            <Select value={selectedLimit} onValueChange={handleLimitChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEADERBOARD_LIMITS.map((limit) => (
                  <SelectItem key={limit.value} value={limit.value}>
                    {limit.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {leaderboardLoading ? (
          // Loading skeleton
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="w-16 h-6" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Leaderboard entries */}
            <div className="space-y-2">
              {displayedEntries.map((entry, index) => (
                <div
                  key={entry.user_id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${
                    index < 3 ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200' : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center w-8 h-8">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  {/* Avatar */}
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={entry.avatar_url || ''} alt={entry.display_name || 'User'} />
                    <AvatarFallback className="bg-gradient-to-r from-orange-400 to-red-400 text-white font-semibold">
                      {entry.display_name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">
                        {entry.display_name || 'Anonymous User'}
                      </p>
                      {index < 3 && (
                        <Badge className={`text-xs ${getRankBadgeColor(entry.rank)}`}>
                          #{entry.rank}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Zap className="w-3 h-3" />
                      <span>{formatPoints(entry.total_points)} points</span>
                    </div>
                  </div>
                  
                  {/* Points */}
                  <div className="text-right">
                    <div className="font-bold text-lg text-orange-600">
                      {formatPoints(entry.total_points)}
                    </div>
                    <div className="text-xs text-muted-foreground">points</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Show more/less button */}
            {leaderboard.length > 5 && (
              <div className="text-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleExpanded}
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  {isExpanded ? 'Show Less' : `Show More (${leaderboard.length - 5} more)`}
                </Button>
              </div>
            )}

            {/* User's position */}
            {showUserPosition && userPoints && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8">
                      <Target className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-blue-900">Your Position</p>
                      <p className="text-xs text-blue-700">Rank #{userPoints.rank}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-blue-600">
                      {formatPoints(userPoints.total_points)}
                    </div>
                    <div className="text-xs text-blue-700">your points</div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!leaderboardLoading && leaderboard.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">No leaderboard data available</p>
                <p className="text-sm text-gray-400">Start engaging to earn points!</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
