import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LifeWish {
  id: string;
  user_id: string;
  title: string;
  content: string;
  visibility: 'private' | 'public' | 'family';
  is_encrypted: boolean;
  encrypted_content?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface LifeWishShare {
  id: string;
  wish_id: string;
  shared_by: string;
  shared_with?: string;
  shared_email?: string;
  share_type: 'user' | 'email';
  permissions: Record<string, any>;
  created_at: string;
  expires_at?: string;
}

export interface LifeWishFormData {
  title: string;
  content: string;
  visibility: 'private' | 'public' | 'family';
  is_encrypted?: boolean;
}

export class LifeWishService {
  private static instance: LifeWishService;
  private encryptionKey: string = 'your-encryption-key'; // In production, use environment variables

  public static getInstance(): LifeWishService {
    if (!LifeWishService.instance) {
      LifeWishService.instance = new LifeWishService();
    }
    return LifeWishService.instance;
  }

  /**
   * Simple encryption function (replace with proper encryption in production)
   */
  private encryptText(text: string): string {
    // This is a simple base64 encoding - replace with proper encryption
    return btoa(text);
  }

  /**
   * Simple decryption function (replace with proper decryption in production)
   */
  private decryptText(encryptedText: string): string {
    // This is a simple base64 decoding - replace with proper decryption
    return atob(encryptedText);
  }

  /**
   * Create a new life wish
   */
  async createLifeWish(wishData: LifeWishFormData): Promise<LifeWish> {
    try {
      const { title, content, visibility, is_encrypted = true } = wishData;
      
      const processedData: Partial<LifeWish> = {
        title,
        visibility,
        is_encrypted
      };

      if (is_encrypted) {
        processedData.encrypted_content = this.encryptText(content);
        processedData.content = ''; // Don't store plain text
      } else {
        processedData.content = content;
      }

      const { data, error } = await supabase
        .from('life_wishes')
        .insert({
          ...processedData,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      // Decrypt content for return if encrypted
      if (data.is_encrypted && data.encrypted_content) {
        data.content = this.decryptText(data.encrypted_content);
      }

      toast.success('Life wish created successfully');
      return data;
    } catch (error) {
      console.error('Error creating life wish:', error);
      toast.error('Failed to create life wish');
      throw error;
    }
  }

  /**
   * Get all life wishes for the current user
   */
  async getMyLifeWishes(): Promise<LifeWish[]> {
    try {
      const { data, error } = await supabase
        .from('life_wishes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Decrypt content for encrypted wishes
      const decryptedWishes = (data || []).map(wish => {
        if (wish.is_encrypted && wish.encrypted_content) {
          wish.content = this.decryptText(wish.encrypted_content);
        }
        return wish;
      });

      return decryptedWishes;
    } catch (error) {
      console.error('Error fetching life wishes:', error);
      toast.error('Failed to fetch life wishes');
      throw error;
    }
  }

  /**
   * Get public life wishes (for community memorial space)
   */
  async getPublicLifeWishes(): Promise<LifeWish[]> {
    try {
      const { data, error } = await supabase
        .from('life_wishes')
        .select('*, user_profiles!inner(name, avatar_url)')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Decrypt content for encrypted wishes
      const decryptedWishes = (data || []).map(wish => {
        if (wish.is_encrypted && wish.encrypted_content) {
          wish.content = this.decryptText(wish.encrypted_content);
        }
        return wish;
      });

      return decryptedWishes;
    } catch (error) {
      console.error('Error fetching public life wishes:', error);
      toast.error('Failed to fetch public life wishes');
      throw error;
    }
  }

  /**
   * Get life wishes shared with the current user
   */
  async getSharedLifeWishes(): Promise<LifeWish[]> {
    try {
      const { data, error } = await supabase
        .from('life_wishes')
        .select(`
          *,
          life_wish_shares!inner(shared_with)
        `)
        .eq('life_wish_shares.shared_with', (await supabase.auth.getUser()).data.user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Decrypt content for encrypted wishes
      const decryptedWishes = (data || []).map(wish => {
        if (wish.is_encrypted && wish.encrypted_content) {
          wish.content = this.decryptText(wish.encrypted_content);
        }
        return wish;
      });

      return decryptedWishes;
    } catch (error) {
      console.error('Error fetching shared life wishes:', error);
      toast.error('Failed to fetch shared life wishes');
      throw error;
    }
  }

  /**
   * Get a specific life wish by ID
   */
  async getLifeWish(wishId: string): Promise<LifeWish | null> {
    try {
      const { data, error } = await supabase
        .from('life_wishes')
        .select('*')
        .eq('id', wishId)
        .single();

      if (error) throw error;

      if (!data) return null;

      // Decrypt content if encrypted
      if (data.is_encrypted && data.encrypted_content) {
        data.content = this.decryptText(data.encrypted_content);
      }

      return data;
    } catch (error) {
      console.error('Error fetching life wish:', error);
      toast.error('Failed to fetch life wish');
      throw error;
    }
  }

  /**
   * Update a life wish
   */
  async updateLifeWish(wishId: string, updates: Partial<LifeWishFormData>): Promise<LifeWish> {
    try {
      const processedUpdates: Partial<LifeWish> = {};

      if (updates.title) processedUpdates.title = updates.title;
      if (updates.visibility) processedUpdates.visibility = updates.visibility;
      if (updates.is_encrypted !== undefined) processedUpdates.is_encrypted = updates.is_encrypted;

      if (updates.content) {
        if (updates.is_encrypted !== false) {
          processedUpdates.encrypted_content = this.encryptText(updates.content);
          processedUpdates.content = ''; // Don't store plain text
        } else {
          processedUpdates.content = updates.content;
          processedUpdates.encrypted_content = null;
        }
      }

      const { data, error } = await supabase
        .from('life_wishes')
        .update(processedUpdates)
        .eq('id', wishId)
        .select()
        .single();

      if (error) throw error;

      // Decrypt content for return if encrypted
      if (data.is_encrypted && data.encrypted_content) {
        data.content = this.decryptText(data.encrypted_content);
      }

      toast.success('Life wish updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating life wish:', error);
      toast.error('Failed to update life wish');
      throw error;
    }
  }

  /**
   * Delete a life wish
   */
  async deleteLifeWish(wishId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('life_wishes')
        .delete()
        .eq('id', wishId);

      if (error) throw error;

      toast.success('Life wish deleted successfully');
    } catch (error) {
      console.error('Error deleting life wish:', error);
      toast.error('Failed to delete life wish');
      throw error;
    }
  }

  /**
   * Share a life wish with another user
   */
  async shareLifeWish(wishId: string, shareData: {
    shareType: 'user' | 'email';
    sharedWith?: string;
    sharedEmail?: string;
    permissions?: Record<string, any>;
    expiresAt?: string;
  }): Promise<LifeWishShare> {
    try {
      const { data, error } = await supabase
        .from('life_wish_shares')
        .insert({
          wish_id: wishId,
          shared_by: (await supabase.auth.getUser()).data.user?.id,
          shared_with: shareData.shareType === 'user' ? shareData.sharedWith : null,
          shared_email: shareData.shareType === 'email' ? shareData.sharedEmail : null,
          share_type: shareData.shareType,
          permissions: shareData.permissions || {},
          expires_at: shareData.expiresAt
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Life wish shared successfully');
      return data;
    } catch (error) {
      console.error('Error sharing life wish:', error);
      toast.error('Failed to share life wish');
      throw error;
    }
  }

  /**
   * Get shares for a specific life wish
   */
  async getLifeWishShares(wishId: string): Promise<LifeWishShare[]> {
    try {
      const { data, error } = await supabase
        .from('life_wish_shares')
        .select('*')
        .eq('wish_id', wishId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching life wish shares:', error);
      toast.error('Failed to fetch life wish shares');
      throw error;
    }
  }

  /**
   * Remove a share
   */
  async removeShare(shareId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('life_wish_shares')
        .delete()
        .eq('id', shareId);

      if (error) throw error;

      toast.success('Share removed successfully');
    } catch (error) {
      console.error('Error removing share:', error);
      toast.error('Failed to remove share');
      throw error;
    }
  }

  /**
   * Get user's shared life wishes (wishes they've shared with others)
   */
  async getMySharedWishes(): Promise<LifeWishShare[]> {
    try {
      const { data, error } = await supabase
        .from('life_wish_shares')
        .select(`
          *,
          life_wishes!inner(title, visibility)
        `)
        .eq('shared_by', (await supabase.auth.getUser()).data.user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching shared wishes:', error);
      toast.error('Failed to fetch shared wishes');
      throw error;
    }
  }

  /**
   * Check if user has permission to view a life wish
   */
  async hasPermissionToView(wishId: string): Promise<boolean> {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return false;

      // Check if user owns the wish
      const { data: ownedWish } = await supabase
        .from('life_wishes')
        .select('id')
        .eq('id', wishId)
        .eq('user_id', userId)
        .single();

      if (ownedWish) return true;

      // Check if wish is public
      const { data: publicWish } = await supabase
        .from('life_wishes')
        .select('id')
        .eq('id', wishId)
        .eq('visibility', 'public')
        .single();

      if (publicWish) return true;

      // Check if wish is shared with user
      const { data: sharedWish } = await supabase
        .from('life_wish_shares')
        .select('id')
        .eq('wish_id', wishId)
        .eq('shared_with', userId)
        .single();

      return !!sharedWish;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }

  /**
   * Get life wish statistics for the current user
   */
  async getLifeWishStats(): Promise<{
    total: number;
    private: number;
    public: number;
    family: number;
    shared: number;
  }> {
    try {
      const wishes = await this.getMyLifeWishes();
      const sharedWishes = await this.getMySharedWishes();

      return {
        total: wishes.length,
        private: wishes.filter(w => w.visibility === 'private').length,
        public: wishes.filter(w => w.visibility === 'public').length,
        family: wishes.filter(w => w.visibility === 'family').length,
        shared: sharedWishes.length
      };
    } catch (error) {
      console.error('Error fetching life wish stats:', error);
      return {
        total: 0,
        private: 0,
        public: 0,
        family: 0,
        shared: 0
      };
    }
  }
}

export const lifeWishService = LifeWishService.getInstance();
