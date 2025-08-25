import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePoints } from '@/hooks/usePoints';
import { useCommunityGroups } from '@/hooks/useCommunityGroups';
import { useToast } from '@/hooks/use-toast';
import { PointTransactionType } from '@/types/community';
import { 
  Plus, 
  Minus, 
  Users, 
  Trophy, 
  Zap, 
  RefreshCw,
  TestTube
} from 'lucide-react';

export const PointsTestPanel = () => {
  const { userPoints, addPoints, refreshUserPoints, refreshLeaderboard } = usePoints();
  const { groups, joinGroup, leaveGroup, fetchGroups } = useCommunityGroups();
  const { toast } = useToast();
  
  const [pointsToAdd, setPointsToAdd] = useState(10);
  const [transactionType, setTransactionType] = useState<PointTransactionType>('post_created');
  const [description, setDescription] = useState('Test points');

  const handleAddPoints = async () => {
    try {
      const success = await addPoints(pointsToAdd, transactionType, undefined, undefined, description);
      if (success) {
        toast({
          title: "Success",
          description: `Added ${pointsToAdd} points!`,
        });
        await refreshUserPoints();
        await refreshLeaderboard();
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
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const success = await joinGroup(groupId);
      if (success) {
        await fetchGroups();
      }
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      const success = await leaveGroup(groupId);
      if (success) {
        await fetchGroups();
      }
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <TestTube className="w-5 h-5" />
          Development Test Panel
        </CardTitle>
        <CardDescription>
          Test community features and points system (Development Only)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Points Testing */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Points System Test
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="points">Points to Add</Label>
              <Input
                id="points"
                type="number"
                value={pointsToAdd}
                onChange={(e) => setPointsToAdd(parseInt(e.target.value) || 0)}
                min="1"
                max="1000"
              />
            </div>
            
            <div>
              <Label htmlFor="type">Transaction Type</Label>
              <Select value={transactionType} onValueChange={(value: PointTransactionType) => setTransactionType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="post_created">Post Created</SelectItem>
                  <SelectItem value="comment_created">Comment Created</SelectItem>
                  <SelectItem value="event_attended">Event Attended</SelectItem>
                  <SelectItem value="event_organized">Event Organized</SelectItem>
                  <SelectItem value="poll_created">Poll Created</SelectItem>
                  <SelectItem value="post_shared">Post Shared</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Test description"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleAddPoints} className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Points
            </Button>
            <Button onClick={refreshUserPoints} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Points
            </Button>
          </div>
          
          {userPoints && (
            <div className="p-4 bg-white rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Current Points</p>
                  <p className="text-2xl font-bold text-orange-600">{userPoints.total_points}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Rank</p>
                  <p className="text-2xl font-bold text-blue-600">#{userPoints.rank}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Community Groups Testing */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-4 h-4" />
            Community Groups Test
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.slice(0, 6).map((group) => (
              <div key={group.id} className="p-4 bg-white rounded-lg border">
                <h4 className="font-semibold text-sm">{group.name}</h4>
                <p className="text-xs text-gray-600 mb-2">{group.category}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{group.member_count} members</span>
                  <span>{group.location_city}</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleJoinGroup(group.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Join
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleLeaveGroup(group.id)}
                    className="flex-1"
                  >
                    Leave
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <Button onClick={fetchGroups} variant="outline" className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Groups
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Quick Actions
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button 
              size="sm" 
              onClick={() => addPoints(50, 'post_created', undefined, undefined, 'Quick test')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              +50 Points
            </Button>
            <Button 
              size="sm" 
              onClick={() => addPoints(100, 'event_organized', undefined, undefined, 'Quick test')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              +100 Points
            </Button>
            <Button 
              size="sm" 
              onClick={() => addPoints(25, 'poll_created', undefined, undefined, 'Quick test')}
              className="bg-green-600 hover:bg-green-700"
            >
              +25 Points
            </Button>
            <Button 
              size="sm" 
              onClick={() => addPoints(10, 'post_shared', undefined, undefined, 'Quick test')}
              className="bg-orange-600 hover:bg-orange-700"
            >
              +10 Points
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
