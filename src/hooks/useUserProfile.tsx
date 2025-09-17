import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { 
  userProfileService, 
  UserProfile, 
  ProfileUpdateData, 
  UserStats, 
  UserPost, 
  UserBooking, 
  UserCommunity, 
  UserBadge 
} from '@/services/userProfileService';

export const useUserProfile = (userId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [communities, setCommunities] = useState<UserCommunity[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const targetUserId = userId || user?.id;

  const fetchProfile = useCallback(async () => {
    console.log('useUserProfile: fetchProfile called', { targetUserId, user: user?.id });
    
    if (!targetUserId) {
      console.log('useUserProfile: No targetUserId, setting loading to false');
      setLoading(false);
      return;
    }

    try {
      console.log('useUserProfile: Starting profile fetch for user:', targetUserId);
      setLoading(true);
      const profileData = await userProfileService.getUserProfile(targetUserId);
      console.log('useUserProfile: Profile data received:', profileData);
      setProfile(profileData);
    } catch (error) {
      console.error('useUserProfile: Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      console.log('useUserProfile: Setting loading to false');
      setLoading(false);
    }
  }, [targetUserId, toast, user?.id]);

  const fetchStats = useCallback(async () => {
    if (!targetUserId) return;

    try {
      const statsData = await userProfileService.getUserStats(targetUserId);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [targetUserId]);

  const fetchPosts = useCallback(async () => {
    if (!targetUserId) return;

    try {
      const postsData = await userProfileService.getUserPosts(targetUserId);
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  }, [targetUserId]);

  const fetchBookings = useCallback(async () => {
    if (!targetUserId) return;

    try {
      const bookingsData = await userProfileService.getUserBookings(targetUserId);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  }, [targetUserId]);

  const fetchCommunities = useCallback(async () => {
    if (!targetUserId) return;

    try {
      const communitiesData = await userProfileService.getUserCommunities(targetUserId);
      setCommunities(communitiesData);
    } catch (error) {
      console.error('Error fetching communities:', error);
    }
  }, [targetUserId]);

  const fetchBadges = useCallback(async () => {
    if (!targetUserId) return;

    try {
      const badgesData = await userProfileService.getUserBadges(targetUserId);
      setBadges(badgesData);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  }, [targetUserId]);

  const updateProfile = useCallback(async (updateData: ProfileUpdateData) => {
    if (!targetUserId) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive"
      });
      return { success: false };
    }

    try {
      setUpdating(true);
      const result = await userProfileService.updateUserProfile(targetUserId, updateData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Profile updated successfully"
        });
        // Refresh profile data
        await fetchProfile();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update profile",
          variant: "destructive"
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
      return { success: false, error: "Unknown error" };
    } finally {
      setUpdating(false);
    }
  }, [targetUserId, toast, fetchProfile]);

  const uploadAvatar = useCallback(async (file: File) => {
    if (!targetUserId) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive"
      });
      return { success: false };
    }

    try {
      setUpdating(true);
      const result = await userProfileService.uploadAvatar(targetUserId, file);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Avatar uploaded successfully"
        });
        // Refresh profile data
        await fetchProfile();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to upload avatar",
          variant: "destructive"
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive"
      });
      return { success: false, error: "Unknown error" };
    } finally {
      setUpdating(false);
    }
  }, [targetUserId, toast, fetchProfile]);

  const toggleAnonymousMode = useCallback(async (isAnonymous: boolean) => {
    if (!targetUserId) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive"
      });
      return { success: false };
    }

    try {
      setUpdating(true);
      const result = await userProfileService.toggleAnonymousMode(targetUserId, isAnonymous);
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Anonymous mode ${isAnonymous ? 'enabled' : 'disabled'} successfully`
        });
        // Refresh profile data
        await fetchProfile();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to toggle anonymous mode",
          variant: "destructive"
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error toggling anonymous mode:', error);
      toast({
        title: "Error",
        description: "Failed to toggle anonymous mode",
        variant: "destructive"
      });
      return { success: false, error: "Unknown error" };
    } finally {
      setUpdating(false);
    }
  }, [targetUserId, toast, fetchProfile]);

  const refreshAll = useCallback(async () => {
    if (!targetUserId) return;
    
    await Promise.all([
      fetchProfile(),
      fetchStats(),
      fetchPosts(),
      fetchBookings(),
      fetchCommunities(),
      fetchBadges()
    ]);
  }, [targetUserId, fetchProfile, fetchStats, fetchPosts, fetchBookings, fetchCommunities, fetchBadges]);

  // Initial data fetch
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return {
    profile,
    stats,
    posts,
    bookings,
    communities,
    badges,
    loading,
    updating,
    updateProfile,
    uploadAvatar,
    toggleAnonymousMode,
    refreshAll,
    fetchProfile,
    fetchStats,
    fetchPosts,
    fetchBookings,
    fetchCommunities,
    fetchBadges
  };
};
