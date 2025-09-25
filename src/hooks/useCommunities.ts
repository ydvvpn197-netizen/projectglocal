import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Community {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  image?: string;
  category: string;
  location?: string;
  member_count?: number;
  members?: number;
  creator_id?: string;
  creator_name?: string;
  creator_avatar?: string;
  creator?: {
    name: string;
    avatar: string;
  };
  is_verified?: boolean;
  activity_level?: string;
  activity_score?: number;
  created_at?: string;
  createdAt?: string;
  tags?: string[];
  is_private?: boolean;
  is_featured?: boolean;
  rules?: string[];
  guidelines?: string[];
  contact_info?: {
    email?: string;
    phone?: string;
    website?: string;
  };
}

export const useCommunities = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch communities
  const fetchCommunities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('communities')
        .select(`
          *,
          creator:profiles!communities_creator_id_fkey(
            display_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Transform data to match our interface
      const transformedCommunities = data?.map(community => ({
        id: community.id,
        name: community.name,
        description: community.description,
        image_url: community.image_url,
        image: community.image_url,
        category: community.category || 'Community',
        location: community.location,
        member_count: community.member_count || 0,
        members: community.member_count || 0,
        creator_id: community.creator_id,
        creator_name: community.creator?.display_name || 'Community Creator',
        creator_avatar: community.creator?.avatar_url,
        creator: {
          name: community.creator?.display_name || 'Community Creator',
          avatar: community.creator?.avatar_url || ''
        },
        is_verified: community.is_verified || false,
        activity_level: community.activity_level || 'Active',
        activity_score: community.activity_score || 0,
        created_at: community.created_at,
        createdAt: community.created_at,
        tags: community.tags || [],
        is_private: community.is_private || false,
        is_featured: community.is_featured || false,
        rules: community.rules || [],
        guidelines: community.guidelines || [],
        contact_info: community.contact_info || {}
      })) || [];

      setCommunities(transformedCommunities);
    } catch (err) {
      console.error('Error fetching communities:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch communities');
      
      // Fallback to sample data
      const sampleCommunities: Community[] = [
        {
          id: '1',
          name: 'Local Music Enthusiasts',
          description: 'A community for music lovers to discover local artists, share recommendations, and attend concerts together.',
          image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
          category: 'Music',
          location: 'Downtown',
          member_count: 1250,
          creator_name: 'Music Lover',
          creator_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
          is_verified: true,
          activity_level: 'Very Active',
          activity_score: 95,
          created_at: new Date().toISOString(),
          tags: ['music', 'concerts', 'local', 'artists'],
          is_private: false,
          is_featured: true
        },
        {
          id: '2',
          name: 'Art & Culture Collective',
          description: 'Connecting artists, art lovers, and cultural enthusiasts to explore local galleries, exhibitions, and creative events.',
          image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=400&fit=crop',
          category: 'Art',
          location: 'Arts District',
          member_count: 890,
          creator_name: 'Art Curator',
          creator_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
          is_verified: true,
          activity_level: 'Active',
          activity_score: 78,
          created_at: new Date().toISOString(),
          tags: ['art', 'culture', 'galleries', 'exhibitions'],
          is_private: false,
          is_featured: false
        },
        {
          id: '3',
          name: 'Tech Entrepreneurs Network',
          description: 'A professional network for tech entrepreneurs, startup founders, and innovators to share ideas and collaborate.',
          image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
          category: 'Technology',
          location: 'Innovation Hub',
          member_count: 567,
          creator_name: 'Tech Founder',
          creator_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
          is_verified: true,
          activity_level: 'Active',
          activity_score: 82,
          created_at: new Date().toISOString(),
          tags: ['tech', 'startup', 'entrepreneurs', 'innovation'],
          is_private: false,
          is_featured: true
        },
        {
          id: '4',
          name: 'Wellness & Mindfulness',
          description: 'A supportive community focused on mental health, wellness practices, and mindful living.',
          image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
          category: 'Health & Wellness',
          location: 'Wellness Center',
          member_count: 432,
          creator_name: 'Wellness Coach',
          creator_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
          is_verified: false,
          activity_level: 'Moderate',
          activity_score: 65,
          created_at: new Date().toISOString(),
          tags: ['wellness', 'mindfulness', 'health', 'meditation'],
          is_private: false,
          is_featured: false
        },
        {
          id: '5',
          name: 'Local Food Enthusiasts',
          description: 'Food lovers sharing recipes, restaurant recommendations, and organizing culinary events.',
          image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=400&fit=crop',
          category: 'Food',
          location: 'Food District',
          member_count: 789,
          creator_name: 'Food Blogger',
          creator_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
          is_verified: true,
          activity_level: 'Very Active',
          activity_score: 88,
          created_at: new Date().toISOString(),
          tags: ['food', 'cooking', 'restaurants', 'recipes'],
          is_private: false,
          is_featured: true
        }
      ];
      
      setCommunities(sampleCommunities);
    } finally {
      setLoading(false);
    }
  }, []);

  // Join community
  const joinCommunity = useCallback(async (communityId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to join communities.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error: joinError } = await supabase
        .from('community_members')
        .insert({
          community_id: communityId,
          user_id: user.id,
          joined_at: new Date().toISOString()
        });

      if (joinError) {
        throw joinError;
      }

      // Update local state
      setCommunities(prev => 
        prev.map(community => 
          community.id === communityId 
            ? { ...community, member_count: (community.member_count || 0) + 1 }
            : community
        )
      );

      toast({
        title: "Joined Community",
        description: "You've successfully joined this community!",
      });
    } catch (err) {
      console.error('Error joining community:', err);
      toast({
        title: "Join Failed",
        description: "Unable to join community. Please try again.",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  // Leave community
  const leaveCommunity = useCallback(async (communityId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to leave communities.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error: leaveError } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', user.id);

      if (leaveError) {
        throw leaveError;
      }

      // Update local state
      setCommunities(prev => 
        prev.map(community => 
          community.id === communityId 
            ? { ...community, member_count: Math.max(0, (community.member_count || 0) - 1) }
            : community
        )
      );

      toast({
        title: "Left Community",
        description: "You've successfully left this community.",
      });
    } catch (err) {
      console.error('Error leaving community:', err);
      toast({
        title: "Leave Failed",
        description: "Unable to leave community. Please try again.",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  // Create community
  const createCommunity = useCallback(async (communityData: Partial<Community>) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create communities.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error: createError } = await supabase
        .from('communities')
        .insert({
          name: communityData.name,
          description: communityData.description,
          image_url: communityData.image_url,
          category: communityData.category,
          location: communityData.location,
          creator_id: user.id,
          is_private: communityData.is_private || false,
          tags: communityData.tags || []
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Add to local state
      const newCommunity: Community = {
        id: data.id,
        name: data.name,
        description: data.description,
        image_url: data.image_url,
        category: data.category,
        location: data.location,
        member_count: 1,
        creator_id: user.id,
        creator_name: user.email?.split('@')[0] || 'Community Creator',
        is_verified: false,
        activity_level: 'New',
        activity_score: 0,
        created_at: data.created_at,
        tags: data.tags || [],
        is_private: data.is_private || false,
        is_featured: false
      };

      setCommunities(prev => [newCommunity, ...prev]);

      toast({
        title: "Community Created",
        description: "Your community has been created successfully!",
      });

      return newCommunity;
    } catch (err) {
      console.error('Error creating community:', err);
      toast({
        title: "Creation Failed",
        description: "Unable to create community. Please try again.",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  // Fetch communities on mount
  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  return {
    communities,
    loading,
    error,
    fetchCommunities,
    joinCommunity,
    leaveCommunity,
    createCommunity
  };
};
