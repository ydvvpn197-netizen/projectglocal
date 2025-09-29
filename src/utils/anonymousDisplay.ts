/**
 * Anonymous Display Utilities
 * 
 * This utility ensures consistent anonymous-by-default display throughout the app.
 * It respects user privacy settings and provides appropriate display names.
 */

import { supabase } from '@/integrations/supabase/client';

export interface UserDisplayInfo {
  displayName: string;
  isAnonymous: boolean;
  canRevealIdentity: boolean;
  avatarUrl?: string;
  fallbackInitial: string;
}

export interface ProfileData {
  user_id: string;
  display_name?: string;
  username?: string;
  anonymous_handle?: string;
  anonymous_display_name?: string;
  is_anonymous?: boolean;
  can_reveal_identity?: boolean;
  real_name_visibility?: boolean;
  avatar_url?: string;
  first_name?: string;
  last_name?: string;
}

/**
 * Get the appropriate display name for a user based on their privacy settings
 */
export function getAnonymousDisplayName(
  profile: ProfileData,
  viewerUserId?: string,
  forceAnonymous: boolean = false
): UserDisplayInfo {
  // Default values
  const isAnonymous = profile.is_anonymous ?? true;
  const canRevealIdentity = profile.can_reveal_identity ?? false;
  const realNameVisibility = profile.real_name_visibility ?? false;
  
  // If viewer is the same user, they can see their own real name
  const isOwnProfile = viewerUserId === profile.user_id;
  
  let displayName: string;
  let effectiveIsAnonymous: boolean;
  
  if (forceAnonymous || (!isOwnProfile && isAnonymous)) {
    // Use anonymous display
    displayName = profile.anonymous_display_name || 
                 profile.anonymous_handle || 
                 'Anonymous User';
    effectiveIsAnonymous = true;
  } else if (isOwnProfile || (canRevealIdentity && realNameVisibility)) {
    // Use real name if user has revealed identity
    if (profile.display_name) {
      displayName = profile.display_name;
    } else if (profile.first_name && profile.last_name) {
      displayName = `${profile.first_name} ${profile.last_name}`.trim();
    } else if (profile.username) {
      displayName = profile.username;
    } else {
      displayName = 'Anonymous User';
    }
    effectiveIsAnonymous = false;
  } else {
    // Default to anonymous
    displayName = profile.anonymous_display_name || 
                 profile.anonymous_handle || 
                 'Anonymous User';
    effectiveIsAnonymous = true;
  }
  
  // Generate fallback initial
  const fallbackInitial = displayName.charAt(0).toUpperCase();
  
  return {
    displayName,
    isAnonymous: effectiveIsAnonymous,
    canRevealIdentity: canRevealIdentity && !forceAnonymous,
    avatarUrl: effectiveIsAnonymous ? undefined : profile.avatar_url,
    fallbackInitial
  };
}

/**
 * Get user display info by user ID
 */
export async function getUserDisplayInfo(
  userId: string,
  viewerUserId?: string,
  forceAnonymous: boolean = false
): Promise<UserDisplayInfo | null> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        user_id,
        display_name,
        username,
        anonymous_handle,
        anonymous_display_name,
        is_anonymous,
        can_reveal_identity,
        real_name_visibility,
        avatar_url,
        first_name,
        last_name
      `)
      .eq('user_id', userId)
      .single();
    
    if (error || !profile) {
      console.error('Error fetching user profile:', error);
      return {
        displayName: 'Anonymous User',
        isAnonymous: true,
        canRevealIdentity: false,
        fallbackInitial: 'A'
      };
    }
    
    return getAnonymousDisplayName(profile, viewerUserId, forceAnonymous);
  } catch (error) {
    console.error('Error in getUserDisplayInfo:', error);
    return {
      displayName: 'Anonymous User',
      isAnonymous: true,
      canRevealIdentity: false,
      fallbackInitial: 'A'
    };
  }
}

/**
 * Get multiple users' display info efficiently
 */
export async function getMultipleUsersDisplayInfo(
  userIds: string[],
  viewerUserId?: string,
  forceAnonymous: boolean = false
): Promise<Map<string, UserDisplayInfo>> {
  const displayInfoMap = new Map<string, UserDisplayInfo>();
  
  if (userIds.length === 0) {
    return displayInfoMap;
  }
  
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        user_id,
        display_name,
        username,
        anonymous_handle,
        anonymous_display_name,
        is_anonymous,
        can_reveal_identity,
        real_name_visibility,
        avatar_url,
        first_name,
        last_name
      `)
      .in('user_id', userIds);
    
    if (error) {
      console.error('Error fetching user profiles:', error);
      // Return default anonymous info for all users
      userIds.forEach(userId => {
        displayInfoMap.set(userId, {
          displayName: 'Anonymous User',
          isAnonymous: true,
          canRevealIdentity: false,
          fallbackInitial: 'A'
        });
      });
      return displayInfoMap;
    }
    
    // Process each profile
    profiles?.forEach(profile => {
      const displayInfo = getAnonymousDisplayName(profile, viewerUserId, forceAnonymous);
      displayInfoMap.set(profile.user_id, displayInfo);
    });
    
    // Add default info for any missing users
    userIds.forEach(userId => {
      if (!displayInfoMap.has(userId)) {
        displayInfoMap.set(userId, {
          displayName: 'Anonymous User',
          isAnonymous: true,
          canRevealIdentity: false,
          fallbackInitial: 'A'
        });
      }
    });
    
    return displayInfoMap;
  } catch (error) {
    console.error('Error in getMultipleUsersDisplayInfo:', error);
    // Return default anonymous info for all users
    userIds.forEach(userId => {
      displayInfoMap.set(userId, {
        displayName: 'Anonymous User',
        isAnonymous: true,
        canRevealIdentity: false,
        fallbackInitial: 'A'
      });
    });
    return displayInfoMap;
  }
}

/**
 * Hook for getting user display info with caching
 */
export function useUserDisplayInfo(
  userId: string,
  viewerUserId?: string,
  forceAnonymous: boolean = false
) {
  const [displayInfo, setDisplayInfo] = useState<UserDisplayInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!userId) {
      setDisplayInfo(null);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    getUserDisplayInfo(userId, viewerUserId, forceAnonymous)
      .then(info => {
        setDisplayInfo(info);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching user display info:', err);
        setError(err.message);
        setDisplayInfo({
          displayName: 'Anonymous User',
          isAnonymous: true,
          canRevealIdentity: false,
          fallbackInitial: 'A'
        });
        setLoading(false);
      });
  }, [userId, viewerUserId, forceAnonymous]);
  
  return { displayInfo, loading, error };
}

/**
 * Hook for getting multiple users' display info
 */
export function useMultipleUsersDisplayInfo(
  userIds: string[],
  viewerUserId?: string,
  forceAnonymous: boolean = false
) {
  const [displayInfoMap, setDisplayInfoMap] = useState<Map<string, UserDisplayInfo>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (userIds.length === 0) {
      setDisplayInfoMap(new Map());
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    getMultipleUsersDisplayInfo(userIds, viewerUserId, forceAnonymous)
      .then(map => {
        setDisplayInfoMap(map);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching multiple users display info:', err);
        setError(err.message);
        
        // Create default map
        const defaultMap = new Map<string, UserDisplayInfo>();
        userIds.forEach(userId => {
          defaultMap.set(userId, {
            displayName: 'Anonymous User',
            isAnonymous: true,
            canRevealIdentity: false,
            fallbackInitial: 'A'
          });
        });
        setDisplayInfoMap(defaultMap);
        setLoading(false);
      });
  }, [userIds, viewerUserId, forceAnonymous]);
  
  return { displayInfoMap, loading, error };
}

/**
 * Get display name for a user object (for backward compatibility)
 */
export function getUserDisplayName(user: Record<string, unknown> | null, viewerUserId?: string): string {
  if (!user) return 'Anonymous User';
  
  // If user object has display info already
  if (user.displayName) return user.displayName;
  if (user.anonymous_display_name) return user.anonymous_display_name;
  if (user.anonymous_handle) return user.anonymous_handle;
  
  // Check if viewer is the same user
  const isOwnProfile = viewerUserId === user.id || viewerUserId === user.user_id;
  
  // Use real name if available and user has revealed identity
  if (isOwnProfile || (user.can_reveal_identity && user.real_name_visibility)) {
    if (user.display_name) return user.display_name;
    if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`.trim();
    if (user.username) return user.username;
    if (user.name) return user.name;
  }
  
  // Default to anonymous
  return user.anonymous_display_name || user.anonymous_handle || 'Anonymous User';
}

/**
 * Check if a user should be displayed anonymously
 */
export function shouldDisplayAnonymously(user: Record<string, unknown> | null, viewerUserId?: string): boolean {
  if (!user) return true;
  
  const isOwnProfile = viewerUserId === user.id || viewerUserId === user.user_id;
  
  // Always show own profile with real name if available
  if (isOwnProfile) return false;
  
  // Show anonymously if user is anonymous and hasn't revealed identity
  return user.is_anonymous !== false && !user.can_reveal_identity;
}

/**
 * Get avatar URL for a user (respects privacy settings)
 */
export function getUserAvatarUrl(user: Record<string, unknown> | null, viewerUserId?: string): string | undefined {
  if (!user) return undefined;
  
  const isOwnProfile = viewerUserId === user.id || viewerUserId === user.user_id;
  
  // Show real avatar only if user has revealed identity or it's their own profile
  if (isOwnProfile || (user.can_reveal_identity && user.real_name_visibility)) {
    return user.avatar_url || user.avatar;
  }
  
  // Return undefined for anonymous users (will use fallback)
  return undefined;
}

// Import React hooks
import { useState, useEffect } from 'react';
