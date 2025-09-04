import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { eventApi, communityApi, userApi } from '@/services/enhancedApi';
import { EventData, CommunityData, UserUpdateData } from '@/types/extended';

// Enhanced query hook with better error handling and caching
export function useEnhancedQuery<TData, TError = unknown>(
  queryKey: string[],
  queryFn: () => Promise<TData>,
  options: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> = {}
) {
  const { toast } = useToast();

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as Record<string, unknown>).status;
        if (status >= 400 && status < 500) {
          return false;
        }
      }
      return failureCount < 3;
    },
    onError: (error) => {
      console.error('Query error:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch data. Please try again.',
        variant: 'destructive',
      });
    },
    ...options,
  });
}

// Enhanced mutation hook with better error handling and cache invalidation
export function useEnhancedMutation<TData, TError = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'> = {}
) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables, context) => {
      toast({
        title: 'Success',
        description: 'Operation completed successfully!',
      });
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Mutation error:', error);
      toast({
        title: 'Error',
        description: 'Operation failed. Please try again.',
        variant: 'destructive',
      });
      options.onError?.(error, variables, context);
    },
    ...options,
  });
}

// Event-related hooks
export function useEvents(options: {
  category?: string;
  location?: string;
  date?: string;
  limit?: number;
  offset?: number;
} = {}) {
  return useEnhancedQuery(
    ['events', options],
    () => eventApi.getEvents(options),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );
}

export function useEvent(eventId: string) {
  return useEnhancedQuery(
    ['event', eventId],
    () => eventApi.getEventById(eventId),
    {
      enabled: !!eventId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  
  return useEnhancedMutation(
    (eventData: EventData) => eventApi.createEvent(eventData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['events'] });
      },
    }
  );
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  
  return useEnhancedMutation(
    ({ id, updates }: { id: string; updates: Partial<EventData> }) => eventApi.updateEvent(id, updates),
    {
      onSuccess: (data, { id }) => {
        queryClient.invalidateQueries({ queryKey: ['events'] });
        queryClient.invalidateQueries({ queryKey: ['event', id] });
      },
    }
  );
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  
  return useEnhancedMutation(
    (eventId: string) => eventApi.deleteEvent(eventId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['events'] });
      },
    }
  );
}

export function useAttendEvent() {
  const queryClient = useQueryClient();
  
  return useEnhancedMutation(
    ({ eventId, userId }: { eventId: string; userId: string }) => 
      eventApi.attendEvent(eventId, userId),
    {
      onSuccess: (data, { eventId }) => {
        queryClient.invalidateQueries({ queryKey: ['events'] });
        queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      },
    }
  );
}

export function useLeaveEvent() {
  const queryClient = useQueryClient();
  
  return useEnhancedMutation(
    ({ eventId, userId }: { eventId: string; userId: string }) => 
      eventApi.leaveEvent(eventId, userId),
    {
      onSuccess: (data, { eventId }) => {
        queryClient.invalidateQueries({ queryKey: ['events'] });
        queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      },
    }
  );
}

// Community-related hooks
export function useCommunities(options: {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
} = {}) {
  return useEnhancedQuery(
    ['communities', options],
    () => communityApi.getCommunities(options),
    {
      staleTime: 3 * 60 * 1000, // 3 minutes
    }
  );
}

export function useCommunity(communityId: string) {
  return useEnhancedQuery(
    ['community', communityId],
    () => communityApi.getCommunityById(communityId),
    {
      enabled: !!communityId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

export function useCreateCommunity() {
  const queryClient = useQueryClient();
  
  return useEnhancedMutation(
    (communityData: CommunityData) => communityApi.createCommunity(communityData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['communities'] });
      },
    }
  );
}

export function useJoinCommunity() {
  const queryClient = useQueryClient();
  
  return useEnhancedMutation(
    ({ groupId, userId }: { groupId: string; userId: string }) => 
      communityApi.joinCommunity(groupId, userId),
    {
      onSuccess: (data, { groupId }) => {
        queryClient.invalidateQueries({ queryKey: ['communities'] });
        queryClient.invalidateQueries({ queryKey: ['community', groupId] });
      },
    }
  );
}

export function useLeaveCommunity() {
  const queryClient = useQueryClient();
  
  return useEnhancedMutation(
    ({ groupId, userId }: { groupId: string; userId: string }) => 
      communityApi.leaveCommunity(groupId, userId),
    {
      onSuccess: (data, { groupId }) => {
        queryClient.invalidateQueries({ queryKey: ['communities'] });
        queryClient.invalidateQueries({ queryKey: ['community', groupId] });
      },
    }
  );
}

// User-related hooks
export function useUserProfile(userId: string) {
  return useEnhancedQuery(
    ['user', userId],
    () => userApi.getUserProfile(userId),
    {
      enabled: !!userId,
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  
  return useEnhancedMutation(
    ({ userId, updates }: { userId: string; updates: UserUpdateData }) => 
      userApi.updateUserProfile(userId, updates),
    {
      onSuccess: (data, { userId }) => {
        queryClient.invalidateQueries({ queryKey: ['user', userId] });
      },
    }
  );
}

export function useFollowUser() {
  const queryClient = useQueryClient();
  
  return useEnhancedMutation(
    ({ followerId, followingId }: { followerId: string; followingId: string }) => 
      userApi.followUser(followerId, followingId),
    {
      onSuccess: (data, { followerId, followingId }) => {
        queryClient.invalidateQueries({ queryKey: ['user', followerId] });
        queryClient.invalidateQueries({ queryKey: ['user', followingId] });
      },
    }
  );
}

export function useUnfollowUser() {
  const queryClient = useQueryClient();
  
  return useEnhancedMutation(
    ({ followerId, followingId }: { followerId: string; followingId: string }) => 
      userApi.unfollowUser(followerId, followingId),
    {
      onSuccess: (data, { followerId, followingId }) => {
        queryClient.invalidateQueries({ queryKey: ['user', followerId] });
        queryClient.invalidateQueries({ queryKey: ['user', followingId] });
      },
    }
  );
}

// Infinite query hooks for pagination
export function useInfiniteEvents(options: {
  category?: string;
  location?: string;
  date?: string;
  limit?: number;
} = {}) {
  const { limit = 20, ...restOptions } = options;
  
  return useInfiniteQuery({
    queryKey: ['events', 'infinite', restOptions],
    queryFn: ({ pageParam = 0 }) => 
      eventApi.getEvents({ ...restOptions, limit, offset: pageParam * limit }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === limit ? allPages.length : undefined;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useInfiniteCommunities(options: {
  category?: string;
  search?: string;
  limit?: number;
} = {}) {
  const { limit = 20, ...restOptions } = options;
  
  return useInfiniteQuery({
    queryKey: ['communities', 'infinite', restOptions],
    queryFn: ({ pageParam = 0 }) => 
      communityApi.getCommunities({ ...restOptions, limit, offset: pageParam * limit }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === limit ? allPages.length : undefined;
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

// Search hooks
export function useSearch(query: string, type: 'events' | 'communities' | 'users' = 'events') {
  const debouncedQuery = useDebounce(query, 300);
  
  return useEnhancedQuery(
    ['search', type, debouncedQuery],
    () => {
      switch (type) {
        case 'events':
          return eventApi.getEvents({ search: debouncedQuery });
        case 'communities':
          return communityApi.getCommunities({ search: debouncedQuery });
        default:
          return Promise.resolve([]);
      }
    },
    {
      enabled: !!debouncedQuery && debouncedQuery.length >= 2,
      staleTime: 1 * 60 * 1000, // 1 minute
    }
  );
}

// Real-time subscription hooks
export function useRealtimeEvents(eventId?: string) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!eventId) return;
    
    const subscription = eventApi.subscribe(
      'events',
      'UPDATE',
      (payload) => {
        queryClient.invalidateQueries({ queryKey: ['event', eventId] });
        queryClient.invalidateQueries({ queryKey: ['events'] });
      },
      `id=eq.${eventId}`
    );
    
    return () => {
      eventApi.unsubscribe(subscription);
    };
  }, [eventId, queryClient]);
}

export function useRealtimeCommunities(communityId?: string) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!communityId) return;
    
    const subscription = communityApi.subscribe(
      'community_groups',
      'UPDATE',
      (payload) => {
        queryClient.invalidateQueries({ queryKey: ['community', communityId] });
        queryClient.invalidateQueries({ queryKey: ['communities'] });
      },
      `id=eq.${communityId}`
    );
    
    return () => {
      communityApi.unsubscribe(subscription);
    };
  }, [communityId, queryClient]);
}

// Helper hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Missing import
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
