// Security utilities for Project Glocal
import React from 'react';
import DOMPurify from 'dompurify';

interface SecurityConfig {
  enableXSSProtection: boolean;
  enableCSRFProtection: boolean;
  enableRateLimiting: boolean;
  maxContentLength: number;
  allowedFileTypes: string[];
  maxFileSize: number;
}

const defaultConfig: SecurityConfig = {
  enableXSSProtection: true,
  enableCSRFProtection: true,
  enableRateLimiting: true,
  maxContentLength: 10000, // 10KB
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxFileSize: 5 * 1024 * 1024, // 5MB
};

class SecurityManager {
  private config: SecurityConfig;
  private rateLimitMap: Map<string, { count: number; resetTime: number }> = new Map();
  private csrfToken: string | null = null;

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.generateCSRFToken();
  }

  // XSS Protection
  sanitizeHTML(html: string): string {
    if (!this.config.enableXSSProtection) return html;
    
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      ALLOW_DATA_ATTR: false,
    });
  }

  sanitizeText(text: string): string {
    return text
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // Input Validation
  validateInput(input: string, type: 'text' | 'email' | 'url' | 'number'): boolean {
    if (!input || input.length === 0) return false;
    if (input.length > this.config.maxContentLength) return false;

    switch (type) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
      case 'url':
        try {
          new URL(input);
          return true;
        } catch {
          return false;
        }
      case 'number':
        return !isNaN(Number(input));
      case 'text':
        return this.sanitizeText(input) === input;
      default:
        return false;
    }
  }

  // File Validation
  validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > this.config.maxFileSize) {
      return { valid: false, error: 'File size exceeds limit' };
    }

    if (!this.config.allowedFileTypes.includes(file.type)) {
      return { valid: false, error: 'File type not allowed' };
    }

    return { valid: true };
  }

  // Rate Limiting
  checkRateLimit(identifier: string, limit: number = 10, windowMs: number = 60000): boolean {
    if (!this.config.enableRateLimiting) return true;

    const now = Date.now();
    const record = this.rateLimitMap.get(identifier);

    if (!record || now > record.resetTime) {
      this.rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= limit) {
      return false;
    }

    record.count++;
    return true;
  }

  // CSRF Protection
  generateCSRFToken(): string {
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    this.csrfToken = token;
    return token;
  }

  validateCSRFToken(token: string): boolean {
    if (!this.config.enableCSRFProtection) return true;
    return this.csrfToken === token;
  }

  getCSRFToken(): string | null {
    return this.csrfToken;
  }

  // Content Security Policy
  generateCSPHeader(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');
  }

  // Password Strength Validation
  validatePasswordStrength(password: string): {
    score: number;
    feedback: string[];
    isStrong: boolean;
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length < 8) {
      feedback.push('Password should be at least 8 characters long');
    } else {
      score += 1;
    }

    if (!/[a-z]/.test(password)) {
      feedback.push('Password should contain lowercase letters');
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push('Password should contain uppercase letters');
    } else {
      score += 1;
    }

    if (!/[0-9]/.test(password)) {
      feedback.push('Password should contain numbers');
    } else {
      score += 1;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      feedback.push('Password should contain special characters');
    } else {
      score += 1;
    }

    return {
      score,
      feedback,
      isStrong: score >= 4,
    };
  }

  // SQL Injection Prevention
  sanitizeSQL(input: string): string {
    return input
      .replace(/['"]/g, '') // Remove quotes
      .replace(/;/g, '') // Remove semicolons
      .replace(/--/g, '') // Remove SQL comments
      .replace(/\/\*/g, '') // Remove block comments
      .replace(/\*\//g, '') // Remove block comments
      .trim();
  }

  // Secure Headers
  getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Content-Security-Policy': this.generateCSPHeader(),
    };
  }

  // Data Encryption (client-side)
  encryptData(data: string, key: string): string {
    // Note: This is a simple example. In production, use proper encryption libraries
    const encoded = btoa(data);
    return encoded;
  }

  decryptData(encryptedData: string, key: string): string {
    // Note: This is a simple example. In production, use proper encryption libraries
    try {
      return atob(encryptedData);
    } catch {
      return '';
    }
  }

  // Secure Random String Generation
  generateSecureRandom(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // URL Validation
  isValidURL(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  // Clear sensitive data
  clearSensitiveData(): void {
    this.rateLimitMap.clear();
    this.csrfToken = null;
  }
}

// Global security manager instance
export const securityManager = new SecurityManager();

// React hooks for security
export function useSecurity() {
  const sanitizeHTML = (html: string) => securityManager.sanitizeHTML(html);
  const sanitizeText = (text: string) => securityManager.sanitizeText(text);
  const validateInput = (input: string, type: 'text' | 'email' | 'url' | 'number') => 
    securityManager.validateInput(input, type);
  const validateFile = (file: File) => securityManager.validateFile(file);
  const checkRateLimit = (identifier: string, limit?: number, windowMs?: number) => 
    securityManager.checkRateLimit(identifier, limit, windowMs);

  return {
    sanitizeHTML,
    sanitizeText,
    validateInput,
    validateFile,
    checkRateLimit,
  };
}

// Security context for React components
export const SecurityContext = React.createContext<{
  securityManager: SecurityManager;
}>({
  securityManager,
});

// Security provider component
export function SecurityProvider({ children }: { children: React.ReactNode }) {
  return (
    <SecurityContext.Provider value={{ securityManager }}>
      {children}
    </SecurityContext.Provider>
  );
}

// Hook to use security context
export function useSecurityContext() {
  const context = React.useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within a SecurityProvider');
  }
  return context;
}

export default securityManager;
