/**
 * Security Configuration and Utilities
 * Centralized security settings and validation functions
 */

import DOMPurify from 'dompurify';
import { z } from 'zod';

// Security configuration constants
export const SECURITY_CONFIG = {
  // Session and authentication
  SESSION_TIMEOUT: 3600, // 1 hour in seconds
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 900, // 15 minutes in seconds
  
  // Password requirements
  MIN_PASSWORD_LENGTH: 12,
  REQUIRE_SPECIAL_CHARS: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  
  // Rate limiting
  MAX_REQUESTS_PER_MINUTE: 100,
  MAX_REQUESTS_PER_HOUR: 1000,
  
  // Content security
  ALLOWED_HTML_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p'],
  ALLOWED_HTML_ATTRS: ['href', 'target', 'rel'],
  MAX_CONTENT_LENGTH: 10000,
  
  // File upload security
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  
  // API security
  API_RATE_LIMIT_WINDOW: 60000, // 1 minute in milliseconds
  MAX_API_PAYLOAD_SIZE: 1024 * 1024, // 1MB
} as const;

// Input validation schemas
export const SecuritySchemas = {
  // User input validation
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  
  email: z.string()
    .email('Invalid email address')
    .max(254, 'Email address too long'),
  
  password: z.string()
    .min(SECURITY_CONFIG.MIN_PASSWORD_LENGTH, `Password must be at least ${SECURITY_CONFIG.MIN_PASSWORD_LENGTH} characters`)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  // Content validation
  postContent: z.string()
    .min(1, 'Post content cannot be empty')
    .max(SECURITY_CONFIG.MAX_CONTENT_LENGTH, `Post content must be less than ${SECURITY_CONFIG.MAX_CONTENT_LENGTH} characters`),
  
  commentContent: z.string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment must be less than 1000 characters'),
  
  // File validation
  fileUpload: z.object({
    size: z.number().max(SECURITY_CONFIG.MAX_FILE_SIZE, 'File size too large'),
    type: z.string().refine(
      (type) => SECURITY_CONFIG.ALLOWED_FILE_TYPES.includes(type),
      'File type not allowed'
    ),
  }),
} as const;

// Security utility functions
export class SecurityUtils {
  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  static sanitizeHtml(content: string): string {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: SECURITY_CONFIG.ALLOWED_HTML_TAGS,
      ALLOWED_ATTR: SECURITY_CONFIG.ALLOWED_HTML_ATTRS,
      FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    });
  }

  /**
   * Validate and sanitize user input
   */
  static validateInput<T>(schema: z.ZodSchema<T>, input: unknown): { success: true; data: T } | { success: false; errors: string[] } {
    try {
      const result = schema.parse(input);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          success: false, 
          errors: error.errors?.map(e => e.message) || ['Validation failed']
        };
      }
      return { success: false, errors: ['Validation failed'] };
    }
  }

  /**
   * Check if a string contains potentially dangerous content
   */
  static containsDangerousContent(content: string): boolean {
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    ];

    return dangerousPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Generate a secure random token
   */
  static generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomArray = new Uint8Array(length);
    crypto.getRandomValues(randomArray);
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(randomArray[i] % chars.length);
    }
    
    return result;
  }

  /**
   * Hash sensitive data (for client-side temporary storage)
   */
  static async hashData(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate file upload
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > SECURITY_CONFIG.MAX_FILE_SIZE) {
      return { valid: false, error: 'File size too large' };
    }
    
    if (!SECURITY_CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) {
      return { valid: false, error: 'File type not allowed' };
    }
    
    return { valid: true };
  }

  /**
   * Rate limiting utility
   */
  static createRateLimiter(maxRequests: number, windowMs: number) {
    const requests = new Map<string, number[]>();
    
    return {
      isAllowed: (identifier: string): boolean => {
        const now = Date.now();
        const userRequests = requests.get(identifier) || [];
        
        // Remove old requests outside the window
        const validRequests = userRequests.filter(time => now - time < windowMs);
        
        if (validRequests.length >= maxRequests) {
          return false;
        }
        
        validRequests.push(now);
        requests.set(identifier, validRequests);
        return true;
      },
      
      reset: (identifier: string): void => {
        requests.delete(identifier);
      }
    };
  }
}

// Security middleware for API calls
export class SecurityMiddleware {
  private static rateLimiter = SecurityUtils.createRateLimiter(
    SECURITY_CONFIG.MAX_REQUESTS_PER_MINUTE,
    SECURITY_CONFIG.API_RATE_LIMIT_WINDOW
  );

  /**
   * Validate API request before sending
   */
  static validateApiRequest(data: unknown, maxSize: number = SECURITY_CONFIG.MAX_API_PAYLOAD_SIZE): boolean {
    try {
      const dataSize = JSON.stringify(data).length;
      if (dataSize > maxSize) {
        console.warn('API payload too large:', dataSize);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check rate limiting for API calls
   */
  static checkRateLimit(identifier: string): boolean {
    return this.rateLimiter.isAllowed(identifier);
  }

  /**
   * Sanitize API response data
   */
  static sanitizeResponse(data: unknown): unknown {
    if (typeof data === 'string') {
      return SecurityUtils.sanitizeHtml(data);
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeResponse(item));
    }
    
    if (data && typeof data === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeResponse(value);
      }
      return sanitized;
    }
    
    return data;
  }
}

// Export types
export type SecurityConfig = typeof SECURITY_CONFIG;
export type SecuritySchemas = typeof SecuritySchemas;
