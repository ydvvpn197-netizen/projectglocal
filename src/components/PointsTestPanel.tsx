import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Plus, 
  Minus, 
  TestTube, 
  RefreshCw,
  Trophy,
  Medal,
  Star
} from 'lucide-react';
import { usePoints } from '@/hooks/usePoints';
import { PointsService } from '@/services/pointsService';
import { PointTransactionType } from '@/types/community';
import { useToast } from '@/hooks/use-toast';

const TRANSACTION_TYPES: { value: PointTransactionType; label: string; points: number }[] = [
  { value: 'post_created', label: 'Post Created', points: 2 },
  { value: 'comment_created', label: 'Comment Created', points: 1 },
  { value: 'post_like_received', label: 'Post Like Received', points: 1 },
  { value: 'comment_like_received', label: 'Comment Like Received', points: 1 },
  { value: 'event_organized', label: 'Event Organized', points: 10 },
  { value: 'event_attended', label: 'Event Attended', points: 1 },
  { value: 'post_shared', label: 'Post Shared', points: 2 },
  { value: 'poll_created', label: 'Poll Created', points: 2 },
  { value: 'poll_voted', label: 'Poll Voted', points: 1 },
];

export const PointsTestPanel = () => {
  const { 
    userPoints, 
    loading, 
    error, 
    refreshUserPoints,
    addPoints 
  } = usePoints();
  
  const { toast } = useToast();
  
  const [selectedType, setSelectedType] = useState<PointTransactionType>('post_created');
  const [customPoints, setCustomPoints] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [testing, setTesting] = useState(false);

  const handleAddPoints = async () => {
    if (!userPoints) return;

    setTesting(true);
    try {
      const points = parseInt(customPoints) || TRANSACTION_TYPES.find(t => t.value === selectedType)?.points || 1;
      const description = customDescription || `Test: ${TRANSACTION_TYPES.find(t => t.value === selectedType)?.label}`;
      
      const success = await addPoints(points, selectedType, undefined, undefined, description);
      
      if (success) {
        toast({
          title: "Points Added",
          description: `Added ${points} points for ${description}`,
        });
        await refreshUserPoints();
      } else {
        toast({
          title: "Error",
          description: "Failed to add points",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding points:', error);
      toast({
        title: "Error",
        description: "Failed to add points",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleRefreshPoints = async () => {
    setTesting(true);
    try {
      await refreshUserPoints();
      toast({
        title: "Refreshed",
        description: "Points data refreshed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh points",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return <Trophy className="w-4 h-4 text-yellow-500" />;
    } else if (rank <= 10) {
      return <Medal className="w-4 h-4 text-gray-400" />;
    } else if (rank <= 50) {
      return <Star className="w-4 h-4 text-blue-500" />;
    }
    return <Zap className="w-4 h-4 text-gray-500" />;
  };

  if (loading) {
    return (
      <Card className="points-test-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Points System Test Panel
          </CardTitle>
          <CardDescription>Testing and debugging the points system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">Loading points data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !userPoints) {
    return (
      <Card className="points-test-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Points System Test Panel
          </CardTitle>
          <CardDescription>Testing and debugging the points system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Zap className="w-8 h-8 mx-auto text-red-500" />
            <p className="mt-2 text-red-500">Failed to load points data</p>
            <Button onClick={handleRefreshPoints} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="points-test-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          Points System Test Panel
        </CardTitle>
        <CardDescription>Testing and debugging the points system</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Points Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              {getRankIcon(userPoints.rank)}
              <span className="font-bold text-2xl text-orange-600">
                {userPoints.total_points.toLocaleString()}
              </span>
            </div>
            <div className="text-sm text-orange-700">Total Points</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="font-bold text-2xl text-blue-600">
              #{userPoints.rank}
            </div>
            <div className="text-sm text-blue-700">Community Rank</div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="transaction-type">Transaction Type</Label>
            <Select value={selectedType} onValueChange={(value: PointTransactionType) => setSelectedType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRANSACTION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{type.label}</span>
                      <Badge variant="secondary" className="ml-2">
                        +{type.points}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="custom-points">Custom Points (optional)</Label>
            <Input
              id="custom-points"
              type="number"
              placeholder="Leave empty to use default"
              value={customPoints}
              onChange={(e) => setCustomPoints(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="custom-description">Custom Description (optional)</Label>
            <Input
              id="custom-description"
              placeholder="Leave empty to use default"
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleAddPoints} 
              disabled={testing}
              className="flex-1"
            >
              {testing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Add Points
            </Button>
            
            <Button 
              onClick={handleRefreshPoints} 
              disabled={testing}
              variant="outline"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Quick Test Buttons */}
        <div>
          <Label className="text-sm font-medium">Quick Tests</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {TRANSACTION_TYPES.slice(0, 6).map((type) => (
              <Button
                key={type.value}
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedType(type.value);
                  setCustomPoints('');
                  setCustomDescription('');
                }}
                className="justify-start"
              >
                <Zap className="w-3 h-3 mr-1" />
                {type.label}
              </Button>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last Updated:</span>
            <span>{new Date(userPoints.updated_at).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Points ID:</span>
            <span className="font-mono text-xs">{userPoints.id.slice(0, 8)}...</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
