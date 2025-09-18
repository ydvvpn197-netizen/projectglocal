import React, { useState } from 'react';
import { CommunityInsightsEnhanced } from '../components/CommunityInsightsEnhanced';
import useRealTimeInsights from '../hooks/useRealTimeInsights';
import { 
  Wifi,
  WifiOff,
  Activity,
  Clock,
  Database,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const CommunityInsightsRealTime: React.FC = () => {
  const [timePeriod, setTimePeriod] = useState<'day' | 'week' | 'month'>('week');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval] = useState(30000); // 30 seconds

  const {
    data,
    loading,
    error,
    isConnected,
    refresh,
    checkConnection,
    lastUpdated
  } = useRealTimeInsights({
    timePeriod,
    autoRefresh,
    refreshInterval
  });

  const handleConnectionCheck = async () => {
    const result = await checkConnection();
    if (result.healthy) {
      console.log('✅ Connection healthy');
    } else {
      console.error('❌ Connection issues:', result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Connection Status Bar */}
      <div className={`px-4 py-2 text-sm ${
        isConnected 
          ? 'bg-green-50 text-green-800 border-b border-green-200' 
          : 'bg-red-50 text-red-800 border-b border-red-200'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isConnected ? (
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
            {lastUpdated && (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Last update: {lastUpdated.toLocaleTimeString()}</span>
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

      {/* Status Cards */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Connection Status */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${
                isConnected ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {isConnected ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Connection</p>
                <p className={`text-lg font-semibold ${
                  isConnected ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </p>
              </div>
            </div>
          </div>

          {/* Auto-refresh Status */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
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
          </div>

          {/* Data Status */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${
                data && !loading ? 'bg-green-100' : loading ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <Database className={`w-5 h-5 ${
                  data && !loading ? 'text-green-600' : loading ? 'text-yellow-600' : 'text-red-600'
                }`} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Data Status</p>
                <p className={`text-lg font-semibold ${
                  data && !loading ? 'text-green-600' : loading ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {loading ? 'Loading...' : data ? 'Ready' : 'Error'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
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
                    onClick={refresh}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <CommunityInsightsEnhanced className="max-w-none" />
        )}
      </div>
    </div>
  );
};

export default CommunityInsightsRealTime;
