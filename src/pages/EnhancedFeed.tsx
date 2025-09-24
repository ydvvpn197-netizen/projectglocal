import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Clock, 
  Users, 
  MapPin, 
  Filter,
  Search,
  Plus,
  RefreshCw,
  Settings
} from 'lucide-react';
import { EnhancedFeed as FeedComponent } from '@/components/feed/EnhancedFeed';
import { MobileLayout } from '@/components/navigation/MobileBottomNavigation';
import { VoiceControlPanel } from '@/components/voice/VoiceControlPanel';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface EnhancedFeedPageProps {
  className?: string;
}

export const EnhancedFeedPage: React.FC<EnhancedFeedPageProps> = ({ className }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'trending' | 'latest' | 'following' | 'local'>('trending');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const feedTypes = [
    { id: 'trending', label: 'Trending', icon: TrendingUp, color: 'text-red-500' },
    { id: 'latest', label: 'Latest', icon: Clock, color: 'text-blue-500' },
    { id: 'following', label: 'Following', icon: Users, color: 'text-green-500' },
    { id: 'local', label: 'Local', icon: MapPin, color: 'text-orange-500' }
  ] as const;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Feed refreshed",
        description: "Latest posts have been loaded"
      });
    }, 1000);
  };

  const handleCreatePost = () => {
    window.location.href = '/create';
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search functionality
    console.log('Searching for:', query);
  };

  const handleFilterChange = (filter: string, value: any) => {
    console.log('Filter changed:', filter, value);
    // Implement filter functionality
  };

  return (
    <MobileLayout>
      <div className={`min-h-screen bg-gray-50 ${className}`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Community Feed</h1>
                <p className="text-sm text-gray-600">
                  Discover what's happening in your community
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  onClick={handleCreatePost}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts, events, or people..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Feed Type Tabs */}
          <div className="px-4 pb-4">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-4">
                {feedTypes.map(({ id, label, icon: Icon, color }) => (
                  <TabsTrigger key={id} value={id} className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${color}`} />
                    <span className="hidden sm:inline">{label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Filters Panel */}
        <motion.div
          initial={false}
          animate={{ height: showFilters ? 'auto' : 0 }}
          className="bg-white border-b border-gray-200 overflow-hidden"
        >
          <div className="px-4 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">All Posts</option>
                  <option value="events">Events</option>
                  <option value="services">Services</option>
                  <option value="discussions">Discussions</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Range
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Apply Filters
              </Button>
              <Button variant="ghost" size="sm">
                Clear All
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Feed Content */}
        <div className="p-4">
          <FeedComponent feedType={activeTab} />
        </div>

        {/* Voice Control Panel - Mobile */}
        <div className="md:hidden fixed bottom-20 right-4 z-40">
          <VoiceControlPanel compact />
        </div>
      </div>
    </MobileLayout>
  );
};

export default EnhancedFeedPage;
