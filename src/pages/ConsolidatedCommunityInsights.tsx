import React, { useState, useEffect } from 'react';
import { RoleGuard } from '../components/RoleGuard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { 
  Shield, 
  Lock, 
  Wifi,
  WifiOff,
  Activity,
  Clock,
  Database,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Settings,
  BarChart3,
  TrendingUp,
  Users,
  MessageCircle,
  Calendar,
  Globe,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  Zap,
  Target,
  Award,
  Trophy,
  Star,
  Heart,
  Share2,
  Download,
  Upload,
  Filter,
  Search,
  Grid3X3,
  List,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  Minus,
  X,
  Check,
  Info,
  HelpCircle,
  ExternalLink,
  Copy,
  Link,
  Mail,
  Phone,
  Map,
  Navigation,
  Compass,
  Flag,
  Tag,
  Hash,
  AtSign,
  DollarSign,
  CreditCard,
  Wallet,
  PiggyBank,
  TrendingDown,
  Calendar as CalendarIcon,
  Clock3,
  Timer,
  Stopwatch,
  Hourglass,
  Play,
  Pause,
  Square,
  RotateCcw,
  RotateCw,
  Maximize,
  Minimize,
  Move,
  Grip,
  Drag,
  MousePointer,
  Hand,
  Fingerprint,
  Scan,
  QrCode,
  Barcode,
  Camera,
  Video,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Headphones,
  Speaker,
  Radio,
  Bluetooth,
  BluetoothOff,
  Battery,
  BatteryLow,
  BatteryCharging,
  Power,
  PowerOff
} from 'lucide-react';
import { useSecurityAudit } from '../hooks/useSecurityAudit';
import { useIsAdmin } from '../hooks/useRBACConsolidated';
import { useRealTimeInsights } from '../hooks/useRealTimeInsights';
import CommunityInsightsDashboard from '../components/CommunityInsightsDashboard';
import { CommunityInsightsEnhanced } from '../components/CommunityInsightsEnhanced';
import { motion } from 'framer-motion';

interface ConnectionStatus {
  isConnected: boolean;
  lastUpdated?: Date;
  healthCheck: boolean;
  error?: string;
}

interface InsightsData {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalEvents: number;
  totalCommunities: number;
  engagementRate: number;
  growthRate: number;
  topCommunities: Array<{
    id: string;
    name: string;
    members: number;
    growth: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
  }>;
}

const ConsolidatedCommunityInsights: React.FC = () => {
  const { logAccessAttempt } = useSecurityAudit();
  const { isAdmin } = useIsAdmin();
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval] = useState(30000); // 30 seconds
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    healthCheck: false
  });
  const [insightsData, setInsightsData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Enhanced real-time insights hook
  const {
    data,
    loading: realTimeLoading,
    error: realTimeError,
    isConnected,
    refresh,
    checkConnection,
    lastUpdated
  } = useRealTimeInsights({
    timePeriod: 'week',
    autoRefresh,
    refreshInterval
  });

  // Enhanced connection status management
  useEffect(() => {
    setConnectionStatus({
      isConnected,
      lastUpdated,
      healthCheck: isConnected && !realTimeError,
      error: realTimeError || undefined
    });
  }, [isConnected, lastUpdated, realTimeError]);

  // Enhanced data processing
  useEffect(() => {
    if (data) {
      const processedData: InsightsData = {
        totalUsers: data.totalUsers || 0,
        activeUsers: data.activeUsers || 0,
        totalPosts: data.totalPosts || 0,
        totalEvents: data.totalEvents || 0,
        totalCommunities: data.totalCommunities || 0,
        engagementRate: data.engagementRate || 0,
        growthRate: data.growthRate || 0,
        topCommunities: data.topCommunities || [],
        recentActivity: data.recentActivity || []
      };
      setInsightsData(processedData);
    }
  }, [data]);

  // Enhanced loading state management
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Log access attempt when component mounts
  useEffect(() => {
    logAccessAttempt('/community-insights', isAdmin, {
      page: 'ConsolidatedCommunityInsights',
      timestamp: new Date().toISOString()
    });
  }, [logAccessAttempt, isAdmin]);

  // Enhanced connection check
  const handleConnectionCheck = async () => {
    const result = await checkConnection();
    if (result.healthy) {
      console.log('✅ Connection healthy');
    } else {
      console.error('❌ Connection issues:', result.error);
    }
  };

  // Enhanced refresh functionality
  const handleRefresh = async () => {
    try {
      await refresh();
      setError(null);
    } catch (err) {
      setError('Failed to refresh data');
    }
  };

  // Enhanced auto-refresh toggle
  const handleAutoRefreshToggle = (enabled: boolean) => {
    setAutoRefresh(enabled);
  };

  // Fallback component for unauthorized users
  const UnauthorizedAccess = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Access Restricted
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-4">
            <p className="text-gray-600">
              This page contains sensitive community insights and analytics that are only available to administrators and super administrators.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Admin privileges required</span>
            </div>
            <p className="text-xs text-gray-400">
              If you believe you should have access to this page, please contact your system administrator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Loading component
  const LoadingAccess = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access permissions...</p>
        </CardContent>
      </Card>
    </div>
  );

  // Enhanced main content
  const MainContent = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Connection Status Bar */}
      <div className={`px-4 py-2 text-sm ${
        connectionStatus.isConnected 
          ? 'bg-green-50 text-green-800 border-b border-green-200' 
          : 'bg-red-50 text-red-800 border-b border-red-200'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {connectionStatus.isConnected ? (
              <>
                <Wifi className="w-4 h-4" />
                <span>Real-time connection active</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span>Real-time connection inactive</span>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {connectionStatus.lastUpdated && (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Last update: {connectionStatus.lastUpdated.toLocaleTimeString()}</span>
              </div>
            )}
            
            <button
              onClick={handleConnectionCheck}
              className="flex items-center space-x-1 px-2 py-1 rounded text-xs hover:bg-white hover:bg-opacity-20"
            >
              <Database className="w-3 h-3" />
              <span>Check Connection</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Status Cards */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Connection Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-4 rounded-lg shadow-sm border"
          >
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${
                connectionStatus.isConnected ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {connectionStatus.isConnected ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Connection</p>
                <p className={`text-lg font-semibold ${
                  connectionStatus.isConnected ? 'text-green-600' : 'text-red-600'
                }`}>
                  {connectionStatus.isConnected ? 'Connected' : 'Disconnected'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Auto-refresh Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white p-4 rounded-lg shadow-sm border"
          >
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${
                autoRefresh ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <Activity className={`w-5 h-5 ${
                  autoRefresh ? 'text-blue-600' : 'text-gray-600'
                }`} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Auto-refresh</p>
                <p className={`text-lg font-semibold ${
                  autoRefresh ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {autoRefresh ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Data Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white p-4 rounded-lg shadow-sm border"
          >
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${
                insightsData && !realTimeLoading ? 'bg-green-100' : realTimeLoading ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <Database className={`w-5 h-5 ${
                  insightsData && !realTimeLoading ? 'text-green-600' : realTimeLoading ? 'text-yellow-600' : 'text-red-600'
                }`} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Data Status</p>
                <p className={`text-lg font-semibold ${
                  realTimeLoading ? 'text-yellow-600' : insightsData ? 'text-green-600' : 'text-red-600'
                }`}>
                  {realTimeLoading ? 'Loading...' : insightsData ? 'Ready' : 'Error'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Main Dashboard */}
      <div className="max-w-7xl mx-auto">
        {error ? (
          <div className="px-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center">
                <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-red-800">Error Loading Data</h3>
                  <p className="text-red-700 mt-1">{error}</p>
                  <button
                    onClick={handleRefresh}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Enhanced Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="flex items-center justify-between">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger value="overview" className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="realtime" className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Real-time
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Analytics
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="auto-refresh">Auto-refresh</Label>
                    <Switch
                      id="auto-refresh"
                      checked={autoRefresh}
                      onCheckedChange={handleAutoRefreshToggle}
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={handleRefresh}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>

              <TabsContent value="overview" className="space-y-6">
                <CommunityInsightsDashboard />
              </TabsContent>

              <TabsContent value="realtime" className="space-y-6">
                <CommunityInsightsEnhanced className="max-w-none" />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        User Analytics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {insightsData ? (
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Total Users</span>
                            <span className="text-lg font-bold">{insightsData.totalUsers.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Active Users</span>
                            <span className="text-lg font-bold text-green-600">{insightsData.activeUsers.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Growth Rate</span>
                            <span className="text-lg font-bold text-blue-600">+{insightsData.growthRate}%</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                          <p className="text-gray-600">Loading analytics...</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        Engagement Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {insightsData ? (
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Total Posts</span>
                            <span className="text-lg font-bold">{insightsData.totalPosts.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Total Events</span>
                            <span className="text-lg font-bold">{insightsData.totalEvents.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Engagement Rate</span>
                            <span className="text-lg font-bold text-purple-600">{insightsData.engagementRate}%</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                          <p className="text-gray-600">Loading metrics...</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <RoleGuard
      requireAdmin={true}
      fallback={<UnauthorizedAccess />}
      loading={<LoadingAccess />}
    >
      <MainContent />
    </RoleGuard>
  );
};

export default ConsolidatedCommunityInsights;
