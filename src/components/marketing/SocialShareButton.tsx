import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin, 
  MessageCircle, 
  Mail, 
  Smartphone 
} from 'lucide-react';
import { SocialSharingService } from '@/services/socialSharingService';
import type { ShareContentData } from '@/types/marketing';

interface SocialShareButtonProps {
  content: ShareContentData;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  platforms?: Array<'facebook' | 'twitter' | 'linkedin' | 'whatsapp' | 'telegram' | 'email' | 'sms'>;
  onShare?: (platform: string) => void;
  className?: string;
}

const platformConfigs = {
  facebook: {
    icon: Facebook,
    label: 'Facebook',
    color: '#1877F2'
  },
  twitter: {
    icon: Twitter,
    label: 'Twitter',
    color: '#1DA1F2'
  },
  linkedin: {
    icon: Linkedin,
    label: 'LinkedIn',
    color: '#0077B5'
  },
  whatsapp: {
    icon: MessageCircle,
    label: 'WhatsApp',
    color: '#25D366'
  },
  telegram: {
    icon: MessageCircle,
    label: 'Telegram',
    color: '#0088CC'
  },
  email: {
    icon: Mail,
    label: 'Email',
    color: '#EA4335'
  },
  sms: {
    icon: Smartphone,
    label: 'SMS',
    color: '#34A853'
  }
};

export const SocialShareButton: React.FC<SocialShareButtonProps> = ({
  content,
  variant = 'default',
  size = 'md',
  showLabel = false,
  platforms = ['facebook', 'twitter', 'linkedin', 'whatsapp'],
  onShare,
  className
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [showPlatforms, setShowPlatforms] = useState(false);

  const handleShare = async (platform: string) => {
    try {
      setIsSharing(true);
      
      // Track the share
      await SocialSharingService.shareContent({
        ...content,
        platform: platform as any
      });

      // Open share dialog
      SocialSharingService.openShareDialog(platform, content);

      // Callback
      onShare?.(platform);
      
      // Close platform selection
      setShowPlatforms(false);
    } catch (error) {
      console.error('Failed to share:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleQuickShare = async () => {
    if (platforms.length === 1) {
      await handleShare(platforms[0]);
    } else {
      setShowPlatforms(!showPlatforms);
    }
  };

  const ShareIcon = Share2;

  return (
    <div className={`relative ${className}`}>
      <Button
        variant={variant}
        size={size}
        onClick={handleQuickShare}
        disabled={isSharing}
        className="flex items-center gap-2"
      >
        <ShareIcon className="h-4 w-4" />
        {showLabel && (platforms.length === 1 ? platformConfigs[platforms[0]].label : 'Share')}
      </Button>

      {showPlatforms && platforms.length > 1 && (
        <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-50">
          <div className="flex flex-col gap-1">
            {platforms.map((platform) => {
              const config = platformConfigs[platform];
              const PlatformIcon = config.icon;
              
              return (
                <Button
                  key={platform}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare(platform)}
                  disabled={isSharing}
                  className="justify-start gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  style={{ color: config.color }}
                >
                  <PlatformIcon className="h-4 w-4" />
                  {config.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Individual platform share buttons
export const FacebookShareButton: React.FC<Omit<SocialShareButtonProps, 'platforms'>> = (props) => (
  <SocialShareButton {...props} platforms={['facebook']} />
);

export const TwitterShareButton: React.FC<Omit<SocialShareButtonProps, 'platforms'>> = (props) => (
  <SocialShareButton {...props} platforms={['twitter']} />
);

export const LinkedInShareButton: React.FC<Omit<SocialShareButtonProps, 'platforms'>> = (props) => (
  <SocialShareButton {...props} platforms={['linkedin']} />
);

export const WhatsAppShareButton: React.FC<Omit<SocialShareButtonProps, 'platforms'>> = (props) => (
  <SocialShareButton {...props} platforms={['whatsapp']} />
);

// Share button with custom styling
export const CustomShareButton: React.FC<SocialShareButtonProps & {
  icon?: React.ComponentType<{ className?: string }>;
  label?: string;
}> = ({ icon: CustomIcon, label, ...props }) => {
  const Icon = CustomIcon || Share2;
  
  return (
    <Button
      variant={props.variant}
      size={props.size}
      onClick={() => props.platforms?.length === 1 ? 
        SocialSharingService.openShareDialog(props.platforms[0], props.content) : 
        undefined
      }
      className="flex items-center gap-2"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );
};
