import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href'],
    ALLOW_DATA_ATTR: false
  });
};

/**
 * Sanitizes plain text input by removing HTML tags and limiting length
 */
export const sanitizeText = (input: string, maxLength: number = 1000): string => {
  // Remove HTML tags and decode entities
  const cleaned = DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  
  // Trim whitespace and limit length
  return cleaned.trim().slice(0, maxLength);
};

/**
 * Validates and sanitizes email input
 */
export const sanitizeEmail = (email: string): string => {
  const cleaned = sanitizeText(email, 255);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(cleaned)) {
    throw new Error('Invalid email format');
  }
  
  return cleaned;
};

/**
 * Sanitizes and validates URL input
 */
export const sanitizeUrl = (url: string): string => {
  const cleaned = sanitizeText(url, 2048);
  
  try {
    const urlObj = new URL(cleaned);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Invalid URL protocol');
    }
    return urlObj.toString();
  } catch {
    throw new Error('Invalid URL format');
  }
};

/**
 * Sanitizes tags array by limiting length and content
 */
export const sanitizeTags = (tags: string[]): string[] => {
  return tags
    .map(tag => sanitizeText(tag, 50))
    .filter(tag => tag.length > 0)
    .slice(0, 10); // Limit to 10 tags
};