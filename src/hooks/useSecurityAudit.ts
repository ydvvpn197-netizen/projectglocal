/**
 * Security Audit Hook
 * Logs security-related events and access attempts
 */

import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface SecurityEvent {
  event_type: 'access_attempt' | 'unauthorized_access' | 'admin_access' | 'permission_check';
  resource: string;
  action: string;
  success: boolean;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
}

export const useSecurityAudit = () => {
  const { user } = useAuth();

  const logSecurityEvent = useCallback(async (event: SecurityEvent) => {
    try {
      // Get client information
      const userAgent = navigator.userAgent;
      
      // Get IP address (simplified - in production you'd want a more robust solution)
      let ipAddress = 'unknown';
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        ipAddress = data.ip;
      } catch (error) {
        console.warn('Could not fetch IP address for security audit:', error);
      }

      // Log to security_audit table
      const { error } = await supabase
        .from('security_audit')
        .insert({
          user_id: user?.id || null,
          event_type: event.event_type,
          resource: event.resource,
          action: event.action,
          success: event.success,
          details: event.details || {},
          ip_address: ipAddress,
          user_agent: userAgent,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to log security event:', error);
      }
    } catch (error) {
      console.error('Security audit logging failed:', error);
    }
  }, [user]);

  const logAccessAttempt = useCallback(async (
    resource: string,
    success: boolean,
    details?: Record<string, unknown>
  ) => {
    await logSecurityEvent({
      event_type: success ? 'admin_access' : 'unauthorized_access',
      resource,
      action: 'view',
      success,
      details
    });
  }, [logSecurityEvent]);

  const logPermissionCheck = useCallback(async (
    resource: string,
    permission: string,
    granted: boolean,
    details?: Record<string, unknown>
  ) => {
    await logSecurityEvent({
      event_type: 'permission_check',
      resource,
      action: `check_${permission}`,
      success: granted,
      details: {
        permission,
        ...details
      }
    });
  }, [logSecurityEvent]);

  return {
    logSecurityEvent,
    logAccessAttempt,
    logPermissionCheck
  };
};
