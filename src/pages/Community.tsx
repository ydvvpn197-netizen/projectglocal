import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Plus, 
  Users, 
  MessageCircle, 
  Calendar, 
  MapPin, 
  Star, 
  Filter,
  Grid3X3,
  List,
  TrendingUp,
  Flame,
  Globe,
  Heart,
  Share2,
  MoreHorizontal,
  Settings,
  Crown,
  Shield,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";

// Sample community data
const communities = [
  {
    id: 1,
    name: "Local Artists Collective",
    description: "Supporting and promoting local artists in our community. Share your work, get feedback, and collaborate with fellow creatives.",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
    members: 234,
    posts: 156,
    category: "Arts & Culture",
    featured: true,
    verified: true,
    tags: ["art", "local", "creative", "exhibition"],
    recentActivity: "New exhibition announced",
    location: "Downtown",
    createdAt: "2024-01-15"
  },
  {
    id: 2,
    name: "Tech Enthusiasts",
    description: "Discussing the latest in technology and innovation. From startups to established companies, share insights and network.",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
    members: 189,
    posts: 89,
    category: "Technology",
    featured: false,
    verified: true,
    tags: ["tech", "innovation", "startup", "networking"],
    recentActivity: "Monthly meetup scheduled",
    location: "Tech District",
    createdAt: "2024-02-20"
  },
  {
    id: 3,
    name: "Food Lovers United",
    description: "Discovering and sharing the best local restaurants, recipes, and culinary experiences in our area.",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    members: 456,
    posts: 234,
    category: "Food & Dining",
    featured: true,
    verified: false,
    tags: ["food", "restaurants", "recipes", "local"],
    recentActivity: "New restaurant review posted",
    location: "Various",
    createdAt: "2023-11-10"
  },
  {
    id: 4,
    name: "Outdoor Adventures",
    description: "Exploring nature trails, parks, and outdoor activities. Perfect for hikers, cyclists, and nature enthusiasts.",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
    members: 123,
    posts: 67,
    category: "Outdoors",
    featured: false,
    verified: false,
    tags: ["outdoors", "hiking", "nature", "fitness"],
    recentActivity: "Weekend hike organized",
    location: "Regional Parks",
    createdAt: "2024-03-05"
  },
  {
    id: 5,
    name: "Book Club Central",
    description: "Monthly book discussions, reading challenges, and literary events. All genres welcome!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    members: 78,
    posts: 45,
    category: "Education",
    featured: false,
    verified: false,
    tags: ["books", "reading", "literature", "discussion"],
    recentActivity: "New book selection announced",
    location: "Library",
    createdAt: "2024-01-30"
  },
  {
    id: 6,
    name: "Local Business Network",
    description: "Connecting local business owners, entrepreneurs, and professionals for networking and collaboration.",
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop",
    members: 345,
    posts: 178,
    category: "Business",
    featured: true,
    verified: true,
    tags: ["business", "networking", "entrepreneurs", "local"],
    recentActivity: "Business mixer event",
    location: "Business District",
    createdAt: "2023-09-15"
  }
];

const categories = [
  "All Categories",
  "Arts & Culture",
  "Technology",
  "Food & Dining",
  "Outdoors",
  "Education",
  "Business",
  "Health & Wellness",
  "Sports",
  "Music",
  "Photography"
];

const Community = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("recent");

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         community.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         community.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "All Categories" || community.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedCommunities = [...filteredCommunities].sort((a, b) => {
    switch (sortBy) {
      case "members":
        return b.members - a.members;
      case "recent":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "activity":
        return b.posts - a.posts;
      default:
        return 0;
    }
  });

  const featuredCommunities = communities.filter(c => c.featured);

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Communities</h1>
            <p className="text-muted-foreground mt-2">
              Discover and join communities that match your interests
            </p>
          </div>
          <Button className="btn-community" asChild>
            <Link to="/community/create-group">
              <Plus className="w-4 h-4 mr-2" />
              Create Community
            </Link>
          </Button>
        </div>

        {/* Featured Communities Spotlight */}
        {featuredCommunities.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Featured Communities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCommunities.map((community) => (
                <Card key={community.id} className="community-card-featured group cursor-pointer hover:shadow-community transition-all duration-300">
                  <div className="relative">
                    <img 
                      src={community.image} 
                      alt={community.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      {community.verified && (
                        <Badge className="bg-blue-500 text-white">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      <Badge className="bg-yellow-500 text-white">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg">{community.name}</h3>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {community.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {community.members}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {community.posts}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {community.location}
                      </span>
                    </div>
                    <div className="flex gap-2 mb-3">
                      {community.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                    <Button className="w-full btn-community">
                      <Users className="w-4 h-4 mr-2" />
                      Join Community
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search communities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="members">Most Members</SelectItem>
                  <SelectItem value="activity">Most Active</SelectItem>
                </SelectContent>
              </Select>
              
              {/* View Mode Toggle */}
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Communities Grid/List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              All Communities ({sortedCommunities.length})
            </h2>
          </div>
          
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedCommunities.map((community) => (
                <Card key={community.id} className="community-card group cursor-pointer hover:shadow-community transition-all duration-300">
                  <div className="relative">
                    <img 
                      src={community.image} 
                      alt={community.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {community.verified && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-blue-500 text-white">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg">{community.name}</h3>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {community.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {community.members}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {community.posts}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {community.location}
                      </span>
                    </div>
                    <div className="flex gap-2 mb-3">
                      {community.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                    <Button className="w-full btn-community">
                      <Users className="w-4 h-4 mr-2" />
                      Join Community
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedCommunities.map((community) => (
                <Card key={community.id} className="community-card group cursor-pointer hover:shadow-community transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <img 
                        src={community.image} 
                        alt={community.name}
                        className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              {community.name}
                              {community.verified && (
                                <Badge className="bg-blue-500 text-white text-xs">
                                  <Shield className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {community.description}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {community.members} members
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {community.posts} posts
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {community.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(community.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            {community.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                          <Button className="btn-community">
                            <Users className="w-4 h-4 mr-2" />
                            Join Community
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Empty State */}
        {sortedCommunities.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No communities found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or create a new community
              </p>
              <Button className="btn-community">
                <Plus className="w-4 h-4 mr-2" />
                Create Community
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default Community;