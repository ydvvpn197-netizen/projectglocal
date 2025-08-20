import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Gift, 
  Percent, 
  Clock, 
  Users, 
  TrendingUp,
  ArrowRight,
  Star
} from 'lucide-react';
import { MarketingService } from '@/services/marketingService';
import type { Campaign } from '@/types/marketing';

interface PromotionalBannerProps {
  position?: 'top' | 'bottom' | 'sidebar';
  variant?: 'default' | 'featured' | 'urgent';
  maxCampaigns?: number;
  className?: string;
  onDismiss?: (campaignId: string) => void;
  onAction?: (campaign: Campaign) => void;
}

interface BannerCampaign extends Campaign {
  isDismissed?: boolean;
}

export const PromotionalBanner: React.FC<PromotionalBannerProps> = ({
  position = 'top',
  variant = 'default',
  maxCampaigns = 3,
  className = '',
  onDismiss,
  onAction
}) => {
  const [campaigns, setCampaigns] = useState<BannerCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadActiveCampaigns();
  }, []);

  const loadActiveCampaigns = async () => {
    try {
      setLoading(true);
      const activeCampaigns = await MarketingService.getCampaigns({
        status: 'active',
        campaign_type: 'promotional'
      });

      // Filter and sort campaigns based on priority and relevance
      const filteredCampaigns = activeCampaigns
        .filter(campaign => {
          const now = new Date();
          const startDate = campaign.start_date ? new Date(campaign.start_date) : null;
          const endDate = campaign.end_date ? new Date(campaign.end_date) : null;
          
          return (!startDate || now >= startDate) && (!endDate || now <= endDate);
        })
        .sort((a, b) => {
          // Sort by priority: featured > urgent > default
          const priorityOrder = { featured: 3, urgent: 2, default: 1 };
          const aPriority = priorityOrder[a.campaign_config?.priority || 'default'];
          const bPriority = priorityOrder[b.campaign_config?.priority || 'default'];
          
          if (aPriority !== bPriority) {
            return bPriority - aPriority;
          }
          
          // Then by creation date (newer first)
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        })
        .slice(0, maxCampaigns);

      setCampaigns(filteredCampaigns);
    } catch (error) {
      console.error('Failed to load promotional campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = (campaignId: string) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === campaignId ? { ...campaign, isDismissed: true } : campaign
    ));
    onDismiss?.(campaignId);
  };

  const handleAction = (campaign: Campaign) => {
    onAction?.(campaign);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'featured':
        return 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-500';
      case 'urgent':
        return 'bg-gradient-to-r from-red-600 to-orange-600 text-white border-red-500';
      default:
        return 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500';
    }
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return 'fixed top-0 left-0 right-0 z-50';
      case 'bottom':
        return 'fixed bottom-0 left-0 right-0 z-50';
      case 'sidebar':
        return 'relative';
      default:
        return 'relative';
    }
  };

  const formatTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return 'Less than 1h left';
  };

  const getCampaignIcon = (campaign: Campaign) => {
    const config = campaign.campaign_config;
    
    if (config?.priority === 'featured') return Star;
    if (config?.urgency === 'high') return Clock;
    if (config?.type === 'referral') return Users;
    if (config?.type === 'discount') return Percent;
    
    return Gift;
  };

  if (loading) {
    return null;
  }

  const activeCampaigns = campaigns.filter(campaign => !campaign.isDismissed);
  
  if (activeCampaigns.length === 0) {
    return null;
  }

  return (
    <div className={`${getPositionStyles()} ${className}`}>
      {activeCampaigns.map((campaign, index) => {
        const Icon = getCampaignIcon(campaign);
        const timeRemaining = campaign.end_date ? formatTimeRemaining(campaign.end_date) : null;
        
        return (
          <Card
            key={campaign.id}
            className={`${getVariantStyles()} border-2 shadow-lg transition-all duration-300 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0 hidden'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-shrink-0">
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm truncate">
                        {campaign.name}
                      </h3>
                      {campaign.campaign_config?.priority === 'featured' && (
                        <Badge variant="secondary" className="text-xs">
                          Featured
                        </Badge>
                      )}
                      {timeRemaining && timeRemaining !== 'Expired' && (
                        <Badge variant="outline" className="text-xs border-white/30 text-white/90">
                          <Clock className="h-3 w-3 mr-1" />
                          {timeRemaining}
                        </Badge>
                      )}
                    </div>
                    
                    {campaign.description && (
                      <p className="text-xs text-white/90 line-clamp-2">
                        {campaign.description}
                      </p>
                    )}
                    
                    {campaign.campaign_config?.stats && (
                      <div className="flex items-center gap-4 mt-2 text-xs text-white/80">
                        {campaign.campaign_config.stats.impressions && (
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {campaign.campaign_config.stats.impressions} views
                          </span>
                        )}
                        {campaign.campaign_config.stats.conversions && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {campaign.campaign_config.stats.conversions} claimed
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  {campaign.campaign_config?.cta && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleAction(campaign)}
                      className="text-xs font-medium"
                    >
                      {campaign.campaign_config.cta}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDismiss(campaign.id)}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {/* Navigation dots for multiple campaigns */}
      {activeCampaigns.length > 1 && (
        <div className="flex justify-center gap-1 mt-2">
          {activeCampaigns.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex 
                  ? 'bg-white' 
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
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
