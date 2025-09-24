/**
 * Input Sanitization Utilities
 * Comprehensive input validation and sanitization for security
 */

import { SecurityUtils, SECURITY_CONFIG } from '@/config/security';

export interface SanitizationResult {
  sanitized: string;
  isValid: boolean;
  warnings: string[];
  originalLength: number;
  sanitizedLength: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class InputSanitizer {
  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  static sanitizeHtml(content: string): SanitizationResult {
    const originalLength = content.length;
    const warnings: string[] = [];
    
    // Check for dangerous content before sanitization
    if (SecurityUtils.containsDangerousContent(content)) {
      warnings.push('Potentially dangerous content detected and removed');
    }
    
    // Sanitize the content using SecurityUtils
    const sanitized = SecurityUtils.sanitizeHtml(content);
    
    const sanitizedLength = sanitized.length;
    const isValid = sanitizedLength > 0 && sanitizedLength <= SECURITY_CONFIG.MAX_CONTENT_LENGTH;
    
    if (sanitizedLength === 0 && originalLength > 0) {
      warnings.push('All content was removed during sanitization');
    }
    
    if (sanitizedLength > SECURITY_CONFIG.MAX_CONTENT_LENGTH) {
      warnings.push('Content exceeds maximum length limit');
    }
    
    return {
      sanitized,
      isValid,
      warnings,
      originalLength,
      sanitizedLength
    };
  }

  /**
   * Sanitize plain text content
   */
  static sanitizeText(content: string): SanitizationResult {
    const originalLength = content.length;
    const warnings: string[] = [];
    
    // Check for content length first
    if (originalLength > SECURITY_CONFIG.MAX_CONTENT_LENGTH) {
      warnings.push('Content exceeds maximum length limit');
    }
    
    // Remove HTML tags and dangerous characters
    const sanitized = content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>]/g, '') // Remove remaining angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/vbscript:/gi, '') // Remove vbscript: protocols
      .replace(/data:/gi, '') // Remove data: protocols
      .trim();
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /javascript:/i,
      /vbscript:/i,
      /on\w+\s*=/i
    ];
    
    suspiciousPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        warnings.push('Suspicious content detected and removed');
      }
    });
    
    const sanitizedLength = sanitized.length;
    const isValid = sanitizedLength > 0 && sanitizedLength <= SECURITY_CONFIG.MAX_CONTENT_LENGTH;
    
    return {
      sanitized,
      isValid,
      warnings,
      originalLength,
      sanitizedLength
    };
  }

  /**
   * Sanitize user input for database storage
   */
  static sanitizeForDatabase(content: string): SanitizationResult {
    const originalLength = content.length;
    const warnings: string[] = [];
    
    // Check for SQL injection patterns first
    const sqlPatterns = [
      /union\s+select/i,
      /drop\s+table/i,
      /delete\s+from/i,
      /insert\s+into/i,
      /update\s+set/i,
      /alter\s+table/i
    ];
    
    sqlPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        warnings.push('Potential SQL injection pattern detected');
      }
    });
    
    // Remove or escape dangerous characters for SQL
    const sanitized = content
      .replace(/['"]/g, '') // Remove quotes
      .replace(/[;]/g, '') // Remove semicolons
      .replace(/--/g, '') // Remove SQL comments
      .replace(/\/\*/g, '') // Remove SQL block comments
      .replace(/\*\//g, '') // Remove SQL block comments
      .replace(/drop\s+table/gi, '') // Remove DROP TABLE specifically
      .replace(/union\s+select/gi, '') // Remove UNION SELECT
      .replace(/delete\s+from/gi, '') // Remove DELETE FROM
      .replace(/insert\s+into/gi, '') // Remove INSERT INTO
      .replace(/update\s+set/gi, '') // Remove UPDATE SET
      .replace(/alter\s+table/gi, '') // Remove ALTER TABLE
      .trim();
    
    const sanitizedLength = sanitized.length;
    const isValid = sanitizedLength > 0 && sanitizedLength <= SECURITY_CONFIG.MAX_CONTENT_LENGTH;
    
    return {
      sanitized,
      isValid,
      warnings,
      originalLength,
      sanitizedLength
    };
  }

  /**
   * Validate and sanitize email address
   */
  static sanitizeEmail(email: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }
    
    // Check for suspicious patterns
    if (email.includes('<') || email.includes('>')) {
      errors.push('Email contains invalid characters');
    }
    
    if (email.length > 254) {
      errors.push('Email address too long');
    }
    
    // Check for common email injection patterns
    const injectionPatterns = [
      /javascript:/i,
      /vbscript:/i,
      /data:/i,
      /<script/i
    ];
    
    injectionPatterns.forEach(pattern => {
      if (pattern.test(email)) {
        errors.push('Email contains potentially malicious content');
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate and sanitize username
   */
  static sanitizeUsername(username: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check length
    if (username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }
    
    if (username.length > 30) {
      errors.push('Username must be less than 30 characters');
    }
    
    // Check for valid characters only
    const validCharsRegex = /^[a-zA-Z0-9_-]+$/;
    if (!validCharsRegex.test(username)) {
      errors.push('Username can only contain letters, numbers, underscores, and hyphens');
    }
    
    // Check for reserved usernames
    const reservedUsernames = ['admin', 'administrator', 'root', 'system', 'api', 'www', 'mail', 'ftp'];
    if (reservedUsernames.includes(username.toLowerCase())) {
      errors.push('Username is reserved and cannot be used');
    }
    
    // Check for suspicious patterns
    if (username.includes('..') || username.includes('//')) {
      warnings.push('Username contains suspicious patterns');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate and sanitize file upload
   */
  static sanitizeFile(file: File): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check file size
    if (file.size > SECURITY_CONFIG.MAX_FILE_SIZE) {
      errors.push(`File size exceeds maximum limit of ${SECURITY_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }
    
    // Check file type
    if (!SECURITY_CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`);
    }
    
    // Check file name for suspicious patterns
    const suspiciousPatterns = [
      /\.exe$/i,
      /\.bat$/i,
      /\.cmd$/i,
      /\.scr$/i,
      /\.pif$/i,
      /\.com$/i,
      /\.js$/i,
      /\.vbs$/i
    ];
    
    suspiciousPatterns.forEach(pattern => {
      if (pattern.test(file.name)) {
        errors.push('File type is not allowed for security reasons');
      }
    });
    
    // Check for double extensions
    if (file.name.includes('..')) {
      errors.push('File name contains suspicious patterns');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Sanitize URL to prevent open redirects
   */
  static sanitizeUrl(url: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      const urlObj = new URL(url);
      
      // Check for allowed protocols
      const allowedProtocols = ['http:', 'https:'];
      if (!allowedProtocols.includes(urlObj.protocol)) {
        errors.push('Only HTTP and HTTPS protocols are allowed');
      }
      
      // Check for localhost or internal IPs
      if (urlObj.hostname === 'localhost' || 
          urlObj.hostname === '127.0.0.1' || 
          urlObj.hostname.startsWith('192.168.') ||
          urlObj.hostname.startsWith('10.') ||
          urlObj.hostname.startsWith('172.')) {
        warnings.push('URL points to internal network');
      }
      
      // Check for suspicious patterns in path
      if (urlObj.pathname.includes('..') || urlObj.pathname.includes('//')) {
        errors.push('URL contains suspicious patterns');
      }
      
    } catch (error) {
      errors.push('Invalid URL format');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Comprehensive input sanitization for any content type
   */
  static sanitizeInput(content: string, type: 'html' | 'text' | 'database' = 'text'): SanitizationResult {
    switch (type) {
      case 'html':
        return this.sanitizeHtml(content);
      case 'database':
        return this.sanitizeForDatabase(content);
      default:
        return this.sanitizeText(content);
    }
  }

  /**
   * Validate multiple inputs at once
   */
  static validateInputs(inputs: Record<string, { value: string; type: 'email' | 'username' | 'text' | 'html' | 'url' }>): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {};
    
    for (const [key, input] of Object.entries(inputs)) {
      switch (input.type) {
        case 'email':
          results[key] = this.sanitizeEmail(input.value);
          break;
        case 'username':
          results[key] = this.sanitizeUsername(input.value);
          break;
        case 'url':
          results[key] = this.sanitizeUrl(input.value);
          break;
        case 'html': {
          const htmlResult = this.sanitizeHtml(input.value);
          results[key] = {
            isValid: htmlResult.isValid,
            errors: htmlResult.warnings,
            warnings: []
          };
          break;
        }
        default: {
          const textResult = this.sanitizeText(input.value);
          results[key] = {
            isValid: textResult.isValid,
            errors: textResult.warnings,
            warnings: []
          };
          break;
        }
      }
    }
    
    return results;
  }
}
