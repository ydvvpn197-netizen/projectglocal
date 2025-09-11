import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Flag, 
  Users, 
  MapPin, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  Building2,
  Megaphone,
  Vote,
  Tag,
  Send,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  Eye,
  ExternalLink,
  Filter,
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  Star,
  Award,
  Shield,
  UserCheck,
  Globe,
  Target,
  Zap
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface PublicSquareNewsProps {
  className?: string;
}

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  source: string;
  url: string;
  image_url?: string;
  published_at: string;
  category: string;
  location: string;
  tags: string[];
  engagement_score: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_liked?: boolean;
  is_bookmarked?: boolean;
  government_tags?: string[];
  community_impact_score?: number;
  verified_facts?: boolean;
  fact_check_status?: 'verified' | 'disputed' | 'pending';
}

interface CommunityDiscussion {
  id: string;
  article_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
  likes_count: number;
  replies_count: number;
  is_liked?: boolean;
  replies?: CommunityDiscussion[];
  is_government_response?: boolean;
  government_authority?: string;
}

interface GovernmentTag {
  id: string;
  name: string;
  department: string;
  contact_info: string;
  response_rate: number;
  verified: boolean;
}

const PublicSquareNews: React.FC<PublicSquareNewsProps> = ({ className }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { location } = useLocation();
  
  const [activeTab, setActiveTab] = useState<'trending' | 'latest' | 'community' | 'government'>('trending');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [discussions, setDiscussions] = useState<CommunityDiscussion[]>([]);
  const [governmentTags, setGovernmentTags] = useState<GovernmentTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [showGovernmentTag, setShowGovernmentTag] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState('');
  const [selectedGovernmentTag, setSelectedGovernmentTag] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set());

  // Load news articles
  const loadArticles = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('news_articles')
        .select(`
          *,
          news_article_interactions!left(
            user_id,
            interaction_type,
            created_at
          )
        `)
        .order('published_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const processedArticles = data?.map(article => ({
        ...article,
        is_liked: article.news_article_interactions?.some(
          (interaction: { user_id: string; interaction_type: string }) => interaction.user_id === user?.id && interaction.interaction_type === 'like'
        ),
        is_bookmarked: article.news_article_interactions?.some(
          (interaction: { user_id: string; interaction_type: string }) => interaction.user_id === user?.id && interaction.interaction_type === 'bookmark'
        ),
        likes_count: article.news_article_interactions?.filter(
          (interaction: { interaction_type: string }) => interaction.interaction_type === 'like'
        ).length || 0,
        comments_count: article.news_article_interactions?.filter(
          (interaction: { interaction_type: string }) => interaction.interaction_type === 'comment'
        ).length || 0,
        shares_count: article.news_article_interactions?.filter(
          (interaction: { interaction_type: string }) => interaction.interaction_type === 'share'
        ).length || 0,
      })) || [];

      setArticles(processedArticles);
    } catch (error) {
      console.error('Error loading articles:', error);
      toast({
        title: "Error",
        description: "Failed to load news articles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Load government tags
  const loadGovernmentTags = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('government_authorities')
        .select('*')
        .eq('verified', true)
        .order('response_rate', { ascending: false });

      if (error) throw error;
      setGovernmentTags(data || []);
    } catch (error) {
      console.error('Error loading government tags:', error);
    }
  }, []);

  // Load community discussions
  const loadDiscussions = useCallback(async (articleId: string) => {
    try {
      const { data, error } = await supabase
        .from('community_discussions')
        .select(`
          *,
          profiles!left(
            full_name,
            avatar_url
          ),
          community_discussion_replies!left(
            *,
            profiles!left(
              full_name,
              avatar_url
            )
          )
        `)
        .eq('article_id', articleId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedDiscussions = data?.map(discussion => ({
        ...discussion,
        user_name: discussion.profiles?.full_name || 'Anonymous',
        user_avatar: discussion.profiles?.avatar_url,
        replies: discussion.community_discussion_replies?.map((reply: any) => ({
          ...reply,
          user_name: reply.profiles?.full_name || 'Anonymous',
          user_avatar: reply.profiles?.avatar_url,
        })) || [],
      })) || [];

      setDiscussions(processedDiscussions);
    } catch (error) {
      console.error('Error loading discussions:', error);
    }
  }, []);

  useEffect(() => {
    loadArticles();
    loadGovernmentTags();
  }, [loadArticles, loadGovernmentTags]);

  const handleLike = async (articleId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like articles",
        variant: "destructive",
      });
      return;
    }

    try {
      const article = articles.find(a => a.id === articleId);
      const isLiked = article?.is_liked;

      if (isLiked) {
        // Remove like
        await supabase
          .from('news_article_interactions')
          .delete()
          .eq('article_id', articleId)
          .eq('user_id', user.id)
          .eq('interaction_type', 'like');
      } else {
        // Add like
        await supabase
          .from('news_article_interactions')
          .insert({
            article_id: articleId,
            user_id: user.id,
            interaction_type: 'like'
          });
      }

      // Update local state
      setArticles(prev => prev.map(article => 
        article.id === articleId 
          ? { 
              ...article, 
              is_liked: !isLiked,
              likes_count: isLiked ? article.likes_count - 1 : article.likes_count + 1
            }
          : article
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    }
  };

  const handleBookmark = async (articleId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to bookmark articles",
        variant: "destructive",
      });
      return;
    }

    try {
      const article = articles.find(a => a.id === articleId);
      const isBookmarked = article?.is_bookmarked;

      if (isBookmarked) {
        await supabase
          .from('news_article_interactions')
          .delete()
          .eq('article_id', articleId)
          .eq('user_id', user.id)
          .eq('interaction_type', 'bookmark');
      } else {
        await supabase
          .from('news_article_interactions')
          .insert({
            article_id: articleId,
            user_id: user.id,
            interaction_type: 'bookmark'
          });
      }

      setArticles(prev => prev.map(article => 
        article.id === articleId 
          ? { ...article, is_bookmarked: !isBookmarked }
          : article
      ));
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleShare = async (article: NewsArticle) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: article.url,
        });
      } else {
        await navigator.clipboard.writeText(article.url);
        toast({
          title: "Link copied",
          description: "Article link copied to clipboard",
        });
      }

      // Track share
      if (user) {
        await supabase
          .from('news_article_interactions')
          .insert({
            article_id: article.id,
            user_id: user.id,
            interaction_type: 'share'
          });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleStartDiscussion = async () => {
    if (!user || !selectedArticle || !newDiscussion.trim()) {
      return;
    }

    try {
      const { error } = await supabase
        .from('community_discussions')
        .insert({
          article_id: selectedArticle.id,
          user_id: user.id,
          content: newDiscussion.trim(),
          is_government_response: false
        });

      if (error) throw error;

      setNewDiscussion('');
      loadDiscussions(selectedArticle.id);
      toast({
        title: "Discussion started",
        description: "Your discussion has been posted",
      });
    } catch (error) {
      console.error('Error creating discussion:', error);
      toast({
        title: "Error",
        description: "Failed to start discussion",
        variant: "destructive",
      });
    }
  };

  const handleTagGovernment = async () => {
    if (!user || !selectedArticle || !selectedGovernmentTag) {
      return;
    }

    try {
      const { error } = await supabase
        .from('government_article_tags')
        .insert({
          article_id: selectedArticle.id,
          government_authority_id: selectedGovernmentTag,
          tagged_by: user.id,
          status: 'pending'
        });

      if (error) throw error;

      setSelectedGovernmentTag('');
      setShowGovernmentTag(false);
      toast({
        title: "Government tagged",
        description: "The relevant authority has been notified",
      });
    } catch (error) {
      console.error('Error tagging government:', error);
      toast({
        title: "Error",
        description: "Failed to tag government authority",
        variant: "destructive",
      });
    }
  };

  const toggleArticleExpansion = (articleId: string) => {
    setExpandedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || article.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'community': 'bg-blue-100 text-blue-800',
      'infrastructure': 'bg-orange-100 text-orange-800',
      'arts': 'bg-purple-100 text-purple-800',
      'environment': 'bg-green-100 text-green-800',
      'technology': 'bg-indigo-100 text-indigo-800',
      'business': 'bg-yellow-100 text-yellow-800',
      'health': 'bg-red-100 text-red-800',
      'government': 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getImpactScore = (article: NewsArticle) => {
    const baseScore = article.engagement_score || 0;
    const governmentTags = article.government_tags?.length || 0;
    const communityImpact = article.community_impact_score || 0;
    return Math.min(100, baseScore + (governmentTags * 10) + communityImpact);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Digital Public Square
          </h1>
          <p className="text-muted-foreground mt-1">
            Stay informed, engage with your community, and connect with local authorities
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {location?.city || 'Your City'}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {articles.length} Articles
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search news, discussions, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="community">Community</SelectItem>
            <SelectItem value="infrastructure">Infrastructure</SelectItem>
            <SelectItem value="arts">Arts & Culture</SelectItem>
            <SelectItem value="environment">Environment</SelectItem>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="health">Health</SelectItem>
            <SelectItem value="government">Government</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="latest" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Latest
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Community
          </TabsTrigger>
          <TabsTrigger value="government" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Government
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredArticles.map((article) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={getCategoryColor(article.category)}>
                              {article.category}
                            </Badge>
                            {article.government_tags && article.government_tags.length > 0 && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                Government Tagged
                              </Badge>
                            )}
                            {article.verified_facts && (
                              <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800">
                                <Shield className="h-3 w-3" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          
                          <CardTitle className="text-lg leading-tight">
                            {article.title}
                          </CardTitle>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {article.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              Impact: {getImpactScore(article)}%
                            </div>
                          </div>
                        </div>
                        
                        {article.image_url && (
                          <div className="w-24 h-16 rounded-lg overflow-hidden bg-muted">
                            <img
                              src={article.image_url}
                              alt={article.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <CardDescription className="text-base">
                        {expandedArticles.has(article.id) ? article.content : article.summary}
                      </CardDescription>
                      
                      {article.content.length > article.summary.length && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleArticleExpansion(article.id)}
                          className="p-0 h-auto text-blue-600 hover:text-blue-800"
                        >
                          {expandedArticles.has(article.id) ? (
                            <>
                              <ChevronUp className="h-4 w-4 mr-1" />
                              Show less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-1" />
                              Read more
                            </>
                          )}
                        </Button>
                      )}
                      
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(article.id)}
                            className={`flex items-center gap-2 ${article.is_liked ? 'text-red-600' : 'text-muted-foreground'}`}
                          >
                            <Heart className={`h-4 w-4 ${article.is_liked ? 'fill-current' : ''}`} />
                            {article.likes_count}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedArticle(article);
                              setShowDiscussion(true);
                              loadDiscussions(article.id);
                            }}
                            className="flex items-center gap-2 text-muted-foreground"
                          >
                            <MessageCircle className="h-4 w-4" />
                            {article.comments_count}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare(article)}
                            className="flex items-center gap-2 text-muted-foreground"
                          >
                            <Share2 className="h-4 w-4" />
                            {article.shares_count}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleBookmark(article.id)}
                            className={`flex items-center gap-2 ${article.is_bookmarked ? 'text-blue-600' : 'text-muted-foreground'}`}
                          >
                            <Bookmark className={`h-4 w-4 ${article.is_bookmarked ? 'fill-current' : ''}`} />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedArticle(article);
                              setShowGovernmentTag(true);
                            }}
                            className="flex items-center gap-2"
                          >
                            <Flag className="h-4 w-4" />
                            Tag Authority
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedArticle(article);
                              setShowDiscussion(true);
                              loadDiscussions(article.id);
                            }}
                            className="flex items-center gap-2"
                          >
                            <Megaphone className="h-4 w-4" />
                            Discuss
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Community Discussion Dialog */}
      <Dialog open={showDiscussion} onOpenChange={setShowDiscussion}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Community Discussion</DialogTitle>
            <DialogDescription>
              {selectedArticle?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* New Discussion Form */}
            <div className="space-y-2">
              <Textarea
                placeholder="Share your thoughts, ask questions, or start a discussion..."
                value={newDiscussion}
                onChange={(e) => setNewDiscussion(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-end">
                <Button onClick={handleStartDiscussion} disabled={!newDiscussion.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Post Discussion
                </Button>
              </div>
            </div>
            
            <Separator />
            
            {/* Existing Discussions */}
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {discussions.map((discussion) => (
                  <Card key={discussion.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={discussion.user_avatar} />
                          <AvatarFallback>
                            {discussion.user_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {discussion.user_name}
                            </span>
                            {discussion.is_government_response && (
                              <Badge variant="default" className="bg-blue-100 text-blue-800">
                                <Building2 className="h-3 w-3 mr-1" />
                                {discussion.government_authority}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          
                          <p className="text-sm">{discussion.content}</p>
                          
                          <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              {discussion.likes_count}
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <MessageCircle className="h-3 w-3 mr-1" />
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Government Tag Dialog */}
      <Dialog open={showGovernmentTag} onOpenChange={setShowGovernmentTag}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tag Government Authority</DialogTitle>
            <DialogDescription>
              Select the relevant government department or authority for this article
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Select value={selectedGovernmentTag} onValueChange={setSelectedGovernmentTag}>
              <SelectTrigger>
                <SelectValue placeholder="Select government authority" />
              </SelectTrigger>
              <SelectContent>
                {governmentTags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id}>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{tag.name}</div>
                        <div className="text-xs text-muted-foreground">{tag.department}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowGovernmentTag(false)}>
                Cancel
              </Button>
              <Button onClick={handleTagGovernment} disabled={!selectedGovernmentTag}>
                <Flag className="h-4 w-4 mr-2" />
                Tag Authority
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PublicSquareNews;
