import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Filter, MapPin, Calendar, Users, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  type: 'event' | 'community' | 'artist' | 'post';
  title: string;
  description: string;
  image?: string;
  icon: React.ReactNode;
  url: string;
}

interface MobileSearchProps {
  placeholder?: string;
  className?: string;
}

const searchFilters = [
  { id: 'all', label: 'All', icon: Search },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'communities', label: 'Communities', icon: Users },
  { id: 'artists', label: 'Artists', icon: Star },
];

const recentSearches = [
  'Local Music Festival',
  'Community Garden',
  'Art Workshop',
  'Book Club',
];

const trendingSearches = [
  'Summer Events',
  'Local Artists',
  'Community Groups',
  'Food Festivals',
];

export function MobileSearch({ placeholder = "Search events, communities, artists...", className }: MobileSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Focus input when search opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle search
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock search results
    const mockResults: SearchResult[] = [
      {
        id: '1',
        type: 'event',
        title: 'Local Music Festival 2024',
        description: 'A three-day celebration of local music talent',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop',
        icon: <Calendar className="h-4 w-4" />,
        url: '/event/1'
      },
      {
        id: '2',
        type: 'community',
        title: 'Local Artists Network',
        description: 'Connect with local artists and creators',
        image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=100&h=100&fit=crop',
        icon: <Users className="h-4 w-4" />,
        url: '/community/2'
      },
      {
        id: '3',
        type: 'artist',
        title: 'Sarah Chen - Musician',
        description: 'Local singer-songwriter and guitarist',
        image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
        icon: <Star className="h-4 w-4" />,
        url: '/artist/3'
      }
    ];

    setSearchResults(mockResults);
    setIsSearching(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleRecentSearch = (search: string) => {
    setSearchQuery(search);
    handleSearch(search);
  };

  const handleTrendingSearch = (search: string) => {
    setSearchQuery(search);
    handleSearch(search);
  };

  return (
    <>
      {/* Search Trigger */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">{placeholder}</span>
        <span className="sm:hidden">Search</span>
      </Button>

      {/* Search Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="top" className="h-full p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
                <form onSubmit={handleSearchSubmit} className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      ref={inputRef}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={placeholder}
                      className="pl-10 pr-4 h-10"
                    />
                  </div>
                </form>
              </div>
            </div>

            {/* Filters */}
            <div className="p-4 border-b border-border">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {searchFilters.map((filter) => (
                  <Button
                    key={filter.id}
                    variant={activeFilter === filter.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter(filter.id)}
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    <filter.icon className="h-3 w-3" />
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {searchQuery ? (
                // Search Results
                <div className="p-4 space-y-3">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((result) => (
                      <Card
                        key={result.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleResultClick(result)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={result.image} alt={result.title} />
                              <AvatarFallback className="bg-primary/10">
                                {result.icon}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-sm truncate">{result.title}</h3>
                                <Badge variant="secondary" className="text-xs">
                                  {result.type}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {result.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No results found</p>
                      <p className="text-sm">Try different keywords</p>
                    </div>
                  )}
                </div>
              ) : (
                // Default Content
                <div className="p-4 space-y-6">
                  {/* Recent Searches */}
                  <div>
                    <h3 className="font-medium text-sm mb-3">Recent Searches</h3>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search) => (
                        <Button
                          key={search}
                          variant="outline"
                          size="sm"
                          onClick={() => handleRecentSearch(search)}
                          className="text-xs"
                        >
                          {search}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Trending Searches */}
                  <div>
                    <h3 className="font-medium text-sm mb-3">Trending</h3>
                    <div className="flex flex-wrap gap-2">
                      {trendingSearches.map((search) => (
                        <Button
                          key={search}
                          variant="outline"
                          size="sm"
                          onClick={() => handleTrendingSearch(search)}
                          className="text-xs"
                        >
                          {search}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h3 className="font-medium text-sm mb-3">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="h-16 flex-col gap-2"
                        onClick={() => {
                          navigate('/events');
                          setIsOpen(false);
                        }}
                      >
                        <Calendar className="h-5 w-5" />
                        <span className="text-xs">Browse Events</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-16 flex-col gap-2"
                        onClick={() => {
                          navigate('/community');
                          setIsOpen(false);
                        }}
                      >
                        <Users className="h-5 w-5" />
                        <span className="text-xs">Find Communities</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-16 flex-col gap-2"
                        onClick={() => {
                          navigate('/book-artist');
                          setIsOpen(false);
                        }}
                      >
                        <Star className="h-5 w-5" />
                        <span className="text-xs">Book Artists</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-16 flex-col gap-2"
                        onClick={() => {
                          navigate('/discover');
                          setIsOpen(false);
                        }}
                      >
                        <MapPin className="h-5 w-5" />
                        <span className="text-xs">Discover Local</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
