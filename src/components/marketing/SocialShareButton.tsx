import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin, 
  MessageCircle, 
  Mail, 
  Smartphone,
  Loader2
} from 'lucide-react';
import { SocialSharingService } from '@/services/socialSharingService';
import { useToast } from '@/hooks/use-toast';
import type { ShareContentData } from '@/types/marketing';

/**
 * Props for the SocialShareButton component
 */
interface SocialShareButtonProps {
  /** Content data to be shared across social platforms */
  content: ShareContentData;
  /** Visual variant of the button */
  variant?: 'default' | 'outline' | 'ghost';
  /** Size of the button */
  size?: 'sm' | 'lg';
  /** Whether to show platform labels */
  showLabel?: boolean;
  /** Array of social platforms to enable sharing on */
  platforms?: Array<'facebook' | 'twitter' | 'linkedin' | 'whatsapp' | 'telegram' | 'email' | 'sms'>;
  /** Callback function called after successful share */
  onShare?: (platform: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Configuration for supported social media platforms
 * Each platform has an icon, label, and brand color
 */
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

/**
 * SocialShareButton component for sharing content across multiple social media platforms
 * 
 * Features:
 * - Multi-platform support (Facebook, Twitter, LinkedIn, WhatsApp, etc.)
 * - Loading states and error handling
 * - Analytics tracking
 * - Customizable appearance
 * 
 * @param props - Component props
 * @returns JSX element
 */
export const SocialShareButton: React.FC<SocialShareButtonProps> = ({
  content,
  variant = 'default',
  size = 'sm',
  showLabel = false,
  platforms = ['facebook', 'twitter', 'linkedin', 'whatsapp'],
  onShare,
  className
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [showPlatforms, setShowPlatforms] = useState(false);
  const { toast } = useToast();

  const handleShare = async (platform: string) => {
    try {
      setIsSharing(true);
      
      // Track the share
      await SocialSharingService.shareContent({
        ...content,
        platform: platform as string
      });

      // Open share dialog
      SocialSharingService.openShareDialog(platform, content);

      // Callback
      onShare?.(platform);
      
      // Close platform selection
      setShowPlatforms(false);
      
      toast({
        title: "Shared successfully!",
        description: `Content shared on ${platform}`,
      });
    } catch (error) {
      console.error('Failed to share:', error);
      toast({
        title: "Share failed",
        description: `Failed to share on ${platform}. Please try again.`,
        variant: "destructive",
      });
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

  // Get button text based on configuration
  const getButtonText = () => {
    if (showLabel) {
      if (platforms.length === 1) {
        return platformConfigs[platforms[0]].label;
      }
      return 'Share';
    }
    return '';
  };

  // Get button classes based on variant and size
  const getButtonClasses = () => {
    const baseClasses = "flex items-center gap-2";
    const variantClasses = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground"
    };
    const sizeClasses = {
      sm: "h-9 px-3 text-sm",
      lg: "h-11 px-8"
    };
    
    return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant={variant}
        size={size === 'lg' ? 'lg' : 'sm'}
        onClick={handleQuickShare}
        disabled={isSharing}
        className={getButtonClasses()}
      >
        {isSharing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ShareIcon className="h-4 w-4" />
        )}
        {getButtonText()}
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
      size={props.size === 'lg' ? 'lg' : 'sm'}
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
