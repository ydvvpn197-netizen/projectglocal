// Simplified news component to avoid React error #306
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  RefreshCw, 
  Clock, 
  TrendingUp, 
  Heart, 
  MessageCircle, 
  Share2, 
  BarChart3,
  Globe,
  Loader2
} from 'lucide-react';

interface SimpleNewsProps {
  className?: string;
}

export const SimpleNews: React.FC<SimpleNewsProps> = ({ className }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
      // Mock articles for demonstration
      setArticles([
        {
          id: '1',
          title: 'Local Community Event This Weekend',
          summary: 'Join us for a community gathering featuring local artists and food vendors.',
          source: 'Local News',
          publishedAt: new Date().toISOString(),
          imageUrl: null,
          city: 'Delhi',
          country: 'India'
        },
        {
          id: '2',
          title: 'New Infrastructure Development Announced',
          summary: 'City officials announce plans for improved public transportation.',
          source: 'City News',
          publishedAt: new Date(Date.now() - 3600000).toISOString(),
          imageUrl: null,
          city: 'Delhi',
          country: 'India'
        }
      ]);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className={`container mx-auto px-4 py-8 ${className}`}>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Local News
              </h1>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>Delhi, India</span>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
                    <div className="flex gap-2 mt-3">
                      <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`container mx-auto px-4 py-8 ${className}`}>
        <Alert>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Local News
            </h1>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>Delhi, India</span>
            </div>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* News Articles */}
      <div className="space-y-6">
        {articles.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Globe className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No news found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try refreshing or check back later for updates.
              </p>
            </CardContent>
          </Card>
        ) : (
          articles.map((article) => (
            <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2 line-clamp-2">
                      {article.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{article.source}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {article.city}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {article.summary}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-600">
                      <Heart className="h-4 w-4 mr-1" />
                      Like
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Comment
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-green-600">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-purple-600">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Poll
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
