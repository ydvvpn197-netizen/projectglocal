import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Medal, 
  Star, 
  Zap, 
  TrendingUp, 
  Target,
  Award,
  Crown,
  Flame,
  Calendar,
  MessageCircle,
  Heart,
  Share2,
  Plus,
  Minus
} from 'lucide-react';
import { usePoints } from '@/hooks/usePoints';
import { PointTransaction } from '@/types/community';

interface UserPointsDisplayProps {
  userId?: string;
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
}

const formatPoints = (points: number): string => {
  if (points >= 1000000) {
    return `${(points / 1000000).toFixed(1)}M`;
  } else if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}K`;
  }
  return points.toString();
};

const getRankIcon = (rank: number) => {
  if (rank <= 3) {
    return <Trophy className="w-4 h-4 text-yellow-500" />;
  } else if (rank <= 10) {
    return <Medal className="w-4 h-4 text-gray-400" />;
  } else if (rank <= 50) {
    return <Star className="w-4 h-4 text-blue-500" />;
  }
  return <Target className="w-4 h-4 text-gray-500" />;
};

const getRankBadgeColor = (rank: number) => {
  if (rank <= 3) {
    return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
  } else if (rank <= 10) {
    return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
  } else if (rank <= 50) {
    return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
  }
  return 'bg-gray-100 text-gray-800';
};

const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'post_created':
      return <Plus className="w-4 h-4 text-green-500" />;
    case 'comment_created':
      return <MessageCircle className="w-4 h-4 text-blue-500" />;
    case 'post_like_received':
    case 'comment_like_received':
      return <Heart className="w-4 h-4 text-red-500" />;
    case 'event_organized':
      return <Calendar className="w-4 h-4 text-purple-500" />;
    case 'event_attended':
      return <Calendar className="w-4 h-4 text-green-500" />;
    case 'post_shared':
      return <Share2 className="w-4 h-4 text-orange-500" />;
    case 'poll_created':
      return <Award className="w-4 h-4 text-indigo-500" />;
    case 'poll_voted':
      return <Target className="w-4 h-4 text-cyan-500" />;
    default:
      return <Zap className="w-4 h-4 text-gray-500" />;
  }
};

const getTransactionDescription = (type: string): string => {
  switch (type) {
    case 'post_created':
      return 'Created a post';
    case 'comment_created':
      return 'Added a comment';
    case 'post_like_received':
      return 'Post received a like';
    case 'comment_like_received':
      return 'Comment received a like';
    case 'post_like_given':
      return 'Liked a post';
    case 'comment_like_given':
      return 'Liked a comment';
    case 'event_organized':
      return 'Organized an event';
    case 'event_attended':
      return 'Attended an event';
    case 'post_shared':
      return 'Shared a post';
    case 'poll_created':
      return 'Created a poll';
    case 'poll_voted':
      return 'Voted in a poll';
    case 'post_deleted':
      return 'Deleted a post';
    case 'comment_deleted':
      return 'Deleted a comment';
    case 'event_deleted':
      return 'Deleted an event';
    case 'poll_deleted':
      return 'Deleted a poll';
    default:
      return 'Earned points';
  }
};

export const UserPointsDisplay = ({
  userId,
  className = '',
  showDetails = true,
  compact = false
}: UserPointsDisplayProps) => {
  const { 
    userPoints, 
    loading, 
    error, 
    pointHistory,
    historyLoading 
  } = usePoints();
  
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  if (loading) {
    return (
      <Card className={`user-points-display ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !userPoints) {
    return (
      <Card className={`user-points-display ${className}`}>
        <CardContent className="p-4">
          <div className="text-center text-gray-500">
            <Zap className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm">Points not available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentTransactions = pointHistory.slice(0, 5);

  return (
    <>
      <Card className={`user-points-display ${className}`}>
        <CardContent className={`${compact ? 'p-3' : 'p-4'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-full">
                {getRankIcon(userPoints.rank)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-orange-600">
                    {formatPoints(userPoints.total_points)}
                  </span>
                  <Badge className={`text-xs ${getRankBadgeColor(userPoints.rank)}`}>
                    Rank #{userPoints.rank}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Community Points</p>
              </div>
            </div>
            
            {showDetails && (
              <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Details
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-orange-500" />
                      Points Details
                    </DialogTitle>
                    <DialogDescription>
                      Your community engagement history and points breakdown
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <div className="font-bold text-2xl text-orange-600">
                            {formatPoints(userPoints.total_points)}
                          </div>
                          <div className="text-xs text-orange-700">Total Points</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="font-bold text-2xl text-blue-600">
                            #{userPoints.rank}
                          </div>
                          <div className="text-xs text-blue-700">Community Rank</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Recent Activity</h4>
                        {recentTransactions.length > 0 ? (
                          <div className="space-y-2">
                            {recentTransactions.map((transaction) => (
                              <div key={transaction.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                {getTransactionIcon(transaction.transaction_type)}
                                <div className="flex-1 text-sm">
                                  {getTransactionDescription(transaction.transaction_type)}
                                </div>
                                <span className={`text-xs font-semibold ${
                                  transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {transaction.points > 0 ? '+' : ''}{transaction.points}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No recent activity</p>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="history" className="space-y-4">
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {historyLoading ? (
                          <div className="space-y-2">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded animate-pulse">
                                <div className="w-4 h-4 bg-gray-200 rounded" />
                                <div className="flex-1 h-4 bg-gray-200 rounded" />
                                <div className="w-8 h-4 bg-gray-200 rounded" />
                              </div>
                            ))}
                          </div>
                        ) : pointHistory.length > 0 ? (
                          pointHistory.map((transaction) => (
                            <div key={transaction.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100">
                              {getTransactionIcon(transaction.transaction_type)}
                              <div className="flex-1 text-sm">
                                {getTransactionDescription(transaction.transaction_type)}
                              </div>
                              <div className="text-right">
                                <span className={`text-xs font-semibold ${
                                  transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {transaction.points > 0 ? '+' : ''}{transaction.points}
                                </span>
                                <div className="text-xs text-gray-500">
                                  {new Date(transaction.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">
                            No transaction history available
                          </p>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};
