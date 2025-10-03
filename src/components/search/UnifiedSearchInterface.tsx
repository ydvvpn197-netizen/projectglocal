import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, SortAsc, SortDesc, TrendingUp, Clock, MapPin, Tag, Star, Users, MessageSquare, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnifiedButton } from '@/design-system';
import { AdvancedSearchInterface } from './AdvancedSearchInterface';
import { LiveCollaboration } from '../realtime/LiveCollaboration';
import { advancedSearchService, SearchResult } from '@/services/AdvancedSearchService';
import { enhancedRealtimeService } from '@/services/EnhancedRealtimeService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface UnifiedSearchInterfaceProps {
  onResultsChange?: (results: SearchResult) => void;
  initialQuery?: string;
  className?: string;
}

export const UnifiedSearchInterface: React.FC<UnifiedSearchInterfaceProps> = ({
  onResultsChange,
  initialQuery = '',
  className = ''
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State
  const [activeTab, setActiveTab] = useState('search');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [collaborationSession, setCollaborationSession] = useState<string | null>(null);

  // Initialize real-time features
  useEffect(() => {
    if (!user) return;

    const initializeRealtime = async () => {
      try {
        // Subscribe to analytics for real-time updates
        const analyticsConnection = await enhancedRealtimeService.subscribeToAnalytics(
          'community',
          (analytics) => {
            console.log('Real-time analytics update:', analytics);
          }
        );

        // Get online users
        const users = enhancedRealtimeService.getOnlineUsers();
        setOnlineUsers(users);
        setIsConnected(true);

        return () => {
          enhancedRealtimeService.disconnect(analyticsConnection.id);
        };
      } catch (error) {
        console.error('Error initializing real-time features:', error);
      }
    };

    initializeRealtime();
  }, [user]);

  // Handle search results
  const handleSearchResults = useCallback((results: SearchResult) => {
    setSearchResults(results);
    onResultsChange?.(results);
  }, [onResultsChange]);

  // Create collaboration session
  const createCollaborationSession = useCallback(async () => {
    if (!user) return;

    try {
      const sessionId = `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await enhancedRealtimeService.createCollaborationSession(
        sessionId,
        [user.id],
        searchResults?.data[0]?.id
      );
      
      setCollaborationSession(sessionId);
      
      toast({
        title: "Collaboration Session Created",
        description: "You can now collaborate on search results in real-time",
      });
    } catch (error) {
      console.error('Error creating collaboration session:', error);
      toast({
        title: "Error",
        description: "Failed to create collaboration session",
        variant: "destructive",
      });
    }
  }, [user, searchResults, toast]);

  // Join collaboration session
  const joinCollaborationSession = useCallback(async (sessionId: string) => {
    if (!user) return;

    try {
      await enhancedRealtimeService.joinCollaborationSession(sessionId, user.id);
      setCollaborationSession(sessionId);
      
      toast({
        title: "Joined Collaboration",
        description: "You're now part of the collaboration session",
      });
    } catch (error) {
      console.error('Error joining collaboration session:', error);
      toast({
        title: "Error",
        description: "Failed to join collaboration session",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Unified Search & Collaboration</h1>
              <p className="text-muted-foreground">
                Search everything, collaborate in real-time, and discover new content
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <div className="flex items-center space-x-1 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-red-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm">Disconnected</span>
                  </div>
                )}
              </div>

              {/* Online Users */}
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{onlineUsers.length} online</span>
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search" className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>Search</span>
          </TabsTrigger>
          <TabsTrigger value="collaboration" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Collaborate</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-4">
          <AdvancedSearchInterface
            onResultsChange={handleSearchResults}
            initialQuery={initialQuery}
          />

          {/* Search Results Actions */}
          {searchResults && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Search Results</span>
                  <div className="flex items-center space-x-2">
                    <UnifiedButton
                      variant="outline"
                      size="sm"
                      onClick={createCollaborationSession}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Start Collaboration
                    </UnifiedButton>
                    <UnifiedButton
                      variant="primary"
                      size="sm"
                      onClick={() => setActiveTab('analytics')}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Analytics
                    </UnifiedButton>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.data.slice(0, 6).map((item, index) => (
                    <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                      <div className="space-y-2">
                        <h3 className="font-medium line-clamp-2">{item.title || item.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {item.description || item.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            {item.category || 'General'}
                          </Badge>
                          {item.rating && (
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span className="text-xs">{item.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Collaboration Tab */}
        <TabsContent value="collaboration" className="space-y-4">
          {collaborationSession ? (
            <LiveCollaboration
              sessionId={collaborationSession}
              documentId={searchResults?.data[0]?.id}
              onDocumentChange={(content) => {
                console.log('Document changed:', content);
              }}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Collaboration</h3>
                <p className="text-muted-foreground mb-4">
                  Start a collaboration session to work together in real-time
                </p>
                <div className="flex justify-center space-x-2">
                  <UnifiedButton
                    variant="primary"
                    onClick={createCollaborationSession}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Start New Session
                  </UnifiedButton>
                  <UnifiedButton
                    variant="outline"
                    onClick={() => {
                      const sessionId = prompt('Enter collaboration session ID:');
                      if (sessionId) {
                        joinCollaborationSession(sessionId);
                      }
                    }}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Join Session
                  </UnifiedButton>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              {searchResults?.analytics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Total Results</p>
                      <p className="text-2xl font-bold">{searchResults.analytics.totalResults}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Search Time</p>
                      <p className="text-2xl font-bold">{searchResults.analytics.searchTime}ms</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Filters Applied</p>
                      <p className="text-2xl font-bold">{searchResults.analytics.filtersApplied}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Online Users</p>
                      <p className="text-2xl font-bold">{onlineUsers.length}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Analytics Data</h3>
                  <p className="text-muted-foreground">
                    Perform a search to see analytics and insights
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Popular Searches */}
          {searchResults?.analytics?.popularSearches && searchResults.analytics.popularSearches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Popular Searches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {searchResults.analytics.popularSearches.map((search, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                      {search}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
