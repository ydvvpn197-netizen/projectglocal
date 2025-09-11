import { supabase } from '@/integrations/supabase/client';

export interface LocalBusiness {
  id: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  phone?: string;
  email?: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
  business_hours?: {
    monday?: { open: string; close: string; closed?: boolean };
    tuesday?: { open: string; close: string; closed?: boolean };
    wednesday?: { open: string; close: string; closed?: boolean };
    thursday?: { open: string; close: string; closed?: boolean };
    friday?: { open: string; close: string; closed?: boolean };
    saturday?: { open: string; close: string; closed?: boolean };
    sunday?: { open: string; close: string; closed?: boolean };
  };
  price_range?: '$' | '$$' | '$$$' | '$$$$';
  rating?: number;
  review_count: number;
  verified: boolean;
  owner_id?: string;
  owner_name?: string;
  owner_avatar?: string;
  image_urls?: string[];
  tags?: string[];
  amenities?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LocalBusinessWithProfile extends LocalBusiness {
  profiles?: {
    display_name?: string;
    avatar_url?: string;
  };
}

export interface BusinessReview {
  id: string;
  business_id: string;
  user_id?: string;
  anonymous_user_id?: string;
  is_anonymous: boolean;
  rating: number;
  title?: string;
  content: string;
  images?: string[];
  helpful_count: number;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_avatar?: string;
}

export interface BusinessClaim {
  id: string;
  business_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  verification_documents?: string[];
  message?: string;
  created_at: string;
  updated_at: string;
}

export class LocalBusinessService {
  // Business Management
  static async getBusinesses(filters?: {
    city?: string;
    state?: string;
    category?: string;
    subcategory?: string;
    verified?: boolean;
    min_rating?: number;
    price_range?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ businesses: LocalBusiness[]; error?: string }> {
    try {
      let query = supabase
        .from('local_businesses')
        .select(`
          *,
          profiles:owner_id (
            display_name,
            avatar_url
          )
        `)
        .eq('is_active', true);

      if (filters?.city) {
        query = query.eq('city', filters.city);
      }

      if (filters?.state) {
        query = query.eq('state', filters.state);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.subcategory) {
        query = query.eq('subcategory', filters.subcategory);
      }

      if (filters?.verified !== undefined) {
        query = query.eq('verified', filters.verified);
      }

      if (filters?.min_rating) {
        query = query.gte('rating', filters.min_rating);
      }

      if (filters?.price_range) {
        query = query.eq('price_range', filters.price_range);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,tags.cs.{${filters.search}}`);
      }

      query = query.order('rating', { ascending: false, nullsLast: true });

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;

      const businesses: LocalBusiness[] = (data || []).map((business: LocalBusinessWithProfile) => ({
        ...business,
        owner_name: business.profiles?.display_name,
        owner_avatar: business.profiles?.avatar_url
      }));

      return { businesses };
    } catch (error) {
      console.error('Error fetching businesses:', error);
      return { businesses: [], error: error instanceof Error ? error.message : 'Failed to fetch businesses' };
    }
  }

  static async getBusinessById(businessId: string): Promise<{ business: LocalBusiness | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('local_businesses')
        .select(`
          *,
          profiles:owner_id (
            display_name,
            avatar_url
          )
        `)
        .eq('id', businessId)
        .single();

      if (error) throw error;

      const business: LocalBusiness = {
        ...data,
        owner_name: data.profiles?.display_name,
        owner_avatar: data.profiles?.avatar_url
      };

      return { business };
    } catch (error) {
      console.error('Error fetching business:', error);
      return { business: null, error: error instanceof Error ? error.message : 'Failed to fetch business' };
    }
  }

  static async getNearbyBusinesses(
    latitude: number,
    longitude: number,
    radiusKm: number = 10,
    limit: number = 20
  ): Promise<{ businesses: LocalBusiness[]; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('get_nearby_businesses', {
        lat: latitude,
        lng: longitude,
        radius_km: radiusKm,
        limit_count: limit
      });

      if (error) throw error;

      return { businesses: data || [] };
    } catch (error) {
      console.error('Error fetching nearby businesses:', error);
      return { businesses: [], error: error instanceof Error ? error.message : 'Failed to fetch nearby businesses' };
    }
  }

  static async createBusiness(businessData: Omit<LocalBusiness, 'id' | 'created_at' | 'updated_at' | 'review_count' | 'rating'>): Promise<{ business: LocalBusiness | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('local_businesses')
        .insert(businessData)
        .select()
        .single();

      if (error) throw error;

      return { business: data };
    } catch (error) {
      console.error('Error creating business:', error);
      return { business: null, error: error instanceof Error ? error.message : 'Failed to create business' };
    }
  }

  static async updateBusiness(businessId: string, updates: Partial<LocalBusiness>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('local_businesses')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', businessId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error updating business:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update business' };
    }
  }

  // Reviews Management
  static async getBusinessReviews(businessId: string, limit: number = 20, offset: number = 0): Promise<{ reviews: BusinessReview[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('business_reviews')
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar_url
          )
        `)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const reviews: BusinessReview[] = (data || []).map((review: BusinessReview) => ({
        ...review,
        user_name: review.profiles?.display_name,
        user_avatar: review.profiles?.avatar_url
      }));

      return { reviews };
    } catch (error) {
      console.error('Error fetching business reviews:', error);
      return { reviews: [], error: error instanceof Error ? error.message : 'Failed to fetch reviews' };
    }
  }

  static async createReview(reviewData: Omit<BusinessReview, 'id' | 'created_at' | 'updated_at' | 'helpful_count'>): Promise<{ review: BusinessReview | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('business_reviews')
        .insert(reviewData)
        .select()
        .single();

      if (error) throw error;

      // Update business rating
      await this.updateBusinessRating(reviewData.business_id);

      return { review: data };
    } catch (error) {
      console.error('Error creating review:', error);
      return { review: null, error: error instanceof Error ? error.message : 'Failed to create review' };
    }
  }

  static async updateBusinessRating(businessId: string): Promise<void> {
    try {
      const { data: reviews } = await supabase
        .from('business_reviews')
        .select('rating')
        .eq('business_id', businessId);

      if (reviews && reviews.length > 0) {
        const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
        const reviewCount = reviews.length;

        await supabase
          .from('local_businesses')
          .update({
            rating: Math.round(averageRating * 10) / 10,
            review_count: reviewCount
          })
          .eq('id', businessId);
      }
    } catch (error) {
      console.error('Error updating business rating:', error);
    }
  }

  // Business Claims
  static async claimBusiness(businessId: string, claimData: Omit<BusinessClaim, 'id' | 'business_id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('business_claims')
        .insert({
          business_id: businessId,
          ...claimData
        });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error claiming business:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to claim business' };
    }
  }

  static async getUserClaims(userId: string): Promise<{ claims: BusinessClaim[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('business_claims')
        .select(`
          *,
          local_businesses (
            name,
            address,
            city,
            state
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { claims: data || [] };
    } catch (error) {
      console.error('Error fetching user claims:', error);
      return { claims: [], error: error instanceof Error ? error.message : 'Failed to fetch claims' };
    }
  }

  // Categories and Search
  static async getBusinessCategories(): Promise<{ categories: string[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('local_businesses')
        .select('category')
        .eq('is_active', true);

      if (error) throw error;

      const categories = [...new Set((data || []).map(item => item.category))].sort();
      return { categories };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { categories: [], error: error instanceof Error ? error.message : 'Failed to fetch categories' };
    }
  }

  static async searchBusinesses(query: string, filters?: {
    city?: string;
    category?: string;
    limit?: number;
  }): Promise<{ businesses: LocalBusiness[]; error?: string }> {
    try {
      let searchQuery = supabase
        .from('local_businesses')
        .select(`
          *,
          profiles:owner_id (
            display_name,
            avatar_url
          )
        `)
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`);

      if (filters?.city) {
        searchQuery = searchQuery.eq('city', filters.city);
      }

      if (filters?.category) {
        searchQuery = searchQuery.eq('category', filters.category);
      }

      if (filters?.limit) {
        searchQuery = searchQuery.limit(filters.limit);
      }

      const { data, error } = await searchQuery;

      if (error) throw error;

      const businesses: LocalBusiness[] = (data || []).map((business: LocalBusinessWithProfile) => ({
        ...business,
        owner_name: business.profiles?.display_name,
        owner_avatar: business.profiles?.avatar_url
      }));

      return { businesses };
    } catch (error) {
      console.error('Error searching businesses:', error);
      return { businesses: [], error: error instanceof Error ? error.message : 'Failed to search businesses' };
    }
  }

  // Analytics
  static async getBusinessAnalytics(businessId: string): Promise<{
    totalViews: number;
    totalReviews: number;
    averageRating: number;
    recentReviews: BusinessReview[];
    error?: string;
  }> {
    try {
      const [businessResult, reviewsResult] = await Promise.all([
        this.getBusinessById(businessId),
        this.getBusinessReviews(businessId, 5)
      ]);

      if (businessResult.error) {
        return {
          totalViews: 0,
          totalReviews: 0,
          averageRating: 0,
          recentReviews: [],
          error: businessResult.error
        };
      }

      return {
        totalViews: businessResult.business?.review_count || 0,
        totalReviews: businessResult.business?.review_count || 0,
        averageRating: businessResult.business?.rating || 0,
        recentReviews: reviewsResult.reviews,
        error: reviewsResult.error
      };
    } catch (error) {
      console.error('Error fetching business analytics:', error);
      return {
        totalViews: 0,
        totalReviews: 0,
        averageRating: 0,
        recentReviews: [],
        error: error instanceof Error ? error.message : 'Failed to fetch analytics'
      };
    }
  }
}
