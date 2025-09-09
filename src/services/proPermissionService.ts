import { supabase } from '@/integrations/supabase/client';
import { subscriptionService } from './subscriptionService';

export interface ProPermission {
  can_comment_news: boolean;
  can_feature_listing: boolean;
  has_priority_support: boolean;
  is_pro: boolean;
}

export class ProPermissionService {
  private static permissionCache = new Map<string, { permission: ProPermission; timestamp: number }>();
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Check if user has Pro permissions
   */
  static async checkProPermissions(userId: string): Promise<ProPermission> {
    // Check cache first
    const cached = this.permissionCache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.permission;
    }

    try {
      const subscriptionStatus = await subscriptionService.getUserSubscriptionStatus(userId);
      
      const permission: ProPermission = {
        can_comment_news: subscriptionStatus.can_comment_news,
        can_feature_listing: subscriptionStatus.can_feature_listing,
        has_priority_support: subscriptionStatus.has_priority_support,
        is_pro: subscriptionStatus.is_pro,
      };

      // Cache the result
      this.permissionCache.set(userId, {
        permission,
        timestamp: Date.now(),
      });

      return permission;
    } catch (error) {
      console.error('Error checking Pro permissions:', error);
      return {
        can_comment_news: false,
        can_feature_listing: false,
        has_priority_support: false,
        is_pro: false,
      };
    }
  }

  /**
   * Check if user can comment on news articles
   */
  static async canCommentOnNews(userId: string): Promise<boolean> {
    const permissions = await this.checkProPermissions(userId);
    return permissions.can_comment_news;
  }

  /**
   * Check if user can feature listings
   */
  static async canFeatureListing(userId: string): Promise<boolean> {
    const permissions = await this.checkProPermissions(userId);
    return permissions.can_feature_listing;
  }

  /**
   * Check if user has priority support
   */
  static async hasPrioritySupport(userId: string): Promise<boolean> {
    const permissions = await this.checkProPermissions(userId);
    return permissions.has_priority_support;
  }

  /**
   * Check if user is Pro
   */
  static async isProUser(userId: string): Promise<boolean> {
    const permissions = await this.checkProPermissions(userId);
    return permissions.is_pro;
  }

  /**
   * Clear permission cache for a user
   */
  static clearUserCache(userId: string): void {
    this.permissionCache.delete(userId);
  }

  /**
   * Clear all permission cache
   */
  static clearAllCache(): void {
    this.permissionCache.clear();
  }

  /**
   * Middleware function to check Pro permissions for API routes
   */
  static async checkProPermissionMiddleware(
    userId: string,
    requiredPermission: keyof ProPermission
  ): Promise<{ allowed: boolean; permission?: ProPermission }> {
    try {
      const permission = await this.checkProPermissions(userId);
      
      if (!permission[requiredPermission]) {
        return { allowed: false, permission };
      }

      return { allowed: true, permission };
    } catch (error) {
      console.error('Error in Pro permission middleware:', error);
      return { allowed: false };
    }
  }

  /**
   * Database-level permission check using the is_pro_user function
   */
  static async checkProPermissionInDatabase(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('is_pro_user', {
        user_id_param: userId
      });

      if (error) {
        console.error('Error checking Pro permission in database:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Error in database Pro permission check:', error);
      return false;
    }
  }

  /**
   * Get user's subscription status with caching
   */
  static async getUserSubscriptionStatus(userId: string) {
    return await subscriptionService.getUserSubscriptionStatus(userId);
  }

  /**
   * Validate Pro feature access for a specific action
   */
  static async validateProFeatureAccess(
    userId: string,
    feature: 'news_comments' | 'featured_listing' | 'priority_support'
  ): Promise<{ valid: boolean; message?: string }> {
    try {
      const permissions = await this.checkProPermissions(userId);

      switch (feature) {
        case 'news_comments':
          if (!permissions.can_comment_news) {
            return {
              valid: false,
              message: 'Pro subscription required to comment on news articles'
            };
          }
          break;

        case 'featured_listing':
          if (!permissions.can_feature_listing) {
            return {
              valid: false,
              message: 'Pro subscription required for featured listings'
            };
          }
          break;

        case 'priority_support':
          if (!permissions.has_priority_support) {
            return {
              valid: false,
              message: 'Pro subscription required for priority support'
            };
          }
          break;

        default:
          return {
            valid: false,
            message: 'Invalid feature specified'
          };
      }

      return { valid: true };
    } catch (error) {
      console.error('Error validating Pro feature access:', error);
      return {
        valid: false,
        message: 'Error validating feature access'
      };
    }
  }
}

// Export convenience functions
export const canCommentOnNews = ProPermissionService.canCommentOnNews;
export const canFeatureListing = ProPermissionService.canFeatureListing;
export const hasPrioritySupport = ProPermissionService.hasPrioritySupport;
export const isProUser = ProPermissionService.isProUser;
export const checkProPermissions = ProPermissionService.checkProPermissions;
