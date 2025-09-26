/**
 * Security Configuration
 * Centralized security settings and utilities
 */

export interface SecurityConfig {
  MAX_CONTENT_LENGTH: number;
  MAX_FILE_SIZE: number;
  MAX_API_PAYLOAD_SIZE: number;
  ALLOWED_HTML_TAGS: string[];
  ALLOWED_HTML_ATTRS: string[];
  ALLOWED_FILE_TYPES: string[];
  PASSWORD_MIN_LENGTH: number;
  PASSWORD_REQUIREMENTS: {
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    special: boolean;
  };
  RATE_LIMIT: {
    requests: number;
    windowMs: number;
  };
  SESSION_TIMEOUT: number;
  MAX_LOGIN_ATTEMPTS: number;
  LOCKOUT_DURATION: number;
}

export const SECURITY_CONFIG: SecurityConfig = {
  MAX_CONTENT_LENGTH: 10000,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_API_PAYLOAD_SIZE: 1024 * 1024, // 1MB
  ALLOWED_HTML_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  ALLOWED_HTML_ATTRS: ['href', 'title', 'target'],
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/json'
  ],
  PASSWORD_MIN_LENGTH: 12,
  PASSWORD_REQUIREMENTS: {
    uppercase: true,
    lowercase: true,
    numbers: true,
    special: true
  },
  RATE_LIMIT: {
    requests: 100,
    windowMs: 15 * 60 * 1000 // 15 minutes
  },
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000 // 15 minutes
};

export class SecurityUtils {
  /**
   * Check if content contains dangerous patterns
   */
  static containsDangerousContent(content: string): boolean {
    const dangerousPatterns = [
      /<script/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /javascript:/i,
      /vbscript:/i,
      /data:/i,
      /on\w+\s*=/i
    ];

    return dangerousPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Generate secure random token
   */
  static generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
    
    return result;
  }

  /**
   * Validate input against schema
   */
  static validateInput(schema: { safeParse: (input: string) => { success: boolean; error?: { errors: Array<{ message: string }> } } }, input: string): { success: boolean; errors: string[] } {
    try {
      const result = schema.safeParse(input);
      return {
        success: result.success,
        errors: result.success ? [] : result.error?.errors?.map((e: { message: string }) => e.message) || []
      };
    } catch (error) {
      return {
        success: false,
        errors: ['Validation failed']
      };
    }
  }

  /**
   * Create rate limiter
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
        
        // Add current request
        validRequests.push(now);
        requests.set(identifier, validRequests);
        
        return true;
      }
    };
  }

  /**
   * Sanitize HTML content
   */
  static sanitizeHtml(content: string): string {
    // Basic HTML sanitization - in production, use DOMPurify
    return content
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/<object[^>]*>.*?<\/object>/gi, '')
      .replace(/<embed[^>]*>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  }

  /**
   * Hash password securely
   */
  static async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await this.hashPassword(password);
    return passwordHash === hash;
  }
}

// Validation schemas
export const email = {
  safeParse: (input: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      success: emailRegex.test(input),
      error: { errors: [{ message: 'Invalid email format' }] }
    };
  }
};

export const password = {
  safeParse: (input: string) => {
    const errors: string[] = [];
    
    if (input.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
      errors.push(`Password must be at least ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters`);
    }
    
    if (SECURITY_CONFIG.PASSWORD_REQUIREMENTS.uppercase && !/[A-Z]/.test(input)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (SECURITY_CONFIG.PASSWORD_REQUIREMENTS.lowercase && !/[a-z]/.test(input)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (SECURITY_CONFIG.PASSWORD_REQUIREMENTS.numbers && !/\d/.test(input)) {
      errors.push('Password must contain at least one number');
    }
    
    if (SECURITY_CONFIG.PASSWORD_REQUIREMENTS.special && !/[!@#$%^&*(),.?":{}|<>]/.test(input)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      success: errors.length === 0,
      error: { errors: errors.map(message => ({ message })) }
    };
  }
};
