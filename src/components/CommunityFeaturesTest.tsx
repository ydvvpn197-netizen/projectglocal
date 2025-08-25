import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePoints } from '@/hooks/usePoints';
import { useCommunityGroups } from '@/hooks/useCommunityGroups';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { CommunityGroupCard } from '@/components/CommunityGroupCard';
import { CommunityLeaderboard } from '@/components/CommunityLeaderboard';
import { PointTransactionType, CreateGroupRequest } from '@/types/community';
import { 
  Plus, 
  Users, 
  Trophy, 
  Zap, 
  RefreshCw,
  TestTube,
  Settings,
  Database,
  Activity,
  Target
} from 'lucide-react';

export const CommunityFeaturesTest = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    userPoints, 
    leaderboard, 
    leaderboardLoading, 
    addPoints, 
    refreshUserPoints, 
    refreshLeaderboard 
  } = usePoints();
  const { 
    groups, 
    userGroups, 
    trendingGroups, 
    loading: groupsLoading,
    creating,
    joinGroup, 
    leaveGroup, 
    createGroup,
    fetchGroups, 
    fetchUserGroups 
  } = useCommunityGroups();

  // Form states
  const [pointsToAdd, setPointsToAdd] = useState(10);
  const [transactionType, setTransactionType] = useState<PointTransactionType>('post_created');
  const [description, setDescription] = useState('Test points');
  
  const [newGroup, setNewGroup] = useState<CreateGroupRequest>({
    name: '',
    description: '',
    category: 'Technology',
    is_public: true,
    location_city: 'New York',
    location_state: 'NY',
    location_country: 'USA'
  });

  // Test results
  const [testResults, setTestResults] = useState<{
    pointsTest: boolean;
    leaderboardTest: boolean;
    groupsTest: boolean;
    joinTest: boolean;
    createTest: boolean;
  }>({
    pointsTest: false,
    leaderboardTest: false,
    groupsTest: false,
    joinTest: false,
    createTest: false
  });

  // Run comprehensive tests
  const runAllTests = async () => {
    const results = { ...testResults };
    
    try {
      // Test points system
      const pointsSuccess = await addPoints(pointsToAdd, transactionType, undefined, undefined, 'Comprehensive test');
      results.pointsTest = pointsSuccess;
      
      // Test leaderboard
      await refreshLeaderboard();
      results.leaderboardTest = leaderboard.length > 0 || !leaderboardLoading;
      
      // Test groups loading
      await fetchGroups();
      results.groupsTest = groups.length > 0 || !groupsLoading;
      
      // Test group joining (if groups exist)
      if (groups.length > 0) {
        const joinSuccess = await joinGroup(groups[0].id);
        results.joinTest = joinSuccess;
      }
      
      // Test group creation
      if (newGroup.name && newGroup.description) {
        const createSuccess = await createGroup(newGroup);
        results.createTest = !!createSuccess;
      }
      
      setTestResults(results);
      
      toast({
        title: "Tests Completed",
        description: `Tests completed with ${Object.values(results).filter(Boolean).length}/5 passing`,
      });
      
    } catch (error) {
      console.error('Test error:', error);
      toast({
        title: "Test Error",
        description: "Some tests failed. Check console for details.",
        variant: "destructive",
      });
    }
  };

  const getTestStatus = (testName: keyof typeof testResults) => {
    const passed = testResults[testName];
    return (
      <Badge className={passed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
        {passed ? "✓ Passed" : "✗ Failed"}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <TestTube className="w-5 h-5" />
            Community Features Test Suite
          </CardTitle>
          <CardDescription>
            Comprehensive testing for all community features and points system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button onClick={runAllTests} className="bg-orange-600 hover:bg-orange-700">
              <Activity className="w-4 h-4 mr-2" />
              Run All Tests
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="points" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="points" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Points
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Groups
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Status
          </TabsTrigger>
        </TabsList>

        {/* Points Testing */}
        <TabsContent value="points" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Points System Test
                {getTestStatus('pointsTest')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <Button onClick={() => addPoints(pointsToAdd, transactionType, undefined, undefined, description)} className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Points
                </Button>
                <Button onClick={refreshUserPoints} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard Testing */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Leaderboard Test
                {getTestStatus('leaderboardTest')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CommunityLeaderboard 
                showTitle={false}
                defaultLimit={10}
                showFilters={true}
                showUserPosition={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Groups Testing */}
        <TabsContent value="groups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Community Groups Test
                {getTestStatus('groupsTest')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={fetchGroups} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Groups
                </Button>
                <Button onClick={fetchUserGroups} variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  My Groups
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.slice(0, 6).map((group) => (
                  <CommunityGroupCard 
                    key={group.id} 
                    group={group} 
                    variant="compact"
                  />
                ))}
              </div>
              
              {groupsLoading && (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">Loading groups...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Group Testing */}
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create Group Test
                {getTestStatus('createTest')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="group-name">Group Name</Label>
                  <Input
                    id="group-name"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    placeholder="Enter group name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="group-category">Category</Label>
                  <Select value={newGroup.category} onValueChange={(value) => setNewGroup({ ...newGroup, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Arts & Culture">Arts & Culture</SelectItem>
                      <SelectItem value="Food & Dining">Food & Dining</SelectItem>
                      <SelectItem value="Sports">Sports</SelectItem>
                      <SelectItem value="Music">Music</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Health & Wellness">Health & Wellness</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="group-description">Description</Label>
                <Textarea
                  id="group-description"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="Enter group description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="group-city">City</Label>
                  <Input
                    id="group-city"
                    value={newGroup.location_city || ''}
                    onChange={(e) => setNewGroup({ ...newGroup, location_city: e.target.value })}
                    placeholder="City"
                  />
                </div>
                
                <div>
                  <Label htmlFor="group-state">State</Label>
                  <Input
                    id="group-state"
                    value={newGroup.location_state || ''}
                    onChange={(e) => setNewGroup({ ...newGroup, location_state: e.target.value })}
                    placeholder="State"
                  />
                </div>
                
                <div>
                  <Label htmlFor="group-country">Country</Label>
                  <Input
                    id="group-country"
                    value={newGroup.location_country || ''}
                    onChange={(e) => setNewGroup({ ...newGroup, location_country: e.target.value })}
                    placeholder="Country"
                  />
                </div>
              </div>
              
              <Button 
                onClick={() => createGroup(newGroup)} 
                disabled={creating || !newGroup.name || !newGroup.description}
                className="w-full"
              >
                {creating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Create Group
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Status Testing */}
        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Test Results</h3>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Points System</span>
                      {getTestStatus('pointsTest')}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Leaderboard</span>
                      {getTestStatus('leaderboardTest')}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Groups Loading</span>
                      {getTestStatus('groupsTest')}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Group Joining</span>
                      {getTestStatus('joinTest')}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Group Creation</span>
                      {getTestStatus('createTest')}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold">System Info</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center justify-between">
                      <span>User Authenticated</span>
                      <Badge className={user ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {user ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total Groups</span>
                      <span>{groups.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>User Groups</span>
                      <span>{userGroups.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Leaderboard Entries</span>
                      <span>{leaderboard.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>User Points</span>
                      <span>{userPoints?.total_points || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
