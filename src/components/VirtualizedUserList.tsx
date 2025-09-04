/**
 * VirtualizedUserList Component
 * 
 * A high-performance user list component that uses virtualization to handle
 * large datasets efficiently. Only renders visible items in the viewport.
 * 
 * @component
 * @example
 * ```tsx
 * <VirtualizedUserList
 *   users={largeUserList}
 *   height={600}
 *   itemHeight={120}
 *   variant="compact"
 * />
 * ```
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { EnhancedUserProfileCard, EnhancedUserProfile } from './EnhancedUserProfileCard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Users, 
  Filter, 
  SortAsc, 
  SortDesc,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface VirtualizedUserListProps {
  users: EnhancedUserProfile[];
  variant?: 'default' | 'compact' | 'minimal' | 'premium' | 'featured' | 'enterprise' | 'dark';
  height?: number;
  itemHeight?: number;
  onUserAction?: (userId: string, action: string, data?: any) => void;
  onFollow?: (userId: string) => void | Promise<void>;
  onMessage?: (userId: string) => void | Promise<void>;
  onViewProfile?: (userId: string) => void | Promise<void>;
  onShare?: (userId: string) => void | Promise<void>;
  onEdit?: (userId: string) => void | Promise<void>;
  onContact?: (userId: string) => void | Promise<void>;
  className?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  showSorting?: boolean;
  enableVirtualization?: boolean;
}

export default function VirtualizedUserList({
  users: initialUsers,
  variant = 'default',
  height = 600,
  itemHeight = 120,
  onUserAction,
  onFollow,
  onMessage,
  onViewProfile,
  onShare,
  onEdit,
  onContact,
  className,
  showSearch = true,
  showFilters = true,
  showSorting = true,
  enableVirtualization = true
}: VirtualizedUserListProps) {
  const [users, setUsers] = useState<EnhancedUserProfile[]>(initialUsers);
  const [filteredUsers, setFilteredUsers] = useState<EnhancedUserProfile[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'followers' | 'joinDate' | 'rating'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Memoized filtered and sorted users
  const processedUsers = useMemo(() => {
    let result = [...initialUsers];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.bio?.toLowerCase().includes(query) ||
        user.location?.toLowerCase().includes(query) ||
        user.skills?.some(skill => skill.toLowerCase().includes(query))
      );
    }

    // Apply category filters
    if (activeFilters.size > 0) {
      result = result.filter(user => {
        if (activeFilters.has('verified') && !user.verified) return false;
        if (activeFilters.has('premium') && !user.isPremium) return false;
        if (activeFilters.has('featured') && !user.isFeatured) return false;
        if (activeFilters.has('online') && !user.isOnline) return false;
        return true;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'followers':
          aValue = a.followersCount || 0;
          bValue = b.followersCount || 0;
          break;
        case 'joinDate':
          aValue = new Date(a.joinDate || '').getTime();
          bValue = new Date(b.joinDate || '').getTime();
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return result;
  }, [initialUsers, searchQuery, activeFilters, sortBy, sortOrder]);

  // Update filtered users when processed users change
  useEffect(() => {
    setFilteredUsers(processedUsers);
  }, [processedUsers]);

  // Virtualization calculations
  const totalHeight = filteredUsers.length * itemHeight;
  const visibleCount = Math.ceil(height / itemHeight) + 2; // +2 for smooth scrolling
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight));
  const endIndex = Math.min(filteredUsers.length, startIndex + visibleCount);

  // Get visible users for virtualization
  const visibleUsers = enableVirtualization 
    ? filteredUsers.slice(startIndex, endIndex)
    : filteredUsers;

  // Handle scroll
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    if (enableVirtualization) {
      setScrollTop(event.currentTarget.scrollTop);
    }
  }, [enableVirtualization]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Handle filter toggle
  const handleFilterToggle = useCallback((filter: string) => {
    setActiveFilters(prev => {
      const newFilters = new Set(prev);
      if (newFilters.has(filter)) {
        newFilters.delete(filter);
      } else {
        newFilters.add(filter);
      }
      return newFilters;
    });
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  }, [sortBy]);

  // Render user item
  const renderUserItem = useCallback((user: EnhancedUserProfile, index: number) => {
    const actualIndex = enableVirtualization ? startIndex + index : index;
    const top = enableVirtualization ? actualIndex * itemHeight : 0;
    
    return (
      <div
        key={user.id}
        className="w-full"
        style={enableVirtualization ? { position: 'absolute', top, height: itemHeight } : undefined}
      >
        <Card className="h-full mx-2 mb-2 transition-all duration-200 hover:shadow-md">
          <CardContent className="p-4">
            <EnhancedUserProfileCard
              user={user}
              variant={variant}
              showActions={true}
              showStats={false}
              showSkills={false}
              onFollow={onFollow}
              onMessage={onMessage}
              onViewProfile={onViewProfile}
              onShare={onShare}
              onEdit={onEdit}
              onContact={onContact}
              className="border-0 shadow-none p-0"
            />
          </CardContent>
        </Card>
      </div>
    );
  }, [
    startIndex, itemHeight, enableVirtualization, variant,
    onFollow, onMessage, onViewProfile, onShare, onEdit, onContact
  ]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Controls */}
      <div className="space-y-4">
        {/* Search and Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              {filteredUsers.length} of {initialUsers.length} users
            </span>
            {enableVirtualization && (
              <Badge variant="secondary" className="text-xs">
                Virtualized
              </Badge>
            )}
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name, bio, location, or skills..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Filters and Sorting */}
        {(showFilters || showSorting) && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Filters */}
            {showFilters && (
              <>
                <span className="text-sm font-medium text-muted-foreground">Filters:</span>
                {['verified', 'premium', 'featured', 'online'].map(filter => (
                  <Button
                    key={filter}
                    variant={activeFilters.has(filter) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterToggle(filter)}
                    className="text-xs capitalize"
                  >
                    <Filter className="h-3 w-3 mr-1" />
                    {filter}
                  </Button>
                ))}
              </>
            )}

            {/* Sorting */}
            {showSorting && (
              <>
                <span className="text-sm font-medium text-muted-foreground ml-4">Sort by:</span>
                {[
                  { key: 'name', label: 'Name' },
                  { key: 'followers', label: 'Followers' },
                  { key: 'joinDate', label: 'Join Date' },
                  { key: 'rating', label: 'Rating' }
                ].map(({ key, label }) => (
                  <Button
                    key={key}
                    variant={sortBy === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSortChange(key as typeof sortBy)}
                    className="text-xs"
                  >
                    {label}
                    {sortBy === key && (
                      sortOrder === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />
                    )}
                  </Button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Virtualized List */}
      <div 
        ref={scrollAreaRef}
        className="border rounded-lg"
        style={{ height }}
      >
        <ScrollArea className="h-full" onScroll={handleScroll}>
          <div 
            className="relative w-full"
            style={{ height: enableVirtualization ? totalHeight : 'auto' }}
          >
            {visibleUsers.map((user, index) => renderUserItem(user, index))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
