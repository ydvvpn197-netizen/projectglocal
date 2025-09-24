import React from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Globe, Star, ArrowUpRight, RefreshCw } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { PlatformAnalyticsService } from '@/services/platformAnalyticsService';

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  isLoading?: boolean;
}

const StatItem: React.FC<StatItemProps> = ({ icon, label, value, change, isLoading = false }) => {
  const analyticsService = new PlatformAnalyticsService();
  const isPositiveChange = change.startsWith('+') || change === '0%';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <div className="flex items-center justify-center mb-2">
        {icon}
      </div>
      <div className="text-3xl font-bold text-primary">
        {isLoading ? (
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          value
        )}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div 
        className={`text-xs flex items-center justify-center mt-1 ${
          isPositiveChange ? 'text-green-600' : 'text-red-600'
        }`}
      >
        <ArrowUpRight className={`h-3 w-3 mr-1 ${!isPositiveChange ? 'rotate-90' : ''}`} />
        {isLoading ? '...' : change}
      </div>
    </motion.div>
  );
};

interface DynamicStatsProps {
  refreshInterval?: number;
  showRefreshButton?: boolean;
}

export const DynamicStats: React.FC<DynamicStatsProps> = ({ 
  refreshInterval = 30000,
  showRefreshButton = false 
}) => {
  const { stats, loading, error, lastRefresh, refresh } = useDashboardStats(refreshInterval);
  const analyticsService = new PlatformAnalyticsService();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Default values when loading or error
  const defaultStats = {
    activeUsers: '12,847',
    eventsCreated: '1,234',
    communities: '456',
    artists: '789'
  };

  const defaultChanges = {
    activeUsers: '+12%',
    eventsCreated: '+8%',
    communities: '+15%',
    artists: '+23%'
  };

  const statsData = [
    {
      label: 'Active Users',
      value: stats ? analyticsService.formatNumber(stats.current.activeUsers) : defaultStats.activeUsers,
      change: stats ? analyticsService.formatPercentageChange(stats.dailyChange.activeUsers) : defaultChanges.activeUsers,
      icon: <Users className="h-5 w-5" />
    },
    {
      label: 'Events Created',
      value: stats ? analyticsService.formatNumber(stats.current.eventsCreated) : defaultStats.eventsCreated,
      change: stats ? analyticsService.formatPercentageChange(stats.dailyChange.eventsCreated) : defaultChanges.eventsCreated,
      icon: <Calendar className="h-5 w-5" />
    },
    {
      label: 'Communities',
      value: stats ? analyticsService.formatNumber(stats.current.communities) : defaultStats.communities,
      change: stats ? analyticsService.formatPercentageChange(stats.dailyChange.communities) : defaultChanges.communities,
      icon: <Globe className="h-5 w-5" />
    },
    {
      label: 'Artists',
      value: stats ? analyticsService.formatNumber(stats.current.artists) : defaultStats.artists,
      change: stats ? analyticsService.formatPercentageChange(stats.dailyChange.artists) : defaultChanges.artists,
      icon: <Star className="h-5 w-5" />
    }
  ];

  return (
    <div className="w-full">
      {showRefreshButton && (
        <div className="flex justify-end mb-4">
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>
              {loading ? 'Refreshing...' : 'Refresh'}
            </span>
          </button>
        </div>
      )}
      
      {error && (
        <div className="text-center text-red-600 text-sm mb-4">
          {error}
        </div>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-8"
      >
        {statsData.map((stat, index) => (
          <motion.div key={index} variants={itemVariants}>
            <StatItem
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              change={stat.change}
              isLoading={loading}
            />
          </motion.div>
        ))}
      </motion.div>

      {lastRefresh && (
        <div className="text-center text-xs text-muted-foreground mt-4">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};
