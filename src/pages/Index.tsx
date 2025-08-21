import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  MapPin, 
  Users, 
  Calendar, 
  Zap, 
  Sparkles
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ProjectGrid } from "@/components/ProjectGrid";
import { ProjectSidebar } from "@/components/ProjectSidebar";
import { ModernHeader } from "@/components/ModernHeader";

// Sample project data - in real app, this would come from your API
const sampleProjects = [
  {
    id: 1,
    title: "Local Art Exhibition",
    artist: "Sarah Chen",
    category: "Visual Arts",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
    likes: 186,
    views: 1634,
    featured: true,
    description: "A stunning collection of contemporary art pieces showcasing local talent.",
    tags: ["Contemporary", "Local Artists", "Exhibition"]
  },
  {
    id: 2,
    title: "Community Garden Project",
    artist: "Green Thumbs Collective",
    category: "Community",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
    likes: 443,
    views: 2452,
    featured: false,
    description: "Transforming urban spaces into vibrant community gardens.",
    tags: ["Urban", "Sustainability", "Community"]
  },
  {
    id: 3,
    title: "Local Music Festival",
    artist: "SoundWave Productions",
    category: "Music",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
    likes: 187,
    views: 1275,
    featured: true,
    description: "A three-day celebration of local music talent and culture.",
    tags: ["Festival", "Live Music", "Local Talent"]
  },
  {
    id: 4,
    title: "Street Art Mural",
    artist: "Urban Canvas",
    category: "Street Art",
    image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=300&fit=crop",
    likes: 263,
    views: 2032,
    featured: false,
    description: "Breathtaking mural transforming the city's landscape.",
    tags: ["Mural", "Public Art", "Urban"]
  },
  {
    id: 5,
    title: "Local Food Market",
    artist: "Farm Fresh Collective",
    category: "Food & Culture",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    likes: 156,
    views: 1890,
    featured: false,
    description: "Weekly farmers market featuring local produce and artisanal goods.",
    tags: ["Farmers Market", "Local Produce", "Artisanal"]
  },
  {
    id: 6,
    title: "Community Theater",
    artist: "Stage Right Productions",
    category: "Performing Arts",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    likes: 298,
    views: 2156,
    featured: true,
    description: "Amateur theater group bringing classic plays to the community.",
    tags: ["Theater", "Community", "Classic Plays"]
  }
];

const categories = [
  "All Projects",
  "Visual Arts", 
  "Music",
  "Community",
  "Street Art",
  "Food & Culture",
  "Performing Arts",
  "Photography",
  "Design",
  "Technology"
];

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/feed" replace />;
  }

  const handleLike = (projectId: number) => {
    console.log('Liked project:', projectId);
  };

  const handleBookmark = (projectId: number) => {
    console.log('Bookmarked project:', projectId);
  };

  const handleShare = (projectId: number) => {
    console.log('Shared project:', projectId);
  };

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
  };

  const handleCategorySelect = (category: string) => {
    console.log('Selected category:', category);
  };

  const handleProjectClick = (projectId: number) => {
    console.log('Clicked project:', projectId);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Header */}
      <ModernHeader showSearch={false} showCreateButton={false} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-6">
              <h1 className="text-6xl md:text-7xl font-bold text-gray-900 leading-tight">
                Showcase & Discover
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Local Creative Work
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Connect with your local community, discover amazing events, and book talented artists in your area.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3" asChild>
                <Link to="/signin">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-3" asChild>
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
            {categories.map((category, index) => (
              <button
                key={category}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  index === 0 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Project Grid */}
          <div className="flex-1">
            <ProjectGrid
              projects={sampleProjects}
              onLike={handleLike}
              onBookmark={handleBookmark}
              onShare={handleShare}
              onProjectClick={handleProjectClick}
              layout="grid"
              showFilters={false}
            />
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block w-80">
            <div className="sticky top-24">
              <ProjectSidebar
                categories={categories}
                trendingProjects={sampleProjects.slice(0, 3)}
                onSearch={handleSearch}
                onCategorySelect={handleCategorySelect}
                onProjectClick={handleProjectClick}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need to Connect Locally</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover, create, and connect with your local community through our comprehensive platform.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Link to="/discover" className="block group">
              <div className="text-center space-y-4 p-6 rounded-xl bg-white border hover:shadow-lg transition-all cursor-pointer">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-blue-200 transition-colors">
                  <MapPin className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Local Discovery</h3>
                <p className="text-gray-600">
                  Find events, services, and people right in your neighborhood
                </p>
              </div>
            </Link>

            <Link to="/community" className="block group">
              <div className="text-center space-y-4 p-6 rounded-xl bg-white border hover:shadow-lg transition-all cursor-pointer">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-purple-200 transition-colors">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Community</h3>
                <p className="text-gray-600">
                  Join local groups, discussions, and build meaningful connections
                </p>
              </div>
            </Link>

            <Link to="/events" className="block group">
              <div className="text-center space-y-4 p-6 rounded-xl bg-white border hover:shadow-lg transition-all cursor-pointer">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-green-200 transition-colors">
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Events</h3>
                <p className="text-gray-600">
                  Create and join amazing events happening in your community
                </p>
              </div>
            </Link>

            <Link to="/book-artist" className="block group">
              <div className="text-center space-y-4 p-6 rounded-xl bg-white border hover:shadow-lg transition-all cursor-pointer">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-orange-200 transition-colors">
                  <Zap className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Book Artists</h3>
                <p className="text-gray-600">
                  Hire talented local artists for your next event or project
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
