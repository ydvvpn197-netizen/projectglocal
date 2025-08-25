import { useState, useEffect } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CommunityLeaderboard } from "@/components/CommunityLeaderboard";
import { CommunityFeaturesTest } from "@/components/CommunityFeaturesTest";
import { useCommunityGroups } from "@/hooks/useCommunityGroups";
import { useLocation } from "@/hooks/useLocation";
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
  Zap,
  Loader2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

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
  "Photography",
  "General"
];

const Community = () => {
  const navigate = useNavigate();
  const { groups, loading, fetchGroups, joinGroup, isGroupMember } = useCommunityGroups();
  const { currentLocation } = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("recent");

  // Fetch communities on component mount
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Filter communities based on search and category
  const filteredCommunities = groups.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (community.description && community.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "All Categories" || community.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort communities
  const sortedCommunities = [...filteredCommunities].sort((a, b) => {
    switch (sortBy) {
      case "members":
        return (b.member_count || 0) - (a.member_count || 0);
      case "recent":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "activity":
        return (b.post_count || 0) - (a.post_count || 0);
      default:
        return 0;
    }
  });

  // Get featured communities (communities with more than 10 members)
  const featuredCommunities = groups.filter(c => (c.member_count || 0) > 10);

  // Handle join community
  const handleJoinCommunity = async (groupId: string) => {
    try {
      await joinGroup(groupId);
      // Refresh the communities list
      fetchGroups();
    } catch (error) {
      console.error('Error joining community:', error);
    }
  };

  // Handle create community success
  const handleCreateCommunitySuccess = () => {
    // Refresh the communities list when a new community is created
    fetchGroups();
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading communities...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

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
            <Link to="/community/create-group" onClick={handleCreateCommunitySuccess}>
              <Plus className="w-4 h-4 mr-2" />
              Create Community
            </Link>
          </Button>
        </div>

        {/* Community Leaderboard */}
        <section className="space-y-4">
          <CommunityLeaderboard 
            className="mb-8"
            showTitle={true}
            defaultLimit={5}
            showFilters={true}
            showUserPosition={true}
          />
        </section>

        {/* Points Test Panel (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <section className="space-y-4">
            <CommunityFeaturesTest />
          </section>
        )}

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
                    <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                      <Users className="w-16 h-16 text-white opacity-80" />
                    </div>
                    <div className="absolute top-3 right-3 flex gap-2">
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
                      {community.description || "No description available"}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {community.member_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {community.post_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {community.location_city || "Local"}
                      </span>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs">
                        #{community.category}
                      </Badge>
                    </div>
                    <Button 
                      className="w-full btn-community"
                      onClick={() => handleJoinCommunity(community.id)}
                    >
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
                    <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                      <Users className="w-16 h-16 text-white opacity-80" />
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
                      {community.description || "No description available"}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {community.member_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {community.post_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {community.location_city || "Local"}
                      </span>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs">
                        #{community.category}
                      </Badge>
                    </div>
                    <Button 
                      className="w-full btn-community"
                      onClick={() => handleJoinCommunity(community.id)}
                    >
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
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="w-12 h-12 text-white opacity-80" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              {community.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {community.description || "No description available"}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {community.member_count || 0} members
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {community.post_count || 0} posts
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {community.location_city || "Local"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(community.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <Badge variant="secondary" className="text-xs">
                              #{community.category}
                            </Badge>
                          </div>
                          <Button 
                            className="btn-community"
                            onClick={() => handleJoinCommunity(community.id)}
                          >
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
              <Button className="btn-community" asChild>
                <Link to="/community/create-group">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Community
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default Community;