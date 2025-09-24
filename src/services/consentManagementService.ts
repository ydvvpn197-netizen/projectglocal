import { supabase } from '@/integrations/supabase/client';

export interface ConsentRecord {
  id: string;
  user_id: string;
  category: string;
  purpose: string;
  granted: boolean;
  granted_at?: string;
  revoked_at?: string;
  expires_at?: string;
  legal_basis: 'consent' | 'legitimate_interest' | 'contract' | 'legal_obligation';
  data_categories: string[];
  processing_activities: string[];
  retention_period?: number; // in days
  created_at: string;
  updated_at: string;
}

export interface ConsentTemplate {
  id: string;
  category: string;
  purpose: string;
  description: string;
  legal_basis: ConsentRecord['legal_basis'];
  data_categories: string[];
  processing_activities: string[];
  retention_period: number;
  required: boolean;
  default_granted: boolean;
  expires_after_days?: number;
}

export interface DataRetentionPolicy {
  id: string;
  category: string;
  description: string;
  retention_period: number; // in days
  auto_delete: boolean;
  legal_basis: string;
  exceptions: string[];
  created_at: string;
  updated_at: string;
}

export class ConsentManagementService {
  private static instance: ConsentManagementService;
  
  public static getInstance(): ConsentManagementService {
    if (!ConsentManagementService.instance) {
      ConsentManagementService.instance = new ConsentManagementService();
    }
    return ConsentManagementService.instance;
  }

  /**
   * Get all consent records for the current user
   */
  async getUserConsentRecords(): Promise<ConsentRecord[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('consent_records')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching consent records:', error);
      return [];
    }
  }

  /**
   * Get available consent templates
   */
  async getConsentTemplates(): Promise<ConsentTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('consent_templates')
        .select('*')
        .eq('active', true)
        .order('category', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching consent templates:', error);
      return [];
    }
  }

  /**
   * Grant or revoke consent for a specific category
   */
  async updateConsent(
    category: string,
    granted: boolean,
    purpose?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get the consent template for this category
      const { data: template } = await supabase
        .from('consent_templates')
        .select('*')
        .eq('category', category)
        .eq('active', true)
        .single();

      if (!template) {
        throw new Error('Consent template not found');
      }

      // Check if consent record already exists
      const { data: existingConsent } = await supabase
        .from('consent_records')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', category)
        .single();

      const now = new Date().toISOString();
      const expiresAt = template.expires_after_days 
        ? new Date(Date.now() + template.expires_after_days * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

      if (existingConsent) {
        // Update existing consent
        const { error } = await supabase
          .from('consent_records')
          .update({
            granted,
            granted_at: granted ? now : existingConsent.granted_at,
            revoked_at: granted ? null : now,
            expires_at: granted ? expiresAt : existingConsent.expires_at,
            updated_at: now
          })
          .eq('id', existingConsent.id);

        if (error) {
          throw error;
        }
      } else {
        // Create new consent record
        const { error } = await supabase
          .from('consent_records')
          .insert({
            user_id: user.id,
            category,
            purpose: purpose || template.purpose,
            granted,
            granted_at: granted ? now : null,
            revoked_at: granted ? null : now,
            expires_at: granted ? expiresAt : null,
            legal_basis: template.legal_basis,
            data_categories: template.data_categories,
            processing_activities: template.processing_activities,
            retention_period: template.retention_period
          });

        if (error) {
          throw error;
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating consent:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get data retention policies
   */
  async getDataRetentionPolicies(): Promise<DataRetentionPolicy[]> {
    try {
      const { data, error } = await supabase
        .from('data_retention_policies')
        .select('*')
        .eq('active', true)
        .order('category', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching data retention policies:', error);
      return [];
    }
  }

  /**
   * Check if user has granted consent for a specific category
   */
  async hasConsent(category: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return false;
      }

      const { data } = await supabase
        .from('consent_records')
        .select('granted, expires_at')
        .eq('user_id', user.id)
        .eq('category', category)
        .single();

      if (!data) {
        return false;
      }

      // Check if consent has expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return false;
      }

      return data.granted;
    } catch (error) {
      console.error('Error checking consent:', error);
      return false;
    }
  }

  /**
   * Get consent summary for the current user
   */
  async getConsentSummary(): Promise<{
    totalCategories: number;
    grantedCategories: number;
    revokedCategories: number;
    expiredCategories: number;
    requiredCategories: number;
    missingRequiredConsents: string[];
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get all consent records
      const consentRecords = await this.getUserConsentRecords();
      
      // Get all consent templates
      const templates = await this.getConsentTemplates();

      const now = new Date();
      let grantedCategories = 0;
      let revokedCategories = 0;
      let expiredCategories = 0;
      const missingRequiredConsents: string[] = [];

      // Check each template
      templates.forEach(template => {
        const consent = consentRecords.find(c => c.category === template.category);
        
        if (!consent) {
          if (template.required) {
            missingRequiredConsents.push(template.category);
          }
          return;
        }

        if (consent.expires_at && new Date(consent.expires_at) < now) {
          expiredCategories++;
        } else if (consent.granted) {
          grantedCategories++;
        } else {
          revokedCategories++;
        }
      });

      return {
        totalCategories: templates.length,
        grantedCategories,
        revokedCategories,
        expiredCategories,
        requiredCategories: templates.filter(t => t.required).length,
        missingRequiredConsents
      };
    } catch (error) {
      console.error('Error getting consent summary:', error);
      return {
        totalCategories: 0,
        grantedCategories: 0,
        revokedCategories: 0,
        expiredCategories: 0,
        requiredCategories: 0,
        missingRequiredConsents: []
      };
    }
  }

  /**
   * Bulk update consents
   */
  async bulkUpdateConsents(
    consents: Array<{ category: string; granted: boolean; purpose?: string }>
  ): Promise<{ success: boolean; results: Array<{ category: string; success: boolean; error?: string }> }> {
    const results: Array<{ category: string; success: boolean; error?: string }> = [];

    for (const consent of consents) {
      const result = await this.updateConsent(consent.category, consent.granted, consent.purpose);
      results.push({
        category: consent.category,
        success: result.success,
        error: result.error
      });
    }

    const allSuccessful = results.every(r => r.success);
    return {
      success: allSuccessful,
      results
    };
  }

  /**
   * Revoke all consents
   */
  async revokeAllConsents(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const now = new Date().toISOString();

      const { error } = await supabase
        .from('consent_records')
        .update({
          granted: false,
          revoked_at: now,
          updated_at: now
        })
        .eq('user_id', user.id)
        .eq('granted', true);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Error revoking all consents:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get consent audit log
   */
  async getConsentAuditLog(): Promise<Array<{
    id: string;
    category: string;
    action: 'granted' | 'revoked' | 'expired';
    timestamp: string;
    ip_address?: string;
    user_agent?: string;
  }>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('consent_audit_log')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching consent audit log:', error);
      return [];
    }
  }
}
