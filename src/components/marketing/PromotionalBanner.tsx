import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ExternalLink, AlertTriangle } from 'lucide-react';
import { MarketingService } from '@/services/marketingService';
import { checkTableExists } from '@/utils/databaseUtils';
import type { Campaign } from '@/types/marketing';

/**
 * Props for the PromotionalBanner component
 */
interface PromotionalBannerProps {
  /** Position of the banner in the layout */
  position?: 'top' | 'bottom' | 'sidebar';
  /** Visual variant of the banner */
  variant?: 'default' | 'featured' | 'urgent';
  /** Maximum number of campaigns to display */
  maxCampaigns?: number;
  /** Additional CSS classes */
  className?: string;
  /** Callback when user dismisses a campaign */
  onDismiss?: (campaignId: string) => void;
  /** Callback when user interacts with a campaign */
  onAction?: (campaign: Campaign) => void;
}

/**
 * PromotionalBanner component for displaying dynamic promotional campaigns
 *
 * Features:
 * - Campaign targeting and filtering
 * - Multiple visual variants
 * - Auto-rotation through campaigns
 * - Dismissible banners
 * - Analytics tracking
 *
 * @param props - Component props
 * @returns JSX element
 */
export const PromotionalBanner: React.FC<PromotionalBannerProps> = ({
  position = 'top',
  variant = 'default',
  maxCampaigns = 3,
  className = '',
  onDismiss,
  onAction
}) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marketingTablesAvailable, setMarketingTablesAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMarketingTables = async () => {
      try {
        const campaignsTable = await checkTableExists('marketing_campaigns');
        setMarketingTablesAvailable(campaignsTable.exists);
        
        if (!campaignsTable.exists) {
          // Don't show error in console for missing table - this is expected in development
          // console.warn('Marketing campaigns table not available. Banner will be hidden.');
          setError('Marketing features not available');
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error checking marketing tables:', error);
        setMarketingTablesAvailable(false);
        setError('Unable to check marketing features');
        setLoading(false);
        return;
      }
    };

    checkMarketingTables();
  }, []);

  useEffect(() => {
    if (marketingTablesAvailable === false) {
      setLoading(false);
      return;
    }

    if (marketingTablesAvailable === true) {
      loadCampaigns();
    }
  }, [marketingTablesAvailable]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);

      const activeCampaigns = await MarketingService.getActiveCampaigns();
      
      // Filter campaigns based on position and variant
      let filteredCampaigns = activeCampaigns.filter(campaign => {
        if (position === 'top' && campaign.campaign_config?.positions?.includes('top')) {
          return true;
        }
        if (position === 'sidebar' && campaign.campaign_config?.positions?.includes('sidebar')) {
          return true;
        }
        if (variant === 'featured' && campaign.campaign_type === 'promotional') {
          return true;
        }
        if (variant === 'urgent' && campaign.campaign_config?.urgent) {
          return true;
        }
        return false;
      });

      // Limit the number of campaigns
      filteredCampaigns = filteredCampaigns.slice(0, maxCampaigns);

      setCampaigns(filteredCampaigns);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      setError('Failed to load promotional campaigns');
    } finally {
      setLoading(false);
    }
  };

  // Auto-rotate campaigns
  useEffect(() => {
    if (campaigns.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % campaigns.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [campaigns.length]);

  const handleDismiss = (campaignId: string) => {
    // Remove from local state
    setCampaigns(prev => prev.filter(c => c.id !== campaignId));
    
    // Track dismiss event
    MarketingService.trackEvent('campaign_dismissed', { campaign_id: campaignId });
    
    // Call parent callback
    onDismiss?.(campaignId);
  };

  const handleAction = (campaign: Campaign) => {
    // Track click event
    MarketingService.trackEvent('campaign_clicked', { 
      campaign_id: campaign.id,
      campaign_type: campaign.campaign_type 
    });
    
    // Call parent callback
    onAction?.(campaign);
  };

  // Don't render if no campaigns or marketing tables not available
  if (loading) {
    return null; // Don't show loading state for banner
  }

  if (error || campaigns.length === 0 || marketingTablesAvailable === false) {
    return null; // Hide banner if there are issues or no campaigns
  }

  const currentCampaign = campaigns[currentIndex];
  if (!currentCampaign) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'featured':
        return 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-500';
      case 'urgent':
        return 'bg-gradient-to-r from-red-600 to-orange-600 text-white border-red-500';
      default:
        return 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Card className={`border-2 ${getVariantStyles()}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">
                  {currentCampaign.campaign_type}
                </Badge>
                {currentCampaign.campaign_config?.urgent && (
                  <Badge variant="destructive" className="text-xs">
                    Limited Time
                  </Badge>
                )}
              </div>
              
              <h3 className="font-semibold text-lg mb-1">
                {currentCampaign.name}
              </h3>
              
              {currentCampaign.description && (
                <p className="text-sm opacity-90 mb-3">
                  {currentCampaign.description}
                </p>
              )}

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleAction(currentCampaign)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  {currentCampaign.campaign_config?.cta_text || 'Learn More'}
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
                
                {campaigns.length > 1 && (
                  <div className="flex gap-1">
                    {campaigns.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentIndex 
                            ? 'bg-white' 
                            : 'bg-white/50 hover:bg-white/70'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDismiss(currentCampaign.id)}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Specialized banner components
export const FeaturedBanner: React.FC<Omit<PromotionalBannerProps, 'variant'>> = (props) => (
  <PromotionalBanner {...props} variant="featured" />
);

export const UrgentBanner: React.FC<Omit<PromotionalBannerProps, 'variant'>> = (props) => (
  <PromotionalBanner {...props} variant="urgent" />
);

export const TopBanner: React.FC<Omit<PromotionalBannerProps, 'position'>> = (props) => (
  <PromotionalBanner {...props} position="top" />
);

export const BottomBanner: React.FC<Omit<PromotionalBannerProps, 'position'>> = (props) => (
  <PromotionalBanner {...props} position="bottom" />
);

export const SidebarBanner: React.FC<Omit<PromotionalBannerProps, 'position'>> = (props) => (
  <PromotionalBanner {...props} position="sidebar" />
);
