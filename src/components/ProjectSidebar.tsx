import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Sparkles, 
  MapPin, 
  Calendar,
  Users,
  Music,
  Palette,
  Camera,
  Code,
  Heart
} from "lucide-react";
import { useState } from "react";

interface ProjectSidebarProps {
  categories: string[];
  trendingProjects: Array<{
    id: number;
    title: string;
    artist: string;
    image: string;
    likes: number;
  }>;
  onSearch?: (query: string) => void;
  onCategorySelect?: (category: string) => void;
  onProjectClick?: (projectId: number) => void;
  className?: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  "Visual Arts": <Palette className="h-4 w-4" />,
  "Music": <Music className="h-4 w-4" />,
  "Community": <Users className="h-4 w-4" />,
  "Street Art": <Palette className="h-4 w-4" />,
  "Food & Culture": <Heart className="h-4 w-4" />,
  "Performing Arts": <Users className="h-4 w-4" />,
  "Photography": <Camera className="h-4 w-4" />,
  "Design": <Palette className="h-4 w-4" />,
  "Technology": <Code className="h-4 w-4" />,
  "Events": <Calendar className="h-4 w-4" />,
  "Location": <MapPin className="h-4 w-4" />
};

export function ProjectSidebar({
  categories,
  trendingProjects,
  onSearch,
  onCategorySelect,
  onProjectClick,
  className = ""
}: ProjectSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Projects");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    onCategorySelect?.(category);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search */}
      <div className="bg-white rounded-xl border p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Search Projects</h3>
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by title, artist, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            Search
          </Button>
        </form>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-xl border p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategorySelect(category)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                selectedCategory === category
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {categoryIcons[category] || <Filter className="h-4 w-4" />}
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Trending */}
      <div className="bg-white rounded-xl border p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          Trending Now
        </h3>
        <div className="space-y-3">
          {trendingProjects.map((project) => (
            <div 
              key={project.id} 
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onProjectClick?.(project.id)}
            >
              <img 
                src={project.image} 
                alt={project.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{project.title}</p>
                <p className="text-xs text-gray-500">{project.artist}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Heart className="h-3 w-3 text-red-500" />
                  <span className="text-xs text-gray-500">{project.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl border p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Platform Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Projects</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              2,847
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Active Artists</span>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              1,234
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">This Month</span>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              156
            </Badge>
          </div>
        </div>
      </div>

      {/* Get Started CTA */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="text-center space-y-3">
          <Sparkles className="h-8 w-8 mx-auto" />
          <h3 className="font-semibold text-lg">Ready to Showcase Your Work?</h3>
          <p className="text-sm text-blue-100">
            Join thousands of local creators and start sharing your projects today.
          </p>
          <Button className="w-full bg-white text-blue-600 hover:bg-gray-100">
            Create Your Profile
          </Button>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Stay Updated</h3>
        <p className="text-sm text-gray-600 mb-3">
          Get notified about new projects and events in your area.
        </p>
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Enter your email"
            className="border-gray-200 focus:ring-blue-500"
          />
          <Button className="w-full bg-gray-800 hover:bg-gray-900 text-white">
            Subscribe
          </Button>
        </div>
      </div>
    </div>
  );
}
