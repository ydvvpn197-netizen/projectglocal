import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Heart, 
  MessageCircle, 
  Share2, 
  UserPlus, 
  Calendar,
  MapPin,
  Star,
  TrendingUp,
  Bell,
  Filter,
  RefreshCw,
  MoreHorizontal,
  Eye,
  ThumbsUp,
  Reply
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ActivityItem {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'post' | 'event' | 'mention';
  user: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl?: string;
  };
  content: {
    title?: string;
    text?: string;
    imageUrl?: string;
    postId?: string;
    eventId?: string;
  };
  metadata: {
    timestamp: string;
    location?: string;
    isRead: boolean;
    priority: 'high' | 'medium' | 'low';
  };
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
  };
}

export const ActivityFeed = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user, filter]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      // Mock activity data - in real app, this would come from API
      const mockActivities: ActivityItem[] = [
        {
          id: '1',
          type: 'like',
          user: {
            id: 'user1',
            displayName: 'Sarah Johnson',
            username: 'sarahj',
            avatarUrl: undefined
          },
          content: {
            text: 'liked your post about the community art exhibition',
            postId: 'post1'
          },
          metadata: {
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            isRead: false,
            priority: 'medium'
          },
          engagement: {
            likes: 12,
            comments: 3,
            shares: 1
          }
        },
        {
          id: '2',
          type: 'comment',
          user: {
            id: 'user2',
            displayName: 'Mike Chen',
            username: 'mikechen',
            avatarUrl: undefined
          },
          content: {
            text: 'commented on your event: "Great initiative! Looking forward to attending."',
            postId: 'post2'
          },
          metadata: {
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            isRead: false,
            priority: 'high'
          },
          engagement: {
            likes: 8,
            comments: 2,
            shares: 0
          }
        },
        {
          id: '3',
          type: 'follow',
          user: {
            id: 'user3',
            displayName: 'Emma Rodriguez',
            username: 'emmar',
            avatarUrl: undefined
          },
          content: {
            text: 'started following you'
          },
          metadata: {
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            isRead: true,
            priority: 'medium'
          }
        },
        {
          id: '4',
          type: 'mention',
          user: {
            id: 'user4',
            displayName: 'David Park',
            username: 'davidpark',
            avatarUrl: undefined
          },
          content: {
            text: 'mentioned you in a post about local business networking',
            postId: 'post3'
          },
          metadata: {
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            isRead: false,
            priority: 'high'
          },
          engagement: {
            likes: 15,
            comments: 5,
            shares: 2
          }
        },
        {
          id: '5',
          type: 'event',
          user: {
            id: 'user5',
            displayName: 'Community Events',
            username: 'communityevents',
            avatarUrl: undefined
          },
          content: {
            title: 'New event created: "Local Farmers Market"',
            text: 'A new farmers market event has been created in your area',
            eventId: 'event1'
          },
          metadata: {
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            location: 'Downtown Plaza',
            isRead: true,
            priority: 'low'
          }
        },
        {
          id: '6',
          type: 'post',
          user: {
            id: 'user6',
            displayName: 'Local News',
            username: 'localnews',
            avatarUrl: undefined
          },
          content: {
            title: 'New post from someone you follow',
            text: 'shared a post about upcoming city council meeting',
            postId: 'post4'
          },
          metadata: {
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            isRead: true,
            priority: 'medium'
          },
          engagement: {
            likes: 25,
            comments: 8,
            shares: 3
          }
        }
      ];

      // Filter activities based on selected filter
      let filteredActivities = mockActivities;
      if (filter !== 'all') {
        filteredActivities = mockActivities.filter(activity => activity.type === filter);
      }

      setActivities(filteredActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'follow':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'post':
        return <Activity className="h-4 w-4 text-purple-500" />;
      case 'event':
        return <Calendar className="h-4 w-4 text-orange-500" />;
      case 'mention':
        return <Star className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'like':
        return 'bg-red-50 border-red-200';
      case 'comment':
        return 'bg-blue-50 border-blue-200';
      case 'follow':
        return 'bg-green-50 border-green-200';
      case 'post':
        return 'bg-purple-50 border-purple-200';
      case 'event':
        return 'bg-orange-50 border-orange-200';
      case 'mention':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const markAsRead = (activityId: string) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === activityId 
          ? { ...activity, metadata: { ...activity.metadata, isRead: true } }
          : activity
      )
    );
  };

  const markAllAsRead = () => {
    setActivities(prev => 
      prev.map(activity => ({
        ...activity,
        metadata: { ...activity.metadata, isRead: true }
      }))
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading activities...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const unreadCount = activities.filter(activity => !activity.metadata.isRead).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Feed
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Stay updated with your community activities
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
            <Button variant="outline" size="sm" onClick={fetchActivities}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filter Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all" onClick={() => setFilter('all')}>
              All
            </TabsTrigger>
            <TabsTrigger value="likes" onClick={() => setFilter('like')}>
              Likes
            </TabsTrigger>
            <TabsTrigger value="comments" onClick={() => setFilter('comment')}>
              Comments
            </TabsTrigger>
            <TabsTrigger value="follows" onClick={() => setFilter('follow')}>
              Follows
            </TabsTrigger>
            <TabsTrigger value="mentions" onClick={() => setFilter('mention')}>
              Mentions
            </TabsTrigger>
            <TabsTrigger value="events" onClick={() => setFilter('event')}>
              Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No activities found</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    !activity.metadata.isRead ? 'bg-blue-50 border-blue-200' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => markAsRead(activity.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={activity.user.avatarUrl} />
                          <AvatarFallback className="text-xs">
                            {activity.user.displayName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{activity.user.displayName}</span>
                        <span className="text-xs text-muted-foreground">@{activity.user.username}</span>
                        {activity.metadata.priority === 'high' && (
                          <Badge variant="destructive" className="text-xs">
                            High
                          </Badge>
                        )}
                        {!activity.metadata.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {activity.content.text}
                      </p>
                      
                      {activity.content.title && (
                        <div className="p-3 bg-muted/50 rounded-lg mb-2">
                          <h4 className="font-medium text-sm">{activity.content.title}</h4>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{formatTimestamp(activity.metadata.timestamp)}</span>
                        {activity.metadata.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {activity.metadata.location}
                          </span>
                        )}
                      </div>
                      
                      {activity.engagement && (
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {activity.engagement.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <Reply className="h-3 w-3" />
                            {activity.engagement.comments}
                          </span>
                          <span className="flex items-center gap-1">
                            <Share2 className="h-3 w-3" />
                            {activity.engagement.shares}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => markAsRead(activity.id)}>
                          {activity.metadata.isRead ? 'Mark as unread' : 'Mark as read'}
                        </DropdownMenuItem>
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Hide activity
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
