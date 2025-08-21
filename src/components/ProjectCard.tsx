import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Eye, Bookmark, Star, Share2 } from "lucide-react";
import { useState } from "react";

interface ProjectCardProps {
  project: {
    id: number;
    title: string;
    artist: string;
    category: string;
    image: string;
    likes: number;
    views: number;
    featured?: boolean;
    description?: string;
    tags?: string[];
  };
  onLike?: (projectId: number) => void;
  onBookmark?: (projectId: number) => void;
  onShare?: (projectId: number) => void;
  className?: string;
}

export function ProjectCard({ 
  project, 
  onLike, 
  onBookmark, 
  onShare, 
  className = "" 
}: ProjectCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.(project.id);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark?.(project.id);
  };

  const handleShare = () => {
    onShare?.(project.id);
  };

  return (
    <Card className={`group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md ${className}`}>
      <div className="relative overflow-hidden">
        <img 
          src={project.image} 
          alt={project.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Featured Badge */}
        {project.featured && (
          <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
            <Star className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        )}

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          <Button 
            size="icon" 
            variant="secondary" 
            className="h-8 w-8 bg-white/90 hover:bg-white"
            onClick={handleBookmark}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </Button>
          <Button 
            size="icon" 
            variant="secondary" 
            className="h-8 w-8 bg-white/90 hover:bg-white"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Category Badge */}
        <div className="absolute bottom-3 left-3">
          <Badge variant="secondary" className="bg-white/90 text-gray-700 border-0">
            {project.category}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
              {project.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{project.artist}</p>
          </div>

          {project.description && (
            <p className="text-sm text-gray-500 line-clamp-2">
              {project.description}
            </p>
          )}

          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.tags.slice(0, 3).map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs px-2 py-1 bg-gray-50"
                >
                  {tag}
                </Badge>
              ))}
              {project.tags.length > 3 && (
                <Badge variant="outline" className="text-xs px-2 py-1 bg-gray-50">
                  +{project.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 hover:text-red-500 transition-colors ${
                  isLiked ? 'text-red-500' : ''
                }`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{project.likes + (isLiked ? 1 : 0)}</span>
              </button>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{project.views}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
