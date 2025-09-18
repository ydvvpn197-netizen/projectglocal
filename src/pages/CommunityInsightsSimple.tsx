import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  MessageSquare, 
  Heart,
  Brain,
  Target,
  Calendar,
  Filter
} from 'lucide-react';

interface MockInsightData {
  sentiment: {
    total_analyses: number;
    average_sentiment: number;
    sentiment_distribution: {
      positive: number;
      negative: number;
      neutral: number;
    };
  };
  trends: Array<{
    trend_name: string;
    trend_score: number;
    trend_direction: 'rising' | 'falling' | 'stable';
    confidence_level: number;
  }>;
  predictions: Array<{
    prediction_target: string;
    predicted_value: number;
    confidence_score: number;
    prediction_horizon: string;
    prediction_date: string;
  }>;
}

const CommunityInsightsSimple: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<'day' | 'week' | 'month'>('week');
  const [data, setData] = useState<MockInsightData | null>(null);

  useEffect(() => {
    const loadMockData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockData: MockInsightData = {
          sentiment: {
            total_analyses: 1247,
            average_sentiment: 0.15,
            sentiment_distribution: {
              positive: 65,
              negative: 20,
              neutral: 15
            }
          },
          trends: [
            {
              trend_name: 'Community Engagement',
              trend_score: 0.8,
              trend_direction: 'rising',
              confidence_level: 0.92
            },
            {
              trend_name: 'Local Events Interest',
              trend_score: 0.6,
              trend_direction: 'rising',
              confidence_level: 0.85
            },
            {
              trend_name: 'Discussion Activity',
              trend_score: -0.2,
              trend_direction: 'falling',
              confidence_level: 0.78
            }
          ],
          predictions: [
            {
              prediction_target: 'User Growth',
              predicted_value: 1.25,
              confidence_score: 0.88,
              prediction_horizon: 'short',
              prediction_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              prediction_target: 'Engagement Rate',
              predicted_value: 0.78,
              confidence_score: 0.82,
              prediction_horizon: 'medium',
              prediction_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        };
        
        setData(mockData);
      } catch (err) {
        console.error('Error loading mock data:', err);
        setError('Failed to load insights data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadMockData();
  }, [timePeriod]);

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
        return 'text-green-600 bg-green-50';
      case 'falling':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-600 mr-2">⚠️</div>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Brain className="w-6 h-6 mr-2 text-blue-600" />
              Community Insights Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              AI-powered analysis of community sentiment, trends, and predictions
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as 'day' | 'week' | 'month')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="day">Last 24 Hours</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
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
                  {data?.sentiment.total_analyses || 0}
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
                <p className={`text-2xl font-bold ${getSentimentColor(data?.sentiment.average_sentiment || 0)}`}>
                  {data?.sentiment.average_sentiment ? 
                    (data.sentiment.average_sentiment * 100).toFixed(1) + '%' : '0%'
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
                  {data?.trends.length || 0}
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
                <p className="text-sm font-medium text-gray-600">Predictions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data?.predictions.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sentiment Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Distribution</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {data?.sentiment.sentiment_distribution.positive || 0}%
              </div>
              <div className="text-sm text-gray-600">Positive</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {data?.sentiment.sentiment_distribution.negative || 0}%
              </div>
              <div className="text-sm text-gray-600">Negative</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {data?.sentiment.sentiment_distribution.neutral || 0}%
              </div>
              <div className="text-sm text-gray-600">Neutral</div>
            </div>
          </div>
        </div>

        {/* Trends Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Trends</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.trends.map((trend, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{trend.trend_name}</h4>
                  {getTrendIcon(trend.trend_direction)}
                </div>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(trend.trend_direction)}`}>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Predictions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.predictions.map((prediction, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{prediction.prediction_target}</h4>
                  <span className="text-xs text-gray-500">{prediction.prediction_horizon}</span>
                </div>
                <p className="text-2xl font-bold text-blue-600 mb-2">
                  {prediction.predicted_value.toFixed(2)}
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
                {data?.sentiment.average_sentiment && data.sentiment.average_sentiment > 0.1 
                  ? 'Community sentiment is positive and healthy'
                  : data?.sentiment.average_sentiment && data.sentiment.average_sentiment < -0.1
                  ? 'Community sentiment needs attention'
                  : 'Community sentiment is neutral'
                }
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Trend Analysis</h4>
              <p className="text-sm text-gray-600">
                {data?.trends.filter(t => t.trend_direction === 'rising').length || 0} rising trends, {' '}
                {data?.trends.filter(t => t.trend_direction === 'falling').length || 0} falling trends
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityInsightsSimple;
