import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { 
  Share2, 
  Copy, 
  Twitter, 
  Facebook, 
  Linkedin, 
  MessageCircle,
  Check,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  shareContent, 
  shareToSocial, 
  getAvailableShareOptions,
  generateNewsShareText,
  trackShareEvent,
  type ShareData 
} from '@/utils/webShare';

interface ShareButtonProps {
  articleId: string;
  title: string;
  url: string;
  source: string;
  summary?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showCount?: boolean;
  shareCount?: number;
  onShare?: (method: string, platform?: string) => void;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  articleId,
  title,
  url,
  source,
  summary,
  className = '',
  variant = 'ghost',
  size = 'sm',
  showCount = false,
  shareCount = 0,
  onShare
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const shareOptions = getAvailableShareOptions();
  const shareData: ShareData = {
    title,
    text: generateNewsShareText(title, source, summary),
    url
  };

  const handleWebShare = async () => {
    if (!shareOptions.webShare) return;
    
    setIsSharing(true);
    try {
      const result = await shareContent(shareData);
      
      if (result.success) {
        toast({
          title: "Shared successfully!",
          description: result.method === 'web_share' 
            ? "Article shared via Web Share API" 
            : "Link copied to clipboard"
        });
        
        trackShareEvent(articleId, result.method);
        onShare?.(result.method);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Unable to share article. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    setIsSharing(true);
    try {
      const result = await shareContent(shareData);
      
      if (result.success) {
        setCopied(true);
        toast({
          title: "Link copied!",
          description: "Article link copied to clipboard"
        });
        
        trackShareEvent(articleId, 'copy_link');
        onShare?.('copy_link');
        
        // Reset copied state after 2 seconds
        setTimeout(() => setCopied(false), 2000);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy link. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleSocialShare = async (platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp') => {
    setIsSharing(true);
    try {
      const result = await shareToSocial(platform, shareData);
      
      if (result.success) {
        toast({
          title: `Shared to ${platform}!`,
          description: `Opening ${platform} share dialog...`
        });
        
        trackShareEvent(articleId, 'social_share', platform);
        onShare?.('social_share', platform);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Share failed",
        description: `Unable to share to ${platform}. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  // If only Web Share API is available, show simple button
  if (shareOptions.webShare && !shareOptions.socialMedia) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={handleWebShare}
        disabled={isSharing}
        className={`flex items-center gap-2 ${className}`}
      >
        <motion.div
          animate={{ rotate: isSharing ? 360 : 0 }}
          transition={{ duration: 0.5, repeat: isSharing ? Infinity : 0 }}
        >
          <Share2 className="h-4 w-4" />
        </motion.div>
        {showCount && shareCount > 0 && (
          <span className="text-xs text-muted-foreground">
            {shareCount}
          </span>
        )}
      </Button>
    );
  }

  // Show dropdown with multiple options
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={isSharing}
          className={`flex items-center gap-2 ${className}`}
        >
          <motion.div
            animate={{ rotate: isSharing ? 360 : 0 }}
            transition={{ duration: 0.5, repeat: isSharing ? Infinity : 0 }}
          >
            <Share2 className="h-4 w-4" />
          </motion.div>
          {showCount && shareCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {shareCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48">
        {shareOptions.webShare && (
          <DropdownMenuItem onClick={handleWebShare} disabled={isSharing}>
            <Share2 className="h-4 w-4 mr-2" />
            Share via Web Share
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={handleCopyLink} disabled={isSharing}>
          {copied ? (
            <Check className="h-4 w-4 mr-2 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 mr-2" />
          )}
          {copied ? 'Copied!' : 'Copy Link'}
        </DropdownMenuItem>
        
        {shareOptions.socialMedia && (
          <>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={() => handleSocialShare('twitter')} 
              disabled={isSharing}
            >
              <Twitter className="h-4 w-4 mr-2" />
              Share on Twitter
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => handleSocialShare('facebook')} 
              disabled={isSharing}
            >
              <Facebook className="h-4 w-4 mr-2" />
              Share on Facebook
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => handleSocialShare('linkedin')} 
              disabled={isSharing}
            >
              <Linkedin className="h-4 w-4 mr-2" />
              Share on LinkedIn
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => handleSocialShare('whatsapp')} 
              disabled={isSharing}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Share on WhatsApp
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
