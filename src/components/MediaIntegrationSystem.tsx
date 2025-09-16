import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Camera, 
  Video, 
  Mic, 
  Image, 
  FileText, 
  Share2, 
  Download,
  Upload,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Crop,
  Filter,
  Edit,
  Trash2,
  Heart,
  MessageSquare,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Globe,
  Users,
  Star,
  TrendingUp,
  BarChart3,
  Activity,
  Target,
  Award
} from 'lucide-react';

interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  duration?: number;
  size: number;
  format: string;
  created_at: string;
  created_by: string;
  is_public: boolean;
  is_anonymous: boolean;
  views: number;
  likes: number;
  downloads: number;
  tags: string[];
  category: string;
  user_liked?: boolean;
  creator_name?: string;
}

interface MediaAnalytics {
  total_media: number;
  total_views: number;
  total_likes: number;
  total_downloads: number;
  popular_categories: Array<{ category: string; count: number }>;
  media_by_type: Array<{ type: string; count: number }>;
  recent_uploads: Array<{ date: string; count: number }>;
}

export const MediaIntegrationSystem: React.FC = () => {
  const { toast } = useToast();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [analytics, setAnalytics] = useState<MediaAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    loadMediaData();
  }, [loadMediaData]);

  const loadMediaData = useCallback(async () => {
    try {
      setLoading(true);
      // Load media items and analytics
      // Implementation would go here
    } catch (error) {
      console.error('Error loading media data:', error);
      toast({
        title: "Error",
        description: "Failed to load media data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Mic className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Media Integration System</h2>
            <p className="text-muted-foreground">Upload, manage, and share media content</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Media Integration System</h2>
          <p className="text-muted-foreground">Upload, manage, and share media content</p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Media
        </Button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Media</p>
                  <p className="text-2xl font-bold">{analytics.total_media}</p>
                </div>
                <Camera className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold text-blue-600">{analytics.total_views}</p>
                </div>
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Likes</p>
                  <p className="text-2xl font-bold text-red-600">{analytics.total_likes}</p>
                </div>
                <Heart className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Downloads</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.total_downloads}</p>
                </div>
                <Download className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="gallery" className="space-y-4">
        <TabsList>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mediaItems.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-0">
                  {/* Media Preview */}
                  <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
                    {item.type === 'image' && (
                      <img 
                        src={item.thumbnail || item.url} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {item.type === 'video' && (
                      <div className="w-full h-full flex items-center justify-center bg-black">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                    )}
                    {item.type === 'audio' && (
                      <div className="w-full h-full flex items-center justify-center">
                        <Mic className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    {item.type === 'document' && (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="secondary">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="secondary">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Type Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {getMediaIcon(item.type)}
                        {item.type}
                      </Badge>
                    </div>

                    {/* Duration for video/audio */}
                    {(item.type === 'video' || item.type === 'audio') && item.duration && (
                      <div className="absolute bottom-2 right-2">
                        <Badge variant="secondary">
                          {formatDuration(item.duration)}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Media Info */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-medium truncate">{item.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatFileSize(item.size)}</span>
                      <span>{item.format.toUpperCase()}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{item.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          <span>{item.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          <span>{item.downloads}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {item.is_public ? (
                          <Globe className="h-3 w-3 text-green-500" />
                        ) : (
                          <Lock className="h-3 w-3 text-gray-500" />
                        )}
                        {item.is_anonymous && (
                          <EyeOff className="h-3 w-3 text-gray-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div className="text-center py-8">
            <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Recent Uploads</h3>
            <p className="text-muted-foreground">Your recently uploaded media will appear here.</p>
          </div>
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Popular Media</h3>
            <p className="text-muted-foreground">Most viewed and liked media will appear here.</p>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {analytics && (
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Media Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.popular_categories.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="capitalize">{category.category}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full">
                            <div 
                              className="h-2 bg-primary rounded-full" 
                              style={{ width: `${(category.count / analytics.total_media) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">{category.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Media Types
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.media_by_type.map((type, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="capitalize flex items-center gap-2">
                          {getMediaIcon(type.type)}
                          {type.type}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full">
                            <div 
                              className="h-2 bg-primary rounded-full" 
                              style={{ width: `${(type.count / analytics.total_media) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">{type.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
