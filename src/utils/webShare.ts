// Web Share API utility functions for news sharing
export interface ShareData {
  title: string;
  text?: string;
  url: string;
}

export interface ShareResult {
  success: boolean;
  method: 'web_share' | 'copy_link' | 'fallback';
  error?: string;
}

/**
 * Check if Web Share API is supported
 */
export function isWebShareSupported(): boolean {
  return typeof navigator !== 'undefined' && 
         'share' in navigator && 
         typeof navigator.share === 'function';
}

/**
 * Share content using Web Share API with fallback to copy link
 */
export async function shareContent(shareData: ShareData): Promise<ShareResult> {
  try {
    // Try Web Share API first
    if (isWebShareSupported()) {
      await navigator.share(shareData);
      return {
        success: true,
        method: 'web_share'
      };
    }

    // Fallback to copy link
    return await copyLinkToClipboard(shareData);
  } catch (error) {
    console.error('Web Share API error:', error);
    
    // If Web Share API fails, try copy link fallback
    try {
      return await copyLinkToClipboard(shareData);
    } catch (fallbackError) {
      console.error('Copy link fallback error:', fallbackError);
      return {
        success: false,
        method: 'fallback',
        error: 'Unable to share content'
      };
    }
  }
}

/**
 * Copy link to clipboard as fallback
 */
async function copyLinkToClipboard(shareData: ShareData): Promise<ShareResult> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(shareData.url);
      return {
        success: true,
        method: 'copy_link'
      };
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareData.url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        return {
          success: true,
          method: 'copy_link'
        };
      } else {
        throw new Error('Copy command failed');
      }
    }
  } catch (error) {
    return {
      success: false,
      method: 'copy_link',
      error: 'Failed to copy link to clipboard'
    };
  }
}

/**
 * Share to specific social media platforms
 */
export async function shareToSocial(
  platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp',
  shareData: ShareData
): Promise<ShareResult> {
  const encodedUrl = encodeURIComponent(shareData.url);
  const encodedTitle = encodeURIComponent(shareData.title);
  const encodedText = encodeURIComponent(shareData.text || shareData.title);

  let shareUrl = '';

  switch (platform) {
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
      break;
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
      break;
    case 'linkedin':
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
      break;
    case 'whatsapp':
      shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
      break;
    default:
      return {
        success: false,
        method: 'fallback',
        error: 'Unsupported platform'
      };
  }

  try {
    // Open in new window/tab
    const shareWindow = window.open(
      shareUrl,
      'share',
      'width=600,height=400,scrollbars=yes,resizable=yes'
    );

    if (shareWindow) {
      return {
        success: true,
        method: 'web_share'
      };
    } else {
      throw new Error('Failed to open share window');
    }
  } catch (error) {
    return {
      success: false,
      method: 'fallback',
      error: `Failed to share to ${platform}`
    };
  }
}

/**
 * Get share options based on device capabilities
 */
export function getAvailableShareOptions(): {
  webShare: boolean;
  copyLink: boolean;
  socialMedia: boolean;
} {
  return {
    webShare: isWebShareSupported(),
    copyLink: typeof navigator !== 'undefined' && 
              (navigator.clipboard || document.queryCommandSupported('copy')),
    socialMedia: typeof window !== 'undefined' && window.open
  };
}

/**
 * Generate share text for news articles
 */
export function generateNewsShareText(
  title: string,
  source: string,
  summary?: string
): string {
  const baseText = `"${title}" - ${source}`;
  
  if (summary) {
    return `${baseText}\n\n${summary}`;
  }
  
  return baseText;
}

/**
 * Track share events for analytics
 */
export function trackShareEvent(
  articleId: string,
  method: string,
  platform?: string
): void {
  // This would integrate with your analytics system
  console.log('Share event tracked:', {
    articleId,
    method,
    platform,
    timestamp: new Date().toISOString()
  });
}
