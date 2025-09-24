import { ProjectCard } from "./ProjectCard";
import { Button } from "@/components/ui/button";
import { Loader2, Grid, List, Filter } from "lucide-react";
import { useState } from "react";

interface Project {
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
}

interface ProjectGridProps {
  projects: Project[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onLike?: (projectId: number) => void;
  onBookmark?: (projectId: number) => void;
  onShare?: (projectId: number) => void;
  onProjectClick?: (projectId: number) => void;
  layout?: 'grid' | 'list' | 'masonry';
  showFilters?: boolean;
  className?: string;
}

export function ProjectGrid({
  projects,
  loading = false,
  hasMore = false,
  onLoadMore,
  onLike,
  onBookmark,
  onShare,
  onProjectClick,
  layout = 'grid',
  showFilters = false,
  className = ""
}: ProjectGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(layout === 'masonry' ? 'grid' : layout);

  const handleProjectClick = (projectId: number) => {
    onProjectClick?.(projectId);
  };

  if (loading && projects.length === 0) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <Filter className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No projects found</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Try adjusting your search criteria or browse different categories to discover amazing local projects.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* View Mode Toggle */}
      {showFilters && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">View:</span>
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 px-3"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 px-3"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Projects Grid/List */}
      <div className={
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
      }>
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => handleProjectClick(project.id)}
            className={viewMode === 'list' ? 'cursor-pointer' : ''}
          >
            <ProjectCard
              project={project}
              onLike={onLike}
              onBookmark={onBookmark}
              onShare={onShare}
              className={viewMode === 'list' ? 'flex flex-row' : ''}
            />
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={onLoadMore}
            disabled={loading}
            variant="outline"
            className="px-8"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More Projects'
            )}
          </Button>
        </div>
      )}

      {/* Loading State for Load More */}
      {loading && projects.length > 0 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading more projects...</span>
          </div>
        </div>
      )}
    </div>
  );
}
