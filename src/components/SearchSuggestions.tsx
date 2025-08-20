import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchSuggestion, SearchHistory } from '@/types/search';
import { Search, Clock, TrendingUp, MapPin, Hash, X } from 'lucide-react';

interface SearchSuggestionsProps {
  suggestions: SearchSuggestion[];
  recentSearches: SearchHistory[];
  onSuggestionClick: (suggestion: SearchSuggestion) => void;
  onRecentSearchClick: (search: SearchHistory) => void;
  onClearRecentSearches: () => void;
  onRemoveRecentSearch: (searchId: string) => void;
}

const SUGGESTION_ICONS = {
  query: Search,
  category: Hash,
  tag: Hash,
  location: MapPin
};

const SUGGESTION_COLORS = {
  query: 'bg-blue-100 text-blue-800',
  category: 'bg-green-100 text-green-800',
  tag: 'bg-purple-100 text-purple-800',
  location: 'bg-orange-100 text-orange-800'
};

export const SearchSuggestions = ({
  suggestions,
  recentSearches,
  onSuggestionClick,
  onRecentSearchClick,
  onClearRecentSearches,
  onRemoveRecentSearch
}: SearchSuggestionsProps) => {
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const [showAllRecent, setShowAllRecent] = useState(false);

  const displayedSuggestions = showAllSuggestions ? suggestions : suggestions.slice(0, 5);
  const displayedRecent = showAllRecent ? recentSearches : recentSearches.slice(0, 5);

  const getSuggestionIcon = (type: string) => {
    const IconComponent = SUGGESTION_ICONS[type as keyof typeof SUGGESTION_ICONS] || Search;
    return <IconComponent className="h-4 w-4" />;
  };

  const getSuggestionColor = (type: string) => {
    return SUGGESTION_COLORS[type as keyof typeof SUGGESTION_COLORS] || 'bg-gray-100 text-gray-800';
  };

  const formatRelevance = (relevance: number) => {
    if (relevance >= 0.8) return 'Very High';
    if (relevance >= 0.6) return 'High';
    if (relevance >= 0.4) return 'Medium';
    return 'Low';
  };

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 0.8) return 'text-green-600';
    if (relevance >= 0.6) return 'text-blue-600';
    if (relevance >= 0.4) return 'text-yellow-600';
    return 'text-gray-600';
  };

  if (suggestions.length === 0 && recentSearches.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <div className="text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Start searching</h3>
            <p>Type in the search box to find artists, events, posts, and more.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Suggestions */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Popular Searches
              </CardTitle>
              {suggestions.length > 5 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllSuggestions(!showAllSuggestions)}
                >
                  {showAllSuggestions ? 'Show Less' : `Show All (${suggestions.length})`}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {displayedSuggestions.map((suggestion) => (
              <Button
                key={suggestion.id}
                variant="ghost"
                className="w-full justify-start h-auto p-3"
                onClick={() => onSuggestionClick(suggestion)}
              >
                <div className="flex items-center gap-3 w-full">
                  <Badge className={getSuggestionColor(suggestion.type)}>
                    {getSuggestionIcon(suggestion.type)}
                  </Badge>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{suggestion.text}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {suggestion.type} • {formatRelevance(suggestion.relevance)} relevance
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getRelevanceColor(suggestion.relevance)}`}
                  >
                    {Math.round(suggestion.relevance * 100)}%
                  </Badge>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Searches
              </CardTitle>
              <div className="flex items-center gap-2">
                {recentSearches.length > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllRecent(!showAllRecent)}
                  >
                    {showAllRecent ? 'Show Less' : `Show All (${recentSearches.length})`}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearRecentSearches}
                  className="text-red-600 hover:text-red-700"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {displayedRecent.map((search) => (
              <div
                key={search.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
              >
                <Button
                  variant="ghost"
                  className="flex-1 justify-start h-auto p-0"
                  onClick={() => onRecentSearchClick(search)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{search.query}</div>
                      <div className="text-xs text-muted-foreground">
                        {search.resultsCount} results • {new Date(search.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onRemoveRecentSearch(search.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick Search Categories */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Events', icon: '🎉', type: 'event' },
              { label: 'Artists', icon: '🎨', type: 'artist' },
              { label: 'Posts', icon: '📝', type: 'post' },
              { label: 'Groups', icon: '👥', type: 'group' }
            ].map((category) => (
              <Button
                key={category.type}
                variant="outline"
                className="h-auto p-3 flex flex-col items-center gap-2"
                onClick={() => onSuggestionClick({
                  id: `category-${category.type}`,
                  text: category.label,
                  type: 'category',
                  relevance: 0.5
                })}
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="text-sm font-medium">{category.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search Tips */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Search Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <span className="text-blue-600">💡</span>
            <span>Use quotes for exact phrases: "jazz music"</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600">📍</span>
            <span>Add location to find nearby events: "concerts in NYC"</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-600">🏷️</span>
            <span>Use tags to filter content: #photography #music</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-orange-600">📅</span>
            <span>Search by date: "events this weekend"</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
