/**
 * News Page - Updated with UnifiedPageTemplate
 * Displays local and community news
 */

import { useState } from "react";
import { UnifiedPageTemplate } from "@/components/layout/UnifiedPageTemplate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Newspaper, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Share2, 
  Bookmark,
  Filter,
  Search,
  RefreshCw,
  ExternalLink,
  Heart,
  MessageCircle
} from "lucide-react";
import { useNews } from "@/hooks/useNews";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  source: string;
  author?: string;
  published_at: string;
  image_url?: string;
  category: string;
  location?: string;
  url?: string;
  likes_count?: number;
  comments_count?: number;
}

const News = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock data - replace with actual hook data
  const mockArticles: NewsArticle[] = [
    {
      id: '1',
      title: 'New Community Center Opens Downtown',
      excerpt: 'Mayor announces the opening of a state-of-the-art community center with facilities for all ages.',
      source: 'Local News',
      author: 'John Smith',
      published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      image_url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&h=250&fit=crop',
      category: 'Community',
      location: 'Downtown',
      likes_count: 45,
      comments_count: 12
    },
    {
      id: '2',
      title: 'Local School Wins State Championship',
      excerpt: 'Lincoln High defeats rivals in thrilling final match, bringing home the trophy.',
      source: 'Sports Today',
      author: 'Jane Doe',
      published_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      image_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=250&fit=crop',
      category: 'Sports',
      location: 'East Side',
      likes_count: 128,
      comments_count: 34
    },
    {
      id: '3',
      title: 'City Council Approves New Park Development',
      excerpt: 'Plans for a 50-acre park on the north side receive unanimous approval.',
      source: 'City Hall News',
      published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Government',
      location: 'North Side',
      likes_count: 67,
      comments_count: 23
    }
  ];

  const [articles] = useState<NewsArticle[]>(mockArticles);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Set<string>>(new Set());

  const handleRefresh = () => {
    toast({
      title: "Refreshing news",
      description: "Loading latest articles...",
    });
  };

  const handleBookmark = (articleId: string) => {
    setBookmarkedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
        toast({ title: "Removed from bookmarks" });
      } else {
        newSet.add(articleId);
        toast({ title: "Added to bookmarks" });
      }
      return newSet;
    });
  };

  const categories = ['All', 'Community', 'Sports', 'Government', 'Business', 'Events'];
  
  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeTab === 'all' || 
      article.category.toLowerCase() === activeTab.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  const tabs = (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        {categories.map(category => (
          <TabsTrigger key={category} value={category.toLowerCase()}>
            {category}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );

  return (
    <UnifiedPageTemplate
      title="Local News"
      subtitle="Stay updated with your community"
      description="Latest news and updates from your local area"
      icon={Newspaper}
      badge={{ label: `${articles.length} Articles`, variant: "secondary" }}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "News" }
      ]}
      primaryAction={{
        label: "Refresh",
        icon: RefreshCw,
        onClick: handleRefresh,
        variant: "outline"
      }}
      secondaryActions={[
        {
          icon: Filter,
          onClick: () => toast({ title: "Filters coming soon" }),
          variant: "ghost"
        }
      ]}
      showRightSidebar={true}
      tabs={tabs}
    >
      <div className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Articles Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
          {filteredArticles.map((article) => (
            <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="flex flex-col sm:flex-row">
                {article.image_url && (
                  <div className="sm:w-48 h-48 sm:h-auto flex-shrink-0">
                    <img 
                      src={article.image_url} 
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary">{article.category}</Badge>
                          {article.location && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {article.location}
                            </span>
                          )}
                        </div>
                        <CardTitle className="text-xl hover:text-primary cursor-pointer transition-colors">
                          {article.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 text-xs">
                          <span className="font-medium">{article.source}</span>
                          {article.author && (
                            <>
                              <span>•</span>
                              <span>{article.author}</span>
                            </>
                          )}
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {article.excerpt}
                    </p>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Heart className="h-4 w-4" />
                          <span className="text-xs">{article.likes_count || 0}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <MessageCircle className="h-4 w-4" />
                          <span className="text-xs">{article.comments_count || 0}</span>
                        </Button>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleBookmark(article.id)}
                          className={bookmarkedArticles.has(article.id) ? "text-primary" : ""}
                        >
                          <Bookmark className={`h-4 w-4 ${bookmarkedArticles.has(article.id) ? 'fill-current' : ''}`} />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        {article.url && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={article.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Newspaper className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </UnifiedPageTemplate>
  );
};

export default News;