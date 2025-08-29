import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  Search, 
  Filter, 
  Trash2, 
  Check, 
  CheckCircle, 
  Clock, 
  User, 
  Megaphone,
  LogIn,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { NotificationItem } from '@/components/NotificationBell';

export default function Notifications() {
  const { user } = useAuth();
  const {
    generalNotifications,
    personalNotifications,
    allNotifications,
    counts,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
    isAuthenticated
  } = useNotifications();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Filter notifications based on search term and type
  const filteredNotifications = useMemo(() => {
    let filtered = allNotifications;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(notification => notification.type === filterType);
    }

    return filtered;
  }, [allNotifications, searchTerm, filterType]);

  const filteredPersonalNotifications = useMemo(() => {
    let filtered = personalNotifications;

    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(notification => notification.type === filterType);
    }

    return filtered;
  }, [personalNotifications, searchTerm, filterType]);

  const filteredGeneralNotifications = useMemo(() => {
    let filtered = generalNotifications;

    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(notification => notification.type === filterType);
    }

    return filtered;
  }, [generalNotifications, searchTerm, filterType]);

  // Get unique notification types for filter dropdown
  const notificationTypes = useMemo(() => {
    const types = new Set<string>();
    allNotifications.forEach(notification => types.add(notification.type));
    return Array.from(types).sort();
  }, [allNotifications]);

  // Handle notification actions
  const handleMarkAsRead = async (notificationId: string) => {
    if (isAuthenticated) {
      await markAsRead(notificationId);
    }
  };

  const handleDelete = (notificationId: string) => {
    if (isAuthenticated) {
      deleteNotification(notificationId);
    }
  };

  const handleNavigate = (notification: any) => {
    // Handle navigation logic here
    console.log('Navigate to:', notification);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Sign in to view notifications</h2>
            <p className="text-muted-foreground mb-4">
              You need to be signed in to view and manage your notifications.
            </p>
            <Button onClick={() => window.location.href = '/signin'}>
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notifications</h1>
            <p className="text-muted-foreground">
              Manage and view all your notifications from The Glocal.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {isAuthenticated && counts.personal > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
              >
                <Check className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{counts.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Personal</p>
                  <p className="text-2xl font-bold">{counts.personal}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">General</p>
                  <p className="text-2xl font-bold">{counts.general}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Unread</p>
                  <p className="text-2xl font-bold">{counts.personal}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="all">All Types</option>
                  {notificationTypes.map(type => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="flex items-center gap-2">
            All ({filteredNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="personal" className="flex items-center gap-2">
            Personal ({filteredPersonalNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            General ({filteredGeneralNotifications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading notifications...</p>
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">Unable to load notifications</p>
                  <Button variant="outline" onClick={refresh}>
                    Try Again
                  </Button>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold mb-2">No notifications found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || filterType !== 'all' 
                      ? 'Try adjusting your search or filters'
                      : 'You\'re all caught up!'
                    }
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="p-4 space-y-2">
                    {filteredNotifications.map((notification) => (
                      <NotificationItem
                        key={`${notification.isGeneral ? 'general' : 'personal'}-${notification.id}`}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                        onNavigate={handleNavigate}
                        isGeneral={notification.isGeneral}
                        isAuthenticated={isAuthenticated}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personal" className="mt-6">
          <Card>
            <CardContent className="p-0">
              {filteredPersonalNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold mb-2">No personal notifications</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || filterType !== 'all' 
                      ? 'Try adjusting your search or filters'
                      : 'You have no personal notifications yet.'
                    }
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="p-4 space-y-2">
                    {filteredPersonalNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                        onNavigate={handleNavigate}
                        isGeneral={false}
                        isAuthenticated={isAuthenticated}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="mt-6">
          <Card>
            <CardContent className="p-0">
              {filteredGeneralNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Megaphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold mb-2">No general notifications</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || filterType !== 'all' 
                      ? 'Try adjusting your search or filters'
                      : 'No general announcements at the moment.'
                    }
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="p-4 space-y-2">
                    {filteredGeneralNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                        onNavigate={handleNavigate}
                        isGeneral={true}
                        isAuthenticated={isAuthenticated}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
