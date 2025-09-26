/**
 * Life Wish Service
 * Manages user's legacy wishes and memorial content
 */

import { supabase } from '@/integrations/supabase/client';

export interface LifeWish {
  id: string;
  userId: string;
  title: string;
  content: string;
  visibility: 'public' | 'private' | 'family';
  category: 'legacy' | 'values' | 'memories' | 'advice' | 'other';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface LifeWishTimeline {
  id: string;
  userId: string;
  wishId: string;
  content: string;
  timestamp: string;
  isPublic: boolean;
}

export interface MemorialProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  avatar?: string;
  isMemorial: boolean;
  memorialDate?: string;
  wishes: LifeWish[];
  createdAt: string;
  updatedAt: string;
}

export class LifeWishService {
  private static instance: LifeWishService;

  static getInstance(): LifeWishService {
    if (!LifeWishService.instance) {
      LifeWishService.instance = new LifeWishService();
    }
    return LifeWishService.instance;
  }

  /**
   * Create a new life wish
   */
  async createLifeWish(
    title: string,
    content: string,
    visibility: 'public' | 'private' | 'family',
    category: string,
    tags: string[] = []
  ): Promise<LifeWish> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('life_wishes')
      .insert({
        user_id: user.id,
        title,
        content,
        visibility,
        category,
        tags,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get user's life wishes
   */
  async getUserWishes(): Promise<LifeWish[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('life_wishes')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Update a life wish
   */
  async updateLifeWish(
    wishId: string,
    updates: Partial<Pick<LifeWish, 'title' | 'content' | 'visibility' | 'category' | 'tags'>>
  ): Promise<LifeWish> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('life_wishes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', wishId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a life wish (soft delete)
   */
  async deleteLifeWish(wishId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('life_wishes')
      .update({ is_active: false })
      .eq('id', wishId)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  /**
   * Get public life wishes for community memorial
   */
  async getPublicWishes(limit: number = 20, offset: number = 0): Promise<LifeWish[]> {
    const { data, error } = await supabase
      .from('life_wishes')
      .select(`
        *,
        profiles:user_id (
          display_name,
          avatar_url,
          is_anonymous
        )
      `)
      .eq('visibility', 'public')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get family wishes (for designated family members)
   */
  async getFamilyWishes(): Promise<LifeWish[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if user has family access to any profiles
    const { data: familyAccess, error: accessError } = await supabase
      .from('family_access')
      .select('profile_id')
      .eq('user_id', user.id)
      .eq('status', 'approved');

    if (accessError) throw accessError;

    if (familyAccess && familyAccess.length > 0) {
      const profileIds = familyAccess.map(access => access.profile_id);
      
      const { data, error } = await supabase
        .from('life_wishes')
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar_url
          )
        `)
        .in('user_id', profileIds)
        .eq('visibility', 'family')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }

    return [];
  }

  /**
   * Add entry to life wish timeline
   */
  async addTimelineEntry(
    wishId: string,
    content: string,
    isPublic: boolean = false
  ): Promise<LifeWishTimeline> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Verify user owns the wish
    const { data: wish, error: wishError } = await supabase
      .from('life_wishes')
      .select('user_id')
      .eq('id', wishId)
      .eq('user_id', user.id)
      .single();

    if (wishError || !wish) throw new Error('Wish not found or access denied');

    const { data, error } = await supabase
      .from('life_wish_timeline')
      .insert({
        user_id: user.id,
        wish_id: wishId,
        content,
        is_public: isPublic
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get timeline entries for a wish
   */
  async getWishTimeline(wishId: string): Promise<LifeWishTimeline[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('life_wish_timeline')
      .select('*')
      .eq('wish_id', wishId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Create or update memorial profile
   */
  async updateMemorialProfile(
    displayName: string,
    bio: string,
    avatar?: string,
    isMemorial: boolean = false,
    memorialDate?: string
  ): Promise<MemorialProfile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if memorial profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('memorial_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('memorial_profiles')
        .update({
          display_name: displayName,
          bio,
          avatar_url: avatar,
          is_memorial: isMemorial,
          memorial_date: memorialDate,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('memorial_profiles')
        .insert({
          user_id: user.id,
          display_name: displayName,
          bio,
          avatar_url: avatar,
          is_memorial: isMemorial,
          memorial_date: memorialDate
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  /**
   * Get memorial profile
   */
  async getMemorialProfile(): Promise<MemorialProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('memorial_profiles')
      .select(`
        *,
        life_wishes!inner(*)
      `)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  /**
   * Get public memorial profiles
   */
  async getPublicMemorials(limit: number = 20, offset: number = 0): Promise<MemorialProfile[]> {
    const { data, error } = await supabase
      .from('memorial_profiles')
      .select(`
        *,
        life_wishes!inner(*)
      `)
      .eq('is_memorial', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  /**
   * Search life wishes by tags or content
   */
  async searchWishes(query: string, category?: string): Promise<LifeWish[]> {
    let supabaseQuery = supabase
      .from('life_wishes')
      .select(`
        *,
        profiles:user_id (
          display_name,
          avatar_url,
          is_anonymous
        )
      `)
      .eq('visibility', 'public')
      .eq('is_active', true);

    if (category) {
      supabaseQuery = supabaseQuery.eq('category', category);
    }

    if (query) {
      supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%,tags.cs.{${query}}`);
    }

    const { data, error } = await supabaseQuery.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get wish statistics for user
   */
  async getWishStats(): Promise<{
    totalWishes: number;
    publicWishes: number;
    privateWishes: number;
    familyWishes: number;
    categories: Record<string, number>;
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('life_wishes')
      .select('visibility, category')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (error) throw error;

    const stats = {
      totalWishes: data?.length || 0,
      publicWishes: data?.filter(w => w.visibility === 'public').length || 0,
      privateWishes: data?.filter(w => w.visibility === 'private').length || 0,
      familyWishes: data?.filter(w => w.visibility === 'family').length || 0,
      categories: {} as Record<string, number>
    };

    // Count by category
    data?.forEach(wish => {
      stats.categories[wish.category] = (stats.categories[wish.category] || 0) + 1;
    });

    return stats;
  }

  /**
   * Request family access to someone's memorial
   */
  async requestFamilyAccess(profileUserId: string, relationship: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('family_access')
      .insert({
        user_id: user.id,
        profile_id: profileUserId,
        relationship,
        status: 'pending'
      });

    if (error) throw error;
  }

  /**
   * Get pending family access requests
   */
  async getPendingFamilyRequests(): Promise<Array<{
    id: string;
    user_id: string;
    profile_id: string;
    relationship: string;
    status: string;
    created_at: string;
    requester: {
      display_name: string;
      avatar_url: string;
    };
  }>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('family_access')
      .select(`
        *,
        requester:user_id (
          display_name,
          avatar_url
        )
      `)
      .eq('profile_id', user.id)
      .eq('status', 'pending');

    if (error) throw error;
    return data || [];
  }

  /**
   * Approve or deny family access request
   */
  async updateFamilyAccessRequest(requestId: string, status: 'approved' | 'denied'): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('family_access')
      .update({ status })
      .eq('id', requestId)
      .eq('profile_id', user.id);

    if (error) throw error;
  }
}

export const lifeWishService = LifeWishService.getInstance();
