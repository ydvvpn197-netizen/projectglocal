import React, { useState, useEffect, useCallback } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  MessageSquare, 
  Heart,
  BarChart3,
  Brain,
  Target,
  Calendar,
  MapPin,
  Filter,
  RefreshCw,
  Zap
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface SentimentData {
  total_analyses: number;
  average_sentiment: number;
  sentiment_distribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  sentiment_evolution: Array<{
    date: string;
    average_sentiment: number;
    count: number;
  }>;
}

interface TrendData {
  trend_type: string;
  trend_name: string;
  trend_description?: string;
  trend_score: number;
  trend_direction: 'rising' | 'falling' | 'stable';
  confidence_level: number;
}

interface PredictionData {
  prediction_type: string;
  prediction_target: string;
  predicted_value: number;
  confidence_score: number;
  prediction_horizon: string;
  prediction_date: string;
}

interface CommunityInsightsEnhancedProps {
  className?: string;
}

export const CommunityInsightsEnhanced: React.FC<CommunityInsightsEnhancedProps> = ({ 
  className = '' 
}) => {
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [predictionData, setPredictionData] = useState<PredictionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<'day' | 'week' | 'month'>('week');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadInsightsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Dynamically import optimized services
      const [
        { optimizedSentimentService },
        { optimizedTrendService }
      ] = await Promise.all([
        import('../services/optimizedSentimentService'),
        import('../services/optimizedTrendService')
      ]);

      // Load data in parallel
      const [sentiment, trends, predictions] = await Promise.all([
        optimizedSentimentService.getCommunitySentimentSummary(timePeriod),
        optimizedTrendService.analyzeTrends(timePeriod),
        optimizedTrendService.generatePredictions('engagement', 'short')
      ]);

      setSentimentData(sentiment);
      setTrendData(trends);
      setPredictionData(predictions);
      setLastUpdated(new Date());

    } catch (err) {
      console.error('Error loading insights data:', err);
      setError('Failed to load insights data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [timePeriod]);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadInsightsData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, loadInsightsData]);

  useEffect(() => {
    loadInsightsData();
  }, [loadInsightsData]);

  // Chart configurations
  const sentimentEvolutionChart = {
    labels: sentimentData?.sentiment_evolution.map(item => 
      new Date(item.date).toLocaleDateString()
    ) || [],
    datasets: [
      {
        label: 'Sentiment Score',
        data: sentimentData?.sentiment_evolution.map(item => item.average_sentiment) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const sentimentDistributionChart = {
    labels: ['Positive', 'Negative', 'Neutral'],
    datasets: [
      {
        data: sentimentData ? [
          sentimentData.sentiment_distribution.positive,
          sentimentData.sentiment_distribution.negative,
          sentimentData.sentiment_distribution.neutral
        ] : [],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(107, 114, 128, 0.8)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
          'rgb(107, 114, 128)'
        ],
        borderWidth: 2,
      },
    ],
  };

  const trendsChart = {
    labels: trendData.map(trend => trend.trend_name),
    datasets: [
      {
        label: 'Trend Score',
        data: trendData.map(trend => Math.abs(trend.trend_score)),
        backgroundColor: trendData.map(trend => 
          trend.trend_direction === 'rising' ? 'rgba(34, 197, 94, 0.8)' :
          trend.trend_direction === 'falling' ? 'rgba(239, 68, 68, 0.8)' :
          'rgba(107, 114, 128, 0.8)'
        ),
        borderColor: trendData.map(trend => 
          trend.trend_direction === 'rising' ? 'rgb(34, 197, 94)' :
          trend.trend_direction === 'falling' ? 'rgb(239, 68, 68)' :
          'rgb(107, 114, 128)'
        ),
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${context.parsed}%`;
          }
        }
      }
    },
  };

  // Helper functions
  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.1) return 'text-green-600';
    if (sentiment < -0.1) return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'rising':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'falling':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'rising':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'falling':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading community insights...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 mr-2">⚠️</div>
            <div>
              <p className="text-red-800 font-medium">Error Loading Data</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button
                onClick={loadInsightsData}
                className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Brain className="w-6 h-6 mr-2 text-blue-600" />
            Community Insights Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time AI-powered analysis of community sentiment, trends, and predictions
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <div className="flex items-center">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center px-3 py-2 text-sm rounded-md border ${
                autoRefresh 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-gray-50 text-gray-700 border-gray-200'
              }`}
            >
              <Zap className={`w-4 h-4 mr-1 ${autoRefresh ? 'text-green-600' : 'text-gray-500'}`} />
              Auto-refresh
            </button>
          </div>

          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value as 'day' | 'week' | 'month')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="day">Last 24 Hours</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
          
          <button
            onClick={loadInsightsData}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Analyses</p>
              <p className="text-2xl font-bold text-gray-900">
                {sentimentData?.total_analyses?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Heart className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Sentiment</p>
              <p className={`text-2xl font-bold ${getSentimentColor(sentimentData?.average_sentiment || 0)}`}>
                {sentimentData?.average_sentiment ? 
                  (sentimentData.average_sentiment * 100).toFixed(1) + '%' : '0%'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Trends</p>
              <p className="text-2xl font-bold text-gray-900">
                {trendData.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">AI Predictions</p>
              <p className="text-2xl font-bold text-gray-900">
                {predictionData.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Evolution Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Sentiment Evolution
          </h3>
          <div className="h-64">
            <Line data={sentimentEvolutionChart} options={chartOptions} />
          </div>
        </div>

        {/* Sentiment Distribution Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-600" />
            Sentiment Distribution
          </h3>
          <div className="h-64">
            <Doughnut data={sentimentDistributionChart} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Trends Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
          Community Trends Analysis
        </h3>
        <div className="h-64 mb-4">
          <Bar data={trendsChart} options={chartOptions} />
        </div>
      </div>

      {/* Trends List */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trendData.map((trend, index) => (
            <div key={index} className={`p-4 border rounded-lg ${getTrendColor(trend.trend_direction)}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{trend.trend_name}</h4>
                {getTrendIcon(trend.trend_direction)}
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {trend.trend_description || `${trend.trend_name} analysis`}
              </p>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTrendColor(trend.trend_direction)}`}>
                  {trend.trend_direction}
                </span>
                <span className="text-sm text-gray-500">
                  {(trend.confidence_level * 100).toFixed(0)}% confidence
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Predictions Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-orange-600" />
          AI Predictions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {predictionData.map((prediction, index) => (
            <div key={index} className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{prediction.prediction_target}</h4>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                  {prediction.prediction_horizon}
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-600 mb-2">
                {typeof prediction.predicted_value === 'number' 
                  ? prediction.predicted_value.toFixed(2)
                  : prediction.predicted_value
                }
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Confidence: {(prediction.confidence_score * 100).toFixed(0)}%
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(prediction.prediction_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Community Health</h4>
            <p className="text-sm text-gray-600">
              {sentimentData?.average_sentiment && sentimentData.average_sentiment > 0.1 
                ? '🟢 Community sentiment is positive and healthy'
                : sentimentData?.average_sentiment && sentimentData.average_sentiment < -0.1
                ? '🔴 Community sentiment needs attention'
                : '🟡 Community sentiment is neutral'
              }
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Trend Analysis</h4>
            <p className="text-sm text-gray-600">
              📈 {trendData.filter(t => t.trend_direction === 'rising').length} rising trends, {' '}
              📉 {trendData.filter(t => t.trend_direction === 'falling').length} falling trends, {' '}
              ➡️ {trendData.filter(t => t.trend_direction === 'stable').length} stable trends
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityInsightsEnhanced;
