/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Please use ConsolidatedCommunityInsights.tsx instead.
 * Category: communityInsights
 * 
 * This page has been consolidated to provide a better, more consistent user experience.
 * All functionality from this page is available in the consolidated version.
 */

import React, { useEffect } from 'react';
import { RoleGuard } from '../components/RoleGuard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Shield, Lock } from 'lucide-react';
import { useSecurityAudit } from '../hooks/useSecurityAudit';
import { useIsAdmin } from '../hooks/useRBACConsolidated';
import CommunityInsightsDashboard from '../components/CommunityInsightsDashboard';

const CommunityInsights: React.FC = () => {
  const { logAccessAttempt } = useSecurityAudit();
  const { isAdmin } = useIsAdmin();

  // Log access attempt when component mounts
  useEffect(() => {
    logAccessAttempt('/community-insights', isAdmin, {
      page: 'CommunityInsights',
      timestamp: new Date().toISOString()
    });
  }, [logAccessAttempt, isAdmin]);

  // Fallback component for unauthorized users
  const UnauthorizedAccess = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Access Restricted
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-4">
            <p className="text-gray-600">
              This page contains sensitive community insights and analytics that are only available to administrators and super administrators.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Admin privileges required</span>
            </div>
            <p className="text-xs text-gray-400">
              If you believe you should have access to this page, please contact your system administrator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Loading component
  const LoadingAccess = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access permissions...</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <RoleGuard
      requireAdmin={true}
      fallback={<UnauthorizedAccess />}
      loading={<LoadingAccess />}
    >
      <div className="min-h-screen bg-gray-50">
        <CommunityInsightsDashboard />
      </div>
    </RoleGuard>
  );
};

export default CommunityInsights;
