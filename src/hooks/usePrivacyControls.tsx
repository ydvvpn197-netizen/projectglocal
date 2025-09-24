import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { DataExportService } from '@/services/dataExportService';
import { ConsentManagementService } from '@/services/consentManagementService';
import { supabase } from '@/integrations/supabase/client';

export interface PrivacySettings {
  profile_visibility: 'public' | 'followers' | 'private';
  show_location: boolean;
  show_contact_info: boolean;
  show_activity: boolean;
  allow_messages_from: 'all' | 'followers' | 'none';
  analytics_enabled: boolean;
  personalization_enabled: boolean;
  marketing_consent: boolean;
  data_sharing_consent: boolean;
  location_tracking: boolean;
}

export interface ConsentRecord {
  id: string;
  category: string;
  purpose: string;
  granted: boolean;
  granted_at?: string;
  revoked_at?: string;
  expires_at?: string;
  legal_basis: string;
  data_categories: string[];
  processing_activities: string[];
}

export interface DataExportRequest {
  id: string;
  type: 'full' | 'profile' | 'activity' | 'analytics';
  format: 'json' | 'csv' | 'pdf';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requested_at: string;
  completed_at?: string;
  download_url?: string;
  file_size?: number;
  error_message?: string;
}

export interface DataRetentionPolicy {
  id: string;
  category: string;
  description: string;
  retention_period: number;
  auto_delete: boolean;
  legal_basis: string;
  exceptions: string[];
}

export const usePrivacyControls = () => {
  const { toast } = useToast();
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([]);
  const [dataExports, setDataExports] = useState<DataExportRequest[]>([]);
  const [retentionPolicies, setRetentionPolicies] = useState<DataRetentionPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const dataExportService = DataExportService.getInstance();
  const consentService = ConsentManagementService.getInstance();

  // Load privacy settings
  const loadPrivacySettings = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('privacy_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error;
      }

      if (data) {
        setPrivacySettings({
          profile_visibility: data.profile_visibility || 'public',
          show_location: data.show_location ?? true,
          show_contact_info: data.show_contact_info ?? true,
          show_activity: data.show_activity ?? true,
          allow_messages_from: data.allow_messages_from || 'all',
          analytics_enabled: data.analytics_enabled ?? true,
          personalization_enabled: data.personalization_enabled ?? true,
          marketing_consent: data.marketing_consent ?? false,
          data_sharing_consent: data.data_sharing_consent ?? false,
          location_tracking: data.location_tracking ?? false,
        });
      } else {
        // Create default settings
        const defaultSettings: PrivacySettings = {
          profile_visibility: 'public',
          show_location: true,
          show_contact_info: true,
          show_activity: true,
          allow_messages_from: 'all',
          analytics_enabled: true,
          personalization_enabled: true,
          marketing_consent: false,
          data_sharing_consent: false,
          location_tracking: false,
        };
        setPrivacySettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
      toast({
        title: "Error",
        description: "Failed to load privacy settings",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Load consent records
  const loadConsentRecords = useCallback(async () => {
    try {
      const records = await consentService.getUserConsentRecords();
      setConsentRecords(records);
    } catch (error) {
      console.error('Error loading consent records:', error);
    }
  }, [consentService]);

  // Load data exports
  const loadDataExports = useCallback(async () => {
    try {
      const exports = await dataExportService.getDataExportRequests();
      setDataExports(exports);
    } catch (error) {
      console.error('Error loading data exports:', error);
    }
  }, [dataExportService]);

  // Load retention policies
  const loadRetentionPolicies = useCallback(async () => {
    try {
      const policies = await consentService.getDataRetentionPolicies();
      setRetentionPolicies(policies);
    } catch (error) {
      console.error('Error loading retention policies:', error);
    }
  }, [consentService]);

  // Load all data
  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadPrivacySettings(),
        loadConsentRecords(),
        loadDataExports(),
        loadRetentionPolicies(),
      ]);
    } finally {
      setLoading(false);
    }
  }, [loadPrivacySettings, loadConsentRecords, loadDataExports, loadRetentionPolicies]);

  // Update privacy settings
  const updatePrivacySettings = async (settings: Partial<PrivacySettings>) => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('privacy_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setPrivacySettings(prev => prev ? { ...prev, ...settings } : null);
      
      toast({
        title: "Success",
        description: "Privacy settings updated successfully",
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      toast({
        title: "Error",
        description: "Failed to update privacy settings",
        variant: "destructive",
      });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setSaving(false);
    }
  };

  // Update consent
  const updateConsent = async (category: string, granted: boolean, purpose?: string) => {
    try {
      setSaving(true);
      const result = await consentService.updateConsent(category, granted, purpose);
      
      if (result.success) {
        await loadConsentRecords();
        toast({
          title: granted ? "Consent Granted" : "Consent Revoked",
          description: `Your consent for ${category} has been ${granted ? 'granted' : 'revoked'}`,
        });
      } else {
        throw new Error(result.error);
      }

      return result;
    } catch (error) {
      console.error('Error updating consent:', error);
      toast({
        title: "Error",
        description: "Failed to update consent",
        variant: "destructive",
      });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setSaving(false);
    }
  };

  // Request data export
  const requestDataExport = async (type: DataExportRequest['type'], format: DataExportRequest['format']) => {
    try {
      setSaving(true);
      const result = await dataExportService.requestDataExport(type, format);
      
      if (result.success) {
        await loadDataExports();
        toast({
          title: "Export Requested",
          description: "Your data export has been queued. You'll receive an email when it's ready.",
        });
      } else {
        throw new Error(result.error);
      }

      return result;
    } catch (error) {
      console.error('Error requesting data export:', error);
      toast({
        title: "Error",
        description: "Failed to request data export",
        variant: "destructive",
      });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setSaving(false);
    }
  };

  // Delete data export request
  const deleteDataExport = async (requestId: string) => {
    try {
      const result = await dataExportService.deleteDataExportRequest(requestId);
      
      if (result.success) {
        await loadDataExports();
        toast({
          title: "Export Deleted",
          description: "Data export request has been deleted",
        });
      } else {
        throw new Error(result.error);
      }

      return result;
    } catch (error) {
      console.error('Error deleting data export:', error);
      toast({
        title: "Error",
        description: "Failed to delete data export",
        variant: "destructive",
      });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  // Get consent summary
  const getConsentSummary = async () => {
    try {
      return await consentService.getConsentSummary();
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
  };

  // Check if user has consent for a category
  const hasConsent = async (category: string) => {
    try {
      return await consentService.hasConsent(category);
    } catch (error) {
      console.error('Error checking consent:', error);
      return false;
    }
  };

  // Revoke all consents
  const revokeAllConsents = async () => {
    try {
      setSaving(true);
      const result = await consentService.revokeAllConsents();
      
      if (result.success) {
        await loadConsentRecords();
        toast({
          title: "All Consents Revoked",
          description: "All your consents have been revoked",
        });
      } else {
        throw new Error(result.error);
      }

      return result;
    } catch (error) {
      console.error('Error revoking all consents:', error);
      toast({
        title: "Error",
        description: "Failed to revoke all consents",
        variant: "destructive",
      });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setSaving(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return {
    // State
    privacySettings,
    consentRecords,
    dataExports,
    retentionPolicies,
    loading,
    saving,
    
    // Actions
    updatePrivacySettings,
    updateConsent,
    requestDataExport,
    deleteDataExport,
    getConsentSummary,
    hasConsent,
    revokeAllConsents,
    loadAllData,
    loadPrivacySettings,
    loadConsentRecords,
    loadDataExports,
    loadRetentionPolicies,
  };
};
