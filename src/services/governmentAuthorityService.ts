import { supabase } from '@/integrations/supabase/client';
import { anonymousUserService } from './anonymousUserService';

export interface GovernmentAuthority {
  id: string;
  name: string;
  department: string;
  level: 'local' | 'state' | 'national';
  jurisdiction: string;
  contact_email?: string;
  contact_phone?: string;
  contact_address?: string;
  website_url?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GovernmentTag {
  id: string;
  post_id?: string;
  anonymous_post_id?: string;
  authority_id: string;
  user_id?: string;
  session_id?: string;
  tag_type: 'issue' | 'complaint' | 'suggestion' | 'request' | 'feedback';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'acknowledged' | 'in_progress' | 'resolved' | 'closed';
  description?: string;
  response_text?: string;
  response_date?: string;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  authority?: GovernmentAuthority;
}

export interface TagCreateOptions {
  postId?: string;
  anonymousPostId?: string;
  tagType?: GovernmentTag['tag_type'];
  priority?: GovernmentTag['priority'];
  description?: string;
  isAnonymous?: boolean;
}

export interface AuthorityFilterOptions {
  level?: 'local' | 'state' | 'national';
  jurisdiction?: string;
  department?: string;
  isActive?: boolean;
  searchQuery?: string;
}

export class GovernmentAuthorityService {
  private static instance: GovernmentAuthorityService;
  private authorities: GovernmentAuthority[] = [];
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  public static getInstance(): GovernmentAuthorityService {
    if (!GovernmentAuthorityService.instance) {
      GovernmentAuthorityService.instance = new GovernmentAuthorityService();
    }
    return GovernmentAuthorityService.instance;
  }

  /**
   * Get all government authorities with caching
   */
  async getAuthorities(options: AuthorityFilterOptions = {}): Promise<GovernmentAuthority[]> {
    const now = Date.now();
    
    // Return cached data if still fresh
    if (this.authorities.length > 0 && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.filterAuthorities(this.authorities, options);
    }

    try {
      const { data, error } = await supabase
        .from('government_authorities')
        .select('*')
        .eq('is_active', true)
        .order('level', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;

      this.authorities = data || [];
      this.lastFetch = now;
      
      return this.filterAuthorities(this.authorities, options);
    } catch (error) {
      console.error('Error fetching government authorities:', error);
      return [];
    }
  }

  /**
   * Filter authorities based on options
   */
  private filterAuthorities(
    authorities: GovernmentAuthority[], 
    options: AuthorityFilterOptions
  ): GovernmentAuthority[] {
    let filtered = [...authorities];

    if (options.level) {
      filtered = filtered.filter(auth => auth.level === options.level);
    }

    if (options.jurisdiction) {
      filtered = filtered.filter(auth => 
        auth.jurisdiction.toLowerCase().includes(options.jurisdiction!.toLowerCase())
      );
    }

    if (options.department) {
      filtered = filtered.filter(auth => 
        auth.department.toLowerCase().includes(options.department!.toLowerCase())
      );
    }

    if (options.searchQuery) {
      const query = options.searchQuery.toLowerCase();
      filtered = filtered.filter(auth =>
        auth.name.toLowerCase().includes(query) ||
        auth.department.toLowerCase().includes(query) ||
        auth.jurisdiction.toLowerCase().includes(query) ||
        (auth.description && auth.description.toLowerCase().includes(query))
      );
    }

    return filtered;
  }

  /**
   * Get authority by ID
   */
  async getAuthorityById(id: string): Promise<GovernmentAuthority | null> {
    try {
      // Check cache first
      const cached = this.authorities.find(auth => auth.id === id);
      if (cached) return cached;

      const { data, error } = await supabase
        .from('government_authorities')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching authority by ID:', error);
      return null;
    }
  }

  /**
   * Create a government tag
   */
  async createTag(
    authorityId: string,
    options: TagCreateOptions = {}
  ): Promise<GovernmentTag> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = options.isAnonymous ? 
        await anonymousUserService.getCurrentSessionId() : 
        undefined;

      const tagData = {
        post_id: options.postId,
        anonymous_post_id: options.anonymousPostId,
        authority_id: authorityId,
        user_id: user?.id,
        session_id: sessionId,
        tag_type: options.tagType || 'issue',
        priority: options.priority || 'medium',
        description: options.description,
        is_anonymous: options.isAnonymous || false
      };

      const { data, error } = await supabase
        .from('government_tags')
        .insert(tagData)
        .select(`
          *,
          authority:government_authorities(*)
        `)
        .single();

      if (error) throw error;

      // Create privacy audit log for anonymous tagging
      if (options.isAnonymous && sessionId) {
        await this.logAnonymousTagging(sessionId, authorityId, data.id);
      }

      return data;
    } catch (error) {
      console.error('Error creating government tag:', error);
      throw error;
    }
  }

  /**
   * Get tags for a specific authority
   */
  async getTagsByAuthority(
    authorityId: string,
    options: {
      status?: GovernmentTag['status'];
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<GovernmentTag[]> {
    try {
      let query = supabase
        .from('government_tags')
        .select(`
          *,
          authority:government_authorities(*)
        `)
        .eq('authority_id', authorityId)
        .order('created_at', { ascending: false });

      if (options.status) {
        query = query.eq('status', options.status);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tags by authority:', error);
      return [];
    }
  }

  /**
   * Get user's tags (authenticated or anonymous)
   */
  async getUserTags(options: {
    userId?: string;
    sessionId?: string;
    status?: GovernmentTag['status'];
    limit?: number;
    offset?: number;
  } = {}): Promise<GovernmentTag[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      let query = supabase
        .from('government_tags')
        .select(`
          *,
          authority:government_authorities(*)
        `)
        .order('created_at', { ascending: false });

      // Filter by user or session
      if (options.userId || user?.id) {
        query = query.eq('user_id', options.userId || user?.id);
      } else if (options.sessionId) {
        query = query.eq('session_id', options.sessionId);
      } else {
        // Get current session ID for anonymous user
        const sessionId = await anonymousUserService.getCurrentSessionId();
        if (sessionId) {
          query = query.eq('session_id', sessionId);
        } else {
          return [];
        }
      }

      if (options.status) {
        query = query.eq('status', options.status);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user tags:', error);
      return [];
    }
  }

  /**
   * Update tag status (for authorities/admins)
   */
  async updateTagStatus(
    tagId: string,
    status: GovernmentTag['status'],
    responseText?: string
  ): Promise<GovernmentTag> {
    try {
      const updateData: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString()
      };

      if (responseText) {
        updateData.response_text = responseText;
        updateData.response_date = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('government_tags')
        .update(updateData)
        .eq('id', tagId)
        .select(`
          *,
          authority:government_authorities(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating tag status:', error);
      throw error;
    }
  }

  /**
   * Get tag statistics for an authority
   */
  async getAuthorityTagStats(authorityId: string): Promise<{
    total: number;
    byStatus: Record<GovernmentTag['status'], number>;
    byPriority: Record<GovernmentTag['priority'], number>;
    byType: Record<GovernmentTag['tag_type'], number>;
    avgResponseTime: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('government_tags')
        .select('status, priority, tag_type, created_at, response_date')
        .eq('authority_id', authorityId);

      if (error) throw error;

      const stats = {
        total: data.length,
        byStatus: {
          pending: 0,
          acknowledged: 0,
          in_progress: 0,
          resolved: 0,
          closed: 0
        } as Record<GovernmentTag['status'], number>,
        byPriority: {
          low: 0,
          medium: 0,
          high: 0,
          urgent: 0
        } as Record<GovernmentTag['priority'], number>,
        byType: {
          issue: 0,
          complaint: 0,
          suggestion: 0,
          request: 0,
          feedback: 0
        } as Record<GovernmentTag['tag_type'], number>,
        avgResponseTime: 0
      };

      let totalResponseTime = 0;
      let respondedCount = 0;

      data.forEach(tag => {
        stats.byStatus[tag.status]++;
        stats.byPriority[tag.priority]++;
        stats.byType[tag.tag_type]++;

        if (tag.response_date) {
          const responseTime = new Date(tag.response_date).getTime() - new Date(tag.created_at).getTime();
          totalResponseTime += responseTime;
          respondedCount++;
        }
      });

      if (respondedCount > 0) {
        stats.avgResponseTime = totalResponseTime / respondedCount / (1000 * 60 * 60); // Convert to hours
      }

      return stats;
    } catch (error) {
      console.error('Error fetching authority tag stats:', error);
      return {
        total: 0,
        byStatus: { pending: 0, acknowledged: 0, in_progress: 0, resolved: 0, closed: 0 },
        byPriority: { low: 0, medium: 0, high: 0, urgent: 0 },
        byType: { issue: 0, complaint: 0, suggestion: 0, request: 0, feedback: 0 },
        avgResponseTime: 0
      };
    }
  }

  /**
   * Search authorities by location
   */
  async getAuthoritiesByLocation(location: {
    city?: string;
    state?: string;
    country?: string;
  }): Promise<GovernmentAuthority[]> {
    try {
      const { city, state, country } = location;
      let query = supabase
        .from('government_authorities')
        .select('*')
        .eq('is_active', true);

      // Build location filter
      if (city) {
        query = query.ilike('jurisdiction', `%${city}%`);
      } else if (state) {
        query = query.ilike('jurisdiction', `%${state}%`);
      } else if (country) {
        query = query.ilike('jurisdiction', `%${country}%`);
      }

      const { data, error } = await query.order('level', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching authorities by location:', error);
      return [];
    }
  }

  /**
   * Log anonymous tagging for audit trail
   */
  private async logAnonymousTagging(
    sessionId: string,
    authorityId: string,
    tagId: string
  ): Promise<void> {
    try {
      await supabase
        .from('privacy_audit_log')
        .insert({
          user_id: null,
          session_id: sessionId,
          action: 'government_tag_created',
          details: {
            authority_id: authorityId,
            tag_id: tagId,
            privacy_level: 'anonymous'
          }
        });
    } catch (error) {
      console.error('Error logging anonymous tagging:', error);
    }
  }

  /**
   * Clear cache (useful for testing or when authorities are updated)
   */
  clearCache(): void {
    this.authorities = [];
    this.lastFetch = 0;
  }
}

export const governmentAuthorityService = GovernmentAuthorityService.getInstance();
